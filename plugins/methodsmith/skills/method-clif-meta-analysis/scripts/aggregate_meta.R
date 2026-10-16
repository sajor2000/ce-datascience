#!/usr/bin/env Rscript
# Aggregate-only REML meta-analysis template.
#
# Usage:
# Rscript aggregate_meta.R --input aggregate.json --validator aggregate_meta.py --output result.json
#
# The Python validator is the contract boundary. It rejects patient-data-shaped
# input, unknown or unreviewed dependence, incompatible effects, invalid
# standard errors, duplicates, and silently dropped rows before R reads a
# verified aggregate TSV. This template does not compute custom REML, a
# prediction interval, or an Egger test.

parse_args <- function(args) {
  values <- list()
  index <- 1
  while (index <= length(args)) {
    key <- args[[index]]
    if (!startsWith(key, "--")) stop(sprintf("unexpected argument: %s", key), call. = FALSE)
    name <- sub("^--", "", key)
    if (!name %in% c("input", "validator", "output", "validated-dir", "validate-only")) {
      stop(sprintf("unsupported option: %s", key), call. = FALSE)
    }
    if (name == "validate-only") {
      values[[name]] <- TRUE
      index <- index + 1
    } else {
      if (index == length(args)) stop(sprintf("%s needs a value", key), call. = FALSE)
      values[[name]] <- args[[index + 1]]
      index <- index + 2
    }
  }
  values
}

json_number <- function(value) {
  if (!is.finite(value)) stop("model returned a non-finite value", call. = FALSE)
  format(value, digits = 17, scientific = FALSE, trim = TRUE)
}

json_array <- function(values) {
  paste0("[", paste(values, collapse = ", "), "]")
}

same_path <- function(left, right) {
  normalizePath(left, mustWork = FALSE) == normalizePath(right, mustWork = FALSE)
}

read_validated_data <- function(path) {
  utils::read.delim(path, stringsAsFactors = FALSE, check.names = FALSE,
                   colClasses = c("character", "character", "character", "numeric", "numeric"),
                   na.strings = character())
}

write_output <- function(path, fit, data, validated_tsv, validated_manifest) {
  package_version <- as.character(utils::packageVersion("metafor"))
  variances <- data$standard_error ^ 2
  raw_weights <- 1 / (variances + fit$tau2)
  relative_weights <- raw_weights / sum(raw_weights)
  hksj_scale <- sum(raw_weights * (data$effect - as.numeric(fit$b[1])) ^ 2) / (fit$k - 1)
  if (any(!is.finite(relative_weights)) || !is.finite(hksj_scale)) {
    stop("model diagnostics are non-finite", call. = FALSE)
  }
  warnings <- character()
  if (fit$k <= 4L) warnings <- c(warnings, "k <= 4: HKSJ/t inference and heterogeneity estimates are especially unstable.")
  if (hksj_scale == 0) warnings <- c(warnings, "HKSJ estimated scale is zero; inspect identical effects or degenerate sampling variances.")
  manifest_lines <- readLines(validated_manifest, warn = FALSE, encoding = "UTF-8")
  if (length(manifest_lines) < 3L || manifest_lines[[1]] != "{" || tail(manifest_lines, 1) != "}") {
    stop("validated manifest is malformed", call. = FALSE)
  }
  provenance_lines <- manifest_lines[2:(length(manifest_lines) - 1)]
  provenance_lines[[length(provenance_lines)]] <- paste0(provenance_lines[[length(provenance_lines)]], ",")
  weight_values <- vapply(
    seq_len(nrow(data)),
    function(index) sprintf(
      '{"analysis_unit_id":"%s","relative_weight":%s}',
      data$analysis_unit_id[[index]],
      json_number(relative_weights[[index]])
    ),
    character(1)
  )
  lines <- c(
    "{",
    provenance_lines,
    '  "result": {',
    '    "method": "random_effects_REML",',
    sprintf('    "tau2_estimator": "REML (metafor %s)",', package_version),
    '    "interval_method": "Knapp-Hartung (metafor test=knha)",',
    sprintf('    "pooled_effect": %s,', json_number(as.numeric(fit$b[1]))),
    sprintf('    "standard_error": %s,', json_number(fit$se)),
    sprintf('    "confidence_interval_95": [%s, %s],', json_number(fit$ci.lb), json_number(fit$ci.ub)),
    sprintf('    "tau2": %s,', json_number(fit$tau2)),
    sprintf('    "hksj_scale": %s,', json_number(hksj_scale)),
    sprintf('    "k_usable": %d,', fit$k),
    '    "diagnostics": {',
    sprintf('      "q": %s,', json_number(fit$QE)),
    sprintf('      "degrees_freedom": %d,', fit$k - 1L),
    sprintf('      "i2_percent": %s,', json_number(max(0, fit$I2))),
    sprintf('      "weights": %s', json_array(weight_values)),
    '    },',
    sprintf('    "warnings": %s', json_array(sprintf('"%s"', warnings))),
    '  },',
    sprintf('  "validated_units_md5": "%s",', unname(tools::md5sum(validated_tsv))),
    '  "limitations": ["Requires the Python aggregate contract validation boundary", "No prediction interval, Egger test, influence diagnostics, forest plot, dependent-effect model, or patient-level input is implemented"]',
    "}"
  )
  staged_output <- tempfile(pattern = "aggregate-meta-result-", tmpdir = dirname(path))
  on.exit(unlink(staged_output), add = TRUE)
  writeLines(lines, staged_output, useBytes = TRUE)
  if (!file.link(staged_output, path)) {
    stop("cannot publish a new result path; existing destinations are never overwritten", call. = FALSE)
  }
}

main <- function() {
  args <- parse_args(commandArgs(trailingOnly = TRUE))
  if (is.null(args$input) || is.null(args$validator)) {
    stop("--input and --validator are required", call. = FALSE)
  }
  if (is.null(args$`validate-only`) && is.null(args$output)) {
    stop("--output is required unless --validate-only is used", call. = FALSE)
  }
  if (!file.exists(args$input)) stop(sprintf("input not found: %s", args$input), call. = FALSE)
  if (!file.exists(args$validator)) stop(sprintf("validator not found: %s", args$validator), call. = FALSE)
  if (!is.null(args$output) && same_path(args$input, args$output)) {
    stop("output path resolves to the input path; source input will not be overwritten", call. = FALSE)
  }

  python <- Sys.which("python3")
  if (!nzchar(python)) python <- Sys.which("python")
  if (!nzchar(python)) stop("Python 3 is required for the aggregate contract validator", call. = FALSE)

  if (!is.null(args$`validated-dir`)) {
    if (!dir.exists(args$`validated-dir`)) {
      stop(sprintf("validated temporary directory not found: %s", args$`validated-dir`), call. = FALSE)
    }
    validated_tsv <- tempfile(pattern = "aggregate-meta-validated-", tmpdir = args$`validated-dir`, fileext = ".tsv")
    validated_manifest <- tempfile(pattern = "aggregate-meta-manifest-", tmpdir = args$`validated-dir`, fileext = ".json")
  } else {
    validated_tsv <- tempfile(pattern = "aggregate-meta-validated-", fileext = ".tsv")
    validated_manifest <- tempfile(pattern = "aggregate-meta-manifest-", fileext = ".json")
  }
  if (!is.null(args$output) && (same_path(args$output, validated_tsv) || same_path(args$output, validated_manifest))) {
    stop("output path resolves to a validated temporary artifact", call. = FALSE)
  }
  on.exit(unlink(c(validated_tsv, validated_manifest), force = TRUE), add = TRUE)
  validator_status <- system2(
    python,
    args = c(
      shQuote(args$validator),
      "--input", shQuote(args$input),
      "--validate-only",
      if (!is.null(args$output)) c("--output", shQuote(args$output)),
      "--validated-tsv", shQuote(validated_tsv),
      "--validated-manifest", shQuote(validated_manifest)
    )
  )
  if (validator_status != 0 || !file.exists(validated_tsv) || !file.exists(validated_manifest)) {
    stop("aggregate contract validation failed; metafor was not run", call. = FALSE)
  }
  if (!is.null(args$`validate-only`)) {
    cat("validated aggregate input through Python contract boundary\n")
    return(invisible(NULL))
  }

  if (!requireNamespace("metafor", quietly = TRUE)) {
    stop("R package 'metafor' is not installed; no package was installed by this template", call. = FALSE)
  }
  data <- read_validated_data(validated_tsv)
  if (nrow(data) < 2L) stop("validated artifact has fewer than two usable units", call. = FALSE)
  fit <- metafor::rma(
    yi = data$effect,
    sei = data$standard_error,
    slab = data$analysis_unit_id,
    method = "REML",
    test = "knha"
  )
  write_output(args$output, fit, data, validated_tsv, validated_manifest)
}

tryCatch(
  main(),
  error = function(error) {
    cat(sprintf("aggregate_meta.R: %s\n", conditionMessage(error)), file = stderr())
    quit(status = 2)
  }
)

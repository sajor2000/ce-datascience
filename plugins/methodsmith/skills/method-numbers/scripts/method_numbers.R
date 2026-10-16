# Numbers locked to raw data: the R helpers for the registry method_numbers.py checks.
#
#   source("analysis/numbers/method_numbers.R")
#   register_number("primary.hr", 0.781, kind = "estimate", ci = c(0.664, 0.918),
#                   sources = "data/analytic.parquet", sap_output = "T2")
#   register_table("table1", list(female.overall = list(value = 212, kind = "count", denominator = 412)),
#                  sources = "data/analytic.parquet", sap_output = "T1")
#
# Each entry records the value, its journal-style text, the source files and their
# SHA-256, the producing script with its SHA-256 and git commit, the SAP output ID,
# and a timestamp. Aggregates only: counts from 1 to 10 are stored suppressed,
# without their value. R plus jsonlite; SHA-256 uses tools::sha256sum on R 4.5+
# or the platform sha256sum/shasum utility on older R.

method_numbers_registry <- file.path("analysis", "numbers", "registry.json")
method_numbers_kinds <- c("count", "n", "percent", "estimate", "ci", "p")
method_numbers_styles <- c("jama", "generic-biomedical")
method_numbers_small_cell <- 11
.ce_pending <- new.env(parent = emptyenv())

.ce_git <- function(...) {
  out <- suppressWarnings(tryCatch(system2("git", c(...), stdout = TRUE, stderr = FALSE),
                                   error = function(e) character()))
  if (length(out) == 1 && is.null(attr(out, "status"))) out else NULL
}

.ce_root <- function() {
  root <- .ce_git("rev-parse", "--show-toplevel")
  normalizePath(if (is.null(root)) getwd() else root, mustWork = TRUE)
}

.ce_rel <- function(root, path) {
  full <- normalizePath(if (startsWith(path, "/")) path else file.path(root, path), mustWork = TRUE)
  sub(paste0("^", gsub("([.|()\\^{}+$*?\\[\\]\\\\])", "\\\\\\1", root), "/"), "", full)
}

# Whether the script is tracked and matches HEAD, so its commit names the code that ran.
.ce_committed <- function(root, rel) {
  ok <- function(...) identical(suppressWarnings(system2("git", c("-C", root, ...), stdout = FALSE, stderr = FALSE)), 0L)
  ok("ls-files", "--error-unmatch", "--", rel) && ok("diff", "--quiet", "HEAD", "--", rel)
}

.ce_sha256 <- function(path) {
  if ("sha256sum" %in% getNamespaceExports("tools"))
    return(unname(as.character(tools::sha256sum(path))))
  # Older R installations can use the platform's SHA-256 utility without another R package.
  command <- if (nzchar(Sys.which("sha256sum"))) "sha256sum" else "shasum"
  args <- if (command == "shasum") c("-a", "256", shQuote(path)) else shQuote(path)
  out <- suppressWarnings(system2(command, args, stdout = TRUE, stderr = FALSE))
  if (!is.null(attr(out, "status")) || length(out) != 1 || !grepl("^[a-fA-F0-9]{64}", out))
    stop("SHA-256 hashing unavailable")
  tolower(substr(out, 1, 64))
}

.ce_calling_script <- function() {
  arg <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
  if (length(arg)) sub("^--file=", "", arg[[1]]) else NULL
}

.ce_fmt <- function(value, digits) sprintf(paste0("%.", digits, "f"), value)

.ce_p <- function(value, style) {
  jama <- style == "jama"
  label <- if (jama) "P" else "p"
  if (value < 0.001) return(paste(label, "<", if (jama) ".001" else "0.001"))
  if (jama && value > 0.99) return(paste(label, "> .99"))
  text <- .ce_fmt(value, if (value < 0.01) 3 else 2)
  paste(label, "=", if (jama) sub("^0", "", text) else text)
}

format_number <- function(value, kind, ci = NULL, digits = 2, denominator = NULL, style = "jama", sd = NULL, iqr = NULL) {
  if (!style %in% method_numbers_styles) stop("unknown style profile; expected one of ", paste(method_numbers_styles, collapse = ", "))
  if (kind == "p") return(.ce_p(value, style))
  if (kind %in% c("count", "n")) {
    text <- formatC(value, format = "d", big.mark = ",")
    if (!is.null(denominator) && denominator) text <- paste0(text, " (", .ce_fmt(100 * value / denominator, 1), "%)")
    return(text)
  }
  if (kind == "percent") return(paste0(.ce_fmt(value, digits), "%"))
  interval <- if (is.null(ci)) NULL else
    paste0(.ce_fmt(ci[[1]], digits), if (min(ci) < 0) " to " else "-", .ce_fmt(ci[[2]], digits))
  if (kind == "ci") {
    if (is.null(interval)) stop("kind 'ci' needs ci = c(lower, upper)")
    return(interval)
  }
  text <- .ce_fmt(value, digits)
  if (!is.null(interval)) return(paste0(text, " (95% CI, ", interval, ")"))
  if (!is.null(sd)) return(paste0(text, " (", .ce_fmt(sd, digits), ")"))
  if (!is.null(iqr)) return(paste0(text, " (", .ce_fmt(iqr[[1]], digits), "-", .ce_fmt(iqr[[2]], digits), ")"))
  text
}

.ce_finite <- function(x) is.numeric(x) && length(x) == 1 && is.finite(x)

.ce_entry <- function(root, script, id, value, kind, ci = NULL, digits = 2, denominator = NULL, style = "jama",
                      sources = character(), sap_output = NULL, table = NULL, sd = NULL, iqr = NULL, disclosure_floor = 11) {
  if (!kind %in% method_numbers_kinds) stop("unknown kind; expected one of ", paste(method_numbers_kinds, collapse = ", "))
  if (!all(vapply(c(list(value), as.list(ci), as.list(iqr), as.list(sd)), .ce_finite, logical(1))))
    stop(id, ": the registry holds finite numeric aggregates only")
  if (!.ce_finite(disclosure_floor) || disclosure_floor != floor(disclosure_floor)) stop("invalid disclosure floor")
  minimum <- max(method_numbers_small_cell, disclosure_floor)
  count <- kind %in% c("count", "n")
  if (count && (value < 0 || value != floor(value))) stop("counts must be nonnegative integers")
  if (!is.null(denominator) && (!.ce_finite(denominator) || denominator <= 0 || denominator != floor(denominator)))
    stop("denominator must be a positive integer")
  if (count && !is.null(denominator) && value > denominator) stop("count exceeds denominator")
  if ((kind == "p" && (value < 0 || value > 1)) || (kind == "percent" && (value < 0 || value > 100)))
    stop("invalid probability or percentage")
  if (kind == "percent" && is.null(denominator)) stop("percent requires its supporting denominator")
  supporting <- if (count) value else if (kind == "percent") value * denominator / 100 else NULL
  suppressed <- !is.null(supporting) && ((supporting > 0 && supporting < minimum) ||
    (!is.null(denominator) && denominator - supporting > 0 && denominator - supporting < minimum))
  marker <- if (count && value < minimum) paste0("<", minimum) else "Suppressed"
  entry <- list(
    id = id,
    value = if (suppressed) NULL else value,
    kind = kind,
    text = if (suppressed) marker else format_number(value, kind, ci, digits, denominator, style, sd, iqr),
    suppressed = suppressed,
    disclosure_floor = minimum,
    format = if (suppressed) NULL else list(ci = ci, digits = digits, denominator = denominator,
                                          style = style, sd = sd, iqr = iqr),
    sources = lapply(sources, function(s) list(path = .ce_rel(root, s), sha256 = .ce_sha256(file.path(root, s)))),
    script = if (is.null(script)) NULL else
      list(path = .ce_rel(root, script), sha256 = .ce_sha256(script), commit = .ce_git("-C", root, "rev-parse", "HEAD"),
           committed = .ce_committed(root, .ce_rel(root, script))),
    sap_output = sap_output,
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%S+00:00", tz = "UTC")
  )
  if (!is.null(table)) entry$table <- table
  entry
}

.ce_suppress_related <- function(entries) {
  candidates <- Filter(function(e) e$kind %in% c("count", "n", "percent"), entries)
  hidden <- character()
  for (left in candidates) for (right in candidates) {
    related <- (!is.null(left$table) && identical(left$table, right$table)) ||
      (!is.null(left$sap_output) && identical(left$sap_output, right$sap_output) && identical(left$sources, right$sources))
    minimum <- max(11, left$disclosure_floor, right$disclosure_floor)
    close <- left$kind %in% c("count", "n") && right$kind %in% c("count", "n") &&
      !is.null(left$value) && !is.null(right$value) && abs(left$value - right$value) > 0 && abs(left$value - right$value) < minimum
    if (left$id != right$id && related && (left$suppressed || right$suppressed || close))
      hidden <- c(hidden, left$id, right$id)
  }
  for (id in unique(hidden)) {
    # Keep JSON null fields: assigning NULL with $ would remove the keys.
    entries[[id]]["value"] <- list(NULL)
    entries[[id]]$text <- "Suppressed"
    entries[[id]]$suppressed <- TRUE
    entries[[id]]["format"] <- list(NULL)
  }
  entries
}

.ce_write <- function(root, registry, entries, update = FALSE) {
  path <- file.path(root, registry)
  data <- if (file.exists(path)) jsonlite::read_json(path, simplifyVector = FALSE) else list(version = 1, entries = list())
  if (!length(data$entries)) data$entries <- structure(list(), names = character())
  pending <- .ce_pending[[path]]
  if (is.null(pending)) pending <- list()
  for (entry in entries) {
    old <- if (!is.null(pending[[entry$id]])) pending[[entry$id]] else data$entries[[entry$id]]
    if (!is.null(old) && !update) {
      current <- entry
      old$timestamp <- NULL
      current$timestamp <- NULL
      if (!isTRUE(all.equal(old, current, check.attributes = FALSE)))
        stop("conflicting registry ID; rerun intentionally with update=TRUE")
    }
    pending[[entry$id]] <- entry
  }
  .ce_pending[[path]] <- pending
  for (id in names(pending)) data$entries[[id]] <- pending[[id]]
  data$entries <- .ce_suppress_related(data$entries)
  data$entries <- data$entries[order(names(data$entries))]
  dir.create(dirname(path), recursive = TRUE, showWarnings = FALSE)
  tmp <- paste0(path, ".", Sys.getpid(), ".tmp")
  writeLines(jsonlite::toJSON(data, auto_unbox = TRUE, pretty = TRUE, null = "null", digits = NA), tmp)
  file.rename(tmp, path)
  invisible(NULL)
}

register_number <- function(id, value, kind, ci = NULL, digits = 2, denominator = NULL, style = "jama",
                            sources = character(), sap_output = NULL, script = NULL, registry = method_numbers_registry,
                            sd = NULL, iqr = NULL, disclosure_floor = 11, update = FALSE) {
  root <- .ce_root()
  if (is.null(script)) script <- .ce_calling_script()
  if (!is.null(script)) script <- normalizePath(script, mustWork = TRUE)
  entry <- .ce_entry(root, script, id, value, kind, ci, digits, denominator, style, sources, sap_output, sd = sd, iqr = iqr, disclosure_floor = disclosure_floor)
  .ce_write(root, registry, list(entry), update)
  invisible(entry)
}

register_table <- function(table_id, cells, style = "jama", sources = character(), sap_output = NULL,
                           script = NULL, registry = method_numbers_registry, disclosure_floor = 11, update = FALSE) {
  root <- .ce_root()
  if (is.null(script)) script <- .ce_calling_script()
  if (!is.null(script)) script <- normalizePath(script, mustWork = TRUE)
  entries <- lapply(names(cells), function(cell) {
    spec <- cells[[cell]]
    if (is.null(spec$style)) spec$style <- style
    do.call(.ce_entry, c(list(root = root, script = script, id = paste0(table_id, ".", cell)), spec,
                         list(sources = sources, sap_output = sap_output, table = table_id, disclosure_floor = disclosure_floor)))
  })
  .ce_write(root, registry, entries, update)
  invisible(vapply(entries, function(e) e$id, character(1)))
}

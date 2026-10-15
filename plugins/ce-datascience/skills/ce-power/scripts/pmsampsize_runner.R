#!/usr/bin/env Rscript
# Riley et al. minimum sample size for prediction-model development: three
# criteria for binary/time-to-event outcomes, four for continuous outcomes.
#
# Why pmsampsize (Riley et al. BMJ 2020): the EPV >= 10 rule is too lenient for
# most clinical prediction models. Binary and time-to-event models use three
# criteria (Stat Med 2019;38:1276-96, PMID 30357870): global shrinkage >= 0.9,
# optimism in Nagelkerke R^2 <= 0.05, and precise overall risk or rate.
# Continuous models use four (Stat Med 2019;38:1262-75, PMID 30347470): the
# same two overfitting criteria plus precise residual SD and precise mean
# (intercept). The pmsampsize R package implements both.
#
# Binary and time-to-event outcomes take the Cox-Snell R^2 (--csrsquared), or
# Nagelkerke's R^2 (--nagrsquared), or for binary only the C-statistic
# (--cstatistic). Current pmsampsize reserves rsquared for continuous outcomes;
# --rsquared is still accepted here as an alias for --csrsquared on b/s.
#
# Usage (binary outcome example):
#   Rscript pmsampsize_runner.R --type b --csrsquared 0.15 --parameters 30 \
#     --prevalence 0.18 --shrinkage 0.9 \
#     --out analysis/power/prediction-model-sample-size.md
#   Rscript pmsampsize_runner.R --type b --cstatistic 0.80 --parameters 30 \
#     --prevalence 0.18 --seed 20261010
#
# Usage (time-to-event):
#   Rscript pmsampsize_runner.R --type s --csrsquared 0.10 --parameters 25 \
#     --rate 0.06 --timepoint 5 --meanfup 4.5
#
# Usage (continuous):
#   Rscript pmsampsize_runner.R --type c --rsquared 0.40 --parameters 20 \
#     --intercept 0 --sd 1
#
# Riley, R.D., Ensor, J., Snell, K.I.E. et al. Calculating the sample size required
# for developing a clinical prediction model. BMJ 368:m441 (2020).

if (!requireNamespace("pmsampsize", quietly = TRUE)) {
  cat("pmsampsize_runner.R: R package 'pmsampsize' is not installed; run install.packages('pmsampsize') and re-run\n",
      file = stderr())
  quit(status = 1)
}
suppressPackageStartupMessages(library(pmsampsize))

`%||%` <- function(x, y) if (is.null(x)) y else x  # base R only gained %||% in 4.4

parse_args <- function(args) {
  out <- list()
  i <- 1
  while (i <= length(args)) {
    key <- sub("^--", "", args[i])
    out[[key]] <- args[i + 1]
    i <- i + 2
  }
  out
}

a <- parse_args(commandArgs(trailingOnly = TRUE))

need <- function(...) {
  keys <- c(...)
  absent <- keys[vapply(keys, function(k) is.null(a[[k]]), logical(1))]
  if (length(absent) > 0) {
    cat(sprintf("pmsampsize_runner.R: --type %s requires %s (missing: %s); see the usage block at the top of the script\n",
                a$type %||% "<unset>", paste0("--", keys, collapse = " "),
                paste0("--", absent, collapse = " ")), file = stderr())
    quit(status = 2)
  }
}
need("type", "parameters")

shrinkage <- as.numeric(a$shrinkage %||% 0.9)
params    <- as.integer(a$parameters)

# Model-fit input for binary/survival: exactly one of Cox-Snell R^2, Nagelkerke R^2,
# or (binary only) the C-statistic. --rsquared is an alias for --csrsquared here.
fit_args <- function(type) {
  cs <- a$csrsquared %||% a$rsquared
  given <- Filter(Negate(is.null), list(csrsquared = cs, nagrsquared = a$nagrsquared, cstatistic = a$cstatistic))
  if (type == "s") given$cstatistic <- NULL
  if (length(given) != 1) {
    stop("type ", type, " needs exactly one of --csrsquared, --nagrsquared",
         if (type == "b") ", --cstatistic" else "", " (got ", length(given), ")")
  }
  out <- lapply(given, as.numeric)
  if (!is.null(out$cstatistic) && !is.null(a$seed)) out$seed <- as.integer(a$seed)
  out
}

if (a$type == "b") {
  need("prevalence")
  fit <- fit_args("b")
  res <- do.call(pmsampsize::pmsampsize, c(
    list(type = "b", parameters = params, prevalence = as.numeric(a$prevalence), shrinkage = shrinkage),
    fit
  ))
} else if (a$type == "s") {
  need("rate", "timepoint", "meanfup")
  fit <- fit_args("s")
  res <- do.call(pmsampsize::pmsampsize, c(
    list(type = "s", parameters = params,
         rate = as.numeric(a$rate),
         timepoint = as.numeric(a$timepoint),
         meanfup   = as.numeric(a$meanfup),
         shrinkage = shrinkage),
    fit
  ))
} else if (a$type == "c") {
  need("intercept", "sd", "rsquared")
  fit <- list(rsquared = as.numeric(a$rsquared))
  res <- pmsampsize::pmsampsize(
    type = "c", rsquared = fit$rsquared, parameters = params,
    intercept = as.numeric(a$intercept),
    sd = as.numeric(a$sd),
    shrinkage = shrinkage
  )
} else {
  stop(sprintf("unknown --type %s; valid: b (binary), s (survival), c (continuous)", a$type))
}

# Render a SAP-6-ready (Sample Size and Power) paragraph.
crit <- if (a$type == "c") {
  "four criteria (shrinkage >= target + optimism in R^2 <= 0.05 + precise residual SD + precise mean/intercept)"
} else {
  "three criteria (shrinkage >= target + optimism in Nagelkerke R^2 <= 0.05 + precise overall outcome risk/rate)"
}
md <- c(
  "# Sample size for prediction-model development",
  "",
  sprintf("Method: Riley et al. minimum sample size, %s", crit),
  sprintf("Tool:   pmsampsize R package %s", as.character(utils::packageVersion("pmsampsize"))),
  "",
  sprintf("Inputs: type=%s, %s=%.3f, candidate predictors=%d, shrinkage target=%.2f",
          a$type, names(fit)[1], fit[[1]], params, shrinkage),
  "",
  "## Result",
  "",
  capture.output(print(res)),
  "",
  "## Reference",
  "Riley, R.D. et al. Calculating the sample size required for developing a",
  "clinical prediction model. BMJ 368:m441 (2020). PMID 32188600.",
  if (a$type == "c") {
    "Riley, R.D. et al. Minimum sample size ... Part I - continuous outcomes. Stat Med 38:1262-75 (2019). PMID 30347470."
  } else {
    "Riley, R.D. et al. Minimum sample size ... Part II - binary and time-to-event outcomes. Stat Med 38:1276-96 (2019). PMID 30357870."
  }
)

# pmsampsize names the per-parameter ratio EPV (older), EPP (binary/survival,
# current), or SPP (continuous); fall back rather than silently dropping the line.
epv <- res$EPV %||% res$EPP %||% res$SPP
epv_txt <- if (is.null(epv) || !is.finite(epv)) "NA" else sprintf("%.1f", epv)

if (!is.null(a$out)) {
  dir.create(dirname(a$out), recursive = TRUE, showWarnings = FALSE)
  writeLines(md, a$out)
  cat(sprintf("__CE_POWER__ design=prediction-model total=%d n_per_arm=null epv=%s file=%s\n",
              as.integer(res$sample_size), epv_txt, a$out))
} else {
  cat(md, sep = "\n")
}

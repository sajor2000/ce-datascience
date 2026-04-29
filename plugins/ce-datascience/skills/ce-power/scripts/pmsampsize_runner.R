#!/usr/bin/env Rscript
# Riley 2018 four-criterion sample-size calculation for prediction-model development.
#
# Why pmsampsize (Riley et al. BMJ 2020): the EPV >= 10 rule is too lenient for
# most clinical prediction models. Riley's four-criterion framework (small
# overfitting via shrinkage >= 0.9; small optimism in R^2; precise outcome
# proportion / mean estimate; precise residual SD for continuous) is the current
# standard and is implemented in the pmsampsize R package.
#
# Usage (binary outcome example):
#   Rscript pmsampsize_runner.R --type b --rsquared 0.15 --parameters 30 \
#     --prevalence 0.18 --shrinkage 0.9 \
#     --out analysis/power/prediction-model-sample-size.md
#
# Usage (time-to-event):
#   Rscript pmsampsize_runner.R --type s --rsquared 0.10 --parameters 25 \
#     --rate 0.06 --timepoint 5 --meanfup 4.5
#
# Usage (continuous):
#   Rscript pmsampsize_runner.R --type c --rsquared 0.40 --parameters 20 \
#     --intercept 0 --sd 1
#
# Riley, R.D., Snell, K.I.E., Ensor, J. et al. Minimum sample size for developing
# a multivariable prediction model. BMJ 368:m441 (2020).

suppressPackageStartupMessages({
  if (!requireNamespace("pmsampsize", quietly = TRUE)) {
    stop("install pmsampsize: install.packages('pmsampsize')")
  }
  library(pmsampsize)
})

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
stopifnot(!is.null(a$type), !is.null(a$rsquared), !is.null(a$parameters))

shrinkage <- as.numeric(a$shrinkage %||% 0.9)
rsquared  <- as.numeric(a$rsquared)
params    <- as.integer(a$parameters)

if (a$type == "b") {
  stopifnot(!is.null(a$prevalence))
  res <- pmsampsize::pmsampsize(
    type = "b", rsquared = rsquared, parameters = params,
    prevalence = as.numeric(a$prevalence), shrinkage = shrinkage
  )
} else if (a$type == "s") {
  stopifnot(!is.null(a$rate), !is.null(a$timepoint), !is.null(a$meanfup))
  res <- pmsampsize::pmsampsize(
    type = "s", rsquared = rsquared, parameters = params,
    rate = as.numeric(a$rate),
    timepoint = as.numeric(a$timepoint),
    meanfup   = as.numeric(a$meanfup),
    shrinkage = shrinkage
  )
} else if (a$type == "c") {
  stopifnot(!is.null(a$intercept), !is.null(a$sd))
  res <- pmsampsize::pmsampsize(
    type = "c", rsquared = rsquared, parameters = params,
    intercept = as.numeric(a$intercept),
    sd = as.numeric(a$sd),
    shrinkage = shrinkage
  )
} else {
  stop(sprintf("unknown --type %s; valid: b (binary), s (survival), c (continuous)", a$type))
}

# Render a SAP-2.5-ready paragraph.
md <- c(
  "# Sample size for prediction-model development",
  "",
  "Method: Riley et al. 2020 four-criterion minimum sample size",
  "        (small overfitting + small optimism + precise outcome + precise residual)",
  "Tool:   pmsampsize R package",
  "",
  sprintf("Inputs: type=%s, R^2=%.2f, candidate predictors=%d, shrinkage target=%.2f",
          a$type, rsquared, params, shrinkage),
  "",
  "## Result",
  "",
  capture.output(print(res)),
  "",
  "## Reference",
  "Riley, R.D. et al. Minimum sample size for developing a multivariable",
  "prediction model. BMJ 368:m441 (2020).",
  "https://www.bmj.com/content/368/bmj.m441"
)

if (!is.null(a$out)) {
  dir.create(dirname(a$out), recursive = TRUE, showWarnings = FALSE)
  writeLines(md, a$out)
  cat(sprintf("__CE_POWER__ design=prediction-model total=%d n_per_arm=null epv=%.1f file=%s\n",
              res$sample_size, res$EPV, a$out))
} else {
  cat(md, sep = "\n")
}

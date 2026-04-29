#!/usr/bin/env Rscript
# Random-effects meta-analysis (REML) over the methods CSV from /ce-method-extract.
# Wraps `meta::metagen` with conventions appropriate for clinical effect-size pooling:
#   - Log-transform ratio metrics (HR / OR / RR), pool on log scale, exponentiate
#   - REML for tau^2 (less biased than DerSimonian-Laird for small k)
#   - Report point estimate + 95% CI + 95% prediction interval (PI is the bound a
#     NEW study's effect would fall in; better suited for /ce-power sweeps than CI)
#   - Forest plot saved as PNG
#
# Usage:
#   Rscript pool_effects.R \
#     --in analysis/pubmed/sepsis-bundle-methods.csv \
#     --metric HR \
#     --out analysis/effect-size/sepsis-bundle-pooled.md
#
# Input CSV must have at minimum: pmid, year, sample_size, effect (point),
# effect_lo, effect_hi, metric. Use scripts/parse_effect.py first if these
# columns are missing -- it parses the free-text effect_size_reported field.

suppressPackageStartupMessages({
  for (pkg in c("meta", "ggplot2")) {
    if (!requireNamespace(pkg, quietly = TRUE)) {
      stop(sprintf("install %s: install.packages('%s')", pkg, pkg))
    }
  }
  library(meta)
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
stopifnot(!is.null(a$`in`), !is.null(a$metric), !is.null(a$out))

dat <- read.csv(a$`in`, stringsAsFactors = FALSE)
dat <- subset(dat, metric == a$metric &
                   !is.na(effect) & !is.na(effect_lo) & !is.na(effect_hi) &
                   effect_lo > 0 & effect_hi > 0)

if (nrow(dat) < 3) {
  cat(sprintf("Only %d studies with metric=%s and complete CI; pooling not meaningful.\n",
              nrow(dat), a$metric))
  cat("Reporting narrative range instead.\n")
  pt_min <- min(dat$effect); pt_med <- median(dat$effect); pt_max <- max(dat$effect)
  best   <- dat[order(-dat$sample_size, -dat$year)[1], ]
  out_md <- c(
    sprintf("# Effect-size narrative (k = %d, %s)", nrow(dat), a$metric),
    sprintf("Range: %.2f to %.2f (median %.2f)", pt_min, pt_max, pt_med),
    sprintf("Anchor study: PMID %s, %s, N=%d, point=%.2f",
            best$pmid, best$year, best$sample_size, best$effect),
    "",
    "Pooling deferred -- fewer than 3 studies. Use the anchor or the range",
    "as the /ce-power input. Consider widening the search."
  )
  dir.create(dirname(a$out), recursive = TRUE, showWarnings = FALSE)
  writeLines(out_md, a$out)
  cat(sprintf("__CE_EFFECT_SIZE__ metric=%s n_studies=%d mode=narrative\n",
              a$metric, nrow(dat)))
  quit(status = 0)
}

# For ratio metrics: pool on log scale.
ratio_metric <- a$metric %in% c("HR", "OR", "RR", "aOR", "aHR", "aRR", "IRR", "SMR", "HRR")
if (ratio_metric) {
  dat$te    <- log(dat$effect)
  dat$se_te <- (log(dat$effect_hi) - log(dat$effect_lo)) / (2 * 1.96)
  sm        <- a$metric  # used by meta for axis labels
} else {
  dat$te    <- dat$effect
  dat$se_te <- (dat$effect_hi - dat$effect_lo) / (2 * 1.96)
  sm        <- a$metric  # MD or SMD
}

m <- meta::metagen(
  TE       = dat$te,
  seTE     = dat$se_te,
  studlab  = paste0(dat$first_author, " ", dat$year, " (PMID ", dat$pmid, ")"),
  sm       = sm,
  method.tau = "REML",
  prediction = TRUE
)

if (ratio_metric) {
  pooled <- exp(m$TE.random); ci_lo <- exp(m$lower.random); ci_hi <- exp(m$upper.random)
  pi_lo  <- exp(m$lower.predict); pi_hi <- exp(m$upper.predict)
} else {
  pooled <- m$TE.random; ci_lo <- m$lower.random; ci_hi <- m$upper.random
  pi_lo  <- m$lower.predict; pi_hi <- m$upper.predict
}

# Forest plot
fp_path <- sub("\\.md$", "-forest.png", a$out)
png(fp_path, width = 1200, height = 100 + 60 * nrow(dat), res = 150)
meta::forest(m, sortvar = dat$year, prediction = TRUE,
             leftcols = c("studlab"), rightcols = c("effect.ci"))
dev.off()

# Markdown summary
out_md <- c(
  sprintf("# Pooled effect-size: %s", a$metric),
  "",
  sprintf("Source: %s (k = %d studies after filtering)", a$`in`, nrow(dat)),
  sprintf("Method: random-effects meta-analysis, REML for tau^2, prediction interval reported"),
  "",
  sprintf("Pooled %s = %.2f (95%% CI %.2f-%.2f; 95%% PI %.2f-%.2f)",
          a$metric, pooled, ci_lo, ci_hi, pi_lo, pi_hi),
  sprintf("Heterogeneity: I^2 = %.0f%%, tau^2 = %.3f", m$I2 * 100, m$tau2),
  "",
  "## For /ce-power",
  "",
  sprintf("Anchor: %.2f", pooled),
  sprintf("Sensitivity-sweep bounds: %.2f to %.2f (95%% prediction interval)",
          pi_lo, pi_hi),
  "",
  sprintf("Forest plot: %s", fp_path)
)
dir.create(dirname(a$out), recursive = TRUE, showWarnings = FALSE)
writeLines(out_md, a$out)

cat(sprintf("__CE_EFFECT_SIZE__ metric=%s point=%.3f ci=%.3f,%.3f n_studies=%d i2=%.0f\n",
            a$metric, pooled, ci_lo, ci_hi, nrow(dat), m$I2 * 100))

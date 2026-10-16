#!/usr/bin/env Rscript
# Example engine-run.R for ce-trial-design: rpact, continuous endpoint, 1:1
# allocation. Copy to analysis/trial-design/<design-id>/engine-run.R and adapt.
# For binary or time-to-event endpoints swap in getSampleSizeRates/getPowerRates
# or getSampleSizeSurvival/getPowerSurvival and re-check each accessor against
# the rpact documentation for the pinned version (VERIFY lines below).
#
# Usage (from the project root):
#   Rscript analysis/trial-design/<id>/engine-run.R analysis/trial-design/<id> \
#     > analysis/trial-design/<id>/engine-run.log 2>&1

for (pkg in c("rpact", "jsonlite")) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop(sprintf("R package '%s' is not installed; install it with the user's approval", pkg))
  }
}

args <- commandArgs(trailingOnly = TRUE)
dir <- if (length(args) >= 1) args[1] else "."
spec_path <- file.path(dir, "design-spec.json")
results_path <- file.path(dir, "engine-results.csv")
spec <- jsonlite::fromJSON(spec_path, simplifyVector = FALSE)

expected_version <- spec$engine$version
observed_version <- as.character(utils::packageVersion("rpact"))
if (!identical(observed_version, expected_version)) {
  stop(sprintf("rpact version mismatch: expected %s, observed %s", expected_version, observed_version))
}
cat(R.version.string, "\n", "rpact ", observed_version, "\n", sep = "")
if (spec$design$allocation_ratio != 1) stop("this example assumes 1:1 allocation; adapt the rounding before use")

warnings_seen <- list()
record_warning <- function(w) {
  warnings_seen[[length(warnings_seen) + 1]] <<- list(code = "engine_warning", message = conditionMessage(w))
  message("Warning: ", conditionMessage(w))  # keep it in engine-run.log too
  invokeRestart("muffleWarning")
}

scenarios <- setNames(spec$scenarios, vapply(spec$scenarios, `[[`, "", "id"))
rows <- list()
for (cand in spec$candidates) {
  ea <- cand$parameters$engine_arguments
  sc <- scenarios[[cand$scenario_id]]
  # rpact 4.4.0 takes the direction on the design; getPowerMeans inherits it.
  direction_upper <- if (is.null(ea$directionUpper)) TRUE else isTRUE(ea$directionUpper)
  withCallingHandlers({
    design <- rpact::getDesignGroupSequential(
      kMax = ea$kMax, informationRates = unlist(ea$informationRates),
      typeOfDesign = ea$typeOfDesign, typeBetaSpending = ea$typeBetaSpending,
      bindingFutility = ea$bindingFutility, sided = ea$sided,
      alpha = ea$alpha, beta = ea$beta, directionUpper = direction_upper
    )
    if (!is.null(ea$maxNumberOfSubjects)) {
      # Robustness candidate: N fixed from another scenario, power evaluated here.
      n_max <- ea$maxNumberOfSubjects
    } else {
      # getSampleSizeMeans ignores directionUpper and needs alternative > null, so
      # size a lower-direction design on the mirrored alternative (same N).
      ss_alt <- if (direction_upper) sc$alternative else 2 * spec$endpoint$null - sc$alternative
      ss <- rpact::getSampleSizeMeans(design, alternative = ss_alt, stDev = sc$standard_deviation,
                                      allocationRatioPlanned = 1)
      # Integer subjects, rounded up to an even total for 1:1 allocation.
      n_max <- 2 * ceiling(ss$maxNumberOfSubjects / 2)
    }
    # Achieved power and E[N | alternative] at the rounded N.            VERIFY: $overallReject, $expectedNumberOfSubjects
    pow_alt <- rpact::getPowerMeans(design, alternative = sc$alternative, stDev = sc$standard_deviation,
                                    maxNumberOfSubjects = n_max, allocationRatioPlanned = 1)
    # E[N | null] with futility stopping applied as planned.
    pow_null <- rpact::getPowerMeans(design, alternative = spec$endpoint$null, stDev = sc$standard_deviation,
                                     maxNumberOfSubjects = n_max, allocationRatioPlanned = 1)
  }, warning = record_warning)
  # Type I error: alpha spent by the efficacy boundaries (VERIFY: $alphaSpent).
  # With non-binding futility the boundaries are computed ignoring futility, so this
  # is the regulatory type I error. Do NOT use pow_null$overallReject: it applies
  # the futility bound and understates alpha (0.0228 instead of 0.025 for asOF here).
  rows[[length(rows) + 1]] <- data.frame(
    scenario_id = cand$scenario_id, candidate_id = cand$id,
    engine = "rpact", engine_version = observed_version,
    analyses = design$kMax,
    # Full precision: feasibility and Pareto comparisons read these values;
    # round only when presenting them.
    achieved_power = pow_alt$overallReject,
    type1_error = design$alphaSpent[design$kMax],
    max_information = n_max,
    expected_information_null = pow_null$expectedNumberOfSubjects,
    expected_information_alt = pow_alt$expectedNumberOfSubjects,
    power_lower_bound = NA, type1_error_upper_bound = NA
  )
}

write.csv(do.call(rbind, rows), results_path, row.names = FALSE, quote = FALSE, na = "")
writeLines(capture.output(sessionInfo()), file.path(dir, "session-info.txt"))
provenance <- list(
  schema_version = 1, engine = "rpact", engine_version = observed_version,
  r_version = R.version.string, completed = TRUE,
  spec_md5 = unname(tools::md5sum(spec_path)), results_md5 = unname(tools::md5sum(results_path)),
  warnings = warnings_seen
)
writeLines(jsonlite::toJSON(provenance, auto_unbox = TRUE, pretty = TRUE),
           file.path(dir, "runtime-provenance.json"))
cat(sprintf("wrote %d rows to %s\n", length(rows), results_path))

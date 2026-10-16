# External-engine adapter guidance

## Contents

- rpact (functions, version assertion, accessor table)
- gsDesign (functions, version assertion, non-binding type I error)
- Adapter failure rules
- Runtime provenance contract

Use the current official documentation for the selected engine. Record the documentation URL and access date in the project-local engine script or README.

## rpact

Primary documented functions for this first release:

- `rpact::getDesignGroupSequential()` for the group-sequential design
- endpoint-specific sample-size, power, or simulation functions such as `getSampleSizeMeans()`, `getPowerMeans()`, `getSampleSizeRates()`, `getPowerRates()`, `getSampleSizeSurvival()`, `getPowerSurvival()`, or the corresponding documented simulation function
- documented object conversion/accessors such as `as.data.frame()`, `getPowerAndAverageSampleNumber()`, and endpoint-specific result fields

Official references:

- <https://docs.rpact.org/reference/getDesignGroupSequential.html>
- <https://docs.rpact.org/reference/index.html>

The script must assert the package version before calling the design function:

```r
expected_version <- "<pinned-version>"
observed_version <- as.character(utils::packageVersion("rpact"))
if (!identical(observed_version, expected_version)) {
  stop(sprintf("rpact version mismatch: expected %s, observed %s", expected_version, observed_version))
}
```

Map operating characteristics from the returned rpact object. Do not infer field meanings from column position or console formatting. Confirm each accessor against the official documentation for the pinned version. Accessors verified against rpact 4.4.0:

| Normalized column | rpact accessor |
|---|---|
| `type1_error` | `design$alphaSpent[design$kMax]` (the efficacy boundaries' total alpha; computed ignoring futility when `bindingFutility = FALSE`) |
| `achieved_power` | `getPower*(design, ..., maxNumberOfSubjects = <rounded N>)$overallReject` at the integer N actually planned, not the sample-size object's nominal power |
| `max_information` | `getSampleSize*()$maxNumberOfSubjects` (or `$maxNumberOfEvents`) rounded up to whole subjects for the allocation |
| `expected_information_alt` | `getPower*(...)$expectedNumberOfSubjects` at the alternative and the rounded N |
| `expected_information_null` | `getPower*(...)$expectedNumberOfSubjects` with the alternative set to the null value, at the rounded N |

Do not use `getPower*(..., alternative = <null>)$overallReject` as the type I error when futility is non-binding: it applies the futility bound and understates alpha (0.0228 instead of 0.025 for the example's O'Brien-Fleming-type design). `references/engine-run.example.R` implements this table for a continuous endpoint and generated `references/engine-results.example.csv`.

## gsDesign

Primary documented functions for this first release:

- `gsDesign::gsDesign()` for standard group-sequential derivation
- `gsDesign::gsSurv()` for supported time-to-event group-sequential designs
- `gsDesign::gsProbability()` or documented object probabilities for boundary crossing probabilities
- `gsDesign::gsBoundSummary()` for reviewable boundary summaries
- documented endpoint helpers such as `nNormal()`, `nBinomial()`, or `nEvents()` when appropriate

Official references:

- <https://keaven.github.io/gsDesign/reference/gsDesign.html>
- <https://keaven.github.io/gsDesign/reference/index.html>
- <https://keaven.github.io/gsd-tech-manual/>

The script must assert the package version before calling the design function:

```r
expected_version <- "<pinned-version>"
observed_version <- as.character(utils::packageVersion("gsDesign"))
if (!identical(observed_version, expected_version)) {
  stop(sprintf("gsDesign version mismatch: expected %s, observed %s", expected_version, observed_version))
}
```

Use documented crossing probabilities and expected sample-size/information output. Do not derive type I error from printed boundary values or relabel a fixed-design input as an achieved group-sequential operating characteristic.

Type I error under non-binding futility (`test.type = 4` or `6`) is computed IGNORING the futility bound (verified against gsDesign 3.11.0):

- `sum(gsProbability(k = x$k, theta = 0, n.I = x$n.I, a = rep(-20, x$k), b = x$upper$bound)$upper$prob)`; `sum(x$falseposnb)` gives the same value (the help page calls this field `falseprobnb`, but the 3.11.0 object stores `falseposnb`; `x$falseprobnb` is `NULL` and sums to 0, so check `names(x)` on the pinned version)
- do not use `sum(x$upper$prob[, 1])`, which includes the futility bound and understates alpha (0.0228 vs 0.025 for a 3-look Lan-DeMets O'Brien-Fleming design)
- expected sample size or events: `x$en` (one value per `x$theta`, null first); power at the planned N: `sum(x$upper$prob[, 2])` from the same object or `gsProbability()` at the rounded N

For binding futility (`test.type = 3` or `5`), the crossing probability with the futility bound applied is correct, and the SAP must state that futility is binding.

## Adapter failure rules

Stop rather than normalize when:

- the installed package version differs from the pin
- the selected function does not support the endpoint or decision rule
- a required value is missing, non-finite, or on an ambiguous scale
- information units differ across candidates
- the declared scenario was not run
- a simulation has failures that are omitted from the denominator
- Monte Carlo uncertainty prevents a clear threshold decision
- the design is not explicitly declared as a two-arm frequentist group-sequential design

Engine warnings belong in `engine-run.log`, the structured `warnings` array in runtime provenance, and the SAP handoff. Each warning has a non-empty `code` and `message`. Do not suppress warnings merely to produce a frontier.

## Runtime provenance contract

The same R process that reads `design-spec.json` and writes `engine-results.csv` must write `runtime-provenance.json` after the CSV is closed. Use schema version 1 with `engine`, `engine_version`, `r_version`, `completed: true`, `spec_md5`, `results_md5`, and structured `warnings`. Compute both digests with base R `tools::md5sum()` against the exact specification bytes used for the run and the exact normalized CSV after it is closed. The frontier builder checks both digests against captured input bytes before evaluating results.

```json
{
  "schema_version": 1,
  "engine": "rpact",
  "engine_version": "4.4.0",
  "r_version": "R version 4.x.y",
  "completed": true,
  "spec_md5": "32 lowercase hexadecimal characters",
  "results_md5": "32 lowercase hexadecimal characters",
  "warnings": []
}
```

MD5 here is only a same-run byte-identity check available in base R. The CE receipt separately records SHA-256 for every retained input.

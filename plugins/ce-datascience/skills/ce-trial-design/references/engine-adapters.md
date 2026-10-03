# External-engine adapter guidance

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

Map operating characteristics from the returned rpact object. Do not infer field meanings from column position or console formatting. Confirm each accessor against the official documentation for the pinned version.

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
  "engine_version": "4.3.0",
  "r_version": "R version 4.x.y",
  "completed": true,
  "spec_md5": "32 lowercase hexadecimal characters",
  "results_md5": "32 lowercase hexadecimal characters",
  "warnings": []
}
```

MD5 here is only a same-run byte-identity check available in base R. The CE receipt separately records SHA-256 for every retained input.

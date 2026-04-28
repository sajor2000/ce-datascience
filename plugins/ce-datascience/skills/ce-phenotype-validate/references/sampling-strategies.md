# Chart-Review Sampling for Phenotype Validation

How to sample patients for chart review so the resulting metrics are interpretable.

## Stratified random within algo strata (recommended for PPV / Spec)

- Sample N/2 patients from algo-positive, N/2 from algo-negative
- Estimates PPV and Specificity directly (the algo-positive sample IS the PPV denominator)
- Sensitivity and NPV require a population-prevalence weighted re-estimation, OR are not directly estimable from this design (acknowledge in the report)

When prevalence is rare (< 10%), this is the right design -- pure random would give too few cases.

## Pure random sample

- Sample N from the full cohort regardless of algo label
- Estimates ALL metrics directly (PPV, NPV, Sens, Spec) without weighting
- Inefficient when prevalence is low: N=200 with 5% prevalence yields ~10 cases; CI on Sens is enormous

## Two-stage with chart review of algo-discordant

- Sample stratified by algo + label-discrepancy hint (e.g., always sample patients with "almost a case" features)
- Useful for refining edge-case rules
- Harder to analyze; not recommended unless biostatistician helps

## Adjudication

- Two reviewers chart each patient independently → kappa for inter-rater reliability
- Disagreements → third reviewer or consensus
- Kappa < 0.70 → re-train reviewers on a subset before continuing

## Sample-size guidance

For PPV with 95% CI half-width = 0.05 around an expected PPV of 0.90:
- Required N (algo-positive) ≈ 138 (Wilson)

For Sensitivity with 95% CI half-width = 0.10 around an expected Sens of 0.85:
- Required N (chart-positive) ≈ 49

Most validation studies sample 100-300 total to be safe.

## Reporting (RECORD-extension expects)

State explicitly:
1. Sampling design (stratified, pure random, etc.)
2. N sampled and N adjudicated
3. Adjudicator count and kappa
4. Definition of the gold-standard label (e.g., "physician chart adjudication using criterion X")
5. Whether the validation is internal (same dataset) or external (separate dataset)
6. Whether the algorithm has been re-trained based on validation results (would need a second held-out validation set)

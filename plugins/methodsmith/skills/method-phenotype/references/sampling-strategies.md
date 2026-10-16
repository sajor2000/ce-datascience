# Chart-Review Sampling for Phenotype Validation

How to sample patients for chart review so the resulting metrics are interpretable.

## Stratified random within algo strata (recommended when prevalence is low)

- Sample n+ patients from algo-positive and n- from algo-negative, and record the cohort counts N+ and N- of each stratum (aggregate counts only).
- PPV = TP/(TP+FP) is estimated directly from the algo-positive stratum; NPV = TN/(TN+FN) is estimated directly from the algo-negative stratum.
- Sensitivity and specificity are NOT directly estimable: the naive TP/(TP+FN) and TN/(TN+FP) are biased by verification (work-up) bias whenever the sampling fractions n+/N+ and n-/N- differ (Begg & Greenes, Biometrics 1983, PMID 6871349). Weight each stratum by its inverse sampling fraction (w+ = N+/n+, w- = N-/n-), or equivalently, with pi = N+/(N+ + N-):
  - Se = PPV*pi / (PPV*pi + (1-NPV)*(1-pi)) = w+*TP / (w+*TP + w-*FN)
  - Sp = NPV*(1-pi) / (NPV*(1-pi) + (1-PPV)*pi) = w-*TN / (w-*TN + w+*FP)
- CIs for the weighted Se/Sp: delta method on the logit scale, treating PPV and NPV as independent binomials from the two strata (the weights cancel from the variance):
  - Var(logit Se) = 1/TP - 1/(TP+FP) + 1/FN - 1/(FN+TN)
  - Var(logit Sp) = 1/TN - 1/(TN+FN) + 1/FP - 1/(FP+TP)
  A stratified bootstrap (resample within each algo stratum) is an alternative. Never put a Wilson interval on the unweighted cell counts.
- The same weights apply within subgroups, because sampling depended only on the algorithm stratum.
- If N+ and N- are unknown, report PPV and NPV only and state that sensitivity and specificity are not estimable from this design. F1 is not interpretable under this design unless built from the weighted sensitivity.

Worked check (the SKILL.md example cells TP=94, FP=6, FN=15, TN=85; naive Se 0.86, Sp 0.93):

| Cohort P(algo+) | Weighted Se | Weighted Sp |
|---|---|---|
| 0.50 | 0.86 | 0.93 |
| 0.20 | 0.61 | 0.98 |
| 0.10 | 0.41 | 0.99 |
| 0.05 | 0.25 | 1.00 |

When prevalence is rare (< 10%), this is the efficient design -- pure random sampling would give too few cases -- but only PPV and NPV come free; Se and Sp need the cohort stratum counts.

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
- Kappa < 0.70 (project default, not a literature cutoff) → re-train reviewers on a subset before continuing

## Sample-size guidance

For PPV with 95% CI half-width = 0.05 around a planning PPV of 0.90 (an assumption; replace it with a published benchmark looked up per SKILL.md Evidence access, or a pilot estimate):
- Required N (algo-positive) ≈ 141 (Wilson; the Wald approximation 1.96^2 * 0.9 * 0.1 / 0.05^2 gives 138)

For Sensitivity with 95% CI half-width = 0.10 around a planning Sens of 0.85 (same caveat):
- Required N (chart-positive) ≈ 49 (Wilson and Wald agree here). Under algo-stratified sampling this is the number of chart-positive patients needed, which depends on the unknown sensitivity and prevalence; the weighted-Se interval is usually wider than this simple binomial plan suggests.

Typical chart-review N of 100-300 total is this plugin's convention, not a literature-derived requirement; size the review from the target precision above.

## Reporting (RECORD and STARD 2015 expect)

State explicitly:
1. Sampling design (stratified, pure random, etc.), the cohort stratum counts, and how sensitivity/specificity were corrected for it (STARD 2015, PMID 26511519)
2. N sampled and N adjudicated
3. Adjudicator count and kappa
4. Definition of the gold-standard label (e.g., "physician chart adjudication using criterion X")
5. Whether the validation is internal (same dataset) or external (separate dataset)
6. Whether the algorithm has been re-trained based on validation results (would need a second held-out validation set)

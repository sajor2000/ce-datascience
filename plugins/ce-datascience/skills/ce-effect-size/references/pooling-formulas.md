# Pooling Formulas (DerSimonian-Laird and REML)

Random-effects meta-analysis. Default to REML (unbiased; better than DL for small N).

## Inputs per study

For each study `i`:
- `theta_i` = effect size on the analytic scale (log(HR), log(OR), MD, SMD)
- `se_i` = standard error of `theta_i` (compute from CI: `(hi - lo) / (2 * 1.96)` if 95% CI)
- `w_i` = inverse-variance weight (`1 / (se_i^2 + tau^2)` for random-effects)

## REML iteration

```
1. Initialize tau^2 = 0
2. Compute fixed-effect weights w_i = 1 / se_i^2
3. Compute pooled theta = sum(w_i * theta_i) / sum(w_i)
4. Compute Q = sum(w_i * (theta_i - theta)^2)
5. Update tau^2 via REML estimating equation:
   tau^2 = max(0, (sum(w_i * (theta_i - theta)^2) - (k - 1)) / (sum(w_i) - sum(w_i^2) / sum(w_i)))
   where k = number of studies
6. Recompute w_i = 1 / (se_i^2 + tau^2)
7. Iterate until tau^2 converges
```

## Pooled estimate

```
pooled_theta = sum(w_i * theta_i) / sum(w_i)
pooled_se    = sqrt(1 / sum(w_i))
pooled_ci    = pooled_theta +/- 1.96 * pooled_se
```

For ratio metrics, exponentiate:
```
HR_pooled    = exp(pooled_theta)
HR_ci        = exp(pooled_ci)
```

## Heterogeneity

```
I^2 = max(0, (Q - (k - 1)) / Q) * 100%
tau^2 = (from REML)
```

I^2 interpretation: 25% low, 50% moderate, 75% high (Higgins 2003).

## Prediction interval

The prediction interval is the range a NEW study's effect would fall in -- wider than the CI. Often more useful for planning a new study.

```
PI = pooled_theta +/- t_{k-2, 0.975} * sqrt(pooled_se^2 + tau^2)
```

For ratio metrics, exponentiate. PI is what `/ce-power` should use as the sensitivity-sweep bounds.

## When NOT to pool

- k < 3: report narrative range only
- I^2 > 80%: report pooled estimate but caution; consider subgroup or meta-regression
- Mixed metrics in input (some OR, some RR): subset to modal; do not convert without per-study event rates
- Small-study effects (funnel plot asymmetry): suggest sensitivity excluding the smallest 20%

## Software equivalents

- R: `meta::metagen(TE, seTE, studlab, sm="HR", method.tau="REML")`
- Python: there's no perfect equivalent; recommend hand-coded REML or bridging via `rpy2`
- Stata: `meta set theta se, eform`; `meta summarize, random(reml)`

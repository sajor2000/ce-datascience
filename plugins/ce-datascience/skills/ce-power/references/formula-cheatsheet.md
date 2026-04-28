# Power Formula Cheat Sheet

## Two-sample t (continuous outcome)

`n_per_arm = (z_{1-alpha/2} + z_{1-beta})^2 * 2 * sigma^2 / delta^2`

- `delta` = mean difference
- `sigma` = pooled SD
- `z_{1-alpha/2}` = 1.96 for two-sided α = 0.05
- `z_{1-beta}` = 0.84 for power 0.80

Sanity: at d = 0.5 (medium), n ≈ 64/arm. At d = 0.3 (small), n ≈ 175/arm.

## Two-proportion (binary outcome)

Approximate formula with continuity correction; for small N, use exact binomial.

`n_per_arm = (z_{1-alpha/2} sqrt(2 p_bar q_bar) + z_{1-beta} sqrt(p1 q1 + p2 q2))^2 / (p1 - p2)^2`

Sanity: 50% vs 60% control rate, α = 0.05, power 0.80 → n ≈ 388/arm.

## Log-rank (survival)

Schoenfeld formula -- power is driven by EVENTS, not patients:

`d = (z_{1-alpha/2} + z_{1-beta})^2 / (p1 * (1 - p1) * log(HR)^2)`

where `d` = total events needed, `p1` = proportion in arm 1.

Then convert events to enrollment using anticipated event rate over follow-up:

`n = d / (1 - exp(-lambda * t_followup))` adjusted for accrual time.

Rule of thumb: HR 0.75, balanced arms, α 0.05, power 0.80 → ~380 events.

## Prediction model development (EPV)

Old rule: 10 events per variable (EPV ≥ 10). Often too lenient.

Riley 2020: minimum sample size for binary outcome:

```
N >= max(
  EPV >= 10,
  Shrinkage >= 0.9,
  Optimism in R^2 <= 0.05,
  CI half-width on outcome proportion <= 0.05
)
```

Use `pmsampsize::pmsampsize()` -- it computes all four and reports the binding one.

## Cluster RCT (design effect)

`n_cluster_total = n_individual_RCT * design_effect`

`design_effect = 1 + (m - 1) * ICC`

where `m` = average cluster size, `ICC` = intra-cluster correlation.

Sanity: m = 30, ICC = 0.05 → design effect 2.45 → 2.45× more participants than individual RCT.

## Equivalence / non-inferiority

Use TOST. Required N for non-inferiority is HIGHER than for superiority at the same delta, because you must reject the null on BOTH ends of the equivalence margin.

`n_per_arm = (z_{1-alpha} + z_{1-beta})^2 * 2 * sigma^2 / (margin - true_diff)^2`

Note the use of `z_{1-alpha}` (one-sided) not `z_{1-alpha/2}`.

## Multiplicity adjustment

If `k` primary endpoints with Bonferroni: replace `alpha` with `alpha/k`. Required N grows substantially -- this is why most studies use a single primary outcome.

## Common errors

- Using `qnorm(0.95)` instead of `qnorm(0.975)` for two-sided 0.05 (off by 60% in N)
- Forgetting the factor of 2 in the t-test formula (sigma^2 → 2 sigma^2 for two-sample)
- Treating "power = 0.80" as a goal rather than a floor
- Not accounting for dropout (inflate by `1 / (1 - dropout_rate)`)
- Cluster RCT without design effect (off by 2-5×)
- Using post-hoc power as a substitute for confidence intervals

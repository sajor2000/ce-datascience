# Power Formula Cheat Sheet

## Contents

- Two-sample t and ANCOVA (continuous outcome)
- Two-proportion (binary outcome)
- Log-rank and Cox regression (survival)
- Prediction model development
- Cluster RCT (parallel, unequal cluster sizes, stepped-wedge)
- Non-inferiority and equivalence
- Multiplicity adjustment
- Common errors

## Two-sample t (continuous outcome)

`n_per_arm = (z_{1-alpha/2} + z_{1-beta})^2 * 2 * sigma^2 / delta^2`

- `delta` = mean difference
- `sigma` = pooled SD
- `z_{1-alpha/2}` = 1.96 for two-sided α = 0.05
- `z_{1-beta}` = 0.84 for power 0.80

Sanity: at d = 0.5 (medium), n ≈ 64/arm. At d = 0.3 (small), n ≈ 176/arm (`pwr.t.test` gives 63.8 and 175.4; round up).

### ANCOVA on a baseline covariate

When the primary analysis adjusts for a baseline measurement with correlation ρ to the outcome:

`n_ANCOVA ≈ n_ttest * (1 - ρ^2)`

ANCOVA on `(1 - ρ^2) n` per arm has the same power as a t-test on `n` per arm; add about one participant per arm for small trials (Borm, Fransen & Lemmens, J Clin Epidemiol 2007;60:1234-8, PMID 17998077). Take ρ from prior data with its source; do not assume ρ > 0.5 without one. The SAP analysis must then be the ANCOVA the calculation assumed.

## Two-proportion (binary outcome)

Normal approximation without continuity correction (matches base R `power.prop.test` exactly):

`n_per_arm = (z_{1-alpha/2} sqrt(2 p_bar q_bar) + z_{1-beta} sqrt(p1 q1 + p2 q2))^2 / (p1 - p2)^2`

Sanity: control 50% vs treatment 60%, α = 0.05 two-sided, power 0.80 → n ≈ 388/arm (387.3).

`pwr.2p.test` and statsmodels `NormalIndPower` (with `proportion_effectsize`) use Cohen's arcsine effect size `h = 2 asin(sqrt(p1)) - 2 asin(sqrt(p2))`, `n_per_arm = 2 ((z_{1-alpha/2} + z_{1-beta}) / h)^2`. The two methods agree near 50% (387.2 vs 387.3) but diverge for rare outcomes: control 1% vs treatment 5% gives 284.3/arm by the formula above and 249.8/arm by arcsine. Name the method the planned test uses and validate against that solver.

When the planned test is a continuity-corrected chi-square, apply the Fleiss correction `n_cc = n/4 * (1 + sqrt(1 + 4/(n * |p1 - p2|)))^2` (Fleiss, Levin & Paik, *Statistical Methods for Rates and Proportions*); the same example gives ≈ 408/arm. For small N, size an exact test (Fisher or Boschloo) by simulation.

## Log-rank (survival)

Schoenfeld formula -- power is driven by EVENTS, not patients:

`d = (z_{1-alpha/2} + z_{1-beta})^2 / (p1 * (1 - p1) * log(HR)^2)`

where `d` = total events needed, `p1` = proportion allocated to arm 1.

Rule of thumb: HR 0.75, balanced arms, α 0.05 two-sided, power 0.80 → ~380 events (`gsDesign::nEvents(hr = 0.75, alpha = 0.025, beta = 0.2)` gives 379.4; its defaults are one-sided 0.025 and power 0.90).

Convert events to enrolment with the probability of an event weighted by allocation. Under uniform accrual over `a` and minimum follow-up `f`, Simpson's rule gives (Schoenfeld, Biometrics 1983;39:499-503, PMID 6354290):

`P_event = 1 - sum_j p_j * [S_j(f) + 4 * S_j(f + a/2) + S_j(f + a)] / 6`

where `p_j` is the proportion allocated to arm `j` (1/2 each when balanced), with `S_j(t) = exp(-lambda_j * t)` under exponential survival, `lambda_T = HR * lambda_C`. Then `n = d / P_event`, inflated for dropout. Prefer `gsDesign::nSurv` or `rpact::getSampleSizeSurvival`, which handle accrual, dropout, and allocation directly; never divide by a single-arm `1 - exp(-lambda * t)` that assumes everyone is followed for the full `t`.

### Cox regression with a non-binary covariate

Events for a covariate with variance `sigma_x^2`, log-hazard ratio per unit `log(theta)`, and multiple correlation `R^2` with the other covariates (Hsieh & Lavori, Control Clin Trials 2000;21:552-60, PMID 11146149; implemented by `powerSurvEpi::ssizeEpiCont.default`):

`d = (z_{1-alpha/2} + z_{1-beta})^2 / (sigma_x^2 * log(theta)^2 * (1 - R^2))`

Divide by the overall event proportion to get N.

## Prediction model development (EPV)

Old rule: 10 events per variable (EPV ≥ 10). Often too lenient.

Riley et al. (BMJ 2020;368:m441, PMID 32188600, doi:10.1136/bmj.m441). Binary and time-to-event outcomes use THREE criteria (Stat Med 2019;38:1276-96, PMID 30357870); EPV is reported, not a criterion:

```
N >= max(
  Shrinkage >= 0.9,
  Optimism in Nagelkerke R^2 <= 0.05,
  Precise overall risk or rate (e.g. CI half-width on outcome proportion <= 0.05)
)
```

Continuous outcomes use FOUR criteria: the same two overfitting criteria plus precise residual SD and precise mean/intercept (Stat Med 2019;38:1262-75, PMID 30347470). Use `pmsampsize::pmsampsize()` -- it computes each criterion and reports the binding one.

## Cluster RCT (design effect)

`n_cluster_total = n_individual_RCT * design_effect`

Equal cluster sizes: `design_effect = 1 + (m - 1) * ICC`

where `m` = cluster size, `ICC` = intra-cluster correlation.

Sanity: m = 30, ICC = 0.05 → design effect 2.45 → 2.45× more participants than individual RCT.

Unequal cluster sizes (CV = coefficient of variation of cluster size, `m_bar` = mean size): `design_effect = 1 + ((CV^2 + 1) * m_bar - 1) * ICC` (Eldridge, Ashby & Kerry, Int J Epidemiol 2006;35:1292-300, PMID 16943232). The adjustment is negligible when CV < 0.23 and conservative for individual-level analyses; CV ≈ 0.65 is typical for trials randomising UK general practices.

Report clusters per arm, not only participants. With few clusters, use t-based critical values (df from the number of clusters) or add clusters; see Rutterford et al., Int J Epidemiol 2015;44:1051-67 (PMID 26174515) for methods.

Stepped-wedge: do not use the parallel design effect. Use Hussey-Hughes (Contemp Clin Trials 2007;28:182-91, PMID 16829207; `swCRTdesign::swPwr`) and state the assumed within- and between-period correlation (Hemming et al., BMJ 2015;350:h391, PMID 25662947).

## Non-inferiority and equivalence

Non-inferiority (NI) is ONE one-sided test against the margin M (H0: mu_T - mu_C <= -M):

`n_per_arm = (z_{1-alpha} + z_{1-beta})^2 * 2 * sigma^2 / (M + true_diff)^2`

Equivalence uses TOST (two one-sided tests, one at each margin). When the true difference is 0:

`n_per_arm = (z_{1-alpha} + z_{1-beta/2})^2 * 2 * sigma^2 / M^2`

Preserve the protocol's hypothesis framework, margin, sidedness and alpha. For confirmatory clinical NI, one-sided α = 0.025 is a common convention (ICH E9 section 5.5; FDA NI guidance, 2016); justify the active-control margin using M1/M2 when that framework applies. NI N is not inherently larger than superiority N; it depends on M and the assumed true difference.

Do not transfer that convention universally to equivalence. TOST tests both margins at α and corresponds to an equal-tailed 100(1-2α)% CI. Conventional average bioequivalence uses α = 0.05 and a 90% CI (FDA, *Statistical Approaches to Establishing Bioequivalence*, final May 2026, section II.C: https://www.fda.gov/media/163638/download). A protocol can instead require α = 0.025 and a 95% CI. Ask for the applicable framework when unresolved; never silently override .05 or derive an equivalence margin from NI's M1/M2 machinery without justification.

Sanity (sigma = 1, M = 0.5, true_diff = 0, α = 0.025 one-sided, power 0.90): NI ≈ 85/arm; equivalence ≈ 105/arm (`TOSTER::power_t_TOST` gives 104.9).

## Multiplicity adjustment

If `k` primary endpoints with Bonferroni: replace `alpha` with `alpha/k`. Required N grows substantially -- this is why most studies use a single primary outcome. For k arms against a shared control, `alpha/(k-1)` is conservative; Dunnett's procedure is the less conservative standard.

## Common errors

- Using `qnorm(0.95)` instead of `qnorm(0.975)` for two-sided 0.05 (N about 21% too small; the correct N is about 27% larger at 80% power)
- Forgetting the factor of 2 in the t-test formula (sigma^2 → 2 sigma^2 for two-sample)
- Confusing NI and equivalence frameworks, or changing the prespecified alpha/CI convention without justification
- Treating "power = 0.80" as a goal rather than a floor
- Not accounting for dropout (inflate by `1 / (1 - dropout_rate)`, rounding up)
- Cluster RCT without design effect (off by 2-5×), or with the equal-size design effect when cluster sizes vary
- Passing an OR or RR directly where a two-proportion calculation needs p_C and p_T
- Using post-hoc power as a substitute for confidence intervals

# Pooling methods for a power-assumption anchor

This reference supports an effect-size assumption for power. Use
`ce-clif-meta-analysis` for formal site-to-lead synthesis or a systematic review.
Its eligibility and dependence decisions cannot be replaced by power-anchor
filters.

## Inputs and uncertainty

For each independent compatible study, use an effect on its analysis scale and
its sampling SE: natural log for OR/RR/HR, raw units for MD, and correctly
bias-adjusted Hedges g with its variance for SMD. Do not conflate effect measures
or adjusted and unadjusted estimands.

For a symmetric 95% Wald interval on the analysis scale only,
`SE = (upper - lower) / (2 * qnorm(0.975))` is an approximation.
For ratios, transform the endpoints to logs first. Profile, bootstrap, exact,
and t-based intervals need their actual construction, not an assumed 1.96.

## Estimation

Use a maintained implementation such as R `meta::metagen` or `metafor::rma`.
REML estimates the heterogeneity variance by optimizing a restricted likelihood.
It is not guaranteed unbiased in small samples. The closed-form
`max(0, (Q - (k-1)) / (sum(w) - sum(w^2)/sum(w)))`, with common-effect inverse
variance weights, is the DerSimonian-Laird moment estimator, not a REML update.
Do not implement REML by iterating that formula.

For a specified tau-squared, random-effects weights are
`w_i = 1 / (SE_i^2 + tau^2)` and the mean is
`sum(w_i * theta_i) / sum(w_i)`. The scale-one SE is
`sqrt(1 / sum(w_i))`. HKSJ estimated-scale inference and its degrees of freedom
must be selected explicitly when used. Report the estimator, interval method
and installed package version; do not assume defaults match across packages.

Exponentiate pooled log effects and interval endpoints for ratio presentation.
I-squared, Q and tau-squared describe different aspects of heterogeneity.
Do not select the scientific model by an I-squared cutoff or Q-test P value.

## Prediction intervals and sensitivity

A prediction interval estimates the spread of underlying effects in comparable
settings under the random-effects model. Its method matters. For example,
metafor with `test="knha"` uses k-p t degrees of freedom by default; the Riley
approximation uses k-2. Neither is an exact interval in general. State the
method actually used and caution that few studies can make the interval
misleading. A finite interval is not automatically suitable for planning.

For the existing power workflow, keep the emitted `pi=lo,hi` or `pi=NA` contract.
If a PI is not defensible, document that and use an explicitly justified CI or
clinical scenario range for a sensitivity sweep. These are planning assumptions,
not review inclusion rules. Do not automatically discard a fixed percentage of
small studies in response to funnel asymmetry. Prespecify meaningful sensitivity
analyses and assess missing evidence.

## Software boundaries

- R: `metafor::rma(yi, sei=se, method="REML", test="knha")` or explicitly
  configured `meta::metagen`; inspect current version-specific CI/PI arguments.
- Python: `statsmodels.stats.meta_analysis.combine_effects` supports
  Paule-Mandel (`iterated`/`pm`) and DL (`chi2`/`dl`), not REML. Its estimated-
  scale interval and scale-one interval are distinct outputs. Use the declared
  supported method or an approved R bridge rather than hand-coded REML.
- Cross-language checks must match estimator, CI method, transformation and
  degrees of freedom. Different supported methods are not parity tests.

Primary documentation:
https://wviechtb.github.io/metafor/reference/rma.uni.html
https://wviechtb.github.io/metafor/reference/predict.rma.html
https://www.statsmodels.org/stable/generated/statsmodels.stats.meta_analysis.combine_effects.html

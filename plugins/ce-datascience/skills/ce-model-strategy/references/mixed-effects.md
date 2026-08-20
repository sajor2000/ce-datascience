# Mixed and Random Effects

Read this file for paired, repeated, clustered, multilevel, nested, crossed, or longitudinal observations.

## 1. Define the target interpretation

- Use GEE for a population-averaged contrast when sandwich-robust inference fits the missingness assumptions and the number of independent clusters supports it.
- Do not reject a Gaussian identity-link LMM solely because the target is marginal: its fixed-effect mean contrasts can also represent population-average mean contrasts. Choose LMM versus GEE from the likelihood and missingness assumptions, covariance model, efficiency-versus-robustness goal, and cluster count.
- Use an LMM/GLMM when the target is conditional on subject/cluster effects, cluster heterogeneity is itself important, shrinkage/prediction is required, or likelihood-based handling under stated missingness assumptions is needed.
- If a nonlinear mixed model must report a marginal effect, standardize or integrate predictions over the random-effects distribution. Do not set random effects to zero and call the result marginal.
- Use MMRM when repeated continuous outcomes, visit-specific means, an unstructured or prespecified within-subject covariance, and the trial estimand support that design. Do not treat MMRM as a generic synonym for any longitudinal mixed model.

## 2. Identify grouping structure

State each grouping factor and whether levels are nested or crossed. A factor is not random merely because it has many levels, and it is not fixed merely because it has few.

Consider a random effect when levels plausibly represent a sample from a broader population and partial pooling matches the scientific target. Consider fixed effects when every level is substantively unique or exhaustive, its coefficient is directly required, or the random-effect distribution is indefensible. With few levels, report the estimation risk; do not use a universal numeric cutoff.

Check informative cluster size. If cluster size relates to the outcome after conditioning, consider cluster-size adjustment, weighting, within-cluster resampling, or a model designed for that mechanism.

## 3. Choose random intercepts and slopes

Add a random intercept only when observations share a genuine subject, site, clinician, family, batch, or other grouping source that induces dependence or meaningful heterogeneity.

A random slope requires all of:

1. The predictor varies within the grouping factor.
2. Heterogeneity in that within-group effect is scientifically plausible or design-mandated.
3. The data contain enough repeated information to estimate the variance.
4. The fixed-effect interpretation after centering is explicit.

Omitting a supported random slope can make within-cluster effects overconfident. Adding unsupported random slopes can cause singularity, unstable correlations, and misleading shrinkage. Decide from design and diagnostics, not a stepwise p-value alone.

For a predictor that varies within and between clusters, decompose it into cluster mean and within-cluster deviation when the within and between effects answer different questions. This also exposes correlated-random-effect/confounding-by-cluster concerns.

## 4. Separate random effects from residual correlation

Random intercepts/slopes model heterogeneity in trajectories or cluster means. AR(1), continuous-time, spatial, heteroscedastic, or unstructured residual covariance models remaining conditional dependence. One does not automatically replace the other.

Irregular observation times weaken discrete equally spaced AR(1) assumptions. Use a continuous-time correlation or another justified structure when timing is irregular and residual correlation remains after random effects.

## 5. Predeclare fitting and inference

- For Gaussian LMM comparison of fixed effects, use ML when likelihood-ratio comparisons require it; use REML for final variance estimation when appropriate.
- State denominator degrees-of-freedom or small-sample method when relevant, such as Satterthwaite, Kenward-Roger, cluster bootstrap, or another justified correction.
- For GLMMs, state integration/approximation and verify optimizer behavior. Sparse binary outcomes can cause separation or weakly identified variance components.
- For GEE, state working correlation, cluster-robust variance, and small-cluster correction or limitation.
- For Bayesian multilevel models, justify priors on coefficients, scales, correlations, and weakly identified variance components; assess convergence and posterior predictive adequacy.

## 6. Diagnostics and fallback sequence

Record variance estimates, random-effect correlations, optimizer messages, gradient/Hessian checks when available, residual diagnostics, and sensitivity to influential clusters.

When a fit is singular or nonconvergent:

1. Verify coding, scaling, grouping levels, repeated observations, and the design matrix.
2. Rescale/center predictors and try an appropriate optimizer or integration setting without changing the estimand.
3. Remove an unsupported random-effect correlation before removing its slope.
4. Simplify the least-supported variance component according to a predeclared hierarchy.
5. Consider fixed effects, GEE, cluster-robust inference, or a Bayesian regularized model only when their estimand and assumptions remain appropriate.
6. If simplification changes the scientific target, return `blocked` for analyst review rather than silently substituting a model.

Do not drop the entire dependence structure merely to make warnings disappear. Do not report BLUPs/conditional modes as unbiased raw group effects.

## Evidence search seeds

Use these as query seeds, not universal authority. Resolve and re-read the relevant claim at runtime:

- GLMM practical guidance: PMID `19185386`.
- Accessible longitudinal LMM analysis: PMID `35521689`.
- Continuous clustered-outcome GEE versus LMM marginal association: PMID `35838059`.
- Longitudinal binomial marginal/conditional paradigms: PMID `36919082`.
- Few grouping levels and singular fits: PMCID `PMC9309037`.
- Random-slope omission and overconfidence: PMCID `PMC2657178`.
- Marginal prediction from random-intercept binary models: PMCID `PMC4525751`.
- Random-intercept/slope power assumptions: PMCID `PMC9156336`.

The memo must distinguish simulation, tutorial, and applied evidence. No single paper supplies a universal random-effects rule.

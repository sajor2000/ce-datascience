# Statistical decisions for synthesis

## Effect construction and dependence

Define the estimand before choosing an effect size. OR, RR and HR are distinct;
MD needs common outcome units; Hedges' g needs the small-sample correction,
consistent direction, and an appropriate sampling variance. Do not standardize
binary outcomes or log ratios twice. Harmonize cluster-randomized and paired
designs using their actual covariance/effective information, not raw n alone.

Multiple outcomes, timepoints, subgroup estimates, shared control arms,
overlapping cohorts and multiple publications violate independent scalar
pooling if counted separately. Use a protocol-defined selection, suitable
multivariate/multilevel model and covariance, or cluster-robust inference with
an adequate number of independent clusters and small-sample correction. Do not
silently assume correlations are zero. Sensitivity analysis must expose any
assumed correlation.

## Model and uncertainty

A common-effect model targets one effect under its assumptions. A random-effects
model targets a mean in a defined distribution of effects. Neither makes
incompatible studies comparable. Prespecify the scientific primary model;
do not switch after heterogeneity testing. REML with Knapp-Hartung inference is
a defensible starting point for compatible approximately normal effects, not a
universal rule for all designs or sparse data.

Report the tau-squared estimator, effect CI method, confidence level and degrees
of freedom. Unmodified HKSJ intervals may become narrower than Wald intervals
when residual scale is small. Prespecify any modified/ad hoc safeguard and
report a sensitivity comparison. With two or three independent units,
heterogeneity and interval coverage are fragile. No arbitrary minimum makes
inference automatically trustworthy. With fewer than two usable units, do not
report a pooled effect.

Report Q with its degrees of freedom, tau-squared, and I-squared with uncertainty
where available. Q has low power with few units, and I-squared is not an
absolute measure of clinical inconsistency. A negative estimated I-squared is
usually truncated to zero for presentation with the convention documented.

Prediction intervals describe the modeled spread of true effects for comparable
settings. State their method and assumptions; unstable small-k estimates or
clear selection asymmetry may make them misleading. The default `predict()`
interval for a metafor `test="knha"` fit uses t with k-p degrees of freedom,
not the Riley k-2 approximation. Do not label one as the other. Explain omission
when the interval is not defensible.

## Sparse data and alternative synthesis

For binary sparse/zero-event studies, prespecify the estimand and method:
Mantel-Haenszel, an appropriate binomial GLMM, or another justified sparse-data
method may be preferable to normal inverse-variance approximations. Double-zero
studies contribute differently to relative and absolute effects. Avoid a blanket
0.5 correction. Peto OR requires restrictive conditions and is not a generic
rare-event method. Failed site regression fits need local review before pooling.

Diagnostic sensitivity/specificity requires a joint bivariate or HSROC model
with threshold considerations. Network meta-analysis requires transitivity and
consistency assessment. IPD meta-analysis requires its own governance and model.
These designs exceed the bundled scalar scripts. If pooling is unjustified,
use structured synthesis with SWiM where relevant, not vote-counting significant
P values.

## Challenge and report

Use leave-one-out and influence diagnostics, prespecified risk-of-bias and model
sensitivities, and clinically justified subgroups. Report all planned endpoints
and distinguish exploratory analyses. Meta-regression is observational and can
be confounded. Avoid overfitting few studies or interpreting a difference
between significant and nonsignificant subgroup results as an interaction.

Assess missing evidence through search/protocol/result comparisons and a tool
such as ROB-ME where appropriate. Funnel plots and asymmetry tests concern
small-study effects, not a diagnosis of publication bias. Tests generally need
at least ten independent studies and meaningful variation in precision; ten is
not sufficient by itself. The appropriate test depends on effect measure and
design, especially binary and diagnostic outcomes. Do not run Egger's test on
a handful of CLIF sites or a fixed roster without a relevant selection process.
Trim-and-fill is a sensitivity procedure, not a correction establishing truth.

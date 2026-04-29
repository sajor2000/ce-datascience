# Extraction Prompts

The model performs the extraction; these are anchor prompts for consistency.

## Sample size

> Read the methods and results. State the FINAL analytic sample size used for the primary outcome model. If the paper reports multiple Ns (enrolled, eligible, randomized, analyzed), pick the one used for the primary inferential analysis. Format: integer or "not reported".

## Primary outcome

> Quote the primary outcome verbatim from the methods or pre-specified outcomes section. Do not paraphrase. If the paper distinguishes "primary efficacy" vs "primary safety", report the efficacy one. Format: a single sentence.

## Statistical method

> Name the statistical model used for the primary outcome. Use a controlled vocabulary: linear regression, logistic regression, Cox proportional hazards, log-rank, t-test, Wilcoxon rank-sum, chi-square, Fisher exact, mixed-effects linear, mixed-effects logistic, Poisson, negative binomial, GEE, marginal structural model, IPTW, propensity score matching, doubly robust, machine-learning model (specify), other (describe). Format: comma-separated list, primary first.

## Effect size

> Extract the headline effect size from the abstract or results conclusion. Format: `<metric> <point> (<lo>, <hi>) [<interpretation>]`. Example: `HR 0.78 (0.65, 0.93) [favors treatment]`. If a p-value only is given, format: `p=<value>`. If neither, "not reported".

## Conservatism rule

When in doubt, write `not reported`. Inferring "they probably did Cox" is more harmful than admitting the paper did not state.

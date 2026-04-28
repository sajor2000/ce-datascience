# Method Taxonomy

Controlled vocabulary for the `statistical_method` field.

## By outcome type

| Outcome type | Common methods |
|--------------|----------------|
| Continuous | t-test, Wilcoxon, linear regression, ANCOVA, mixed-effects linear, GEE-Gaussian |
| Binary | chi-square, Fisher exact, logistic regression, mixed-effects logistic, GEE-binomial, log-binomial, Poisson |
| Time-to-event | log-rank, Cox PH, Fine-Gray (competing risks), AFT, Royston-Parmar, time-varying Cox |
| Count | Poisson, negative binomial, zero-inflated, hurdle |
| Ordinal | proportional-odds, partial-proportional-odds, multinomial logit |
| Repeated measures | mixed-effects, GEE, MMRM, latent growth, joint model |
| Diagnostic accuracy | sensitivity/specificity table, ROC AUC, DeLong, bivariate random-effects |
| Prediction model | logistic + calibration, Cox + Harrell C, ML + DCA, internal-external validation |
| Causal observational | propensity matching, IPTW, MSM, g-computation, doubly-robust, target trial emulation |

## Software / package mapping

When extracting `software`, prefer the package over the language:

- "R, survival package" → `R::survival`
- "R, lme4" → `R::lme4`
- "R, tidymodels" → `R::tidymodels`
- "Python, statsmodels" → `python::statsmodels`
- "Python, lifelines" → `python::lifelines`
- "Python, scikit-survival" → `python::sksurv`
- "Python, sklearn" → `python::sklearn`
- "Stata, stcox" → `stata::stcox`
- "SAS, PROC PHREG" → `sas::phreg`

This taxonomy lets `/ce-power` and `/ce-plan` decide which environment to spin up for the chosen method.

# R Implementation

Use the project's locked environment and existing conventions. Check `renv.lock`, `DESCRIPTION`, analysis scripts, and package versions before writing calls. Do not install packages.

## Preferred established paths

| Need | Candidate path | Required implementation checks |
|---|---|---|
| Ordinary linear/GLM | `stats::lm`, `stats::glm` | Family/link, contrasts, design matrix, diagnostics |
| LMM/GLMM | `lme4::lmer`, `lme4::glmer` | Grouping, random structure, singularity, optimizer, marginalization |
| Flexible GLMM/count/zero models | `glmmTMB` | Family, dispersion/zero component, convergence code, simulation residuals |
| Residual covariance/MMRM | Existing `nlme`, `mmrm`, or project-approved path | Time spacing, covariance structure, denominator df |
| GEE | `geepack::geeglm` or existing approved path | Cluster id, waves/order, working correlation, small-cluster limitation |
| Survival | `survival`, plus an existing approved competing-risk/flexible package | Time zero, event coding, PH/time-varying checks |
| Bayesian hierarchy | Existing `brms`, `rstanarm`, or project-approved Stan path | Priors, chains, R-hat, ESS, divergences, posterior predictive checks |
| Meta-analysis | Existing `meta` or `metafor` path | Effect scale, tau-squared, interval method, influence, prediction interval |

Prefer the installed package that directly implements the selected estimand. Do not introduce a package solely to make the scaffold look symmetric with Python.

## Scaffold contract

The `.R` scaffold must:

1. Declare required columns and stop when any are absent.
2. Assert the intended row grain or identifier uniqueness where applicable.
3. Validate outcome support, grouping levels, event coding, and exposure/offset positivity.
4. Make the primary formula and family/link visible in one place.
5. Fit one primary model; put sensitivity models in named functions or clearly inactive sections.
6. Capture convergence/singularity and family-specific diagnostic outputs.
7. Produce estimand-aligned contrasts or predictions rather than dumping raw coefficients alone.
8. Save no row-level output by default.

For mixed models, include variance/correlation summaries, singularity checks, and a predeclared simplification path. For nonlinear links, use appropriate marginal standardization when the memo requests population-average effects.

Record `sessionInfo()` or the repository's equivalent reproducibility evidence. If an unfamiliar API is version-sensitive, verify its official documentation before writing it; otherwise leave the scaffold blocked with the exact version gap.

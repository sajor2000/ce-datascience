# CLIF federated site-to-lead model-output meta-analysis audit

**Audit date:** 2026-10-15
**Scope:** `ce-clif`, its R recipe, and `ce-clif-project-template`. This is a code-and-guidance audit only. No patient-level data, model outputs, credentials, or site files were inspected.

## Bottom line

The plugin has a sound data-locality boundary and a useful local-then-summary sketch, but it is **not yet methodologically safe to present as a generic federated model-output meta-analysis workflow**. It has no release contract for the estimate, estimand, variance, covariance, model fit, or disclosure review. Its current examples conflate three different operations:

1. pooling one prespecified site-level effect estimate;
2. iterative federated optimization of one shared predictive model; and
3. meta-analysis of prediction performance across external-validation sites.

Only the first is a conventional inverse-variance meta-analysis. The second needs an iterative optimization/secure-aggregation protocol. The third pools calibration and discrimination metrics, not regression coefficients. The parent implementation should retain a narrow coefficient/effect meta-analysis path and route the other two modes elsewhere.

## Materials examined

| Local material | What was assessed |
|---|---|
| `plugins/ce-datascience/skills/ce-clif/references/clif-rules.md` | CLIF data locality, aggregation claims, and rare-outcome guidance |
| `plugins/ce-datascience/skills/ce-clif/references/r-template-recipes.md` | Current R contract and `metafor`/Bayesian examples |
| `plugins/ce-datascience/skills/ce-clif-project-template/SKILL.md` | Template-created output and audit safeguards |
| Upstream `CLIF-Project-Template` | Current template files and source attribution |

## Findings

| Severity | Location | Finding and consequence | Required remediation |
|---|---|---|---|
| Critical | `clif-rules.md:120-124` | “Meta-analytic pooling” and “federated coefficient pooling” are described as interchangeable aggregation patterns. Pooling fitted local coefficients does **not** create a shared fitted model, and pooling only intercepts cannot rescue a failed rare-outcome propensity or outcome model. | Split the route at dispatch: `effect_meta`, `federated_optimization`, and `prediction_performance`. Permit the first here only. Require a distinct algorithm, privacy review, and validation plan for the second. |
| Critical | `r-template-recipes.md:410-425`; `clif-rules.md:118-123` | A filename pattern and `rbindlist()` are the only site-to-lead interface. There is no typed contract for parameter identity, estimand, scale, SE/variance, adjustment set, model family, convergence, code/spec version, or release status. Estimates can therefore be pooled despite representing different questions. | Require a machine-validatable aggregate manifest before reading values. Reject unknown fields, duplicate `(site_id, parameter_id)`, mismatched contract hashes, missing variance, or any `release_status != approved`. |
| High | `r-template-recipes.md:429-443` | The recipe assumes every value is `log_estimate`, labels its forest plot `OR`, and back-transforms. This is invalid for risk differences, mean differences, calibration intercept/slope, log hazards, rate ratios, and raw regression slopes. It also obscures whether a coefficient is conditional or marginal. | Make `effect_scale` explicit and allow only a predeclared compatible transform. Pool log OR/RR/HR only on log scale, ordinary mean/risk differences on identity scale, and never relabel a non-OR. Record `estimand_type` and `adjustment_set_hash`; do not call adjusted logistic coefficients marginal effects. |
| High | `r-template-recipes.md:427-444` | One univariate `rma()` fit silently assumes one independent estimate per site. Multiple endpoints, subgroup effects, repeated time horizons, or several coefficients from a site are correlated. Ignoring that can overstate precision. | The default contract permits one primary parameter per site. For a jointly synthesized vector, require an approved within-site covariance matrix and use a multivariate method (`metafor::rma.mv` in R; a reviewed multivariate implementation in Python). Otherwise pre-specify separate analyses and multiplicity handling. |
| High | `clif-rules.md:121-122`; `r-template-recipes.md:429-444` | No outcome-event, separation, convergence, or exclusion-status fields exist. The advice to pool coefficients when local models fail is backwards: no valid local effect/SE exists to pool after a failed model. Silent exclusion of failed or zero-event sites also changes the target population. | Require each site to return `contribution_status` (`contributed`, `no_events`, `separation`, `nonconvergence`, `suppressed`, `not_eligible`) plus a non-sensitive reason. Pre-specify a consistent penalized/exact/alternative estimand path or report that pooling is not feasible. Never impute an estimate from a failed fit. |
| High | `r-template-recipes.md:434`; `clif-rules.md:121` | “REML is the consortium standard” is asserted without an identified CLIF source. REML is a `metafor` default, not evidence of a CLIF-wide mandate. A random-effects fit with few contributing sites gives an unstable heterogeneity estimate and needs interpretation beyond one pooled CI. | Remove the mandate. Pre-specify common-effect versus random-effects based on the scientific target, then report `k`, tau-squared, I-squared, Q, a prediction interval when estimable, and leave-one-site diagnostics. Make any small-`k` inference rule a protocol decision. |
| Critical | `r-template-recipes.md:446-461` | The proposed `brms` binomial model expects event counts and denominators, whereas the preceding table holds generic estimates and SEs. It cannot be a Bayesian complement to adjusted coefficient meta-analysis and it changes the estimand to site prevalence. | Delete or move this code to a separately named “site prevalence/proportion synthesis” workflow. A Bayesian coefficient meta-analysis instead needs the site estimate and its sampling variance, compatible parameter definitions, and stated priors for the mean and heterogeneity. |
| High | `ce-clif-project-template/SKILL.md:32,43`; `clif-rules.md:88,99`; `r-template-recipes.md:314-316` | The upstream CLIF `n >= 10` floor is correctly repeated, but the recipe only comments that suppression should happen and then writes the unsuppressed flow table. There is no complementary-suppression, differencing, repeated-release, or model-output disclosure gate. Aggregate does not automatically mean non-identifying. | Add a release gate before serialization: site/DUA-specific threshold, suppression of direct and complementary cells, a repeated-release ledger, allowed columns, and human disclosure-review status. Do not declare HIPAA de-identification from the count floor. |
| High | `clif-rules.md:118-124`; `r-template-recipes.md:417-425` | The lead has no way to verify that a return came from the approved code/spec, that the site's data-version and derivation rules passed QC, or that released aggregates were checked. There is also no lead-to-site feedback contract. | Send an aggregate-only site manifest with code SHA-256, specification SHA-256, dictionary version, input-data version label, QC status, model diagnostics, and release approval. The lead returns a signed aggregate-only synthesis report, exclusions, diagnostics, and a versioned next-run request. |
| High | `clif-rules.md:118-123`; `r-template-recipes.md:410-425` | The contract does not state whether sites have overlapping people, shared source systems, or duplicated encounters. Treating overlapping site estimates as independent makes standard errors too small. | Require `overlap_status = disjoint | possible | confirmed` before pooling. Pool only disjoint analytical contributions unless an approved covariance/overlap correction is supplied. Use a unique study/site contribution, not a hospital label alone. |
| High | `r-template-recipes.md:408-461` | The recipe has no prediction-performance synthesis path, but its coefficient-pooling language invites use for model validation. AUC, calibration-in-the-large, calibration slope, Brier score, observed/expected ratio, and decision-curve utility are not model coefficients and have their own scales and uncertainty requirements. | Route model validation to a separate performance contract: exact predictor model/version, validation design, outcome horizon, metric definition and transformation, uncertainty method, event/non-event counts if releasable, and calibration/discrimination pooled separately. Do not deploy/apply a lead-generated model from a coefficient meta-analysis. |
| Medium | `r-template-recipes.md:3,46-49,70-81,85-113,408-461` | Several claims attributed to the current upstream template are stale or unsupported. Live verification found no root `WORKFLOW.md`, no `outlier-thresholds/` directory, no template federated meta-analysis recipe, and a different config shape (`data_directory`, `filetype`, `timezone`, `output_directory`, not `tables_path`/`file_type`). The upstream `04` file is explicitly a skeleton. | Mark locally invented extensions as such and cite their source. Refresh template-derived snippets against a pinned upstream commit. Do not say the template “enforces” portability rules it does not contain. |

## What may be pooled, and what may not

| Operation | Valid central input | Central output | This skill should do it? |
|---|---|---|---|
| Prespecified effect/parameter meta-analysis | One compatible site estimate plus SE/variance, a common estimand, and approved release metadata | Common or random-effects summary of that parameter | Yes, with the release contract below |
| Federated optimization/training | Iterative gradients, sufficient statistics, or optimizer updates under a defined aggregation/privacy protocol | One trained global model | No. This is not inverse-variance meta-analysis. |
| Prediction-performance synthesis | Site-level external-validation metrics and their uncertainty on metric-specific scales | Performance generalizability and heterogeneity | No. Route to a validation/meta-analysis workflow. |
| Site prevalence/proportion synthesis | Events and denominators, under a suppression-approved contract | Pooled prevalence/proportion | Separate analysis only. It is not adjusted coefficient pooling. |

## Minimal aggregate release contract

The site must construct and validate this locally. It contains no row-level values and must still pass site disclosure review before export.

```text
contract_version, analysis_id, site_id, contribution_id
analysis_family = effect_meta
parameter_id, parameter_label, effect_scale
estimand_type, population_hash, time_zero, follow_up, outcome_definition_hash
exposure_or_predictor_hash, contrast_hash, adjustment_set_hash
estimate, standard_error                    # or variance, but not an unstated surrogate
ci_level, ci_lower, ci_upper
model_family, link, variance_estimator, missing_data_method
contribution_status, diagnostic_status, diagnostic_reason
overlap_status, site_qc_status
code_sha256, analysis_spec_sha256, dictionary_version, data_version_label
release_status, disclosure_review_id, released_at
```

Additional requirements:

- `estimate` and `standard_error` are released only for a parameter that the site’s approved disclosure policy permits. Do not use a suppressed count to reconstruct an estimate.
- A vector of correlated estimates adds `covariance_matrix` plus ordered `parameter_id`s. No covariance, no joint meta-analysis.
- A site failing the common contract is represented by a status row, not dropped from the audit trail.
- The lead checks the schema, hashes, scale, contract identity, release status, one-row-per-site/parameter rule, finite values, positive variance, and absence of model diagnostics that leak protected counts.

## Implementation direction

### R

Use `metafor::rma()` only after the contract gate passes and after selecting a compatible scale. Prefer variance explicitly to avoid SE/variance ambiguity.

```r
stopifnot(all(releases$analysis_family == "effect_meta"))
stopifnot(all(releases$effect_scale == "log_or"))
stopifnot(all(releases$contribution_status == "contributed"))
stopifnot(all(releases$release_status == "approved"))
stopifnot(all(releases$standard_error > 0))

fit <- metafor::rma(
  yi = releases$estimate,
  vi = releases$standard_error^2,
  method = chosen_tau_method,  # protocol-selected, not a consortium claim
  test = chosen_inference_method
)
influence <- metafor::influence(fit)
```

Emit the site-status table, scale, `k`, estimator/inference choices, tau-squared, I-squared, Q, a justified prediction interval where appropriate, and leave-one-site diagnostics. Do not produce a forest plot or pooled estimate if fewer than two compatible contributors remain.

For rare binary outcomes, test convergence and separation locally. If the protocol selected Firth logistic regression, record that in `model_family` and do not mix it with ordinary-MLE coefficients without a planned sensitivity analysis. If an effect cannot be estimated, retain the status and do not manufacture a finite coefficient.

### Python

Validate the CSV/JSON schema with a strict model (for example, Pydantic or JSON Schema) before any numerical code. Use `numpy` to confirm finite values and `variance > 0`. A simple audited common-effect calculation is possible from `w = 1 / variance`; random-effects or multivariate synthesis should use a reviewed, version-pinned implementation rather than an ad hoc port. For a correlated parameter vector, send the complete ordered covariance matrix to a library that supports multivariate meta-analysis, or do not pool jointly.

## Privacy and release boundary

CLIF's upstream template requires aggregate-only outputs and an `n >= 10` reporting floor. That is a consortium output rule, not a universal legal de-identification determination. HHS says de-identification depends on the release context and, under Expert Determination, requires documented very-small re-identification risk. Site policy, DUA, and institutional review may impose stricter controls. The lead must receive only the reviewed aggregate release, not a site’s raw final-output directory or a “safe” data extract.

## Verified sources

All URLs below were checked live on **2026-10-15**. The CLIF template was inspected through Browserbase Cloud Fetch; methodology and privacy sources were verified through live web retrieval.

1. [CLIF Project Template repository](https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template) — live default branch contained the project skeleton and template code, but no root `WORKFLOW.md` or federated meta-analysis implementation.
2. [Upstream R analysis skeleton](https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template/blob/main/code/templates/R/04_project_analysis_template.R) and [output guidance](https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template/blob/main/output/README.md) — aggregate-only boundary and per-statistic `n >= 10` rule.
3. [Upstream config template](https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template/blob/main/config/config_template.json) — current config fields, used to identify stale recipe attribution.
4. [metafor `rma.uni` documentation](https://wviechtb.github.io/metafor/reference/rma.uni.html) and [influence diagnostics](https://wviechtb.github.io/metafor/reference/influence.html) — compatible `yi`/variance interface and leave-one-out/influence diagnostics; `method="REML"` is a package default, not CLIF policy.
5. [Cochrane Handbook, Chapter 10](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-10) — random-effects assumptions, poor heterogeneity estimation with few studies/sparse events, prediction intervals, and sensitivity analysis.
6. [Wei and Higgins, within-study covariances in multivariate meta-analysis](https://pubmed.ncbi.nlm.nih.gov/23208849/) and [Ishak et al., impact of ignoring covariances](https://pubmed.ncbi.nlm.nih.gov/17492826/) — joint synthesis needs within-study covariance/correlation handling.
7. [Heinze and Schemper, separation in logistic regression](https://doi.org/10.1002/sim.1047) — rare-outcome/separation failure requires a defined local modeling approach rather than pooled failed coefficients.
8. [Brisimi et al., federated learning of predictive models from EHRs](https://pubmed.ncbi.nlm.nih.gov/29500022/) — federated predictive-model training is decentralized optimization, distinct from coefficient meta-analysis.
9. [Debray et al., prediction-model performance meta-analysis](https://www.bmj.com/content/356/bmj.i6460) — prediction performance is a separate synthesis problem with metric-specific methods.
10. [HHS HIPAA de-identification guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/de-identification/index.html) — a small-cell threshold is not itself a universal de-identification certification; context and documented risk matter.

## Completion evidence

- Read the current `ce-clif` rules, R recipe, and project-template skill with line-numbered findings.
- Live-checked the public upstream CLIF template through Browserbase Cloud Fetch, including its repository tree, R analysis skeleton, output guidance, and config template.
- Live-checked primary/authoritative methodology, package, and privacy sources cited above.
- Created only this audit and the proposed self-contained reference under `/tmp/ce-datascience/clif-meta/federated/`; no plugin implementation files, dependencies, data, secrets, commits, or remote state were changed.

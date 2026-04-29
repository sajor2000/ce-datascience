# Output catalog -- controlled vocabulary

The `02-outputs.csv` catalog uses a constrained set of artifact types and section labels so a coordinating center can pool across sites without parsing prose. Use the patterns below; do not invent new ones unless the existing catalog does not cover the case.

## Section labels (group rows by these)

Section rows are inserted as visual separators in the .xlsx workbook. The CSV has a section column; the .xlsx merges the section header across all columns.

1. **DIAGNOSTIC OUTPUTS** -- pre-analysis QC and cohort documentation
2. **TABLE OUTPUTS** -- manuscript-ready tables (descriptive, demographic, results summary)
3. **MODEL OUTPUTS** -- per-analysis model estimates, coefficients, variances, diagnostics
4. **FIGURE DATA OUTPUTS** -- aggregated data points enabling pooled-figure construction without individual data

## Diagnostic-output canonical names

| Filename | Subfolder | Contents |
|----------|-----------|----------|
| `cohort_summary.csv` | `diagnostics/` | Merged QC + analytic cohort summary across all data files |
| `missingness_raw.csv` | `diagnostics/` | Per-variable missingness BEFORE exclusions (severity-flagged) |
| `missingness_analytic.csv` | `diagnostics/` | Per-variable missingness on the analytic dataset (post-exclusion, post-derivation), with `expected_missing` flag for structural NAs |
| `exclusion_waterfall.csv` | `diagnostics/` | N at each exclusion step (raw load -> filters -> joins -> complete-case) |
| `site_metadata.csv` | `diagnostics/` | Site-level metadata used for pooled-analysis stratification (n hospitalizations, n hospitals, single-hospital flag, covariate-availability flags) |

## Table-output canonical names

| Filename | Subfolder | Contents |
|----------|-----------|----------|
| `table1_cohort_characteristics.csv` | `tables/` | Demographic / clinical characteristics overall and by exposure/delivery group |
| `delivery_rates_by_<unit>.csv` | `tables/` | Exposure or delivery rates by hospital / region / period |
| `<endpoint>_descriptive.csv` | `tables/` | Endpoint-specific descriptive statistics (median, IQR, percentile spikes) overall and by group |
| `<unit>_characteristics.csv` | `tables/` | Hospital-level / region-level summary used as input to higher-level analyses |

## Model-output canonical names (Analysis N)

Per analysis, expect one or more of:

| Filename | Subfolder | Contents |
|----------|-----------|----------|
| `A<N>_<sub>_<part>_coefs.csv` | `models/a<N>/` | Fixed-effect estimates (OR / HR / IRR / sHR), 95% CI, SE, z, p-value; key exposures highlighted |
| `A<N>_<sub>_<part>_re_variance.csv` | `models/a<N>/` | Random-effect variance, SD, ICC; convergence; n clusters contributing |
| `A<N>_<sub>_<part>_overdispersion.csv` | `models/a<N>/` | Pearson chi-square / df ratio; flag if > 1.5 |
| `A<N>_cumulative_incidence.csv` | `models/a<N>/` | Time-point CIF estimates by group (Fine-Gray, Aalen-Johansen) |
| `A<N>_sensitivity_coefs.csv` | `models/a<N>/` | Coefficients across sensitivity exposure-definition variants |

`<sub>` denotes the model class (`dt` for discrete-time logistic, `cox`, `fg` for Fine-Gray, `part1`/`part2` for two-part, `mortality`, `icu_los`, `nb` for negative binomial, `glmm` for mixed model). `<part>` is `primary` or `secondary` or a sensitivity tag.

## Figure-data canonical names

| Filename | Subfolder | Contents |
|----------|-----------|----------|
| `A<N>_fig_cif_curves.csv` | `figures/a<N>/` | CIF time points + estimates + SE for pooled survival/competing-risk plots |
| `A<N>_fig_<endpoint>_distribution.csv` | `figures/a<N>/` | 1st-99th percentile points of an endpoint by group, in 1-percentile increments |
| `A<N>_fig_<endpoint>_by_<unit>.csv` | `figures/a<N>/` | Per-unit aggregated points (hospital, region, time period) for caterpillar / funnel plots |

## Required columns in MODEL coefs files

Every `*_coefs.csv` should contain at minimum:

- `term` -- name of the covariate/exposure
- `estimate` -- point estimate (OR / HR / IRR / sHR depending on model)
- `estimate_type` -- `OR`, `HR`, `IRR`, `sHR`, `beta`
- `ci_lower` / `ci_upper` -- 95% CI bounds
- `se` -- standard error
- `z` -- test statistic
- `p_value`
- `is_primary_exposure` -- 0/1 flag for the key exposure(s)
- `model_label` -- which sensitivity variant (`primary`, `4S1`, `4S2`, etc.); enables stacking sensitivity rows

## Required columns in random-effects variance files

- `cluster_term` -- name of the random-effect term (e.g., `hospital_id`)
- `variance` -- estimated variance
- `sd` -- estimated SD
- `icc` -- intra-class correlation
- `model_type` -- `glmer`, `glmmTMB`, fallback flag
- `convergence_warning` -- 0/1
- `n_clusters` -- number of clusters contributing

## Filename rules (block-level)

- All output filenames are lowercase, underscore-separated, end in `.csv` (or `.parquet` if explicitly approved by the coordinating center)
- Every analysis-level output starts with `A<N>_` where N is the analysis number from `01-overview.csv`
- Diagnostic and table outputs do NOT carry an `A<N>_` prefix
- Site-prefixing (`SITE_<id>_`) is applied AT WRITE TIME by the analysis script using the site identifier from the stack profile, NOT in the catalog

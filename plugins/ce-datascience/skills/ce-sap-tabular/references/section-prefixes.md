# Section / subfolder / prefix conventions

These conventions match the structure stats teams use in real multi-site studies (mirroring the SBTSAP layout). The `02-outputs.csv` catalog enforces them; `ce-work` reads them when generating per-output tasks.

## Subfolder layout under `analysis/output/` (or whatever `output_root` is in the stack profile)

```
analysis/output/
  diagnostics/                      # cohort QC, missingness, exclusion waterfall
    cohort_summary.csv
    missingness_raw.csv
    missingness_analytic.csv
    exclusion_waterfall.csv
    site_metadata.csv
  tables/                           # manuscript-ready descriptive tables
    table1_cohort_characteristics.csv
    delivery_rates_by_hospital.csv
    ...
  models/
    a3/                             # Analysis 3 (one folder per analysis)
      A3_dt_primary_coefs.csv
      A3_dt_primary_re_variance.csv
      A3_cox_secondary_coefs.csv
      A3_fg_secondary_coefs.csv
      A3_fg_cumulative_incidence.csv
      A3_sensitivity_coefs.csv
    a4/
      A4_part1_alive28d_coefs.csv
      A4_part2_vfd_survivors_coefs.csv
      A4_vfd28_descriptive.csv
      A4_sensitivity_coefs.csv
    a5/
      A5_icu_los_coefs.csv
      A5_icu_los_overdispersion.csv
      A5_mortality_coefs.csv
      A5_sensitivity_coefs.csv
  figures/
    a3/
      A3_fig_cif_curves.csv
    a4/
      A4_fig_vfd_distribution.csv
    a5/
      A5_fig_los_distribution.csv
```

## Prefix rules

| Pattern | Where | Example |
|---------|-------|---------|
| `A<N>_` | model + figure outputs | `A3_dt_primary_coefs.csv` |
| (no prefix) | diagnostic + table outputs | `cohort_summary.csv` |
| `SITE_<id>_` | applied at write time, not in catalog | runtime: `SITE_01_A3_dt_primary_coefs.csv` |

The SITE prefix is applied by the analysis script using the site identifier from the stack profile. The catalog records the unprefixed name. This keeps the catalog portable across sites.

## Analysis-number convention

`<N>` in `A<N>` and `models/a<N>/` matches the analysis number from `01-overview.csv`, which in turn matches the SAP-5.N section in the prose SAP. Rule: there is exactly one `<N>` per analysis, applied consistently across overview / outputs / variables / output paths.

## Filename token order

```
A<N>_<model_class>_<part>_<artifact_type>.csv
```

Where:

- `<N>` -- analysis number (3, 4, 5, ...)
- `<model_class>` -- `dt` (discrete-time), `cox`, `fg` (Fine-Gray), `part1` / `part2`, `mortality`, `icu_los`, `nb`, `glmm`
- `<part>` -- `primary`, `secondary`, or a sensitivity tag like `s1`, `s2`
- `<artifact_type>` -- `coefs`, `re_variance`, `overdispersion`, `cumulative_incidence`, `descriptive`, `fig_<plot_type>`

Some analyses naturally collapse parts: `A5_mortality_coefs.csv` does not need a `_part_` because mortality is a single-output analysis.

## Figure-data filename pattern

```
A<N>_fig_<plot_type>_<grouping>.csv
```

Examples: `A3_fig_cif_curves.csv`, `A4_fig_vfd_distribution.csv`, `A6_fig_caterpillar_by_hospital.csv`.

The leading `A<N>_fig_` makes it trivial to grep all figure inputs for a given analysis when assembling the manuscript.

## Don't do

- Don't put model output in `tables/`; reviewers expect descriptive tables there
- Don't mix analyses in one folder (`models/a3a4/` is wrong; one folder per analysis)
- Don't apply the SITE prefix in the catalog rows; it is runtime-only
- Don't name files with hyphens; use underscores (consistent with R/Python column-naming conventions)

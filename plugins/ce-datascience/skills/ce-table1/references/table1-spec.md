# Table 1 Specification

The Table 1 shell is a contract between the SAP, analyst, and manuscript package. It records which baseline variables belong in the table and how each row should be summarized.

## Required Fields

| Field | Meaning |
|---|---|
| `variable` | Variable name from the SAP variables catalog |
| `category` | Variable category such as Patient Characteristic or Clinical Characteristic |
| `description` | Plain-language row label |
| `type` | The catalog's `Type` value as recorded (ce-plan catalogs use Fixed / Time-varying; Time-varying rows are excluded). Summary form: continuous rows use mean (SD) when approximately symmetric and median (IQR) when skewed, as declared in the catalog or SAP; 0/1 or listed levels use No. (%) |
| `levels` | Declared levels for categorical variables |
| `source_catalog` | Repo-relative path to the variables catalog |
| `style_profile` | Publication style profile used for display rules |
| `strata` | Stratification variable(s) passed with `--strata` (empty list when none was declared) |
| `design` | `rct`, `observational`, or `descriptive` from `--design` (null when undeclared) |
| `comparison_column` | `abs_smd` for stratified observational tables; null otherwise (randomized trials never get baseline tests) |
| `disclosure_floor` | `suppress_below_n` (default 11) applied to every stratified cell |

## Refusal Conditions

- The variables catalog is not available (ask the user for the baseline variable list).
- The variables catalog has no fixed baseline, patient, clinical, demographic, or cohort-characteristic rows (exposure and time-varying rows never count).
- The `--style-profile` is not defined in `references/journal-style-profiles.yaml`.
- Requested output paths would be absolute or traverse outside the project.

## Disclosure Constraint (all data sources)

Table 1 output is aggregate-only everywhere: do not write patient-level extracts to `analysis/publication/` or review-pack directories, regardless of data source. Apply small-cell suppression (default n<11 unless the project declares its own floor, for example the CLIF consortium floor of n>=10, or a site or DUA rule is stricter) to every stratified cell, including complementary cells recoverable by subtraction.

## CLIF Constraint

When CLIF mode is additionally active, write the aggregate-only output to `output/final_no_phi/`. Do not write patient-level extracts to `output/final_no_phi/`.

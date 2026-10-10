# Table 1 Specification

The Table 1 shell is a contract between the SAP, analyst, and manuscript package. It records which baseline variables belong in the table and how each row should be summarized.

## Required Fields

| Field | Meaning |
|---|---|
| `variable` | Variable name from the SAP variables catalog |
| `category` | Variable category such as Patient Characteristic or Clinical Characteristic |
| `description` | Plain-language row label |
| `type` | The catalog's `Type` value as recorded (ce-plan catalogs use Fixed / Time-varying; the summary form comes from `levels`: Continuous -> median (IQR), 0/1 or listed levels -> No. (%)) |
| `levels` | Declared levels for categorical variables |
| `source_catalog` | Repo-relative path to the variables catalog |
| `style_profile` | Publication style profile used for display rules |
| `strata` | Stratification variable(s) passed with `--strata` (empty list when none was declared) |
| `disclosure_floor` | `suppress_below_n` (default 11) applied to every stratified cell |

## Refusal Conditions

- The variables catalog is not available (ask the user for the baseline variable list).
- The variables catalog has no baseline, patient, clinical, demographic, exposure, or cohort-characteristic rows.
- Requested output paths would be absolute or traverse outside the project.

## Disclosure Constraint (all data sources)

Table 1 output is aggregate-only everywhere: do not write patient-level extracts to `analysis/publication/` or review-pack directories, regardless of data source. Apply small-cell suppression (default n<11 unless the project declares its own floor, for example the CLIF consortium floor of n>=10, or a site or DUA rule is stricter) to every stratified cell, including complementary cells recoverable by subtraction.

## CLIF Constraint

When CLIF mode is additionally active, write the aggregate-only output to `output/final_no_phi/`. Do not write patient-level extracts to `output/final_no_phi/`.

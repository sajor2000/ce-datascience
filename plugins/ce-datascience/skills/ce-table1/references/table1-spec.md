# Table 1 Specification

The Table 1 shell is a contract between the SAP, analyst, and manuscript package. It records which baseline variables belong in the table and how each row should be summarized.

## Required Fields

| Field | Meaning |
|---|---|
| `variable` | Variable name from the SAP variables catalog |
| `category` | Variable category such as Patient Characteristic or Clinical Characteristic |
| `description` | Plain-language row label |
| `type` | Numeric, categorical, binary, date, or text |
| `levels` | Declared levels for categorical variables |
| `source_catalog` | Repo-relative path to the variables catalog |
| `style_profile` | Publication style profile used for display rules |

## Refusal Conditions

- No SAP and no variables catalog are available.
- The variables catalog has no baseline, patient, clinical, demographic, exposure, or cohort-characteristic rows.
- Requested output paths would be absolute or traverse outside the project.

## CLIF Constraint

When CLIF mode is active, Table 1 output must be aggregate-only in `output/final_no_phi/`. Do not write patient-level extracts to `output/final_no_phi/`, `analysis/publication/`, or review-pack directories.

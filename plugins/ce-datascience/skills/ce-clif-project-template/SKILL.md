---
name: ce-clif-project-template
description: "Initialize or audit a CLIF project against the official CLIF Project Template with version, PHI, and output safeguards."
argument-hint: "[init <empty-directory> | audit [project-directory]] [--version 2.1.0|3.0.0]"
---

# CLIF Project Template

## Skill Value

- **Problem it solves:** New CLIF projects need a consistent, consortium-readable structure without accidentally copying PHI, weakening output controls, or mixing dictionary families.
- **Use when:** Creating a new CLIF analysis repository from the official template or auditing an existing template-derived project.
- **Output:** An initialized project skeleton or a structural audit with explicit readiness and remediation findings.
- **Ask only if:** The requested destination, CLIF/mCIDE family, or intent to replace a non-empty directory is ambiguous.
- **Do not do:** Do not clone into a non-empty directory, copy clinical tables, infer a CLIF version, or place row-level data in shared output paths.

Use the official [CLIF Project Template](https://github.com/Common-Longitudinal-ICU-data-Format/CLIF-Project-Template) as the project-layout source. Treat [clif-icu.com](https://clif-icu.com/) and `ce-clif` as authoritative for the selected data-dictionary and mCIDE family.

## Route

- `init <empty-directory>` creates a new local project from the official GitHub template only after the target is confirmed empty and the CLIF family is selected through `ce-clif --version` or a matching declared project source.
- `audit [project-directory]` inspects a local project without modifying it. When omitted, audit the current repository.

## Initialize

1. Invoke `ce-clif` and require a single selected CLIF/mCIDE family. Do not initialize on an unknown or mixed version.
2. Confirm the destination is an explicit empty directory. If it is non-empty, stop and require a new location; never merge template files into an existing project.
3. Use GitHub's template mechanism or a shallow clone of `Common-Longitudinal-ICU-data-Format/CLIF-Project-Template`; retain its Apache-2.0 license and remove any demo data before the first project commit.
4. Create the template structure: `code/`, `config/`, `guides/`, `utils/`, `output/final_no_phi/`, and `output/intermediate_phi/`. Keep `config/config.json` site-local and gitignored; it may name a registered source location but must not contain credentials.
5. Replace placeholders in the project README with selected CLIF version, objective, required tables and fields, cohort definition, expected aggregate outputs, language environment, and run instructions. Record required tables from the approved study/SAP; do not invent fields or categories.
6. Keep the three-script analysis convention: QC, cohort, and analysis. Use Parquet inputs and UTC `*_dttm` fields. R uses `renv` and `arrow::open_dataset()`; Python uses the project's managed environment and `clifpy` only when it is declared as a dependency.
7. Make `output/intermediate_phi/` local-only. `output/final_no_phi/` accepts aggregate results only: no patient or hospitalization identifiers, no row-level records, no raw CSV/Parquet, and no reported cell smaller than 10.

## Audit

Check and report each item as pass, warning, or block:

- README has an explicit CLIF version, objective, required table/field rationale, cohort criteria, expected outputs, and environment/run instructions.
- `config/config.json` is excluded from Git and contains no secrets or PHI samples.
- Required structure and separate PHI/intermediate versus final aggregate output paths exist.
- Code follows QC -> cohort -> analysis ownership, uses Parquet and timezone-aware UTC datetimes, and does not write patient-level content under final outputs.
- Output guidance requires aggregate-only sharing and minimum cell size 10.
- Any edit to CLIF protected paths remains subject to `ce-clif` POC approval.

An audit does not certify data quality, cohort validity, disclosure safety, or consortium approval. Route those questions to `ce-data-qa`, the study SAP, `ce-review-pack`, and the responsible CLIF POC.

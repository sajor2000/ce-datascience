---
name: ce-table1
description: "Generate publication-ready Table 1 baseline-characteristics artifacts from a SAP, tabular SAP variables catalog, stack profile, and journal style profile. Produces traceable CSV/Markdown shells and validation reports without inventing missing variables or cohorts. Use when the user asks for Table 1, baseline characteristics, demographic table, descriptive cohort table, or manuscript-ready participant characteristics."
argument-hint: "[optional: --variables analysis/sap-tables/03-variables.csv --out-dir analysis/publication/tables --style-profile jama]"
---

# Table 1 Generator

Create a publication-ready Table 1 shell from declared study artifacts. This skill does not compute statistics from raw data unless the user supplies an explicit analysis dataset and asks for that implementation; the default is a traceable table specification and shell that the analyst can verify.

## Inputs

Prefer these project-local files:

- `analysis/sap.md`
- `analysis/sap-tables/03-variables.csv`
- `analysis/sap-tables/02-outputs.csv`
- `plugins/ce-datascience/shared/journal-style-profiles.yaml` when working from source; after install, use the bundled shared profile data available in the plugin package.

If the variables catalog is missing, ask the user for the baseline variable list. Do not invent variables from a vague manuscript request.

## Workflow

1. Resolve the variables catalog, outputs catalog, output directory, and style profile. Default style profile is `jama` unless the project config names another profile.
2. Run:

```bash
python3 scripts/generate_table1.py --variables analysis/sap-tables/03-variables.csv --out-dir analysis/publication/tables --style-profile jama
```

3. Review the generated validation report before presenting the table as ready.
4. If CLIF mode is active, confirm the output remains aggregate-only and never writes patient-level rows under `output/`.

## Outputs

- `table1-spec.json` -- structured variables, strata, style profile, and readiness state
- `table1.csv` -- editable table shell
- `table1.md` -- Markdown table shell for manuscripts and review packs
- `table1-validation-report.md` -- blockers, warnings, and provenance

## Readiness Rules

- Block when no baseline variables are declared.
- Warn when no stratification variable is declared.
- Warn when no SAP path is provided.
- Preserve repo-relative paths in all generated artifacts.
- Use the configured journal style profile for formatting expectations.

## References

@./references/table1-spec.md

@./references/jama-table-rules.md

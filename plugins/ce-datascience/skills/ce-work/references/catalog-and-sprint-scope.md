# Tabular Catalog and Sprint Scope

Load this when `analysis/sap-tables/02-outputs.csv` or `analysis/sprint-log.yaml` exists. Apply both sections that match before building the task list.

## Tabular-catalog tasks

When `analysis/sap-tables/02-outputs.csv` (produced by `ce-sap-tabular`) exists:

- Seed the task list with one task per output row, excluding section banner rows (only the first cell populated) and legacy section-header rows.
- Accept both current biostatistics workbook labels and legacy normalized labels:
  - output file = `Output File (SITE_ID_ prefix added automatically)` or `output_file`
  - location = `Subfolder` or `subfolder`
  - owning analysis = `Script Section` or `analysis_section`
  - expected meaning = `Interpretation` or `interpretation`
- Refuse to mark a catalog-driven task complete until the expected output file exists at the expected subfolder path.

Without the catalog, prose SAP tracking applies unchanged.

## Open sprint scope

Read `analysis/sprint-log.yaml`. If a sprint has `status: open`, its `scope` list is a hard scope filter:

- Refuse edits to files whose owning SAP section is not in the open sprint's scope.
- Refuse to add tasks outside scope.
- Print one banner before the task list: `[sprint:<name> reviewer:<reviewer> scope:<sap-ids>]`.

When no sprint is open (status absent, closed, or no sprint log), behavior is unchanged.

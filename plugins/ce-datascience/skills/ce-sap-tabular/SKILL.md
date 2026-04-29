---
name: ce-sap-tabular
description: 'Generates a structured 5-table tabular companion (overview, outputs catalog, variables catalog, long-format sample, wide-format sample) to the prose SAP and emits both CSVs and a styled .xlsx. The catalog drives /ce-work task seeding (one task per row) and gates /ce-sprint scope (only catalogued outputs are in-scope). Use whenever the user mentions SAP companion table, tabular SAP, output catalog, variables catalog, "make me a programmer-handoff sheet for the SAP", "lock down the output inventory", section-banner highlighting, or finishes /ce-plan SAP and is heading to /ce-sprint or /ce-work. Use AFTER the prose SAP exists and BEFORE any analysis code runs — the catalog is the contract /ce-work executes against. Refuses to run when no SAP exists.'
argument-hint: "[study slug, e.g. sbt-validation]"
---

# Tabular SAP Companion

The prose SAP narrates methods; this skill generates the **executable inventory**: which analyses exist, which artifacts each one produces, which variables each one consumes, and what the data files look like. The output mirrors the structure of a real-world stats-team SAP (5 sheets: Overview, Outputs, Master Variables, File 1 Long, File 2 Wide), so a programmer can implement against it row-by-row and a coordinating center can audit it cell-by-cell.

## When This Skill Activates

- The prose SAP at `analysis/sap.md` is at draft or final status
- An analyst is about to start writing analysis code and wants a rowwise inventory
- A multi-site study needs a coordinating-center-friendly artifact catalog
- The PI has asked "what files will each analysis produce, and in what folder?"

## Prerequisites

- `analysis/sap.md` exists (the prose SAP) -- the tabular companion seeds from it
- The user can articulate, for each analysis: claim type, unit of analysis, file shape (long / wide), main method, and 1-line research question
- Optional but encouraged: `python3 -m pip show openpyxl` succeeds, so the skill can also emit a single `.xlsx` workbook (the format the stats team actually opens)

## Core Workflow

### Step 1: Resolve the study slug

The argument is the study slug (e.g., `sbt-validation`). Output goes to `analysis/sap-tables/`. The slug is recorded in the file headers so re-generation does not overwrite a different study's tables in the same workspace.

### Step 2: Seed from the prose SAP

Read `analysis/sap.md` and extract:

- Title (from `# Statistical Analysis Plan: <Title>`)
- One row per analysis from `SAP-5.x` (Statistical Methods) sections; the SAP section ID becomes the analysis number
- Population definition from SAP-2.2 / SAP-4.1
- Endpoint list from SAP-3
- Variable hints from SAP-5 method specifications (covariates named there)

If the prose SAP is thin, prompt the user for the missing fields rather than inventing them.

### Step 3: Build the 5 tables

Walk the user through each table. The skill generates the CSV (and an .xlsx workbook combining all 5 sheets when `openpyxl` is available).

#### Table 1: `01-overview.csv` (Analysis × Claim × Methods)

One row per analysis. Columns:

| Column | Content |
|--------|---------|
| analysis_number | `2`, `3`, `4`, ... (corresponds to SAP-5.N) |
| analysis_name | Short label (e.g., "Time to extubation") |
| claim | Claim being tested: criterion validity / construct validity / hospital benchmarking / external validity / etc. |
| unit_of_analysis | ventilator-day / patient / hospital / day / encounter |
| file_shape | long / wide / mixed |
| analysis_question | One-sentence question (e.g., "When SBT/SAT applied, do patients get off vent faster?") |
| main_methods | Primary statistical method (mixed-effects logistic, ZTNB, Cox, Fine-Gray, etc.) |
| secondary_methods | If applicable (sensitivity, alternate model) |
| site_outputs | Which output files this analysis produces (semi-colon separated, references row IDs in 02-outputs.csv) |

#### Table 2: `02-outputs.csv` (Artifact catalog)

One row per artifact. Group rows by section in this order: DIAGNOSTIC OUTPUTS, TABLE OUTPUTS, MODEL OUTPUTS, FIGURE DATA OUTPUTS. Columns:

| Column | Content |
|--------|---------|
| output_file | Filename pattern with `SITE_ID_` prefix slot (e.g., `A3_dt_primary_coefs.csv`) |
| subfolder | One of: `diagnostics/`, `tables/`, `models/a<N>/`, `figures/a<N>/` |
| dataset_cohort_scope | Which dataframe / cohort the output is built from |
| analysis_section | "Analysis 3.1 - Primary: Discrete-Time Logistic" or "Diagnostic" or "Table - general" |
| contents | Plain-English description of what the file contains (variables, statistics, formats) |
| role_in_pooled_analysis | What the coordinating center / pooled-analysis layer does with this output |
| interpretation | 1-2 sentence "what this result might mean" -- the analyst commits to expected direction BEFORE running |

The `interpretation` column is the most important. It forces a pre-registered expectation, so when results arrive they can be compared to it ("expected OR > 1; got 0.85; investigate").

#### Table 3: `03-variables.csv` (Master variables)

One row per variable. Columns:

| Column | Content |
|--------|---------|
| category | Outcome / Exposure / Patient Characteristic / Clinical Characteristic / Cluster / ID / Derivation Helper |
| variable | Variable name as it appears in the data (e.g., `SAT_delivered_primary`) |
| description | Plain-English description |
| type | Fixed / Time-varying |
| levels | 0/1, integer, numeric, categorical {A,B,C}, date, etc. |
| file | File 1 / File 2 / Both |
| `analysis_<N>` | One column per analysis; `✓` if used, blank if not |
| notes | Free-form, especially for TBD operationalization decisions |

The per-analysis `✓` columns make it instantly visible which variables drive which analyses, and which analyses share covariate sets.

#### Table 4: `04-file1-long-sample.csv` (Long-format example)

A 5-15 row example of the long-format data file. Columns are the variables flagged `File 1` in Table 3. The sample data are SYNTHETIC; this is documentation, not data. Color-code (or annotate) rows in the corresponding `.xlsx` sheet to show: extubation events, deaths, missing-flowsheet rows, censored rows.

#### Table 5: `05-file2-wide-sample.csv` (Wide-format example)

A 3-10 row example of the wide-format (one row per patient or per hospitalization). Columns are the variables flagged `File 2` in Table 3.

### Step 4: Generate the workbook

Run `scripts/generate-tabular-sap.py` with the 5 CSVs as inputs. The script writes `analysis/sap-tables/<slug>-tabular-sap.xlsx` with each CSV as a separate sheet, freezes header rows, sets column widths, applies bold to header rows, and color-codes the section header rows in `02-outputs.csv` (DIAGNOSTIC / TABLE / MODEL / FIGURE).

If `openpyxl` is not installed, the script exits 0 with a message; the CSVs alone are a valid output.

### Step 5: Validate against the prose SAP

Run a cross-reference check:

- Every `SAP-5.N` analysis in `analysis/sap.md` must appear as a row in `01-overview.csv` (and vice versa)
- Every output file in `02-outputs.csv` must reference an analysis number that exists in `01-overview.csv`
- Every variable in `03-variables.csv` flagged as used by an analysis must appear in the corresponding analysis's covariate list in the prose SAP (warn, don't block)
- File names in `02-outputs.csv` must follow the `A<N>_*.csv` pattern (block on violation)

Print a validation summary; refuse to write the .xlsx workbook if blocking violations remain.

### Step 6: Cross-link from the prose SAP

If `analysis/sap.md` does not yet have SAP-12 (Output Catalog) and SAP-13 (Variable Catalog) cross-references, append them:

```markdown
## SAP-12: Output Catalog

The full per-artifact inventory lives in `analysis/sap-tables/02-outputs.csv` (also rendered in the multi-sheet workbook `analysis/sap-tables/<slug>-tabular-sap.xlsx`). Every output file in the catalog must trace back to a SAP-N.M analysis section. Programmers implement against the catalog row-by-row.

## SAP-13: Variable Catalog

The variable-by-analysis matrix lives in `analysis/sap-tables/03-variables.csv`. Use it to verify which variables drive which analyses and which covariate sets are shared across analyses.
```

### Step 7: Print summary

```
Tabular SAP companion generated for <slug>:
  Analyses:        N
  Output artifacts: M  (D diagnostic / T table / Mo model / F figure)
  Variables:       V

Files:
  analysis/sap-tables/01-overview.csv
  analysis/sap-tables/02-outputs.csv
  analysis/sap-tables/03-variables.csv
  analysis/sap-tables/04-file1-long-sample.csv
  analysis/sap-tables/05-file2-wide-sample.csv
  analysis/sap-tables/<slug>-tabular-sap.xlsx   (when openpyxl available)

Cross-link added to analysis/sap.md (SAP-12, SAP-13).

Next: run /ce-work; the task list will be seeded from 02-outputs.csv with one task per artifact.
```

## Pipeline mode

In `mode:headless`, the skill writes the 5 CSVs + .xlsx and emits `__CE_SAP_TABULAR_GENERATED__ slug=<slug> outputs=<M>`. No prompts, no validation prose; failures are emitted as `__CE_SAP_TABULAR_FAIL__ reason=<reason>`.

## What This Skill Does NOT Do

- **It does not invent the analysis content.** The analyst describes each row; the skill provides structure and validates it.
- **It does not replace the prose SAP.** The two are companions; one narrates methods, one inventories artifacts.
- **It does not produce the artifacts themselves.** The catalog declares; `/ce-work` produces.
- **It does not include real subject data.** File 1 / File 2 samples are synthetic and clearly marked as such.

## References

@./references/output-catalog-template.md

@./references/section-prefixes.md

@./references/variable-categories.md

---
name: ce-sap-tabular
description: "Generate a biostatistics-style tabular SAP companion workbook with Overview, Outputs, Master Variables, and optional sample sheets."
argument-hint: "[study slug, e.g. sbt-validation]"
---

# Tabular SAP Companion


## Skill Value

- **Problem it solves:** Prose SAPs do not give programmers a concrete output inventory or variable contract.
- **Use when:** The user has a prose SAP and needs programmer handoff sheets, output catalog, variable catalog, or workbook contract.
- **Output:** CSV sheets and styled .xlsx workbook under the SAP tables/output location.
- **Ask only if:** Only when SAP content lacks analysis rows, outputs, variable definitions, or file-shape assumptions.
- **Do not do:** Do not invent analyses, variables, or outputs missing from the SAP.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

The prose SAP narrates methods; this skill generates the **executable inventory**: which analyses exist, which artifacts each one produces, which variables each one consumes, and what the data files look like. The output mirrors the structure of a real-world stats-team SAP workbook: three core sheets (`Overview`, `Outputs`, `Master Variables`) plus optional synthetic file-shape sample sheets when useful. A programmer should be able to implement against it row-by-row and a coordinating center should be able to audit it cell-by-cell.

## When This Skill Activates

- The prose SAP at `analysis/sap.md` is at draft or final status
- An analyst is about to start writing analysis code and wants a rowwise inventory
- A multi-site study needs a coordinating-center-friendly artifact catalog
- The PI has asked "what files will each analysis produce, and in what folder?"

## Prerequisites

- `analysis/sap.md` exists (the prose SAP) -- the tabular companion seeds from it
- The user can articulate, for each analysis: claim type, unit of analysis, data file(s), primary method, secondary methods, 1-line research question, and expected site script
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

### Step 3: Build the core workbook tables

Walk the user through each table. The skill generates CSVs and an `.xlsx` workbook combining the three core sheets, with optional synthetic sample sheets when `04-file1-long-sample.csv` or `05-file2-wide-sample.csv` exists.

#### Table 1: `01-overview.csv` (Analysis × Claim × Methods)

One row per analysis. Use these exact column names because they mirror a biostatistics handoff workbook:

| Column | Content |
|--------|---------|
| Analysis | Numbered analysis label, e.g. `2 - Criterion Validity`, `3 - Time to Extubation`, `SA - Age <65 Subgroup` |
| Claim | Claim being tested: criterion validity / construct validity / hospital benchmarking / external validity / sensitivity / etc. |
| Unit of Analysis | Ventilator-day / hospitalization / patient / hospital / day / encounter |
| Data File(s) | File shape and source, e.g. `File 1 (Long): one row per patient per ventilator day; File 2 (Wide): one row per hospitalization` |
| Analysis Question | One-sentence question, e.g. "When SBT/SAT applied, do patients get off vent faster?" |
| Primary Method | Primary statistical method (mixed-effects logistic, ZTNB, Cox, Fine-Gray, two-part model, etc.) |
| Secondary Methods | Sensitivity, alternate model, fallback, or "None" |
| Site Script | Expected implementation script, e.g. `ABTRISE_345_outcomes.R` or `analysis_03_time_to_event.py` |

#### Table 2: `02-outputs.csv` (Artifact catalog)

One row per artifact. Group rows by visible section-banner rows, where column 1 contains a banner such as `SETUP / DIAGNOSTICS | ABTRISE_00_setup.R` and the remaining cells are blank. Legacy CSVs with a first `section` column are still accepted, but the workbook-native banner-row format is preferred. Columns:

| Column | Content |
|--------|---------|
| Output File (SITE_ID_ prefix added automatically) | Filename pattern without hard-coding a site prefix, e.g. `A3_dt_primary_coefs.csv` |
| Subfolder | One of: `diagnostics/`, `tables/`, `models/a<N>/`, `figures/a<N>/`, or a justified project-specific subfolder |
| Dataset / Cohort Scope | Which dataframe / cohort the output is built from |
| Script Section | "Analysis 3.1 - Primary: Discrete-Time Logistic" or "Diagnostic" or "Table - general" |
| Contents | Plain-English description of what the file contains (variables, statistics, formats) |
| Role at Coordinating Center | What the coordinating center / pooled-analysis layer does with this output |
| Interpretation | 1-2 sentence pre-result expectation: what this result should mean and what direction or pattern would support the claim |

The `interpretation` column is the most important. It forces a pre-registered expectation, so when results arrive they can be compared to it ("expected OR > 1; got 0.85; investigate").

#### Table 3: `03-variables.csv` (Master variables)

One row per variable. Use title-cased workbook columns and analysis flags (`A2`, `A3`, `A4`, etc.) so the matrix is readable in Excel:

| Column | Content |
|--------|---------|
| Category | Outcome / Exposure / Patient Characteristic / Clinical Characteristic / Cluster / ID / Derivation Helper |
| Variable | Variable name as it appears in the data, e.g. `SAT_delivered_primary` |
| Description | Plain-English description |
| Type | Fixed / Time-varying |
| Format / Values | 0/1, integer, numeric range, categorical level set, date/datetime format, units, or expected scale |
| File | File 1 / File 2 / File 3 / Both |
| `A<N>` | One column per analysis; `✓` if used, blank if not |
| Notes | Optional free-form notes, especially for TBD operationalization decisions |

The per-analysis `✓` columns make it instantly visible which variables drive which analyses, and which analyses share covariate sets.

#### Optional Table 4: `04-file1-long-sample.csv` (Long-format example)

A 5-15 row example of the long-format data file. Columns are the variables flagged `File 1` in Table 3. The sample data are SYNTHETIC; this is documentation, not data. Color-code (or annotate) rows in the corresponding `.xlsx` sheet to show: extubation events, deaths, missing-flowsheet rows, censored rows.

#### Optional Table 5: `05-file2-wide-sample.csv` (Wide-format example)

A 3-10 row example of the wide-format (one row per patient or per hospitalization). Columns are the variables flagged `File 2` in Table 3.

### Step 4: Generate the workbook

Run `python3 scripts/generate-tabular-sap.py <slug> analysis/sap-tables analysis/sap-tables/<slug>-tabular-sap.xlsx` after creating the CSVs. The script writes `analysis/sap-tables/<slug>-tabular-sap.xlsx` with each CSV as a separate sheet, freezes header rows, sets column widths, applies bold to header rows, and color-codes the section header rows in `02-outputs.csv` (SETUP / DIAGNOSTICS, TABLE, MODEL, FIGURE, SUBGROUP / SENSITIVITY). Optional file sample sheets are rendered only when their CSVs exist.

If `openpyxl` is not installed, the script exits 0 with a message; the CSVs alone are a valid output.

### Step 5: Validate against the prose SAP

Run a cross-reference check:

- Every `SAP-5.N` analysis in `analysis/sap.md` must appear as a row in `01-overview.csv` and must have a stable `A<N>` flag column in `03-variables.csv`
- Every analysis-level output file in `02-outputs.csv` must reference an analysis ID that exists in `01-overview.csv`
- Every variable in `03-variables.csv` flagged as used by an analysis must appear in the corresponding analysis's covariate list in the prose SAP (warn, don't block)
- Analysis-level file names in `02-outputs.csv` must follow the `A<N>_*.csv` pattern (block on violation); diagnostics and general tables may omit the `A<N>_` prefix

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
  analysis/sap-tables/04-file1-long-sample.csv   (optional synthetic sample)
  analysis/sap-tables/05-file2-wide-sample.csv   (optional synthetic sample)
  analysis/sap-tables/<slug>-tabular-sap.xlsx   (when openpyxl available)

Cross-link added to analysis/sap.md (SAP-12, SAP-13).

Next: Load the `ce-work` skill; the task list will be seeded from 02-outputs.csv with one task per artifact.
```

## Pipeline mode

In `mode:headless`, the skill writes the core CSVs + `.xlsx` and emits `__CE_SAP_TABULAR_GENERATED__ slug=<slug> outputs=<M>`. No prompts, no validation prose; failures are emitted as `__CE_SAP_TABULAR_FAIL__ reason=<reason>`.

## What This Skill Does NOT Do

- **It does not invent the analysis content.** The analyst describes each row; the skill provides structure and validates it.
- **It does not replace the prose SAP.** The two are companions; one narrates methods, one inventories artifacts.
- **It does not produce the artifacts themselves.** The catalog declares; `ce-work` produces.
- **It does not include real subject data.** File 1 / File 2 samples are synthetic and clearly marked as such. Never paste real patient-level rows, identifiers, or dates into the catalog. When a catalog row declares a stratified output, note the project's small-cell suppression floor (default n<11 for EHR/claims data, or the site's declared policy) in the row's interpretation so the producing analysis applies it.

## References

`references/example-overview.csv`, `references/example-outputs.csv`, `references/example-variables.csv` — synthetic filled examples of the three core sheets; read them when the shape of a completed workbook is unclear.

@./references/output-catalog-template.md

@./references/section-prefixes.md

@./references/variable-categories.md

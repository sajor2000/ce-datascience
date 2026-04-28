---
name: ce-method-extract
description: 'Extract structured statistical and methodological detail from a PubMed result set produced by /ce-pubmed. For each paper, extract sample size, primary outcome operationalization, statistical methods used, software/package, and reported effect sizes. Output is a comparison table that drops into the SAP justification ("we chose method X because Y comparable studies used it"). Use after /ce-pubmed when planning a SAP and you need to anchor method choices in prior literature.'
argument-hint: "<path/to/pubmed-results.csv>, optional: --full-text-only --max 25"
---

# Method Extraction from Prior Literature

Reads a PubMed result CSV and produces a structured methods-comparison table for the SAP.

## When this skill activates

- After `/ce-pubmed` has produced `analysis/pubmed/<query>-<date>.csv`
- During `/ce-plan` SAP drafting when method choice needs justification
- Before `/ce-power` when you need a prior effect-size estimate

## Prerequisites

- A PubMed result CSV (from `/ce-pubmed`) exists
- For `--full-text-only`, the rows must have non-empty `pmcid` (PMC OAI access)

## Core workflow

### Step 1: Load and prioritize

Read the input CSV. If `--full-text-only`, drop rows without `pmcid`. Sort by year (descending), then by study-type relevance (RCT > prospective cohort > retrospective cohort > case-control > case series). Cap at `--max` (default 25).

### Step 2: Fetch full-text where available

For rows with a `pmcid`:
- `efetch.fcgi?db=pmc&id=<pmcid>&rettype=xml&retmode=xml`
- Extract sections: `<sec sec-type="methods">`, `<sec sec-type="results">`, `<sec sec-type="statistics">`

For rows without PMC: use the abstract from the input CSV as the only source.

### Step 3: Extract structured fields per paper

For each paper, populate:

| Field | Source heuristic |
|-------|------------------|
| `sample_size` | "we enrolled N", "Final analytic cohort comprised N", first table-1 N |
| `primary_outcome` | "primary outcome was X", "primary endpoint", first sentence after "Outcomes" subsection |
| `outcome_type` | continuous / binary / time-to-event / count / ordinal |
| `analysis_population` | ITT / per-protocol / mITT / complete-case / multiple-imputation |
| `statistical_method` | "Cox proportional hazards", "logistic regression", "linear mixed model", etc. |
| `adjustment_set` | covariates listed in the model |
| `software` | R + package name, SAS, Stata, Python+statsmodels/sklearn, etc. |
| `multiplicity_control` | Bonferroni / FDR / hierarchical / none |
| `effect_size_reported` | OR, HR, RR, mean diff, with 95% CI |
| `checklist_followed` | CONSORT / STROBE / TRIPOD / PRISMA / none stated |

Be conservative: if the paper does not state a field, write `not reported` rather than infer.

### Step 4: Write the comparison table

Save to `analysis/pubmed/<query-slug>-methods.csv` with one row per paper. Also write `analysis/pubmed/<query-slug>-methods-summary.md`:

- **Modal method** (most common) per outcome type
- **Method × year** matrix (is the field shifting?)
- **Software × method** matrix (what to install)
- **Effect-size range** (min / median / max) for each commonly-reported metric
- **% of papers stating a checklist** (low % is itself informative)

### Step 5: Emit signal for downstream skills

`__CE_METHOD_EXTRACT__ csv=<path> n=<count> modal_method=<name>`

The modal method becomes the default suggestion for the SAP's analytic method, with the comparison table as the citation.

## What this skill does NOT do

- Does not download PDFs (full-text via PMC only when free)
- Does not score paper quality (use a reporting-checklist tool for that, not a method-extractor)
- Does not pool effect sizes (use `/ce-effect-size`)
- Does not match the study to a checklist (use `/ce-checklist-match`)

## References

@./references/extraction-prompts.md

@./references/method-taxonomy.md

---
name: ce-method-extract
description: "Extracts methods, cohorts, endpoints, models, and assumptions from retrieved papers for SAP justification. Use when literature results need methods grounding."
argument-hint: "<path/to/pubmed-results.csv>, optional: --full-text-only --max 25"
---

# Method Extraction from Prior Literature


## Skill Value

- **Problem it solves:** Plans cite papers but often miss the methods details needed to justify analysis choices.
- **Use when:** The user has PubMed, Paperclip, or literature-search results and needs methods grounding.
- **Output:** Structured methods extraction table with cohort, outcome, model, covariate, and effect-size clues.
- **Ask only if:** Only when source set, extraction fields, or target SAP section is unclear.
- **Do not do:** Do not treat abstracts as full-text evidence when methods are unavailable.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Reads a PubMed result CSV and produces a structured methods-comparison table for the SAP.

## When this skill activates

- After `ce-pubmed` has produced `analysis/pubmed/<query>-<date>.csv`
- During `ce-plan` SAP drafting when method choice needs justification
- Before `ce-power` when you need literature context for the target difference (published effects are typically inflated by publication bias and small-study effects; `ce-power` should justify the target difference as important and/or realistic per DELTA2, Cook et al., BMJ 2018, PMID 30560792)

## Prerequisites

- A PubMed result CSV (from `ce-pubmed`) exists
- For `--full-text-only`, the rows must have non-empty `pmcid` (open PMC full text), or Paperclip must be able to `lookup` the paper

## Evidence access

When this run needs literature, read `references/evidence-access.md` first; never invent a citation, effect size, or guideline item.

- **Look up here:** the full text of each included paper (Methods, Results, statistical-analysis sections, and Table 1) for methods extraction; the CSV abstract is the source only when no lawful full text exists.

## Core workflow

### Step 0: Context inputs (scan chat first)

If no `<path/to/pubmed-results.csv>` was passed as the first argument, scan the most recent ~50 chat turns for `__CE_PUBMED_RESULTS__ csv=<path> n=<int> ...`. If found, use that CSV path as the input.

Also scan for `__CE_EVIDENCE_MAP__ path=<artifact> sources=pubmed[,paperclip] ...`. If present, read the evidence map before extraction and use it to prioritize papers, identify full-text-verified claims, and avoid re-asking literature questions already answered there. The PubMed CSV remains the required tabular input for this skill; the evidence map is context, not a replacement CSV.

Print: `[pubmed] using results from <path> (n=<N>)`. If neither an explicit path nor the signal is present, ask the user to load the `ce-pubmed` skill first or pass a CSV path explicitly.

### Step 1: Load and prioritize

Read the input CSV. If `--full-text-only`, drop rows without `pmcid` and report how many were dropped. Sort by year (descending), then by design (RCT > prospective cohort > retrospective cohort > case-control > case series; a project ordering for reading priority, not an evidence grade). Cap at `--max` (default 25).

### Step 2: Read the paper, not only the abstract

**MCP egress (every mode):** send PubMed, Paperclip, and other MCP or web tools only search terms, MeSH terms, PMIDs, DOIs, and titles, never data values, identifiers, row text, or data files; an endpoint approval does not cover third-party services.

Full text is the extraction source whenever it is lawfully available; the CSV abstract alone is the last resort. For each paper, in preference order:

1. **PubMed MCP full text.** For rows with a `pmcid`, call `pubmed_fetch_fulltext` (default server), or `get_copyright_status` and then `get_full_text_article` (other connectors), with the PMCID. Read the Methods, Results, and statistical-analysis sections and Table 1. Cite PubMed and include the DOI in the output row.
2. **Paperclip MCP full text.** `lookup` the paper by `doi`, `pmid`, or `pmc`, then `cat` the Methods/Results sections or `grep`/`scan` for the field cues in Step 3 (for example `Cox|logistic|mixed|propensity|primary outcome`). The authenticated `paperclip` CLI is the fallback for the same reads. Paperclip may cover papers without a PMCID.
3. **E-utilities fallback** when neither MCP server is connected and the row has a `pmcid`: `efetch.fcgi?db=pmc&id=<pmcid>&rettype=xml&retmode=xml`, then extract `<sec sec-type="methods">`, `<sec sec-type="results">`, and `<sec sec-type="statistics">`.
4. **Abstract only** when no lawful full text exists: use the abstract from the input CSV and say so.

Record what was read in an `evidence_level` column: `full_text` when any of paths 1-3 was read, `abstract` otherwise. Under `--full-text-only`, drop rows that end at `abstract` and report them.

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
| `design` | RCT / prospective cohort / retrospective cohort / case-control / cross-sectional / simulation / methods guidance |
| `bias_flags` | stated or obvious: selection, confounding, small n, single site, outcome-reporting; `none noted` otherwise (not a formal risk-of-bias assessment) |
| `checklist_followed` | CONSORT / STROBE / TRIPOD / TRIPOD+AI / PRISMA / none stated |
| `evidence_level` | `full_text` or `abstract`, from Step 2 |

Be conservative: if the paper does not state a field, write `not reported` rather than infer. Fields such as `adjustment_set`, `software`, and `multiplicity_control` are rarely in an abstract; on an `abstract` row expect `not reported` rather than a guess.

### Step 4: Write the comparison table

Save to `analysis/pubmed/<query-slug>-methods.csv` with one row per paper, keeping the input's `pmid`, `year`, `first_author`, `doi`, and `pmcid` columns (`ce-effect-size` needs them). Also write `analysis/pubmed/<query-slug>-methods-summary.md`:

- **Modal method** (most common) per outcome type
- **Method × year** matrix (is the field shifting?)
- **Software × method** matrix (what to install)
- **Effect-size range** (min / median / max) for each commonly-reported metric, with a note that published estimates are likely inflated and should not be used unadjusted as the power target
- **% of papers stating a checklist** (low % is itself informative)
- **% of rows at `full_text`** versus `abstract`, so the SAP states how much of the justification rests on abstracts

### Step 5: Emit signal for downstream skills

`__CE_METHOD_EXTRACT__ csv=<path> n=<count> modal_method=<name>`

Completion check before emitting: every row has `pmid` or `doi`, `design`, and `evidence_level`; no field is filled by inference (`not reported` instead); the summary's `full_text` percentage matches the CSV.

The modal method is reported as context for `ce-model-strategy`, which selects the analytic method from the estimand, outcome, and data structure; method frequency is never the selection criterion. The comparison table (PMIDs, DOIs, per-row `design` and `evidence_level`) is the citation for that context.

## What this skill does NOT do

- Does not download PDFs or use unauthorized mirrors (full text via open PMC or a connected Paperclip service only)
- Does not perform formal risk-of-bias or quality appraisal (it records design and obvious bias flags only)
- Does not pool effect sizes (use the `ce-effect-size` skill)
- Does not match the study to a checklist (use the `ce-checklist-match` skill)

## References

@./references/extraction-prompts.md

@./references/method-taxonomy.md

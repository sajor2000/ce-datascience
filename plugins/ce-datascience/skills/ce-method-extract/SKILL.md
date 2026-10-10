---
name: ce-method-extract
description: "Extract study methods, cohort definitions, endpoints, models, and assumptions from literature for SAP justification. Use when the user has PubMed, Paperclip, or literature-search results and needs methods grounding."
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
- Before `ce-power` when you need a prior effect-size estimate

## Prerequisites

- A PubMed result CSV (from `ce-pubmed`) exists
- For `--full-text-only`, the rows must have non-empty `pmcid` (open PMC full text), or Paperclip must be able to `lookup` the paper

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** the full text of each included paper (Methods, Results, statistical-analysis sections, and Table 1) for methods extraction; the CSV abstract is the source only when no lawful full text exists.

## Core workflow

### Step 0: Context inputs (scan chat first)

If no `<path/to/pubmed-results.csv>` was passed as the first argument, scan the most recent ~50 chat turns for `__CE_PUBMED_RESULTS__ csv=<path> n=<int> ...`. If found, use that CSV path as the input.

Also scan for `__CE_EVIDENCE_MAP__ path=<artifact> sources=pubmed[,paperclip] ...`. If present, read the evidence map before extraction and use it to prioritize papers, identify full-text-verified claims, and avoid re-asking literature questions already answered there. The PubMed CSV remains the required tabular input for this skill; the evidence map is context, not a replacement CSV.

Print: `[pubmed] using results from <path> (n=<N>)`. If neither an explicit path nor the signal is present, ask the user to load the `ce-pubmed` skill first or pass a CSV path explicitly.

### Step 1: Load and prioritize

Read the input CSV. If `--full-text-only`, drop rows without `pmcid` and report how many were dropped. Sort by year (descending), then by study-type relevance (RCT > prospective cohort > retrospective cohort > case-control > case series). Cap at `--max` (default 25).

### Step 2: Read the paper, not only the abstract

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
| `checklist_followed` | CONSORT / STROBE / TRIPOD / PRISMA / none stated |
| `evidence_level` | `full_text` or `abstract`, from Step 2 |

Be conservative: if the paper does not state a field, write `not reported` rather than infer. Fields such as `adjustment_set`, `software`, and `multiplicity_control` are rarely in an abstract; on an `abstract` row expect `not reported` rather than a guess.

### Step 4: Write the comparison table

Save to `analysis/pubmed/<query-slug>-methods.csv` with one row per paper, keeping the input's `pmid`, `year`, `first_author`, `doi`, and `pmcid` columns (`ce-effect-size` needs them). Also write `analysis/pubmed/<query-slug>-methods-summary.md`:

- **Modal method** (most common) per outcome type
- **Method × year** matrix (is the field shifting?)
- **Software × method** matrix (what to install)
- **Effect-size range** (min / median / max) for each commonly-reported metric
- **% of papers stating a checklist** (low % is itself informative)
- **% of rows at `full_text`** versus `abstract`, so the SAP states how much of the justification rests on abstracts

### Step 5: Emit signal for downstream skills

`__CE_METHOD_EXTRACT__ csv=<path> n=<count> modal_method=<name>`

The modal method becomes the default suggestion for the SAP's analytic method, with the comparison table (PMIDs, DOIs, and per-row `evidence_level`) as the citation.

## What this skill does NOT do

- Does not download PDFs or use unauthorized mirrors (full text via open PMC or a connected Paperclip service only)
- Does not score paper quality (use a reporting-checklist tool for that, not a method-extractor)
- Does not pool effect sizes (use the `ce-effect-size` skill)
- Does not match the study to a checklist (use the `ce-checklist-match` skill)

## References

@./references/extraction-prompts.md

@./references/method-taxonomy.md

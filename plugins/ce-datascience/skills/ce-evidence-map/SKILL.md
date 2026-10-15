---
name: ce-evidence-map
description: "Build a source-backed evidence map for biomedical research questions. Uses PubMed metadata as the required baseline and optionally deepens with Paperclip full-text search, grep, map, and figure review when the Paperclip MCP server is connected or the Paperclip CLI is authenticated. Use when the user needs evidence for a SAP, method justification, effect-size selection, manuscript background, or review pack."
argument-hint: "[research query, optional: --source pmc|abstracts|trials|fda --max 10]"
---

# Evidence Map

## Skill Value

- **Problem it solves:** Literature grounding needs a traceable map from claims to PubMed records, optional full-text evidence, and downstream SAP/method decisions.
- **Use when:** The user needs evidence for a SAP, method justification, effect-size selection, manuscript background, or review pack.
- **Output:** `analysis/evidence-map/<query-slug>-evidence-map.md` plus a `__CE_EVIDENCE_MAP__` handoff signal.
- **Ask only if:** No research query or PubMed handoff is available, or the user must choose a non-default Paperclip source or figure-review target.
- **Do not do:** Do not replace `ce-pubmed`, install/authenticate Paperclip automatically, pool effect sizes, or finalize SAP methods before data QA.

Create a traceable evidence map for SAPs, method justification, effect-size
selection, manuscript background, or review-pack evidence summaries.

This skill keeps PubMed/MEDLINE as the canonical biomedical metadata baseline
and treats Paperclip as an optional full-text deepening layer. Never require
Paperclip for normal plugin operation.

## Evidence access

When this run needs literature, read `references/evidence-access.md` first; never invent a citation, effect size, or guideline item.

- **Look up here:** every claim in the claim-to-source matrix (cohort definitions, outcomes, model or effect estimates, covariate sets, limitations) and the figures or trial records behind them.

## Prerequisites

- PubMed baseline: Load the `ce-pubmed` skill first or provide a query this skill can pass
  to `ce-pubmed`.
- Optional Paperclip deepening, in preference order:
  1. **Paperclip MCP server connected** (tools `search`, `lookup`, `cat`, `grep`,
     `scan`, `map`, `filter`, `results`, `ask-image`, `status`). Call `status` to
     confirm backend health. No install step is needed.
  2. **Paperclip CLI fallback** when no MCP server is connected. Check availability
     without installing anything:

     ```bash
     command -v paperclip && paperclip config
     ```

If neither is available or the CLI is unauthenticated, continue with PubMed-only
evidence and state the limitation. Do not run the Paperclip installer automatically.
The evidence labels are the same whichever path is used.

## Workflow

### Step 0: Resolve query and baseline context

Read `$ARGUMENTS`.

If no query was passed, scan recent chat for these handoff signals:

```text
__CE_RESEARCH_QUESTION__ yaml=<path> ... query="<one-line>"
__CE_PUBMED_RESULTS__ csv=<path> n=<count> query=<...> pmc_pct=<...>
```

Resolution order:

1. Explicit query in `$ARGUMENTS`.
2. `__CE_RESEARCH_QUESTION__` suggested PubMed query.
3. `__CE_PUBMED_RESULTS__` query.

If neither a query nor a PubMed CSV exists, ask the user for a research question
or tell them to load the `ce-research-question` skill then `ce-pubmed`.

### Step 1: Establish PubMed baseline

If `__CE_PUBMED_RESULTS__` is present, read the CSV and use it as the metadata
baseline.

If no PubMed CSV exists, load the `ce-pubmed` skill with the resolved query before
continuing (it uses the PubMed MCP search and metadata tools,
`pubmed_search_articles`/`pubmed_fetch_articles` or
`search_articles`/`get_article_metadata`, or the bundled E-utilities script). The
evidence map must include PMIDs, years, journals, abstracts, MeSH/study-type
metadata when available, and PMC availability status. For rows with a PMCID and
no Paperclip, PubMed MCP full text (`pubmed_fetch_fulltext`, or
`get_copyright_status` then `get_full_text_article`) gives lawful open full
text; label those claims `full_text` and cite PubMed with the DOI.

PubMed rows are the baseline because they are stable, biomedical-native, and
portable across corporate environments where Paperclip may be unavailable.

### Step 2: Optional Paperclip deepening

Only when the Paperclip MCP server is connected or the CLI is authenticated, read `references/paperclip-deepening.md` and follow it (MCP `search`/`map`/`grep`/`ask-image`, or the CLI fallback). Treat Paperclip output as evidence-deepening, not ground truth: a hit is not evidence until the quoted text or figure behind it has been read.

### Step 3: Write evidence map

Write the evidence map to:

```text
analysis/evidence-map/<query-slug>-evidence-map.md
```

Create parent directories as needed. Keep real subject data out of this artifact;
it should contain literature, trial-registry, regulatory, and software
documentation evidence only.

Required sections:

1. **Search provenance**: query, date, PubMed CSV path, Paperclip source/result IDs
   when used, which path (MCP or CLI) was used, and whether full text was available.
2. **Included evidence table**: PMID or document ID, title, year, source,
   journal/document type, DOI, PMC/full-text status, `design` (RCT / cohort /
   case-control / cross-sectional / simulation / methods guidance), `bias_flags`
   (selection, confounding, small n, single site, outcome reporting; not a formal
   risk-of-bias grade), and one-line relevance.
3. **Claim-to-source matrix**: each claim, supporting source IDs, evidence label
   (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`),
   and notes.
4. **Methods and effect-size clues**: cohort definition, outcome, model/effect
   estimate, key predictors/covariates, limitations, and whether details came
   from abstract or full text.
5. **Evidence gaps**: missing full text, unclear cohort definitions, missing
   confidence intervals, unclear adjustment sets, contradictory findings, and
   effect estimates likely inflated by publication bias or small samples.
6. **Recommended handoffs**: `ce-method-extract`, `ce-effect-size`,
   `ce-power`, `ce-checklist-match`, or `ce-plan`.

Use conservative language:

- If only PubMed abstracts were read, label claims `abstract`.
- If PMC or Paperclip full text was read, label claims `full_text`.
- If figure QA was used, label claims `figure` and include the figure path or
  paper figure identifier.
- If a ClinicalTrials.gov or other trial-registry record was read, label claims
  `trial`.
- If a regulation or agency guidance document was read at its issuing body's
  source, label claims `regulatory`.
- If official software or package documentation was read (for a method
  justification), label claims `documentation`.
- Identifier or metadata lookups alone (DOI/PMID conversion, titles, journals)
  do not verify a claim; label the claim only once its source is read.

### Step 4: Emit handoff

After writing the evidence map, emit:

```text
__CE_EVIDENCE_MAP__ path=<artifact> sources=pubmed[,paperclip] full_text_pct=<n> claims=<n>
```

Downstream skills can use this artifact to avoid repeating literature search and
to distinguish abstract-only evidence from full-text-verified evidence.

Completion check before emitting: every claim in the matrix cites at least one
source ID and one evidence label, `full_text_pct` and `claims` match the
artifact, and no subject-level data appears in it.

## Failure handling

| Condition | Response |
|-----------|----------|
| Paperclip MCP not connected and CLI not installed | Continue PubMed-only (PMC full text via `pubmed_fetch_fulltext` or `get_full_text_article` where open); say Paperclip is optional. |
| Paperclip CLI unauthenticated | Continue PubMed-only; suggest `paperclip login` or `PAPERCLIP_API_KEY`. |
| Paperclip search requires source | Retry with explicit `source: pmc` (MCP) or `-s pmc` (CLI) unless the user requested another source. |
| Paperclip map output is truncated | Re-read the saved result (`results` tool, or `paperclip results <id>`); if still truncated, summarize visible fields and note the limitation. |
| Figure command fails | Skip figure QA and keep text evidence; do not block the evidence map. |

## What this skill does NOT do

- Does not replace `ce-pubmed`.
- Does not install or authenticate Paperclip automatically.
- Does not pool effect sizes; use the `ce-effect-size` skill.
- Does not finalize SAP methods without data QA; `ce-plan` still requires
  data-column and QA preflight before variable/model finalization.

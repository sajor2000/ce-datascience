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

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
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

Default source is `pmc` because it supports full text. Allow `$ARGUMENTS` to
override with `--source abstracts`, `--source trials`, `--source fda`, or another
Paperclip-supported source. Always pass an explicit source; Paperclip requires it
for most searches. Send only the PICO terms, never subject-level data.

**Preferred: Paperclip MCP tools.**

1. `search` with `query: "<query>"`, `source: "pmc"` (or the override), a result
   cap (default 10), and `save_as: "<query-slug>"` so the result set is reusable.
   Alternatively `lookup` by `doi`, `pmid`, or `pmc` for papers already in the
   PubMed CSV. Capture the returned result ID.
2. `map` over the saved result with the output schema
   `{"cohort":"string","outcome":"string","model_or_estimate":"string","key_predictors":"string","limitations":"string"}`
   and the instruction "Extract only the cohort definition, primary outcome, model
   or effect estimate, key predictors, and one limitation."
3. At least one full-text narrowing pass over the same result: `grep` (regex
   such as `SOFA|Charlson|propensity|hazard ratio|AUC|AUROC`) or `scan` when the
   pattern must be checked inside each paper's sections; `cat` the matching
   passage before citing it.
4. For figures, model interpretation, or graphical results: `ls` the paper's
   figures, then `ask-image` on one relevant figure with "What result should a
   SAP evidence map capture from this figure?"
5. `results` re-reads a saved result when a `map` output is truncated.

**Fallback: authenticated Paperclip CLI** (same workflow, same labels):

```bash
paperclip search -s pmc "<query>" -n 10
```

Capture the returned search result ID, such as `s_ad3c90ef`. Then run:

```bash
paperclip map --from <search_id> \
  --output_schema '{"cohort":"string","outcome":"string","model_or_estimate":"string","key_predictors":"string","limitations":"string"}' \
  "Extract only the cohort definition, primary outcome, model or effect estimate, key predictors, and one limitation."
```

```bash
paperclip grep --from <search_id> -i "SOFA|Charlson|propensity|hazard ratio|AUC|AUROC"
```

```bash
paperclip ls /papers/<document_id>/figures
paperclip ask_image /papers/<document_id>/figures/<figure_file> \
  "What result should a SAP evidence map capture from this figure?"
```

Treat Paperclip output as evidence-deepening, not ground truth. A search hit or
`map` row is not evidence until the quoted paper text, figure output, or metadata
behind it has been read; verify before using it in a SAP.

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
   journal/document type, DOI, PMC/full-text status, and one-line relevance.
3. **Claim-to-source matrix**: each claim, supporting source IDs, evidence label
   (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`),
   and notes.
4. **Methods and effect-size clues**: cohort definition, outcome, model/effect
   estimate, key predictors/covariates, limitations, and whether details came
   from abstract or full text.
5. **Evidence gaps**: missing full text, unclear cohort definitions, missing
   confidence intervals, unclear adjustment sets, or contradictory findings.
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

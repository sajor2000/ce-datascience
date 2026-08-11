---
name: ce-evidence-map
description: "Build a source-backed evidence map for biomedical research questions. Uses PubMed metadata as the required baseline and optionally deepens with Paperclip full-text search, grep, map, SQL, and figure review when the Paperclip CLI is installed and authenticated."
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

## Prerequisites

- PubMed baseline: Load the `ce-pubmed` skill first or provide a query this skill can pass
  to `ce-pubmed`.
- Optional Paperclip deepening: `paperclip` CLI installed and authenticated.

When Paperclip MCP is connected, use its `paperclip` command surface for the
same explicit-source search, full-text read, and line-pinned evidence workflow
described below. Prefer the MCP path when available; fall back to the
authenticated CLI without changing the evidence labels.

Check Paperclip availability without installing anything:

```bash
command -v paperclip && paperclip config
```

If Paperclip is missing or unauthenticated, continue with PubMed-only evidence
and state the limitation. Do not run the Paperclip installer automatically.

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
continuing. The evidence map must include PMIDs, years, journals, abstracts,
MeSH/study-type metadata when available, and PMC availability status.

PubMed rows are the baseline because they are stable, biomedical-native, and
portable across corporate environments where Paperclip may be unavailable.

### Step 2: Optional Paperclip deepening

If `command -v paperclip` succeeds and `paperclip config` reports authenticated
server health, run Paperclip deepening.

Default source is `pmc` because it supports full text. Allow `$ARGUMENTS` to
override with `--source abstracts`, `--source trials`, `--source fda`, or another
Paperclip-supported source. Always pass an explicit source flag; current
Paperclip CLI versions require it.

```bash
paperclip search -s pmc "<query>" -n 10
```

Capture the returned search result ID, such as `s_ad3c90ef`. Then run:

```bash
paperclip map --from <search_id> \
  --output_schema '{"cohort":"string","outcome":"string","model_or_estimate":"string","key_predictors":"string","limitations":"string"}' \
  "Extract only the cohort definition, primary outcome, model or effect estimate, key predictors, and one limitation."
```

Run at least one full-text narrowing grep against the same result set:

```bash
paperclip grep --from <search_id> -i "SOFA|Charlson|propensity|hazard ratio|AUC|AUROC"
```

If the work involves figures, model interpretation, or graphical results, inspect
available figures and ask about one relevant image:

```bash
paperclip ls /papers/<document_id>/figures
paperclip ask_image /papers/<document_id>/figures/<figure_file> \
  "What result should a SAP evidence map capture from this figure?"
```

Treat Paperclip output as evidence-deepening, not ground truth. Verify claims
against quoted paper text, figure output, or metadata before using them in a SAP.

### Step 3: Write evidence map

Write the evidence map to:

```text
analysis/evidence-map/<query-slug>-evidence-map.md
```

Create parent directories as needed. Keep real subject data out of this artifact;
it should contain literature and regulatory evidence only.

Required sections:

1. **Search provenance**: query, date, PubMed CSV path, Paperclip source/result IDs
   when used, and whether full text was available.
2. **Included evidence table**: PMID or document ID, title, year, source,
   journal/document type, DOI, PMC/full-text status, and one-line relevance.
3. **Claim-to-source matrix**: each claim, supporting source IDs, verification
   status (`abstract`, `full_text`, `figure`, `trial`, `regulatory`), and notes.
4. **Methods and effect-size clues**: cohort definition, outcome, model/effect
   estimate, key predictors/covariates, limitations, and whether details came
   from abstract or full text.
5. **Evidence gaps**: missing full text, unclear cohort definitions, missing
   confidence intervals, unclear adjustment sets, or contradictory findings.
6. **Recommended handoffs**: `ce-method-extract`, `ce-effect-size`,
   `ce-power`, `ce-checklist-match`, or `ce-plan`.

Use conservative language:

- If only PubMed abstracts were read, label claims `abstract`.
- If Paperclip full text was used, label claims `full_text`.
- If figure QA was used, label claims `figure` and include the figure path or
  paper figure identifier.

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
| Paperclip not installed | Continue PubMed-only; say Paperclip is optional. |
| Paperclip unauthenticated | Continue PubMed-only; suggest `paperclip login` or `PAPERCLIP_API_KEY`. |
| Paperclip search requires source | Retry with explicit `-s pmc` unless the user requested another source. |
| Paperclip map output is truncated | Use the result ID and `paperclip results <id>`; if still truncated, summarize visible fields and note the limitation. |
| Figure command fails | Skip figure QA and keep text evidence; do not block the evidence map. |

## What this skill does NOT do

- Does not replace `ce-pubmed`.
- Does not install or authenticate Paperclip automatically.
- Does not pool effect sizes; use the `ce-effect-size` skill.
- Does not finalize SAP methods without data QA; `ce-plan` still requires
  data-column and QA preflight before variable/model finalization.

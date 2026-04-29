---
name: ce-pubmed
description: 'Searches PubMed/MEDLINE via NCBI E-utilities (esearch + efetch) with MeSH-term expansion, study-type and date filters, and structured result tables. Use whenever the user mentions PubMed, MEDLINE, "find papers on", peer-reviewed methods, prior-literature search, biomedical literature, MeSH terms, PMIDs, or asks for a citation-clean structured table of papers (CSV with pmid, journal, year, study type, abstract). Triggers also for SAP-method-section literature anchors, brainstorm rigor probes asking for prior art, and any request preceding /ce-method-extract or /ce-effect-size. Use this rather than /ce-literature-search (PyPaperBot/SciHub for PDF retrieval) when the user wants structured biomedical metadata, not full-text PDFs. Wraps biopython.Entrez which auto-handles NCBI rate limits and retries.'
argument-hint: "<query terms>, optional: --years 5 --study-type rct|cohort|case-control|prediction|review --max 50"
---

# PubMed Method Search

Search PubMed/MEDLINE via NCBI E-utilities, return a structured CSV that downstream skills (`/ce-method-extract`, `/ce-effect-size`) consume. The skill exists because `/ce-literature-search` (PyPaperBot) is great for PDFs but bad for structured biomedical metadata; this is biomedical-native.

## Prerequisites

- Python with biopython: `pip install biopython>=1.83`
- Optional but recommended: `export NCBI_API_KEY=<key>` (lifts rate limit from 3 → 10 req/sec)
- Optional: `export NCBI_EMAIL=<your-email>` (NCBI courtesy)

## Workflow

### 0. Context inputs (scan chat first)

Before asking the user for a query, scan the most recent ~50 chat turns for `__CE_RESEARCH_QUESTION__ yaml=<path> ... query="<one-line>"`. If found:

1. Read the YAML at the path (`analysis/research-question.yaml` by default).
2. Use the `suggested_pubmed_query` field as the default query if no `<query terms>` argument was passed on the command line.
3. Use `pico.population` and `outcome` to derive a default `--years` window (default 10) and `--study-type` filter (e.g., `cohort` if `suggested_design` starts with "cohort").
4. Print one line so the chain is visible:

   ```
   [research-question] using query from analysis/research-question.yaml: "<query>"
   ```

If `__CE_RESEARCH_QUESTION__` is not present and no `<query terms>` are passed, ask the user for a query (or recommend running `/ce-research-question` first to harden the question).

### 1. Run the bundled script

The `scripts/pubmed_search.py` wraps biopython.Entrez and handles MeSH expansion, batched retrieval, rate limits, and retries. Prefer it over hand-rolling `requests` because Entrez already implements the rate-limit + retry logic that hand-rolled code routinely gets wrong.

```bash
python plugins/ce-datascience/skills/ce-pubmed/scripts/pubmed_search.py \
    "sepsis bundle compliance ICU" \
    --years 10 --study-type cohort --max 50 \
    --out analysis/pubmed/sepsis-bundle-2025.csv
```

The script prints two diagnostic lines to stderr the user should always see:
- `[query] (sepsis bundle ...) AND ("Cohort Studies"[MeSH Terms]) AND ...` — the actual query NCBI ran after MeSH expansion. Surface this; silent MeSH expansion is the #1 source of "why didn't my paper come up?".
- `[hits]  142 matched; fetching 50` — the size of the matched set vs what was retrieved.

### 2. Write the human summary

After the CSV exists, write a sibling Markdown summary at `analysis/pubmed/<query-slug>-<YYYYMMDD>.md` with:

1. **Top-10 by recency × journal heuristic** — newest hit from the highest-tier journal in the result set wins. The heuristic doesn't have to be perfect; it gives the user a hand-pickable list.
2. **MeSH-term histogram** — top 15 MeSH terms across results. Reveals what the literature actually indexes this topic as, not what the user typed.
3. **Study-type histogram** — RCTs vs cohorts vs reviews. Tells the user whether the prior literature is observational or interventional.
4. **% with PMC full-text** — proportion of rows with non-empty `pmcid`. This is the upper bound on what `/ce-method-extract` can do with full text.

### 3. Emit the handoff signal

The script already prints `__CE_PUBMED_RESULTS__ csv=<path> n=<count> query=<...> pmc_pct=<...>`. Surface this line in the chat so `/ce-method-extract` can pick the CSV up by parsing the chat context.

## Out of scope

- Does not download PDFs (use `/ce-literature-search` for that)
- Does not extract methods from full text (next: `/ce-method-extract`)
- Does not pool effect sizes (next-next: `/ce-effect-size`)
- Does not match to a reporting checklist (different skill: `/ce-checklist-match`)

## References

@./references/mesh-expansion.md — When NCBI's MeSH expansion goes wrong and how to detect it

@./references/eutils-endpoints.md — E-utilities reference, batch limits, error handling

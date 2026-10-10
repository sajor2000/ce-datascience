---
name: ce-pubmed
description: "Search PubMed/MEDLINE with structured E-utilities queries, filters, MeSH expansion, and abstract metadata output. Use when the user asks for PubMed, MEDLINE, PMIDs, biomedical abstracts, or literature metadata."
argument-hint: "<query terms>, optional: --years 5 --study-type rct|cohort|case-control|prediction|review --max 50"
---

# PubMed Method Search

> **Script paths are relative to this skill's directory.** Prefix each script path with that directory (the `SKILL_DIR` anchor below) — the agent's working directory is the user's project, not the skill, and `--out` paths resolve against the project.


## Skill Value

- **Problem it solves:** Biomedical planning needs traceable literature metadata before methods extraction or SAP justification.
- **Use when:** The user asks for PubMed, MEDLINE, PMIDs, biomedical abstracts, or literature metadata.
- **Output:** Structured PubMed results with PMIDs, abstracts/metadata, query details, and downstream handoff.
- **Ask only if:** Only when no query, research-question YAML, or PICO context is available.
- **Do not do:** Do not claim full-text coverage or replace Paperclip/full-text methods extraction.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Search PubMed/MEDLINE via NCBI E-utilities and return a structured CSV that downstream skills (`ce-method-extract`, `ce-effect-size`) consume. This skill owns the plugin's canonical biomedical metadata and PMID workflow; `ce-literature-search` routes broader requests here when PubMed is the right source.

## Prerequisites

- Python with current Biopython: `python3 -m pip install --upgrade biopython`
- Optional but recommended: `export NCBI_API_KEY=<key>` (lifts rate limit from 3 → 10 req/sec)
- Optional: `export NCBI_EMAIL=<your-email>` (NCBI courtesy)

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script (`scripts/pubmed_search.py`, Step 1 below); without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** the PICO query from `analysis/research-question.yaml`, MeSH expansion (NCBI's `QueryTranslation`), and PMID/PMCID/DOI capture for every CSV row.

When the PubMed MCP path is used instead of the script, write the same CSV
columns (`pmid,year,journal,study_type,title,first_author,doi,pmcid,abstract,mesh_terms,query_used`),
fill `pmcid`/`doi` with `pubmed_convert_ids` or `convert_article_ids` when the
metadata call omits them, surface MeSH expansion with `pubmed_lookup_mesh` when
the default server is connected and otherwise say explicitly that
`QueryTranslation` was not surfaced, and still emit the `__CE_PUBMED_RESULTS__`
line in Step 3. The CSV holds abstracts; rows are
`abstract`-level evidence until a source is read in full.

## Workflow

### 0. Context inputs (scan chat first)

Before asking the user for a query, scan the most recent ~50 chat turns for `__CE_RESEARCH_QUESTION__ yaml=<path> ... query="<one-line>"`. If found:

1. Read the YAML at the path (`analysis/research-question.yaml` by default).
2. Use the `suggested_pubmed_query` field as the default query if no `<query terms>` argument was passed on the command line.
3. Use `pico.population` and `outcome` to derive a default `--years` window (default 10) and `--study-type` filter (e.g., `cohort` if `suggested_design` names a cohort design).
4. Print one line so the chain is visible:

   ```
   [research-question] using query from analysis/research-question.yaml: "<query>"
   ```

If `__CE_RESEARCH_QUESTION__` is not present and no `<query terms>` are passed, ask the user for a query (or recommend load the `ce-research-question` skill first to harden the question).

### 1. Run the bundled script

The `scripts/pubmed_search.py` wraps biopython.Entrez and handles MeSH expansion, batched retrieval, rate limits, and retries. Prefer it over hand-rolling `requests` because Entrez already implements the rate-limit + retry logic that hand-rolled code routinely gets wrong.

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
python3 "$SKILL_DIR/scripts/pubmed_search.py" \
    "sepsis bundle compliance ICU" \
    --years 10 --study-type cohort --max 50 \
    --out analysis/pubmed/sepsis-bundle-2025.csv
```

The script prints three diagnostic lines to stderr the user should always see:
- `[query] (sepsis bundle ...) AND ("Cohort Studies"[MeSH Terms]) AND ...` — the query string sent to NCBI, with the study-type, date, human, and English filters added.
- `[hits]  142 matched; fetching 50` — the size of the matched set vs what was retrieved.
- `[mesh]  ...` — NCBI's `QueryTranslation`, the actual query NCBI ran after MeSH expansion. Surface this; silent MeSH expansion is the #1 source of "why didn't my paper come up?".

### 2. Write the human summary

After the CSV exists, write a sibling Markdown summary at `analysis/pubmed/<query-slug>-<YYYYMMDD>.md` with:

1. **Top-10 by recency × journal heuristic** — newest hit from the highest-tier journal in the result set wins. The heuristic doesn't have to be perfect; it gives the user a hand-pickable list.
2. **MeSH-term histogram** — top 15 MeSH terms across results. Reveals what the literature actually indexes this topic as, not what the user typed.
3. **Study-type histogram** — RCTs vs cohorts vs reviews. Tells the user whether the prior literature is observational or interventional.
4. **% with PMC full-text** — proportion of rows with non-empty `pmcid`. This is the upper bound on what `ce-method-extract` can do with full text.

### 3. Emit the handoff signal

The script already prints `__CE_PUBMED_RESULTS__ csv=<path> n=<count> query=<...> pmc_pct=<...>`. Surface this line in the chat so `ce-method-extract` can pick the CSV up by parsing the chat context.

## Out of scope

- Does not acquire arbitrary PDFs; use `ce-evidence-map` for claim-focused lawful full-text verification
- Does not extract methods from full text (next: `ce-method-extract`)
- Does not pool effect sizes (next-next: `ce-effect-size`)
- Does not create editable Word citation fields (use `ce-manuscript-citations`)
- Does not match to a reporting checklist (different skill: `ce-checklist-match`)

## References

@./references/mesh-expansion.md — When NCBI's MeSH expansion goes wrong and how to detect it

@./references/eutils-endpoints.md — E-utilities reference, batch limits, error handling

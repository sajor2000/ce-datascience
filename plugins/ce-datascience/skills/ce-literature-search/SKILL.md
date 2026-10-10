---
name: ce-literature-search
description: "Route evidence searches to PubMed, full-text evidence mapping, or authoritative web sources without duplicating specialist workflows. Use when the user asks broadly for papers, literature, evidence grounding, methods sources, current guidance, or a DOI/PMID lookup and the correct source workflow is not yet clear."
argument-hint: "[research query, PICO/PECO question, DOI/PMID list, or source request]"
---

# Literature Search Router

## Skill Value

- **Problem it solves:** Evidence searches become incomplete or irreproducible when metadata, full text, methods extraction, and current web guidance are treated as one interchangeable task.
- **Use when:** The user asks broadly for papers, literature, evidence grounding, methods sources, current guidance, or a DOI/PMID lookup and the correct source workflow is not yet clear.
- **Output:** A source-selection decision, reproducible search scope, and handoff to the specialist skill that owns the requested artifact.
- **Ask only if:** Topic, population/outcome, date range, jurisdiction, or required source type cannot be inferred and would change the search.
- **Do not do:** Do not download from unauthorized sources, claim systematic-review coverage from a convenience search, or recreate outputs owned by a specialist skill.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

## Route

Choose the narrowest route that satisfies the request. Before calling any search tool, read `references/mcp-routing.md`: it maps each need to the connected MCP tools (PubMed, Paperclip, Context7 or Ref, web search) and to the fallback when none is connected.

| Need | Route |
|---|---|
| PubMed/MEDLINE search, MeSH expansion, PMIDs, abstracts, or canonical biomedical metadata | Load `ce-pubmed` |
| Claim-to-source synthesis or verification that may require available lawful full text | Load `ce-evidence-map` |
| Structured extraction of methods from selected studies | Load `ce-method-extract` |
| Effect estimates for pooling or sample-size assumptions | Load `ce-effect-size` |
| Editable Word citations, DOI/PMID resolution, or Zotero field delivery | Load `ce-manuscript-citations` |
| Current guidelines, regulations, software documentation, or non-biomedical sources | Search the web and prefer primary authoritative sources |

If the request spans routes, run the PubMed metadata baseline first, deepen only the selected claims that need full text, and preserve identifiers and query provenance between steps.

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** which connected source can answer each part of the request, and the PMID/PMCID/DOI plus query provenance that must travel with the handoff to the specialist skill.

## Search Contract

Before searching, record:

- the question or PICO/PECO elements;
- databases or source classes searched;
- exact query strings and filters;
- search date and result count;
- the evidence label for each conclusion (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, or `documentation`, as defined in `references/mcp-routing.md`); metadata alone does not verify a conclusion.

Resolve the current date at runtime. Do not invent a cutoff year or silently narrow the user's population, intervention/exposure, comparator, or outcome.

For a systematic or scoping review request, confirm the protocol, eligibility criteria, date coverage, deduplication method, screening ownership, and applicable reporting checklist before calling the search comprehensive. A single PubMed or web query is preliminary discovery, not a completed review.

## Boundaries

- PubMed is the canonical biomedical metadata baseline; optional connected services may accelerate it but are not required.
- Use only lawful, authorized full-text access supplied by the user, an institution, an open repository, or an explicitly connected service.
- Report unavailable full text and source gaps instead of substituting unsupported summaries.
- Keep downloaded papers and temporary search artifacts outside the repository unless the user explicitly requests a permitted destination.
- Hand off study-design decisions to `ce-plan` or `ce-statistical-analysis-plan`; a literature search does not choose the estimand or analysis method.

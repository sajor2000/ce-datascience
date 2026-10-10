# MCP Routing for Evidence Searches

## Contents

- Check what is connected
- Routing table
- Rules for every route

Connected MCP servers make searches faster and more complete, but none is required. Every route has a no-MCP fallback, and the evidence label records which path produced each claim.

## Check what is connected

Before choosing a route, list the MCP tools available in this session (in Claude Code, search the deferred tool list, for example `ToolSearch` with `pubmed` or `paperclip`). Server names vary by install; match on the tool's purpose, not an exact prefix. Use fully qualified `Server:tool` names when calling, for example `PubMed:search_articles`.

## Routing table

| Need | Preferred MCP tools | Fallback without MCP | Evidence label |
|---|---|---|---|
| Biomedical search, MeSH, PMIDs, abstracts | `PubMed:search_articles`, `PubMed:get_article_metadata` | `ce-pubmed` bundled `scripts/pubmed_search.py` (E-utilities) | `abstract` |
| DOI / PMID / PMCID conversion, citation lookup | `PubMed:convert_article_ids`, `PubMed:lookup_article_by_citation` | E-utilities ID converter via `ce-pubmed` | `metadata` |
| Related or citing papers for a seed study | `PubMed:find_related_articles` | PubMed "similar articles" through `ce-pubmed` | `abstract` |
| Lawful open full text (PMC) | `PubMed:get_full_text_article` after `PubMed:get_copyright_status` | User-supplied PDF or institutional access; otherwise report the gap | `full_text` |
| Full-text search across papers, preprints, trials, FDA documents, patents | `Paperclip:search`, `Paperclip:grep`, `Paperclip:map`, `Paperclip:lookup` | `paperclip` CLI if installed and authenticated (see `ce-evidence-map`); otherwise PubMed-only with the limitation stated | `full_text` |
| Figures and tables inside a paper | `Paperclip:ask-image` | Read the figure from a lawful PDF; otherwise report the gap | `full_text` |
| ClinicalTrials.gov registrations and results | `Paperclip:search` (trials source) | ClinicalTrials.gov website or API, primary record only | `registry` |
| R, Python, or software package documentation | `Context7:resolve-library-id` then `Context7:query-docs`, or Ref MCP documentation search | Official package docs, CRAN or PyPI pages, vignettes, read directly | `documentation` |
| Current guidelines, regulations, agency guidance | Web search MCP (Tavily, Exa) to find candidates, then read the primary source | Web search and fetch of the issuing body's own page | `primary_web` |

## Rules for every route

- **No patient data in queries.** Search strings, IDs, and prompts sent to any MCP server or web search must never contain PHI, patient-level values, or small-cell counts. Use the PICO/PECO terms only.
- **Search snippets are not evidence.** A search result locates a source; read the source (abstract, full text, or primary page) before citing it, and label the claim at the level actually read.
- **Record provenance.** For each query, log the server or fallback used, the exact query string and filters, the run date, and the result count in the Search Contract (see `SKILL.md`).
- **Lawful access only.** Use full text only from open repositories, user- or institution-supplied access, or an explicitly connected service. Never fetch from unauthorized mirrors.
- **When nothing is connected,** say which MCP server would have helped, take the fallback, and report the coverage gap instead of implying a complete search.
- **Hand off, don't duplicate.** After choosing the route, load the specialist skill that owns the artifact (`ce-pubmed`, `ce-evidence-map`, `ce-method-extract`, `ce-effect-size`, `ce-manuscript-citations`).

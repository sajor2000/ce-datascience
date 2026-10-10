# MCP Routing for Evidence Searches

## Contents

- Check what is connected
- Routing table
- Rules for every route

Connected MCP servers make searches faster and more complete, but none is required. Every route has a no-MCP fallback, and the evidence label records the deepest level at which each claim was actually read.

Evidence labels are the same set `ce-evidence-map` uses: `abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`. A route that only locates or identifies a source produces no label until the source is read.

## Check what is connected

Before choosing a route, list the MCP tools available in this session (for example, search the deferred tool list for `pubmed` or `paperclip`). Two PubMed servers are common and their tool names differ: the plugin's documented default `@cyanheads/pubmed-mcp-server` (`pubmed_*` tools) and other connectors (`search_articles`, `get_article_metadata`, ...). Call by purpose and use whichever spelling is connected. Tool names below are bare; the harness adds its own server prefix (`mcp__PubMed__search_articles` in Claude Code, `PubMed:search_articles` elsewhere).

## Routing table

| Need | Preferred MCP tools | Fallback without MCP | Evidence label |
|---|---|---|---|
| Biomedical search, MeSH, PMIDs, abstracts | PubMed search (`pubmed_search_articles` or `search_articles`), then metadata (`pubmed_fetch_articles` or `get_article_metadata`); `pubmed_lookup_mesh` and `pubmed_spell_check` on the default server | The `ce-pubmed` skill's bundled E-utilities search script | `abstract` |
| DOI / PMID / PMCID conversion, citation lookup | `pubmed_convert_ids` or `convert_article_ids`; `pubmed_lookup_citation` or `lookup_article_by_citation` | E-utilities ID converter via `ce-pubmed` | None (identifier lookup); label the claim when the source is read |
| Related or citing papers for a seed study | `pubmed_find_related` or `find_related_articles` | PubMed "similar articles" through `ce-pubmed` | `abstract` |
| Lawful full text | `pubmed_fetch_fulltext` (PMC, then other lawful sources), or `get_copyright_status` then `get_full_text_article` (open PMC only); cite PubMed and include the DOI | User-supplied PDF or institutional access; otherwise report the gap | `full_text` |
| Europe PMC coverage (preprints, non-MEDLINE records) | `pubmed_europepmc_search` then `pubmed_europepmc_fetch` (default server only) | Europe PMC website, or PubMed-only with the gap stated | `abstract` (or `full_text` if the record was read in full) |
| Full-text search across papers, preprints, trials, FDA documents, patents | Paperclip `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result | Authenticated `paperclip` CLI (see `ce-evidence-map`); otherwise PubMed-only with the limitation stated | `full_text` |
| Figures and tables inside a paper | Paperclip `ask-image` | Read the figure from a lawful PDF; otherwise report the gap | `figure` |
| ClinicalTrials.gov registrations and results | Paperclip `search` with `source: trials` | ClinicalTrials.gov website or API, primary record only | `trial` |
| R, Python, or software package documentation | Context7 `resolve-library-id` then `query-docs`, or Ref MCP documentation search | Official package docs, CRAN or PyPI pages, vignettes, read directly | `documentation` |
| Current guidelines, regulations, agency guidance | Web search MCP (Tavily, Exa) to find candidates, then read the primary source | Web search and fetch of the issuing body's own page | `regulatory` for regulations and agency guidance; `full_text` for a clinical guideline read in full (`abstract` if only its summary was read) |

`pubmed_format_citations` (default server only) renders a citation string for a display check. Citation style in a manuscript is applied by the reference manager (Zotero via `ce-manuscript-citations`); a formatted string is never a substitute for a reference-manager field.

## Rules for every route

- **No patient data in queries.** Search strings, IDs, and prompts sent to any MCP server or web search must never contain PHI, patient-level values, or small-cell counts. Use the PICO/PECO terms only.
- **Search snippets are not evidence.** A search result locates a source; read the source (abstract, full text, or primary page) before citing it, and label the claim at the level actually read.
- **Record provenance.** For each query, log the server or fallback used, the exact query string and filters, the run date, the result count, and the PMID/PMCID/DOI of every source kept, in the Search Contract (see `SKILL.md`).
- **Lawful access only.** Use full text only from open repositories, user- or institution-supplied access, or an explicitly connected service. Never fetch from unauthorized mirrors.
- **When nothing is connected,** say which MCP server would have helped, take the fallback, and report the coverage gap instead of implying a complete search.
- **Hand off, don't duplicate.** After choosing the route, load the specialist skill that owns the artifact (`ce-pubmed`, `ce-evidence-map`, `ce-method-extract`, `ce-effect-size`, `ce-manuscript-citations`).

# Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix; with the documented default server in Claude Code they are `mcp__pubmed-mcp-server__pubmed_search_articles`, `mcp__pubmed-mcp-server__pubmed_fetch_articles`, and so on.
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. In Claude Code these are `mcp__paperclip__search`, `mcp__paperclip__lookup`, and so on. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP (or when its calls error), load the `ce-pubmed` skill, which owns the NCBI E-utilities fallback; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.

## Model-decision evidence procedure

Use PubMed as the required biomedical metadata baseline and treat Paperclip as best-effort full-text deepening:

- Search specifically for the contested decision, not merely the disease topic.
- Retain 3-10 relevant methods papers, reporting guidance, or design-specific simulations.
- Prefer methods papers and authoritative guidance over applied examples.
- Map each nontrivial decision to 1-3 sources with PMID, PMCID when available, DOI, query/date provenance, and verification status (a ledger status such as `verified`/`unverified`; it is not an evidence label).
- Label support `abstract` unless the exact claim was checked in full text; label it `full_text` only when Paperclip or another lawful full-text source was read (`figure`, `trial`, `regulatory`, or `documentation` when that is what was read).
- Record unavailable or contradictory evidence. Paperclip failure does not block a PubMed-supported recommendation, but the memo must state the full-text limitation.
- General web search is not an evidence source for the ledger. When neither PubMed MCP nor the `ce-pubmed` script is reachable, keep the reference-file seed identifiers as `unverified`, emit `evidence=none`, and say in the memo that no source was verified.

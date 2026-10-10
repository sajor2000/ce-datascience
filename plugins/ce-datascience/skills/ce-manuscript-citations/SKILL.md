---
name: ce-manuscript-citations
description: "Build evidence-traceable manuscript citations from PubMed and Paperclip and deliver a Word document with editable Zotero citation fields. Use when adding, auditing, or repairing citations in a DOCX manuscript, abstract, or submission package."
argument-hint: "[path/to/manuscript.docx or citation request] [optional: --style vancouver|apa]"
---

# Manuscript Citations

## Skill Value

- **Problem it solves:** Manuscript citations can be bibliographically plausible but unsupported, or visually correct while being static text that cannot be updated in Word.
- **Use when:** Adding, auditing, repairing, or packaging citations for a Word manuscript or other editable DOCX deliverable.
- **Output:** A source-traceable citation ledger and a DOCX whose in-text citations and bibliography remain editable through Zotero fields.
- **Ask only if:** The manuscript, target citation style, Zotero library, or field-bearing Word master is unavailable and the missing choice changes the deliverable.
- **Do not do:** Do not invent references, treat static superscripts as editable fields, write unsupported claims from abstracts as full-text findings, or silently mutate a Zotero library.

This skill separates evidence verification from Word field authoring. PubMed is the canonical resolver for PMID, DOI, and bibliographic metadata. Paperclip is the full-text and claim-support layer when available. Zotero owns citation numbering, bibliography records, citation style, and live Word fields. The agent writes the document only after the evidence ledger and field strategy are explicit.

## Required inputs and authority

1. Preserve the supplied original DOCX. Work on a new field-bearing master; never overwrite the source.
2. Identify the manuscript claims or citation markers that need support. Keep claim text separate from source metadata.
3. Confirm the target style and whether the document uses numeric, author-date, footnote, or journal-specific citations.
4. Confirm access to a Zotero library and the Word/Zotero integration. If Zotero fields cannot be created or verified, stop before claiming an editable citation deliverable.

Authority order:

1. The manuscript and author-approved claim list define what needs citation.
2. PubMed MCP resolves and verifies structured biomedical metadata.
3. Paperclip full text verifies whether the source actually supports the claim.
4. Zotero fields own the editable Word citation and bibliography representation.
5. A formatted citation string is a display/check artifact, never a substitute for a live field.

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** the canonical PMID/DOI metadata for every reference and the passage in each source that supports (or fails to support) the manuscript claim it is attached to.

## Evidence workflow

### 1. Resolve candidate sources with PubMed MCP

When a connected PubMed MCP server is available, use it rather than guessing or relying on a static web citation. Two servers are common; call by purpose with whichever spelling is connected:

- Search (`pubmed_search_articles` or `search_articles`) for a research question or claim cluster (query built from the claim's PICO terms; no manuscript data values).
- Partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`) for an author/journal/year/volume/page fragment.
- Metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`) after selecting PMIDs, to obtain the canonical title, authors, journal, year, and DOI; `pubmed_convert_ids` or `convert_article_ids` to fill a missing PMCID or DOI.
- Full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC) to read the claim-relevant passage; cite PubMed and include the DOI.
- `pubmed_format_citations` (default server only) renders a citation string to check the requested style for display. It never creates the Word field, and other connectors have no formatter.

Citation style (Vancouver, APA, journal-specific) in the deliverable is applied by Zotero when the field is inserted, never by an MCP formatter or a hand-typed string.

Record PMID, PMCID when present, DOI, title, authors, journal, year, query or lookup input, and a ledger status of `verified` (metadata confirmed by the metadata, citation-lookup, or ID-conversion tool above) or `unverified`. If PubMed MCP is unavailable, use the repository's `ce-pubmed` workflow or an approved NCBI fallback and label the provenance accordingly.

### 2. Verify claim support with Paperclip

When Paperclip MCP or the authenticated Paperclip CLI is available, use it for full-text verification:

1. Load the Paperclip instructions before issuing commands.
2. `search` the explicit `pmc` source for the claim or source set, or `lookup` the resolved DOI/PMID/PMCID directly.
3. `cat`, `grep`, or `scan` the relevant paper text and capture line-pinned evidence URLs; use `ask-image` when the claim rests on a figure.
4. Label each claim's evidence at the level read: `abstract`, `full_text`, `figure`, `trial`, `regulatory`, or `documentation`. A claim whose source was only resolved (identifiers and metadata, nothing read) carries no evidence label and stays `unverified` in the ledger status.

Paperclip evidence strengthens source support; it does not replace PubMed identity resolution. If Paperclip is unavailable, read the PubMed abstract (or PMC full text through `pubmed_fetch_fulltext` or `get_full_text_article`), label the claim at that level, and do not write full-text-supported language for an `abstract`-level claim.

### 3. Create the citation ledger

Create a local ledger beside the manuscript package, for example `manuscript/citations/citation-ledger.json` or `analysis/citations/citation-ledger.json`. Each record must include:

- stable key and manuscript location;
- claim text or claim summary;
- PMID and DOI when available;
- Zotero item key once resolved in the user's library;
- ledger status (`verified` or `unverified` metadata) and PubMed/Paperclip provenance (tool, query or identifier, date);
- evidence label (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, or `documentation`), separate from the ledger status, present only when the source was read;
- requested citation style;
- support status: `supported`, `partially_supported`, `unsupported`, or `unverified`;
- author-review note for every unresolved or conflicting item.

Do not promote `partially_supported`, `unsupported`, or `unverified` records into a finished citation without author review.

## Editable Word workflow

Use the document-editing workflow available in the host environment for DOCX manipulation and render QA. The citation-specific rules are:

1. Copy the original DOCX to a new field-bearing master before edits.
2. Resolve each supported PMID/DOI to the corresponding Zotero item; deduplicate by DOI, PMID, and normalized title/year before insertion.
3. Insert citations through Zotero's Word integration so the in-text citation and bibliography are live Zotero fields. Let Zotero own numbering, bibliography ordering, and style.
4. Never type numeric superscripts, author-date strings, or a bibliography as the final citation representation. Those may appear only in a temporary review artifact or a flattened derivative explicitly labeled static.
5. Refresh Zotero fields and verify that every inserted citation has a field code, a Zotero item association, and a bibliography entry.
6. Preserve the original document, field-bearing master, and ledger as separate artifacts. A PDF or flattened DOCX is a derivative, not the editable master.
7. Render the final DOCX and inspect every page. Run a structural field audit in addition to visual QA because rendering alone cannot prove that fields remain live.

## Audit output

Report:

- citation records resolved and unresolved;
- claims by evidence label (`abstract` versus `full_text`/`figure`) and ledger status;
- Zotero items inserted, deduplicated, or requiring author selection;
- field-bearing citations and bibliography count;
- static citation or field-loss findings;
- render and structural-audit status;
- remaining author decisions.

Use this handoff when another CE skill needs the ledger:

```text
__CE_CITATION_LEDGER__ path=<ledger-path> docx=<field-bearing-master> style=<style> supported=<n> unresolved=<n> fields_verified=<n>
```

## Failure handling

| Condition | Response |
|---|---|
| PubMed MCP unavailable | Use `ce-pubmed` or an approved NCBI fallback and label provenance; do not fabricate a PMID. |
| Paperclip unavailable | Continue with PubMed abstract or open PMC full-text evidence only and label each claim at the level read. |
| Zotero item missing | Add an unresolved ledger record and ask the author to select or import the item; do not create a fake field. |
| Word integration unavailable | Stop the editable-master claim and deliver only a clearly labeled ledger or static review copy if requested. |
| Citation style mismatch | Preserve the field-bearing master, record the mismatch, and resolve the style in Zotero before final refresh. |
| Render or field audit fails | Keep the source and master separate, fix the DOCX, and rerun both audits before delivery. |

## What this skill does not do

- It does not install or authenticate PubMed MCP, Paperclip, Zotero, Word, or a document connector automatically.
- It does not write to a Zotero library without an explicit user request and a reversible procedure.
- It does not treat Paperclip citation URLs, `pubmed_format_citations` output, or PubMed metadata strings as editable Word fields.
- It does not claim that a citation supports a manuscript statement when only metadata or an abstract was reviewed.

---
name: ce-literature-search
description: "Routes a literature request to PubMed, full-text evidence mapping, or authoritative web sources. Use when the user broadly asks for papers or evidence."
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

**MCP egress (every mode):** send PubMed, Paperclip, and other MCP or web tools only search terms, MeSH terms, PMIDs, DOIs, and titles, never data values, identifiers, row text, or data files; an endpoint approval does not cover third-party services.

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

Before any literature lookup, read `references/evidence-access.md` (PubMed and Paperclip MCP tools, fallbacks, and evidence rules); never invent a citation, effect size, or guideline item.

- **Look up here:** which connected source can answer each part of the request, and the PMID/PMCID/DOI plus query provenance that must travel with the handoff to the specialist skill.

## Search Contract

Before searching, record in chat (and in `analysis/literature/search-contract.md` when the project keeps analysis artifacts in the repository):

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

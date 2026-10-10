---
name: ce-pre-submission-audit
description: "Run the final manuscript handoff gate across Methods/Results discipline, clinical research voice, and scientific anti-slop. Use when any manuscript, abstract, cover letter, or grant-narrative draft is about to be delivered to an author or co-author."
---

# Pre-Submission Audit

## Skill Value

- **Problem it solves:** Drafts can reach authors with interpretation in Methods or Results, uncited attribution, or ungrounded AI-writing patterns.
- **Use when:** Any manuscript, abstract, cover letter, or grant-narrative draft is about to be handed off.
- **Output:** A corrected draft plus a concise section-by-severity audit summary.
- **Ask only if:** Section boundaries or the intended handoff scope cannot be identified from the draft.
- **Do not do:** Do not present known P0 or section-discipline failures as finished work, and do not invent citations or claims.

A single gate that runs before any manuscript text leaves your hands, combining `ce-manuscript-section-discipline`, `ce-clinical-research-voice`, and `ce-scientific-anti-slop`. This is not optional polish — run it silently before presenting any drafted or edited manuscript section, and report the results rather than presenting a self-certified-clean draft without having checked.

## What runs where

| Section | Skill applied | Bar to clear |
|---|---|---|
| Methods | `ce-manuscript-section-discipline` | No unsupported red-flag rationale; preserve concise rationale required by the applicable guideline, protocol, regulation, or reproducibility standard |
| Results | `ce-manuscript-section-discipline` | Zero unsupported red-flag phrases; every claim carries its statistic; zero editorializing adverbs |
| Abstract — Methods and Results subsections of a structured abstract | `ce-manuscript-section-discipline` | Same bar as body Methods/Results; an interpretive clause in an abstract Results subsection fails the gate |
| Introduction, Discussion, Abstract background/conclusions, cover letter, grant text | `ce-clinical-research-voice` + `ce-scientific-anti-slop` | Voice self-check passes; zero P0; every P1 AI-tell fixed or flagged for author judgment |
| Figure legends, table footnotes | `ce-manuscript-section-discipline` | Results rules apply; no interpretive clauses in legends |
| Whole document | `ce-scientific-anti-slop` | No uncited attribution; no thesaurus-swapped technical terms; em-dash and intensifier discipline held throughout |
| Citations (all sections) | Evidence access | Every citation carries a PMID, PMCID, or DOI; spot-checked claims are supported by the source at the labelled level |

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** spot-check that cited claims are supported by their source at the labelled level and that no citation lacks a PMID, PMCID, or DOI; route full reference repair to `ce-manuscript-citations`.

## Procedure

1. Identify section boundaries in the draft (Methods / Results / Discussion / Introduction / Abstract subsections / figure legends and table footnotes / other).
2. Run the Methods and Results text through the `ce-manuscript-section-discipline` red-flag list. Any unsupported hit is a required fix before delivery — move the content to Discussion or delete it. Preserve rationale that records a required or prespecified basis for a methodological choice; do not delete it merely because it answers "why." Treat rationale naming a reporting guideline, protocol, regulation, causal model, or prespecified evidence base as protected content: if its accuracy is uncertain, flag it for verification rather than silently deleting it or reducing the sentence to the method alone.
3. Run Discussion, Introduction, and other narrative text through the `ce-clinical-research-voice` self-check and the `ce-scientific-anti-slop` banned-construction list. Then check the whole document, including Methods, Results, legends, and footnotes, for the whole-document `ce-scientific-anti-slop` items: uncited attribution, thesaurus-swapped technical terms, non-definitional em-dashes, and ungrounded intensifiers.
4. Citation spot-check: list every citation and flag any without a PMID, PMCID, or DOI (`pubmed_convert_ids` or `convert_article_ids`, and `pubmed_lookup_citation` or `lookup_article_by_citation`, recover one from a partial reference). Then choose the citations behind the load-bearing claims (primary comparison, effect sizes, guideline items), resolve each with `pubmed_fetch_articles` or `get_article_metadata`, read the source at the stated level, and flag any claim the source does not support at that level. Never add, replace, or repair a citation from memory; a missing or unsupported citation is flagged for the author or routed to `ce-manuscript-citations`.
5. Compile findings into an audit report: section, quoted flagged phrase (short), issue category (interpretation-in-Methods / interpretation-in-Results / uncited-attribution / missing-identifier / unsupported-citation / throat-clearing / vague-declarative / ungrounded-intensifier / em-dash-overuse / thesaurus-swap / other), and the fix applied or recommended.
6. Apply P0 and Methods/Results fixes directly — do not leave known credibility or section-discipline failures for the author to catch. P1 items get fixed directly when the rewrite is unambiguous; flag for author judgment when a rewrite could change meaning. P2 items are noted, not blocking.
7. Present the corrected draft together with a short audit summary (counts by category, not a line-by-line transcript, unless the user asks for the full list) so the author can see what was caught and fixed without wading through the whole checklist.

## Non-negotiable bar

A draft does not go to an author with any of the following still present, regardless of how the request was phrased ("just get me a draft," "quick version," "don't worry about polish"):

- Any unsupported hedge, caveat, or interpretive clause inside Methods or Results, except factual statistical statements that report what the analysis showed and concise rationale required to document a prespecified methodological choice under the applicable reporting standard, protocol, regulation, or reproducibility requirement.
- Any uncited "studies show" / "research suggests" / "experts believe."
- Any statistical intensifier ("significant," "substantial," "robust") without its statistic attached.
- Any citation that lacks a PMID, PMCID, or DOI, or any spot-checked citation whose source does not support the claim at the labelled level, left unflagged.

Speed pressure from the user is not a reason to skip this gate — a fast draft with these three failures intact is not actually faster once the author has to catch them.

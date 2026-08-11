---
name: ce-pre-submission-audit
description: Run the final manuscript handoff gate across Methods/Results discipline, clinical research voice, and scientific anti-slop. Use before delivering any manuscript, abstract, cover letter, or grant-narrative draft to an author or co-author.
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
| Results | `ce-manuscript-section-discipline` | Zero red-flag phrases; every claim carries its statistic; zero editorializing adverbs |
| Abstract — Methods and Results subsections of a structured abstract | `ce-manuscript-section-discipline` | Same bar as body Methods/Results; an interpretive clause in an abstract Results subsection fails the gate |
| Introduction, Discussion, Abstract background/conclusions, cover letter, grant text | `ce-clinical-research-voice` + `ce-scientific-anti-slop` | Voice self-check passes; zero P0, zero P1 AI-tells |
| Figure legends, table footnotes | `ce-manuscript-section-discipline` | Results rules apply; no interpretive clauses in legends |
| Whole document | `ce-scientific-anti-slop` | No uncited attribution; no thesaurus-swapped technical terms; em-dash and intensifier discipline held throughout |

## Procedure

1. Identify section boundaries in the draft (Methods / Results / Discussion / Introduction / Abstract subsections / figure legends and table footnotes / other).
2. Run the Methods and Results text through the `ce-manuscript-section-discipline` red-flag list. Any unsupported hit is a required fix before delivery — move the content to Discussion or delete it. Preserve rationale that records a required or prespecified basis for a methodological choice; do not delete it merely because it answers "why."
3. Run Discussion, Introduction, and other narrative text through the `ce-clinical-research-voice` self-check and the `ce-scientific-anti-slop` banned-construction list.
4. Compile findings into an audit report: section, quoted flagged phrase (short), issue category (interpretation-in-Methods / interpretation-in-Results / uncited-attribution / throat-clearing / vague-declarative / ungrounded-intensifier / em-dash-overuse / thesaurus-swap / other), and the fix applied or recommended.
5. Apply P0 and Methods/Results fixes directly — do not leave known credibility or section-discipline failures for the author to catch. P1 items get fixed directly when the rewrite is unambiguous; flag for author judgment when a rewrite could change meaning. P2 items are noted, not blocking.
6. Present the corrected draft together with a short audit summary (counts by category, not a line-by-line transcript, unless the user asks for the full list) so the author can see what was caught and fixed without wading through the whole checklist.

## Non-negotiable bar

A draft does not go to an author with any of the following still present, regardless of how the request was phrased ("just get me a draft," "quick version," "don't worry about polish"):

- Any hedge, caveat, or interpretive clause inside Methods or Results, except concise rationale required to document a prespecified methodological choice under the applicable reporting standard, protocol, regulation, or reproducibility requirement.
- Any uncited "studies show" / "research suggests" / "experts believe."
- Any statistical intensifier ("significant," "substantial," "robust") without its statistic attached.

Speed pressure from the user is not a reason to skip this gate — a fast draft with these three failures intact is not actually faster once the author has to catch them.

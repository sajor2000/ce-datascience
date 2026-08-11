---
name: ce-scientific-anti-slop
description: Detect and remove generic AI-writing tells from scientific and clinical manuscript prose. Use when drafting or reviewing any manuscript text and as one pass of ce-pre-submission-audit; preserve passive Methods prose, definitional em-dashes, and statistically backed intensifiers.
---

# Scientific Anti-Slop Audit

## Skill Value

- **Problem it solves:** Scientific drafts can contain generic AI phrasing, uncited attribution, vague claims, and technical synonym drift.
- **Use when:** Drafting or reviewing any clinical or scientific manuscript text.
- **Output:** A prioritized P0/P1/P2 anti-slop audit with direct rewrites where meaning is unambiguous.
- **Ask only if:** A technical term, citation boundary, or manuscript section cannot be identified from the draft.
- **Do not do:** Do not ban valid passive Methods prose or alter technical meaning for stylistic variety.

Catalog of AI-writing tells adapted for formal scientific prose, drawn from two open-source AI-writing-tell catalogs — `hardikpandya/stop-slop` and `conorbronsdon/avoid-ai-writing` — with the generic rules reconciled against the constraints of clinical manuscript house style (`ce-clinical-research-voice`, `ce-manuscript-section-discipline`). Where a generic rule would break scientific convention, the calibration is stated explicitly below; do not apply the unqualified generic version to manuscript text.

## Calibration against the generic guides

The source catalogs ban passive voice outright, ban em-dashes outright, and treat any adverb or intensifier as a defect. None of that applies unmodified here:

- **Passive voice**: banned in Discussion/narrative prose (use "we"), required and correct in Methods for procedural steps. Flag passive only outside Methods, or where it's used in Methods to obscure who made an author-level decision that should be attributed to "we."
- **Em-dashes**: banned generically; here, the em-dash is sanctioned when it embeds a definition ("automation bias — the tendency to..."). Flag any non-definitional em-dash (P1), and flag definitional em-dash pile-up within a paragraph as a density signal (P2) — convert excess uses to parenthetical or appositive form.
- **Intensifiers** ("significant," "substantial," "robust"): banned generically as filler; here they are correct only when a statistic backs them in the same or adjacent sentence. Flag the ungrounded instance, not the grounded one.
- **Synonym rotation**: generically flagged as thesaurus-abuse; in science, precise technical terms (a named outcome, a named test, a named model) should be repeated verbatim, not varied for style. Flag any place a manuscript swaps a defined technical term for a looser synonym — this is a correctness issue here, not just a style one.

Everything else below applies to manuscript prose largely as in the source catalogs.

## Banned constructions (all sections)

**Throat-clearing openers** — state the content directly instead: "Here's the thing," "It is important to note that," "It should be noted that," "The reality is," "It turns out," "The truth is."

**Meta-commentary** — the manuscript should move, not announce its own structure: "In this section, we will...," "As we'll see...," "The rest of this discussion explores...," "Let me walk you through."

**Uncited attribution** — never permitted in scientific writing regardless of AI-tell status: "studies show," "research suggests," "experts believe," "it is well established that" without a citation. Either cite the specific source or state the claim as this study's own finding.

**Vague declaratives** — name the specific thing instead of announcing its importance: "The implications are significant" → state which implication; "The reasons are structural" → name the structural reason.

**Formulaic binary contrast** — "not only X but also Y," "This is not just a technical problem, it's a clinical one." State the point directly without the symmetric setup.

**Filler transitions and hedge-padding not covered by the intentional hedges in `ce-clinical-research-voice`** — "at the end of the day," "when it comes to," "in a world where," "moving forward." These have no place in formal scientific register.

**Business-jargon substitutes for precise terms** — "leverage," "unpack," "landscape," "deep dive," "game-changer." Use the plain or technical term instead (analyze, examine, context, setting).

**Empty conclusions** — "the future looks bright," "only time will tell," "as we move forward." A Discussion closes with a stated implication or a specific next study, not a generic gesture at the future.

## Severity tiers for the audit pass

- **P0 (credibility killers)** — uncited "studies show"/"experts believe"; unsupported interpretation, retrospective justification, or nonstatistical caveats inside Methods or Results (hand off to `ce-manuscript-section-discipline`, preserving required or prespecified methodological rationale and factual statistical statements); a calibrated intensifier with no statistic attached; a technical term thesaurus-swapped mid-manuscript.
- **P1 (obvious AI tell)** — throat-clearing openers, meta-commentary, formulaic binary contrasts, vague declaratives, any non-definitional em-dash.
- **P2 (stylistic polish)** — filler transitions, business-jargon substitutes, minor rhythm monotony (three consecutive sentences of near-identical length and structure).

## Audit workflow

1. Read the draft section by section.
2. Mark every instance from the banned-constructions list, tagging it P0/P1/P2 per the tiers above.
3. Fix P0 items first — these are correctness or credibility failures, not style preferences.
4. Fix P1 items by direct rewrite: state the point without the throat-clearing or the symmetric setup.
5. P2 items are optional polish; note them but don't block delivery on P2 alone.
6. Re-read once more for rhythm: are sentence lengths varied per `ce-clinical-research-voice`'s architecture guidance? Two consecutive sentences of the same length and shape is fine; three or more in a row reads as machine-generated.

For the combined gate across voice, section discipline, and this audit before a draft reaches an author, use `ce-pre-submission-audit`.

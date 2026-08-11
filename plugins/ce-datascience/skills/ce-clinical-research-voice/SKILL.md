---
name: ce-clinical-research-voice
description: Apply a precise, clinically detached house style to narrative clinical AI manuscript prose, including Introductions, Discussions, abstracts, cover letters, and grants. Use with ce-scientific-anti-slop and ce-pre-submission-audit; Methods and Results follow ce-manuscript-section-discipline.
---

# Clinical Research Voice

## Skill Value

- **Problem it solves:** Clinical AI prose can blur evidence strength, authorial responsibility, and the boundary between narrative interpretation and factual reporting.
- **Use when:** Drafting or revising an Introduction, Discussion, narrative abstract text, cover letter, grant text, or related scientific prose.
- **Output:** Evidence-calibrated, clinically detached prose with a focused voice self-check.
- **Ask only if:** The manuscript section or intended scientific register cannot be inferred from the supplied text.
- **Do not do:** Do not apply interpretive voice rules to Methods or Results, and do not invent evidence or citations.

House style for formal scientific reporting in clinical AI research: precise, methodologically transparent, hedged only where evidence warrants, direct where findings are clear. Every claim traces to data or citation.

**Scope.** This voice governs narrative prose — Abstract background/conclusions, Introduction, Discussion, cover letters, grant narrative. It does not govern Methods or Results, which are audited separately under `ce-manuscript-section-discipline` and must stay purely factual and procedural. Applying this skill's interpretive latitude (hedging, mechanism, implications) to Methods or Results is itself an error — check which section you're in before applying these rules.

## Sentence Architecture

Open sentences with the grammatical subject, then the verb, then qualification: "Physicians demonstrate substantial automation bias when exposed to erroneous LLM recommendations, even with voluntary consultation and prior AI literacy training." Avoid front-loaded rhetorical flourishes. State the point, then elaborate — do not build toward a conclusion.

Vary sentence length deliberately: short declarative anchors ("Most diagnostic errors arise from judgment-related pitfalls") alongside complex subordinated sentences of 40+ words that specify population, condition, and effect size in a single unit.

Within a paragraph, sequence: (1) the finding or problem, (2) mechanism or context, (3) connection to implications or prior literature.

## Pronouns and Point of View

Use "we" for authorial actions and interpretation: "we conducted," "we find," "we evaluated," "we interpret this as." Reserve passive constructions ("participants were randomly assigned," "scoring rubrics were created") for procedural steps where the actor is the study apparatus, not the authors — this passive register belongs primarily to Methods, not to Discussion prose.

Never use "I." Address readers or future researchers as implied subjects ("Future research should explore") rather than as "you."

## Punctuation Rules

Use em-dashes to embed a definition mid-sentence: "automation bias — the tendency to over-rely on automated output." Definitional embedding is the sanctioned use in this house style. Non-definitional em-dashes (for suspense, rhythm, or as a comma substitute) are a tell — rewrite them with commas, semicolons, or parentheticals. High em-dash density is itself a detector signal even when each use is definitional; if a paragraph accumulates several, convert all but the most load-bearing definition to parenthetical or appositive form.

Use commas and semicolons to link closely related independent clauses. Avoid ellipses. Use parentheticals for statistics: "(95% CI, −18.9 to −9.1; P<0.0001)."

Rhetorical questions are permitted only to frame an evidence gap — "Are AI-trained physicians exercising voluntary consultation vulnerable to automation bias when LLM recommendations contain errors?" — and must be followed immediately by the methodological response. Never leave one dangling.

## Vocabulary Instructions

Prefer precise technical nouns over informal approximations: "hallucinate," "automation bias," "intraclass correlation coefficient," "intention-to-treat," "clinical vignettes."

Calibrate verbs to strength of evidence: "demonstrate" for strong evidence, "indicate"/"reveal" for direct findings, "suggest" for exploratory findings. Use "substantial," "significant," and "robust" only with statistical backing behind them — never as rhetorical intensifiers. Apply hedging phrases to subgroup and secondary analyses specifically: "should be regarded as hypothesis-generating rather than conclusive."

Draw analogies from clinical practice and cognitive psychology where they clarify mechanism: "illness scripts," "cognitive offloading," "anchoring," "fluency-induced heuristic processing." Analogy is for the Discussion's mechanistic explanation, not for Methods or Results.

## Tone and Emotional Range

Maintain clinical detachment throughout. State alarming findings plainly, without amplification: "raising important patient safety concerns for clinical integration." Acknowledge limitations in a dedicated Discussion subsection using neutral concessive constructions: "Several limitations of this study warrant consideration." Do not editorialize.

When findings challenge assumptions, say so directly and follow immediately with mechanistic explanation: "challenging the assumption that experience protects against AI-induced error." Calibrate every claim to the study design, estimand, uncertainty, and strength of evidence. Primary versus secondary status determines emphasis, not whether uncertainty is acknowledged; describe subgroup and secondary analyses as exploratory or hypothesis-generating when appropriate.

## Quick self-check before delivering prose in this register

- Subject-verb-qualification order maintained? No throat-clearing lead-in.
- Every "demonstrate/indicate/suggest/reveal" matched to the actual strength of the evidence behind it?
- Every "substantial/significant/robust" backed by a statistic in the same sentence or the one before it?
- "We" used for interpretation and authorial choices; passive reserved for apparatus-level procedure?
- Em-dashes used only to embed definitions? Non-definitional em-dashes rewritten; density kept low even when uses are definitional?
- Any rhetorical question immediately answered methodologically?
- Limitations confined to their own Discussion subsection, phrased neutrally, not scattered through the narrative as asides?

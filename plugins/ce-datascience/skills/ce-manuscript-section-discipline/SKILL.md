---
name: ce-manuscript-section-discipline
description: Enforce the facts-only boundary for Methods, Results, figure legends, and table footnotes in clinical and scientific manuscripts. Use when drafting or auditing these sections; interpretation, rationale, caveats, and hedging belong in Discussion.
---

# Manuscript Section Discipline

## Skill Value

- **Problem it solves:** Methods and Results often acquire justification, caveats, or interpretation that belongs in Discussion.
- **Use when:** Drafting, editing, or auditing Methods, Results, figure legends, or table footnotes.
- **Output:** A factual, past-tense section or a red-flag audit with required move-to-Discussion fixes.
- **Ask only if:** Section boundaries or the difference between a reported fact and an interpretation is unclear.
- **Do not do:** Do not justify methods, explain why results occurred, or soften a required section-discipline fix.

Methods and Results report what was done and what was found. Discussion is where interpretation, mechanism, retrospective justification, caveats, and hedging about generalizability belong. Methods may retain concise rationale that a reporting guideline, protocol, regulatory requirement, or reproducibility standard requires to explain a prespecified choice. This skill enforces that boundary and audits drafts against it before they leave your hands.

## The rule, stated once

**Methods and Results: facts plus required, prespecified methodological rationale; never advocacy, retrospective interpretation, or caveats.**
**Discussion: this is where you interpret the findings, explain mechanism, justify methodological choices in retrospect, and state limitations.**

If a sentence in Methods or Results answers "so what" or "does this hold up," it belongs in Discussion — move it or cut it. A sentence answering "why" stays when it records rationale required by the applicable reporting guideline, protocol, regulation, or reproducibility standard; otherwise move it or cut it. Do not soften retrospective interpretation by writing conditionally ("this approach was intended to..."); intent and advocacy are still not Methods facts.

## Methods section rules

- State design, setting, population, variables, and procedures in the order performed or defined.
- Passive constructions are expected and correct here for procedural steps where the actor is the study apparatus: "Patients were randomly assigned," "Scoring rubrics were created," "Vignettes were reviewed by two board-certified physicians." This is the one section where `ce-clinical-research-voice`'s general preference for "we" gives way to passive procedure-description; use "we" only for author-level decisions that must be attributed ("we defined the primary outcome as...", "we prespecified...").
- Preserve concise rationale when the applicable reporting guideline, protocol, regulation, or reproducibility requirement requires it — for example, the prespecified basis for confounder selection, reference-standard choice, cutoff selection, or study design. State the source or prespecified basis without claiming that the choice is superior, appropriate, robust, or validated beyond the evidence. "Because," "in order to," "to account for," and "to ensure" are signals to inspect, not automatic deletion rules: retain a required rationale, and move retrospective advocacy or unsupported explanation to Discussion.
- No caveats about the method itself in Methods. If a design choice has a limitation, that limitation is stated in Discussion, not flagged in Methods; do not confuse a required rationale for the choice with a caveat about its limitations.
- Report in past tense throughout ("patients were assigned," "the model was trained"); present tense in Methods or Results is a drafting tell and usually marks a sentence that drifted in from Discussion.
- Worked example for the most common near-miss, covariate adjustment: "Models were adjusted for age, sex, and SOFA score to account for confounding" → "Models were adjusted for age, sex, and SOFA score; the covariates were prespecified from the causal model and prior clinical evidence." Keep the prespecified or reporting-required basis when it is required to reproduce or assess the study; remove only unsupported claims that the adjustment set is superior or robust.

## Results section rules

- Report findings with the statistics that support them: point estimates, confidence intervals, p-values, sample sizes, exactly where the finding is stated.
- No adjectival amplifiers that aren't tied to a statistic in the same sentence. "Significant," "substantial," "robust" are permitted only immediately alongside their supporting statistic; strip them everywhere else.
- No explanatory clauses about why a result occurred. "X decreased, likely because Y" — the "likely because Y" is interpretation and moves to Discussion; Results states only that X decreased, by how much, with what precision.
- No editorializing adverbs or framing words: "notably," "importantly," "interestingly," "unsurprisingly," "as expected," "unfortunately." These editorialize a finding rather than report it, even when true.
- Statistical hedges about the finding itself are factual and stay: "did not reach statistical significance," "the interaction term was not significant (P=0.34)." These describe what the analysis showed, not why — they are not interpretation.

## Red-flag phrase list (Methods and Results)

Treat these as required review flags, not automatic deletion rules. Preserve a phrase when it states rationale required by the applicable reporting guideline, protocol, regulation, or reproducibility standard; otherwise move it to Discussion or delete it:

- "in order to ensure," "to account for," "this approach was chosen because," "to minimize the risk of"
- "may reflect," "likely due to," "possibly because," "suggesting that," "which indicates," "consistent with what would be expected"
- "importantly," "notably," "interestingly," "unfortunately," "as expected," "unsurprisingly"
- "it should be noted that," "a caveat is that," "one limitation of this approach is"
- evaluative concessive constructions — "although the sample was small, X" (the "although..." clause passes judgment on the design; state the sample size as fact and put any concern about it in Discussion). Factual concessives that link two reported facts are fine: "Although 12 participants withdrew, the intention-to-treat analysis included all 220" reports, it does not caveat.
- any parenthetical giving a reason rather than a statistic

## Figure legends and table footnotes

Legends and footnotes follow Results rules, not Discussion rules — they are the most common place interpretation sneaks past a section-level audit. A legend states what the figure shows, the population, and the statistics displayed; it does not explain why the pattern occurred or what it implies. "Figure 2. Automation bias by specialty, suggesting that experience does not protect against AI-induced error" fails; the clause after the comma moves to Discussion. Abbreviation definitions, statistical-test identification, and error-bar definitions are factual and belong in the legend.

## Audit workflow

1. Draft the Methods or Results section using the rules above.
2. Re-read sentence by sentence. For each sentence, ask: is this a description of what was done or what was found, and does any rationale state a required or prespecified basis? Flag "so that," "which suggests," editorializing adverbs, and rationale that is neither required nor prespecified.
3. For every flagged sentence: either move the interpretive clause to the Discussion draft (it usually belongs there and often improves Discussion), or delete it if it adds no factual content.
4. Re-read the section once more with the red-flag list open. Zero matches is the bar, not "fewer" matches.
5. Only after this pass is a Methods or Results draft ready to hand to an author. This step is mandatory, not optional, and applies even to sections the user has not explicitly asked you to audit — audit by default whenever you produce or edit Methods/Results text.

For the full pre-delivery gate across the whole manuscript (Methods/Results discipline plus voice plus AI-tell removal), use `ce-pre-submission-audit`.

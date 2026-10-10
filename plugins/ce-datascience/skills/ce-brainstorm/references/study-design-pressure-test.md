# Study Design Pressure Test (Standard and Deep)

Read this in Phase 1.2 for Standard and Deep scope. It is agent-internal analysis, not a user-facing checklist: note which gaps actually exist in the opening, then raise only those during Phase 1.3, folded into dialogue rather than fired as a pre-flight gauntlet. A fuzzy opening may earn three or four probes; a well-framed one may earn zero.

## Standard gap lenses

- **Prior evidence gap.** The opening asserts a question or hypothesis without pointing to published studies, pilot data, preliminary analyses, or clinical observations that ground it. Run the literature pulse in `references/evidence-access.md` first, then ask what existing evidence supports it and whether pilot data exists, naming what the pulse found (PMIDs, `abstract`) so the user supplies only what the literature cannot.
- **Population specificity gap.** The population is abstract enough that the agent would silently invent who is included. Ask for the specific population: inclusion/exclusion criteria, clinical setting, timeframe.
- **Equipoise / comparison gap.** The current standard of care or comparison group, equipoise, or what happens if nothing changes is not visible. Ask what the current standard or comparison group is, even if imperfect, and what changes if the study is never done.
- **Design appropriateness gap.** A particular design is treated as the approach rather than the evidence it should generate, and has not been checked against simpler designs. Ask whether a simpler design (cross-sectional vs. longitudinal, existing data vs. new collection) could answer the question.

## Standard and Deep domain probes

- **PICO/PECO framing.** Population, Intervention or Exposure, Comparison, Outcome: probe any missing element.
- **Comparison group validity.** Is it a true control, or could selection bias confound the comparison?
- **Confounding strategy.** Adjustment, matching, restriction, stratification, or instrumental variables? When absent, ask for the key potential confounders and how they will be addressed.
- **Outcome measurement validity.** How is the outcome operationalized: a validated measure, ICD/CPT definition, lab threshold, or clinical assessment tool?
- **Data access feasibility.** Is the data available, accessible, and of sufficient quality? Any IRB, data use agreement, or linkage barriers? Is the sample size likely sufficient?

## R-specific probes

Fire alongside the domain probes when the stack profile shows R as primary or secondary language:

- **Data format.** Tidy (long) or wide; is a pivot planned? Inconsistent format causes silent dplyr/group_by errors.
- **Package ecosystem.** "What's the primary data manipulation approach -- tidyverse, data.table, or base R?" Mixing paradigms adds error risk.
- **Results table formatting.** "How will results tables be formatted for the final report?" (`gt`, `flextable`, `kableExtra`, `modelsummary`; affects regulatory submission readiness.)
- **Power analysis package.** "What power analysis approach and package is planned?" (`pwr` simple tests, `simr` mixed models, `powerSurvEpi` survival, `WebPower` diverse designs.)

## Synthesis questions (agent judgment, not gap lenses)

- Is there a nearby framing that generates more actionable evidence without more analytical cost? What complexity does it add?
- Given data availability, goals, and constraints, what is the single highest-leverage move now: the question as framed, a reframing, one adjacent analysis, a simplification, or doing nothing?

Favor moves that compound evidence, reduce analytical carrying cost, or make the study meaningfully more rigorous. Sharpen the conversation; do not bulldoze the user's intent.

## Deep additions

- **Deep (analysis and program):** Is this an isolated analysis, or does it move the broader research program where it wants to go?
- **Deep — program** also adds:
  - **Durability gap.** Significance rests on clinical practice or evidence that may shift predictably within the user's horizon. Ask how the question holds under the most plausible near-term shifts (new treatments, guideline changes, data availability) and push past answers every group could make.
  - What adjacent study could be designed by accident instead, and why is it the wrong one?
  - What would have to be true in the clinical or scientific landscape for this study to be irrelevant?

These feed the Scope Boundaries subsections ("Deferred for later", "Outside this study's scope") and Dependencies / Assumptions in the requirements document.

## Prose probe examples for Phase 1.3

One per gap; each found gap gets its own probe:

- *Evidence:* "What's the strongest prior evidence — published study, pilot data, clinical observation — that this research question is worth pursuing?"
- *Specificity:* "Can you name the specific patient population and setting, or are you reasoning from a general category?"
- *Counterfactual:* "What do clinicians or researchers do today when this question arises — is there a current standard, even if imperfect?"
- *Design appropriateness:* "Before we commit to a study design — what's the simplest version that would still generate actionable evidence?" When this gap is present, fire it as the final rigor probe before Phase 2, whether or not a design has emerged, so Phase 2 does not inherit an unexamined framing.
- *Durability (Deep — program):* "Under the most plausible near-term shifts in clinical practice or evidence, how does this research question hold?"

If an answer reveals genuine uncertainty, record it as an explicit assumption in the requirements document rather than skipping the probe.

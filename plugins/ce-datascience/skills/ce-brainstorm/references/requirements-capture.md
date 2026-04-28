# Requirements Capture

This content is loaded when Phase 3 begins — after the collaborative dialogue (Phases 0-2) has produced durable decisions worth preserving.

---

This document should behave like a lightweight study protocol or analysis brief without excessive ceremony. Include what planning needs to execute well, and skip sections that add no value for the scope.

The requirements document is for study design definition and scope control. Do **not** include implementation details such as specific packages, SQL queries, model specifications, file layouts, or code structure unless the brainstorm is inherently about a methodological or analytical architecture decision and those details are themselves the subject of the decision.

## Section matrix

| Section | Lightweight | Standard / Deep-analysis | Deep-program |
|---|---|---|---|
| Problem Frame | Required | Required | Required |
| Research Question | Required | Required | Required |
| Study Design | Omit unless triggered | Required | Required |
| Study Population | Omit unless triggered | Required | Required |
| Exposure / Intervention | Omit unless triggered | Required | Required |
| Outcome(s) | Omit unless triggered | Required | Required |
| Confounding Strategy | Omit unless triggered | Triggered (see below) | Required |
| Actors | Omit unless triggered | Triggered (see below) | Triggered (see below) |
| Study Phases | Omit unless triggered | Triggered (see below) | Expected by default |
| Requirements | Required | Required (with R-IDs) | Required (with R-IDs) |
| Acceptance Examples | Omit unless triggered | Triggered (see below) | Triggered (see below) |
| Success Criteria | Required | Required | Required |
| Scope Boundaries | Required (single list) | Required (single list) | Required (split into "Deferred for later" and "Outside this study's scope") |
| Key Decisions | Include when material | Include when material | Include when material |
| Dependencies / Assumptions | Include when material | Include when material | Include when material |
| Outstanding Questions | Include when material | Include when material | Include when material |
| Next Steps | Required | Required | Required |

## Triggered sections — when to include

**Study Design** — include at Standard and Deep tiers. Describes the study design type (retrospective cohort, cross-sectional, case-control, RCT, quasi-experimental, etc.) and justification for why this design fits the research question.

**Study Population** — include at Standard and Deep tiers. Describes inclusion/exclusion criteria, clinical setting, timeframe, and expected sample size.

**Exposure / Intervention** — include at Standard and Deep tiers. Describes the primary exposure or intervention being studied, how it is defined and measured, and its temporal relationship to the outcome.

**Outcome(s)** — include at Standard and Deep tiers. Describes primary and secondary outcomes, how each is operationalized (ICD codes, lab thresholds, clinical assessment tools), and measurement timing.

**Confounding Strategy** — include when confounding is a material concern (most observational studies). Describes known confounders and the planned approach: adjustment, matching, restriction, stratification, instrumental variables, or sensitivity analyses.

**Actors** — include when multiple humans, agents, or systems are meaningfully involved, or when decisions change based on whose perspective is optimized for. Frame as study roles: computational scientist, principal investigator (PI), review agents, data stewards, clinical domain experts.

**Study Phases** — include when the work involves multi-step analysis or coordinates across existing workflows. At Deep-program tier, include 2-4 primary study phases by default; omit only when the study is not meaningfully phase-shaped (e.g., pure descriptive analysis) and Actors, Requirements, Scope Boundaries, and Acceptance Examples already prevent downstream invention of analysis paths. When omitting at program tier, note the reason in the doc.

**Acceptance Examples** — include when a requirement's expected result is hard to pin down without a concrete scenario. Frame as analysis validation scenarios. Each example disambiguates one or more requirements via a `Covers: R-IDs` back-reference. Examples are definitive for what they describe but the section is not exhaustive — only include examples where the requirement alone is ambiguous.

## Template

Use this template and omit sections per the matrix above. At Deep-program tier, keep the Scope Boundaries split. At other tiers, use the single Scope Boundaries list.

```markdown
---
date: YYYY-MM-DD
topic: <kebab-case-topic>
---

# <Topic Title>

## Problem Frame

[Who is affected, what is the evidence gap, and why it matters clinically or scientifically.]

---

## Research Question

[State the primary research question. Use PICO/PECO format when applicable:]
- **Population:** [Who is being studied — clinical setting, demographics, inclusion/exclusion]
- **Intervention / Exposure:** [What is being studied — treatment, exposure, risk factor]
- **Comparison:** [What is the reference group — standard of care, unexposed, historical control]
- **Outcome:** [What is being measured — primary endpoint, how operationalized]

[State the hypothesis, if applicable.]

---

## Study Design

[Study design type (retrospective cohort, cross-sectional, case-control, RCT, quasi-experimental, etc.) and rationale for why this design fits the research question.]

---

## Study Population

[Detailed inclusion/exclusion criteria, clinical setting, timeframe, expected sample size.]

---

## Exposure / Intervention

[How the exposure or intervention is defined, measured, and its temporal relationship to the outcome.]

---

## Outcome(s)

[Primary and secondary outcomes. How each is operationalized (ICD/CPT codes, lab thresholds, clinical assessment tools, composite endpoints). Measurement timing and follow-up period.]

---

## Confounding Strategy

[Include when triggered. Known or suspected confounders and the planned approach: adjustment variables, propensity score matching, restriction, stratification, instrumental variables, sensitivity analyses.]

---

## Actors

[Include when triggered. Each actor gets a stable A-ID and a one-line role description.]

- A1. [Role, e.g., Computational scientist]: [What they do in this study]
- A2. [Role, e.g., Principal investigator]: [What they do in this study]

---

## Study Phases

[Include when triggered. Each phase has trigger, actors, steps, outcome, and a Covered by back-reference.]

- F1. [Phase name, e.g., Data extraction]
  - **Trigger:** [What initiates the phase]
  - **Actors:** A1, A2
  - **Steps:** [3-7 steps, prose or short list]
  - **Outcome:** [What is true after the phase completes]
  - **Covered by:** R1, R2, R5

---

## Requirements

[Group under bold inline headers when requirements span distinct concerns. Keep R-IDs sequential across groups — numbering does not restart per group.]

**[Group header, e.g., "Data extraction and cohort definition"]**
- R1. [Concrete requirement]
- R2. [Concrete requirement]

**[Group header, e.g., "Analysis and modeling"]**
- R3. [Concrete requirement]

---

## Acceptance Examples

[Include when triggered. Each example is an analysis validation scenario; the list is not exhaustive.]

- AE1. **Covers R1, R2.** Given [data state], when [analysis step], [expected result].
- AE2. **Covers R4.** Given [data state], when [analysis step], [expected result].

---

## Success Criteria

- [How we will know this answered the right research question — clinical or scientific outcome.]
- [How a downstream agent or implementer can tell the handoff was clean.]

---

## Scope Boundaries

[At Lightweight, Standard, and Deep-analysis tiers, use a single list.]

- [Deliberate non-goal or exclusion]

[At Deep-program tier, split into two subsections:]

### Deferred for later

- [Work that will be done eventually but not in the initial analysis]

### Outside this study's scope

- [Adjacent study we could design but are rejecting — scope decision, not a deferral]

---

## Key Decisions

- [Decision, e.g., study design choice, method selection]: [Rationale]

---

## Dependencies / Assumptions

- [Material dependency or assumption, e.g., data availability, IRB approval, data use agreement, prior approvals, minimum sample size]

---

## Outstanding Questions

### Resolve Before Planning

- [Affects R1][Study design decision] [Question that must be answered before planning can proceed]

### Deferred to Planning

- [Affects R2][Methodological] [Question answered during planning or data exploration]
- [Affects R2][Needs research] [Question likely requiring literature review or data profiling during planning]

---

## Next Steps

[If `Resolve Before Planning` is empty: `-> /ce-plan` for structured analysis planning]
[If `Resolve Before Planning` is not empty: `-> Resume /ce-brainstorm` to resolve blocking questions before planning]
```

## ID and layout rules

**Stable IDs.** Standard and Deep scope always assign R-IDs to requirements. Triggered sections use their own prefixes: `A` for Actors, `F` for Study Phases, `AE` for Acceptance Examples. No other ID namespaces.

**ID format.** Use `R1.`, `A1.`, `F1.`, `AE1.` as a plain prefix at the start of the bullet — do not bold the ID. The prefix is visually distinctive on its own.

**Bold leader labels** inside Study Phases and Acceptance Examples (e.g., `**Trigger:**`, `**Covers R4, R8.**`) give the bullet structure without needing tables or deeper heading levels.

**Horizontal rules (`---`)** between top-level sections in Standard and Deep docs. Omit for Lightweight.

**Grouping within Requirements.** When Standard or Deep requirements span distinct concerns, group them under bold inline headers (not H3s) within the Requirements section. The trigger is distinct logical areas, not item count — even four requirements benefit from headers if they cover three different topics. Group by study concern (e.g., "Data extraction and cohort definition", "Analysis and modeling", "Sensitivity analyses"), not by the order they were discussed. Skip grouping only when all requirements are about the same thing.

**Tables** — only for genuinely comparative info. Bullets are cheaper and more portable for content lists.

## Size heuristics

- If a capability-named group has only one requirement, ungroup it.
- If total requirements exceed ~15-20, stop and ask whether this is one brainstorm or several.
- If a requirement can be fully described in a single short bullet with no sub-items, it probably doesn't need grouping at all.
- For Lightweight docs with only 1-3 simple requirements, plain bullets without R-IDs are acceptable.

## Visual communication

Include a visual aid when the requirements would be significantly easier to understand with one. Read `references/visual-communication.md` for the decision criteria, format selection, and placement rules.

## When a document is warranted

- **Lightweight** — keep the document compact. Skip document creation when the user only needs brief alignment and no durable decisions need to be preserved.
- **Standard and Deep (analysis or program)** — a requirements document is usually warranted. When the work is simple, combine sections rather than padding them. A short requirements document is better than a bloated one.

## Finalization checklist

Before finalizing:

- What would `ce-plan` still have to invent if this brainstorm ended now?
- Does every Standard/Deep requirement have either an observable analytical result or a stated reason it is structural?
- Do Success Criteria cover both scientific/clinical outcome and downstream-agent handoff quality?
- Is the Research Question complete with all applicable PICO/PECO elements?
- Are Study Population, Exposure/Intervention, and Outcome(s) specific enough to begin analysis planning?
- If a Confounding Strategy is needed, has it been specified?
- If Actors are named, is each actor mentioned in the problem represented in at least one requirement, study phase, or scope boundary?
- If Study Phases are present, does each phase identify actor, trigger, outcome, and a failure or escape path when relevant?
- At Deep-program tier: if Study Phases are omitted, is the reason stated in the doc, and do Actors, Requirements, Scope Boundaries, and Acceptance Examples together prevent downstream invention of analysis paths?
- At Deep-program tier: does Scope Boundaries distinguish "Deferred for later" from "Outside this study's scope"?
- Do any requirements depend on something claimed to be out of scope?
- Are any unresolved items actually study design decisions rather than planning questions?
- Did analysis implementation details leak in when they shouldn't have?
- Do any requirements claim that data or infrastructure is absent without that claim having been verified against the codebase? If so, verify now or label as an unverified assumption.
- Is there a low-cost change that would make this materially more useful?
- Would a visual aid (study design diagram, comparison table, CONSORT-style flowchart) help a reader grasp the requirements faster than prose alone?

If planning would need to invent study design, scope boundaries, or success criteria/endpoints, the brainstorm is not complete yet.

Ensure `docs/brainstorms/` directory exists before writing.

## Outstanding questions guidance

If a document contains outstanding questions:

- Use `Resolve Before Planning` only for questions that truly block planning.
- If `Resolve Before Planning` is non-empty, keep working those questions during the brainstorm by default.
- If the user explicitly wants to proceed anyway, convert each remaining item into an explicit decision, assumption, or `Deferred to Planning` question before proceeding.
- Do not force resolution of methodological questions during brainstorming just to remove uncertainty.
- Put methodological questions, or questions that require data profiling or literature review, under `Deferred to Planning` when they are better answered there.
- Use tags like `[Needs research]` when the planner should likely investigate the question rather than answer it from repo context or data profiling alone.
- Carry deferred questions forward explicitly rather than treating them as a failure to finish the requirements doc.

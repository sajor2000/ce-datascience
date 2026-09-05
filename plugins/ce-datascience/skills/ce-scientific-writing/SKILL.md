---
name: ce-scientific-writing
description: Draft, revise, or audit evidence-bound scientific manuscripts across journals and disciplines. Use for full papers, sections, abstracts, and responses when the work must preserve claim provenance, reporting-guideline fit, statistical meaning, and author voice without imposing one journal's style.
---

# Scientific Writing

## Skill Value

- **Problem it solves:** Scientific prose can sound polished while drifting from the study question, analysis, evidence, or target publication.
- **Use when:** Planning, drafting, revising, or auditing a scientific manuscript, section, abstract, or reviewer response.
- **Output:** Usable prose or an actionable audit, plus unresolved evidence gaps and the checks performed.
- **Ask only if:** The deliverable, study design, target publication, or controlling source cannot be inferred and the missing choice would change the work.
- **Do not do:** Do not invent results, citations, methods, ethics determinations, or author decisions. Do not apply one journal's rules unless that journal and article type are established.
- **Interaction:** Check project and conversation evidence first. Ask one decision-changing question at a time using the current harness's blocking question UI; if unavailable, present numbered choices and wait.

Write from the study outward. Scientific validity, source traceability, and statistical meaning control the prose. Journal style and sentence polish come later.

## Establish the writing contract

Identify the requested task, intended readers, study design, manuscript section, target journal or venue, and controlling artifacts. Use this authority order:

1. Verified data, frozen results, protocol, and approved SAP.
2. Applicable reporting guideline and current target-journal instructions.
3. Project terminology, claim ledger, display shells, and author voice guidance.
4. Exemplars and general style preferences.

For each empirical claim, preserve its population, denominator, unit, time period, estimate, uncertainty, analysis status, and source. Label missing support instead of filling it with plausible text. Exemplars may guide structure or cadence, but never supply facts or policy.

Use `ce-checklist-match` when the reporting guideline is not already established. Use live journal instructions only for a named submission target. A generic biomedical profile is not proof of compliance with a specific journal.

Read [scientific-writing-patterns.md](references/scientific-writing-patterns.md) when drafting or revising prose. Use its PubMed-grounded examples to identify sentence functions and reporting content, not as prose to imitate.

Before opening a manuscript or supporting artifact that may contain patient-level content, check the current conversation for the user's prior confirmation that both the data environment and active model endpoint are compliant for PHI/PII. If confirmation is absent or ambiguous, ask once using the Skill Value interaction rule with "Yes, both are compliant" and "No or unsure." If the answer is no, work only from de-identified excerpts, metadata, or reviewed aggregates.

Authorization permits necessary editing in the approved environment. Never reproduce PHI/PII or patient-level source details in responses, logs, screenshots, citations, or unrestricted exports. When editing an approved artifact in place, preserve protected source details only when the destination is approved and the detail is scientifically necessary; otherwise use a visible placeholder and flag it for author or privacy review.

## Choose the route

### Plan or outline

Build a compact claim-evidence outline before drafting. State the research question or objective, the primary estimand or descriptive target, the main answer supported by the results, and the purpose of each section. Under each section, list the evidence it will use and any open loop.

Keep open loops visible as `evidence needed`, `analysis needed`, or `author decision needed`. A thesis in scientific writing is the strongest claim the design and results support, not the most provocative framing.

### Draft

For a full empirical manuscript, default to this order when the available artifacts permit it: displays and result ledger, Results, Methods, Discussion, Introduction, abstract, then title. Follow another order when the article type, journal, or user's materials require it.

Use `ce-manuscript-section-discipline` for Methods, Results, legends, and table notes. Use `ce-clinical-research-voice` only when its clinical register fits the assignment. Keep citations attached to the claims they support. Do not turn an association into causation, a secondary analysis into a primary finding, or absence of evidence into evidence of no effect.

### Revise

First perform a developmental pass. For each section, write one sentence stating what it contributes to the paper. Flag content that does not serve that function, missing logical steps, unsupported claims, duplicated findings, and conclusions that outrun the design.

Then test the paper from a skeptical scientific reader's position. Surface credible alternative explanations, bias, measurement limits, scope conditions, and likely reviewer objections. Address them only with available evidence or calibrated limitations. Do not manufacture controversy or quietly replace the authors' scientific claim.

Only after the argument and evidence are stable, perform the line edit. Preserve technical terms, uncertainty, citations, author voice, and meaning. Remove generic framing, inflated claims, and unsupported authority language. Use `ce-scientific-anti-slop` as a calibrated review pass, not a ban on warranted hedging, Methods passive voice, or precise domain terminology.

### Audit or finalize

For an audit, report findings first in this order: evidence or provenance failure, inference risk, Methods or Results boundary violation, cross-artifact inconsistency, reporting-guideline or journal mismatch, then prose quality. Cite exact locations and distinguish deterministic checks from scientific judgment.

Before author handoff, run `ce-pre-submission-audit`. Use `ce-manuscript-citations` when Word citations or reference repair are in scope. Never describe a manuscript as submission-ready while unresolved evidence, authorship, ethics, disclosure, data-sharing, citation, or journal-compliance blockers remain.

## Delivery contract

For drafting or revision, lead with the usable text or edited artifact. Follow it with a concise summary of material changes, unresolved evidence gaps, and verification performed. For an audit, lead with actionable findings and proposed fixes.

Separate the handoff into `verified`, `author decision needed`, and `not checked`. Preserve human author accountability for every claim, number, citation, and disclosure.

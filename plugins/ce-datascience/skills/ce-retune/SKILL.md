---
name: ce-retune
description: "Measure and improve a CE skill corpus against a declared behavioral benchmark; maintainer use only."
disable-model-invocation: true
argument-hint: "[target model or symptom] [corpus path; default plugins/ce-datascience/skills] [bar:<n>]"
---

# Retune a Skill Corpus

## Skill Value

- **Problem it solves:** Skill prose changes are not evidence of improved agent behavior.
- **Use when:** A CE maintainer needs to improve a skill corpus for a model, failure pattern, or measurable quality regression.
- **Output:** A benchmark-backed retuning report or a precise refusal when measurement prerequisites are absent.
- **Ask only if:** The declared benchmark bar or corpus target is genuinely ambiguous.
- **Do not do:** Edit skills without a baseline, weaken safety gates, or represent deterministic checks as live-model proof.

This maintainer-only workflow improves skill behavior through measurement, not prose preference. It requires a benchmark harness that can run a declared baseline and candidate corpus under comparable conditions.

## Preconditions

Require a target corpus, representative cases, a scoring command, baseline evidence, and a pre-declared acceptance bar. CE's versioned behavioral cases and fresh-context scoring are the default harness. If any prerequisite is missing, stop with a concrete setup gap; do not edit skills or claim a retune occurred.

## Workflow

Measure the baseline and noise floor, classify repeated failures, make one bounded change class at a time, then rerun the same frozen cases. Preserve source hashes, prohibit live prompts or credentials in committed artifacts, and distinguish deterministic validation from live-model evidence. Stop when the acceptance bar is met or evidence shows the claimed improvement cannot be supported.

## Output

Write a concise maintainer report under `docs/solutions/skill-design/` describing benchmark inputs, baseline/candidate evidence, changes, remaining failures, and whether the bar cleared. Never rewrite release versions or use retuning to weaken safety gates.

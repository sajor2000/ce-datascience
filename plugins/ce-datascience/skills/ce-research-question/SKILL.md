---
name: ce-research-question
description: 'Hardens a fuzzy clinical or biomedical research question into a structured PICO + FINER + suggested PubMed query stored at analysis/research-question.yaml so /ce-pubmed and /ce-checklist-match consume it directly. Use whenever the user has an idea for a study but it is not yet a PICO ("we want to look at sepsis bundles in the ICU"), wants to convert an /ce-ideate biomedical-mode survivor into a hardened question, mentions PICO, FINER, "frame the research question", "what is my hypothesis", "is this question worth doing", or precedes the rest of the biomedical lifecycle (/ce-pubmed, /ce-method-extract, /ce-checklist-match, /ce-cohort-build). Sits between /ce-ideate biomedical-mode and /ce-pubmed in the lifecycle. Output is a single YAML file other skills read; this skill writes data, not prose.'
argument-hint: "<one-line research question>, optional: --ideation-survivor <path>"
---

# Research Question Hardening

Turns a fuzzy clinical research question into a structured `analysis/research-question.yaml` that the rest of the biomedical lifecycle reads as input. The output is a small YAML file, not a long requirements doc — for the long requirements form use `/ce-brainstorm`. The two skills are complementary: brainstorm produces narrative requirements; this skill produces structured biomedical data.

## When this skill activates

- After `/ce-ideate` biomedical-research mode has produced a survivor candidate the user wants to harden
- When the user describes a study idea in one sentence and the next step is `/ce-pubmed` but the query is too vague
- Before `/ce-checklist-match` if the design is unclear and the routing questions can't be answered cleanly
- Manual: `/ce-research-question "sepsis bundle adherence and 30-day mortality in adult ICU patients"`
- Triggered also when a user starts the lifecycle but `/ce-pubmed` complains the query is too broad (>1000 hits with no MeSH alignment)

## Prerequisites

- One sentence describing the research question, OR a path to an `/ce-ideate` survivor

## Core workflow

### Step 1: Decompose into PICO

Ask the user one question at a time (or extract from the survivor) until the four PICO slots are filled:

| Slot | Definition | Example |
|------|------------|---------|
| **P**opulation | Inclusion criteria, setting, demographic constraints | "Adult ICU patients (≥ 18) with sepsis-3 criteria, 2018-2023, US academic medical centers" |
| **I**ntervention or **E**xposure | What is being tested or compared | "Adherence to 1-hour sepsis bundle (lactate, blood cultures, antibiotics, fluids, vasopressors)" |
| **C**omparator | What is the alternative | "Non-adherent or partially adherent (≤ 3 of 5 elements)" |
| **O**utcome | What is being measured, with timing | "30-day in-hospital mortality" |

For descriptive or prediction studies, the comparator slot may be `null` — record that explicitly so downstream skills know the design is not comparative.

For target-trial-emulation candidates, additionally elicit: eligibility criteria, treatment strategies (full specification, not just exposure label), assignment procedure (and confounders that need adjustment), follow-up start/end, outcome ascertainment.

### Step 2: Score on FINER

Five 1-5 ratings, each with a one-line rationale:

- **F**easible — cohort size accessible, IRB feasibility, time horizon realistic, data infrastructure exists
- **I**nteresting — does the field care; is the question alive
- **N**ovel — is this already answered (link the closest prior paper)
- **E**thical — equipoise, IRB-able, consent feasible
- **R**elevant — will the answer change practice

If any score is ≤ 2, surface the issue plainly. A weak FINER score is not a refusal — many strong studies score poorly on novelty (replication is valuable). It is a flag the user must acknowledge.

### Step 3: Suggest a design

From PICO + FINER, propose one design:

| Signal | Design |
|--------|--------|
| Intervention is randomly assignable + clinical equipoise | RCT |
| Intervention not randomizable + comparator group exists in data | Cohort (prospective if data starting now, retrospective otherwise) |
| Outcome is rare → working backward from cases | Case-control |
| Goal is to predict an outcome from a set of features | Prediction model (development → external validation → impact) |
| Goal is to estimate a causal effect from observational data | Target trial emulation (cohort with explicit emulation framing) |
| Goal is to evaluate a diagnostic test | Diagnostic accuracy (cross-sectional or paired) |

### Step 4: Suggest a PubMed query

Build the PubMed query string the user will run via `/ce-pubmed`. Use MeSH terms when the population/exposure/outcome maps to one cleanly; fall back to free-text + MeSH-major filters when not. Include:

- Population MeSH terms with explosions (e.g., `"Sepsis"[Mesh]`)
- Exposure / intervention as either MeSH (`"Patient Care Bundles"[Mesh]`) or free-text
- Outcome as either MeSH (`"Mortality"[Mesh]`) or free-text plus a study-type filter

Keep the query 80% recall, 20% precision — `/ce-pubmed` will narrow further with `--years` and `--study-type`. Do not ship a query so tight it returns 0 hits.

### Step 5: Suggest a primary reporting checklist

This is a hint to `/ce-checklist-match`. Map the design to the most likely primary checklist:

| Design | Primary checklist |
|--------|-------------------|
| RCT (no AI) | CONSORT |
| RCT (model-as-study-object) | CONSORT-AI |
| Observational cohort | STROBE (+ RECORD if EHR / RECORD-PE if claims) |
| Prediction model | TRIPOD+AI |
| Diagnostic accuracy | STARD (+ STARD-AI if AI-driven) |
| Imaging AI | CLAIM |
| Target trial emulation | TARGET |
| Systematic review | PRISMA |

The actual routing decision still happens in `/ce-checklist-match` — this is just a defaulted suggestion to write into the YAML.

### Step 6: Write `analysis/research-question.yaml`

```yaml
research_question:
  one_line: "Among adult ICU patients with sepsis-3, does 1-hour bundle adherence reduce 30-day mortality?"
  pico:
    population:    "Adult ICU patients (≥18) with sepsis-3, 2018-2023, US academic medical centers"
    intervention:  "Adherence to 1-hour sepsis bundle (5 elements)"
    comparator:    "Non-adherent or partially adherent (≤ 3 elements)"
    outcome:       "30-day in-hospital mortality"
  finer:
    feasible:    {score: 4, rationale: "EHR data available; n≈8k expected"}
    interesting: {score: 5, rationale: "Active controversy on bundle benefit"}
    novel:       {score: 3, rationale: "Prior RCTs in mixed ICUs (PMID 30694534); academic-only cohort underexplored"}
    ethical:     {score: 5, rationale: "Observational; no consent burden beyond HIPAA waiver"}
    relevant:    {score: 5, rationale: "Practice change if effect size > 5 percentage points"}
  suggested_design:    "Retrospective cohort with target-trial emulation framing"
  suggested_checklist: STROBE
  suggested_extensions: [RECORD, TARGET]
  suggested_pubmed_query: '("Sepsis"[Mesh]) AND ("Patient Care Bundles"[Mesh] OR "bundle adherence"[Title/Abstract]) AND ("mortality"[Mesh] OR "30-day"[Title/Abstract]) AND ("Cohort Studies"[Mesh])'
  source_ideation: docs/ideation/2026-04-28-ideation-doc.md   # if --ideation-survivor was passed
```

### Step 7: Emit signal

```
__CE_RESEARCH_QUESTION__ yaml=analysis/research-question.yaml design=<...> checklist=<...> query=<one-liner-quoted>
```

`/ce-pubmed` reads this and uses `query` as the default if no query is passed on the command line. `/ce-checklist-match` reads it and pre-fills the routing answers.

## What this skill does NOT do

- Does not run the literature search (next: `/ce-pubmed`)
- Does not match to a checklist (next: `/ce-checklist-match`; this skill only suggests)
- Does not produce a long-form requirements doc (use `/ce-brainstorm` for that)
- Does not write the SAP (use `/ce-plan` after the lifecycle has more inputs)

## References

@./references/pico-templates.md — PICO templates by design type, including target-trial-emulation slots
@./references/finer-rubric.md — Scoring guidance for each FINER dimension with worked examples
@./references/checklist-routing-hints.md — Design → primary checklist mapping (mirrors /ce-checklist-match)

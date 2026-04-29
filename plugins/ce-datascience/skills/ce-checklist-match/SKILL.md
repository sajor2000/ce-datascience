---
name: ce-checklist-match
description: 'Picks the reporting checklist a study should follow BEFORE the SAP is written. Asks 4-6 routing questions and recommends a primary plus extensions from CONSORT, STROBE, RECORD, RECORD-PE, PRISMA, STARD, CARE, COREQ, ARRIVE, CHEERS, TARGET, TRIPOD+AI, CLAIM, SPIRIT-AI, CONSORT-AI, REFORMS, DEAL, CHART, PDSQI-9. Use whenever the user mentions reporting checklist, EQUATOR, CONSORT, STROBE, TRIPOD, PRISMA, STARD, TARGET, "which guideline", "reporting standards", or sets up a study without one. PLAN-time skill — review-time scoring is ce-reporting-checklist-reviewer (auto-dispatched by /ce-code-review). Writes canonical stack-profile fields reporting_checklist (string) + reporting_checklist_extensions (list). Reads /ce-research-question yaml when present to pre-fill routing answers.'
argument-hint: "[study description, optional --interactive]"
---

# Reporting Checklist Match

Picks the right reporting checklist(s) at PLAN time so the SAP is written against them, not corrected after the fact. Distinct from `ce-reporting-checklist-reviewer` which validates AT REVIEW time -- this skill makes the upfront choice.

## When this skill activates

- During `/ce-ideate` after the study premise is solidified
- During `/ce-plan` BEFORE drafting the SAP
- Whenever the user asks "which checklist do I follow?"
- When `stack_profile.guidelines_selected` is empty AND a SAP exists

## Prerequisites

- A one-line study description (or `/ce-ideate` output)
- Stack profile exists (`/ce-setup` has run)

## Core workflow

### Step 0: Context inputs (scan chat first)

Before asking routing questions, scan the most recent ~50 chat turns for `__CE_RESEARCH_QUESTION__ yaml=<path> design=<...> checklist=<...>`. If found, read the YAML and pre-fill these routing answers from the structured fields, then ask only the questions still unanswered:

| Routing question | Pre-fill from YAML field |
|---|---|
| Design | `suggested_design` (cohort / case-control / RCT / prediction model / target trial / etc.) |
| Direction (prospective / retrospective) | infer from `pico.population` time frame |
| AI involvement | infer from `pico.intervention_or_exposure` and `suggested_design` |
| Population | `pico.population` |

Pre-fills are starting points, not answers — the model must surface them and let the user override before writing to stack profile. Example:

```
[research-question] pre-filled from analysis/research-question.yaml:
  design: cohort_retrospective
  ai_involvement: none
  population: human
  primary checklist (suggested): STROBE
  extensions (suggested): RECORD
Confirm or correct any of these? (or say "go" to accept all)
```

When `__CE_RESEARCH_QUESTION__` is absent, fall through to step 1 and ask all questions.

**CLIF profile**: when chat context contains `__CE_CLIF__ active=true`, pre-fill `data_source = EHR (CLIF)` and bias the routing toward:

- Observational cohort → STROBE + RECORD (always; CLIF is EHR-derived).
- Prediction model → TRIPOD+AI.
- Target trial emulation → TARGET (with STROBE underneath).
- RCT using CLIF for outcome ascertainment → CONSORT (and RECORD if outcomes are EHR-defined).

Surface these defaults to the user and let them override before writing to stack profile.

### Step 1: Ask the routing questions

If `--interactive` or the study description is too sparse, ask 4-6 questions one at a time:

1. **Design**: RCT / observational cohort / case-control / cross-sectional / qualitative / systematic review / meta-analysis / case report / animal study / economic evaluation / diagnostic accuracy / prediction model
2. **Direction** (if observational): prospective / retrospective
3. **Aim**: causal / descriptive / predictive / qualitative-exploratory / mixed
4. **AI involvement**: none / data-cleaning only / model-as-tool (e.g., classifier in pipeline) / model-as-study-object (the model itself is being evaluated)
5. **Pre-registration**: planned / not planned / already done
6. **Population**: human / animal / cell / in-silico

If the description already answers some of these, skip those questions.

### Step 2: Apply the routing rules

Use `references/routing-map.md` to map answers → checklist set.

| Design | Direction | Aim | AI | Primary checklist | Extensions |
|--------|-----------|-----|----|-----|------|
| RCT | n/a | causal | none | CONSORT | SPIRIT (protocol) |
| RCT | n/a | causal | model-as-study-object | CONSORT-AI | SPIRIT-AI (protocol) |
| Observational cohort | prospective | causal | none | STROBE | RECORD if EHR/claims |
| Observational cohort | retrospective | causal | none | STROBE | RECORD-PE if claims |
| Case-control | n/a | causal | none | STROBE | RECORD if EHR |
| Cross-sectional | n/a | descriptive | none | STROBE | RECORD if EHR |
| Prediction model | n/a | predictive | yes | TRIPOD+AI | CHARMS for development |
| Prediction model | n/a | predictive | no | TRIPOD | CHARMS |
| Diagnostic accuracy | n/a | n/a | none | STARD | QUADAS-2 for review |
| Diagnostic accuracy | n/a | n/a | yes | STARD-AI | + CLAIM if imaging |
| Imaging study | n/a | n/a | yes | CLAIM | + STARD-AI / TRIPOD+AI |
| Qualitative | n/a | exploratory | n/a | COREQ | SRQR alternative |
| Animal | n/a | n/a | n/a | ARRIVE | -- |
| Systematic review | n/a | n/a | n/a | PRISMA | PRISMA-DTA / PRISMA-NMA |
| Case report | n/a | descriptive | n/a | CARE | -- |
| Economic evaluation | n/a | n/a | n/a | CHEERS | -- |
| ML methods paper | n/a | predictive | model-as-study-object | REFORMS | + TRIPOD+AI if clinical |
| Generative AI (LLM) | n/a | n/a | model-as-study-object | CHART or DEAL | + PDSQI-9 if patient-facing |

If the answers don't fit a row, ask a clarifying question rather than guessing.

### Step 3: Write the selection to stack profile

Update `.ce-datascience/config.local.yaml`. The shape that `/ce-code-review` and `/ce-plan` read is the canonical surface — keep these field names exact:

```yaml
stack_profile:
  ...existing fields...
  study_type: cohort_retrospective
  ai_involvement: none
  reporting_checklist: STROBE                  # canonical primary; non-null string turns on ce-reporting-checklist-reviewer
  reporting_checklist_extensions:              # zero or more strings
    - RECORD
  # Legacy compatibility — keep both shapes during transition:
  guidelines_selected:
    primary: STROBE
    extensions:
      - RECORD
```

The string form (`reporting_checklist: STROBE`) is what `/ce-code-review` Stage 3 conditional dispatches on and what `/ce-plan` SAP frontmatter reads from. Never write `reporting_checklist: true` — that legacy boolean was ambiguous (which checklist?) and is deprecated.

### Step 4: Drop the checklist into the project

For each selected guideline, write a placeholder file at `analysis/checklists/<guideline>.md` containing the checklist items as a fillable table. The user (or `/ce-work`) fills these as the SAP and analysis develop.

### Step 5: Emit signal for downstream skills

Print one line so `/ce-plan` SAP mode and `/ce-code-review` Stage 3 can pick the selection up from chat context:

```
__CE_CHECKLIST__ primary=STROBE extensions=[RECORD]
```

The bracket-list form mirrors how `/ce-plan` parses signals in its SAP-Phase 3 step 2 lookup table.

## What this skill does NOT do

- Does not validate against the checklist (use `ce-reporting-checklist-reviewer` at review time)
- Does not write the SAP (use `/ce-plan`)
- Does not pre-register (use `/ce-prereg`)
- Does not explain WHY a checklist was missed -- just which one applies; the validating reviewer handles compliance scoring

## References

@./references/routing-map.md

@./references/checklist-snippets/


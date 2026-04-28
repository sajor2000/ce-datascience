---
name: ce-checklist-match
description: 'Determine which reporting checklist(s) the study should follow BEFORE the SAP is written. Asks 4-6 routing questions (RCT vs observational, prospective vs retrospective, prediction vs causal, AI involvement, diagnostic-accuracy add-on, qualitative add-on) and outputs the recommended primary checklist + extensions from the 16-guideline set (CONSORT, STROBE, PRISMA, STARD, CARE, COREQ, ARRIVE, CHEERS + REFORMS, TRIPOD+AI, CLAIM, SPIRIT-AI, CONSORT-AI, DEAL, CHART, PDSQI-9). Writes the selection to stack profile so /ce-code-review picks it up automatically. Use during /ce-ideate or /ce-plan, before drafting the SAP.'
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

Update `.ce-datascience/config.local.yaml`:

```yaml
stack_profile:
  ...existing fields...
  study_type: cohort_retrospective
  ai_involvement: none
  guidelines_selected:
    primary: STROBE
    extensions:
      - RECORD
  reporting_checklist: true   # turns on ce-reporting-checklist-reviewer
```

### Step 4: Drop the checklist into the project

For each selected guideline, write a placeholder file at `analysis/checklists/<guideline>.md` containing the checklist items as a fillable table. The user (or `/ce-work`) fills these as the SAP and analysis develop.

### Step 5: Emit signal for downstream skills

`__CE_CHECKLIST_MATCH__ primary=<name> extensions=<comma-sep>` so `/ce-plan` knows which sections to scaffold in the SAP.

## What this skill does NOT do

- Does not validate against the checklist (use `ce-reporting-checklist-reviewer` at review time)
- Does not write the SAP (use `/ce-plan`)
- Does not pre-register (use `/ce-prereg`)
- Does not explain WHY a checklist was missed -- just which one applies; the validating reviewer handles compliance scoring

## References

@./references/routing-map.md

@./references/checklist-snippets/


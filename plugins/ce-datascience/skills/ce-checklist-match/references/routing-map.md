# Routing Map: Study Type → Reporting Checklist

This is the deterministic decision tree that the skill walks. Reuses logic from `ce-reporting-checklist-reviewer` references but applies it at PLAN time, not REVIEW time.

## Step 1: Primary checklist

```
IF design == RCT:
  IF ai_involvement == model-as-study-object:
    primary = CONSORT-AI
    protocol = SPIRIT-AI
  ELSE:
    primary = CONSORT
    protocol = SPIRIT

ELIF design == observational_cohort OR observational_case_control OR observational_cross_sectional:
  primary = STROBE
  IF data_source IN [EHR, claims, registry]:
    extension += RECORD
    IF data_source == claims:
      extension += RECORD-PE

ELIF design == prediction_model:
  IF ai_involvement IN [model-as-study-object, model-as-tool]:
    primary = TRIPOD+AI
  ELSE:
    primary = TRIPOD
  development = CHARMS

ELIF design == diagnostic_accuracy:
  IF ai_involvement IN [model-as-study-object]:
    primary = STARD-AI
  ELSE:
    primary = STARD
  IF modality == imaging:
    extension += CLAIM

ELIF design == qualitative:
  primary = COREQ  # or SRQR if user prefers

ELIF design == animal:
  primary = ARRIVE

ELIF design == systematic_review:
  primary = PRISMA
  IF subtype == diagnostic_accuracy: extension += PRISMA-DTA
  IF subtype == network_meta: extension += PRISMA-NMA
  IF subtype == individual_patient: extension += PRISMA-IPD

ELIF design == case_report:
  primary = CARE

ELIF design == economic_evaluation:
  primary = CHEERS

ELIF design == ml_methods AND clinical_application:
  primary = REFORMS
  extension += TRIPOD+AI

ELIF design == generative_ai_evaluation:
  IF type == hospital_chatbot OR patient_facing:
    primary = CHART
    extension += PDSQI-9
  ELIF type == lifecycle_evaluation:
    primary = DEAL
```

## Step 2: Always-add extensions

- `data_source IN [EHR, claims]` → add `RECORD` (or `RECORD-PE` for pharmacoepi)
- `pre_registration == planned` → ensure SPIRIT / SPIRIT-AI / PRISMA-P (for SR) is included for the protocol stage
- `subgroup_analyses_planned == true` → add adherence to subgroup-reporting items in the primary checklist

## Step 3: Edge cases

- **Mixed-methods**: list both quantitative (CONSORT/STROBE/etc.) and qualitative (COREQ); annotate sections by method
- **Multi-arm RCT with prediction sub-analysis**: CONSORT primary, TRIPOD as a secondary for the prediction sub-analysis
- **Pragmatic trial**: CONSORT-Pragmatic extension on top of CONSORT
- **Cluster RCT**: CONSORT-Cluster on top of CONSORT
- **Non-inferiority RCT**: CONSORT non-inferiority extension
- **Stepped-wedge**: CONSORT extension for stepped-wedge

## Step 4: When the user disagrees

If the user pushes back on the recommendation, capture the reason in `stack_profile.guidelines_override_reason` and proceed. The reviewer will validate against whatever was selected, but the override reason should be auditable.

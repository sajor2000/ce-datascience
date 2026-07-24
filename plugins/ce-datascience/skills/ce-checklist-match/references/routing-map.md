# Routing Map: Study Type to Reporting Checklist

This deterministic decision tree selects a primary reporting guideline and only adds extensions whose scope matches the study attributes. `guideline-registry.yaml` is the evidence-backed source of truth for supported files, roles, and publication status.

## Primary Checklist

```text
IF design == RCT:
  primary = CONSORT
  IF ai_involvement == model-as-study-object: extension += CONSORT-AI
  IF protocol_stage == true AND ai_involvement == model-as-study-object: protocol = SPIRIT-AI
  IF cluster_design: extension += CONSORT-CLUSTER
  IF adaptive_design: extension += CONSORT-ADAPTIVE
  IF n_of_1_design: extension += CONSORT-NOF1

ELIF design IN [observational_cohort, observational_case_control, observational_cross_sectional]:
  primary = STROBE
  IF data_source IN [EHR, claims, registry]: extension += RECORD
  IF data_source == claims AND pharmacoepidemiology == true: extension += RECORD-PE
  IF mendelian_randomization == true: extension += STROBE-MR
  IF genetic_association == true: extension += STREGA
  IF target_trial_emulation == true: extension += TARGET
  IF RWE_treatment_effect == true: extension += START-RWE

ELIF design == prediction_model:
  primary = TRIPOD+AI when AI/ML is used else TRIPOD
  IF systematic_review_of_prediction_models == true: extension += CHARMS as appraisal
  IF data_source IN [EHR, claims]: do not add PDSQI-9 automatically

ELIF design == diagnostic_accuracy:
  primary = STARD-AI when the index test uses AI/ML else STARD
  IF modality == imaging: extension += CLAIM

ELIF design == systematic_review:
  primary = PRISMA
  IF subtype == diagnostic_accuracy: extension += PRISMA-DTA and QUADAS-2 as appraisal
  IF subtype == network_meta: extension += PRISMA-NMA
  IF subtype == individual_patient_data: extension += PRISMA-IPD
  IF subtype == scoping_review: extension += PRISMA-SCR
  IF protocol_stage == true: note PRISMA-P as unsupported follow-up

ELIF design == qualitative: primary = COREQ
ELIF design == mixed_methods: primary = GRAMMS with provisional evidence status
ELIF design == animal: primary = ARRIVE
ELIF design == case_report: primary = CARE
ELIF design == economic_evaluation: primary = CHEERS
ELIF design == quality_improvement: primary = SQUIRE
ELIF design == chatbot_health_advice: primary = CHART
ELIF design == ml_methods AND clinical_application: primary = REFORMS
ELIF design == pathology_deep_learning: require verified-source override before DEAL
ELSE: ask the user which supported guideline applies
```

## Selection Rules

1. Read canonical `stack_profile.reporting_checklist` and `reporting_checklist_extensions` first.
2. Resolve each name through the evidence registry and reject unknown names.
3. Do not route entries with `evidence_status: unverified` as authoritative.
4. Treat `appraisal`, `template`, and `data-quality-tool` roles as distinct from primary reporting guidelines.
5. Layer base and extension checklists; an extension never replaces its base unless the registry explicitly records supersession.
6. When current and legacy versions coexist, select the current version and retain the legacy citation only for historical compatibility.
7. If study attributes cannot distinguish competing routes, ask one decision-changing question rather than guessing.

## Edge Cases

- Mixed-methods studies may combine the applicable quantitative guideline with GRAMMS; label each section by method.
- A prediction sub-analysis inside an RCT keeps CONSORT as the trial primary and applies TRIPOD/TRIPOD+AI only to the prediction analysis.
- A target-trial emulation remains observational and uses STROBE underneath TARGET.
- Generic AI involvement does not trigger CHART.
- CLAIM is limited to medical imaging; DEAL and PDSQI-9 require an explicit verified-source override before authoritative use.

## Overrides

If the user selects a different supported guideline, preserve the choice in `stack_profile.guidelines_override_reason` and retain the evidence status in the review record.

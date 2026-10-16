# Routing Map: Study Type to Reporting Checklist

This deterministic decision tree selects a primary reporting guideline and only adds extensions whose scope matches the study attributes. It is self-contained: it emits candidate names, while `ce-code-review` resolves those names against the canonical evidence registry before treating any selection as authoritative.

## Contents

- AI Involvement Values
- Primary Checklist
- Worked examples
- Selection Rules
- Edge Cases
- Overrides

## AI Involvement Values

`ai_involvement` uses the canonical values shared with `ce-code-review`: `none`, `ai-assisted` (AI as a tool within traditional methods), `ai-primary` (the AI model is the primary analytical approach or the object being evaluated), and `llm-based` (the study uses or evaluates a large language model). An extension's scope must still match; generic AI involvement alone never adds one.

## Primary Checklist

```text
IF design == RCT:
  primary = CONSORT  # CONSORT 2025 core
  IF ai_involvement IN [ai-primary, llm-based] AND the AI is the trial intervention: extension += CONSORT-AI
  IF protocol_stage == true: protocol = SPIRIT  # SPIRIT 2025 (Chan et al., BMJ 2025, PMID 40294953)
  IF protocol_stage == true AND ai_involvement IN [ai-primary, llm-based]: protocol += SPIRIT-AI (layered on SPIRIT 2025)
  IF cluster_design: extension += CONSORT-CLUSTER
  IF adaptive_design: extension += CONSORT-ADAPTIVE
  IF n_of_1_design: extension += CONSORT-NOF1

ELIF design == target_trial_emulation:  # observational data explicitly emulating a target trial
  primary = TARGET
  companion += STROBE only when the journal requires it (TARGET is intended as a standalone guideline; Cashin et al. 2025, PMID 40903028)
  IF data_source IN [EHR, claims, registry]: extension += RECORD
  IF data_source == claims AND pharmacoepidemiology == true: extension += RECORD-PE

ELIF design IN [observational_cohort, observational_case_control, observational_cross_sectional]:
  primary = STROBE
  IF data_source IN [EHR, claims, registry]: extension += RECORD
  IF data_source == claims AND pharmacoepidemiology == true: extension += RECORD-PE
  IF mendelian_randomization == true: extension += STROBE-MR
  IF genetic_association == true: extension += STREGA
  IF target_trial_emulation == true: re-route to design == target_trial_emulation (TARGET primary)
  IF RWE_treatment_effect == true: extension += START-RWE

ELIF design == prediction_model:
  primary = TRIPOD+AI  # supersedes TRIPOD 2015 for regression and ML models alike (Collins et al. 2024, PMID 38626948)
  IF ai_involvement == llm-based: extension += TRIPOD-LLM  # Gallifant et al., Nat Med 2025, PMID 39779929
  IF ai_involvement IN [ai-primary, llm-based] AND the study makes ML-based science claims: extension += REFORMS
  IF systematic_review_of_prediction_models == true: extension += CHARMS as appraisal
  IF data_source IN [EHR, claims]: do not add PDSQI-9 automatically

ELIF design == diagnostic_accuracy:
  primary = STARD
  IF index test uses AI/ML: extension += STARD-AI
  IF modality == imaging: extension += CLAIM

ELIF design == systematic_review:
  primary = PRISMA
  IF subtype == diagnostic_accuracy: extension += PRISMA-DTA and QUADAS-2 as appraisal
  IF subtype == network_meta: extension += PRISMA-NMA
  IF subtype == individual_patient_data: extension += PRISMA-IPD
  IF subtype == scoping_review: extension += PRISMA-SCR
  IF protocol_stage == true: protocol = PRISMA-P  # PRISMA-P 2015 (Moher et al., Syst Rev 2015, PMID 25554246)

ELIF design == qualitative: primary = COREQ
ELIF design == mixed_methods:
  primary = route the quantitative strand through this tree (GRAMMS is never primary)
  extension += GRAMMS with provisional evidence status
ELIF design == animal: primary = ARRIVE
ELIF design == case_report: primary = CARE
ELIF design == economic_evaluation: primary = CHEERS
ELIF design == quality_improvement: primary = SQUIRE  # SQUIRE 2.0
ELIF design == chatbot_health_advice: primary = CHART
ELIF design == early-clinical-ai-evaluation:  # live clinical use of AI decision support, before a comparative trial
  primary = DECIDE-AI  # Vasey et al., Nat Med 2022, PMID 35585198
ELIF design == ml_methods:
  primary = route the underlying design through this tree (TRIPOD+AI for an AI prediction model)
  extension += REFORMS (ML-based science; REFORMS is never primary)
ELIF design == pathology_deep_learning: require verified-source override before DEAL
ELSE: ask the user which supported guideline applies

ALWAYS (any design): IF ai_involvement == llm-based AND the study is a prediction/classification model: extension += TRIPOD-LLM; add REFORMS only for ML-based science claims (never for chatbot-advice or trial designs)
OPTIONAL (any clinical-AI modelling study): offer MI-CLAIM (Norgeot et al., Nat Med 2020, PMID 32908275) or MI-CLAIM-GEN for generative models (Miao et al., Nat Med 2025, PMID 39915678) as a documentation template, never as the primary reporting guideline
```

`protocol_stage: true` selects the protocol checklist (SPIRIT 2025 for trials, PRISMA-P for systematic reviews) in place of the results-stage primary; record it as `reporting_checklist` while the protocol is being written and switch to the results-stage primary afterwards.

## Worked examples

- "Retrospective EHR cohort emulating a trial of early vs delayed dialysis" -> `__CE_CHECKLIST__ primary=TARGET extensions=[RECORD]` (STROBE only if the journal asks).
- "Logistic-regression risk score for 30-day readmission" -> `__CE_CHECKLIST__ primary=TRIPOD+AI extensions=[]` (TRIPOD 2015 is superseded).
- "Protocol for an RCT of an AI triage tool" -> protocol SPIRIT 2025 + SPIRIT-AI; at results, `primary=CONSORT extensions=[CONSORT-AI]`.

## Selection Rules

1. Read canonical `stack_profile.reporting_checklist` and `reporting_checklist_extensions` first.
2. Pass each selected name to `ce-code-review` for resolution against the canonical evidence registry; reject unknown names there.
3. Do not route entries with `evidence_status: unverified` as authoritative (`unverified` is a registry status, not an evidence label).
4. Treat `appraisal`, `template`, `data-quality-tool`, and `evaluation-instrument` roles as distinct from primary reporting guidelines.
5. Layer base and extension checklists; an extension never replaces its base unless the registry explicitly records supersession.
6. When current and legacy versions coexist, select the current version and retain the legacy citation only for historical compatibility.
7. If study attributes cannot distinguish competing routes, ask one decision-changing question rather than guessing.

## Edge Cases

- Mixed-methods studies may combine the applicable quantitative guideline with GRAMMS; label each section by method.
- A prediction sub-analysis inside an RCT keeps CONSORT as the trial primary and applies TRIPOD+AI only to the prediction analysis.
- A target-trial emulation uses TARGET (standalone, 21 items) as the primary reporting guideline; add RECORD for routinely collected EHR, claims, or registry data, and STROBE only when the journal requires it.
- An imaging study routes by aim: STARD for diagnostic accuracy, TRIPOD+AI for a prediction model; add CLAIM for the imaging AI, plus STARD-AI when it is a diagnostic-accuracy study.
- Qualitative studies use COREQ; SRQR is not in the registry.
- Generic AI involvement does not trigger CHART.
- CLAIM is limited to medical imaging; DEAL and PDSQI-9 require an explicit verified-source override before authoritative use.

## Overrides

If the user selects a different supported guideline, preserve the choice in `stack_profile.guidelines_override_reason` and retain the evidence status in the review record.

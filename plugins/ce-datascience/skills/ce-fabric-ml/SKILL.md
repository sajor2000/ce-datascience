---
name: ce-fabric-ml
description: "Run or review data-science and ML workflows in Microsoft Fabric, including MLflow experiments, registered models, batch scoring, model endpoints, SynapseML, and AI functions."
argument-hint: "[experiment|register|batch-score|endpoint|review]"
---

# Fabric ML

## Skill Value

- **Problem it solves:** Fabric ML tracking, registry, scoring, and platform execution settings can make model evidence incomplete or non-reproducible.
- **Use when:** A Fabric project uses MLflow, an Experiment, registered models, PREDICT, distributed scoring, SynapseML, or AI functions.
- **Output:** A model-execution contract with data split, outcome horizon, tracking evidence, signature/schema, evaluation, and deployment boundary.
- **Ask only if:** The prediction target, time zero, scoring destination, or deployment authorization is unresolved.
- **Do not do:** Do not register, deploy, or score a model on production data without authorization; do not present a generic AUC as a dynamic-survival evaluation.

## Workflow

1. Load the `ce-plan` skill to record the estimand or prediction target, cohort grain, index time, outcome horizon, split strategy, and success criteria.
2. Verify tracking configuration before training. Record experiment name, run identifier, environment, data version, feature definition, and evaluation artifact.
3. Validate model input schema and signature before registration or batch scoring. Stop on a mismatch rather than silently filling or dropping features.
4. Load the `ce-data-qa` skill and conduct leakage review before training; preserve temporal and person-level separation.
5. For survival or dynamic decision work, load the `ce-code-review` skill for censoring-aware, horizon-specific time-dependent AUC and calibration review.
6. Treat endpoint creation, model registration, and batch writes as external actions that require explicit user authorization.

## Guardrails

- Keep secrets and service identities outside notebooks and experiment parameters.
- Separate experiment tracking from approval to deploy.
- Report failed runs, missing metrics, and incompatible signatures directly; never manufacture a fallback score.

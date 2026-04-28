---
name: ce-model-card
description: 'Generate a Mitchell-style model card for a clinical / biomedical prediction model. Captures intended use, training data, evaluation data, performance overall and by subgroup, calibration, fairness considerations, ethical considerations, caveats and recommendations. Drops in as a manuscript appendix and a deployment artifact. Use after model evaluation is done and before manuscript submission, especially for TRIPOD+AI / CONSORT-AI compliance.'
argument-hint: "<model artifact path>, optional: --eval-output path/to/eval-results.json"
---

# Model Card Generator

Generates a model card following the Mitchell et al. 2019 framework, adapted for clinical/biomedical use. Required by TRIPOD+AI item 16, recommended by FDA for AI/ML-based clinical decision support.

## When this skill activates

- After model evaluation is done (overall + subgroup performance computed)
- Before manuscript submission for prediction-model studies
- After `/ce-code-review` flagged absent model card during TRIPOD+AI compliance check
- Manual: `/ce-model-card models/risk-model.pkl --eval-output reports/eval-2025-04.json`

## Prerequisites

- A trained model artifact (any format: pickle, joblib, .rds, .keras, .pt, ONNX)
- Evaluation results: overall metrics + per-subgroup metrics (sex, race, age, site at minimum)
- Calibration plot data (prob-binned or smoothed)
- Training data summary (N, dates, source, features list)

## Core workflow

### Step 1: Read the model + eval output

Parse the eval-output JSON. Expected schema:

```json
{
  "model_id": "risk-model-v2",
  "training": {
    "n": 12500, "dates": "2018-01 to 2022-12",
    "source": "EHR site A", "features": [...]
  },
  "evaluation": {
    "internal": { "auc": 0.84, "auc_ci": [0.82, 0.86], "brier": 0.18, "calibration_intercept": -0.02, "calibration_slope": 1.04 },
    "external": { "auc": 0.79, "n": 5500, "site": "B" },
    "subgroups": {
      "sex_F": { "auc": 0.85, "n": 7100 },
      "sex_M": { "auc": 0.83, "n": 5400 },
      ...
    }
  }
}
```

If the eval output is missing required fields, surface the gap and refuse to generate a card with placeholders.

### Step 2: Fill the template

Use `references/model-card-template.md`. Sections:

1. **Model details** -- name, version, date, type, owner
2. **Intended use** -- primary intended use, primary intended users, out-of-scope use cases
3. **Factors** -- relevant subgroups, evaluation factors
4. **Metrics** -- model performance overall and by subgroup (table)
5. **Evaluation data** -- datasets, motivation, preprocessing
6. **Training data** -- as above for training
7. **Quantitative analyses** -- unitary and intersectional results
8. **Ethical considerations** -- subjects, mitigations, risks
9. **Caveats and recommendations** -- known limitations, recalibration plan, monitoring plan

### Step 3: Compute fairness summary table

For each protected attribute in the eval output, compute:

- AUC per group + 95% CI
- Calibration intercept + slope per group
- Sensitivity and specificity at the deployment threshold per group
- Demographic parity ratio (selection rate group_A / group_B)
- Equalized odds gap (max TPR difference across groups)

Highlight any AUC gap > 0.05 or calibration intercept |Δ| > 0.10 in the card body, not just in a footnote.

### Step 4: Write outputs

- `analysis/model-card.md` -- the markdown card
- `analysis/model-card.html` -- rendered (for sharing)
- `analysis/model-card.json` -- structured form for deployment registries

### Step 5: Cross-link

Write a one-line reference at the bottom of the SAP and the manuscript Methods section:

> "Model card available at `analysis/model-card.md`."

## What this skill does NOT do

- Does not run the evaluation (you bring eval results)
- Does not fix unfair models -- it surfaces gaps; mitigation is a separate decision (see `ce-fairness-reviewer`)
- Does not validate calibration -- that's `ce-calibration-reviewer`
- Does not handle pre-deployment monitoring -- see `ce-concept-drift-reviewer` and ML lifecycle tools

## References

@./references/model-card-template.md

# Model Card: {{ model.id }}

## 1. Model details

| Field | Value |
|-------|-------|
| Model name | {{ model.id }} |
| Version | {{ model.version }} |
| Date | {{ model.date }} |
| Model type | {{ model.type }} (e.g., logistic regression, gradient-boosted trees, transformer) |
| Architecture | {{ model.architecture }} |
| Owner / Contact | {{ model.owner }} |
| License | {{ model.license | default("CC-BY-4.0 -- model weights subject to data-use agreement") }} |
| Citation | {{ model.citation }} |

## 2. Intended use

### 2.1 Primary intended use

{{ model.intended_use }}

### 2.2 Primary intended users

{{ model.intended_users }}

### 2.3 Out-of-scope uses

- Not for use as the sole decision-making input
- Not validated outside {{ training.population }} -- generalization to {{ ... }} requires re-validation
- Not for use in {{ excluded_populations }} (e.g., pediatric, pregnancy, ICU) without explicit re-evaluation

## 3. Factors

### 3.1 Relevant factors

The model's performance has been evaluated by:
- Sex (F, M, intersex)
- Race / ethnicity ({{ race_categories }})
- Age ({{ age_bands }})
- Site / hospital ({{ site_count }} sites)
- Payer ({{ payer_categories }})

### 3.2 Evaluation factors

Performance is reported overall and stratified by all factors above.

## 4. Metrics

### 4.1 Performance overall (internal validation)

| Metric | Value | 95% CI |
|--------|-------|--------|
| AUC | {{ eval.internal.auc }} | {{ eval.internal.auc_ci }} |
| Brier score | {{ eval.internal.brier }} | -- |
| Calibration intercept | {{ eval.internal.calibration_intercept }} | -- |
| Calibration slope | {{ eval.internal.calibration_slope }} | -- |
| Sensitivity (at threshold {{ threshold }}) | {{ eval.internal.sens }} | {{ eval.internal.sens_ci }} |
| Specificity (at threshold {{ threshold }}) | {{ eval.internal.spec }} | {{ eval.internal.spec_ci }} |
| PPV | {{ eval.internal.ppv }} | {{ eval.internal.ppv_ci }} |
| NPV | {{ eval.internal.npv }} | {{ eval.internal.npv_ci }} |

### 4.2 Performance by subgroup

| Subgroup | N | AUC | Calibration intercept | Sens | Spec |
|----------|---|-----|------------------------|------|------|
| Sex = F | ... | ... | ... | ... | ... |
| Sex = M | ... | ... | ... | ... | ... |
| Age 18-44 | ... | ... | ... | ... | ... |
| Age 45-64 | ... | ... | ... | ... | ... |
| Age 65+ | ... | ... | ... | ... | ... |
| Race = ... | ... | ... | ... | ... | ... |
| Site = A | ... | ... | ... | ... | ... |

### 4.3 External validation

| Metric | Value | Site / cohort |
|--------|-------|---------------|
| AUC | {{ eval.external.auc }} | {{ eval.external.cohort }} |
| Calibration intercept | {{ eval.external.cal_int }} | -- |
| ... | ... | ... |

### 4.4 Decision-curve analysis

Net benefit at thresholds {{ thresholds }} -- see Figure {{ fig_id }}.

## 5. Evaluation data

| Field | Value |
|-------|-------|
| Datasets | {{ eval.datasets }} |
| Motivation | {{ eval.motivation }} |
| Preprocessing | {{ eval.preprocessing }} |
| Time period | {{ eval.dates }} |
| Inclusion criteria | {{ eval.inclusion }} |
| Exclusion criteria | {{ eval.exclusion }} |

## 6. Training data

| Field | Value |
|-------|-------|
| Datasets | {{ training.source }} |
| N | {{ training.n }} |
| Date range | {{ training.dates }} |
| Features | {{ training.features }} (count: {{ training.feature_count }}) |
| Outcome definition | {{ training.outcome }} |
| Class balance | {{ training.class_balance }} |
| Train / val / test split | {{ training.split }} -- {{ training.split_strategy }} (group / temporal / random) |

## 7. Quantitative analyses

### 7.1 Unitary results

See section 4.1.

### 7.2 Intersectional results

| Subgroup intersection | N | AUC | Calibration |
|-----------------------|---|-----|-------------|
| Sex=F × Age 65+ × Race=Black | ... | ... | ... |
| Sex=M × Age 18-44 × Race=White | ... | ... | ... |

(Report at minimum the smallest-N intersection if N >= 30; otherwise note insufficient data.)

## 8. Ethical considerations

### 8.1 Sensitive population
{{ ethical.sensitive_pop }}

### 8.2 Risks identified
- Algorithmic bias: {{ ethical.bias_risk }}
- Privacy: {{ ethical.privacy_risk }}
- Misuse: {{ ethical.misuse_risk }}

### 8.3 Mitigation steps taken
{{ ethical.mitigations }}

## 9. Caveats and recommendations

- Performance is degraded outside the training population. Re-validation required for new sites.
- Calibration drift is expected over time. Recommended re-calibration cadence: {{ recalib_cadence }}.
- Concept drift monitoring: {{ drift_plan }}.
- Human-in-the-loop required: model is decision SUPPORT, not decision AUTOMATION.
- Re-evaluation triggered by: {{ retrigger_conditions }}.

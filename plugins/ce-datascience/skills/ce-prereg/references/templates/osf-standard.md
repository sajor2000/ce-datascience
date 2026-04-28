# OSF Standard Pre-Registration Form

Paste each section into the corresponding OSF field at https://osf.io/prereg/

## 1. Title

{{ sap.title }}

## 2. Description

{{ sap.section_1_1_background }}

## 3. Hypotheses

{{ sap.section_3_hypotheses }}

For each primary hypothesis, the registered prediction is:
{{ sap.section_3_predictions }}

## 4. Design plan

### 4.1 Study type
{{ sap.section_1_2_design }}

### 4.2 Blinding
{{ stack_profile.blinding_state }} (blinded / unblinded / n/a)

### 4.3 Study design
{{ sap.section_1_3_design_detail }}

### 4.4 Randomization (if applicable)
{{ sap.section_1_3_randomization }}

## 5. Sampling plan

### 5.1 Existing data
{{ "Yes -- this is a retrospective analysis" if stack_profile.is_retrospective else "No -- prospective enrollment" }}

### 5.2 Explanation of existing data (if applicable)
{{ sap.section_2_1_data_provenance }}

### 5.3 Data collection procedures
{{ sap.section_2_1_cohort_definition }}

### 5.4 Sample size
{{ sap.section_2_5_sample_size }}

Power calculation reference: `analysis/power/<design>-<date>-summary.md`

### 5.5 Sample size rationale
{{ sap.section_2_5_rationale }}

### 5.6 Stopping rule
{{ sap.section_4_stopping_rule | default("None pre-specified -- analysis runs to enrollment target") }}

## 6. Variables

### 6.1 Manipulated variables (if interventional)
{{ sap.section_2_2_intervention | default("Not applicable -- observational design") }}

### 6.2 Measured variables
{{ sap.section_2_3_outcomes }}
{{ sap.section_2_4_predictors }}
{{ sap.section_2_5_covariates }}

### 6.3 Indices (if any composite scores)
{{ sap.section_2_6_indices | default("Not applicable") }}

## 7. Analysis plan

### 7.1 Statistical models
{{ sap.section_4_1_primary_model }}

### 7.2 Transformations (if applicable)
{{ sap.section_4_2_transformations }}

### 7.3 Inference criteria
- Alpha: {{ sap.section_4_3_alpha | default("0.05, two-sided") }}
- Multiple comparisons handling: {{ sap.section_4_3_multiplicity }}

### 7.4 Data exclusion rules
{{ sap.section_2_3_exclusions }}

### 7.5 Missing data
{{ sap.section_2_4_missing_data }}

### 7.6 Exploratory analyses
{{ sap.section_4_exploratory }}

## 8. Other (optional)

- Reporting checklist followed: {{ stack_profile.guidelines_selected.primary }} {{ extensions }}
- Funding: {{ sap.frontmatter.funding }}
- Conflicts of interest: {{ sap.frontmatter.conflicts | default("None declared") }}

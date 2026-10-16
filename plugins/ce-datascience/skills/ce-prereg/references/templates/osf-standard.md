# OSF Standard Pre-Registration Form

## Contents

- 1. Title
- 2. Description
- 3. Hypotheses
- 4. Design plan
- 5. Sampling plan
- 6. Variables
- 7. Analysis plan
- 8. Other (optional)

Paste each section into the corresponding OSF field at https://osf.io/prereg/

Placeholders: `{{ SAP-N.M: ... }}` is that section of the `ce-plan` SAP; `{{ SAP title }}` is the SAP H1 (`# Statistical Analysis Plan: <title>`); `{{ user: ... }}` comes from the user or project study metadata (never SAP frontmatter; ask, never invent).

## 1. Title

{{ SAP title }}

## 2. Description

{{ SAP-1.1: primary objective }}

## 3. Hypotheses

{{ SAP-1.1 and SAP-1.2: primary and secondary hypotheses }}

For each primary hypothesis, the registered prediction is:
{{ SAP-1.1: directional prediction for SAP-3.1 }}

## 4. Design plan

### 4.1 Study type
{{ SAP-2.1: study type }}

### 4.2 Blinding
{{ stack_profile.blinding_state }} (blinded / unblinded / n/a)

### 4.3 Study design
{{ SAP-2.1, SAP-2.3, SAP-2.4: design, exposure/intervention, comparator }}

### 4.4 Randomization (if applicable)
{{ SAP-2.1: randomization scheme | default("Not applicable -- observational design") }}

## 5. Sampling plan

### 5.1 Existing data
{{ one of: "Registration prior to creation of data" / "Registration prior to any human observation of the data" / "Registration prior to accessing the data" / "Registration prior to analysis of the data" }}

For existing EHR/registry data, state who accessed the data and what was examined (e.g., the `ce-data-qa` column profile and missingness), and certify that no analysis related to the research plan, including outcome-by-exposure summary statistics, has been run.

### 5.2 Explanation of existing data (if applicable)
{{ SAP-2.2: source population and data provenance }}

### 5.3 Data collection procedures
{{ SAP-2.2: inclusion/exclusion criteria and sampling frame }}

### 5.4 Sample size
{{ SAP-6: target N }}

Power calculation reference: `analysis/power/<design>-<date>-summary.md`

### 5.5 Sample size rationale
{{ SAP-6: assumptions and rationale }} (cite the effect-size or event-rate source by PMID/DOI)

### 5.6 Stopping rule
{{ SAP-6: interim or stopping rule | default("None pre-specified -- analysis runs to enrollment target") }}

## 6. Variables

### 6.1 Manipulated variables (if interventional)
{{ SAP-2.3: intervention | default("Not applicable -- observational design") }}

### 6.2 Measured variables
{{ SAP-3.1 to SAP-3.3: endpoints }}
{{ SAP-2.3: exposure / predictors }}
{{ SAP-5.1 and SAP-13: covariates }}

### 6.3 Indices (if any composite scores)
{{ SAP-3: composite endpoint definitions | default("Not applicable") }}

## 7. Analysis plan

### 7.1 Statistical models
Estimand: {{ SAP-1.4: primary estimand, including intercurrent-event strategies }}

{{ SAP-5.1 to SAP-5.3: primary, secondary, and subgroup analyses }}

### 7.2 Transformations (if applicable)
{{ SAP-5.1: transformations | default("None") }}

### 7.3 Inference criteria
- Alpha and sidedness: {{ SAP-5.1: significance threshold and sidedness }}
- Multiple comparisons handling: {{ SAP-7: multiplicity adjustments }}

### 7.4 Data exclusion rules
{{ SAP-2.2: exclusion criteria }}
{{ SAP-4: analysis populations }}

### 7.5 Missing data
{{ SAP-8: missing data handling }}

### 7.6 Exploratory analyses
{{ SAP-1.3 and SAP-3.3: exploratory objectives and endpoints }}

## 8. Other (optional)

- Sensitivity analyses: {{ SAP-9: sensitivity analyses }}
- Reporting checklist followed: {{ stack_profile.reporting_checklist }} {{ stack_profile.reporting_checklist_extensions }}
- Funding: {{ user: funding }}
- Conflicts of interest: {{ user: conflicts | default("None declared") }}

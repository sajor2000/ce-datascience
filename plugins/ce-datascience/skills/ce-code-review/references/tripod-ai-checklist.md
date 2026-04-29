# TRIPOD+AI Checklist for Prediction Model Studies Using AI/ML

AI EXTENSION checklist for transparent reporting of multivariable prediction models for individual prognosis or diagnosis, updated for studies using artificial intelligence and machine learning methods.

**Base guideline:** TRIPOD (Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis)

**Primary reference (TRIPOD+AI):** Collins GS, Moons KGM, Dhiman P, Riley RD, Beam AL, Van Calster B, Ghassemi M, Liu X, Reitsma JB, van Smeden M, et al. TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods. BMJ. 2024;385:e078378. doi:10.1136/bmj-2023-078378. PMID: 38626948.

**Original TRIPOD reference:** Moons KGM, Altman DG, Reitsma JB, Ioannidis JPA, Macaskill P, Steyerberg EW, Vickers AJ, Ransohoff DF, Collins GS. Transparent Reporting of a multivariable prediction model for Individual Prognosis or Diagnosis (TRIPOD): explanation and elaboration. Ann Intern Med. 2015;162(1):W1-73. doi:10.7326/M14-0698. PMID: 25560730.

This checklist supplements and supersedes the original TRIPOD 2015 checklist for AI/ML prediction model studies. Apply when developing, validating, or updating prediction models that use machine learning methods.

---

## Title and Abstract

### Item 1 -- Title identification

**Description:** Identify the study as developing, validating, or updating a prediction model using AI or ML methods. State the target population and outcome.

**What to look for in code/outputs:**
- Title or report header naming the ML method and prediction target
- Abstract specifying model type (development, validation, update) and ML approach
- Keywords including the specific ML algorithm family used
- Structured abstract with model development/validation results clearly separated

### Item 2 -- Abstract model performance

**Description:** Report key model performance metrics in the abstract, including discrimination, calibration, and sample sizes.

**What to look for in code/outputs:**
- Abstract sections reporting AUC/C-statistic, calibration slope, Brier score
- Sample sizes for development and validation datasets stated in abstract
- Confidence intervals reported alongside point estimates in abstract
- Number of events and event rate reported for each dataset

---

## Introduction

### Item 3 -- Background and rationale

**Description:** Explain the clinical context, existing prediction models, and rationale for developing or validating a new model.

**What to look for in code/outputs:**
- Literature review of existing models for the same prediction task
- Documentation of clinical need or gap the model addresses
- Comparison framework against existing risk scores or clinical tools
- Justification for ML approach over simpler statistical methods

---

## Methods -- Source of Data

### Item 4 -- Study design and data source

**Description:** Describe the study design (development, validation, or both), data source, and key dates.

**What to look for in code/outputs:**
- Data source documentation (EHR system, registry, cohort study, claims database)
- Date range filters in data extraction code (enrollment period, follow-up cutoff)
- Study design classification (retrospective cohort, prospective validation, external validation)
- Multi-site data documentation with site identifiers and contribution counts

### Item 5 -- Participants and eligibility

**Description:** Describe the study population, eligibility criteria, and how participants were identified.

**What to look for in code/outputs:**
- Inclusion/exclusion criteria implemented in data filtering code
- Cohort construction queries with documented selection logic
- Participant flow from source population through final analytic sample with counts at each step
- Temporal eligibility windows and index date definitions in code

---

## Methods -- Outcome and Predictors

### Item 6 -- Outcome definition

**Description:** Define the outcome, including how it was ascertained, the prediction horizon, and any adjudication process.

**What to look for in code/outputs:**
- Outcome variable derivation code with ICD/CPT/LOINC definitions
- Prediction time horizon specification (30-day, 1-year, in-hospital)
- Outcome ascertainment window relative to index date in code
- Adjudication process documentation for ambiguous outcomes

### Item 7 -- Predictor definition

**Description:** Define all predictors, including how they were measured, at what time point relative to the prediction, and any transformations applied.

**What to look for in code/outputs:**
- Feature engineering code with variable derivation logic
- Temporal relationship documentation (all predictors available before prediction time)
- Feature list with data types, measurement units, and source tables
- Look-back window specifications for time-varying predictors

---

## Methods -- Model Development

### Item 8 -- Model architecture

**Description:** Describe the model architecture in sufficient detail for replication, including the algorithm, framework, and key structural decisions.

**What to look for in code/outputs:**
- Model class instantiation code specifying architecture (e.g., layers, nodes, kernels)
- Framework and library versions in requirements.txt or environment.yml
- Architecture diagrams or network topology descriptions in documentation
- Custom layer or loss function implementations

### Item 9 -- Hyperparameter selection

**Description:** Describe the hyperparameter tuning process, including the search strategy, parameter ranges, and selection criterion.

**What to look for in code/outputs:**
- Hyperparameter search code (grid search, random search, Bayesian optimization)
- Parameter ranges and distributions defined for tuning
- Selection criterion (validation AUC, cross-validation score) documented
- Final selected hyperparameters reported in outputs or config files

### Item 10 -- Training procedure

**Description:** Describe the training procedure, including optimization algorithm, learning rate schedule, regularization, early stopping, and convergence criteria.

**What to look for in code/outputs:**
- Optimizer configuration (Adam, SGD, learning rate, weight decay)
- Early stopping implementation with patience and monitoring metric
- Training loss curves or convergence diagnostics in outputs
- Regularization methods (dropout, L1/L2, data augmentation) in model code

### Item 11 -- Feature selection and engineering

**Description:** Describe any feature selection, dimensionality reduction, or feature engineering steps applied.

**What to look for in code/outputs:**
- Feature selection code (LASSO, recursive feature elimination, importance-based)
- Dimensionality reduction (PCA, autoencoders, t-SNE for visualization only)
- Feature importance rankings or selection criteria outputs
- Engineered feature derivation logic with clinical rationale

### Item 12 -- Missing data handling

**Description:** Report the amount of missing data per predictor and the method used to handle missing data.

**What to look for in code/outputs:**
- Missing data summary tables (count and percentage per variable)
- Imputation code (multiple imputation, mean/median, indicator method, model-based)
- Complete case analysis documentation with comparison to full sample
- Missing data mechanism assessment (MCAR, MAR, MNAR) documentation

### Item 13 -- Data preprocessing

**Description:** Describe all data preprocessing steps including normalization, encoding, and transformation.

**What to look for in code/outputs:**
- Normalization/standardization code (z-score, min-max, robust scaling)
- Categorical encoding methods (one-hot, label, target encoding)
- Transformation pipelines applied to predictors (log, Box-Cox, polynomial)
- Preprocessing pipeline code that ensures consistent application to train and test data

---

## Methods -- Validation

### Item 14 -- Internal validation strategy

**Description:** Describe the internal validation strategy, including data splitting, cross-validation, or bootstrapping approach.

**What to look for in code/outputs:**
- Train/validation/test split code with split ratios and random seeds
- Cross-validation implementation (k-fold, stratified, grouped, temporal)
- Bootstrap validation code with number of resamples
- Temporal validation split preserving chronological ordering

### Item 15 -- External validation

**Description:** Describe any external validation, including the source of external data, population differences, and temporal separation.

**What to look for in code/outputs:**
- External dataset loading and description code
- Population comparison tables between development and validation cohorts
- Temporal separation documentation (model trained on data before validation period)
- Geographic or institutional separation between development and validation data

### Item 16 -- Performance metrics

**Description:** Report discrimination, calibration, and clinical utility metrics with confidence intervals.

**What to look for in code/outputs:**
- Discrimination metrics (AUC, C-statistic) with bootstrap confidence intervals
- Calibration plots (observed vs. predicted) and calibration metrics (slope, intercept, Brier score)
- Clinical utility assessment (decision curve analysis, net benefit)
- Sensitivity, specificity, PPV, NPV at clinically relevant thresholds

---

## Methods -- Fairness and Bias

### Item 17 -- Fairness assessment

**Description:** Report model performance across demographic and clinically relevant subgroups to assess fairness.

**What to look for in code/outputs:**
- Subgroup performance stratification code (by age, sex, race/ethnicity, site)
- Fairness metric calculations (equalized odds, calibration across groups)
- Disparity quantification between subgroups
- Subgroup sample sizes reported alongside subgroup-specific performance

### Item 18 -- Bias assessment

**Description:** Assess sources of bias in the prediction model, including selection bias, measurement bias, and algorithmic bias.

**What to look for in code/outputs:**
- Comparison of included vs. excluded patients
- Label bias assessment (outcome ascertainment differences across groups)
- Feature bias assessment (proxy variable identification)
- Sensitivity analyses for potential biases

---

## Results

### Item 19 -- Model performance results

**Description:** Report overall and subgroup model performance with appropriate uncertainty quantification.

**What to look for in code/outputs:**
- Performance summary tables with metrics, confidence intervals, and sample sizes
- ROC curves and calibration plots as generated figures
- Performance comparison across development and validation datasets
- Net reclassification improvement or integrated discrimination improvement if applicable

### Item 20 -- Model interpretability

**Description:** Report model interpretability or explainability analyses, including feature importance and individual prediction explanations.

**What to look for in code/outputs:**
- Global feature importance (SHAP summary, permutation importance, coefficients)
- Local explanation methods (SHAP waterfall, LIME, partial dependence plots)
- Clinically interpretable summaries of what drives predictions
- Interaction effect visualizations

---

## Discussion

### Item 21 -- Limitations and generalizability

**Description:** Discuss limitations of the model including known failure modes, population-specific constraints, and generalizability.

**What to look for in code/outputs:**
- Subgroup analysis revealing differential performance
- Comparison of development population demographics to target deployment population
- Documentation of known failure modes or edge cases
- Temporal stability analysis (model performance over time)

### Item 22 -- Implications and deployment readiness

**Description:** Discuss the clinical implications, readiness for deployment, and recommended next steps (prospective validation, implementation study).

**What to look for in code/outputs:**
- Deployment readiness assessment documentation
- Recommended validation steps before clinical implementation
- Comparison with existing clinical workflows and decision tools
- Impact analysis estimating clinical benefit of model deployment

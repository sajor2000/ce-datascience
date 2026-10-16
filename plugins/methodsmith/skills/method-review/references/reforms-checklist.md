# REFORMS Checklist for Machine Learning-Based Science

## Contents

- Module 1: Study goals
- Module 2: Computational reproducibility
- Module 3: Data quality
- Module 4: Data preprocessing
- Module 5: Modeling
- Module 6: Data leakage
- Module 7: Metrics and uncertainty
- Module 8: Generalizability and limitations

Cross-disciplinary reporting checklist for ML-based science: 32 items in 8 modules. Use it alongside, never instead of, the primary reporting guideline for the study design (for example TRIPOD+AI for a clinical prediction model).

**Base guideline:** Applies across study types whenever the study makes scientific claims from machine-learning methods. It is never the primary guideline.

**Primary reference:** Kapoor S, Cantrell EM, Peng K, Pham TH, Bail CA, Gundersen OE, Hofman JM, Hullman J, Lones MA, Malik MM, Nanayakkara P, Poldrack RA, Raji ID, Roberts M, Salganik MJ, Serra-Garcia M, Stewart BM, Vandewiele G, Narayanan A. REFORMS: Consensus-based Recommendations for Machine-learning-based Science. Sci Adv. 2024;10(18):eadk3452. doi:10.1126/sciadv.adk3452. PMID: 38691601.

**Source and licence:** Module names and item IDs (1a-8b) follow Table 1 of Kapoor et al. 2024; item descriptions are paraphrased from Kapoor S, et al. Sci Adv. 2024;10(18):eadk3452 (https://doi.org/10.1126/sciadv.adk3452, PMC11092361; CC BY-NC 4.0); see the original for exact wording. EQUATOR record: https://www.equator-network.org/reporting-guidelines/reforms-consensus-based-recommendations-for-machine-learning-based-science/. Project site: https://reforms.cs.princeton.edu/. The authors note that not every item applies to every study; authors and referees decide which items are relevant. The "What to look for" bullets are methodsmith review guidance, not part of the guideline.

---

## Module 1: Study goals

### Item 1a -- Population or distribution of the claim

**Description:** State the population or distribution that the scientific claim is about.

**What to look for in code/outputs:**
- Target population or data distribution named in the protocol, SAP, or report
- Claims in the results limited to that population

### Item 1b -- Motivation for the population

**Description:** Explain why this population or distribution (1a) was chosen.

**What to look for in code/outputs:**
- Rationale for the population choice stated in the protocol or introduction

### Item 1c -- Motivation for ML

**Description:** Explain why ML methods are used in the study.

**What to look for in code/outputs:**
- Stated reason ML is needed over simpler or traditional methods

---

## Module 2: Computational reproducibility

### Item 2a -- Dataset identification

**Description:** Describe the dataset used to train and evaluate the model, and give a link or DOI that uniquely identifies it.

**What to look for in code/outputs:**
- Dataset name, version, and persistent link or DOI in the README or data loader
- Access restrictions documented when the data cannot be shared

### Item 2b -- Code identification

**Description:** Describe the code used to train and evaluate the model and to produce the reported results, with a link or DOI that uniquely identifies the code version used.

**What to look for in code/outputs:**
- Repository URL with a tagged release, commit hash, or archived DOI (e.g., Zenodo)

### Item 2c -- Computing infrastructure

**Description:** Describe the computing infrastructure used.

**What to look for in code/outputs:**
- Hardware (CPU/GPU), operating system, and software/package versions recorded (lockfile, environment file, container)

### Item 2d -- README

**Description:** Provide a README with instructions for generating the results from the provided dataset and code.

**What to look for in code/outputs:**
- README with step-by-step commands from raw data to reported results

### Item 2e -- Reproduction script

**Description:** Provide a reproduction script that produces all results reported in the paper.

**What to look for in code/outputs:**
- Single entry-point script or pipeline (Makefile, Snakemake, targets, shell script) that regenerates every reported table and figure
- Random seeds fixed and recorded

---

## Module 3: Data quality

### Item 3a -- Data sources

**Description:** Describe the data source(s), separately for training and evaluation datasets where applicable, including when the data were collected, how ground-truth annotations were sourced and produced, and other data documentation.

**What to look for in code/outputs:**
- Separate provenance for training and evaluation data, with collection dates
- Label or ground-truth annotation process documented (who, how, agreement)

### Item 3b -- Sampling frame

**Description:** State the distribution or set the dataset is sampled from (the sampling frame).

**What to look for in code/outputs:**
- Sampling frame stated (e.g., all admissions at site X in years Y-Z)

### Item 3c -- Usefulness of the dataset

**Description:** Explain why the dataset is useful for the modeling task.

**What to look for in code/outputs:**
- Argument linking dataset content to the modeling task

### Item 3d -- Outcome variable

**Description:** State the model's outcome variable and its definition, with descriptive statistics (split by class when the outcome is categorical).

**What to look for in code/outputs:**
- Outcome definition in code matches the report; descriptive table by class

### Item 3e -- Sample size and outcome frequencies

**Description:** State the sample size and the outcome frequencies.

**What to look for in code/outputs:**
- N and outcome prevalence reported for each split

### Item 3f -- Missing data

**Description:** State the percentage of missing data, split by class when the outcome is categorical.

**What to look for in code/outputs:**
- Missingness table by variable and by outcome class

### Item 3g -- Representativeness

**Description:** Explain why the distribution or set the dataset is drawn from (3b) represents the one the scientific claim is about (1a).

**What to look for in code/outputs:**
- Comparison of the sampling frame with the target population of the claim

---

## Module 4: Data preprocessing

### Item 4a -- Excluded samples

**Description:** State whether any samples were excluded and why.

**What to look for in code/outputs:**
- Filtering code with documented exclusion criteria and counts (exclusion waterfall)

### Item 4b -- Impossible or corrupt samples

**Description:** Describe how impossible or corrupt samples were handled.

**What to look for in code/outputs:**
- Range checks or validation rules and the action taken (drop, correct, flag)

### Item 4c -- Transformations

**Description:** Describe every transformation from the raw dataset (3a) to the form used in the model, such as missing-data treatment and normalization, ideally with a flow chart.

**What to look for in code/outputs:**
- Every transformation step traceable in code (imputation, scaling, encoding, feature construction)
- Flow chart or pipeline diagram from raw data to model input

---

## Module 5: Modeling

### Item 5a -- Models trained

**Description:** Describe all trained models in detail.

**What to look for in code/outputs:**
- Every model trained is reported, not only the best one

### Item 5b -- Choice of model types

**Description:** Explain why the implemented model types were chosen.

**What to look for in code/outputs:**
- Rationale for each model family in the protocol or methods

### Item 5c -- Evaluation method

**Description:** Describe how the reported model(s) were evaluated, including train-test splits or cross-validation folds.

**What to look for in code/outputs:**
- Split strategy and fold construction in code (grouped, temporal, or stratified as the data require)

### Item 5d -- Model selection

**Description:** Describe how the reported model(s) were selected.

**What to look for in code/outputs:**
- Selection criterion and the data used for selection (validation set, inner CV), never the test set

### Item 5e -- Hyperparameter tuning

**Description:** For the reported model(s), give details of hyperparameter tuning.

**What to look for in code/outputs:**
- Search space, search method, budget, and final hyperparameter values recorded

### Item 5f -- Baselines

**Description:** Explain why the baselines used for model comparison are appropriate.

**What to look for in code/outputs:**
- Simple baselines (e.g., logistic regression, prior standard of care) evaluated on the same splits

---

## Module 6: Data leakage

### Item 6a -- Train-only preprocessing and modeling

**Description:** Show that the preprocessing (Module 4) and modeling (Module 5) steps use information only from the training data, not the test data.

**What to look for in code/outputs:**
- Scalers, imputers, encoders, and feature selection fit inside the training fold only (pipeline objects)

### Item 6b -- Dependencies and duplicates

**Description:** Describe how dependencies or duplicates between training and test data were handled (for example, keeping different samples from the same patient in the same partition).

**What to look for in code/outputs:**
- Group-aware splitting by patient, site, or time; duplicate checks across partitions

### Item 6c -- Legitimate features

**Description:** Explain why each feature or input is legitimate for the task and does not cause leakage.

**What to look for in code/outputs:**
- Feature availability at prediction time checked (no post-outcome or proxy-of-label features)

---

## Module 7: Metrics and uncertainty

### Item 7a -- Metrics

**Description:** State every metric used to assess and compare model performance (for example accuracy or AUROC), and explain why the metric used to select the final model suits the task.

**What to look for in code/outputs:**
- All computed metrics reported; selection metric justified for the task (e.g., class imbalance)

### Item 7b -- Uncertainty estimates

**Description:** Report uncertainty estimates (for example confidence intervals or standard deviations) and how they were calculated.

**What to look for in code/outputs:**
- Confidence intervals or variability across folds/seeds, with the method (bootstrap, analytical) stated

### Item 7c -- Statistical tests

**Description:** Explain the choice of any statistical tests and how their assumptions were checked.

**What to look for in code/outputs:**
- Named test for model comparisons (e.g., DeLong, McNemar, corrected resampled t-test) with assumption checks

---

## Module 8: Generalizability and limitations

### Item 8a -- External validity

**Description:** Describe the evidence for external validity.

**What to look for in code/outputs:**
- Evaluation on an external dataset, site, or time period, or an explicit statement that none was done

### Item 8b -- Contexts where findings may not hold

**Description:** Describe the contexts in which the authors expect the findings not to hold.

**What to look for in code/outputs:**
- Stated populations, settings, or data shifts where the results should not be applied

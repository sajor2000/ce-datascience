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

**Source and licence:** Module names, item IDs (1a-8b), and item text are reproduced verbatim from Table 1 of Kapoor et al. 2024 (https://doi.org/10.1126/sciadv.adk3452, PMC11092361), published under CC BY-NC 4.0 (non-commercial reuse with attribution). EQUATOR record: https://www.equator-network.org/reporting-guidelines/reforms-consensus-based-recommendations-for-machine-learning-based-science/. Project site: https://reforms.cs.princeton.edu/. The authors note that not every item applies to every study; authors and referees decide which items are relevant. The "What to look for" bullets are ce-datascience review guidance, not part of the guideline.

---

## Module 1: Study goals

### Item 1a -- Population or distribution of the claim

**Description:** State the population or distribution about which the scientific claim is made.

**What to look for in code/outputs:**
- Target population or data distribution named in the protocol, SAP, or report
- Claims in the results limited to that population

### Item 1b -- Motivation for the population

**Description:** Describe the motivation for choosing this population or distribution (1a.).

**What to look for in code/outputs:**
- Rationale for the population choice stated in the protocol or introduction

### Item 1c -- Motivation for ML

**Description:** Describe the motivation for the use of ML methods in the study.

**What to look for in code/outputs:**
- Stated reason ML is needed over simpler or traditional methods

---

## Module 2: Computational reproducibility

### Item 2a -- Dataset identification

**Description:** Describe the dataset used for training and evaluating the model and provide a link or DOI to uniquely identify the dataset.

**What to look for in code/outputs:**
- Dataset name, version, and persistent link or DOI in the README or data loader
- Access restrictions documented when the data cannot be shared

### Item 2b -- Code identification

**Description:** Provide details about the code used to train and evaluate the model and produce the results reported in the paper along with link or DOI to uniquely identify the version of the code used.

**What to look for in code/outputs:**
- Repository URL with a tagged release, commit hash, or archived DOI (e.g., Zenodo)

### Item 2c -- Computing infrastructure

**Description:** Describe the computing infrastructure used.

**What to look for in code/outputs:**
- Hardware (CPU/GPU), operating system, and software/package versions recorded (lockfile, environment file, container)

### Item 2d -- README

**Description:** Provide a README file which contains instructions for generating the results using the provided dataset and code.

**What to look for in code/outputs:**
- README with step-by-step commands from raw data to reported results

### Item 2e -- Reproduction script

**Description:** Provide a reproduction script to produce all results reported in the paper.

**What to look for in code/outputs:**
- Single entry-point script or pipeline (Makefile, Snakemake, targets, shell script) that regenerates every reported table and figure
- Random seeds fixed and recorded

---

## Module 3: Data quality

### Item 3a -- Data sources

**Description:** Describe source(s) of data, separately for the training and evaluation datasets (if applicable), along with the time when the dataset(s) are collected, the source and process of ground-truth annotations, and other data documentation.

**What to look for in code/outputs:**
- Separate provenance for training and evaluation data, with collection dates
- Label or ground-truth annotation process documented (who, how, agreement)

### Item 3b -- Sampling frame

**Description:** State the distribution or set from which the dataset is sampled (i.e., the sampling frame).

**What to look for in code/outputs:**
- Sampling frame stated (e.g., all admissions at site X in years Y-Z)

### Item 3c -- Usefulness of the dataset

**Description:** Justify why the dataset is useful for the modeling task at hand.

**What to look for in code/outputs:**
- Argument linking dataset content to the modeling task

### Item 3d -- Outcome variable

**Description:** State the outcome variable of the model, along with descriptive statistics (split by class for a categorical outcome variable) and its definition.

**What to look for in code/outputs:**
- Outcome definition in code matches the report; descriptive table by class

### Item 3e -- Sample size and outcome frequencies

**Description:** State the sample size and outcome frequencies.

**What to look for in code/outputs:**
- N and outcome prevalence reported for each split

### Item 3f -- Missing data

**Description:** State the percentage of missing data, split by class for a categorical outcome variable.

**What to look for in code/outputs:**
- Missingness table by variable and by outcome class

### Item 3g -- Representativeness

**Description:** Justify why the distribution or set from which the dataset is drawn (3b.) is representative of the one about which the scientific claim is being made (1a.).

**What to look for in code/outputs:**
- Comparison of the sampling frame with the target population of the claim

---

## Module 4: Data preprocessing

### Item 4a -- Excluded samples

**Description:** Describe whether any samples are excluded with a rationale for why they are excluded.

**What to look for in code/outputs:**
- Filtering code with documented exclusion criteria and counts (exclusion waterfall)

### Item 4b -- Impossible or corrupt samples

**Description:** Describe how impossible or corrupt samples are dealt with.

**What to look for in code/outputs:**
- Range checks or validation rules and the action taken (drop, correct, flag)

### Item 4c -- Transformations

**Description:** Describe all transformations of the dataset from its raw form (3a.) to the form used in the model, for instance, treatment of missing data and normalization—preferably through a flow chart.

**What to look for in code/outputs:**
- Every transformation step traceable in code (imputation, scaling, encoding, feature construction)
- Flow chart or pipeline diagram from raw data to model input

---

## Module 5: Modeling

### Item 5a -- Models trained

**Description:** Describe, in detail, all models trained.

**What to look for in code/outputs:**
- Every model trained is reported, not only the best one

### Item 5b -- Choice of model types

**Description:** Justify the choice of model types implemented.

**What to look for in code/outputs:**
- Rationale for each model family in the protocol or methods

### Item 5c -- Evaluation method

**Description:** Describe the method for evaluating the model(s) reported in the paper, including details of train-test splits or cross-validation folds.

**What to look for in code/outputs:**
- Split strategy and fold construction in code (grouped, temporal, or stratified as the data require)

### Item 5d -- Model selection

**Description:** Describe the method for selecting the model(s) reported in the paper.

**What to look for in code/outputs:**
- Selection criterion and the data used for selection (validation set, inner CV), never the test set

### Item 5e -- Hyperparameter tuning

**Description:** For the model(s) reported in the paper, specify details about the hyperparameter tuning.

**What to look for in code/outputs:**
- Search space, search method, budget, and final hyperparameter values recorded

### Item 5f -- Baselines

**Description:** Justify that model comparisons are against appropriate baselines.

**What to look for in code/outputs:**
- Simple baselines (e.g., logistic regression, prior standard of care) evaluated on the same splits

---

## Module 6: Data leakage

### Item 6a -- Train-only preprocessing and modeling

**Description:** Justify that preprocessing (Module 4) and modeling (Module 5) steps only use information from the training dataset (and not the test dataset).

**What to look for in code/outputs:**
- Scalers, imputers, encoders, and feature selection fit inside the training fold only (pipeline objects)

### Item 6b -- Dependencies and duplicates

**Description:** Describe methods used to address dependencies or duplicates between the training and test datasets (e.g. different samples from the same patients are kept in the same dataset partition).

**What to look for in code/outputs:**
- Group-aware splitting by patient, site, or time; duplicate checks across partitions

### Item 6c -- Legitimate features

**Description:** Justify that each feature or input used in the model is legitimate for the task at hand and does not lead to leakage.

**What to look for in code/outputs:**
- Feature availability at prediction time checked (no post-outcome or proxy-of-label features)

---

## Module 7: Metrics and uncertainty

### Item 7a -- Metrics

**Description:** State all metrics used to assess and compare model performance (e.g., accuracy, AUROC etc.). Justify that the metric used to select the final model is suitable for the task.

**What to look for in code/outputs:**
- All computed metrics reported; selection metric justified for the task (e.g., class imbalance)

### Item 7b -- Uncertainty estimates

**Description:** State uncertainty estimates (e.g., confidence intervals, standard deviations), and give details of how these are calculated.

**What to look for in code/outputs:**
- Confidence intervals or variability across folds/seeds, with the method (bootstrap, analytical) stated

### Item 7c -- Statistical tests

**Description:** Justify the choice of statistical tests (if used) and a check for the assumptions of the statistical test.

**What to look for in code/outputs:**
- Named test for model comparisons (e.g., DeLong, McNemar, corrected resampled t-test) with assumption checks

---

## Module 8: Generalizability and limitations

### Item 8a -- External validity

**Description:** Describe evidence of external validity.

**What to look for in code/outputs:**
- Evaluation on an external dataset, site, or time period, or an explicit statement that none was done

### Item 8b -- Contexts where findings may not hold

**Description:** Describe contexts in which the authors do not expect the study's findings to hold.

**What to look for in code/outputs:**
- Stated populations, settings, or data shifts where the results should not be applied

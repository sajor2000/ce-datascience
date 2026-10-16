# CLAIM Checklist for Artificial Intelligence in Medical Imaging

## Contents

- Title and Abstract
- Introduction
- Methods -- Study Design
- Methods -- Data
- Methods -- Reference Standard
- Methods -- Data Partitions
- Methods -- Testing Data
- Methods -- Model
- Methods -- Training
- Methods -- Evaluation
- Results -- Data
- Results -- Model Performance
- Discussion
- Other Information

Checklist for Artificial Intelligence in Medical Imaging (CLAIM), 2024 Update: 44 items for studies applying AI to medical imaging. Each item is answered Yes, No, or Not applicable; for No or Not applicable, explain why.

**Relationship:** CLAIM is a self-contained checklist modeled on STARD. Use it together with the study's reporting guideline: STARD-AI for AI diagnostic-accuracy studies, or TRIPOD+AI for prediction models. It does not replace them. The 2024 Update does not extend CLAIM to imaging biomarker studies (radiomics, pathomics).

**Primary reference (2024 update):** Tejani AS, Klontzas ME, Gatti AA, Mongan JT, Moy L, Park SH, Kahn CE Jr; CLAIM 2024 Update Panel. Checklist for Artificial Intelligence in Medical Imaging (CLAIM): 2024 Update. Radiol Artif Intell. 2024;6(4):e240300. doi:10.1148/ryai.240300. PMID: 38809149. PMCID: PMC11304031.

**Previous version (superseded):** Mongan J, Moy L, Kahn CE Jr. Checklist for Artificial Intelligence in Medical Imaging (CLAIM): A Guide for Authors and Reviewers. Radiol Artif Intell. 2020;2(2):e200029. doi:10.1148/ryai.2020200029. PMID: 33937821.

**Verified against:** the 2024 Update full text, https://pubs.rsna.org/doi/full/10.1148/ryai.240300, and the EQUATOR record, https://www.equator-network.org/reporting-guidelines/checklist-for-artificial-intelligence-in-medical-imaging-claim-a-guide-for-authors-and-reviewers/, checked 2026-10-15. Official site: https://pubs.rsna.org/page/ai/claim.

**Licence and wording:** The article is © 2024 Radiological Society of North America and is not openly licensed. Item numbers and short item titles are reproduced; descriptions are faithful paraphrases of the article's guidance, not verbatim text. Review cues are added by this plugin.

**2024 terminology:** use "reference standard" (not "ground truth" or "gold standard"), "internal testing" and "external testing" (not "validation"), and "tuning" or "model optimization" for the hyperparameter-selection partition. The 2020 data-elements item was removed, and item 13 (image acquisition protocol) is new.

---

## Title and Abstract

### Item 1 -- Identification as a study of AI methodology

**Description:** Identify the study as AI methodology research, naming the category of technology used (for example, deep learning or vision transformers) in the title and/or abstract.

**What to look for in code/outputs:**
- Title or abstract naming the AI technique and the imaging modality

### Item 2 -- Structured summary

**Description:** Summarize study design, methods, results, and conclusions, including data sources and public datasets, numbers of patients or examinations, modalities, data partitions and the level of splitting, prospective or retrospective design, the statistical analysis, and whether software, data, or the model are publicly available.

**What to look for in code/outputs:**
- Partition sizes and split level (patient or image) in the abstract match the split code

---

## Introduction

### Item 3 -- Scientific and clinical background

**Description:** Give the scientific and/or clinical background, including the intended use and role of the AI approach, and state current practice explicitly.

**What to look for in code/outputs:**
- Intended use and clinical role recorded in the project documentation

### Item 4 -- Study aims, objectives, and hypotheses

**Description:** State the study aims and objectives and, unless the approach is purely data-driven, the hypotheses, specified a priori.

**What to look for in code/outputs:**
- Hypotheses and primary endpoints recorded in the SAP before testing

---

## Methods -- Study Design

### Item 5 -- Prospective or retrospective study

**Description:** State whether the study is prospective or retrospective.

**What to look for in code/outputs:**
- Data collection timing documented relative to model development

### Item 6 -- Study goal

**Description:** Describe the study design and goal (for example, model creation, exploratory, feasibility, or noninferiority study); for classification systems, state the intended use (such as triage, diagnosis, screening, staging, monitoring, prediction, or prognosis) and the prediction target.

**What to look for in code/outputs:**
- Prediction target and intended use stated consistently in config and documentation

---

## Methods -- Data

### Item 7 -- Data sources

**Description:** State the data sources, including public datasets and synthetic images, with links where available, and describe how well the data match the model's intended use and target population.

**What to look for in code/outputs:**
- Source institutions, public dataset versions, and synthetic-data generators recorded in the data manifest

### Item 8 -- Inclusion and exclusion criteria

**Description:** Specify inclusion and exclusion criteria (such as location, dates, care setting, demographics, follow-up, and prior test results), how, where, and when potentially eligible participants or studies were identified, and whether the series was consecutive, random, or convenience.

**What to look for in code/outputs:**
- Eligibility filters in cohort code matching the written criteria, with counts excluded at each step

### Item 9 -- Data preprocessing

**Description:** Describe preprocessing in enough detail to reproduce it: normalization, resampling, bit-depth change, window/level adjustment, rescaling, binarization or standardization, handling of formatting problems, inconsistent or incorrect data, outlier removal criteria, and the software (with versions) and settings used.

**What to look for in code/outputs:**
- Preprocessing pipeline code with parameters, fit on training data only and applied unchanged to test data

### Item 10 -- Selection of data subsets

**Description:** State whether subsets of the raw extracted data were selected during preprocessing (for example, a subset of images, cropped regions, or report segments), and describe the tools and parameters if automated or the personnel training and criteria if manual.

**What to look for in code/outputs:**
- Cropping, slice-selection, or ROI code and any manual selection protocol

### Item 11 -- De-identification

**Description:** Describe how the data were de-identified and how protected health information was removed to meet applicable regulations (for example, HIPAA, GDPR, or the EU AI Act).

**What to look for in code/outputs:**
- De-identification tool and DICOM tag handling documented, including burned-in text

### Item 12 -- Missing data

**Description:** Describe how missing data were handled, including any replacement with approximate, predicted, or proxy values, and discuss biases that imputation may introduce.

**What to look for in code/outputs:**
- Missing-data counts and the imputation or exclusion rule in code

### Item 13 -- Image acquisition protocol

**Description:** Describe the image acquisition protocol (for example, manufacturer, MRI sequence, ultrasound frequency, CT energy and tube current, slice thickness, scan range, and resolution) with all parameters needed for reproducibility.

**What to look for in code/outputs:**
- Acquisition parameters extracted from DICOM headers and summarized per site and scanner

---

## Methods -- Reference Standard

### Item 14 -- Definition of the reference standard method

**Description:** Describe precisely how the reference standard was obtained, in enough detail to replicate it, including the guidelines given to annotators and examples for subjective grading schemes.

**What to look for in code/outputs:**
- Label definitions and annotation guideline document versioned with the data

### Item 15 -- Rationale for choosing the reference standard

**Description:** Explain why this reference standard was chosen over alternatives, including its potential errors, biases, and limitations.

**What to look for in code/outputs:**
- Documented rationale and known error rate of the label source

### Item 16 -- Source of reference standard annotations

**Description:** Specify the source of the annotations (citing existing data resources if used), the number of human annotators and their qualifications, and the instructions or training they received.

**What to look for in code/outputs:**
- Annotator roster with expertise level, and training materials in the supplement

### Item 17 -- Annotation of test set

**Description:** Describe how the test set was annotated in enough detail to replicate it, including instructions, annotation software and version, and any extraction of labels from reports or EHRs by natural language processing or other automated methods.

**What to look for in code/outputs:**
- Test-set labelling pipeline, including NLP label-extraction code and its own validation

### Item 18 -- Inter- and intrarater variability

**Description:** Describe how inter- and intrarater variability was measured, reduced, or mitigated, and how discrepancies between annotators were resolved.

**What to look for in code/outputs:**
- Agreement statistics (kappa, ICC, Dice between readers) and the adjudication rule

---

## Methods -- Data Partitions

### Item 19 -- Assignment of data to partitions

**Description:** Specify how data were assigned to training, tuning, and testing partitions, the proportion in each and its justification, any systematic differences between partitions and how class imbalance was addressed, and use established splits for public datasets.

**What to look for in code/outputs:**
- Split code with ratios, seeds, and stratification, and saved split files for reuse

### Item 20 -- Level at which partitions are disjoint

**Description:** Describe the level at which partitions are disjoint (for example, patient, series, or image); partitions should generally be disjoint at the patient level or higher.

**What to look for in code/outputs:**
- Patient-level grouping in the split, and a check that no patient ID appears in more than one partition

---

## Methods -- Testing Data

### Item 21 -- Intended sample size

**Description:** Describe the size of the test set and how it was determined, using power or precision calculations where applicable (for example, for a target AUC and confidence-interval width).

**What to look for in code/outputs:**
- Sample size or precision calculation saved with the analysis plan

---

## Methods -- Model

### Item 22 -- Detailed description of model

**Description:** Describe the model fully enough to reconstruct it (inputs, outputs, and all intermediate layers, including pooling, normalization, regularization, and activation), or cite a published architecture and describe every modification.

**What to look for in code/outputs:**
- Model definition code or architecture config committed with the results

### Item 23 -- Software libraries, frameworks, and packages

**Description:** Name all software libraries, frameworks, and packages used for training and inference, with version numbers; describe hardware where computational performance matters.

**What to look for in code/outputs:**
- Lock file or environment specification pinning framework versions

### Item 24 -- Initialization of model parameters

**Description:** State how model parameters were initialized: the distribution for random initialization, the source of starting weights for transfer learning, and which parts used which strategy.

**What to look for in code/outputs:**
- Pretrained checkpoint source and version recorded; frozen layers identified

---

## Methods -- Training

### Item 25 -- Details of training approach

**Description:** Describe training in enough detail to replicate it: data augmentation, convergence monitoring and stopping criteria, every hyperparameter value with search ranges and strategy, the objective function and its rationale, the criteria for selecting the best model, and any frozen parameters.

**What to look for in code/outputs:**
- Training script and config with augmentation, optimizer, learning-rate schedule, batch size, early stopping, and search space logged

### Item 26 -- Method of selecting the final model

**Description:** Describe the method and metrics used to select the final model for evaluation on the held-out test set, and justify selecting more than one model if done.

**What to look for in code/outputs:**
- Model selection driven by tuning-partition metrics, never by test-set results

### Item 27 -- Ensembling technique

**Description:** If the final algorithm is an ensemble, describe each component model fully and how their outputs are weighted or combined.

**What to look for in code/outputs:**
- Ensemble member list and combination rule in code

---

## Methods -- Evaluation

### Item 28 -- Metrics of model performance

**Description:** Describe the performance metrics, explain how they address the characteristics most important to the clinical or scientific problem, and compare the model with previously published models.

**What to look for in code/outputs:**
- Metric choice justified for the task (e.g., Dice or Hausdorff for segmentation; AUC, sensitivity, specificity for classification)

### Item 29 -- Statistical measures of significance and uncertainty

**Description:** Report the uncertainty of performance metrics (for example, standard deviations or confidence intervals), use appropriate significance tests to compare metrics, and name the statistical software and version.

**What to look for in code/outputs:**
- Bootstrap or analytic CIs and paired tests (e.g., DeLong) in the evaluation code

### Item 30 -- Robustness or sensitivity analysis

**Description:** Analyze how robust or sensitive the model is to assumptions or initial conditions.

**What to look for in code/outputs:**
- Repeated runs across seeds or perturbations, with the spread reported

### Item 31 -- Methods for explainability or interpretability

**Description:** If used, describe the explainability or interpretability methods and their parameters, and how they were validated in this study.

**What to look for in code/outputs:**
- Saliency or attribution code with settings, and any validation against annotations

### Item 32 -- Evaluation on internal data

**Description:** Describe the evaluation on internal data, explain any systematic differences in annotations or data between the training and internal test sets and how they were handled, and state whether performance was consistent across the two.

**What to look for in code/outputs:**
- Training versus internal-test performance reported side by side

### Item 33 -- Testing on external data

**Description:** Describe the external data used to test the final algorithm, or state and justify the absence of external testing; explain and handle any differences in annotations or data from the training set.

**What to look for in code/outputs:**
- External test set from another institution or time period evaluated with the frozen model

### Item 34 -- Clinical trial registration

**Description:** If applicable, register the study in a public trial registry in line with ICMJE requirements, at or before first patient enrolment.

**What to look for in code/outputs:**
- Registry identifier recorded for prospective or interventional studies

---

## Results -- Data

### Item 35 -- Numbers of patients or examinations included and excluded

**Description:** Report the numbers of patients, examinations, or images included and excluded under each criterion, with a flowchart or similar diagram.

**What to look for in code/outputs:**
- Attrition counts generated from the cohort code and matching the flow diagram

### Item 36 -- Characteristics of cases in each partition and dataset

**Description:** Report the demographic and clinical characteristics of cases in each partition and dataset, and identify potential sources of bias from differences between them.

**What to look for in code/outputs:**
- Per-partition characteristics table, including sex, race or ethnicity, and site or scanner

---

## Results -- Model Performance

### Item 37 -- Performance metrics and measures of statistical uncertainty

**Description:** Report the final model's performance against the reference standard on all data partitions and datasets, including demographic subgroups.

**What to look for in code/outputs:**
- Performance table for every partition, dataset, and subgroup

### Item 38 -- Estimates of diagnostic performance and their precision

**Description:** For classification tasks, report diagnostic accuracy with uncertainty (such as 95% CIs, or bootstrap estimates when direct calculation is not possible), use ROC and/or calibration analysis, identify the subpopulations where the model worked best and worst, and use metrics suited to any class imbalance.

**What to look for in code/outputs:**
- ROC and calibration plots, CIs, and imbalance-aware metrics (e.g., PR-AUC) where prevalence is low

### Item 39 -- Failure analysis of incorrect results

**Description:** Provide information to help readers understand incorrect results, including a confusion matrix for classification tasks and, where useful, examples of misclassified cases in clinical context.

**What to look for in code/outputs:**
- Confusion matrix and an error-review notebook examining false positives and false negatives

---

## Discussion

### Item 40 -- Study limitations

**Description:** Identify the study's limitations, including methods, materials, biases, statistical uncertainty, unexpected results, and generalizability.

**What to look for in code/outputs:**
- Limitations that match the evidence (e.g., single-site data, narrow scanner mix)

### Item 41 -- Implications for practice

**Description:** Describe implications for practice, including the intended use and possible clinical role of the model, its expected impact, next steps, and barriers to translation.

**What to look for in code/outputs:**
- Clinical role and next-step validation plan recorded

---

## Other Information

### Item 42 -- Reference to full study protocol or technical details

**Description:** State where readers can access the full study protocol or additional technical details that exceed the word limit (for trials, the protocol referenced in item 34).

**What to look for in code/outputs:**
- Protocol or technical supplement link in the report

### Item 43 -- Availability of software, trained model, and/or data

**Description:** State where the software, trained model, and/or data can be accessed and under what conditions; authors are encouraged to deposit all modeling and analysis code in a public repository.

**What to look for in code/outputs:**
- Public repository with a tagged release and model weights or access instructions

### Item 44 -- Sources of funding and other support

**Description:** Specify sources of funding and other support, the exact role of the funders, and whether the authors were independent in each phase of the study.

**What to look for in code/outputs:**
- Funding statement naming funders' roles and author independence

# STARD-AI Checklist for AI-Assisted Diagnostic Accuracy Studies

## Contents

- Title and Abstract
- Introduction
- Methods
- Results
- Discussion
- Other Information

Standards for Reporting of Diagnostic Accuracy Studies -- Artificial Intelligence (STARD-AI).
STARD-AI has 40 items (48 rows counting lettered sub-items). It incorporates the STARD 2015 items, modifies 4 of them (items 1, 3, 7, 25; marked †), and adds 14 AI-specific items (6, 11, 12, 13, 14, 15b, 15d, 23, 28, 29, 35, 39, 40a, 40b; marked *). It is complete on its own: use it **instead of** STARD 2015 for AI-centred diagnostic accuracy studies, not alongside it, and use STARD for Abstracts for item 2.

**Primary reference:** Sounderajah V, Guni A, Liu X, Collins GS, Karthikesalingam A, Markar SR, Golub RM, Denniston AK, Shetty S, Moher D, Bossuyt PM, Darzi A, Ashrafian H; STARD-AI Steering Committee. The STARD-AI reporting guideline for diagnostic accuracy studies using artificial intelligence. Nat Med. 2025;31(10):3283-3289. doi:10.1038/s41591-025-03953-8. PMID: 40954311. Author correction (consortium list only; checklist unchanged): Nat Med. 2026;32(9):3493. doi:10.1038/s41591-026-04570-9. PMID: 42443516.

**Development protocol:** Sounderajah V, Ashrafian H, Golub RM, et al. Developing a reporting guideline for artificial intelligence-centred diagnostic test accuracy studies: the STARD-AI protocol. BMJ Open. 2021;11:e047709. doi:10.1136/bmjopen-2020-047709. PMID: 34183345. The protocol is not the final reporting standard.

**Verified against:** Table 2 of the statement, https://www.nature.com/articles/s41591-025-03953-8/tables/2, and the EQUATOR record, https://www.equator-network.org/reporting-guidelines/the-stard-ai-reporting-guideline-for-diagnostic-accuracy-studies-using-artificial-intelligence/, checked 2026-10-15. A downloadable checklist is Supplementary Table 2 of the article.

**Licence and wording:** Springer Nature holds exclusive rights to the article, so item text below is a faithful paraphrase of Table 2; item numbers, sections, and the new/modified markers are exact. Review cues are added by this plugin.

---

## Title and Abstract

### STARD-AI 1 -- Title or abstract †

**Description:** Identify the study as reporting AI-centred diagnostic accuracy, and report at least one measure of accuracy, in the title or abstract.

**What to look for in code/outputs:**
- Title or abstract naming the AI index test and stating at least one accuracy measure (e.g., sensitivity, AUC)

### STARD-AI 2 -- Abstract

**Description:** Give a structured summary of study design, methods, results, and conclusions (see STARD for Abstracts).

---

## Introduction

### STARD-AI 3 -- Background †

**Description:** Describe the scientific and clinical background, including the index test's intended use, whether it is novel or established, and, if applicable, how it integrates into an existing or new workflow.

**What to look for in code/outputs:**
- Intended use and clinical role (triage, replacement, add-on) recorded in project documentation

### STARD-AI 4 -- Objectives

**Description:** State the study objectives and hypotheses.

---

## Methods

### STARD-AI 5 -- Study design

**Description:** State whether data collection was planned before the index test and reference standard were performed (prospective) or after (retrospective).

### STARD-AI 6 -- Ethics *

**Description:** Report formal ethics committee approval, or justify why it was not required.

### STARD-AI 7 -- Eligibility criteria †

**Description:** List separate inclusion and exclusion criteria, in the order applied, at both the participant level and the data level.

**What to look for in code/outputs:**
- Participant-level and image- or record-level filters in cohort code, applied in the documented order with counts

### STARD-AI 8 -- Identification basis

**Description:** State on what basis potentially eligible participants were identified (for example, symptoms, prior test results, or registry inclusion).

### STARD-AI 9 -- Setting and dates

**Description:** State where and when potentially eligible participants were identified (setting, location, and dates).

### STARD-AI 10 -- Sampling

**Description:** State whether participants formed a consecutive, random, or convenience series.

### STARD-AI 11 -- Data source *

**Description:** Describe the source of the data and whether it was routinely collected, collected specifically for the study, or taken from an open-source repository.

**What to look for in code/outputs:**
- Data manifest recording each source and public dataset version

### STARD-AI 12 -- Annotation *

**Description:** If applicable, state who annotated the dataset (experience and background) and how (within the same clinical context or post hoc).

**What to look for in code/outputs:**
- Annotator roster and labelling protocol; agreement statistics where multiple annotators were used

### STARD-AI 13 -- Devices and software *

**Description:** Report the devices (manufacturer and model) used to capture the data and the software (with version) used to build the index test, highlighting its intended use.

**What to look for in code/outputs:**
- Scanner or device metadata summarized per site; model version or checkpoint identifier pinned

### STARD-AI 14 -- Acquisition and preprocessing *

**Description:** Describe data acquisition protocols (for example, contrast protocol or image reconstruction) and data preprocessing in enough detail to allow replication.

**What to look for in code/outputs:**
- Preprocessing pipeline code with parameters, fit on development data only

### STARD-AI 15a -- Index test

**Description:** Describe the index test in enough detail to allow replication.

**What to look for in code/outputs:**
- Architecture, inputs, and outputs documented (or cited) with the exact evaluated version

### STARD-AI 15b -- Index test development *

**Description:** Describe how the index test was developed, including any training, validation, testing, and external evaluation, with sample sizes where applicable.

**What to look for in code/outputs:**
- Split code with patient-level grouping, partition sizes, and no leakage between partitions
- External evaluation set kept separate from all development steps

### STARD-AI 15c -- Index test positivity cutoffs

**Description:** Define and justify the positivity cutoffs or result categories of the index test, distinguishing prespecified from exploratory.

**What to look for in code/outputs:**
- Operating threshold fixed before evaluation on the test set; post hoc thresholds labelled as exploratory

### STARD-AI 15d -- Intended end-user *

**Description:** Specify the intended end-user of the index test and the level of expertise users need.

### STARD-AI 16a -- Reference standard

**Description:** Describe the reference standard in enough detail to allow replication.

### STARD-AI 16b -- Reference standard rationale

**Description:** Explain why the reference standard was chosen, if alternatives exist.

### STARD-AI 16c -- Reference standard positivity cutoffs

**Description:** Define and justify the positivity cutoffs or result categories of the reference standard, distinguishing prespecified from exploratory.

### STARD-AI 17a -- Information available to index test readers

**Description:** State whether clinical information and reference standard results were available to those performing or reading the index test.

### STARD-AI 17b -- Information available to reference standard assessors

**Description:** State whether clinical information and index test results were available to those assessing the reference standard.

**What to look for in code/outputs:**
- Blinding protocol for reference standard assessors; any reference labels informed by AI output flagged as a limitation

### STARD-AI 18 -- Accuracy methods

**Description:** Describe the methods used to estimate or compare measures of diagnostic accuracy.

**What to look for in code/outputs:**
- Sensitivity, specificity, predictive values, and AUC computed with confidence-interval methods named

### STARD-AI 19 -- Indeterminate results

**Description:** Describe how indeterminate index test or reference standard results were handled.

### STARD-AI 20 -- Missing data

**Description:** Describe how missing index test and reference standard data were handled.

### STARD-AI 21 -- Variability analyses

**Description:** Describe any analyses of variability in diagnostic accuracy, distinguishing prespecified from exploratory.

**What to look for in code/outputs:**
- Subgroup plan (age, sex, race or ethnicity, severity, device, site) written before analysis

### STARD-AI 22 -- Sample size

**Description:** State the intended sample size and how it was determined.

### STARD-AI 23 -- Error analysis and fairness *

**Description:** If undertaken, describe any performance error analysis and any algorithmic bias and fairness assessments.

**What to look for in code/outputs:**
- Error-review code examining false positives and false negatives; per-group performance and named fairness criteria

---

## Results

### STARD-AI 24 -- Participant flow

**Description:** Report the flow of participants, using a diagram.

### STARD-AI 25 -- Baseline characteristics †

**Description:** Report baseline demographic, clinical, and technical characteristics of the training, validation, and test sets, if applicable.

**What to look for in code/outputs:**
- Per-partition characteristics table including device or site mix

### STARD-AI 26a -- Disease severity

**Description:** Report the distribution of disease severity in those with the target condition.

### STARD-AI 26b -- Alternative diagnoses

**Description:** Report the distribution of alternative diagnoses in those without the target condition.

### STARD-AI 27 -- Time interval

**Description:** Report the time interval and any clinical interventions between the index test and the reference standard.

### STARD-AI 28 -- Dataset representativeness *

**Description:** Report whether the datasets reflect the distribution of the target condition expected in the intended-use population.

**What to look for in code/outputs:**
- Dataset prevalence and case mix compared with the intended-use population

### STARD-AI 29 -- External evaluation differences *

**Description:** For external evaluation on an independent dataset, assess how it differs from the training, validation, and test sets.

**What to look for in code/outputs:**
- Covariate and acquisition-shift comparison between external and development data

### STARD-AI 30 -- Cross-tabulation

**Description:** Cross-tabulate index test results (or their distribution) against reference standard results.

**What to look for in code/outputs:**
- Confusion matrix at the prespecified operating point

### STARD-AI 31 -- Accuracy estimates

**Description:** Report estimates of diagnostic accuracy and their precision (for example, 95% confidence intervals).

**What to look for in code/outputs:**
- Point estimates with 95% CIs (bootstrap or exact) for every reported metric

### STARD-AI 32 -- Adverse events

**Description:** Report any adverse events from performing the index test or the reference standard.

---

## Discussion

### STARD-AI 33 -- Limitations

**Description:** Discuss study limitations, including sources of potential bias, statistical uncertainty, and generalizability.

**What to look for in code/outputs:**
- Limitations naming domain-shift risks (scanners, populations, prevalence) and single-site data

### STARD-AI 34 -- Implications for practice

**Description:** Discuss implications for practice, including the intended use and clinical role of the index test.

### STARD-AI 35 -- Ethics and fairness *

**Description:** Discuss ethical considerations and adherence to ethical standards in using the index test, including fairness.

---

## Other Information

### STARD-AI 36 -- Registration

**Description:** Give the registration number and name of the registry.

### STARD-AI 37 -- Protocol

**Description:** State where the full study protocol can be accessed.

### STARD-AI 38 -- Funding

**Description:** Report sources of funding and other support, and the role of funders.

### STARD-AI 39 -- Commercial interests *

**Description:** Report any commercial interests, if applicable.

### STARD-AI 40a -- Data and code availability *

**Description:** Report the availability of datasets and code, including any restrictions on reuse and repurposing.

**What to look for in code/outputs:**
- Repository with a tagged release, model weights or access route, and licence terms

### STARD-AI 40b -- Output storage and auditability *

**Description:** State whether outputs are stored, auditable, and available for evaluation if needed.

**What to look for in code/outputs:**
- Prediction outputs persisted with model version and timestamp for audit

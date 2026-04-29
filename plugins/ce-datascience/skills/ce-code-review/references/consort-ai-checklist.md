# CONSORT-AI Checklist for Clinical Trials Involving AI Interventions

AI EXTENSION checklist for reporting clinical trial reports that evaluate interventions with an artificial intelligence component.

**Base guideline:** CONSORT 2010

**Primary reference:** Liu X, Cruz Rivera S, Moher D, Calvert MJ, Denniston AK; CONSORT-AI and SPIRIT-AI Steering Group. Reporting guidelines for clinical trial reports for interventions involving artificial intelligence: the CONSORT-AI extension. Lancet Digit Health. 2020;2(10):e537-e548. doi:10.1016/S2589-7500(20)30218-1. PMID: 33328048.

This checklist supplements CONSORT 2010. Apply both checklists together.

---

## Title and Abstract

### Item 1 -- AI intervention identification

**Description:** Indicate that the intervention involves artificial intelligence or machine learning in the title and structured abstract.

**What to look for in code/outputs:**
- Manuscript title or report header explicitly naming the AI/ML component
- Structured abstract mentioning AI method type (e.g., deep learning, NLP, decision support)
- Trial registration documents that label the intervention as AI-based
- README or protocol files that classify the study as an AI clinical trial

---

## Introduction

### Item 2 -- AI intervention rationale

**Description:** Explain the rationale for using an AI intervention, including the intended role of the AI component in clinical care.

**What to look for in code/outputs:**
- Documentation describing why AI was chosen over conventional approaches
- Background sections citing prior evidence for the AI approach in the clinical domain
- Comments or documentation linking model outputs to clinical decision points
- Protocol documents defining the AI's intended clinical role (assistive, autonomous, triage)

---

## Methods -- Intervention

### Item 3 -- AI intervention description

**Description:** Describe the AI intervention in sufficient detail to allow replication, including the algorithm type, version, and intended function.

**What to look for in code/outputs:**
- Model architecture specification (e.g., ResNet-50, BERT, XGBoost) in config files or documentation
- Software version numbers and framework versions (TensorFlow, PyTorch) in requirements files
- Model cards or technical specification documents accompanying the trial code
- Hyperparameter configuration files or training scripts that define the model

### Item 4 -- Instructions and skills for AI use

**Description:** Describe the instructions and skills required for the human users of the AI intervention (e.g., clinicians, technicians).

**What to look for in code/outputs:**
- User interface documentation or clinical workflow guides
- Training materials or standard operating procedures for AI tool use
- Qualification requirements for operators documented in the protocol
- Human factors assessment or usability testing documentation

### Item 5 -- AI integration setting

**Description:** Describe the setting in which the AI intervention is integrated, including the point in the clinical pathway where the AI is deployed.

**What to look for in code/outputs:**
- Workflow diagrams showing where AI outputs enter clinical decisions
- Configuration files specifying deployment environment (EHR integration, standalone app, PACS plugin)
- Infrastructure documentation (cloud vs. on-premise, hardware specifications)
- API endpoint documentation or integration interface specifications

### Item 6 -- Input data handling

**Description:** Describe the input data required by the AI intervention, including data sources, data types, and any preprocessing applied.

**What to look for in code/outputs:**
- Data preprocessing pipelines (normalization, resizing, feature extraction) in code
- Input data format specifications and validation schemas
- Data quality checks or input validation logic applied before model inference
- Documentation of required data fields, acceptable ranges, and missing data handling

### Item 7 -- Output data handling

**Description:** Describe the output of the AI intervention, including the format, how outputs are presented to users, and any post-processing applied.

**What to look for in code/outputs:**
- Output formatting code (probability thresholds, classification labels, risk scores)
- Post-processing logic applied to raw model outputs before clinical presentation
- User interface rendering code showing how results are displayed to clinicians
- Threshold selection documentation and decision boundary specifications

### Item 8 -- Human-AI interaction

**Description:** Describe the human-AI interaction, including whether the AI output is used autonomously or as decision support, and whether clinicians can override the AI.

**What to look for in code/outputs:**
- Workflow logic defining override mechanisms or escalation pathways
- Logging code that captures when clinicians accept, reject, or modify AI recommendations
- Documentation of autonomy level (fully automated, advisory, second-reader)
- Alert and notification systems that mediate human-AI interaction

### Item 9 -- Error case analysis

**Description:** Provide an analysis of cases where the AI intervention produced incorrect, unexpected, or missing outputs, and how these were handled.

**What to look for in code/outputs:**
- Error logging and exception handling code for model inference failures
- Analysis scripts examining false positives, false negatives, and edge cases
- Fallback procedures documented for cases when AI output is unavailable
- Confusion matrix, error case stratification, or failure mode analysis outputs

---

## Methods -- Outcomes

### Item 10 -- AI-specific outcome measures

**Description:** Report any AI-specific performance metrics used as outcomes alongside clinical outcomes.

**What to look for in code/outputs:**
- Performance metric calculations (AUC, sensitivity, specificity, F1) alongside clinical endpoints
- Code computing both AI technical performance and patient-relevant outcomes
- Statistical analysis comparing AI-assisted vs. control arm on both performance and clinical metrics
- Calibration assessment code and decision curve analysis scripts

---

## Methods -- Sample Size

### Item 11 -- Sample size considerations for AI

**Description:** Describe any AI-specific considerations in the sample size calculation, such as the number of subgroups for fairness evaluation.

**What to look for in code/outputs:**
- Power calculations that account for AI performance variability
- Subgroup sample size requirements for demographic fairness evaluation
- Documentation of minimum sample sizes per stratum for meaningful AI performance assessment
- Simulation code for determining adequate sample size for AI outcome evaluation

---

## Results

### Item 12 -- AI version and updates

**Description:** Report the version of the AI algorithm used during the trial and whether any updates occurred during the trial period.

**What to look for in code/outputs:**
- Version control tags or model checkpoint identifiers logged per trial phase
- Documentation of model freeze dates and any mid-trial updates
- Model registry entries with version hashes linked to trial enrollment periods
- Change logs documenting algorithm modifications during the trial

### Item 13 -- Data preprocessing transparency

**Description:** Report the actual data preprocessing steps applied during the trial, including any deviations from the protocol.

**What to look for in code/outputs:**
- Preprocessing pipeline code with documented parameters used in production
- Data quality reports showing preprocessing outcomes (imputation rates, normalization statistics)
- Deviation logs documenting any changes from planned preprocessing
- Input data distribution summaries before and after preprocessing

---

## Discussion

### Item 14 -- AI-specific limitations

**Description:** Discuss limitations specific to the AI intervention, including known failure modes, generalizability constraints, and potential biases.

**What to look for in code/outputs:**
- Subgroup analysis results revealing differential AI performance
- Documentation of known edge cases or failure modes from development phase
- Bias audit results across demographic groups (age, sex, race/ethnicity)
- Discussion of deployment environment differences from training environment

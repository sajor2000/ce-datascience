# SPIRIT-AI Checklist for Clinical Trial Protocols Involving AI Interventions

AI EXTENSION checklist for reporting clinical trial protocols that evaluate interventions with an artificial intelligence component.

**Base guideline:** SPIRIT 2013

**Primary reference:** Cruz Rivera S, Liu X, Chan AW, Denniston AK, Calvert MJ; SPIRIT-AI and CONSORT-AI Working Group. Guidelines for clinical trial protocols for interventions involving artificial intelligence: the SPIRIT-AI extension. Lancet Digit Health. 2020;2(10):e549-e560. doi:10.1016/S2589-7500(20)30219-3. PMID: 33328049.

This checklist supplements SPIRIT 2013. Apply both checklists together.

---

## Administrative Information

### Item 1 -- AI identification in title

**Description:** Include identification of the AI component in the protocol title and trial registration.

**What to look for in code/outputs:**
- Protocol title explicitly mentioning AI, machine learning, or the specific algorithm type
- Trial registration records (e.g., ClinicalTrials.gov) that label the study as involving AI
- Study acronym or short title that references the AI component
- Protocol version documents with AI-specific identifiers

---

## Introduction

### Item 2 -- AI intervention background

**Description:** Describe the scientific background for the AI intervention, including prior development and validation evidence.

**What to look for in code/outputs:**
- Literature review sections citing prior AI model development and validation studies
- References to existing model performance benchmarks on related datasets
- Documentation of the regulatory pathway or CE marking status of the AI tool
- Development history documentation showing training data characteristics and performance

---

## Methods -- Participants, Interventions, and Outcomes

### Item 3 -- AI intervention specification

**Description:** Provide a detailed specification of the AI intervention, including algorithm type, architecture, and intended function.

**What to look for in code/outputs:**
- Model architecture documentation (layers, parameters, activation functions)
- Algorithmic specification sufficient for independent reimplementation
- Training protocol documentation (loss function, optimizer, epochs, batch size)
- Model card or technical specification document included with the protocol

### Item 4 -- Input data specification

**Description:** Specify the input data required by the AI intervention, including data types, sources, formats, and quality requirements.

**What to look for in code/outputs:**
- Input data schema definitions (JSON schema, data dictionary, table specifications)
- Data acquisition protocol specifying required imaging parameters, lab values, or clinical data
- Data quality thresholds that must be met before AI inference (completeness, resolution)
- Data format standards (DICOM parameters, HL7 FHIR resources, CSV field specifications)

### Item 5 -- Output data specification

**Description:** Specify the outputs of the AI intervention, including output types, ranges, uncertainty quantification, and clinical interpretation guidance.

**What to look for in code/outputs:**
- Output data schema with defined value ranges and data types
- Confidence score or uncertainty quantification specifications
- Clinical interpretation guide mapping AI outputs to actionable clinical categories
- Threshold specifications with documented sensitivity/specificity tradeoffs

### Item 6 -- Human-AI interaction plan

**Description:** Describe the planned human-AI interaction, including who will use the AI output, how it will be presented, and whether users can override it.

**What to look for in code/outputs:**
- Workflow diagrams specifying clinician interaction points with AI outputs
- User interface mockups or wireframes showing AI output presentation
- Override mechanism specifications and documentation requirements
- Role-based access control specifications for AI tool use

### Item 7 -- Error handling strategy

**Description:** Describe the planned strategy for handling AI errors, failures, and unexpected outputs during the trial.

**What to look for in code/outputs:**
- Error handling flowcharts specifying responses to common failure modes
- Fallback procedure documentation when AI is unavailable or produces invalid output
- Error classification taxonomy and severity grading system
- Safety monitoring plan with AI-specific stopping rules

### Item 8 -- AI version control plan

**Description:** Describe the version control strategy for the AI intervention, including whether updates are permitted during the trial.

**What to look for in code/outputs:**
- Version control policy documentation (frozen model vs. adaptive model)
- Model registry setup with version tracking and rollback capabilities
- Change management procedures for any mid-trial algorithm modifications
- Audit trail specifications for tracking model versions deployed to each site

---

## Methods -- Data Collection and Management

### Item 9 -- Data preprocessing plan

**Description:** Describe the planned data preprocessing pipeline, including all transformations applied to input data before AI inference.

**What to look for in code/outputs:**
- Preprocessing pipeline specification with each step documented
- Validation rules for input data quality before model inference
- Normalization, augmentation, or feature engineering steps defined in protocol
- Data flow diagrams from raw data acquisition through AI input

### Item 10 -- Training and validation data provenance

**Description:** Describe the data used to train and validate the AI model, including source populations, time periods, and inclusion criteria.

**What to look for in code/outputs:**
- Training dataset documentation (size, demographics, collection period, source institutions)
- Validation dataset characteristics and relationship to trial population
- Data use agreements and ethical approvals for training data
- Distribution comparison between training data and expected trial population

---

## Methods -- Statistical Analysis

### Item 11 -- AI performance evaluation plan

**Description:** Describe the statistical plan for evaluating AI performance, including primary metrics, subgroup analyses, and fairness assessments.

**What to look for in code/outputs:**
- Statistical analysis plan sections specific to AI performance evaluation
- Pre-specified performance metrics (AUC, sensitivity, specificity, calibration)
- Subgroup analysis plan for demographic and clinical subgroups
- Fairness metric specifications (equalized odds, demographic parity, predictive parity)

### Item 12 -- Comparison strategy

**Description:** Describe the comparator for the AI intervention (standard of care, expert clinician, alternative AI) and how the comparison will be conducted.

**What to look for in code/outputs:**
- Comparator arm specification (usual care protocol, blinded expert review)
- Non-inferiority or superiority margin definitions for AI vs. comparator
- Reader study design documentation (number of readers, blinding, reading order)
- Statistical methods for AI-comparator performance comparison

---

## Ethics and Dissemination

### Item 13 -- AI-specific ethical considerations

**Description:** Describe ethical considerations specific to the AI intervention, including algorithmic bias, patient consent for AI-assisted care, and data governance.

**What to look for in code/outputs:**
- Ethics committee documentation addressing AI-specific concerns
- Informed consent templates with AI-specific language
- Algorithmic bias assessment plan
- Data governance framework for AI training and inference data

### Item 14 -- AI transparency plan

**Description:** Describe the plan for making the AI intervention transparent and interpretable to patients, clinicians, and regulators.

**What to look for in code/outputs:**
- Explainability method specifications (SHAP, LIME, attention maps, saliency maps)
- Patient-facing explanation materials or communication plans
- Regulatory submission documentation plan (FDA, CE marking)
- Model documentation plan (model cards, data sheets, algorithmic impact assessments)

### Item 15 -- Code and model sharing plan

**Description:** Describe the plan for sharing code, trained models, and associated artifacts after trial completion.

**What to look for in code/outputs:**
- Code repository plan (GitHub, institutional repository) with license specifications
- Model sharing plan (model weights, architecture definitions, inference code)
- Data sharing plan for de-identified training and validation datasets
- Reproducibility checklist or documentation plan for computational environment

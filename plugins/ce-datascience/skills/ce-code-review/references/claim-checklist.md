# CLAIM Checklist for Artificial Intelligence in Medical Imaging

AI EXTENSION checklist for studies applying artificial intelligence to medical imaging, covering study design through performance evaluation.

**Base guideline:** STARD 2015 (when the AI model is used as a diagnostic test)

**Primary reference (original):** Mongan J, Moy L, Kahn CE Jr. Checklist for Artificial Intelligence in Medical Imaging (CLAIM): A Guide for Authors and Reviewers. Radiol Artif Intell. 2020;2(2):e200029. doi:10.1148/ryai.2020200029. PMID: 33937821.

**Primary reference (2024 update):** Tejani AS, Klontzas ME, Gatti AA, Mongan JT, Moy L, Park SH, Kahn CE Jr. Checklist for Artificial Intelligence in Medical Imaging (CLAIM): 2024 Update. Radiol Artif Intell. 2024;6(4):e240300. doi:10.1148/ryai.240300. PMID: 38809149.

This checklist provides 42 items specific to AI in medical imaging studies. Apply alongside STARD 2015 when the AI model serves as a diagnostic test.

---

## Title and Abstract

### Item 1 -- Study identification

**Description:** Identify the study as involving AI applied to medical imaging in the title.

**What to look for in code/outputs:**
- Title referencing both the AI method and imaging modality
- Abstract specifying the imaging task (detection, segmentation, classification, prediction)
- Keywords including the AI algorithm and imaging domain
- Study type clearly identified (development, validation, reader study)

### Item 2 -- Structured abstract

**Description:** Provide a structured abstract including objective, methods (data source, AI method), results (key performance metrics), and conclusions.

**What to look for in code/outputs:**
- Abstract sections with dataset sizes, imaging modality, AI approach, and primary metrics
- Key performance results (AUC, sensitivity, specificity) in abstract
- Confidence intervals in abstract performance reporting
- Comparison results against reference standard or human readers in abstract

---

## Introduction

### Item 3 -- Scientific background

**Description:** Describe the clinical problem, current diagnostic approach, and rationale for the AI solution.

**What to look for in code/outputs:**
- Clinical context documentation for the imaging task
- Current standard of care for the diagnostic question
- Prior AI work on the same imaging task cited
- Unmet clinical need the AI model addresses

### Item 4 -- Study objectives

**Description:** State specific study objectives and hypotheses.

**What to look for in code/outputs:**
- Primary objective (develop, validate, compare) clearly stated
- Pre-specified hypotheses for comparison studies
- Primary and secondary endpoints defined
- Clinical utility question framed alongside technical performance

---

## Methods -- Study Design

### Item 5 -- Study design

**Description:** Describe the study design, including whether the study is retrospective or prospective, single or multi-center.

**What to look for in code/outputs:**
- Study design classification in documentation (retrospective, prospective, reader study)
- Multi-center vs. single-center data source documentation
- Temporal design (cross-sectional, longitudinal follow-up)
- Enrichment strategy documentation if case selection was non-consecutive

### Item 6 -- Study registration

**Description:** Report whether the study was registered and where, including any protocol deviations.

**What to look for in code/outputs:**
- Registration identifier (ClinicalTrials.gov, PROSPERO, institutional registry)
- Protocol document or pre-registration reference
- Documentation of deviations from the original protocol
- Analysis plan pre-specification documentation

---

## Methods -- Data

### Item 7 -- Data sources

**Description:** Describe the data sources including institution(s), imaging equipment, acquisition protocols, and time period.

**What to look for in code/outputs:**
- Imaging equipment manufacturer and model documentation
- Acquisition protocol parameters (slice thickness, field strength, contrast, resolution)
- Data collection time period and patient selection criteria
- Multi-site equipment and protocol variation documentation

### Item 8 -- Eligibility criteria

**Description:** Describe patient eligibility criteria and how imaging studies were selected.

**What to look for in code/outputs:**
- Inclusion/exclusion criteria implemented in data filtering
- Consecutive vs. enriched sample selection documented
- Patient demographics of included population
- Exclusion counts and reasons at each filtering step

### Item 9 -- Data de-identification

**Description:** Describe the data de-identification process, including what patient information was removed.

**What to look for in code/outputs:**
- De-identification pipeline code or documentation (DICOM header scrubbing)
- Compliance with HIPAA Safe Harbor or Expert Determination method
- Burned-in annotation removal from images
- IRB approval documentation for data use

### Item 10 -- Dataset description

**Description:** Report the total number of subjects and images, including the distribution of key clinical and demographic variables.

**What to look for in code/outputs:**
- Dataset summary tables with subject counts, image counts, and class distribution
- Demographic characteristics (age, sex, race/ethnicity) of the study population
- Disease severity or stage distribution
- Image-level vs. patient-level counting clearly distinguished

---

## Methods -- Ground Truth

### Item 11 -- Reference standard definition

**Description:** Define the reference standard (ground truth) used for labeling, including how it was established.

**What to look for in code/outputs:**
- Reference standard specification (pathology, follow-up imaging, expert consensus, registry)
- Label adjudication process for disagreements
- Temporal relationship between imaging and reference standard
- Documentation of partial verification bias if not all cases received the reference standard

### Item 12 -- Annotation methodology

**Description:** Describe the annotation process including annotators, training, tools, and inter-annotator agreement.

**What to look for in code/outputs:**
- Annotator qualifications and experience levels documented
- Annotation tool and format specifications
- Inter-annotator agreement metrics (kappa, Dice, IoU)
- Annotation quality control procedures and adjudication process

---

## Methods -- Data Preprocessing

### Item 13 -- Image preprocessing

**Description:** Describe all image preprocessing steps including resizing, normalization, windowing, and augmentation.

**What to look for in code/outputs:**
- Image preprocessing pipeline code (resize, crop, normalize, window/level)
- Intensity normalization method and parameters
- Data augmentation transforms and probabilities
- Preprocessing consistency between training and inference pipelines

### Item 14 -- Data augmentation

**Description:** Describe data augmentation strategies used during training.

**What to look for in code/outputs:**
- Augmentation transform list (rotation, flipping, scaling, elastic deformation)
- Augmentation probability and magnitude parameters
- Augmentation applied only to training set (not validation/test)
- Clinical plausibility of augmentations for the imaging domain

---

## Methods -- Model

### Item 15 -- Model architecture

**Description:** Describe the model architecture in detail, including the network type, number of layers, and any modifications.

**What to look for in code/outputs:**
- Architecture specification (ResNet, U-Net, ViT, YOLO) with variant details
- Number of parameters and computational requirements
- Modifications to standard architectures documented
- Pre-trained model source and transfer learning approach

### Item 16 -- Training procedure

**Description:** Describe the training procedure including loss function, optimizer, learning rate, batch size, and stopping criteria.

**What to look for in code/outputs:**
- Loss function specification and justification
- Optimizer and learning rate schedule configuration
- Batch size and number of training epochs
- Early stopping criteria and validation monitoring metric

### Item 17 -- Training/validation/test split

**Description:** Describe how data were partitioned, ensuring no data leakage between splits.

**What to look for in code/outputs:**
- Split strategy (patient-level, study-level, institution-level, temporal)
- Split ratios and random seeds
- Leakage prevention (no patient appearing in multiple splits)
- Temporal or institutional hold-out for external validation

### Item 18 -- Class imbalance handling

**Description:** Describe methods used to address class imbalance if present.

**What to look for in code/outputs:**
- Class distribution in each split documented
- Oversampling, undersampling, or synthetic data generation code
- Class-weighted loss function implementation
- Evaluation metrics appropriate for imbalanced data (AUPRC, F1, balanced accuracy)

---

## Methods -- Evaluation

### Item 19 -- Performance metrics

**Description:** Specify all performance metrics used, with justification for their selection.

**What to look for in code/outputs:**
- Primary and secondary metric definitions with clinical justification
- Threshold-independent metrics (AUC, AUPRC) and threshold-dependent metrics at specified operating points
- Segmentation-specific metrics if applicable (Dice, Hausdorff distance, surface distance)
- Clinical utility metrics (sensitivity at fixed specificity, specificity at fixed sensitivity)

### Item 20 -- Statistical analysis

**Description:** Describe the statistical methods used to evaluate and compare performance.

**What to look for in code/outputs:**
- Confidence interval estimation method (bootstrap, DeLong for AUC comparison)
- Multiple comparison correction when testing across subgroups or models
- Sample size justification or power analysis
- Statistical test specifications for human-AI comparison

### Item 21 -- Comparison with human readers

**Description:** When comparing AI with human readers, describe the reader study design including number of readers, experience levels, and reading conditions.

**What to look for in code/outputs:**
- Reader study design (independent reading, sequential, crossover)
- Reader characteristics (specialty, experience, certification)
- Reading environment (clinical workstation, monitor specifications)
- Blinding protocol for readers
- Statistical comparison method (paired or unpaired, clustered data handling)

---

## Results

### Item 22 -- Participant flow

**Description:** Report the flow of participants and images through the study with reasons for exclusions.

**What to look for in code/outputs:**
- STARD-style flow diagram generation code
- Counts at each stage of data selection and processing
- Exclusion reasons documented at each filtering step
- Final analyzable sample sizes per split

### Item 23 -- Demographic and clinical characteristics

**Description:** Report demographic and clinical characteristics of the study population.

**What to look for in code/outputs:**
- Table 1 generation code with demographics stratified by outcome or data split
- Clinical characteristic summaries (disease severity, comorbidities)
- Comparison of characteristics across training, validation, and test sets
- Missing data counts per characteristic

### Item 24 -- Model performance results

**Description:** Report model performance metrics with confidence intervals on the test set.

**What to look for in code/outputs:**
- Performance metrics on held-out test set (not validation set)
- Confidence intervals for all reported metrics
- Operating point selection and threshold specification
- ROC curves and precision-recall curves as generated figures

### Item 25 -- Subgroup performance

**Description:** Report performance across clinically and demographically relevant subgroups.

**What to look for in code/outputs:**
- Subgroup analysis by age, sex, disease severity, imaging equipment, and institution
- Performance disparity quantification across subgroups
- Sample sizes per subgroup alongside performance metrics
- Subgroup-specific calibration and discrimination

---

## Results -- Failure Analysis

### Item 26 -- Error analysis

**Description:** Analyze and report model errors, including false positives, false negatives, and their characteristics.

**What to look for in code/outputs:**
- False positive and false negative case analysis code
- Error case visualization (saliency maps, attention maps on failure cases)
- Systematic error pattern identification (specific pathology types, image quality issues)
- Clinical severity grading of errors

### Item 27 -- Edge cases and limitations

**Description:** Report model behavior on edge cases, out-of-distribution inputs, and challenging scenarios.

**What to look for in code/outputs:**
- Out-of-distribution detection code or confidence thresholds
- Performance on known challenging cases (rare findings, artifacts, poor quality)
- Model confidence calibration analysis
- Known failure modes documented with example cases

---

## Discussion

### Item 28 -- Comparison with prior work

**Description:** Compare results with prior studies on the same or similar tasks.

**What to look for in code/outputs:**
- Literature comparison table with study characteristics and performance
- Discussion of methodological differences affecting comparability
- External benchmark results if standardized test sets exist
- Meta-analytic context when available

### Item 29 -- Clinical applicability

**Description:** Discuss the clinical applicability, deployment considerations, and path to implementation.

**What to look for in code/outputs:**
- Intended clinical workflow integration documentation
- Regulatory considerations for the target market
- Deployment infrastructure requirements
- Monitoring and update strategy for deployed models

---

## Other Information

### Item 30 -- Code and data sharing

**Description:** State whether code, trained models, and data are available and under what conditions.

**What to look for in code/outputs:**
- Code repository URL and license
- Model weights availability and sharing mechanism
- Data availability statement with access procedures
- Reproducibility documentation (environment specifications, random seeds)

### Item 31 -- Funding and conflicts

**Description:** Report funding sources and potential conflicts of interest, including relationships with AI vendors.

**What to look for in code/outputs:**
- Funding acknowledgment sections in reports
- Conflict of interest disclosures, especially with AI companies
- Data use agreement or industry sponsorship documentation
- Role of funders in study design, analysis, and reporting

---

## Methods -- Additional Items (2024 Update)

### Item 32 -- Foundation model and transfer learning

**Description:** When using pre-trained or foundation models, describe the source model, pre-training data, and fine-tuning strategy.

**What to look for in code/outputs:**
- Pre-trained model source (ImageNet, RadImageNet, medical foundation model)
- Fine-tuning strategy (full, partial, linear probing, adapter layers)
- Pre-training data description and relationship to target domain
- Frozen vs. trainable layer specifications

### Item 33 -- Generative AI components

**Description:** When using generative AI (synthetic data, report generation), describe the generative model and validation of generated outputs.

**What to look for in code/outputs:**
- Generative model architecture and training procedure
- Synthetic data quality assessment (FID, clinical plausibility review)
- Proportion of synthetic vs. real data in training
- Generated output validation process

### Item 34 -- Multi-modal data integration

**Description:** When integrating imaging with other data types (clinical, genomic, text), describe the fusion strategy.

**What to look for in code/outputs:**
- Fusion strategy (early, late, intermediate) documentation
- Data alignment and synchronization across modalities
- Missing modality handling strategy
- Contribution analysis of each modality to model performance

### Item 35 -- Explainability methods

**Description:** Describe any explainability or interpretability methods applied and their validation.

**What to look for in code/outputs:**
- Explainability method specification (Grad-CAM, SHAP, attention visualization)
- Validation of explanations against clinical ground truth (expert review of saliency maps)
- Limitations of the chosen explainability approach documented
- Clinician evaluation of model explanations

### Item 36 -- Prospective validation

**Description:** For prospective studies, describe the deployment environment, monitoring plan, and real-world performance.

**What to look for in code/outputs:**
- Deployment environment documentation (PACS integration, hardware, network)
- Real-time performance monitoring code
- Drift detection and alert systems
- Comparison of prospective performance with retrospective estimates

### Item 37 -- Regulatory and safety considerations

**Description:** Report regulatory classification, safety events, and any required regulatory submissions.

**What to look for in code/outputs:**
- Regulatory pathway documentation (510(k), De Novo, CE marking)
- Safety event reporting during validation studies
- Post-market surveillance plan
- Clinical safety assessment documentation

### Item 38 -- Dataset documentation

**Description:** Provide comprehensive dataset documentation following datasheets for datasets or similar frameworks.

**What to look for in code/outputs:**
- Datasheet or data card documenting dataset creation, composition, and intended use
- Known biases and limitations of the dataset
- Maintenance and update plan for the dataset
- Ethical review documentation for data collection

### Item 39 -- Bias and fairness

**Description:** Assess and report algorithmic bias across protected groups.

**What to look for in code/outputs:**
- Performance stratification by age, sex, race/ethnicity, socioeconomic status
- Bias mitigation strategies if disparities were identified
- Intersectional analysis across multiple demographic dimensions
- Fairness metric reporting (equalized odds, predictive parity)

### Item 40 -- Uncertainty quantification

**Description:** Report uncertainty in model predictions, including calibration and confidence.

**What to look for in code/outputs:**
- Model calibration analysis (reliability diagrams, expected calibration error)
- Prediction confidence or uncertainty scores
- Calibration method (temperature scaling, Platt scaling, isotonic regression)
- Uncertainty-aware decision thresholds

### Item 41 -- External validation requirements

**Description:** Report external validation on data from different institutions, time periods, or populations.

**What to look for in code/outputs:**
- External validation dataset from a different institution or time period
- Population and equipment differences between development and validation data
- Recalibration or adaptation strategies for new settings
- Multi-site performance comparison

### Item 42 -- Deployment and monitoring plan

**Description:** Describe the plan for clinical deployment, including integration, monitoring, and model updating.

**What to look for in code/outputs:**
- Clinical workflow integration plan
- Performance monitoring dashboard or logging system
- Model update and retraining schedule
- Rollback plan for performance degradation

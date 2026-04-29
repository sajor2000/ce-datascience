# STARD-AI Checklist for AI-Assisted Diagnostic Accuracy Studies

Standards for Reporting of Diagnostic Accuracy Studies -- Artificial Intelligence (STARD-AI).
Extension of STARD for studies evaluating AI/ML-based diagnostic tests against a reference standard.

**Primary reference:** Sounderajah V, Ashrafian H, Aggarwal R, De Fauw J, Denniston AK, Greaves F, Karthikesalingam A, King D, Liu X, Markar SR, McInnes MDF, Panch T, Pearson-Stuttard J, Ting DSW, Golub RM, Moher D, Bossuyt PM, Darzi A. Developing specific reporting guidelines for diagnostic accuracy studies assessing AI interventions: The STARD-AI Steering Group. Nat Med. 2020;26(6):807-808. doi:10.1038/s41591-020-0941-1. PMID: 32514173.

**Companion:** Defined based on Sounderajah V et al. A quality assessment tool for artificial intelligence-centered diagnostic test accuracy studies: QUADAS-AI. Nat Med. 2024. And the STARD-AI extension items published alongside the STARD 2015 update.

This checklist supplements STARD 2015. Apply alongside the base STARD checklist when the index test uses AI/ML.

---

## Title and Abstract

### STARD-AI 1 -- AI in title

**Description:** Identify the study as evaluating an AI-based diagnostic test. Specify the type of AI (e.g., deep learning, machine learning, NLP).

**What to look for in code/outputs:**
- Title includes "artificial intelligence", "machine learning", "deep learning", or the specific AI technique
- Abstract specifies the AI method and its intended diagnostic task

---

## Methods

### STARD-AI 4a -- AI system description

**Description:** Describe the AI system including: input data type and format, model architecture, training data source and size, output type (binary, probabilistic, segmentation), and software/hardware used.

**What to look for in code/outputs:**
- Model architecture documented (e.g., ResNet-50, BERT, XGBoost)
- Training dataset described: source, size, class distribution, inclusion/exclusion criteria
- Input preprocessing pipeline documented (resizing, normalization, augmentation)
- Output format specified (class label, probability, heatmap, segmentation mask)
- Software framework and version (PyTorch, TensorFlow, scikit-learn) documented

### STARD-AI 4b -- AI version and threshold

**Description:** Report the specific version of the AI system evaluated, including any threshold or operating point used to convert continuous output to a diagnostic decision.

**What to look for in code/outputs:**
- Model version or checkpoint identifier documented
- Classification threshold documented (e.g., probability > 0.5 for positive)
- If multiple thresholds were evaluated, report which was pre-specified vs post-hoc

### STARD-AI 5 -- Intended use and clinical role

**Description:** State the intended clinical role of the AI system: triage, standalone replacement, add-on to clinical assessment, or second reader.

**What to look for in code/outputs:**
- Intended use statement in documentation or report preamble
- Clinical workflow integration described (where in the diagnostic pathway does the AI fit?)
- Target user population specified (radiologist, GP, screening program)

### STARD-AI 7 -- Reference standard independence

**Description:** Describe whether the reference standard was determined independently from the AI system output. Report whether clinicians establishing the reference standard were blinded to AI results.

**What to look for in code/outputs:**
- Blinding protocol documented for reference standard assessors
- Independence of reference standard from AI predictions verified
- If reference standard was partially informed by AI output, this is documented as a limitation

### STARD-AI 9 -- Data partitioning

**Description:** Describe how data were partitioned for development and evaluation. Report whether temporal, geographic, or institutional splitting was used.

**What to look for in code/outputs:**
- Train/validation/test split strategy documented (random, temporal, institutional, geographic)
- Temporal validation: training data predates test data
- External validation: test data from a different institution or population
- No data leakage between partitions

### STARD-AI 10 -- Subgroup specification

**Description:** Pre-specify subgroups for analysis of diagnostic performance, including demographic groups and clinical subtypes.

**What to look for in code/outputs:**
- Subgroup analysis plan documented before analysis
- Subgroups by age, sex, race/ethnicity, disease severity, imaging device, or site
- Performance metrics reported separately per subgroup

---

## Results

### STARD-AI 19 -- Performance metrics

**Description:** Report standard diagnostic accuracy metrics: sensitivity, specificity, PPV, NPV, AUC/AUROC, and calibration. Report with confidence intervals.

**What to look for in code/outputs:**
- Sensitivity, specificity, PPV, NPV with 95% CIs
- AUC/AUROC with 95% CI (bootstrapped or DeLong)
- Calibration plot or calibration-in-the-large / calibration slope
- Operating point on the ROC curve identified

### STARD-AI 21 -- Failure analysis

**Description:** Report cases where the AI system failed (false positives, false negatives). Describe patterns in failure cases.

**What to look for in code/outputs:**
- Error analysis code examining false positives and false negatives
- Pattern identification in failure cases (e.g., specific subtypes, image quality, demographics)
- Confusion matrix at the operating point
- Examples of failure cases when possible (with appropriate de-identification)

---

## Discussion

### STARD-AI 25 -- Generalizability of AI

**Description:** Discuss the generalizability of the AI system performance to populations, settings, and workflows not represented in the evaluation data.

**What to look for in code/outputs:**
- Discussion of domain shift risks (different scanners, populations, disease prevalence)
- Comparison of training/test data demographics
- Limitations related to single-site evaluation, narrow demographics, or specific hardware
- Plans for prospective or multi-site validation

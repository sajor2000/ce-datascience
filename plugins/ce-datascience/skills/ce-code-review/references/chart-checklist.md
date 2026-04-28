# CHART Checklist for Health-Related AI Reporting Transparency

AI EXTENSION checklist for documenting and reporting clinical AI models intended for health-related deployment, focusing on transparency and responsible implementation.

**Base guideline:** Varies by study type (applies across prediction, diagnostic, and intervention studies involving clinical AI deployment)

**Primary reference:** Citation needs manual verification. The CHART (Checklist for Health-related AI Reporting for Transparency) framework draws on model documentation best practices including model cards (Mitchell et al., 2019), datasheets for datasets (Gebru et al., 2021), and FDA guidance on AI/ML-based Software as a Medical Device (SaMD). PubMed PMID not available -- published across AI governance and health informatics venues.

This checklist focuses on transparency and documentation for clinical AI models. Apply alongside the primary reporting guideline appropriate for the study design.

---

## Intended Use Documentation

### Item 1 -- Intended use statement

**Description:** Provide a clear intended use statement defining the clinical context, target population, and decision the AI model supports.

**What to look for in code/outputs:**
- Intended use documentation specifying clinical indication and target population
- User profile definition (specialty, training level, clinical setting)
- Decision context documentation (screening, diagnosis, treatment planning, monitoring)
- Contraindications or populations for which the model is not intended

### Item 2 -- Intended deployment environment

**Description:** Describe the intended deployment environment including clinical workflow, hardware, software, and integration requirements.

**What to look for in code/outputs:**
- Deployment infrastructure specifications (cloud, on-premise, edge device)
- Clinical system integration requirements (EHR, PACS, LIS)
- Hardware requirements (GPU, memory, processing speed)
- Network and latency requirements for real-time applications

---

## Model Card

### Item 3 -- Model card or documentation

**Description:** Provide a model card documenting model type, training data, performance, limitations, and ethical considerations.

**What to look for in code/outputs:**
- Model card following the Mitchell et al. template or equivalent
- Model architecture, training data summary, and evaluation metrics documented
- Known limitations and failure modes listed
- Ethical considerations and potential biases acknowledged

### Item 4 -- Training data documentation

**Description:** Document the training data including source, size, demographics, collection period, and known limitations.

**What to look for in code/outputs:**
- Training dataset description with source institutions and collection dates
- Demographic composition of training data (age, sex, race/ethnicity distributions)
- Known biases or gaps in training data representation
- Data preprocessing and quality control procedures documented

---

## Performance Across Subgroups

### Item 5 -- Subgroup performance reporting

**Description:** Report model performance across clinically and demographically relevant subgroups.

**What to look for in code/outputs:**
- Performance stratified by age, sex, race/ethnicity, disease severity
- Performance across different institutions, equipment, or data collection settings
- Worst-performing subgroup identified and reported
- Sample sizes per subgroup alongside performance metrics

### Item 6 -- Equity assessment

**Description:** Assess whether model performance disparities across subgroups could lead to inequitable outcomes.

**What to look for in code/outputs:**
- Disparity quantification using fairness metrics (equalized odds, predictive parity)
- Clinical impact assessment of performance disparities on patient outcomes
- Bias mitigation strategies implemented or recommended
- Intersectional analysis across multiple demographic dimensions

---

## Deployment Environment

### Item 7 -- Clinical workflow integration

**Description:** Describe how the AI model integrates into the clinical workflow, including triggers, outputs, and clinician interaction points.

**What to look for in code/outputs:**
- Workflow diagrams showing AI integration points in clinical care
- Trigger conditions that initiate AI inference
- Output presentation format and clinical interpretation guidance
- Override and escalation mechanisms for clinicians

### Item 8 -- Technical infrastructure

**Description:** Document the technical infrastructure requirements and constraints for deployment.

**What to look for in code/outputs:**
- System architecture documentation (APIs, microservices, batch processing)
- Performance requirements (latency, throughput, availability)
- Data pipeline specifications from source to model inference
- Security and privacy safeguards (encryption, access control, audit logging)

---

## Monitoring Plan

### Item 9 -- Performance monitoring

**Description:** Describe the plan for monitoring model performance after deployment, including metrics, frequency, and alert thresholds.

**What to look for in code/outputs:**
- Monitoring dashboard specifications with tracked metrics
- Performance degradation detection thresholds and alert mechanisms
- Data drift monitoring for input data distribution changes
- Outcome monitoring to track clinical impact over time

### Item 10 -- Safety monitoring

**Description:** Describe the safety monitoring plan including adverse event detection, reporting, and response procedures.

**What to look for in code/outputs:**
- Adverse event definition and reporting mechanism
- Safety review committee or escalation pathway
- Automated safety alert detection based on model outputs
- Post-deployment safety analysis schedule

---

## Update Strategy

### Item 11 -- Model update and maintenance plan

**Description:** Describe the strategy for updating the model, including retraining triggers, validation requirements, and rollback procedures.

**What to look for in code/outputs:**
- Retraining trigger criteria (performance degradation, new data, clinical guideline changes)
- Validation requirements before deploying model updates
- Version control and model registry specifications
- Rollback procedures and criteria for reverting to previous model versions

---

## Known Limitations

### Item 12 -- Limitation documentation

**Description:** Document known limitations, failure modes, and scenarios where the model should not be relied upon.

**What to look for in code/outputs:**
- Known failure modes with example cases or data characteristics
- Population or clinical scenarios where the model has not been validated
- Edge cases with degraded performance documented
- Guidance for clinicians on when to disregard or override model outputs
- Temporal validity constraints (how long the model is expected to remain accurate)

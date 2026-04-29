# QUADAS-2 Tool for Diagnostic Accuracy Studies

Quality Assessment of Diagnostic Accuracy Studies, second version (QUADAS-2).
Structured tool for assessing the quality and applicability of primary diagnostic accuracy studies included in systematic reviews, comprising four domains each evaluated for risk of bias and applicability concerns.

**Primary reference:** Whiting PF, Rutjes AWS, Westwood ME, et al; QUADAS-2 Group. QUADAS-2: a revised tool for the quality assessment of diagnostic accuracy studies. Ann Intern Med. 2011;155(8):529-536. doi:10.7326/0003-4819-155-8-201110180-00009. PMID: 22007046.

QUADAS-2 is applied study-by-study during data extraction for a systematic review of diagnostic accuracy. Each of the four domains is assessed for (1) risk of bias and (2) applicability concerns (where applicable). Signaling questions guide the risk of bias judgment. This checklist describes each domain, its signaling questions, and what to look for in analysis code and outputs when evaluating compliance during a code or analytic review.

---

## Domain 1: Patient Selection

### Risk of Bias -- Patient Selection

**Description:** Assess whether the selection of patients was likely to introduce bias. Key concerns are case-control design (which artificially inflates spectrum by selecting known cases and known controls) and inappropriate exclusions that restrict the spectrum of disease or conditions seen in practice.

Signaling questions:
- Was a consecutive or random sample of patients enrolled?
- Was a case-control design avoided?
- Did the study avoid inappropriate exclusions?

**What to look for in code/outputs:**
- Data extraction fields recording enrollment method (consecutive, random, convenience, case-control) populated for each study
- Code that flags studies using a case-control design and applies a high risk of bias rating for this domain
- Exclusion criteria from each study documented in the extraction database and coded for appropriateness
- Summary statistics tabulating the proportion of studies using consecutive/random enrollment vs. other methods
- Risk of bias judgment coded as low, high, or unclear with the signaling question responses recorded as the basis

### Applicability Concerns -- Patient Selection

**Description:** Assess whether the patients included in the study match the review question in terms of the intended use population (spectrum of disease, setting, prior test results, and disease stage).

**What to look for in code/outputs:**
- Applicability judgment (low, high, or unclear concern) coded separately from the risk of bias judgment
- Data extraction fields capturing the study population's setting, disease spectrum, and severity compared to the review's target population
- Code or notes documenting the specific applicability concern when the study population departs from the review question
- Narrative summary in the review discussing applicability concerns across the body of evidence

---

## Domain 2: Index Test

### Risk of Bias -- Index Test

**Description:** Assess whether the conduct or interpretation of the index test (the test being evaluated) could have introduced bias. Key concerns are failure to pre-specify the positivity threshold and knowledge of the reference standard result when interpreting the index test.

Signaling questions:
- Were the index test results interpreted without knowledge of the results of the reference standard?
- If a threshold was used, was it pre-specified?

**What to look for in code/outputs:**
- Data extraction fields recording whether index test interpretation was blinded to reference standard results
- Code flagging studies where blinding to the reference standard was not maintained or not reported
- Threshold pre-specification status extracted and coded for each study (pre-specified from prior literature, from a training set, or determined in the same dataset)
- Studies using data-driven optimal cutoff thresholds from the same dataset flagged as high risk of bias
- Risk of bias judgment coded as low, high, or unclear with signaling question responses recorded

### Applicability Concerns -- Index Test

**Description:** Assess whether the index test, its conduct, or its interpretation differ from the way it is described in the review question (e.g., different equipment, operator training, or scoring system).

**What to look for in code/outputs:**
- Applicability judgment coded for the index test separately from risk of bias
- Data extraction fields capturing the index test version, protocol, operator training level, and equipment compared to the target use scenario
- Code or notes flagging studies using a prototype, research-grade, or early-generation version of a test when the review covers the commercial version
- Narrative discussion of applicability concerns related to index test implementation across studies

---

## Domain 3: Reference Standard

### Risk of Bias -- Reference Standard

**Description:** Assess whether the reference standard is likely to correctly classify the target condition and whether knowledge of the index test result influenced the reference standard interpretation.

Signaling questions:
- Is the reference standard likely to correctly classify the target condition?
- Were the reference standard results interpreted without knowledge of the results of the index test?

**What to look for in code/outputs:**
- Data extraction fields recording the reference standard used in each study and an assessment of its accuracy for classifying the target condition
- Code flagging studies where the reference standard is imperfect (e.g., a single biopsy when composite histopathology plus follow-up is the accepted standard)
- Blinding of reference standard interpretation to index test results extracted and coded per study
- Studies using differential verification (different reference standards applied to index-positive and index-negative patients) identified and flagged
- Risk of bias judgment coded as low, high, or unclear for this domain

### Applicability Concerns -- Reference Standard

**Description:** Assess whether the target condition as defined by the reference standard matches the target condition of the review question.

**What to look for in code/outputs:**
- Applicability judgment coded for the reference standard separately from risk of bias
- Data extraction fields capturing the reference standard definition compared to the review's target condition definition
- Code or notes flagging discordant definitions (e.g., review targets clinically significant disease but study uses any pathological abnormality)
- Summary of applicability concerns related to reference standard definition variation across the body of evidence

---

## Domain 4: Flow and Timing

### Risk of Bias -- Flow and Timing

**Description:** Assess whether the time interval between the index test and reference standard was appropriate (short enough that disease status could not change), whether all patients received the same reference standard, and whether all enrolled patients were included in the analysis.

Signaling questions:
- Was there an appropriate interval between the index test and reference standard?
- Did all patients receive a reference standard?
- Did patients receive the same reference standard?
- Were all patients included in the analysis?

**What to look for in code/outputs:**
- Data extraction fields recording the interval between index test and reference standard for each study
- Code flagging studies with prolonged intervals where disease progression or resolution between tests is plausible
- Partial verification identified: studies where only a subset of patients (typically index-positive patients) received the reference standard flagged and coded
- Differential verification identified: studies where different reference standards were applied to different patient subgroups coded as high risk
- Proportion of enrolled patients included in the final analysis extracted and studies with >10-15% exclusion from the analysis flagged
- Risk of bias judgment coded as low, high, or unclear with all four signaling question responses recorded

---

## Presentation and Summary

### Risk of Bias Summary Table*

**Description:** Present a summary of risk of bias judgments across all four domains for each included study, typically as a colored matrix (green/low, yellow/unclear, red/high).

**What to look for in code/outputs:**
- Code generating a risk of bias summary table or figure (e.g., using robvis, ggplot2, or equivalent tool) with one row per study and one column per domain
- Color coding or symbol coding for low, high, and unclear risk of bias
- Both risk of bias and applicability concern judgments included in the table or presented in parallel tables
- All included studies represented in the table with no missing entries
- Source data file (CSV, spreadsheet) with the individual signaling question responses for each study available for audit

### Risk of Bias Across Studies*

**Description:** Summarize the proportion of studies at low, high, and unclear risk of bias for each domain across the included studies, and interpret the impact of the risk of bias profile on the overall strength of evidence.

**What to look for in code/outputs:**
- Code computing the proportion of studies at each risk level per domain
- Bar chart or proportion table summarizing the risk of bias distribution across the body of evidence
- Sensitivity analyses in the meta-analysis restricting to studies at low risk of bias for one or more domains
- Discussion of how risk of bias findings affect confidence in the pooled sensitivity and specificity estimates
- Funnel plot asymmetry or meta-regression examining the association between risk of bias domain scores and diagnostic accuracy estimates

### Applicability Summary*

**Description:** Summarize applicability concerns across the four domains for all included studies and discuss how applicability findings affect the generalizability of the review's conclusions to the target population and setting.

**What to look for in code/outputs:**
- Separate applicability summary table or figure alongside the risk of bias summary
- Code or notes documenting the specific applicability gaps identified (population mismatch, different test version, different reference standard definition)
- Narrative discussion explicitly addressing each applicability domain and its implications for the review conclusions
- Subgroup analyses or sensitivity analyses by applicability rating when sufficient studies allow

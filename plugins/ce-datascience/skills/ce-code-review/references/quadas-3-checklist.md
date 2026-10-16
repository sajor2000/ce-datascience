# QUADAS-3 Tool for Diagnostic Test Accuracy Studies

## Contents

- Phases 1-4: Review and study set-up
- Domain 1: Participants
- Domain 2: Index Test
- Domain 3: Target Condition
- Domain 4: Analysis
- Phase 6: Overall judgment

Quality Assessment of Diagnostic Accuracy Studies, third version (QUADAS-3).
Tool for assessing the risk of bias and the applicability of primary diagnostic test accuracy studies in systematic reviews, including studies of tests for diagnosis, screening, or disease staging. QUADAS-3 replaces QUADAS-2 and is the version the QUADAS group currently recommends.

**Primary reference:** Whiting PF, Tomlinson E, Rutjes AWS, et al. QUADAS-3: A Revised Tool for the Quality Assessment of Diagnostic Test Accuracy Studies. Ann Intern Med. 2026;179(4):548-555. doi:10.7326/ANNALS-25-02104. PMID: 41698208.

**Explanation and elaboration:** Davenport CF, Rutjes AWS, Mallett S, et al. QUADAS-3 Explanation and Elaboration: Guidance for Quality Assessment of Diagnostic Test Accuracy Studies. Ann Intern Med. 2026. doi:10.7326/ANNALS-25-04943. PMID: 41698205.

**Source and licence:** Phases, domains, and signalling-question IDs follow the official QUADAS-3 tool, version 1.2 (https://www.bristol.ac.uk/media-library/sites/social-community-medicine/quadas/QUADAS-3%201.2.docx, checked on 2026-10-15). Signalling-question numbers and order for all four domains were checked on 2026-10-15 against the explanation and elaboration (Tables 4-7 and its example form), which numbers them 1.1-1.4, 2.1-2.4, 3.1-3.8, and 4.1-4.4. The tool states no open licence and the explanation and elaboration is copyright the American College of Physicians, so the signalling questions and descriptions are faithful paraphrases that keep the meaning of each question. Use the official form for verbatim wording and read the explanation and elaboration paper before applying the tool. QUADAS is a risk-of-bias appraisal tool, not an EQUATOR reporting guideline. For comparative accuracy reviews, use QUADAS-C in addition to QUADAS-3. The "What to look for" cues are added by this plugin.

Main changes from QUADAS-2:
- Assessment is done for each selected accuracy estimate, not once per study.
- Each synthesis question gets an "ideal test accuracy trial".
- The Flow and Timing domain is replaced by an Analysis domain.
- Each judgment carries a rationale, and there is a formal overall judgment.

Signalling-question answers are yes (Y), probably yes (PY), probably no (PN), no (N), or no information (NI). Risk-of-bias and applicability judgments are low, high, or insufficient information (II). If all signalling questions in a domain are Y or PY, risk of bias can be judged low. Any N or PN flags potential bias, and reviewers then use review-specific guidance to judge whether it is likely to have affected the estimate.

---

## Phases 1-4: Review and study set-up

### Phase 1 -- Synthesis questions (once per review)

**Description:** State each systematic review synthesis question, considering population, index test(s), and target condition, and pre-specify it in the review protocol.

**What to look for in code/outputs:**
- Synthesis questions listed in the protocol or config, each with population, index test, and target condition

### Phase 2 -- Ideal test accuracy trial (once per review)

**Description:** For each synthesis question, define the ideal test accuracy trial (a theoretical benchmark that would give unbiased accuracy estimates) across its objective, participants, index test(s), definition of the target condition, and analysis.

**What to look for in code/outputs:**
- A table defining the ideal trial per synthesis question, used later as the benchmark for applicability and bias

### Phase 3 -- Flow diagram (once per study)

**Description:** Draw a flow diagram for each primary study showing how participants and test results underlying the assessed estimates move through the study.

**What to look for in code/outputs:**
- Per-study flow diagrams or flow counts in the extraction database

### Phase 4 -- Estimates to assess (once per study)

**Description:** Identify the numerical accuracy estimates (2x2 tables) relevant to each synthesis question that will feed the synthesis. For each, record the participants, index test and threshold, target condition, reference standard, unit of analysis, analysis, and which domains need assessment. After the first estimate, only domains whose characteristics differ need to be reassessed.

**What to look for in code/outputs:**
- Extraction records keyed by estimate (not only by study), each linked to a synthesis question

---

## Domain 1: Participants

### Risk of Bias -- Participants

**Description:** Assess whether the way participants were enrolled and selected could bias the accuracy estimate. Drop-outs or exclusions caused by missing index test or reference standard results are assessed in the Analysis domain, not here.

Signalling questions (paraphrased; official numbering 1.1-1.4 from the explanation and elaboration, Table 4):
- 1.1 Was a single-gate design used (rather than a multi-gate, case-control design)?
- 1.2 Were participants enrolled prospectively?
- 1.3 Was a consecutive or random sample of participants included?
- 1.4 Is the study group a representative sample of the intended-use population?

**What to look for in code/outputs:**
- Extraction fields recording gate design, prospective or retrospective enrolment, sampling method, and enrolment restrictions
- Signalling-question answers (Y/PY/PN/N/NI) and a rationale stored per estimate

### Applicability Concerns -- Participants

**Description:** Judge concern that the included participants (e.g., presentation, prior testing, setting, intended use of the index test) do not match those of the ideal test accuracy trial, with a rationale.

**What to look for in code/outputs:**
- Applicability judgment (low/high/II) recorded separately from risk of bias, with a rationale referencing the ideal trial

---

## Domain 2: Index Test

### Risk of Bias -- Index Test

**Description:** Assess whether the conduct or interpretation of the index test could bias the accuracy estimate.

Signalling questions (paraphrased; official numbering 2.1-2.4 from the explanation and elaboration, Table 5):
- 2.1 Was the index test conducted and interpreted following the recommended instructions?
- 2.2 Were index test results interpreted without knowledge of the reference standard results?
- 2.3 Were index test results interpreted with the same information that would be available when the test is used in practice?
- 2.4 If an index test threshold was used, was it a standard or pre-specified threshold?

**What to look for in code/outputs:**
- Fields recording protocol adherence, reader blinding, information available to readers, and how the threshold was chosen
- Data-driven thresholds derived on the same data flagged

### Applicability Concerns -- Index Test

**Description:** Judge concern that the index test, its conduct, or its interpretation (including setting and who performed and read it) does not match the ideal test accuracy trial, with a rationale.

**What to look for in code/outputs:**
- Applicability judgment and rationale recorded for the index test

---

## Domain 3: Target Condition

### Risk of Bias -- Target Condition

**Description:** Assess whether the way the target condition was defined and assessed (reference standard and timing) could bias the accuracy estimate.

Signalling questions (paraphrased; official numbering 3.1-3.8 from the explanation and elaboration, Table 6):
- 3.1 Does the reference standard adequately identify those with and without the target condition?
- 3.2 Was the target condition assessed in all participants?
- 3.3 Was the target condition assessed in the same way in all participants?
- 3.4 Did the reference standard avoid incorporating the index test?
- 3.5 Was the reference standard conducted and interpreted following the recommended instructions?
- 3.6 Were reference standard results interpreted without knowledge of the index test results?
- 3.7 If a reference standard threshold was used, was it a standard or pre-specified threshold?
- 3.8 Was the time interval between the index test and reference standard appropriate?

**What to look for in code/outputs:**
- Fields recording the reference standard, partial or differential verification, incorporation, assessor blinding, threshold choice, and the index-to-reference interval

### Applicability Concerns -- Target Condition

**Description:** Judge concern that the target condition as defined by the reference standard does not match the ideal test accuracy trial, with a rationale.

**What to look for in code/outputs:**
- Applicability judgment and rationale recorded for the target condition

---

## Domain 4: Analysis

### Risk of Bias -- Analysis

**Description:** Assess whether the analysis behind the estimate could introduce bias, including exclusions from the 2x2 table, handling of missing data, unit of analysis, and the statistical methods used. This domain has no applicability judgment.

Signalling questions (paraphrased; official numbering 4.1-4.4 from the explanation and elaboration, Table 7):
- 4.1 Were all participants included in the analysis?
- 4.2 Were missing data handled appropriately?
- 4.3 Does the unit of analysis match the ideal test accuracy trial?
- 4.4 Were the estimates of sensitivity and specificity calculated appropriately?

**What to look for in code/outputs:**
- Per-estimate counts of enrolled participants excluded from the 2x2 table, with reasons
- Handling of missing reference standard data; unit of analysis (participant, lesion, sample); any non-standard estimation methods

---

## Phase 6: Overall judgment

### Overall Risk of Bias and Applicability

**Description:** For each assessed estimate, give an overall risk-of-bias judgment and, separately, an overall applicability judgment, each with a rationale naming the main limitations. Overall risk of bias is high if any domain is high; low if all domains are low; and insufficient information if any domain is insufficient information and none is high. A similar approach applies to applicability.

**What to look for in code/outputs:**
- Code deriving overall judgments from domain judgments using these rules
- Summary tables or figures of domain and overall judgments per estimate
- Sensitivity analyses in the meta-analysis restricted to estimates at low overall risk of bias

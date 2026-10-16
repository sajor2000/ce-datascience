# ACE Checklist for Adaptive Clinical Trial Designs

## Contents

- Title and Abstract (items 1b, abstract items)
- Methods (items 3b-12b)
- Results (items 13a-17c)
- Discussion (items 20-21)
- Other Information (item 24b)

Adaptive designs CONSORT Extension (ACE).
Supplements the current CONSORT core with items specific to randomised trials that use an adaptive design (pre-planned adaptations based on accumulating data). ACE comprises seven new items, nine modified items, and six unchanged items that carry additional explanatory text, all keyed to CONSORT 2010 item numbers; the remaining CONSORT 2010 items apply unchanged. The abstract checklist adds one new item and modifies one item.

**Primary reference:** Dimairo M, Pallmann P, Wason J, et al. The Adaptive designs CONSORT Extension (ACE) statement: a checklist with explanation and elaboration guideline for reporting randomised trials that use an adaptive design. BMJ. 2020;369:m115. doi:10.1136/bmj.m115. PMID: 32554564. PMCID: PMC7298567. Published simultaneously in Trials. 2020;21(1):528 (PMID: 32546273).

**Verified against:** ACE Table 2 (main report checklist) and Table 3 (abstract checklist) in the PMC full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC7298567/, and the ACE main checklist (Word) linked from https://www.consort-spirit.org/extensions (verified 2026-10-15).

**Licence:** Checklist text reproduced verbatim from Dimairo et al., BMJ 2020, under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). The "What to look for" bullets and the CONSORT 2025 mapping lines are added by this plugin and are not ACE text.

**Numbering:** Item IDs are the CONSORT 2010 numbers used by ACE. ACE was written against CONSORT 2010; apply it alongside the CONSORT 2025 core and cite CONSORT 2025 numbers for core items. Each item below gives the nearest CONSORT 2025 core item as a plugin mapping. Renumbered CONSORT 2010 items: 3b becomes 3c, 12b becomes 12c, 15 becomes 15a, 24 becomes 24a.

---

## Title and Abstract

### Item 1b -- Structured summary (modified)

**Description:** Structured summary of trial design, methods, results, and conclusions (for specific guidance see ACE for abstracts, table 3)

ACE abstract checklist additions:
- Trial design (modified): Description of the trial design (for example, parallel, cluster, non-inferiority); include the word "adaptive" in the content or at least as a keyword
- Adaptation decisions made (new): Specify what trial adaptation decisions were made in light of the pre-planned decision-making criteria and observed accrued data
- Outcome (unchanged, additional explanatory text): Clearly defined primary outcome for this report

CONSORT 2025 core: 1b.

**What to look for in code/outputs:**
- Report title or rendered document header explicitly stating "adaptive" and naming the design (e.g., "group sequential," "response-adaptive randomization," "seamless phase II/III")
- Abstract text naming the type of adaptation and the adaptation decisions actually taken
- Report metadata confirming the adaptive design designation and the primary adaptation type

---

## Methods

### Item 3b -- Pre-planned adaptive design features (new)

**Description:** Type of adaptive design used, with details of the pre-planned trial adaptations and the statistical information informing the adaptations

CONSORT 2025 core: 9.

**What to look for in code/outputs:**
- Adaptation type clearly named: group sequential stopping (for efficacy or futility), sample size re-estimation, arm dropping, biomarker-adaptive enrichment, response-adaptive randomization, seamless phase II/III, or platform trial adaptation
- Each adaptation rule specified completely (stopping boundary values, enrichment criteria, re-estimation algorithm, arm-dropping criteria)
- Sample size re-estimation, if used: algorithm, blinding status at re-estimation, and minimum and maximum sample size bounds
- Code or statistical software implementation of the adaptation rules (gsDesign, rpact, ADDPLAN, East) referenced or included

### Item 3c -- Changes outside the pre-planned adaptations (modified; CONSORT 2010 item 3b)

**Description:** Important changes to the design or methods after trial commencement (such as eligibility criteria) outside the scope of the pre-planned adaptive design features, with reasons

CONSORT 2025 core: 10.

**What to look for in code/outputs:**
- Protocol or SAP amendment log separating unplanned changes from pre-planned adaptations
- Reasons and dates for each unplanned change, with documentation confirming no post-hoc changes to adaptation rules

### Item 6a -- Outcomes, including those informing adaptations (modified)

**Description:** Completely define pre-specified primary and secondary outcome measures, including how and when they were assessed. Any other outcome measures used to inform pre-planned adaptations should be described with the rationale

CONSORT 2025 core: 14.

**What to look for in code/outputs:**
- Endpoint derivation code for primary, secondary, and adaptation-informing outcomes (for example, an early surrogate used at interim)
- Rationale for each adaptation-informing outcome stated in the SAP

### Item 6b -- Unplanned changes to outcomes (modified)

**Description:** Any unplanned changes to trial outcomes after the trial commenced, with reasons

CONSORT 2025 core: 10.

**What to look for in code/outputs:**
- Registered vs analysed outcomes compared, with unplanned changes flagged and justified

### Item 7a -- Sample size and operating characteristics (modified)

**Description:** How sample size and operating characteristics were determined

CONSORT 2025 core: 16a.

**What to look for in code/outputs:**
- Alpha-spending function named and its parameters specified: O'Brien-Fleming, Pocock, Lan-DeMets with exact spending function parameters
- Code implementing the spending function (gsDesign `sfLDOF`, `sfHSD`, or custom function; rpact `getDesignGroupSequential`)
- Overall one-sided or two-sided alpha level, power, and expected sample size under the design
- Simulation results or analytic derivations confirming family-wise type I error control and other operating characteristics if non-standard adaptations are used

### Item 7b -- Interim decision-making criteria and timing (modified)

**Description:** Pre-planned interim decision-making criteria to guide the trial adaptation process; whether decision-making criteria were binding or non-binding; pre-planned and actual timing and frequency of interim data looks to inform trial adaptations

CONSORT 2025 core: 16b.

**What to look for in code/outputs:**
- Decision rules documented in the SAP with exact threshold values (e.g., conditional power below 20% triggers futility stopping)
- Documentation of whether futility and efficacy boundaries are binding or non-binding
- Information fractions or sample size milestones for each interim analysis, with planned vs actual timing compared
- Code implementing the decision boundaries with the exact parameter values from the SAP
- Version-controlled SAP files with timestamps confirming pre-specification relative to data access

### Item 8b -- Randomisation and allocation-rule updates (modified)

**Description:** Type of randomisation; details of any restriction (such as blocking and block size); any changes to the allocation rule after trial adaptation decisions; any pre-planned allocation rule or algorithm to update randomisation with timing and frequency of updates

CONSORT 2025 core: 17b.

**What to look for in code/outputs:**
- Response-adaptive randomisation algorithm and update schedule in code or config
- Allocation ratios before and after each adaptation decision (for example, after arm dropping)

### Item 11c -- Confidentiality of interim information (new)

**Description:** Measures to safeguard the confidentiality of interim information and minimise potential operational bias during the trial

CONSORT 2025 core: 20a.

**What to look for in code/outputs:**
- DMC charter referenced in the analysis documentation, with DMC independence from the sponsor and investigators
- Description of the firewall between the unblinded DMC statistician and the trial team
- Procedures for communicating DMC recommendations without revealing unblinded interim data
- Code or workflow isolating unblinded analysis code from the main analysis repository

### Item 12a -- Statistical methods, including adaptation-informing outcomes (modified)

**Description:** Statistical methods used to compare groups for primary and secondary outcomes, and any other outcomes used to make pre-planned adaptations

CONSORT 2025 core: 21a.

**What to look for in code/outputs:**
- Interim and final analysis models specified for every outcome that drives an adaptation
- Conditional power formula or computational approach documented in the SAP when used at interim

### Item 12b -- Estimation and inference for adaptive features (new; CONSORT 2010 item 12b becomes 12c)

**Description:** For the implemented adaptive design features, statistical methods used to estimate treatment effects for key endpoints and to make inferences

CONSORT 2025 core: 21a.

**What to look for in code/outputs:**
- Final analysis code that combines data across stages using the correct combining function (e.g., weighted inverse normal, Fisher combination)
- Bias-corrected or median unbiased estimates reported alongside naive estimates
- Confidence intervals and p-values adjusted for the sequential design, not standard fixed-sample intervals
- Stage-wise ordering or other confidence interval computation method specified

---

## Results

### Item 13a -- Participant flow, including adaptation-informing outcomes (modified)

**Description:** For each group, the numbers of participants who were randomly assigned, received intended treatment, and were analysed for the primary outcome and any other outcomes used to inform pre-planned adaptations, if applicable

CONSORT 2025 core: 22a.

**What to look for in code/outputs:**
- CONSORT flow diagram extended to show participants at each stage and the outcome of each interim analysis
- Code tracking participant counts at each stage boundary, including denominators for adaptation-informing outcomes

### Item 14a -- Recruitment and follow-up dates by group (modified)

**Description:** Dates defining the periods of recruitment and follow-up, for each group

CONSORT 2025 core: 23a.

**What to look for in code/outputs:**
- Recruitment and follow-up dates reported per arm, including arms added or dropped mid-trial

### Item 14b -- Why the trial ended or was stopped (unchanged; additional ACE explanation)

**Description:** Why the trial ended or was stopped

CONSORT 2025 core: 23b.

**What to look for in code/outputs:**
- Stopping reason tied to a pre-planned decision rule (efficacy, futility, harm) or documented as unplanned

### Item 14c -- Adaptation decisions made (new)

**Description:** Specify what trial adaptation decisions were made in light of the pre-planned decision-making criteria and observed accrued data

CONSORT 2025 core: 23b.

**What to look for in code/outputs:**
- Adaptation decisions documented at each interim: continuation unchanged, sample size increase, arm dropped, population enriched, or stopping
- Documentation confirming whether each interim result triggered an adaptation or resulted in continuation
- Reasons for any departure from the decision rules documented with rationale

### Item 15a -- Baseline data (unchanged; additional ACE explanation; CONSORT 2010 item 15)

**Description:** A table showing baseline demographic and clinical characteristics for each group

CONSORT 2025 core: 25.

**What to look for in code/outputs:**
- Baseline table by arm covering all randomised participants, including those in dropped arms

### Item 15b -- Similarity of the population between interim stages (new)

**Description:** Summary of data to enable the assessment of similarity in the trial population between interim stages

CONSORT 2025 core: 25.

**What to look for in code/outputs:**
- Baseline characteristics tabulated by stage (before and after each adaptation)
- Comparison of the enrolled population pre- and post-adaptation, especially after enrichment

### Item 16 -- Numbers analysed (unchanged; additional ACE explanation)

**Description:** For each group, number of participants (denominator) included in each analysis and whether the analysis was by original assigned groups

CONSORT 2025 core: 26.

**What to look for in code/outputs:**
- Denominators by arm and stage for interim and final analyses

### Item 17a -- Outcomes and estimation (unchanged; additional ACE explanation)

**Description:** For each primary and secondary outcome, results for each group, and the estimated effect size and its precision (such as 95% confidence interval)

CONSORT 2025 core: 26.

**What to look for in code/outputs:**
- Adjusted (stage-combining or bias-corrected) estimates alongside naive final estimates
- Adjusted p-values consistent with the alpha-spending or combination test used
- Software and version used for the adaptive analysis reported (gsDesign, rpact, ADDPLAN, East, or custom code)

### Item 17c -- Interim results (new)

**Description:** Report interim results used to inform interim decision-making

CONSORT 2025 core: 26.

**What to look for in code/outputs:**
- Table of interim results: interim number, timing, observed statistic, boundary value (efficacy and/or futility), conditional power, and decision
- Code that records and outputs interim results in a reproducible log

---

## Discussion

### Item 20 -- Limitations (unchanged; additional ACE explanation)

**Description:** Trial limitations, addressing sources of potential bias, imprecision, and, if relevant, multiplicity of analyses

CONSORT 2025 core: 30.

**What to look for in code/outputs:**
- Limitation sections addressing operational bias risks (e.g., interim information leaking to the trial team, sample size changes revealing interim results)
- Sensitivity analyses comparing adaptive analysis estimates to naive estimates that ignore the adaptive nature

### Item 21 -- Generalisability (unchanged; additional ACE explanation)

**Description:** Generalisability (external validity, applicability) of the trial findings

CONSORT 2025 core: 30.

**What to look for in code/outputs:**
- Explicit discussion of how population enrichment or arm dropping affects the population to which results apply
- Description of the final study population relative to the original target population

---

## Other Information

### Item 24b -- SAP and other trial documents (new; CONSORT 2010 item 24 becomes 24a)

**Description:** Where the full statistical analysis plan and other relevant trial documents can be accessed

CONSORT 2025 core: 3.

**What to look for in code/outputs:**
- DOI or URL for the SAP, DMC charter, and simulation report
- Version-controlled SAP with timestamps pre-dating the first interim analysis

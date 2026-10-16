# CONSORT 2025 Checklist for Randomized Controlled Trials

## Contents

- Title and Abstract (items 1a-1b)
- Open Science (items 2-5b)
- Introduction (items 6-7)
- Methods (items 8-21d)
- Results (items 22a-28)
- Discussion (items 29-30)

Consolidated Standards of Reporting Trials (CONSORT) 2025 Statement.
Current core checklist for randomized trials: 30 numbered items (42 rows counting lettered sub-items) in six sections, including the new Open Science section. Item numbers and each **Description** are copied verbatim from Table 1 of the statement; the "What to look for" bullets are added by this plugin and are not checklist text.

**Current primary reference:** Hopewell S, Chan AW, Collins GS, et al. CONSORT 2025 statement: updated guideline for reporting randomised trials. BMJ. 2025;389:e081123. doi:10.1136/bmj-2024-081123. PMID: 40228833. PMCID: PMC11995449. Published simultaneously in BMJ, JAMA, Lancet, Nature Medicine, and PLOS Medicine (PLOS Med. 2025;22(4):e1004587. doi:10.1371/journal.pmed.1004587. PMID: 40228477).

**Verified against:** CONSORT 2025 Table 1 in the PMC full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC11995449/.

**Licence:** Checklist text reproduced from Hopewell et al., BMJ 2025, under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC11995449/ (verified 2026-10-15).

**Explanation and elaboration:** Hopewell S, Chan AW, Collins GS, et al. CONSORT 2025 explanation and elaboration: updated guideline for reporting randomised trials. BMJ. 2025;389:e081124. doi:10.1136/bmj-2024-081124. PMID: 40228832.

**Superseded:** CONSORT 2010 (Schulz KF, et al. BMJ. 2010;340:c332. PMID: 20332509) is replaced by CONSORT 2025 and should not be used as the current standard. Its 25-item numbering does not map one-to-one onto 2025 numbers; cite 2025 numbers in findings.

Extensions exist for cluster-randomized, non-inferiority, crossover, adaptive, and other designs, and most were written against CONSORT 2010, which CONSORT 2025 supersedes. Apply the CONSORT 2025 core together with the relevant design-specific extension.

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Title and Abstract

### Item 1a -- Identification as a randomised trial

**Description:** Identification as a randomised trial

**What to look for in code/outputs:**
- Report or manuscript titles that include "randomised" or "randomized" and identify the trial design
- Quarto, R Markdown, or Jupyter header metadata containing a title referencing the trial

### Item 1b -- Structured summary of trial design, methods, results, and conclusions

**Description:** Structured summary of the trial design, methods, results, and conclusions

**What to look for in code/outputs:**
- Abstract templates structured as background, methods, results, conclusions
- Summary output reporting intervention, comparator, primary outcome, main result with precision, and harms

---

## Open Science

### Item 2 -- Trial registration

**Description:** Name of trial registry, identifying number (with URL) and date of registration

**What to look for in code/outputs:**
- ClinicalTrials.gov (NCT), ISRCTN, EU CTR, or other registry identifier and URL in report metadata
- Registration date recorded, so readers can tell whether registration preceded enrollment
- Analysis code citing registered endpoints when deriving outcomes

### Item 3 -- Protocol and statistical analysis plan

**Description:** Where the trial protocol and statistical analysis plan can be accessed

**What to look for in code/outputs:**
- Protocol and SAP paths, URLs, or DOIs referenced in analysis code or report
- Version-controlled protocol and SAP files with version numbers and dates
- Analysis scripts that cite the SAP section they implement

### Item 4 -- Data sharing

**Description:** Where and how the individual de-identified participant data (including data dictionary), statistical code and any other materials can be accessed

**What to look for in code/outputs:**
- Data availability statement naming the repository, access route, and conditions
- Data dictionary or codebook shipped with the analysis dataset
- Public or archived analysis code (repository URL, release tag, DOI)
- De-identification steps applied before any shared extract

### Item 5a -- Funding and role of funders

**Description:** Sources of funding and other support (eg, supply of drugs), and role of funders in the design, conduct, analysis and reporting of the trial

**What to look for in code/outputs:**
- Funding acknowledgment sections with grant numbers or sponsor names
- Role-of-funder statement covering data access, analysis oversight, and publication rights
- Data use agreement or contract references

### Item 5b -- Conflicts of interest

**Description:** Financial and other conflicts of interest of the manuscript authors

**What to look for in code/outputs:**
- Competing interests section in the report template
- Disclosure of author roles with the sponsor or with the intervention's manufacturer

---

## Introduction

### Item 6 -- Scientific background and rationale

**Description:** Scientific background and rationale

**What to look for in code/outputs:**
- Introductory sections citing prior evidence and knowledge gaps
- References to a protocol, registration, or systematic review establishing equipoise

### Item 7 -- Objectives related to benefits and harms

**Description:** Specific objectives related to benefits and harms

**What to look for in code/outputs:**
- Explicit objectives or hypotheses in the SAP or report preamble, for both benefit and harm
- Outcome and treatment variables named consistently with stated objectives

---

## Methods

### Item 8 -- Patient and public involvement

**Description:** Details of patient or public involvement in the design, conduct and reporting of the trial

**What to look for in code/outputs:**
- Statement describing patient or public partner roles (outcome selection, materials, interpretation), or that none occurred
- Documentation of patient-informed outcome or threshold choices referenced in the SAP

### Item 9 -- Trial design

**Description:** Description of trial design including type of trial (eg, parallel group, crossover), allocation ratio, and framework (eg, superiority, equivalence, non-inferiority, exploratory)

**What to look for in code/outputs:**
- Config or comments stating design and allocation ratio (1:1, 2:1)
- Framework stated and matched to the analysis (non-inferiority margin, one- vs two-sided tests)
- Data structure consistent with the design (one row per participant for parallel, period rows for crossover)

### Item 10 -- Changes to trial protocol

**Description:** Important changes to the trial after it commenced including any outcomes or analyses that were not prespecified, with reason

**What to look for in code/outputs:**
- Protocol amendment or SAP amendment log with dates and rationale
- Comparison of registered vs analyzed endpoints; changed or added outcomes flagged
- Analyses not in the SAP labeled as not prespecified
- Sensitivity analyses comparing pre- and post-amendment populations

### Item 11 -- Trial setting

**Description:** Settings (eg, community, hospital) and locations (eg, countries, sites) where the trial was conducted

**What to look for in code/outputs:**
- Site or center variables used in loading, stratification, or random effects
- Site-level summaries and data dictionary entries for location fields

### Item 12a -- Eligibility criteria for participants

**Description:** Eligibility criteria for participants

**What to look for in code/outputs:**
- Inclusion/exclusion filter logic with explicit thresholds (age, diagnosis, consent)
- Participant counts at the eligibility screening step

### Item 12b -- Eligibility criteria for sites and intervention deliverers

**Description:** If applicable, eligibility criteria for sites and for individuals delivering the interventions (eg, surgeons, physiotherapists)

**What to look for in code/outputs:**
- Site selection criteria (volume, accreditation) documented in protocol or config
- Provider-level variables (experience, training completion) and the criteria applied to them

### Item 13 -- Intervention and comparator

**Description:** Intervention and comparator with sufficient details to allow replication. If relevant, where additional materials describing the intervention and comparator (eg, intervention manual) can be accessed

**What to look for in code/outputs:**
- Treatment variable definitions (drug, dose, schedule, route, comparator or placebo)
- Code mapping treatment codes to descriptive labels
- Links to intervention manuals or supplementary materials

### Item 14 -- Outcomes

**Description:** Prespecified primary and secondary outcomes, including the specific measurement variable (eg, systolic blood pressure), analysis metric (eg, change from baseline, final value, time to event), method of aggregation (eg, median, proportion), and time point for each outcome

**What to look for in code/outputs:**
- Endpoint derivation code covering variable, metric, aggregation, and time point
- Assessment timing variables and visit windows relative to randomization
- Composite endpoint logic and validated instrument scoring
- SAP references for each endpoint definition

### Item 15 -- Harms

**Description:** How harms were defined and assessed (eg, systematically, non-systematically)

**What to look for in code/outputs:**
- Adverse event definitions, grading (CTCAE), and coding dictionary (MedDRA) version
- Distinction between solicited (systematic) and spontaneously reported harms
- Harm assessment schedule and safety population definition

### Item 16a -- Sample size

**Description:** How sample size was determined, including all assumptions supporting the sample size calculation

**What to look for in code/outputs:**
- Power or sample size code (pwr, gsDesign, simulation) that runs and reproduces the stated n
- Assumed effect size, variance or control event rate, alpha, power, dropout, and allocation ratio
- Source for each assumption cited in the SAP

### Item 16b -- Interim analyses and stopping guidelines

**Description:** Explanation of any interim analyses and stopping guidelines

**What to look for in code/outputs:**
- Interim analysis code with stopping boundaries (O'Brien-Fleming, Lan-DeMets alpha spending)
- DSMB report generation code and planned interim looks
- Futility rules and adaptive sample size re-estimation parameters

### Item 17a -- Sequence generation: who and method

**Description:** Who generated the random allocation sequence and the method used

**What to look for in code/outputs:**
- Randomization code specifying method (simple, block, stratified, minimization) and seed
- Role documentation naming who generated the sequence (such as an independent statistician)
- References to external randomization systems (IRT/IWRS)

### Item 17b -- Type of randomisation and restriction

**Description:** Type of randomisation and details of any restriction (eg, stratification, blocking and block size)

**What to look for in code/outputs:**
- Fixed or variable block sizes and stratification factors in code or config
- Stratification factors carried into the primary model

### Item 18 -- Allocation concealment mechanism

**Description:** Mechanism used to implement the random allocation sequence (eg, central computer/telephone; sequentially numbered, opaque, sealed containers), describing any steps to conceal the sequence until interventions were assigned

**What to look for in code/outputs:**
- References to central randomization or sealed-envelope procedures
- Sequence generation separated from implementation in the workflow
- Audit trail or logging of assignments

### Item 19 -- Implementation

**Description:** Whether the personnel who enrolled and those who assigned participants to the interventions had access to the random allocation sequence

**What to look for in code/outputs:**
- Access controls on the randomization list (enrolling staff cannot view upcoming assignments)
- Separation-of-duties documentation for enrollment, assignment, and sequence custody

### Item 20a -- Who was blinded

**Description:** Who was blinded after assignment to interventions (eg, participants, care providers, outcome assessors, data analysts)

**What to look for in code/outputs:**
- Masking indicators and documented blinding status per role, including data analysts
- Analysis run on coded arm labels before unblinding
- Emergency unblinding code paths and logs

### Item 20b -- How blinding was achieved

**Description:** If blinded, how blinding was achieved and description of the similarity of interventions

**What to look for in code/outputs:**
- Placebo matching documentation (appearance, taste, packaging)
- Blinding success assessment (James or Bang blinding index)

### Item 21a -- Statistical methods for outcomes, including harms

**Description:** Statistical methods used to compare groups for primary and secondary outcomes, including harms

**What to look for in code/outputs:**
- Model specification: family, link, mixed effects, robust SEs, covariates (stratification factors)
- Primary model clearly distinguished from secondary and exploratory models
- Effect measure (difference, OR, RR, HR) with CIs; test matches the SAP
- Harms analysis method (incidence, exposure-adjusted rates)

### Item 21b -- Analysis populations

**Description:** Definition of who is included in each analysis (eg, all randomised participants), and in which group

**What to look for in code/outputs:**
- ITT, modified ITT, per-protocol, and safety population definitions in code
- Analysis by randomized assignment vs treatment received, with filtering matching the stated population

### Item 21c -- Missing data

**Description:** How missing data were handled in the analysis

**What to look for in code/outputs:**
- Missingness summaries by arm and outcome
- Imputation code (multiple imputation, model-based) with stated assumptions (MAR, MNAR)
- Sensitivity analyses for departures from assumptions (tipping-point, delta adjustment)
- Complete-case analysis flagged when used

### Item 21d -- Additional analyses

**Description:** Methods for any additional analyses (eg, subgroup and sensitivity analyses), distinguishing prespecified from post hoc

**What to look for in code/outputs:**
- Subgroup code using interaction terms, with prespecified vs post hoc labels
- Multiplicity adjustment and covariate selection rationale
- Sensitivity analysis specifications traced to the SAP

---

## Results

### Item 22a -- Participant flow

**Description:** For each group, the numbers of participants who were randomly assigned, received intended intervention, and were analysed for the primary outcome

**What to look for in code/outputs:**
- CONSORT flow diagram generation code (consort, ggconsort, or manual)
- Counts by arm at each stage: screened, randomized, allocated, received intervention, followed up, analyzed

### Item 22b -- Losses and exclusions

**Description:** For each group, losses and exclusions after randomisation, together with reasons

**What to look for in code/outputs:**
- Post-randomization exclusion code with reasons, counted by arm
- Documentation of whether exclusions occurred before or after unblinding

### Item 23a -- Recruitment and follow-up dates

**Description:** Dates defining the periods of recruitment and follow-up for outcomes of benefits and harms

**What to look for in code/outputs:**
- First and last enrollment dates, data cutoff, and database lock date
- Follow-up duration by arm, reported separately for efficacy and harm outcomes where they differ

### Item 23b -- Why the trial ended

**Description:** If relevant, why the trial ended or was stopped

**What to look for in code/outputs:**
- Completion or early stopping documentation (DSMB recommendation, futility, sponsor decision)
- Interim results that triggered stopping

### Item 24a -- Intervention and comparator delivery

**Description:** Intervention and comparator as they were actually administered (eg, where appropriate, who delivered the intervention/comparator, how participants adhered, whether they were delivered as intended (fidelity))

**What to look for in code/outputs:**
- Adherence and compliance derivations (doses received, sessions attended) by arm
- Fidelity measures and provider or site delivery summaries
- Crossover or non-receipt counts

### Item 24b -- Concomitant care

**Description:** Concomitant care received during the trial for each group

**What to look for in code/outputs:**
- Concomitant medication or co-intervention tables by arm
- Rescue medication use and prohibited-medication deviations

### Item 25 -- Baseline data

**Description:** A table showing baseline demographic and clinical characteristics for each group

**What to look for in code/outputs:**
- Table 1 code (tableone, gtsummary) stratified by arm, with mean/SD, median/IQR, or n/%
- No baseline significance tests in a randomized trial; SMDs if balance is shown
- All randomized participants included in the baseline table

### Item 26 -- Numbers analysed, outcomes, and estimation

**Description:** For each primary and secondary outcome, by group: the number of participants included in the analysis; the number of participants with available data at the outcome time point; result for each group, and the estimated effect size and its precision (such as 95% confidence interval); for binary outcomes, presentation of both absolute and relative effect size

**What to look for in code/outputs:**
- Per-outcome denominators: analyzed n and n with observed data at each time point, by arm
- Group summaries (event rates, means) alongside effect estimates with 95% CIs
- Binary endpoints with both risk difference and RR or OR (NNT if reported)
- Forest or coefficient plots matching tabulated estimates

### Item 27 -- Harms

**Description:** All harms or unintended events in each group

**What to look for in code/outputs:**
- Adverse event tables by arm, severity, and system organ class
- Serious adverse event counts and withdrawals due to adverse events by arm

### Item 28 -- Ancillary analyses

**Description:** Any other analyses performed, including subgroup and sensitivity analyses, distinguishing pre-specified from post hoc

**What to look for in code/outputs:**
- Subgroup results with interaction tests and forest plots
- Sensitivity analyses (per-protocol, as-treated, imputation variants) labeled prespecified or post hoc

---

## Discussion

### Item 29 -- Interpretation

**Description:** Interpretation consistent with results, balancing benefits and harms, and considering other relevant evidence

**What to look for in code/outputs:**
- Conclusions that weigh efficacy against safety findings
- Effect sizes interpreted against clinically meaningful thresholds, without causal overclaims beyond the trial

### Item 30 -- Limitations

**Description:** Trial limitations, addressing sources of potential bias, imprecision, generalisability, and, if relevant, multiplicity of analyses

**What to look for in code/outputs:**
- Limitations informed by sensitivity analyses, missing data, non-adherence, and protocol deviations
- Trial population compared with the target population (generalisability; formerly a separate 2010 item)
- Multiplicity discussed when many outcomes or subgroups were tested

# CONSORT Checklist for Randomized Controlled Trials

Consolidated Standards of Reporting Trials (CONSORT) 2010 Statement.
25-item checklist applicable to parallel-group randomized controlled trials (the most common RCT design).

**Primary reference:** Schulz KF, Altman DG, Moher D; CONSORT Group. CONSORT 2010 statement: updated guidelines for reporting parallel group randomised trials. BMJ. 2010;340:c332. doi:10.1136/bmj.c332. PMID: 20332509.

**Explanation and elaboration:** Moher D, Hopewell S, Schulz KF, et al. CONSORT 2010 explanation and elaboration: updated guidelines for reporting parallel group randomised trials. BMJ. 2010;340:c869. doi:10.1136/bmj.c869. PMID: 20332511.

Extensions exist for cluster-randomized, non-inferiority, crossover, adaptive, and other designs. This checklist covers the core parallel-group trial. Apply the relevant extension when the study design departs from standard parallel-group randomization.

Each item includes the checklist number, section, description, and what to look for
in analysis code and outputs when evaluating compliance.

---

## Title and Abstract

### Item 1a -- Identification as a randomised trial in the title

**Description:** Identification as a randomised trial in the title.

**What to look for in code/outputs:**
- Report templates, manuscript drafts, or rendered documents whose title includes "randomised" or "randomized" and identifies the trial design
- Quarto, R Markdown, or Jupyter header metadata containing a title referencing the trial

### Item 1b -- Structured summary of trial design, methods, results, and conclusions

**Description:** Structured summary of trial design, methods, results, and conclusions (for specific guidance see CONSORT for abstracts).

**What to look for in code/outputs:**
- Abstract generation code or templates structured as background, methods, results, conclusions
- Summary output that reports the intervention, comparator, primary outcome, main result, and main conclusion
- Rendered reports whose abstract section covers enrollment, randomization, follow-up, and analysis

---

## Introduction

### Item 2a -- Scientific background and explanation of rationale

**Description:** Scientific background and explanation of rationale.

**What to look for in code/outputs:**
- Introductory markdown cells or report sections citing prior evidence and knowledge gaps
- Documentation linking the trial to a specific clinical question or unmet need
- References to a protocol, trial registration, or prior systematic review establishing equipoise

### Item 2b -- Specific objectives or hypotheses

**Description:** Specific objectives or hypotheses.

**What to look for in code/outputs:**
- Explicit hypothesis statements in documentation, SAP, or report preamble (superiority, non-inferiority, equivalence)
- Primary and secondary objectives defined in a config file, SAP, or analysis header
- Outcome variables and treatment assignment variables named consistently with stated objectives

---

## Methods

### Item 3a -- Description of trial design including allocation ratio

**Description:** Description of trial design (such as parallel, factorial) including allocation ratio.

**What to look for in code/outputs:**
- Code comments or config specifying trial design (parallel, factorial, crossover) and allocation ratio (1:1, 2:1)
- Randomization code or documentation showing the intended allocation ratio
- Data structure consistent with the stated design (one row per participant for parallel, multiple rows for crossover)

### Item 3b -- Important changes to methods after trial commencement with reasons

**Description:** Important changes to methods after trial commencement (such as eligibility criteria), with reasons.

**What to look for in code/outputs:**
- Protocol amendment documentation referenced in analysis code or report
- Comments documenting mid-trial changes to eligibility, endpoints, or sample size
- Version-controlled SAP files showing tracked changes with dates and rationale
- Sensitivity analyses comparing pre-amendment and post-amendment populations

### Item 4a -- Eligibility criteria for participants

**Description:** Eligibility criteria for participants.

**What to look for in code/outputs:**
- Inclusion/exclusion filter logic applied to the enrolled population
- Code that constructs the analysis dataset with documented eligibility criteria
- Age, diagnosis, comorbidity, or consent status filters with explicit thresholds
- Flowchart or participant counts at the eligibility screening step

### Item 4b -- Settings and locations where data were collected

**Description:** Settings and locations where the data were collected.

**What to look for in code/outputs:**
- Site or center variables used in data loading, stratification, or random effects
- Comments documenting recruitment sites, countries, or care settings
- Multi-site indicator variables and site-level summary statistics
- Data dictionary entries for site and location fields

### Item 5 -- Interventions for each group with sufficient details to allow replication

**Description:** The interventions for each group with sufficient details to allow replication, including how and when they were actually administered.

**What to look for in code/outputs:**
- Treatment group variable definitions (drug name, dose, schedule, comparator)
- Code mapping treatment codes to descriptive labels
- Documentation of intervention delivery (timing, route, frequency, duration)
- Adherence or compliance variable construction and summaries

### Item 6a -- Completely defined pre-specified primary and secondary outcome measures

**Description:** Completely defined pre-specified primary and secondary outcome measures, including how and when they were assessed.

**What to look for in code/outputs:**
- Primary and secondary endpoint variable derivation code with clear naming
- Assessment timing variables (e.g., days from randomization, visit windows)
- Composite endpoint construction logic
- Outcome measurement instrument scores (validated scales, lab assays) and their computation
- SAP or protocol references specifying endpoint definitions

### Item 6b -- Any changes to trial outcomes after the trial commenced with reasons

**Description:** Any changes to trial outcomes after the trial commenced, with reasons.

**What to look for in code/outputs:**
- Documentation of endpoint changes with dates and rationale
- Comparison between originally registered endpoints and analyzed endpoints
- Protocol amendment logs or version-tracked SAP sections covering outcome changes
- Sensitivity analyses using original endpoints alongside modified endpoints

### Item 7a -- How sample size was determined

**Description:** How sample size was determined.

**What to look for in code/outputs:**
- Power analysis or sample size calculation code (pwr, gsDesign, PASS references)
- Documentation of assumed effect size, alpha, power, dropout rate, and allocation ratio
- Interim analysis or adaptive sample size re-estimation code
- References to the sample size justification in the protocol or SAP

### Item 7b -- When applicable, explanation of any interim analyses and stopping guidelines

**Description:** When applicable, explanation of any interim analyses and stopping guidelines.

**What to look for in code/outputs:**
- Interim analysis code with stopping boundaries (O'Brien-Fleming, Lan-DeMets spending functions)
- Data Safety Monitoring Board (DSMB) report generation code
- Alpha-spending function implementation or group-sequential design parameters
- Documentation of planned interim looks and early stopping criteria

### Item 8a -- Method used to generate the random allocation sequence

**Description:** Method used to generate the random allocation sequence.

**What to look for in code/outputs:**
- Randomization code specifying the method (simple, block, stratified, adaptive)
- Random seed setting and documentation
- Block sizes and stratification factors defined in code or config
- References to external randomization systems (IRT/IWRS) or randomization lists

### Item 8b -- Type of randomisation and details of any restriction

**Description:** Type of randomisation; details of any restriction (such as blocking and block size).

**What to look for in code/outputs:**
- Block randomization with fixed or variable block sizes specified
- Stratification factors listed in randomization code
- Minimization or covariate-adaptive randomization algorithms
- Documentation of randomization restrictions and their rationale

### Item 9 -- Mechanism used to implement the random allocation sequence

**Description:** Mechanism used to implement the random allocation sequence (such as sequentially numbered containers), describing any steps taken to conceal the sequence until interventions were assigned.

**What to look for in code/outputs:**
- References to central randomization systems, IRT/IWRS platforms, or sealed envelopes
- Allocation concealment documentation in protocol or methods sections
- Sequence generation separated from sequence implementation in code or workflow
- Audit trail or logging of randomization assignments

### Item 10 -- Who generated the random allocation sequence, who enrolled participants, and who assigned participants to interventions

**Description:** Who generated the random allocation sequence, who enrolled participants, and who assigned participants to interventions.

**What to look for in code/outputs:**
- Documentation of roles: statistician generating the sequence, clinical staff enrolling participants
- Comments referencing separation of duties in the randomization process
- Audit logs or metadata indicating who performed each step
- References to the data management plan documenting these roles

### Item 11a -- Blinding: who was blinded after assignment to interventions and how

**Description:** If done, who was blinded after assignment to interventions (for example, participants, care providers, those assessing outcomes) and how.

**What to look for in code/outputs:**
- Blinding variable or masking indicator in the dataset
- Documentation specifying single-blind, double-blind, or open-label design
- Unblinding procedures or emergency unblinding code paths
- Outcome assessor blinding status documented in data collection metadata

### Item 11b -- Description of the similarity of interventions if relevant

**Description:** If relevant, description of the similarity of interventions (for example, matching placebo).

**What to look for in code/outputs:**
- Documentation of placebo matching (appearance, taste, packaging)
- Blinding success assessment code (e.g., James blinding index, Bang blinding index)
- Sensitivity analyses stratified by guessed treatment assignment
- References to pharmacy or manufacturing documentation on intervention matching

### Item 12a -- Statistical methods used to compare groups for primary and secondary outcomes

**Description:** Statistical methods used to compare groups for primary and secondary outcomes.

**What to look for in code/outputs:**
- Model specification code: regression family, link function, mixed effects, robust standard errors
- Primary analysis model clearly distinguished from secondary and exploratory analyses
- Treatment effect estimation (difference in means, odds ratio, hazard ratio) with confidence intervals
- Pre-specified statistical test (t-test, chi-square, log-rank, ANCOVA) matching the SAP
- Handling of baseline covariates in the primary model (stratification factors, prognostic variables)

### Item 12b -- Methods for additional analyses such as subgroup analyses and adjusted analyses

**Description:** Methods for additional analyses, such as subgroup analyses and adjusted analyses.

**What to look for in code/outputs:**
- Subgroup analysis code: interaction terms, stratified treatment effects, forest plots
- Pre-specified vs. exploratory subgroup designation in code comments or SAP
- Multiplicity adjustment for subgroup comparisons
- Adjusted analyses with covariate selection rationale documented
- Per-protocol and as-treated sensitivity analyses alongside intention-to-treat

---

## Results

### Item 13a -- Flow of participants through each stage with numbers

**Description:** For each group, the numbers of participants who were randomly assigned, received intended treatment, and were analysed for the primary outcome.

**What to look for in code/outputs:**
- CONSORT flow diagram generation code (consort, ggconsort, or manual flowchart)
- Row counts at each stage: screened, eligible, randomized, allocated, received intervention, completed follow-up, analyzed
- Counts by treatment arm at every stage
- Attrition tracking from randomization through primary analysis

### Item 13b -- For each group, losses and exclusions after randomisation with reasons

**Description:** For each group, losses and exclusions after randomisation, together with reasons.

**What to look for in code/outputs:**
- Post-randomization exclusion code with documented reasons (withdrawal, lost to follow-up, protocol violation)
- Exclusion counts by treatment arm and reason
- Comparison of excluded vs. retained participants
- Documentation of whether exclusions occurred before or after unblinding

### Item 14a -- Dates defining the periods of recruitment and follow-up

**Description:** Dates defining the periods of recruitment and follow-up.

**What to look for in code/outputs:**
- Date range filters in data loading (first enrollment date, last enrollment date, data cutoff)
- Follow-up duration calculations (time from randomization to last contact or event)
- Summary statistics for follow-up time by treatment arm (median, range, person-years)
- Data lock or database freeze date documented in code or report metadata

### Item 14b -- Why the trial ended or was stopped

**Description:** Why the trial ended or was stopped.

**What to look for in code/outputs:**
- Documentation of trial completion (target enrollment reached, planned follow-up completed)
- Early stopping documentation referencing DSMB recommendation or futility analysis
- Interim analysis results that triggered stopping
- References to regulatory or sponsor decisions affecting trial continuation

### Item 15 -- Baseline demographic and clinical characteristics for each group

**Description:** A table showing baseline demographic and clinical characteristics for each group.

**What to look for in code/outputs:**
- Table 1 generation code (tableone, gtsummary, CreateTableOne) stratified by treatment arm
- Baseline characteristics presented as mean/SD, median/IQR, or n/% as appropriate
- No p-values for baseline comparisons in a randomized trial (baseline differences are due to chance)
- Standardized mean differences if presented for balance assessment
- All randomized participants included in the baseline table (not just the analyzed population)

### Item 16 -- For each group, number of participants included in each analysis and whether the analysis was by original assigned groups

**Description:** For each group, number of participants (denominator) included in each analysis and whether the analysis was by original assigned groups.

**What to look for in code/outputs:**
- Denominators explicitly stated or derivable for each analysis (ITT, modified ITT, per-protocol)
- Code confirming analysis by randomized assignment (intention-to-treat) vs. treatment received
- Sample size annotations on results tables
- Consistency between stated analysis population and actual data filtering

### Item 17a -- For each primary and secondary outcome, results for each group and estimated effect size with its precision

**Description:** For each primary and secondary outcome, results for each group, and the estimated effect size and its precision (such as 95% confidence interval).

**What to look for in code/outputs:**
- Treatment effect estimates (risk difference, relative risk, odds ratio, hazard ratio, mean difference) with 95% CIs
- Group-level summary statistics (event rates, means, medians) alongside relative measures
- Model output summaries showing point estimates, standard errors, and confidence intervals
- Forest plots or coefficient plots displaying treatment effects with CIs

### Item 17b -- For binary outcomes, presentation of both absolute and relative effect sizes

**Description:** For binary outcomes, presentation of both absolute and relative effect sizes is recommended.

**What to look for in code/outputs:**
- Both absolute risk difference and relative measure (RR or OR) reported for binary endpoints
- Number needed to treat (NNT) or number needed to harm (NNH) calculations
- Event rate per arm alongside relative measures
- Confidence intervals for both absolute and relative measures

### Item 18 -- Results of any other analyses performed including subgroup analyses and adjusted analyses

**Description:** Results of any other analyses performed, including subgroup analyses and adjusted analyses, distinguishing pre-specified from exploratory.

**What to look for in code/outputs:**
- Subgroup analysis results with treatment-by-subgroup interaction tests
- Forest plots of subgroup effects
- Clear labeling of pre-specified vs. post-hoc analyses
- Sensitivity analyses: per-protocol, as-treated, tipping-point, multiple imputation
- Adjusted analyses controlling for prognostic baseline covariates

### Item 19 -- All important harms or unintended effects in each group

**Description:** All important harms or unintended effects in each group (for specific guidance see CONSORT for harms).

**What to look for in code/outputs:**
- Adverse event summary tables by treatment arm and severity
- Serious adverse event (SAE) listings or counts
- Harm-related endpoint analyses (safety population definitions)
- Code generating safety tables (MedDRA coding, system organ class summaries)
- Withdrawal-due-to-adverse-event counts by arm

---

## Discussion

### Item 20 -- Trial limitations, addressing sources of potential bias and imprecision

**Description:** Trial limitations, addressing sources of potential bias, imprecision, and, if relevant, multiplicity of analyses.

**What to look for in code/outputs:**
- Limitation sections in report templates addressing potential bias
- Sensitivity analysis results informing limitation discussion
- Documentation of known data quality issues, protocol deviations, or measurement limitations
- Discussion of the impact of missing data, non-compliance, or loss to follow-up on validity

### Item 21 -- Generalisability (external validity, applicability) of the trial findings

**Description:** Generalisability (external validity, applicability) of the trial findings.

**What to look for in code/outputs:**
- Description of the trial population compared to the broader target population
- Demographic and clinical profile summaries enabling generalizability assessment
- Comments on single-center vs. multi-center design implications
- Inclusion/exclusion criteria summary that contextualizes external validity

### Item 22 -- Interpretation consistent with results, balancing benefits and harms

**Description:** Interpretation consistent with results, balancing benefits and harms, and considering other relevant evidence.

**What to look for in code/outputs:**
- Conclusion statements in reports that balance efficacy findings with safety findings
- References to existing evidence (prior trials, meta-analyses) for context
- Language appropriately qualifying findings (avoiding causal overclaims)
- Effect size interpretation relative to clinically meaningful thresholds

---

## Other Information

### Item 23 -- Registration number and name of trial registry

**Description:** Registration number and name of trial registry.

**What to look for in code/outputs:**
- ClinicalTrials.gov identifier (NCT number), ISRCTN, EudraCT, or other registry number in report metadata
- Registry link in analysis documentation or report header
- Code referencing the registration for protocol-specified endpoints

### Item 24 -- Where the full trial protocol can be accessed

**Description:** Where the full trial protocol can be accessed, if available.

**What to look for in code/outputs:**
- Protocol document path or URL referenced in analysis code or report
- Version-controlled protocol files in the project repository
- DOI or publication reference for the published protocol
- Supplementary material references including the protocol

### Item 25 -- Sources of funding and other support, role of funders

**Description:** Sources of funding and other support (such as supply of drugs), role of funders.

**What to look for in code/outputs:**
- Funding acknowledgment sections in report templates
- Grant numbers or sponsor documentation
- Role of funder statement (data access, analysis oversight, publication rights)
- Conflict of interest disclosures
- Data use agreement or contract references

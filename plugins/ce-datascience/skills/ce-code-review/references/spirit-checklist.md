# SPIRIT 2025 Checklist for Randomised Trial Protocols

## Contents

- Administrative information (items 1a-3d)
- Open science (items 4-8)
- Introduction (items 9a-10)
- Methods: patient and public involvement, trial design (items 11-12)
- Methods: participants, interventions, and outcomes (items 13-20)
- Methods: assignment of interventions (items 21a-24c)
- Methods: data collection, management, and analysis (items 25a-27d)
- Methods: monitoring (items 28a-29)
- Ethics (items 30-34)

Standard Protocol Items: Recommendations for Interventional Trials (SPIRIT) 2025.
Current core checklist for randomised trial protocols: 34 numbered items in the sections below. Item numbers and paraphrased wording follow Table 1 of the statement. The "Review cue" column is added by this plugin for analysis plans, code, and protocol documents; it is not checklist text.

**Current primary reference:** Chan AW, Boutron I, Hopewell S, et al. SPIRIT 2025 statement: updated guideline for protocols of randomised trials. BMJ. 2025;389:e081477. doi:10.1136/bmj-2024-081477. PMID: 40294953. PMCID: PMC12035670. Published simultaneously in other journals, including JAMA, Lancet, Nature Medicine, and PLOS Medicine.

**Verified against:** SPIRIT 2025 Table 1 in the PMC full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC12035670/.

**Superseded:** SPIRIT 2013 is replaced by SPIRIT 2025. Extensions written against SPIRIT 2013 (for example SPIRIT-AI) are applied together with the SPIRIT 2025 core; cite 2025 item numbers for core items.

Use this checklist for trial protocols and statistical analysis plans at the protocol stage. Completed trial reports use CONSORT 2025.

---

## Administrative information

| Item | Description | Review cue |
|---|---|---|
| 1a | Title stating the trial design, population, and interventions, with identification as a protocol | |
| 1b | Structured summary of trial design and methods, including items from the WHO Trial Registration Data Set | Summary matches registry entry |
| 2 | Version date and identifier | Protocol and SAP version/date recorded in the repo |
| 3a | Names, affiliations, and roles of protocol contributors | |
| 3b | Name and contact information for the trial sponsor | |
| 3c | Role of trial sponsor and funders in design, conduct, analysis, and reporting, including any authority over these activities | |
| 3d | Composition, roles, and responsibilities of the coordinating site, steering committee, endpoint adjudication committee, data management team, and other oversight groups, if applicable | |

## Open science

| Item | Description | Review cue |
|---|---|---|
| 4 | Name of trial registry, identifying number (with URL), and date of registration; if not yet registered, name of intended registry | |
| 5 | Where the trial protocol and statistical analysis plan can be accessed | SAP exists as a versioned document, not only in code |
| 6 | Where and how de-identified participant data (including data dictionary), statistical code, and other materials will be accessible | Data dictionary and analysis code location stated |
| 7a | Sources of funding and other support | |
| 7b | Financial and other conflicts of interest for principal investigators and steering committee members | |
| 8 | Plans to communicate trial results to participants, healthcare professionals, the public, and other groups | |

## Introduction

| Item | Description | Review cue |
|---|---|---|
| 9a | Scientific background and rationale, including a summary of relevant studies (published and unpublished) on benefits and harms of each intervention | |
| 9b | Explanation for choice of comparator | |
| 10 | Specific objectives related to benefits and harms | Each objective maps to a prespecified outcome and analysis |

## Methods: patient and public involvement, trial design

| Item | Description | Review cue |
|---|---|---|
| 11 | Details of, or plans for, patient or public involvement in design, conduct, and reporting | |
| 12 | Trial design, including type (e.g., parallel group, crossover), allocation ratio, and framework (superiority, equivalence, non-inferiority, exploratory) | Non-inferiority/equivalence margin and its justification stated |

## Methods: participants, interventions, and outcomes

| Item | Description | Review cue |
|---|---|---|
| 13 | Settings and locations where the trial will be conducted | |
| 14a | Eligibility criteria for participants | |
| 14b | If applicable, eligibility criteria for sites and for individuals who deliver the interventions | |
| 15a | Intervention and comparator in enough detail to allow replication, including how, when, and by whom administered | |
| 15b | Criteria for discontinuing or modifying the allocated intervention/comparator for a participant | |
| 15c | Strategies to improve adherence and procedures for monitoring adherence, if applicable | |
| 15d | Concomitant care permitted or prohibited during the trial | |
| 16 | Primary and secondary outcomes: measurement variable, analysis metric, method of aggregation, and time point for each | Each outcome's four elements are defined in the SAP and derivation code |
| 17 | How harms are defined and will be assessed (systematically or non-systematically) | |
| 18 | Time schedule of enrolment, interventions (including run-ins and washouts), assessments, and visits; a schematic is highly recommended | |
| 19 | How sample size was determined, including all assumptions supporting the calculation | Calculation reproducible from stated inputs (effect, variance or event rate, alpha, sidedness, power, dropout, design effect) |
| 20 | Strategies for achieving adequate enrolment to reach target sample size | |

## Methods: assignment of interventions

| Item | Description | Review cue |
|---|---|---|
| 21a | Who will generate the random allocation sequence and the method used | Seeded, version-controlled generation code held apart from enrolling staff |
| 21b | Type of randomisation (simple or restricted) and any stratification factors; details of restriction such as blocking kept in a separate document unavailable to those who enrol or assign | Block sizes not exposed in shared code or outputs |
| 22 | Mechanism used to implement the allocation sequence and steps to conceal it until assignment | |
| 23 | Whether personnel who enrol and who assign participants will have access to the allocation sequence | |
| 24a | Who will be blinded after assignment (participants, care providers, outcome assessors, data analysts) | |
| 24b | If blinded, how blinding will be achieved and similarity of interventions | |
| 24c | If blinded, circumstances under which unblinding is permissible and the procedure | |

## Methods: data collection, management, and analysis

| Item | Description | Review cue |
|---|---|---|
| 25a | Plans for assessment and collection of trial data, processes to promote data quality, and trial instruments with reliability and validity if known | |
| 25b | Plans to promote retention and complete follow-up, including outcome data to be collected for participants who discontinue or deviate | Post-discontinuation outcome collection matches the intercurrent-event strategy |
| 26 | Plans for data entry, coding, security, and storage, including data-quality processes | Range checks and double entry implemented as described |
| 27a | Statistical methods to compare groups for primary and secondary outcomes, including harms | Model, covariates (including stratification factors), and effect measure prespecified |
| 27b | Who will be included in each analysis (e.g., all randomised participants) and in which group | Analysis sets defined; ITT population analysed as randomised |
| 27c | How missing data will be handled in the analysis | Primary missing-data assumption and sensitivity analyses stated |
| 27d | Methods for any additional analyses (e.g., subgroup and sensitivity analyses) | Subgroups prespecified with interaction tests; multiplicity strategy stated |

## Methods: monitoring

| Item | Description | Review cue |
|---|---|---|
| 28a | Composition, role, reporting structure, and independence of the data monitoring committee, or why one is not needed | |
| 28b | Interim analyses and stopping guidelines, including who will access interim results and make the final decision to terminate | Alpha-spending function and binding/non-binding futility stated |
| 29 | Frequency and procedures for monitoring trial conduct, or why there is none | |

## Ethics

| Item | Description | Review cue |
|---|---|---|
| 30 | Plans for seeking research ethics committee/IRB approval | |
| 31 | Plans for communicating important protocol modifications to relevant parties | Amendments versioned; SAP changes dated before unblinding |
| 32a | Who will obtain informed consent or assent, and how | |
| 32b | Additional consent provisions for ancillary use of participant data and biological specimens, if applicable | |
| 33 | How personal information will be collected, shared, and maintained to protect confidentiality | No identifiers in shared code, logs, or outputs |
| 34 | Provisions for ancillary and post-trial care, and compensation for trial-related harm | |

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
Current core checklist for randomised trial protocols: 34 numbered items (53 rows counting lettered sub-items) in the sections below. Item numbers and each Description are copied verbatim from Table 1 of the statement. The "Review cue" column is added by this plugin for analysis plans, code, and protocol documents; it is not checklist text.

**Current primary reference:** Chan AW, Boutron I, Hopewell S, et al. SPIRIT 2025 statement: updated guideline for protocols of randomised trials. BMJ. 2025;389:e081477. doi:10.1136/bmj-2024-081477. PMID: 40294953. PMCID: PMC12035670. Published simultaneously in other journals, including JAMA, Lancet, Nature Medicine, and PLOS Medicine.

**Verified against:** SPIRIT 2025 Table 1 in the PMC full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC12035670/.

**Licence:** Checklist text reproduced from Chan et al., BMJ 2025, under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC12035670/ (verified 2026-10-15).

**Superseded:** SPIRIT 2013 is replaced by SPIRIT 2025. Extensions written against SPIRIT 2013 (for example SPIRIT-AI) are applied together with the SPIRIT 2025 core; cite 2025 item numbers for core items.

Use this checklist for trial protocols and statistical analysis plans at the protocol stage. Completed trial reports use CONSORT 2025.

---

## Administrative information

| Item | Description | Review cue |
|---|---|---|
| 1a | Title stating the trial design, population, and interventions, with identification as a protocol | |
| 1b | Structured summary of trial design and methods, including items from the World Health Organization Trial Registration Data Set | Summary matches registry entry |
| 2 | Version date and identifier | Protocol and SAP version/date recorded in the repo |
| 3a | Names, affiliations, and roles of protocol contributors | |
| 3b | Name and contact information for the trial sponsor | |
| 3c | Role of trial sponsor and funders in design, conduct, analysis, and reporting of trial; including any authority over these activities | |
| 3d | Composition, roles, and responsibilities of the coordinating site, steering committee, endpoint adjudication committee, data management team, and other individuals or groups overseeing the trial, if applicable | |

## Open science

| Item | Description | Review cue |
|---|---|---|
| 4 | Name of trial registry, identifying number (with URL), and date of registration. If not yet registered, name of intended registry | |
| 5 | Where the trial protocol and statistical analysis plan can be accessed | SAP exists as a versioned document, not only in code |
| 6 | Where and how the individual de-identified participant data (including data dictionary), statistical code, and any other materials will be accessible | Data dictionary and analysis code location stated |
| 7a | Sources of funding and other support (eg, supply of drugs) | |
| 7b | Financial and other conflicts of interest for principal investigators and steering committee members | |
| 8 | Plans to communicate trial results to participants, healthcare professionals, the public, and other relevant groups (eg, reporting in trial registry, plain language summary, publication) | |

## Introduction

| Item | Description | Review cue |
|---|---|---|
| 9a | Scientific background and rationale, including summary of relevant studies (published and unpublished) examining benefits and harms for each intervention | |
| 9b | Explanation for choice of comparator | |
| 10 | Specific objectives related to benefits and harms | Each objective maps to a prespecified outcome and analysis |

## Methods: patient and public involvement, trial design

| Item | Description | Review cue |
|---|---|---|
| 11 | Details of, or plans for, patient or public involvement in the design, conduct, and reporting of the trial | |
| 12 | Description of trial design including type of trial (eg, parallel group, crossover), allocation ratio, and framework (eg, superiority, equivalence, non-inferiority, exploratory) | Non-inferiority/equivalence margin and its justification stated |

## Methods: participants, interventions, and outcomes

| Item | Description | Review cue |
|---|---|---|
| 13 | Settings (eg, community, hospital) and locations (eg, countries, sites) where the trial will be conducted | |
| 14a | Eligibility criteria for participants | |
| 14b | If applicable, eligibility criteria for sites and for individuals who will deliver the interventions (eg, surgeons, physiotherapists) | |
| 15a | Intervention and comparator with sufficient details to allow replication including how, when, and by whom they will be administered. If relevant, where additional materials describing the intervention and comparator (eg, intervention manual) can be accessed | |
| 15b | Criteria for discontinuing or modifying allocated intervention/comparator for a trial participant (eg, drug dose change in response to harms, participant request, or improving/worsening disease) | |
| 15c | Strategies to improve adherence to intervention/comparator protocols, if applicable, and any procedures for monitoring adherence (eg, drug tablet return, sessions attended) | |
| 15d | Concomitant care that is permitted or prohibited during the trial | |
| 16 | Primary and secondary outcomes, including the specific measurement variable (eg, systolic blood pressure), analysis metric (eg, change from baseline, final value, time to event), method of aggregation (eg, median, proportion), and time point for each outcome | Each outcome's four elements are defined in the SAP and derivation code |
| 17 | How harms are defined and will be assessed (eg, systematically, non-systematically) | |
| 18 | Time schedule of enrolment, interventions (including any run-ins and washouts), assessments, and visits for participants. A schematic diagram is highly recommended (see fig 1 of the statement) | |
| 19 | How sample size was determined, including all assumptions supporting the sample size calculation | Calculation reproducible from stated inputs (effect, variance or event rate, alpha, sidedness, power, dropout, design effect) |
| 20 | Strategies for achieving adequate participant enrolment to reach target sample size | |

## Methods: assignment of interventions

| Item | Description | Review cue |
|---|---|---|
| 21a | Who will generate the random allocation sequence and the method used | Seeded, version-controlled generation code held apart from enrolling staff |
| 21b | Type of randomisation (simple or restricted) and details of any factors for stratification. To reduce predictability of a random sequence, other details of any planned restriction (eg, blocking) should be provided in a separate document that is unavailable to those who enrol participants or assign interventions | Block sizes not exposed in shared code or outputs |
| 22 | Mechanism used to implement the random allocation sequence (eg, central computer/telephone; sequentially numbered, opaque, sealed containers), describing any steps to conceal the sequence until interventions are assigned | |
| 23 | Whether the personnel who will enrol and those who will assign participants to the interventions will have access to the random allocation sequence | |
| 24a | Who will be blinded after assignment to interventions (eg, participants, care providers, outcome assessors, data analysts) | |
| 24b | If blinded, how blinding will be achieved and description of the similarity of interventions | |
| 24c | If blinded, circumstances under which unblinding is permissible, and procedure for revealing a participant’s allocated intervention during the trial | |

## Methods: data collection, management, and analysis

| Item | Description | Review cue |
|---|---|---|
| 25a | Plans for assessment and collection of trial data, including any related processes to promote data quality (eg, duplicate measurements, training of assessors) and a description of trial instruments (eg, questionnaires, laboratory tests) along with their reliability and validity, if known. Reference to where data collection forms can be accessed, if not in the protocol | |
| 25b | Plans to promote participant retention and complete follow-up, including list of any outcome data to be collected for participants who discontinue or deviate from intervention protocols | Post-discontinuation outcome collection matches the intercurrent-event strategy |
| 26 | Plans for data entry, coding, security, and storage, including any related processes to promote data quality (eg, double data entry; range checks for data values). Reference to where details of data management procedures can be accessed, if not in the protocol | Range checks and double entry implemented as described |
| 27a | Statistical methods used to compare groups for primary and secondary outcomes, including harms | Model, covariates (including stratification factors), and effect measure prespecified |
| 27b | Definition of who will be included in each analysis (eg, all randomised participants), and in which group | Analysis sets defined; ITT population analysed as randomised |
| 27c | How missing data will be handled in the analysis | Primary missing-data assumption and sensitivity analyses stated |
| 27d | Methods for any additional analyses (eg, subgroup and sensitivity analyses) | Subgroups prespecified with interaction tests; multiplicity strategy stated |

## Methods: monitoring

| Item | Description | Review cue |
|---|---|---|
| 28a | Composition of data monitoring committee (DMC); summary of its role and reporting structure; statement of whether it is independent from the sponsor and funder; conflicts of interest and reference to where further details about its charter can be found, if not in the protocol. Alternatively, an explanation of why a DMC is not needed | |
| 28b | Explanation of any interim analyses and stopping guidelines, including who will have access to these interim results and make the final decision to terminate the trial | Alpha-spending function and binding/non-binding futility stated |
| 29 | Frequency and procedures for monitoring trial conduct. If there is no monitoring, give explanation | |

## Ethics

| Item | Description | Review cue |
|---|---|---|
| 30 | Plans for seeking research ethics committee/institutional review board approval | |
| 31 | Plans for communicating important protocol modifications to relevant parties | Amendments versioned; SAP changes dated before unblinding |
| 32a | Who will obtain informed consent or assent from potential trial participants or authorised proxies, and how | |
| 32b | Additional consent provisions for collection and use of participant data and biological specimens in ancillary studies, if applicable | |
| 33 | How personal information about potential and enrolled participants will be collected, shared, and maintained in order to protect confidentiality before, during, and after the trial | No identifiers in shared code, logs, or outputs |
| 34 | Provisions, if any, for ancillary and post-trial care, and for compensation to those who suffer harm from trial participation | |

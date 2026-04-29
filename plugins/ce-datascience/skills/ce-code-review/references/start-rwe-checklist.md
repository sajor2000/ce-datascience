# STaRT-RWE Checklist for Real-World Evidence Studies

Structured Template for Planning and Reporting on the Implementation of Real World Evidence (STaRT-RWE).
Checklist for planning and reporting real-world evidence studies intended for regulatory decision-making.

**Primary reference:** Wang SV, Schneeweiss S, RWE DUPLICATE Initiative Working Group, et al. Emulation of Randomized Clinical Trials With Nonrandomized Database Studies: Results of 32 Clinical Trials. JAMA. 2023;330(16):1557-1566. doi:10.1001/jama.2023.19572. For the STaRT-RWE checklist specifically: Wang SV, Pottegard A, Crown W, Norgaard M, Ekstrom CT, Feldman W, et al. HARmonized Protocol Template to Enhance Reproducibility of Hypothesis Evaluating Real-World Evidence Studies on Treatment Effects: A Good Practices Report of a Joint ISPE/ISPOR Task Force. Pharmacoepidemiol Drug Saf. 2021;30(1):44-55. doi:10.1002/pds.5169. PMID: 33210386. For the original STaRT-RWE statement: Wang SV, Pottegard A, Crown W, et al. STaRT-RWE: Structured Template for Planning and Reporting on the Implementation of Real World Evidence Studies. BMJ. 2021;372:n48. doi:10.1136/bmj.n48. PMID: 33472779.

Apply when planning or reporting a real-world evidence (RWE) study on treatment effects using non-interventional data (electronic health records, claims, registries) in contexts where results may inform regulatory, coverage, or clinical guideline decisions. STaRT-RWE is designed to support transparency, pre-specification, and replicability of RWE analyses.

---

## Regulatory and Decision Context

### Item 1 -- Regulatory question specification

**Description:** Specify the regulatory or decision-making question that the RWE study is designed to address. State the intended use of the study results and the relevant regulatory pathway or decision context.

**What to look for in code/outputs:**
- Explicit statement of regulatory or coverage question (label expansion, post-market requirement, coverage decision)
- Intended use of evidence documented (FDA submission, HTA submission, payer negotiation)
- Decision context described (confirmatory evidence, supplementary evidence, exploratory)
- Alignment between the regulatory question and the study's estimand
- Pre-specification of analysis relative to data access (protocol finalized before data lock)

### Item 2 -- Estimand specification

**Description:** Define the target estimand precisely, including the treatment contrast, the target population, the variable of interest (outcome), and the handling of intercurrent events (e.g., treatment discontinuation, competing events).

**What to look for in code/outputs:**
- Estimand framework components documented (treatment, population, outcome, intercurrent events, summary measure)
- Treatment contrast specified (new user of drug A vs. new user of drug B)
- Handling of intercurrent events specified (treatment-policy, hypothetical, composite, while on treatment)
- Estimand distinguishes between the effect of initiating vs. continuing treatment
- Alignment between estimand and the corresponding RCT estimand being emulated (if applicable)

---

## Data Source

### Item 3 -- Data source fitness for purpose

**Description:** Describe the data source(s) used and evaluate their fitness for addressing the regulatory question, including coverage, completeness, accuracy of key variables, and representativeness of the target population.

**What to look for in code/outputs:**
- Data source description (EHR system, claims database, registry, name, coverage dates, population)
- Validation studies referenced for key variable accuracy (diagnosis codes, drug exposure, outcomes)
- Completeness assessment for key covariates (laboratory values, vital signs, clinical variables)
- Population representativeness assessed relative to the indicated patient population
- Linkage to other data sources documented (mortality registry, cancer registry, dispensing data)

### Item 4 -- Data source limitations relevant to the regulatory question

**Description:** Describe specific limitations of the data source that are relevant to the study question, including known misclassification, unmeasured confounders, and potential biases inherent to the data.

**What to look for in code/outputs:**
- Known misclassification rates for exposure or outcome variables documented
- Unmeasured or incompletely measured confounders identified by name
- Channeling bias potential assessed (reasons for treatment selection likely correlated with outcome)
- Healthy user bias and depletion of susceptibles documented as applicable
- Duration of data availability relative to the treatment exposure and outcome window

---

## Study Design

### Item 5 -- Study design selection and justification

**Description:** Specify the study design (cohort, case-control, self-controlled) and justify its appropriateness for the regulatory question and data source. Describe the target trial emulation framework if applicable.

**What to look for in code/outputs:**
- Study design specified with justification relative to the regulatory question
- Active comparator, new user design implemented in cohort construction code
- Target trial emulation protocol documented (eligibility criteria, treatment assignment, follow-up, outcomes)
- Design choice rationale addressing alternative designs and why they were not used
- Prevalent user exclusion implemented and documented in cohort entry code

### Item 6 -- Index date and follow-up definition

**Description:** Define the index date (cohort entry date) for each study participant and the follow-up period, including start, end, and censoring rules. Describe how these definitions align with the regulatory question.

**What to look for in code/outputs:**
- Index date definition coded and documented (first prescription, first diagnosis, first clinical encounter)
- Washout period applied and duration specified
- Follow-up end date rules documented (treatment discontinuation, switching, death, database end, administrative censoring)
- Grace period or treatment gap tolerance specified for exposure continuation definition
- Censoring rules pre-specified and implemented consistently in code

### Item 7 -- Eligibility criteria

**Description:** Define inclusion and exclusion criteria for study participants, specifying how they were operationalized in the data. Justify criteria in relation to the target population of interest.

**What to look for in code/outputs:**
- Inclusion criteria coded with look-back window specifications
- Exclusion criteria coded with diagnosis, procedure, or dispensing code lists
- Minimum continuous enrollment period prior to index date implemented
- Contraindication and prior use exclusions documented
- Age, sex, and clinical eligibility criteria aligned with the approved indication or trial population

---

## Exposure and Comparator

### Item 8 -- Exposure and comparator definition

**Description:** Define the treatment exposure and the comparator, including drug classes, dose ranges, route of administration, and the time window used to classify exposure.

**What to look for in code/outputs:**
- Drug codes (NDC, RxNorm, ATC) for treatment and comparator fully specified
- Dose range restrictions applied and documented
- Route of administration specified where relevant
- New user definition implemented (absence of exposure in washout period confirmed in code)
- Active comparator rationale documented (why this comparator reduces confounding by indication)

### Item 9 -- Handling of treatment changes

**Description:** Define how treatment switching, augmentation, discontinuation, and gap tolerance are handled in the exposure definition and follow-up.

**What to look for in code/outputs:**
- Treatment discontinuation definition coded (days supply plus grace period)
- Switching and augmentation handling specified (censoring, ITT-like, per-protocol-like)
- Grace period duration specified and clinically justified
- Sensitivity analyses with alternative grace period durations planned
- Intent-to-treat and per-protocol analytic approaches compared if applicable

---

## Outcome

### Item 10 -- Outcome definition and validation

**Description:** Define the primary and secondary outcomes, including the code lists and algorithms used for ascertainment. Describe any validation of the outcome definition in the data source.

**What to look for in code/outputs:**
- Outcome definition code lists (ICD-9, ICD-10, CPT, HCPCS, lab codes) fully specified
- Positive predictive value or sensitivity/specificity of outcome algorithm cited or measured
- Outcome ascertainment window defined relative to index date
- Competing events identified and handling strategy specified
- Secondary and safety outcomes defined with the same specificity as the primary outcome

---

## Confounding

### Item 11 -- Confounding assessment and control

**Description:** Describe the approach to identifying, measuring, and controlling for confounding, including the covariate list, measurement windows, and analytic method.

**What to look for in code/outputs:**
- Full covariate list with measurement windows and data source tables
- Confounding control method specified (propensity score, multivariable regression, high-dimensional propensity score, instrumental variable)
- Propensity score model specification documented (variables included, model type)
- Propensity score trimming, matching, or weighting approach specified
- Covariate balance assessment code (standardized mean differences, Love plot)
- High-dimensional propensity score (hdPS) implementation if used

### Item 12 -- Unmeasured confounding assessment

**Description:** Describe methods used to assess the potential impact of unmeasured confounding, including sensitivity analyses, quantitative bias analyses, or negative control analyses.

**What to look for in code/outputs:**
- E-value calculation or quantitative bias analysis code implemented
- Negative control outcome or exposure analysis coded
- Instrument-based sensitivity analysis (e.g., instrumental variable) if applicable
- Array approach or rule-out analysis for unmeasured confounders
- Comparison with RCT results using the target trial emulation framework

---

## Statistical Analysis

### Item 13 -- Primary analysis specification

**Description:** Specify the primary statistical analysis method, the effect measure, and how the analysis accounts for the study design and confounding approach.

**What to look for in code/outputs:**
- Primary analysis model specified (Cox regression, logistic regression, Poisson, G-computation)
- Effect measure defined (hazard ratio, risk ratio, odds ratio, risk difference, rate difference)
- Confidence interval method specified (robust variance, bootstrap, profile likelihood)
- Covariate adjustment or propensity score incorporation in the outcome model documented
- Absolute risk estimates planned alongside relative measures

### Item 14 -- Sensitivity analyses for regulatory purposes

**Description:** Pre-specify sensitivity analyses that address the key assumptions and data limitations of the RWE study, including design choices, exposure definitions, and potential biases.

**What to look for in code/outputs:**
- Sensitivity analyses listed and pre-specified before data access
- Alternative exposure definitions tested (different grace periods, dose thresholds)
- Alternative comparator groups analyzed
- Alternative confounder adjustment approaches compared (PS matching vs. weighting, hdPS vs. standard PS)
- On-treatment vs. intent-to-treat analytic approaches compared
- Restriction analyses for high-adherence subpopulations

### Item 15 -- Subgroup and interaction analyses

**Description:** Pre-specify any subgroup or effect modification analyses, with rationale for the subgroups examined.

**What to look for in code/outputs:**
- Prespecified subgroup variables listed with clinical rationale
- Interaction terms specified in the outcome model for effect modification assessment
- Sample size adequacy for planned subgroup analyses addressed
- Multiplicity adjustment approach specified for subgroup analyses

---

## Transparency and Reproducibility

### Item 16 -- Protocol pre-specification and transparency

**Description:** Confirm that the study protocol was finalized and, ideally, publicly registered before accessing the study data. Describe any deviations from the pre-specified protocol.

**What to look for in code/outputs:**
- Protocol registration reference (ENCEPP, ClinicalTrials.gov, OSF, or other registry)
- Protocol version number and date relative to data access documented
- Deviation log documenting any post-data-access protocol changes with rationale
- Protocol and SAP availability in supplementary materials or repository

### Item 17 -- Analytical transparency

**Description:** Describe the availability of the analysis code, the data, and any analytic tools to support replication or validation of the study results.

**What to look for in code/outputs:**
- Analysis code availability stated (public repository, supplementary materials, available on request)
- Data availability statement including data use agreement constraints
- Software and package versions documented in code or supplementary materials
- Study protocol and analysis plan linked or appended to the report

### Item 18 -- Assumptions documentation

**Description:** Explicitly state the key assumptions underlying the study design, analysis, and interpretation, and describe how each was evaluated or addressed.

**What to look for in code/outputs:**
- No unmeasured confounding assumption stated and evaluated (negative controls, E-value)
- Positivity assumption assessed (covariate overlap between treatment groups)
- Consistency assumption addressed (treatment version irrelevance discussed)
- Exchangeability assumption evaluated (covariate balance statistics reported)
- Any target trial emulation assumptions explicitly stated and justified

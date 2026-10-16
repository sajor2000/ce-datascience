# STaRT-RWE Structured Template for Real-World Evidence Studies

## Contents

- Administrative Information (Tables 1-2)
- Study Design (Figure 1)
- Analytic Study Population (Table 3A-3H)
- Analysis (Tables 4-5)
- Feasibility (Tables 6-7)
- Terminology (Tables 8-9)
- Plugin Review Cues

Structured Template and Reporting Tool for Real World Evidence (STaRT-RWE).
A structured template, not a reporting checklist, for planning and reporting the implementation of real world evidence studies of the safety and effectiveness of treatments. The authors state that "STaRT-RWE is not a reporting checklist but can complement existing checklists"; it is compatible with STROBE, RECORD, RECORD-PE, or TARGET and does not replace them when they apply.

**Current primary reference:** Wang SV, Pinheiro S, Hua W, Arlett P, Uyama Y, Berlin JA, Bartels DB, Kahler KH, Bessette LG, Schneeweiss S. STaRT-RWE: structured template for planning and reporting on the implementation of real world evidence studies. BMJ. 2021;372:m4856. doi:10.1136/bmj.m4856. PMID: 33436424. PMCID: PMC8489282.

**Related protocol-template reference:** Wang SV, Pottegard A, Crown W, et al. HARmonized Protocol Template to Enhance Reproducibility of hypothesis evaluating real-world evidence studies on treatment effects: a good practices report of a joint ISPE/ISPOR task force. Pharmacoepidemiol Drug Saf. 2023;32(1):44-55. doi:10.1002/pds.5507. PMID: 36215113. PMCID: PMC9771861. HARPER builds on earlier transparency efforts including STaRT-RWE; use it for full study protocols.

**Source and licence:** Section names and contents follow the STaRT-RWE template tables in BMJ web appendix 1 (wans059917.ww1.pdf) and the article text (CC BY 4.0, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8489282/). Descriptions condense the template's field lists and instructions without changing their meaning. Section IDs (T1, T3B, ...) are the template's table numbers, not checklist items. The "What to look for in code/outputs" bullets are review cues added by this plugin.

---

## Administrative Information (Tables 1-2)

### STaRT-RWE T1 -- Administrative information

**Description:** Protocol title; objective stated with PICOTS (patient, intervention, comparator, outcome, time horizon, setting) for primary and secondary objectives; protocol registration (identifier, date, site); protocol version (number, date); contributors (name, role, affiliation); funding (grant identifier, source); data use agreement (identifier, data provider, contact); human subjects/ethics approval (submission identifier, approval date, committee).

**What to look for in code/outputs:**
- PICOTS objectives stated before analysis code was written
- Registration identifier (e.g., ENCePP EU PAS, OSF, ClinicalTrials.gov) referenced
- DUA and ethics approval identifiers recorded

### STaRT-RWE T2 -- Version history

**Description:** Log each protocol version with its date, version number, change log, and rationale for the change.

**What to look for in code/outputs:**
- Protocol amendments dated and justified; deviations from the registered protocol listed
- Git history or changelog consistent with the documented versions

---

## Study Design (Figure 1)

### STaRT-RWE F1 -- Design diagram

**Description:** A design diagram (Schneeweiss et al. framework, Ann Intern Med 2019) read from top to bottom in the order of operations used to create the analytic cohort, with assessment windows for washout, inclusion/exclusion, covariates, and follow-up shown relative to the cohort entry date (day 0) using bracketed inclusive or exclusive day ranges.

**What to look for in code/outputs:**
- Design diagram present and consistent with window parameters in config or code
- Day-0 inclusion or exclusion in each window explicit (open vs closed intervals)

---

## Analytic Study Population (Table 3A-3H)

### STaRT-RWE T3A -- Meta-data about data source and software

**Description:** Data source(s); study period; eligible cohort entry period; data extraction date/version; data sampling/extraction criteria; type(s) of data; data linkage (with citation or appendix describing how linkage was done and its performance); data conversion; software used to create the study population. Code algorithms are supplied in machine-readable appendices.

**What to look for in code/outputs:**
- Database name, version, and extraction date pinned in config
- Calendar windows (study period, cohort entry period) defined once and reused
- Common data model or conversion step documented; cohort-building software and version recorded

### STaRT-RWE T3B -- Index date (day 0) defining criterion

**Description:** One row per unique definition of study population entry (e.g., exposure and comparator for an active-comparator study): study population name, day-0 description, number of entries allowed, type of entry, washout window, care setting, code type, diagnosis position, what entry is incident with respect to, whether pre-specified or varied for sensitivity, and the source of the algorithm.

**What to look for in code/outputs:**
- Index-date logic (first qualifying dispensing, new-user washout) in cohort-entry code
- Single vs multiple entries per patient explicit

### STaRT-RWE T3C-T3D -- Inclusion and exclusion criteria

**Description:** For each criterion: conceptual definition and details, order of application relative to selection of the index date (before or after), assessment window, care setting, code type, diagnosis position, study populations it applies to, pre-specified or varied for sensitivity, and source of the algorithm. Defining observable patient time (enrollment in claims; an explicit algorithm for EHR data) is almost always required as an inclusion criterion.

**What to look for in code/outputs:**
- Criteria applied in a documented order relative to index-date selection
- Continuous enrollment or observability rule with allowed gap length

### STaRT-RWE T3E -- Predefined covariates

**Description:** For each covariate: conceptual definition, which analyses adjust for it, type of variable (continuous, categorical, binary), assessment window, care setting, code type, diagnosis position, study populations, pre-specified or varied for sensitivity, and source of the algorithm.

**What to look for in code/outputs:**
- Covariate code lists and assessment windows defined relative to day 0
- Adjustment set per analysis matches the specification

### STaRT-RWE T3F -- Empirically defined covariates

**Description:** If used, the algorithm for empirical covariate identification (e.g., high-dimensional propensity score) and its parameter settings, assessment window, analyses that adjust for them, model specification, care setting and diagnosis-position restrictions, study populations, pre-specified or varied for sensitivity, and source or code for the algorithm.

**What to look for in code/outputs:**
- hdPS or similar implementation with parameters (number of dimensions, covariates per dimension, ranking method) recorded

### STaRT-RWE T3G -- Outcome

**Description:** Conceptual definition and whether it is the primary outcome; outcome type (incident with washout window, or other); care setting; code category; diagnosis position; groups or analyses it applies to; measurement characteristics of the outcome algorithm (e.g., PPV, sensitivity, specificity) from publications or in-study validation; pre-specified or varied for sensitivity; and source of the algorithm.

**What to look for in code/outputs:**
- Outcome code lists with validation reference or in-study PPV
- Incident-outcome washout implemented

### STaRT-RWE T3H -- Follow-up

**Description:** When follow-up begins relative to day 0 and each criterion that ends it: date of outcome, death, disenrollment, day X after index, end of study period, end of exposure (with stockpiling algorithm and grace period), date of add-on to or switch from exposure, or other; whether each was pre-specified or varied for sensitivity.

**What to look for in code/outputs:**
- Censoring logic covers every listed end-of-follow-up criterion
- Grace period and stockpiling parameters for exposure-based censoring documented

---

## Analysis (Tables 4-5)

### STaRT-RWE T4 -- Analysis specification

**Description:** For the primary and each secondary analysis: hypothesis, study population(s), outcome, software, model(s), confounding adjustment method (bivariate, multivariable, propensity score matching with algorithm, ratio and caliper; weighting with weight formula, trimming and truncation; stratification with strata definition; other), missing data methods (missing indicators, complete case, last value carried forward, multiple imputation with variables, other), and subgroup analyses.

**What to look for in code/outputs:**
- Model code matches the specified estimator, adjustment method, and parameters (caliper, trimming)
- Missing-data handling implemented as specified; subgroups pre-specified

### STaRT-RWE T5 -- Sensitivity analyses

**Description:** For each sensitivity analysis: the parameter being varied (and what it changes from), why (what investigators expect to learn), and its strengths and weaknesses compared with the primary analysis.

**What to look for in code/outputs:**
- Each sensitivity analysis maps to one varied parameter with a stated rationale
- Parameters marked "varied for sensitivity" in Table 3 have a matching run

---

## Feasibility (Tables 6-7)

### STaRT-RWE T6 -- Attrition table

**Description:** Number of patients excluded and remaining after applying each inclusion/exclusion criterion sequentially, for each exposure group. (The appendix labels this table "Table 5" in its body but "Table 6" in its table of contents.)

**What to look for in code/outputs:**
- Sequential attrition counts by exposure group generated by the cohort-building code

### STaRT-RWE T7 -- Power and sample size calculation

**Description:** Software used, what is calculated (power, sample size, or detectable difference), population assumptions and statistical parameters with primary value, range considered, and source for each estimated parameter.

**What to look for in code/outputs:**
- Power or sample size script with assumptions and their sources

---

## Terminology (Tables 8-9)

### STaRT-RWE T8-T9 -- Glossary and abbreviations

**Description:** Glossary of terms (e.g., index date, assessment window, washout window, grace window, stockpiling algorithm, observable time, study period, treatment episode) and list of abbreviations used in the template.

**What to look for in code/outputs:**
- Terms used in code comments and outputs match the glossary definitions

---

## Plugin Review Cues

These cues come from the earlier version of this file. They are not STaRT-RWE template sections; use them only as prompts when reviewing an RWE treatment-effect study.

- **Estimand:** treatment contrast, target population, outcome, and handling of intercurrent events stated (HARPER covers estimands explicitly).
- **Data fitness for purpose:** coverage, completeness, and accuracy of key variables assessed, and data-source limitations stated.
- **Unmeasured confounding:** E-values, quantitative bias analysis, or negative-control outcomes or exposures.
- **Transparency:** analysis code and data access statement; protocol registered before data access.

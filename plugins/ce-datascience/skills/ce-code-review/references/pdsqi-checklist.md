# PDSQI-9 Checklist for Prediction Model Dataset Quality

AI EXTENSION checklist for assessing the quality of datasets used in predictive model studies, particularly those built from electronic health records (EHR) and administrative data.

**Base guideline:** TRIPOD+AI (when building prediction models from EHR or administrative data)

**Primary reference:** Goldstein BA, Cerullo M, Engstrom B, et al. Development and performance of a clinical prediction model dataset quality indicator. Unpublished / pre-print. Citation: The PDSQI-9 (Prediction model Data Set Quality Indicator) is a 9-item tool for evaluating the quality of datasets underlying clinical prediction models. PubMed PMID not available -- the tool has been referenced in the prediction model methodology literature and is used as a complement to TRIPOD reporting.

This checklist supplements TRIPOD+AI for studies using EHR or administrative datasets. Apply both checklists together when developing prediction models from routinely collected health data.

---

## Data Source

### Item 1 -- Data source documentation

**Description:** Document the data source including the type of system (EHR, claims, registry), vendor, and data model.

**What to look for in code/outputs:**
- Data source specification (Epic, Cerner, claims database, national registry)
- Common data model documentation if applicable (OMOP CDM, PCORnet, i2b2)
- Data extraction method (SQL queries, API calls, flat file exports)
- Data governance and access control documentation
- Database version and extraction date logged

### Item 2 -- Cohort definition

**Description:** Clearly define the study cohort including the index event, eligibility criteria, and how patients were identified in the data.

**What to look for in code/outputs:**
- Index event definition code (admission date, diagnosis date, procedure date)
- Inclusion and exclusion criteria implemented in SQL or data processing code
- Patient identification methodology (diagnosis codes, encounter types, problem lists)
- Cohort construction flowchart with patient counts at each step
- Sensitivity analysis for alternative cohort definitions

---

## Temporal Coverage

### Item 3 -- Temporal coverage and granularity

**Description:** Report the time period covered by the dataset, the granularity of time stamps, and any temporal gaps.

**What to look for in code/outputs:**
- Date range of the dataset specified in data extraction code
- Temporal granularity documentation (date-level, hour-level, encounter-level)
- Assessment of temporal gaps or missing periods in data collection
- Documentation of system changes (EHR transitions, coding system updates) during the study period
- Calendar-time distribution of observations shown

---

## Missing Data

### Item 4 -- Missing data characterization

**Description:** Characterize the extent and patterns of missing data, including the missing data mechanism and its potential impact on the prediction model.

**What to look for in code/outputs:**
- Missing data summary by variable (count, percentage, pattern visualization)
- Missing data mechanism assessment (MCAR, MAR, MNAR with clinical reasoning)
- Comparison of patients with vs. without missing data on key characteristics
- Missing data pattern analysis (monotone, arbitrary, variable-specific)
- Documentation of whether missingness is informative (e.g., lab not ordered implies low clinical suspicion)

---

## Variable Definitions

### Item 5 -- Variable definitions and coding

**Description:** Provide precise definitions for all variables, including the code sets used, look-back windows, and any composite variable construction.

**What to look for in code/outputs:**
- Variable derivation code with ICD-10, CPT, LOINC, RxNorm, or SNOMED code lists
- Look-back window specifications for each variable (e.g., comorbidities within 1 year)
- Composite variable construction logic (e.g., Charlson score calculation)
- Documentation of code set validation against chart review when available
- Variable data dictionary with definitions, data types, and value ranges

---

## Outcome Ascertainment

### Item 6 -- Outcome ascertainment

**Description:** Describe how the outcome was ascertained in the data, including the code sets or algorithms used and any validation of outcome accuracy.

**What to look for in code/outputs:**
- Outcome definition code using specified algorithms or code sets
- Validation of outcome ascertainment against gold standard (chart review, registry linkage)
- Sensitivity and PPV of the outcome algorithm if available from published validation studies
- Censoring rules for time-to-event outcomes (transfer, death, loss to follow-up)
- Documentation of outcome completeness (capture rate, follow-up rate)

---

## Data Linkage

### Item 7 -- Data linkage

**Description:** If multiple data sources were linked, describe the linkage method, match rate, and potential linkage errors.

**What to look for in code/outputs:**
- Linkage method documentation (deterministic, probabilistic, unique identifiers)
- Match rate and unmatched case analysis
- Linkage variable specification (MRN, SSN, name/DOB matching)
- Assessment of differential linkage rates across subgroups
- Documentation of linkage error rates and their potential impact

---

## Data Dictionaries

### Item 8 -- Data dictionary availability

**Description:** Provide or reference a comprehensive data dictionary defining every variable in the analytic dataset.

**What to look for in code/outputs:**
- Data dictionary file (CSV, Excel, or documentation) listing all variables
- Variable name, definition, data type, units, and value range for each field
- Derivation logic for computed variables cross-referenced to source fields
- Documentation of coding system versions (ICD-9 to ICD-10 transitions)
- Data dictionary version control and update history

---

## Data Version Control

### Item 9 -- Data version control and reproducibility

**Description:** Document the dataset version, extraction date, and any changes to the dataset over the course of the study.

**What to look for in code/outputs:**
- Dataset version identifier or extraction timestamp logged in code
- Documentation of any data corrections or updates applied during the study
- Data freeze date specification and protocol for handling late-arriving data
- Extraction query versioning (stored SQL queries with timestamps)
- Checksums or row counts logged at each stage of data processing for reproducibility

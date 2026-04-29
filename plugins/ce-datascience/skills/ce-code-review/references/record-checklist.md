# RECORD Checklist for Studies Using Routinely-Collected Health Data

REporting of studies Conducted using Observational Routinely-collected health Data (RECORD).
13-item extension of the STROBE checklist for studies using EHR, administrative claims, registry, or other routinely-collected data sources.

**Primary reference:** Benchimol EI, Smeeth L, Guttmann A, Harron K, Moher D, Petersen I, Sorensen HT, von Elm E, Langan SM; RECORD Working Committee. The REporting of studies Conducted using Observational Routinely-collected health Data (RECORD) statement. PLoS Med. 2015;12(10):e1001885. doi:10.1371/journal.pmed.1001885. PMID: 26440803.

This checklist supplements STROBE -- apply alongside the base STROBE 22-item checklist. RECORD items are numbered to correspond with their parent STROBE items (e.g., RECORD 6.1 supplements STROBE Item 6).

---

## Title and Abstract

### RECORD 1.1 -- Data source in title/abstract

**Description:** The type of data used should be specified in the title or abstract. When possible, the name of the databases used should be included.

**What to look for in code/outputs:**
- Title or abstract explicitly names the data source (e.g., "using Medicare claims data", "from the Clinical Practice Research Datalink")
- Report template includes a data source field in the abstract

### RECORD 1.2 -- Region and timeframe in abstract

**Description:** If applicable, the geographic region and timeframe within which the study took place should be reported in the title or abstract.

**What to look for in code/outputs:**
- Abstract includes calendar period (e.g., "2015-2022") and jurisdiction (e.g., "Ontario, Canada")
- Date filters in cohort code match the stated timeframe

### RECORD 1.3 -- Record linkage in abstract

**Description:** If linkage between databases was conducted for the study, this should be clearly stated in the title or abstract.

**What to look for in code/outputs:**
- Abstract mentions linkage (e.g., "linked hospital discharge records to prescription claims")
- Data loading code that joins across distinct source tables or databases

---

## Methods

### RECORD 4.1 -- Database descriptors

**Description:** Authors should describe in detail the type of data used in the study with reference to the database website or descriptive paper. Report the database version or data extraction date.

**What to look for in code/outputs:**
- Data source documentation: database name, custodian, purpose, population coverage, coding system (ICD-10, READ, SNOMED)
- Data extraction date or database version documented in config or comments
- Reference to a published database descriptor paper

### RECORD 6.1 -- Selection from database

**Description:** The methods of study population selection (such as codes or algorithms used to identify subjects) should be listed in detail. If this is not possible, an explanation should be provided.

**What to look for in code/outputs:**
- Complete code lists (ICD, CPT, LOINC, SNOMED) used to identify the study population
- Phenotyping algorithm with validation reference
- Code list provided in appendix, supplement, or version-controlled file

### RECORD 6.2 -- Eligibility periods

**Description:** Any validation studies of the codes or algorithms used to select the population should be referenced. If validation was conducted for this study and target of the validation was not the same study population, this should be clearly stated.

**What to look for in code/outputs:**
- Citation of validation studies for phenotyping codes
- PPV/sensitivity/specificity of the code-based case definition
- If no validation exists, explicit statement of this limitation

### RECORD 6.3 -- Database follow-up

**Description:** If the study involved linkage of databases, consider use of a flow diagram or other graphical display to demonstrate the data linkage process, including the number of individuals with linked data at each stage.

**What to look for in code/outputs:**
- Linkage flow diagram or waterfall showing record counts before and after linkage
- Linkage rate reported (percentage successfully linked)
- Handling of unlinked records documented

### RECORD 7.1 -- Code lists

**Description:** A complete list of codes and algorithms used to classify exposures, outcomes, confounders, and effect modifiers should be provided. If these cannot be reported, an explanation should be provided.

**What to look for in code/outputs:**
- Code lists in supplement, appendix, or version-controlled files (CSV, YAML, JSON)
- Vocabulary version pinning (e.g., "ICD-10-CM 2024", "SNOMED CT 2024-03-01")
- Algorithmic definitions with logic (e.g., "2+ diagnoses within 365 days")

### RECORD 8.1 -- Data cleaning and validation

**Description:** The methods used to determine data validity should be described. Where possible, describe the methods used to clean the data.

**What to look for in code/outputs:**
- Data cleaning steps documented (duplicate removal, impossible values, date logic checks)
- Validation against external gold standard or internal consistency checks
- Data quality metrics reported (completeness, plausibility, concordance)

---

## Results

### RECORD 12.1 -- Sensitivity analyses for misclassification

**Description:** Authors should describe the extent to which the investigators had access to the data used in the study. Describe any data cleaning or processing steps.

**What to look for in code/outputs:**
- Sensitivity analyses for exposure or outcome misclassification
- Alternative code definitions tested
- Probabilistic bias analysis or quantitative bias analysis code

### RECORD 12.2 -- Data access restrictions

**Description:** Describe any restrictions that may have affected the data available for use, such as data governance policies.

**What to look for in code/outputs:**
- Documentation of data access restrictions (date range limits, variable suppression, cell-size restrictions)
- IRB/ethics approval referenced
- Data use agreement constraints noted

### RECORD 12.3 -- Linked vs unlinked analysis

**Description:** Where data linkage was used, describe the quality of the linkage.

**What to look for in code/outputs:**
- Linkage quality metrics (sensitivity, specificity, false match rate)
- Comparison of linked vs unlinked populations
- Sensitivity analysis restricted to high-quality linkages

---

## Discussion

### RECORD 13.1 -- Flowchart with linkage

**Description:** Provide a flowchart that includes information on how many records were excluded at each step, particularly those excluded due to linkage failure.

**What to look for in code/outputs:**
- CONSORT-style flowchart generation code that includes linkage-specific exclusion counts
- Row counts at each filtering and linkage step
- Separate reporting of exclusions due to data quality vs clinical eligibility

### RECORD 19.1 -- Data access and cleaning

**Description:** Discuss the implications of using data that were not created or collected to answer the specific research question(s). Include discussion of misclassification bias, unmeasured confounding, missing data, and changing eligibility over time, as they relate to the database.

**What to look for in code/outputs:**
- Limitation section addressing secondary use of data (data not collected for research purposes)
- Discussion of coding incentives, administrative purpose, and potential systematic biases
- Acknowledgment of unmeasured confounders specific to the data source

---

## Other Information

### RECORD 22.1 -- Data access statement

**Description:** Authors should provide information on how to access any supplemental information such as the study protocol, raw data, or programming code.

**What to look for in code/outputs:**
- Data access statement (e.g., "Data available upon request to [custodian]")
- Code availability statement with repository link
- Supplementary materials referenced (code lists, algorithms, validation studies)

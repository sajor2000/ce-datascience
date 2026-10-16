# RECORD Checklist for Studies Using Routinely-Collected Health Data

## Contents

- Title and Abstract
- Methods
- Results
- Discussion
- Other Information

REporting of studies Conducted using Observational Routinely-collected health Data (RECORD).
13-item extension of the STROBE checklist for studies using EHR, administrative claims, registry, or other routinely-collected data sources: 1.1-1.3, 6.1-6.3, 7.1, 12.1-12.3, 13.1, 19.1, 22.1.

**Primary reference:** Benchimol EI, Smeeth L, Guttmann A, Harron K, Moher D, Petersen I, Sorensen HT, von Elm E, Langan SM; RECORD Working Committee. The REporting of studies Conducted using Observational Routinely-collected health Data (RECORD) statement. PLoS Med. 2015;12(10):e1001885. doi:10.1371/journal.pmed.1001885. PMID: 26440803.

**Source and licence:** Item text is quoted verbatim from the RECORD checklist, http://www.record-statement.org/Files/checklist/RECORD%20Checklist.pdf (CC BY), and the PLoS Med statement (CC BY 4.0, PMC4595218). The "What to look for in code/outputs" bullets are review cues added by this plugin, not checklist text.

This checklist supplements STROBE -- apply alongside the base STROBE 22-item checklist. RECORD items are numbered to correspond with their parent STROBE items (e.g., RECORD 6.1 supplements STROBE Item 6). When RECORD is paired with TARGET instead of STROBE, map 6.x and 12.x to TARGET items 5 and 7.

---

## Title and Abstract

### RECORD 1.1 -- Type of data and database names

**Description:** The type of data used should be specified in the title or abstract. When possible, the name of the databases used should be included.

**What to look for in code/outputs:**
- Title or abstract explicitly names the data source (e.g., "using Medicare claims data", "from the Clinical Practice Research Datalink")
- Report template includes a data source field in the abstract

### RECORD 1.2 -- Region and timeframe

**Description:** If applicable, the geographic region and timeframe within which the study took place should be reported in the title or abstract.

**What to look for in code/outputs:**
- Abstract includes calendar period (e.g., "2015-2022") and jurisdiction (e.g., "Ontario, Canada")
- Date filters in cohort code match the stated timeframe

### RECORD 1.3 -- Linkage in title or abstract

**Description:** If linkage between databases was conducted for the study, this should be clearly stated in the title or abstract.

**What to look for in code/outputs:**
- Abstract mentions linkage (e.g., "linked hospital discharge records to prescription claims")
- Data loading code that joins across distinct source tables or databases

---

## Methods

### RECORD 6.1 -- Population selection codes and algorithms

**Description:** The methods of study population selection (such as codes or algorithms used to identify subjects) should be listed in detail. If this is not possible, an explanation should be provided.

**What to look for in code/outputs:**
- Complete code lists (ICD, CPT, LOINC, SNOMED) used to identify the study population
- Phenotyping algorithm logic in version-controlled files
- Code list provided in appendix, supplement, or repository

### RECORD 6.2 -- Validation of selection codes and algorithms

**Description:** Any validation studies of the codes or algorithms used to select the population should be referenced. If validation was conducted for this study and not published elsewhere, detailed methods and results should be provided.

**What to look for in code/outputs:**
- Citation of validation studies for phenotyping codes
- PPV/sensitivity/specificity of the code-based case definition
- If validation was done in this study: chart-review sampling, reference standard, and results reported

### RECORD 6.3 -- Linkage flow diagram

**Description:** If the study involved linkage of databases, consider use of a flow diagram or other graphical display to demonstrate the data linkage process, including the number of individuals with linked data at each stage.

**What to look for in code/outputs:**
- Linkage flow diagram or waterfall showing record counts before and after linkage
- Linkage rate reported (percentage successfully linked)

### RECORD 7.1 -- Codes and algorithms for variables

**Description:** A complete list of codes and algorithms used to classify exposures, outcomes, confounders, and effect modifiers should be provided. If these cannot be reported, an explanation should be provided.

**What to look for in code/outputs:**
- Code lists in supplement, appendix, or version-controlled files (CSV, YAML, JSON)
- Vocabulary version pinning (e.g., "ICD-10-CM 2024", "SNOMED CT 2024-03-01")
- Algorithmic definitions with logic (e.g., "2+ diagnoses within 365 days")

### RECORD 12.1 -- Data access

**Description:** Authors should describe the extent to which the investigators had access to the database population used to create the study population.

**What to look for in code/outputs:**
- Statement of whether investigators had full database access or a pre-extracted cut supplied by the data custodian
- Data use agreement constraints (date range limits, variable suppression, cell-size restrictions) noted
- Database version or data extraction date documented in config or comments

### RECORD 12.2 -- Data cleaning methods

**Description:** Authors should provide information on the data cleaning methods used in the study.

**What to look for in code/outputs:**
- Data cleaning steps documented (duplicate removal, impossible values, date logic checks)
- Data quality metrics reported (completeness, plausibility, concordance)

### RECORD 12.3 -- Linkage methods and quality

**Description:** State whether the study included person-level, institutional-level, or other data linkage across two or more databases. The methods of linkage and methods of linkage quality evaluation should be provided.

**What to look for in code/outputs:**
- Linkage level (person, institution) and method (deterministic, probabilistic) documented
- Linkage quality metrics (match rate, false-match rate, comparison of linked vs unlinked records)

---

## Results

### RECORD 13.1 -- Study population selection

**Description:** Describe in detail the selection of the persons included in the study (i.e., study population selection) including filtering based on data quality, data availability and linkage. The selection of included persons can be described in the text and/or by means of the study flow diagram.

**What to look for in code/outputs:**
- Row counts at each filtering and linkage step
- Separate reporting of exclusions due to data quality, data availability, or linkage vs clinical eligibility
- Flowchart generation code, if a diagram is used

---

## Discussion

### RECORD 19.1 -- Limitations of routinely collected data

**Description:** Discuss the implications of using data that were not created or collected to answer the specific research question(s). Include discussion of misclassification bias, unmeasured confounding, missing data, and changing eligibility over time, as they pertain to the study being reported.

**What to look for in code/outputs:**
- Limitation section addressing secondary use of data (data not collected for research purposes)
- Sensitivity analyses for misclassification (alternative code definitions, quantitative bias analysis) cited in the discussion
- Acknowledgment of unmeasured confounders specific to the data source

---

## Other Information

### RECORD 22.1 -- Accessibility of protocol, raw data, and programming code

**Description:** Authors should provide information on how to access any supplemental information such as the study protocol, raw data, or programming code.

**What to look for in code/outputs:**
- Data access statement (e.g., "Data available upon request to [custodian]")
- Code availability statement with repository link
- Supplementary materials referenced (code lists, algorithms, validation studies)

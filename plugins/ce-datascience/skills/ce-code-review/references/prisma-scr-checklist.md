# PRISMA-ScR Checklist for Scoping Reviews

Preferred Reporting Items for Systematic Reviews and Meta-Analyses extension for Scoping Reviews (PRISMA-ScR).
22-item checklist applicable to scoping reviews that map the extent, range, and nature of evidence on a topic.

**Primary reference:** Tricco AC, Lillie E, Zarin W, et al. PRISMA Extension for Scoping Reviews (PRISMA-ScR): checklist and explanation. Ann Intern Med. 2018;169(7):467-473. doi:10.7326/M18-0850. PMID: 30178033.

Each item includes the section, description, and what to look for in analysis code and outputs
when evaluating compliance. Items marked with an asterisk (*) are additions to the base PRISMA checklist.

---

## Title

### Item 1 -- Title

**Description:** Identify the report as a scoping review.

**What to look for in code/outputs:**
- Report title or rendered document header explicitly including "scoping review"
- Title generation code or manuscript template that includes the study type designation
- Output documents whose title clearly differentiates the work from a systematic review or narrative review

---

## Abstract

### Item 2 -- Structured summary

**Description:** Provide a structured summary that includes the background, objectives, eligibility criteria, sources of evidence, charting methods, results, and conclusions that relate to the review questions and objectives.

**What to look for in code/outputs:**
- Abstract template or generation code with structured sections covering all required elements
- Explicit mention of the concept being mapped and the context (population, concept, context framework)
- Key quantitative findings (number of sources, date range, study designs) in the abstract output
- Rendered summary that identifies knowledge gaps or areas requiring future research

---

## Introduction

### Item 3 -- Rationale*

**Description:** Describe the rationale for the review in the context of what is already known, explaining why the review questions or objectives lend themselves to a scoping review approach.

**What to look for in code/outputs:**
- Documentation explicitly justifying the scoping review methodology over a systematic review or meta-analysis
- Text distinguishing the current goal (mapping evidence, identifying gaps) from synthesizing intervention effectiveness
- References to prior reviews and the specific gap or breadth of topic that motivates the scoping approach
- Report sections or comments explaining the appropriateness of scoping review for an emerging or heterogeneous evidence base

### Item 4 -- Objectives*

**Description:** Provide an explicit statement of the questions and objectives being addressed with reference to their key elements (e.g., population or participants, concept, and context) or other relevant key elements used to conceptualize the review questions and/or objectives.

**What to look for in code/outputs:**
- PICO or PCC (population, concept, context) framework documented in protocol, report preamble, or config file
- Explicit research question statements mapping to population/participants, concept, and context
- Search strategy documentation that operationalizes the stated objectives
- Objectives framed as mapping or describing rather than assessing effectiveness or synthesizing effect sizes

---

## Methods

### Item 5 -- Protocol and registration

**Description:** Indicate whether a review protocol exists; state if and where it can be accessed (e.g., a web address); and if available, provide registration information including the registration number.

**What to look for in code/outputs:**
- Protocol document path or URL referenced in analysis code or report
- PROSPERO, OSF, or institutional registration number in report metadata or methods section
- Version-controlled protocol files in the project repository
- Documentation of any deviations from the registered protocol with explanations

### Item 6 -- Eligibility criteria

**Description:** Specify characteristics of the sources of evidence used as eligibility criteria (e.g., years considered, language, and publication status) and provide a rationale.

**What to look for in code/outputs:**
- Inclusion and exclusion criteria for study designs, languages, date ranges, and publication types in code or documentation
- Rationale for chosen eligibility criteria referencing the review scope and concept being mapped
- Code or decision rules that apply eligibility criteria consistently across sources
- Documentation of whether grey literature, conference abstracts, or unpublished studies were included

### Item 7 -- Information sources

**Description:** Describe all information sources in the search (e.g., databases with dates of coverage and contact with authors to identify additional sources) and the date the most recent search was executed.

**What to look for in code/outputs:**
- List of databases searched (MEDLINE, Embase, CINAHL, etc.) with coverage dates and search execution dates
- Code or documentation covering supplementary search methods (hand-searching, citation chasing, grey literature sources)
- Expert contact or key informant consultation documented in the methods
- Date of the most recent search execution recorded in code metadata or report header

### Item 8 -- Search

**Description:** Present the full electronic search strategy for at least one database, including any limits used, such that it could be repeated.

**What to look for in code/outputs:**
- Full search string for at least one database included in supplementary materials or methods appendix
- Boolean operators, MeSH terms, free-text terms, and field tags documented
- Any limits applied (date, language, publication type) specified in the search strategy
- Search strings stored as reproducible code or query files

### Item 9 -- Selection of sources of evidence*

**Description:** State the process for selecting sources of evidence (i.e., screening and eligibility) included in the scoping review.

**What to look for in code/outputs:**
- Documentation of the screening process: title/abstract screening followed by full-text review
- Number of reviewers at each stage and any conflict resolution process described
- Screening tool or data extraction platform referenced (Covidence, Rayyan, DistillerSR)
- Pilot testing of eligibility criteria documented prior to full screening

### Item 10 -- Data charting process*

**Description:** Describe the methods of charting data from the included sources of evidence (e.g., calibrated forms or forms that have been pilot-tested by the team before widespread use, and whether data charting was done independently or in duplicate) and any processes for obtaining and confirming data from investigators.

**What to look for in code/outputs:**
- Data charting form or template referenced or included in supplementary materials
- Documentation of whether charting was done independently by two reviewers and how conflicts were resolved
- Pilot testing of the charting form before full extraction documented
- Process for contacting study authors to confirm or supplement charted data described

### Item 11 -- Data items*

**Description:** List and define all variables for which data were sought and any assumptions and simplifications made.

**What to look for in code/outputs:**
- Data dictionary or codebook listing all charted variables with definitions
- Code that maps extracted data fields to analysis variables
- Documentation of assumptions made when source information was incomplete or ambiguous
- Simplifications applied to heterogeneous data types (e.g., collapsing outcome categories) justified and recorded

### Item 12 -- Critical appraisal of individual sources of evidence*

**Description:** If done, provide a rationale for conducting a critical appraisal of included sources of evidence; describe the methods used and how this information was used in any data synthesis.

**What to look for in code/outputs:**
- Documentation of whether formal quality appraisal was performed and the stated rationale
- Quality appraisal tool referenced when appraisal was conducted (noting that quality appraisal is optional in scoping reviews)
- Explanation of how quality appraisal findings influenced data synthesis, narrative, or conclusions
- Acknowledgment that scoping reviews do not typically exclude studies based on methodological quality

### Item 13 -- Synthesis of results

**Description:** Describe the methods of handling and summarizing the data that were charted.

**What to look for in code/outputs:**
- Narrative synthesis approach described (thematic analysis, descriptive mapping, content analysis)
- Code or documentation for tabulating study characteristics (design, setting, population, concept)
- Quantitative summary methods (counts, frequencies, proportions) used to characterize the evidence base
- Absence of pooled meta-analysis consistent with scoping review purpose; if meta-analysis is performed, rationale provided

---

## Results

### Item 14 -- Selection of sources of evidence

**Description:** Give numbers of sources of evidence screened, assessed for eligibility, and included in the review, with reasons for exclusions at each stage, ideally using a flow diagram.

**What to look for in code/outputs:**
- PRISMA-style flow diagram generation code with counts at each stage (records identified, deduplicated, screened, assessed, included)
- Reasons for exclusion at full-text stage with counts per reason
- Final included source count consistent across flow diagram, results text, and data tables
- Kappa or percent agreement statistics for inter-rater reliability at screening stages

### Item 15 -- Characteristics of sources of evidence*

**Description:** For each source of evidence, present characteristics for which data were charted and provide the citations.

**What to look for in code/outputs:**
- Table summarizing characteristics of all included sources (author, year, country, design, population, concept, context, key findings)
- Code generating the characteristics table from the charted data file
- Complete citation information for all included sources
- Logical consistency between the characteristics table and the synthesis narrative

### Item 16 -- Critical appraisal within sources of evidence

**Description:** If done, present data on critical appraisal of included sources of evidence (see item 12).

**What to look for in code/outputs:**
- Quality appraisal scores or ratings table if appraisal was performed
- Narrative interpretation of quality findings and their implications for the review conclusions
- Consistency between reported appraisal approach in methods and results presented

### Item 17 -- Results of individual sources of evidence

**Description:** For each included source of evidence, present the relevant data that were charted that relate to the review questions and objectives.

**What to look for in code/outputs:**
- Per-source data table or appendix with charted data aligned to review objectives
- Code that outputs source-level results alongside aggregate summaries
- Data items presented consistently for all sources, with missing data noted
- Source-level data traceable to the final synthesis narrative

### Item 18 -- Synthesis of results

**Description:** Summarize and/or present the charting results as they relate to the review questions and objectives.

**What to look for in code/outputs:**
- Narrative synthesis organized by the concept dimensions, population subgroups, or contexts identified in the objectives
- Tables or figures summarizing the distribution of evidence by design, geography, date, setting, or population
- Counts and proportions describing the evidence landscape (e.g., proportion of studies from high-income countries)
- Identification of patterns, gaps, and heterogeneity across included sources

---

## Discussion

### Item 19 -- Summary of evidence*

**Description:** Summarize the main results (including an overview of concepts, themes, and types of evidence available), link to the review questions and objectives, and consider the relevance to key stakeholders.

**What to look for in code/outputs:**
- Discussion sections linking findings back to the stated objectives and concept framework
- Summary of the nature and extent of the evidence base mapped
- Explicit identification of knowledge gaps and areas where evidence is sparse or absent
- Consideration of implications for policy, practice, or future research in the context of the mapped concept

### Item 20 -- Limitations

**Description:** Discuss the limitations of the scoping review process.

**What to look for in code/outputs:**
- Limitation sections addressing search comprehensiveness, language restrictions, grey literature coverage, and charting consistency
- Discussion of the impact of excluding quality appraisal on the conclusions
- Acknowledgment of heterogeneity in how the concept is defined across included sources
- Documentation of any deviations from the protocol and their potential effect on results

### Item 21 -- Conclusions

**Description:** Provide a general interpretation of the results with respect to the review questions and objectives, as well as potential implications and/or next steps.

**What to look for in code/outputs:**
- Conclusion statements that directly address the stated objectives and concept being mapped
- Explicit identification of areas requiring systematic review, primary research, or policy action
- Language framing conclusions as mapping the evidence landscape rather than establishing effectiveness
- Recommended next steps grounded in the identified knowledge gaps

---

## Funding

### Item 22 -- Funding

**Description:** Describe sources of funding for the included sources of evidence, as well as sources of funding for the scoping review. Describe the role of the funders of the scoping review.

**What to look for in code/outputs:**
- Funding acknowledgment section in report templates naming the funding source and grant numbers
- Explicit role-of-funder statement (data access, analytical oversight, publication rights)
- Conflict of interest disclosures for the review team
- Funding sources of included primary studies summarized or noted when relevant to interpretation

# PRISMA-ScR Checklist for Scoping Reviews

## Contents

- Title
- Abstract
- Introduction
- Methods
- Results
- Discussion
- Funding

Preferred Reporting Items for Systematic Reviews and Meta-Analyses extension for Scoping Reviews (PRISMA-ScR).
22-item checklist (20 essential items plus 2 optional items, per the statement abstract) applicable to scoping reviews and evidence maps that map the extent, range, and nature of evidence on a topic.

**Primary reference:** Tricco AC, Lillie E, Zarin W, et al. PRISMA Extension for Scoping Reviews (PRISMA-ScR): checklist and explanation. Ann Intern Med. 2018;169(7):467-473. doi:10.7326/M18-0850. PMID: 30178033.

**Source and licence:** Item numbers and order follow the official PRISMA-ScR fillable checklist (https://www.prisma-statement.org/s/PRISMA-ScR-Fillable-Checklist_11Sept2019.pdf); all 22 items and paraphrases were re-checked on 2026-10-15 against a supplied copy of the fillable checklist (2 pages, citing Ann Intern Med 169:467-473). The checklist and article are copyright of the American College of Physicians and carry no open licence, so the descriptions are faithful paraphrases: every element of each official item is kept and nothing is added. Use the official PDF for verbatim wording. An updated PRISMA-ScR is in development (Tricco et al. J Clin Epidemiol 2026, PMID 42107664); until it is published, this 2018 checklist is current.

The official checklist never uses the word "optional". Items 12 and 16 (critical appraisal) are the only items worded "If done", and its critical-appraisal footnote ties the term to those items (it prints "items 12 and 19", but item 19 is the summary of evidence, so this reads as a misprint for 16). They are marked "(Optional)" below. The checklist is consistent with this mapping but does not state it, so it remains UNVERIFIED against the primary article, whose full text has not been read.

Each item includes the section, description, and what to look for in analysis code and outputs
when evaluating compliance. Item wording is adapted from PRISMA for scoping reviews; the official footnotes define "sources of evidence" (any type of evidence or data source, not only studies), "data charting" (data extraction), and "critical appraisal" (used instead of "risk of bias").

---

## Title

### Item 1 -- Title

**Description:** State in the report that it is a scoping review.

**What to look for in code/outputs:**
- Report title or rendered document header explicitly including "scoping review"
- Title generation code or manuscript template that includes the study type designation
- Output documents whose title clearly differentiates the work from a systematic review or narrative review

---

## Abstract

### Item 2 -- Structured summary

**Description:** Give a structured summary covering, as applicable, the background, objectives, eligibility criteria, sources of evidence, charting methods, results, and conclusions, each related to the review questions and objectives.

**What to look for in code/outputs:**
- Abstract template or generation code with structured sections covering all required elements
- Explicit mention of the concept being mapped and the context (population, concept, context framework)
- Key quantitative findings (number of sources, date range, study designs) in the abstract output
- Rendered summary that identifies knowledge gaps or areas requiring future research

---

## Introduction

### Item 3 -- Rationale

**Description:** Explain why the review was done in light of existing knowledge, and why its questions or objectives suit a scoping review approach.

**What to look for in code/outputs:**
- Documentation explicitly justifying the scoping review methodology over a systematic review or meta-analysis
- Text distinguishing the current goal (mapping evidence, identifying gaps) from synthesizing intervention effectiveness
- References to prior reviews and the specific gap or breadth of topic that motivates the scoping approach
- Report sections or comments explaining the appropriateness of scoping review for an emerging or heterogeneous evidence base

### Item 4 -- Objectives

**Description:** State the review questions and objectives explicitly, naming their key elements (e.g., population or participants, concepts, and context) or any other key elements used to frame them.

**What to look for in code/outputs:**
- PICO or PCC (population, concept, context) framework documented in protocol, report preamble, or config file
- Explicit research question statements mapping to population/participants, concept, and context
- Search strategy documentation that operationalizes the stated objectives
- Objectives framed as mapping or describing rather than assessing effectiveness or synthesizing effect sizes

---

## Methods

### Item 5 -- Protocol and registration

**Description:** Say whether a review protocol exists and whether and where it can be accessed (e.g., a web address); if available, give registration details, including the registration number.

**What to look for in code/outputs:**
- Protocol document path or URL referenced in analysis code or report
- PROSPERO, OSF, or institutional registration number in report metadata or methods section
- Version-controlled protocol files in the project repository
- Documentation of any deviations from the registered protocol with explanations

### Item 6 -- Eligibility criteria

**Description:** Specify the characteristics of the sources of evidence used as eligibility criteria (e.g., years considered, language, publication status), with a rationale.

**What to look for in code/outputs:**
- Inclusion and exclusion criteria for study designs, languages, date ranges, and publication types in code or documentation
- Rationale for chosen eligibility criteria referencing the review scope and concept being mapped
- Code or decision rules that apply eligibility criteria consistently across sources
- Documentation of whether grey literature, conference abstracts, or unpublished studies were included

### Item 7 -- Information sources

**Description:** Describe every information source searched (e.g., databases with their coverage dates, contact with authors to find more sources) and the date of the most recent search.

**What to look for in code/outputs:**
- List of databases searched (MEDLINE, Embase, CINAHL, etc.) with coverage dates and search execution dates
- Code or documentation covering supplementary search methods (hand-searching, citation chasing, grey literature sources)
- Expert contact or key informant consultation documented in the methods
- Date of the most recent search execution recorded in code metadata or report header

### Item 8 -- Search

**Description:** Give the full electronic search strategy for at least one database, including any limits, so that the search could be repeated.

**What to look for in code/outputs:**
- Full search string for at least one database included in supplementary materials or methods appendix
- Boolean operators, MeSH terms, free-text terms, and field tags documented
- Any limits applied (date, language, publication type) specified in the search strategy
- Search strings stored as reproducible code or query files

### Item 9 -- Selection of sources of evidence

**Description:** State how sources of evidence were selected for the scoping review (screening and eligibility).

**What to look for in code/outputs:**
- Documentation of the screening process: title/abstract screening followed by full-text review
- Number of reviewers at each stage and any conflict resolution process described
- Screening tool or data extraction platform referenced (Covidence, Rayyan, DistillerSR)
- Pilot testing of eligibility criteria documented prior to full screening

### Item 10 -- Data charting process

**Description:** Describe how data were charted from the included sources of evidence (e.g., calibrated forms, or forms tested by the team before use, and whether charting was done independently or in duplicate), and any processes for obtaining and confirming data from investigators.

**What to look for in code/outputs:**
- Data charting form or template referenced or included in supplementary materials
- Documentation of whether charting was done independently by two reviewers and how conflicts were resolved
- Pilot testing of the charting form before full extraction documented
- Process for contacting study authors to confirm or supplement charted data described

### Item 11 -- Data items

**Description:** List and define every variable for which data were sought, and any assumptions and simplifications made.

**What to look for in code/outputs:**
- Data dictionary or codebook listing all charted variables with definitions
- Code that maps extracted data fields to analysis variables
- Documentation of assumptions made when source information was incomplete or ambiguous
- Simplifications applied to heterogeneous data types (e.g., collapsing outcome categories) justified and recorded

### Item 12 -- Critical appraisal of individual sources of evidence

**Description:** (Optional) If critical appraisal of the included sources of evidence was done, give the rationale for it, describe the methods, and explain how the results were used in any data synthesis (if appropriate).

**What to look for in code/outputs:**
- Documentation of whether formal quality appraisal was performed and the stated rationale
- Quality appraisal tool referenced when appraisal was conducted (noting that quality appraisal is optional in scoping reviews)
- Explanation of how quality appraisal findings influenced data synthesis, narrative, or conclusions
- Acknowledgment that scoping reviews do not typically exclude studies based on methodological quality

### Item 13 -- Synthesis of results

**Description:** Describe how the charted data were handled and summarized.

**What to look for in code/outputs:**
- Narrative synthesis approach described (thematic analysis, descriptive mapping, content analysis)
- Code or documentation for tabulating study characteristics (design, setting, population, concept)
- Quantitative summary methods (counts, frequencies, proportions) used to characterize the evidence base
- Absence of pooled meta-analysis consistent with scoping review purpose; if meta-analysis is performed, rationale provided

---

## Results

### Item 14 -- Selection of sources of evidence

**Description:** Report the numbers of sources of evidence screened, assessed for eligibility, and included, with the reasons for exclusion at each stage, ideally in a flow diagram.

**What to look for in code/outputs:**
- PRISMA-style flow diagram generation code with counts at each stage (records identified, deduplicated, screened, assessed, included)
- Reasons for exclusion at full-text stage with counts per reason
- Final included source count consistent across flow diagram, results text, and data tables
- Kappa or percent agreement statistics for inter-rater reliability at screening stages

### Item 15 -- Characteristics of sources of evidence

**Description:** For each source of evidence, give its citation and the characteristics for which data were charted.

**What to look for in code/outputs:**
- Table summarizing characteristics of all included sources (author, year, country, design, population, concept, context, key findings)
- Code generating the characteristics table from the charted data file
- Complete citation information for all included sources
- Logical consistency between the characteristics table and the synthesis narrative

### Item 16 -- Critical appraisal within sources of evidence

**Description:** (Optional) If critical appraisal was done, present its results for the included sources of evidence (see item 12).

**What to look for in code/outputs:**
- Quality appraisal scores or ratings table if appraisal was performed
- Narrative interpretation of quality findings and their implications for the review conclusions
- Consistency between reported appraisal approach in methods and results presented

### Item 17 -- Results of individual sources of evidence

**Description:** For each included source of evidence, present the charted data relevant to the review questions and objectives.

**What to look for in code/outputs:**
- Per-source data table or appendix with charted data aligned to review objectives
- Code that outputs source-level results alongside aggregate summaries
- Data items presented consistently for all sources, with missing data noted
- Source-level data traceable to the final synthesis narrative

### Item 18 -- Synthesis of results

**Description:** Summarize and/or present the charting results in relation to the review questions and objectives.

**What to look for in code/outputs:**
- Narrative synthesis organized by the concept dimensions, population subgroups, or contexts identified in the objectives
- Tables or figures summarizing the distribution of evidence by design, geography, date, setting, or population
- Counts and proportions describing the evidence landscape (e.g., proportion of studies from high-income countries)
- Identification of patterns, gaps, and heterogeneity across included sources

---

## Discussion

### Item 19 -- Summary of evidence

**Description:** Summarize the main results (including an overview of the concepts, themes, and types of evidence available), relate them to the review questions and objectives, and consider their relevance to key groups.

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

**Description:** Give a general interpretation of the results in relation to the review questions and objectives, with potential implications and/or next steps.

**What to look for in code/outputs:**
- Conclusion statements that directly address the stated objectives and concept being mapped
- Explicit identification of areas requiring systematic review, primary research, or policy action
- Language framing conclusions as mapping the evidence landscape rather than establishing effectiveness
- Recommended next steps grounded in the identified knowledge gaps

---

## Funding

### Item 22 -- Funding

**Description:** Describe the funding sources of the included sources of evidence and of the scoping review itself, and the role of the scoping review's funders.

**What to look for in code/outputs:**
- Funding acknowledgment section in report templates naming the funding source and grant numbers
- Explicit role-of-funder statement (data access, analytical oversight, publication rights)
- Conflict of interest disclosures for the review team
- Funding sources of included primary studies summarized or noted when relevant to interpretation

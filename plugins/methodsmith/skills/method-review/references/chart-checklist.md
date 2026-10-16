# CHART Checklist for Chatbot Health Advice Studies

## Contents

- Title and Abstract
- Introduction
- Methods
- Results
- Discussion
- Open Science

Chatbot Assessment Reporting Tool (CHART) statement for Chatbot Health Advice (CHA) studies: studies evaluating how well generative AI-driven chatbots summarize clinical evidence or give health advice. CHART has 12 items and 39 subitems; a separate CHART for Abstracts checklist covers the abstract.

**Scope:** CHART is the primary reporting guideline for chatbot health-advice studies. It is not a generic extension for every clinical AI, prediction, diagnostic, or intervention study. For LLM development or evaluation studies outside health advice, use TRIPOD-LLM.

**Primary reference:** Huo B, Collins G, Chartash D, Thirunavukarasu A, Flanagin A, Iorio A, et al. Reporting guideline for Chatbot Health Advice studies: the CHART statement. BMC Med. 2025;23(1):447. doi:10.1186/s12916-025-04274-w. PMID: 40745595. PMCID: PMC12315282.

**Simultaneous publications:** Ann Fam Med (PMID 40750305), Artif Intell Med (PMID 40753040), BMJ Med (PMID 40761518), Br J Surg (PMID 40747825), and JAMA Netw Open (PMID 40747871).

**Explanation and elaboration:** CHART Collaborative. Reporting guidelines for chatbot health advice studies: explanation and elaboration for the Chatbot Assessment Reporting Tool (CHART). BMJ. 2025;390:e083305. PMID: 40750271.

**Verified against:** Table 2 (checklist) and Table 3 (abstract checklist) of the BMC Medicine publication, https://pmc.ncbi.nlm.nih.gov/articles/PMC12315282/, and the EQUATOR record, https://www.equator-network.org/reporting-guidelines/reporting-guideline-for-chatbot-health-advice-studies-the-chart-statement/, checked 2026-10-15.

**Licence and wording:** The BMC Medicine article is CC BY-NC-ND 4.0, which allows neither commercial reuse nor adapted versions, so item text below is a faithful paraphrase of Table 2; item and subitem numbers and headings are exact. Review cues are added by this plugin.

---

## Title and Abstract

### Item 1 -- Title and abstract

**Description:** (1a) Title: state that the study assesses one or more generative AI-driven chatbots for clinical evidence or health advice. (1b) Abstract/summary: use a structured format, if applicable (see CHART for Abstracts).

**What to look for in code/outputs:**
- Title naming the chatbot(s) and the health-advice task

---

## Introduction

### Item 2 -- Background

**Description:** (2a) Give the scientific background, rationale, and healthcare context for evaluating the chatbot(s), citing relevant literature where applicable. (2b) State the aims and research questions, including the target audience, intervention, comparator(s), and outcome(s).

---

## Methods

### Item 3 -- Model identifiers

**Description:** (3a) Name the generative AI model(s) and chatbot(s) evaluated, with version identifiers and date of release or last update. (3b) State whether each is open-source or closed-source/proprietary.

**What to look for in code/outputs:**
- Exact model identifier and version pinned in config (not an alias such as "latest")

### Item 4 -- Model details

**Description:** (4a) State whether the model was a base model, or a novel base, tuned, or fine-tuned model. (4b) For a base model, cite its development in enough detail to identify it. (4c) For a novel base, tuned, or fine-tuned model, describe the pre- and/or post-implementation/deployment data and parameters.

**What to look for in code/outputs:**
- Retrieval sources, system prompts, or fine-tuning data documented for tuned models

### Item 5 -- Prompt engineering

**Description:** (5a) Describe how the study prompts were developed. (5ai) Describe the sources of prompts. (5aii) Give the number and characteristics of the people involved in prompt engineering. (5aiii) Describe any patient and public involvement in prompt engineering. (5b) Provide the study prompts.

**What to look for in code/outputs:**
- Prompt files versioned in the repository, with a log of prompt iterations

### Item 6 -- Query strategy

**Description:** (6a) State how the generative AI model was accessed. (6b) Give the date(s) (day, month, year) and location(s) (city, country) of the queries. (6c) State whether prompts were entered in separate chat sessions. (6d) Provide all chatbot outputs/responses.

**What to look for in code/outputs:**
- Query timestamps, access route (web interface or API), and session handling logged per prompt
- Raw responses archived unedited

### Item 7 -- Performance evaluation

**Description:** (7a) Define the ground truth or reference standard used to judge successful chatbot performance. (7b) Describe how chatbot performance was evaluated. (7bi) Give the number and characteristics of the evaluators. (7bii) Describe any patient and public involvement in evaluation. (7biii) State whether evaluators were blinded to the identity of the chatbot(s).

**What to look for in code/outputs:**
- Scoring rubric and reference answers; evaluator roster; blinding of chatbot identity in the rating interface

### Item 8 -- Sample size

**Description:** Report how the sample size was determined.

### Item 9 -- Data analysis

**Description:** (9a) Describe the statistical methods, including any evaluation of how reproducible the chatbot's responses were. (9ai) Report the measures used to evaluate performance.

**What to look for in code/outputs:**
- Repeated queries per prompt with an agreement or consistency measure; inter-rater agreement for human scoring

---

## Results

### Item 10 -- Results

**Description:** (10a) Report the performance evaluation, including how well chatbot output aligned with the ground truth or reference standard, using quantitative or mixed methods as applicable. (10b) For responses that deviated from the ground truth or reference standard, describe the nature of the differences. (10c) Report the evaluation of potentially harmful, biased, or misleading responses.

**What to look for in code/outputs:**
- Harm and bias classification of responses with counts

---

## Discussion

### Item 11 -- Discussion

**Description:** (11a) Interpret the findings in the context of relevant evidence. (11b) Describe the study's strengths and limitations. (11c) Describe potential implications for practice, education, policy, regulation, and research.

---

## Open Science

### Item 12 -- Open science

**Description:** (12a) Disclosures: report relevant conflicts of interest for all authors. (12b) Funding: report funding sources and their role in conducting and reporting the study. (12c) Ethics: describe the ethical approval process. (12ci) Describe measures taken to protect the privacy of patient health information, as applicable. (12cii) State whether permission or licensing was obtained to use original copyrighted data. (12d) Protocol: provide a study protocol. (12e) Data availability: state where study data, code, and model parameters can be accessed.

**What to look for in code/outputs:**
- No patient-identifiable text sent to external chatbots without approval; copyright status of source material recorded
- Repository with prompts, raw outputs, scoring data, and analysis code

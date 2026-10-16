# CONSORT-AI Checklist for Clinical Trials Involving AI Interventions

## Contents

- Title and Abstract (items 1a,b (i)-(ii))
- Introduction (item 2a (i))
- Methods -- Participants (items 4a (i)-4b)
- Methods -- Interventions (items 5 (i)-(vi))
- Results -- Harms (item 19)
- Other Information (item 25)

AI EXTENSION checklist for reporting clinical trial reports that evaluate interventions with an artificial intelligence component.
CONSORT-AI adds 14 items to the core CONSORT 2010 items, keyed to CONSORT 2010 item numbers. Items marked "Elaboration" expand on an existing CONSORT item; items marked "Extension" are new.

**Base guideline:** Current CONSORT core (CONSORT 2025); this extension was published against CONSORT 2010 and should be interpreted with the current core.

**Primary reference:** Liu X, Cruz Rivera S, Moher D, Calvert MJ, Denniston AK; SPIRIT-AI and CONSORT-AI Working Group. Reporting guidelines for clinical trial reports for interventions involving artificial intelligence: the CONSORT-AI extension. Lancet Digit Health. 2020;2(10):e537-e548. doi:10.1016/S2589-7500(20)30218-1. PMID: 33328048. Published simultaneously in BMJ. 2020;370:m3164 (doi:10.1136/bmj.m3164; PMID: 32909959; PMCID: PMC7490784) and Nat Med. 2020;26(9):1364-1374 (PMID: 32908283).

**Verified against:** CONSORT-AI Table 1 in the BMJ full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC7490784/, cross-checked against the Lancet Digital Health Table 1, https://pmc.ncbi.nlm.nih.gov/articles/PMC8183333/ (verified 2026-10-15).

**Licence:** Checklist text reproduced verbatim from the BMJ publication (Liu et al., BMJ 2020;370:m3164) under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). The "What to look for" bullets and the CONSORT 2025 mapping lines are added by this plugin and are not CONSORT-AI text.

**Numbering:** Item IDs are the CONSORT 2010 numbers used by CONSORT-AI. Each item gives the nearest CONSORT 2025 core item as a plugin mapping; cite CONSORT 2025 numbers for core items.

This checklist supplements the current CONSORT core. Apply both checklists together.

---

## Title and Abstract

### Item 1a,b (i) -- AI intervention and model type (Elaboration)

**Description:** Indicate that the intervention involves artificial intelligence/machine learning in the title and/or abstract and specify the type of model.

CONSORT 2025 core: 1a, 1b.

**What to look for in code/outputs:**
- Manuscript title or report header explicitly naming the AI/ML component
- Structured abstract naming the model type (e.g., deep learning, gradient boosting, large language model)
- Trial registration documents that label the intervention as AI-based

### Item 1a,b (ii) -- Intended use in title or abstract (Elaboration)

**Description:** State the intended use of the AI intervention within the trial in the title and/or abstract.

CONSORT 2025 core: 1a, 1b.

**What to look for in code/outputs:**
- Abstract sentence stating what the AI does in the trial (e.g., triage, diagnosis, treatment recommendation)

---

## Introduction

### Item 2a (i) -- Intended use in the clinical pathway (Extension)

**Description:** Explain the intended use of the AI intervention in the context of the clinical pathway, including its purpose and its intended users (e.g. healthcare professionals, patients, public).

CONSORT 2025 core: 6.

**What to look for in code/outputs:**
- Protocol or background text defining the AI's clinical role (assistive, autonomous, triage) and its intended users
- Workflow diagrams or comments linking model outputs to clinical decision points

---

## Methods -- Participants

### Item 4a (i) -- Participant-level eligibility (Elaboration)

**Description:** State the inclusion and exclusion criteria at the level of participants.

CONSORT 2025 core: 12a.

**What to look for in code/outputs:**
- Participant inclusion/exclusion filter logic with explicit thresholds

### Item 4a (ii) -- Input-data-level eligibility (Extension)

**Description:** State the inclusion and exclusion criteria at the level of the input data.

CONSORT 2025 core: 12a.

**What to look for in code/outputs:**
- Input data validation schemas (image modality, resolution, required fields, acceptable ranges)
- Counts of participants or records excluded because their input data failed the criteria

### Item 4b -- Integration into the trial setting (Extension)

**Description:** Describe how the AI intervention was integrated into the trial setting, including any onsite or offsite requirements.

CONSORT 2025 core: 11.

**What to look for in code/outputs:**
- Deployment configuration (EHR integration, standalone app, PACS plugin; cloud vs on-premise; hardware)
- API endpoint or integration interface documentation

---

## Methods -- Interventions

### Item 5 (i) -- Algorithm version (Extension)

**Description:** State which version of the AI algorithm was used.

CONSORT 2025 core: 13.

**What to look for in code/outputs:**
- Model registry entries, version tags, or checkpoint hashes linked to trial enrolment periods
- Documentation of model freeze dates and any mid-trial updates

### Item 5 (ii) -- Acquisition and selection of input data (Extension)

**Description:** Describe how the input data were acquired and selected for the AI intervention.

CONSORT 2025 core: 13.

**What to look for in code/outputs:**
- Data acquisition and selection code (devices, sources, sampling of records) and preprocessing pipelines applied before inference

### Item 5 (iii) -- Poor-quality or unavailable input data (Extension)

**Description:** Describe how poor quality or unavailable input data were assessed and handled.

CONSORT 2025 core: 13.

**What to look for in code/outputs:**
- Input quality checks and the actions taken on failure (reject, re-acquire, fall back to usual care)
- Counts of cases with unusable or missing input, by arm

### Item 5 (iv) -- Human-AI interaction in input handling (Extension)

**Description:** Specify whether there was human-AI interaction in the handling of the input data, and what level of expertise was required of users.

CONSORT 2025 core: 13.

**What to look for in code/outputs:**
- Standard operating procedures or training materials for users who prepare or select input data
- Operator qualification requirements documented in the protocol

### Item 5 (v) -- Output of the AI intervention (Extension)

**Description:** Specify the output of the AI intervention

CONSORT 2025 core: 13.

**What to look for in code/outputs:**
- Output formatting code (probabilities, classification labels, risk scores) and any thresholds applied
- Post-processing applied to raw model outputs before presentation

### Item 5 (vi) -- How outputs contributed to decisions (Extension)

**Description:** Explain how the AI intervention's outputs contributed to decision-making or other elements of clinical practice.

CONSORT 2025 core: 13.

**What to look for in code/outputs:**
- Workflow logic defining override mechanisms or escalation pathways
- Logging that captures when clinicians accept, reject, or modify AI recommendations
- Documentation of autonomy level (fully automated, advisory, second reader)

---

## Results -- Harms

### Item 19 -- Performance errors (Extension)

**Description:** Describe results of any analysis of performance errors and how errors were identified, where applicable. If no such analysis was planned or done, justify why not.

CONSORT 2025 core: 27.

**What to look for in code/outputs:**
- Analysis scripts examining false positives, false negatives, and failure cases, with how errors were identified
- Error logging for model inference failures and subgroup breakdowns of errors
- A stated justification when no error analysis was done

---

## Other Information

### Item 25 -- Access to the AI intervention and code (Extension)

**Description:** State whether and how the AI intervention and/or its code can be accessed, including any restrictions to access or re-use.

CONSORT 2025 core: 4.

**What to look for in code/outputs:**
- Code or model repository URL, release tag, or DOI, with licence and access restrictions stated
- Statement explaining why access is restricted, if it is

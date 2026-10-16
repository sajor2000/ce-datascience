# SPIRIT-AI Checklist for Clinical Trial Protocols Involving AI Interventions

## Contents

- Administrative Information -- Title (items 1 (i)-(ii))
- Introduction -- Background and rationale (items 6a (i)-(ii))
- Methods -- Participants, Interventions, and Outcomes (items 9-11a (vi))
- Methods -- Monitoring: Harms (item 22)
- Ethics and Dissemination -- Access to data (item 29)

AI EXTENSION checklist for reporting clinical trial protocols that evaluate interventions with an artificial intelligence component.
SPIRIT-AI adds 15 items, keyed to the item numbers of SPIRIT 2013 (now superseded by SPIRIT 2025). Items marked "Elaboration" expand on an existing SPIRIT item; items marked "Extension" are new.

**Base guideline:** SPIRIT 2025 (Chan AW, et al. BMJ. 2025;389:e081477. PMID: 40294953; `spirit-checklist.md`). SPIRIT-AI (2020) was written against SPIRIT 2013, which SPIRIT 2025 supersedes; apply its AI items alongside the current SPIRIT 2025 core and cite 2025 numbers for core items.

**Primary reference:** Cruz Rivera S, Liu X, Chan AW, Denniston AK, Calvert MJ; SPIRIT-AI and CONSORT-AI Working Group. Guidelines for clinical trial protocols for interventions involving artificial intelligence: the SPIRIT-AI extension. Lancet Digit Health. 2020;2(10):e549-e560. doi:10.1016/S2589-7500(20)30219-3. PMID: 33328049. Published simultaneously in BMJ. 2020;370:m3210 (doi:10.1136/bmj.m3210; PMID: 32907797; PMCID: PMC7490785) and Nat Med. 2020;26(9):1351-1363 (PMID: 32908284).

**Verified against:** SPIRIT-AI Table 1 in the BMJ full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC7490785/, cross-checked against the Lancet Digital Health text, https://pmc.ncbi.nlm.nih.gov/articles/PMC8212701/ (verified 2026-10-15).

**Licence:** Checklist text reproduced verbatim from the BMJ publication (Cruz Rivera et al., BMJ 2020;370:m3210) under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). The Lancet Digital Health copy is CC BY-NC-ND 4.0 and was used only for cross-checking. The "What to look for" bullets and the SPIRIT 2025 mapping lines are added by this plugin and are not SPIRIT-AI text.

**Numbering:** Item IDs are the numbers SPIRIT-AI uses, keyed to SPIRIT 2013, which SPIRIT 2025 supersedes (in that old numbering, item 22 is harms and item 29 is access to data). Each item gives the nearest SPIRIT 2025 core item as a plugin mapping.

This checklist supplements the SPIRIT 2025 core checklist. Apply both together.

---

## Administrative Information -- Title

### Item 1 (i) -- AI intervention and model type (Elaboration)

**Description:** Indicate that the intervention involves artificial intelligence/machine learning and specify the type of model.

SPIRIT 2025 core: 1a, 1b.

**What to look for in code/outputs:**
- Protocol title or summary explicitly mentioning AI or machine learning and the model type
- Trial registration records (e.g., ClinicalTrials.gov) that label the study as involving AI

### Item 1 (ii) -- Intended use (Elaboration)

**Description:** Specify the intended use of the AI intervention.

SPIRIT 2025 core: 1a, 1b.

**What to look for in code/outputs:**
- Title or summary sentence stating what the AI does in the trial (e.g., triage, diagnosis, treatment recommendation)

---

## Introduction -- Background and rationale

### Item 6a (i) -- Intended use in the clinical pathway (Extension)

**Description:** Explain the intended use of the AI intervention in the context of the clinical pathway, including its purpose and its intended users (e.g. healthcare professionals, patients, public).

SPIRIT 2025 core: 9a.

**What to look for in code/outputs:**
- Workflow diagrams specifying where AI outputs enter clinical decisions and who uses them

### Item 6a (ii) -- Pre-existing evidence (Extension)

**Description:** Describe any pre-existing evidence for the AI intervention.

SPIRIT 2025 core: 9a.

**What to look for in code/outputs:**
- References to prior development and validation studies, with performance on related datasets
- Regulatory status of the AI tool, or a statement that no prior evidence exists

---

## Methods -- Participants, Interventions, and Outcomes

### Item 9 -- Integration into the trial setting (Extension)

**Description:** Describe the onsite and offsite requirements needed to integrate the AI intervention into the trial setting.

SPIRIT 2025 core: 13.

**What to look for in code/outputs:**
- Deployment plan (EHR integration, standalone app, PACS plugin; cloud vs on-premise; hardware) per site

### Item 10 (i) -- Participant-level eligibility (Elaboration)

**Description:** State the inclusion and exclusion criteria at the level of participants.

SPIRIT 2025 core: 14a.

**What to look for in code/outputs:**
- Participant inclusion/exclusion criteria with explicit thresholds

### Item 10 (ii) -- Input-data-level eligibility (Extension)

**Description:** State the inclusion and exclusion criteria at the level of the input data.

SPIRIT 2025 core: 14a.

**What to look for in code/outputs:**
- Input data schema and quality thresholds that data must meet before inference (completeness, resolution, required fields)

### Item 11a (i) -- Algorithm version (Extension)

**Description:** State which version of the AI algorithm will be used.

SPIRIT 2025 core: 15a.

**What to look for in code/outputs:**
- Version control policy (frozen model vs updates allowed) and model registry identifiers
- Change management procedures for any mid-trial algorithm modification

### Item 11a (ii) -- Acquisition and selection of input data (Extension)

**Description:** Specify the procedure for acquiring and selecting the input data for the AI intervention.

SPIRIT 2025 core: 15a.

**What to look for in code/outputs:**
- Data acquisition protocol (imaging parameters, lab values, clinical data) and preprocessing steps before inference

### Item 11a (iii) -- Poor-quality or unavailable input data (Extension)

**Description:** Specify the procedure for assessing and handling poor quality or unavailable input data.

SPIRIT 2025 core: 15a.

**What to look for in code/outputs:**
- Input quality checks and the planned action on failure (reject, re-acquire, fall back to usual care)

### Item 11a (iv) -- Human-AI interaction in input handling (Extension)

**Description:** Specify whether there is human-AI interaction in the handling of the input data, and what level of expertise is required for users.

SPIRIT 2025 core: 15a.

**What to look for in code/outputs:**
- Training materials and qualification requirements for users who prepare or select input data

### Item 11a (v) -- Output of the AI intervention (Extension)

**Description:** Specify the output of the AI intervention.

SPIRIT 2025 core: 15a.

**What to look for in code/outputs:**
- Output data schema with value ranges and any decision thresholds

### Item 11a (vi) -- How outputs will contribute to decisions (Extension)

**Description:** Explain the procedure for how the AI intervention's output will contribute to decision-making or other elements of clinical practice.

SPIRIT 2025 core: 15a.

**What to look for in code/outputs:**
- Workflow specifying clinician interaction points, override mechanisms, and escalation pathways

---

## Methods -- Monitoring: Harms

### Item 22 -- Performance errors (Extension)

**Description:** Specify any plans to identify and analyse performance errors. If there are no plans for this, justify why not.

SPIRIT 2025 core: 17.

**What to look for in code/outputs:**
- Planned error analysis (false positives, false negatives, failure modes) and how errors will be identified
- Fallback procedure when the AI is unavailable or produces invalid output

---

## Ethics and Dissemination -- Access to data

### Item 29 -- Access to the AI intervention and code (Extension)

**Description:** State whether and how the AI intervention and/or its code can be accessed, including any restrictions to access or re-use.

SPIRIT 2025 core: 6.

**What to look for in code/outputs:**
- Code or model repository plan with licence and access restrictions stated

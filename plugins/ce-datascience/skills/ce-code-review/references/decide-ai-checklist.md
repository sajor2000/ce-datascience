# DECIDE-AI Checklist for Early-Stage Clinical Evaluation of AI Decision Support

## Contents

- Title and abstract
- Introduction
- Methods
- Results
- Discussion and statements

DECIDE-AI: 27 items -- 17 AI-specific reporting items (numbered 1-17, made of 28 subitems) and 10 generic reporting items (numbered I-X). Item numbers and paraphrased wording follow Table 2 of the guideline; review cues are added by this plugin.

**Current primary reference:** Vasey B, Nagendran M, Campbell B, et al. Reporting guideline for the early-stage clinical evaluation of decision support systems driven by artificial intelligence: DECIDE-AI. Nat Med. 2022;28(5):924-933. doi:10.1038/s41591-022-01772-9. PMID: 35585198. Simultaneously published in BMJ. 2022;377:e070904. doi:10.1136/bmj-2022-070904. PMID: 35584845. PMCID: PMC9116198.

**Verified against:** DECIDE-AI Table 2 in the BMJ PMC full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC9116198/.

DECIDE-AI is a standalone, stage-specific guideline for small-scale, live clinical evaluation of an AI decision-support system (after offline validation, before a comparative trial). Use TRIPOD+AI or STARD-AI for offline model evaluation and CONSORT-AI for randomised trials.

---

## Title and abstract

| Item | Description |
|---|---|
| 1 | Identify the study as early clinical evaluation of an AI or machine-learning decision support system, specifying the problem addressed |
| I | Structured summary: intended use, algorithm type, setting, numbers of patients and users, outcomes, key safety endpoints, human factors evaluated, main results, conclusions |

## Introduction

| Item | Description |
|---|---|
| 2a | Targeted medical condition and problem, current standard practice, and intended patient population |
| 2b | Intended users, planned integration in the care pathway, and intended impact, including patient outcomes |
| II | Study objectives |

## Methods

| Item | Description | Review cue |
|---|---|---|
| III | Reference to protocol, registration number, and ethics approval | |
| 3a | Patient recruitment, inclusion/exclusion criteria at patient and data level, and how the number of patients was decided | |
| 3b | User recruitment, inclusion/exclusion criteria, and how the number of users was decided | Users counted as a clustering level in the analysis |
| 3c | Steps taken to familiarise users with the AI system, including training | |
| 4a | AI system version and algorithm type; training population and preclinical performance (or a direct reference) | Model version pinned and logged with every prediction |
| 4b | Input data: acquisition, entry process, pre-processing, and handling of missing or low-quality data | |
| 4c | AI outputs and how they were presented to users | |
| 5a | Settings in which the system was evaluated | |
| 5b | Clinical workflow, timing of use, and how and by whom the final supported decision was reached | |
| IV | Primary and secondary outcomes | |
| 6a | How significant errors or malfunctions were defined and identified | |
| 6b | How risks to patient safety or harms were identified, analysed, and minimised | |
| 7 | Human factors tools, methods, or frameworks, use cases, and users involved | |
| V | Statistical methods for primary and secondary outcomes and prespecified additional analyses, including subgroups and their rationale | Repeated measures within users or sites modelled |
| 8 | Methods used to meet ethics-related goals (such as algorithmic fairness) and their rationale | Fairness criterion named and justified |
| VI | Patient involvement in the research question, design, and conduct | |

## Results

| Item | Description | Review cue |
|---|---|---|
| 9a | Baseline characteristics of patients and input-data missingness | |
| 9b | Baseline characteristics of users | |
| 10a | User exposure, number of uses, and adherence to the intended implementation | |
| 10b | Significant changes to the clinical workflow or care pathway caused by the system | |
| VII | Prespecified outcomes, including any comparison group | |
| VIII | Differences in main outcomes across prespecified subgroups | |
| 11 | Changes to the AI system or hardware during the study, their timing and rationale, and outcome changes after each | Results stratified by model version when the model changed |
| 12 | User agreement with the AI system, reasons for variation, and users changing their mind | |
| 13a | Significant errors or malfunctions (rate, apparent causes, correctability, potential impact on care) | |
| 13b | Risks to patient safety or observed harms, including indirect harm | |
| 14a | Usability evaluation per recognised standards or frameworks | |
| 14b | User learning-curve evaluation | |

## Discussion and statements

| Item | Description |
|---|---|
| 15 | Whether results support the intended clinical use |
| 16 | Safety profile, observed errors and harms, their implications, and mitigation |
| IX | Strengths and limitations |
| 17 | Whether and how data and code are available |
| X | Conflicts of interest, funding source, role of funders and commercial companies |

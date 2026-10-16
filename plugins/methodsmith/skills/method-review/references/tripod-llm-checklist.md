# TRIPOD-LLM Checklist for Studies Using Large Language Models

## Contents

- How to apply the modular checklist
- Title and abstract (items 1-2)
- Introduction (items 3a-4)
- Methods (items 5a-12)
- Open science, ethics, and public involvement (items 13-15)
- Results (items 16a-18)
- Discussion (items 19a-19g)

TRIPOD-LLM: 19 main items and 50 subitems. 14 main items and 32 subitems apply to every study; the rest apply only to particular research designs or LLM tasks. Item numbers and paraphrased wording follow Table 2 of the guideline; the "Applies to" column reproduces its research-design filter. Review cues are added by this plugin.

**Current primary reference:** Gallifant J, Afshar M, Ameen S, et al. The TRIPOD-LLM reporting guideline for studies using large language models. Nat Med. 2025;31(1):60-69. doi:10.1038/s41591-024-03425-5. PMID: 39779929. PMCID: PMC12104976.

**Verified against:** TRIPOD-LLM Tables 1-3 in the PMC full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC12104976/, checked 2026-10-15. EQUATOR record: https://www.equator-network.org/reporting-guidelines/the-tripod-llm-reporting-guideline-for-studies-using-large-language-models/. Interactive checklist: https://tripod-llm.vercel.app/. TRIPOD-LLM is a living guideline; no later version had been published as of 2026-10-15.

**Licence and wording:** The PMC copy is an NIH author manuscript available for text mining and fair use, not under an open licence, so item wording here is a faithful paraphrase that keeps each item's meaning; item numbers and the research-design and task codes are reproduced exactly.

TRIPOD-LLM is an extension of TRIPOD+AI. For an LLM used as a prediction or classification model, apply TRIPOD+AI as the primary checklist and add TRIPOD-LLM. For chatbot health-advice studies, CHART is the primary guideline.

---

## How to apply the modular checklist

Classify the study by research design, then report every item whose "Applies to" code matches.

| Code | Research design |
|---|---|
| D | De novo LLM development (pre-training or substantial fine-tuning) |
| M | LLM methods (new architectures, evaluation, or prompting methods) |
| E | LLM evaluation (testing an existing LLM for a task) |
| H | LLM evaluation in healthcare settings (integrated into a clinical workflow) |

Item 6e applies only to classification and outcome-forecasting tasks; item 7a to generative tasks; item 10 to summarization and simplification.

## Title and abstract

| Item | Description | Applies to |
|---|---|---|
| 1 | Identify the study as developing, fine-tuning, and/or evaluating the performance of an LLM, specifying the task, target population, and outcome to be predicted | All |
| 2 | Abstract per TRIPOD-LLM for Abstracts (sub-items 2a-2l: title, background, objectives, setting, data and splits, LLM name and version, building steps, tasks, evaluation datasets and measures, results, implications, registration) | All |

## Introduction

| Item | Description | Applies to |
|---|---|---|
| 3a | Healthcare context and use case, and rationale for developing or evaluating the LLM, with reference to existing approaches | All |
| 3b | Target population and intended use in the care pathway, including intended users | E, H |
| 4 | Study objectives, including whether the study covers development, fine-tuning, or validation (or several stages) | All |

## Methods

| Item | Description | Applies to | Review cue |
|---|---|---|---|
| 5a | Data sources, separately for training, tuning, and evaluation, with rationale | All | Split provenance in code |
| 5b | Relevant data points and their distribution, with dataset descriptors (source, languages, countries) | All | |
| 5c | Dates of the oldest and newest text item used in development and in evaluation | All | Evaluation text post-dates the model's training cutoff, or contamination is assessed |
| 5d | Pre-processing and quality checking, and whether it was similar across corpora, institutions, and socio-demographic groups | All | |
| 5e | Handling of missing and imbalanced data, with reasons for omitting data | All | |
| 6a | LLM name, version, and last date of training | All | Exact model identifier pinned in config, not an alias such as "latest" |
| 6b | Development details: architecture, training, fine-tuning, alignment strategy and goals | M, D | |
| 6c | How text was generated: prompt engineering (including output consistency) and inference settings (seed, temperature, max tokens, penalties) | M, D, E | Inference parameters logged per run |
| 6d | Initial and post-processed LLM output (probabilities, classes, free text) | All | |
| 6e | Rationale for classification, how probabilities were derived, and how thresholds were chosen | Classification, outcome forecasting | Threshold chosen on data not used for evaluation |
| 7a | Metrics capturing quality of generative outputs (consistency, relevance, accuracy, errors) against gold standards | Generative tasks | |
| 7b | Relevance of outcome metrics to the downstream task and, where applicable, correlation with human evaluation | E, H | |
| 7c | Outcome definition, how predictions were calculated (formula, code, API), date of inference for closed-source LLMs, and evaluation metrics | E, H | Inference date recorded for API models |
| 7d | For subjective outcome assessment: assessor qualifications, instructions, demographics, and inter-assessor agreement | All | Agreement statistic (kappa, ICC) computed |
| 7e | How performance was compared with other LLMs, humans, and benchmarks | All | Paired comparisons on the same items with CIs |
| 8a-8c | If annotation was done: labelling guidelines with examples; number of annotators, proportion double-annotated, and inter-annotator agreement; annotator background or labelling-model characteristics | All | |
| 9a-9b | If prompting was used: prompt design, curation, and selection process; data used to develop prompts | All | Prompts developed on data separate from the evaluation set |
| 10 | Pre-processing of data before summarization | Summarization | |
| 11 | Instruction tuning or alignment: instructions, data, evaluation interface, and evaluator characteristics | M, D | |
| 12 | Compute required (or proxies such as machine time, cost, inference time, FLOPs) | M, D, E | |

## Open science, ethics, and public involvement

| Item | Description | Applies to |
|---|---|---|
| 13 | Ethics committee approval and consent or waiver | All |
| 14a-14b | Funding and role of funders; conflicts of interest | All |
| 14c-14d | Where the protocol can be accessed; registration details (or statement that none exist) | H |
| 14e-14f | Availability of study data; availability of code to reproduce results | All |
| 15 | Patient and public involvement, or a statement of none | H |

## Results

| Item | Description | Applies to | Review cue |
|---|---|---|---|
| 16a | Flow of text/EHR/patient data through the study, with counts with and without the outcome or label | E, H | |
| 16b | Characteristics overall, by data source or setting, and by development/evaluation split | E, H | |
| 16c | Comparison of important clinical variables between development and evaluation data | E, H | |
| 16d | Number of participants and outcome events in each analysis | E, H | |
| 17 | Performance on prespecified metrics (7a) and/or human evaluation (7d) | All | CIs reported; prespecified metrics match those in the plan |
| 18 | Results of any LLM updating, including the updated model's performance | All | |

## Discussion

| Item | Description | Applies to |
|---|---|---|
| 19a | Overall interpretation, including fairness, in the context of objectives and previous studies | All |
| 19b | Limitations and their effects on bias, statistical uncertainty, and generalizability | All |
| 19c | Known challenges in using data for the task and domain (representation, missingness, harmonization, bias) | E, H |
| 19d | Intended use: input, end user, level of autonomy and human oversight | E, H |
| 19e | If applicable, how poor-quality or unavailable input data should be assessed and handled when implementing the LLM (its usability in current clinical care) | E, H |
| 19f | If applicable, whether users must interact in handling input data or using the LLM, and the expertise required | E, H |
| 19g | Next steps for future research, focused on applicability and generalizability | All |

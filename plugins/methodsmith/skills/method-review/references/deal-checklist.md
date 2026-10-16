# DEAL Checklist for Large Language Model Studies

## Contents

- Identity and scope
- Pathway selection
- DEAL-A items (39 items, 8 sections)
- DEAL-B items (22 items, 5 sections)
- How to review

Development, Evaluation, and Assessment of Large Language Models (DEAL).
Two-pathway reporting checklist for medical research that develops, fine-tunes, evaluates, or applies large language models (LLMs): DEAL-A (39 items) for advanced development and DEAL-B (22 items) for applied use of pretrained models.

**Primary reference:** Tripathi S, Alkhulaifat D, Doo FX, Rajpurkar P, McBeth R, Daye D, Cook TS. Development, Evaluation, and Assessment of Large Language Models (DEAL) Checklist: A Technical Report. NEJM AI. 2025;2(6). doi:10.1056/AIp2401106. Published May 9, 2025. No PubMed record was found for this DOI. EQUATOR record: https://www.equator-network.org/reporting-guidelines/development-evaluation-and-assessment-of-large-language-models-deal-checklist/.

**Verified against:** the main article and its Supplementary Appendix (https://ai.nejm.org/doi/suppl/10.1056/AIp2401106/suppl_file/aip2401106_appendix.pdf), both read in full on 2026-10-15. Item IDs, item names, section structure, and the "if applicable" markers come from Supplementary Table 2 (the fillable checklist, Parts A and B). Tables S3 and S4 are completed examples and add no items.

**Licence:** The article is published by NEJM Group (Massachusetts Medical Society) and the appendix ("provided by the authors") carries no open licence. Item IDs and item names are kept as published so findings can cite them; every description is a faithful paraphrase that keeps each element of the official item and adds nothing. Use the official appendix for verbatim wording. The pathway definitions are quoted from the EQUATOR record. The review cues are added by this plugin and are not DEAL text.

**Numbering:** Cite items as "DEAL-A 3.2" or "DEAL-B 2.1". In Part B, the tenth Model Information item (Funding and Disclosures) is printed as a second "1.1" in both Table S2 and Table S4; this file numbers it 1.10, and a finding should cite it as "DEAL-B 1.10 (printed 1.1)".

**If applicable (\*):** The checklist marks some items and whole sections with an asterisk, meaning "address if applicable". In DEAL-A these are item 1.6 and all of sections 3 (Training, Fine-Tuning and Testing), 4 (Embedding and Retrieval), and 6 (Multi-Agent Systems). In DEAL-B they are items 1.3, 1.4, 1.8, 2.4, 3.3, and 4.2. Every other item is expected in every report on that pathway.

**Correction note:** Earlier versions of this file described a "DEep Learning in pAthology" checklist with 16 items. No such published guideline exists; those items were not from any source and have been removed.

---

## Identity and scope

DEAL covers reporting of LLM research in medicine. The authors modelled its structure on STARD and CLAIM and followed EQUATOR guidance for developing it. EQUATOR classifies it under artificial intelligence/machine learning studies and diagnostic and prognostic studies, applying to the whole report. Studies of non-LLM NLP or other AI models go to other reporting checklists (appendix Table S1), not DEAL.

## Pathway selection

| Pathway | Use when (EQUATOR wording) |
|---|---|
| DEAL-A | "Intended for studies involving substantial LLM development, advanced techniques, or comprehensive fine-tuning" |
| DEAL-B | "Tailored for more straightforward applications utilizing pretrained LLMs with minimal adjustments or a focus on prompt engineering" |

The article's selection flowchart (Figure 2) routes by research scope:

- Advanced LLM methods (new architectures, retrieval-augmented generation, fine-tuning on large or custom datasets, several models or extensive evaluation) -> DEAL-A.
- Multiagent systems -> DEAL-A.
- Out-of-the-box use of a pretrained LLM (content generation, classification, prompt-engineering studies, evaluation by basic metrics or human raters) -> DEAL-B.

The appendix titles Table S4 "Completed DEAL A Checklist" but fills in Part B; the main article calls it the DEAL-B example. Treat Table S4 as a DEAL-B example.

---

## DEAL-A items (39 items, 8 sections)

### Section 1 -- Model Information and Study Setup

| ID | Item | Description (paraphrase) |
|---|---|---|
| 1.1 | LLM Model Information | Name, version, and dates of use for every model tested |
| 1.2 | Model Selection Rationale | Why these models were chosen |
| 1.3 | Completion Parameters | Generation parameters such as temperature, maximum tokens, penalties, and logit bias |
| 1.4 | Custom Instructions and Preprocessing | Any custom instructions (e.g., role statements such as "You are...") and preprocessing steps |
| 1.5 | Most Recent Training Date | The most recent training date of each model used |
| 1.6\* | Annotation Process | Annotation process, including team roles, guidelines, and quality control |
| 1.7 | Compute Resources | Compute used for training or fine-tuning (e.g., GPU/CPU hours, cost) |
| 1.8 | Ethical Considerations | IRB or ethics committee approval and patient consent or waiver, as applicable |
| 1.9 | Funding and Disclosures | Funding sources and potential conflicts of interest |

### Section 2 -- Data Handling and Quality Control

| ID | Item | Description (paraphrase) |
|---|---|---|
| 2.1 | Data Sources | Detailed description of the datasets, including any synthetic, private, or proprietary data |
| 2.2 | Data Preparation | Cleaning, transformations, and data partitioning |
| 2.3 | Data Quality Checks | How data quality was assessed and assured |
| 2.4 | Missing/Imbalanced Data | How missing data, imbalance, and other anomalies were handled |
| 2.5 | Data Leakage/Contamination | How leakage or contamination was identified and mitigated, especially for closed models that are hard to verify |

### Section 3 -- Training, Fine-Tuning and Testing (\* if applicable)

| ID | Item | Description (paraphrase) |
|---|---|---|
| 3.1 | Fine-Tuning Approach | Whether fine-tuning was parameter-efficient (e.g., LoRA) or full-parameter |
| 3.2 | Hyperparameters and Tuning | Hyperparameters and their values (e.g., learning rate, LoRA rank, target modules) |
| 3.3 | Training Method and Tools | Fine-tuning method (e.g., SFT, RLHF) and software used (e.g., PyTorch, TensorFlow) |
| 3.4 | Evaluation Data | Evaluation dataset and testing approach (e.g., train/test split) |
| 3.5 | Evaluation Metrics | Performance metrics used (e.g., accuracy, F1, AUROC, BLEU) |

### Section 4 -- Embedding and Retrieval (\* if applicable)

| ID | Item | Description (paraphrase) |
|---|---|---|
| 4.1 | Embedding Creation | How embeddings were created (e.g., chunk size, overlap) |
| 4.2 | Retrieval Techniques | Retrieval tools and methods (e.g., FAISS, reranking, compression) |
| 4.3 | Number of Queries per Prompt | How multiple queries per prompt were handled in the RAG setup to manage stochasticity |
| 4.4 | Data Retrieval Checks | How the relevance of retrieved data was verified and stochastic retrieval behaviour managed |
| 4.5 | Evaluation of Consistency | Metrics or approaches used to evaluate response consistency in the RAG setup |

### Section 5 -- Prompting and Output Evaluation

| ID | Item | Description (paraphrase) |
|---|---|---|
| 5.1 | Prompt Engineering Techniques | Full list of prompts and prompting techniques used (e.g., chain of thought) |
| 5.2 | Output Evaluation | How outputs were evaluated, with the specific metrics |

### Section 6 -- Multi-Agent Systems (\* if applicable)

| ID | Item | Description (paraphrase) |
|---|---|---|
| 6.1 | Multi-Agent Setup and Coordination | Agents used and the coordination mechanism (e.g., AutoGen or custom) |
| 6.2 | Agent Parameters and Testing | Parameters and distinct strategies for each agent, where relevant |
| 6.3 | Agent Coordination and Independence | How agents coordinate and how independence or role specialisation is handled |
| 6.4 | Agent Evaluation and Relevance Checks | Prompts used to assess each agent's output quality and relevance |
| 6.5 | Agents Stochasticity Management | How stochastic behaviour is monitored and managed across agents for consistency |

### Section 7 -- Bias and Fairness Evaluation

| ID | Item | Description (paraphrase) |
|---|---|---|
| 7.1 | Bias Identification Strategy | Methods and metrics (e.g., demographic parity) for detecting bias in outputs, and the groups assessed |
| 7.2 | Synthetic Data Bias Evaluation | For synthetic data, how bias was identified and mitigated, including checks of representational fairness |
| 7.3 | Mitigation Techniques | Bias-reduction techniques applied (e.g., debiasing algorithms, more diverse data) |
| 7.4 | Fairness Metrics | Fairness metrics reported (e.g., disparate impact ratio, equal opportunity difference) |

### Section 8 -- Model Stochasticity Management

| ID | Item | Description (paraphrase) |
|---|---|---|
| 8.1 | Multiple Query Consistency Checks | Approach to stochastic outputs, including the number of repeated runs and how variation was analysed |
| 8.2 | Variation Recording and Reporting | How differences between runs were logged and reported, including notable deviations |
| 8.3 | Stochastic Control Techniques | Techniques used to reduce variability (e.g., averaging over runs) |
| 8.4 | Consistency Metrics | Metrics or qualitative methods for output consistency (e.g., standard deviation, stability checks) |

---

## DEAL-B items (22 items, 5 sections)

### Section 1 -- Model Information and Study Setup

| ID | Item | Description (paraphrase) |
|---|---|---|
| 1.1 | LLM Model Information | Name, version, and dates of use, and whether the default or a modified version was used |
| 1.2 | Model Selection and Usage Purpose | Short rationale for the chosen LLM and its intended application (e.g., generation, classification) |
| 1.3\* | Parameter Adjustments | Basic parameter changes (e.g., temperature, maximum tokens, penalties), or a statement that defaults were used |
| 1.4\* | API/Tool Information | The API or platform used to access the model (e.g., OpenAI API, Hugging Face) |
| 1.5 | Custom Instructions | Any specific instructions or system prompts given to the model |
| 1.6 | Most Recent Training Date | The most recent training date of the model used |
| 1.7 | Annotation Process | Annotation process, including team roles, guidelines, and quality control |
| 1.8\* | Compute Resources | Compute used for model use or fine-tuning (e.g., GPU/CPU hours, cost) |
| 1.9 | Ethical Considerations | IRB or ethics committee approval and patient consent or waiver, as applicable |
| 1.10 | Funding and Disclosures (printed 1.1) | Funding sources and potential conflicts of interest |

### Section 2 -- Prompt Engineering

| ID | Item | Description (paraphrase) |
|---|---|---|
| 2.1 | Prompting Strategies | Key prompts tested or used, and techniques such as zero-shot, few-shot, or chain-of-thought |
| 2.2 | Iterative Prompting | Any iterative refinement of prompts based on model outputs |
| 2.3 | Example Prompts | Examples of the most effective prompts, optionally as supplementary material |
| 2.4\* | Multi-Step Prompting | For multi-stage prompting (e.g., multi-agent scenarios), the sequence and its rationale |

### Section 3 -- Output Evaluation

| ID | Item | Description (paraphrase) |
|---|---|---|
| 3.1 | Basic Evaluation Methods | How outputs were evaluated (e.g., human evaluation, automated quality checks) |
| 3.2 | Metrics for Evaluation | Output metrics (e.g., coherence, fluency, relevance), or qualitative observations if there were no formal metrics |
| 3.3\* | Post-Processing of Outputs | Any post-processing (e.g., filtering, cleaning, human review) applied to the final output |

### Section 4 -- Bias and Fairness Evaluation

| ID | Item | Description (paraphrase) |
|---|---|---|
| 4.1 | Basic Bias Detection | General approach to identifying bias, including qualitative observations of fairness issues |
| 4.2\* | Synthetic Data Bias | For synthetic data, basic checks of fairness and data quality |
| 4.3 | Fairness Observations | Subjective observations of bias, including consistent bias in responses |

### Section 5 -- Model Stochasticity Management

| ID | Item | Description (paraphrase) |
|---|---|---|
| 5.1 | Basic Consistency Check | Steps taken with repeated queries to check consistency, and general observations of response variability |
| 5.2 | Qualitative Stochasticity Report | Summary of observed variability and how reliability was maintained without quantitative metrics |

---

## How to review

- Choose the pathway first with the selection rules above; a study using RAG, fine-tuning, or multiple agents is DEAL-A even if it also does prompt engineering.
- Apply DEAL alongside TRIPOD-LLM, not instead of it; TRIPOD+AI stays primary when the LLM is a prediction model, and CHART stays primary for chatbot health-advice studies.
- Items marked \* (and the starred DEAL-A sections) are "not applicable" only when the study did not do that thing; say so explicitly in the finding.
- What to look for in code and outputs:
  - Model identifiers pinned in config (model name, version or snapshot date, API or platform) and logged with each run
  - Generation parameters (temperature, max tokens, penalties, seeds where supported) stored in code, not only in prose
  - Prompt and system-prompt text versioned in the repository, with the prompt-iteration history
  - Data splits, leakage and contamination checks, and evaluation-set provenance documented
  - For RAG: chunking and embedding settings, retriever configuration, and retrieval-relevance checks
  - Repeated runs per input with a recorded variability summary (e.g., standard deviation or agreement across runs)
  - Bias and fairness analyses with the subgroups named

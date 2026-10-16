# DEAL Checklist for Large Language Model Studies (Placeholder)

## Contents

- Identity and scope
- Pathway selection
- Sections per pathway
- Items (UNVERIFIED -- not transcribed)
- How to review until the items are transcribed

**Evidence status:** Unverified. The guideline's identity, pathways, and section structure are verified against the main article (Tripathi et al., NEJM AI 2025;2(6), read in full on 2026-10-15). Its item text is not: the article states that the complete, fillable DEAL checklist is Table S2 of the NEJM AI Supplementary Appendix, and that appendix has not been obtained. The item IDs, item count, and item wording are therefore UNVERIFIED and this file contains no checklist items. Do not invent items, and do not route DEAL as an authoritative checklist until the items are transcribed from Table S2.

**Related reference:** Tripathi S, Alkhulaifat D, Doo FX, Rajpurkar P, McBeth R, Daye D, Cook TS. Development, Evaluation, and Assessment of Large Language Models (DEAL) Checklist: A Technical Report. NEJM AI. 2025;2(6). doi:10.1056/AIp2401106. Published May 9, 2025. EQUATOR record: https://www.equator-network.org/reporting-guidelines/development-evaluation-and-assessment-of-large-language-models-deal-checklist/. Checklists (Table S2; completed examples in Tables S3 and S4): https://ai.nejm.org/doi/suppl/10.1056/AIp2401106/suppl_file/aip2401106_appendix.pdf. No PubMed record was found for this DOI.

**Licence:** The article is published by NEJM Group (Massachusetts Medical Society) without an open licence. Everything below is a paraphrase of the main article, except the two pathway definitions quoted from the EQUATOR record and the section names. Nothing is copied from the supplement.

**Correction note:** Earlier versions of this file described a "DEep Learning in pAthology" checklist with 16 items. No such published guideline exists; those items were not from any source and have been removed. DEAL stands for Development, Evaluation, and Assessment of Large Language Models.

---

## Identity and scope

DEAL is a reporting checklist for research that develops, evaluates, or applies large language models (LLMs) in medicine. The authors modelled its structure on STARD and CLAIM and followed EQUATOR guidance for developing it. EQUATOR classifies it under artificial intelligence/machine learning studies and diagnostic and prognostic studies, applying to the whole report. Studies of non-LLM NLP or other AI models are directed to other reporting checklists (article Table S1), not DEAL.

## Pathway selection

| Pathway | Use when (EQUATOR wording) |
|---|---|
| DEAL-A | "Intended for studies involving substantial LLM development, advanced techniques, or comprehensive fine-tuning" |
| DEAL-B | "Tailored for more straightforward applications utilizing pretrained LLMs with minimal adjustments or a focus on prompt engineering" |

The article's selection flowchart (Figure 2) routes by research scope:

- Advanced LLM methods (new architectures, retrieval-augmented generation, fine-tuning on large or custom datasets, several models or extensive evaluation) -> DEAL-A.
- Multiagent systems -> DEAL-A.
- Out-of-the-box use of a pretrained LLM (content generation, classification, prompt-engineering studies, evaluation by basic metrics or human raters) -> DEAL-B.

## Sections per pathway

Section names as given in the article text, with a paraphrase of what each asks authors to report. These are the article's descriptions of the checklist sections, not checklist items.

| Pathway | Section | What it asks for (paraphrase) |
|---|---|---|
| DEAL-A | Model information and study setup | Model names, versions, latest training dates, why each model was chosen, and inference settings such as temperature and logit bias |
| DEAL-A | Data handling and quality control | Data sources, preparation, and quality control, including how inconsistencies and biases were handled |
| DEAL-A | Training, fine-tuning, and testing | Hyperparameter selection, tuning techniques, and the testing approach |
| DEAL-A | Embedding and retrieval | How embeddings were built and managed, which retrieval tools and algorithms were used, and how stochasticity was handled |
| DEAL-A | Prompting and output evaluation | Prompting strategies and how outputs were evaluated |
| DEAL-A | Multiagent systems | How agents and the overall system were coordinated and controlled, how agent independence was kept, and how roles were specialised |
| DEAL-A | Bias and fairness evaluation | How bias was detected and mitigated |
| DEAL-A | Model stochasticity management | Output variation, standard deviations, or other stability metrics |
| DEAL-B | Model information and study setup | Model versions, minor parameter changes, and the intended application |
| DEAL-B | Prompt engineering | The prompts and prompting techniques tested (e.g., zero-shot, few-shot), any iterative refinement, and the prompts that worked |
| DEAL-B | Output evaluation | Simple qualitative or quantitative evaluation of outputs, such as coherence or relevance |
| DEAL-B | Bias and fairness evaluation | Any fairness issues or biases observed, usually described qualitatively |
| DEAL-B | Model stochasticity management | Response variability observed and how it was managed |

## Items (UNVERIFIED -- not transcribed)

| Pathway | Item | Description | Status |
|---|---|---|---|
| DEAL-A | UNVERIFIED | Copy from Table S2 of the NEJM AI Supplementary Appendix | not transcribed |
| DEAL-B | UNVERIFIED | Copy from Table S2 of the NEJM AI Supplementary Appendix | not transcribed |

Item count, numbering, and wording are UNVERIFIED. The main article gives no item IDs or counts.

## How to review until the items are transcribed

- Use TRIPOD-LLM (with TRIPOD+AI as the primary guideline for prediction models) as the authoritative LLM checklist.
- If the user explicitly requests DEAL, ask them to supply the DEAL-A or DEAL-B checklist from Table S2 and review against that text only, citing it as user-supplied. The section table above can be used to choose the pathway and to orient the review, but findings must not cite a DEAL item number.
- Never report a DEAL item number or wording that does not come from the published supplement.

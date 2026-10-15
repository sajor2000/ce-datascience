# MI-CLAIM Checklist for Clinical AI Modeling Documentation

MI-CLAIM (Minimum Information about CLinical Artificial Intelligence Modeling) is a documentation standard in six parts, not a full reporting guideline. Use it as a template for model documentation alongside the study's reporting guideline (for example TRIPOD+AI or STARD-AI). Items below paraphrase Table 1 of the checklist; review cues are added by this plugin.

**Current primary reference:** Norgeot B, Quer G, Beaulieu-Jones BK, et al. Minimum information about clinical artificial intelligence modeling: the MI-CLAIM checklist. Nat Med. 2020;26(9):1320-1324. doi:10.1038/s41591-020-1041-y. PMID: 32908275. PMCID: PMC7538196.

**Verified against:** MI-CLAIM Table 1 in the PMC full text, https://pmc.ncbi.nlm.nih.gov/articles/PMC7538196/.

**Related reference:** For generative AI, the MI-CLAIM-GEN checklist adapts MI-CLAIM (Miao BY, et al. Nat Med. 2025;31(5):1394-1398. doi:10.1038/s41591-024-03470-0. PMID: 39915678. PMCID: PMC12207735). Its items are not reproduced here; read the source before citing them.

---

## Part 1 -- Study design

| Item | Review cue |
|---|---|
| Clinical problem in which the model will be employed is detailed | |
| Research question is clearly stated | |
| Characteristics of the training and test cohorts are detailed | Cohort tables generated from the actual splits |
| Cohorts are shown to be representative of real-world clinical settings | |
| State-of-the-art baseline for comparison is identified and detailed | Baseline evaluated on the same test set |

## Parts 2-3 -- Data and optimization

| Item | Review cue |
|---|---|
| Origin of the data and its original format are described | |
| Transformations of the data before modeling are described | Preprocessing fit on training data only |
| Independence between training and test sets is demonstrated | Patient-level (not row-level) split; no shared identifiers across splits |
| Models evaluated and the code used to select the best model are detailed | Selection uses validation data, never the test set |
| Input data type stated (structured or unstructured) | |

## Part 4 -- Model performance

| Item | Review cue |
|---|---|
| Primary performance metric (e.g., AUC, F-score) and its justification | |
| Primary clinical-utility metric (e.g., PPV, NNT) and its justification | |
| Baseline vs proposed model comparison presented with appropriate statistical inference | Paired comparison with CIs (e.g., paired DeLong or bootstrap for AUC) |

## Part 5 -- Model examination

| Item | Review cue |
|---|---|
| Examination (interpretability) techniques applied and reported | |
| Relevance of examination results to model performance discussed | |
| Feasibility and significance of case-level interpretability discussed when examination methods are uninterpretable | |
| Reliability and robustness of the model under data distribution shift discussed | |

## Part 6 -- Reproducibility

Choose and state one transparency tier: (1) complete code sharing; (2) third-party evaluation of the code for accuracy or fairness, with results shared; (3) release of a virtual machine or binary to run the model on new data without sharing details; (4) no sharing.

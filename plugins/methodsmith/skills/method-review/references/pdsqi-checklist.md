# PDSQI-9: Provider Documentation Summarization Quality Instrument

## Contents

- Scope
- Attributes
- How to use in review

PDSQI-9 is an evaluation instrument, not a reporting guideline. It is never auto-routed.

**Primary reference:** Croxford E, Gao Y, Pellegrino N, et al. Development and validation of the provider documentation summarization quality instrument for large language models. J Am Med Inform Assoc. 2025;32(6):1050-1060. doi:10.1093/jamia/ocaf068. PMID: 40323321. PMCID: PMC12089781. Follow-on use as an LLM-as-a-judge rubric: Croxford E, et al. NPJ Digit Med. 2025;8:640. doi:10.1038/s41746-025-02005-2. PMID: 41193667.

**Source and licence:** Attribute names follow Table 1 of Croxford et al. 2025. The article is copyright Oxford University Press (all rights reserved), so each definition below is a faithful paraphrase, not a verbatim copy. Consult the publication for the exact rating instructions and scales.

**Correction note:** Earlier versions of this file described a "PDSQI-9 candidate tool for prediction-model dataset quality" (data source, cohort, missingness, linkage, and similar items). No such published instrument exists; those items have been removed.

---

## Scope

PDSQI-9 rates the quality of LLM-generated summaries of clinical (provider) documentation, such as multi-document patient summaries. Physician raters, or an LLM acting as judge, score each summary on nine attributes. The instrument adapts the Physician Documentation Quality Instrument (PDQI-9): it drops PDQI-9's Up-to-Date and Consistent attributes and adds attributes for LLM-specific failure modes, including hallucination, omission, and stigmatizing language. It combines 5-point Likert and binary scales; Stigmatizing is rated as binary. In the development study it showed high internal consistency (Cronbach's alpha 0.879) and inter-rater reliability (ICC 0.867).

Use it when a study generates or evaluates clinical-note summaries. Do not use it for prediction-model datasets or as a reporting checklist; for reporting an LLM study, use TRIPOD-LLM (and the primary guideline for the design).

## Attributes

| # | Attribute | What it assesses (paraphrased) |
|---|---|---|
| 1 | Cited | Citations to the source notes are present and appropriate |
| 2 | Accurate | Content is true, with no incorrect or fabricated information |
| 3 | Thorough | All pertinent patient issues are covered (no important omissions) |
| 4 | Useful | Content is relevant and provides valuable information or analysis |
| 5 | Organized | Structure helps the reader follow the patient's clinical course |
| 6 | Comprehensible | Text is clear and unambiguous |
| 7 | Succinct | Brief and to the point, without redundancy |
| 8 | Synthesized | Reflects an understanding of the patient's status and supports developing a plan of care |
| 9 | Stigmatizing | Whether the summary is free of stigmatizing language (binary) |

## How to use in review

When a study reports PDSQI-9 scores, check in code and outputs:

- All nine attributes are scored, with the instrument version and scale per attribute stated
- Rater qualifications, training or calibration, number of raters per summary, and blinding to the summary source are reported
- Inter-rater reliability is reported (e.g., ICC, Krippendorff's alpha) for the study's own ratings
- When an LLM is the judge: model name and version, prompt, decoding settings, and agreement with human raters are reported
- Source documents and summaries are handled under the project's PHI rules; only aggregate scores leave the restricted boundary

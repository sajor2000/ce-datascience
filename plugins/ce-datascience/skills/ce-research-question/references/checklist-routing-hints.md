# Checklist Routing Hints

Default mapping from `suggested_design` → primary EQUATOR checklist. This is a *hint* written into `analysis/research-question.yaml`; the authoritative routing decision still happens in `ce-checklist-match`. Hints exist so users without checklist expertise still get a sensible default and `ce-checklist-match` can pre-fill its routing answers.

| Design | Primary | Common extensions |
|--------|---------|-------------------|
| RCT (no AI) | CONSORT (2025) | SPIRIT 2025 (protocol), CONSORT-CLUSTER (cluster RCT), CONSORT-NPT (non-pharmacological), CONSORT-Harms |
| RCT (AI intervention; `ai_involvement: ai-primary` or `llm-based`) | CONSORT (2025) | CONSORT-AI; SPIRIT 2025 + SPIRIT-AI (protocol) |
| RCT — pilot or feasibility | CONSORT extension for pilot trials | — |
| Pragmatic trial | CONSORT extension for pragmatic trials | — |
| Observational cohort (general) | STROBE | STROBE-MR if Mendelian randomization |
| Observational cohort (EHR data) | STROBE | RECORD |
| Observational cohort (claims / pharmacoepi) | STROBE | RECORD-PE |
| Case-control | STROBE | RECORD if EHR-derived |
| Cross-sectional | STROBE | RECORD if EHR-derived |
| Target trial emulation | TARGET (standalone) | RECORD for routinely collected EHR/claims/registry data; RECORD-PE if claims pharmacoepi |
| Prediction model — development | TRIPOD+AI | TRIPOD-Cluster if clustered/multisite data; REFORMS if `ai-primary` or `llm-based`; CHARMS only for systematic reviews of prediction models |
| Prediction model — external validation | TRIPOD+AI | — |
| Prediction model — clinical impact / RCT of model | CONSORT (2025) | CONSORT-AI; TRIPOD+AI for the model itself |
| Diagnostic accuracy (no AI) | STARD | QUADAS-2 if doing a SR |
| Diagnostic accuracy (AI) | STARD | STARD-AI; CLAIM if imaging |
| Imaging AI | STARD or TRIPOD+AI depending on aim | CLAIM; STARD-AI if diagnostic accuracy |
| ML-based science (AI prediction model) | TRIPOD+AI (or the underlying design's primary) | REFORMS |
| Generative AI / LLM paper | Ask whether the study is chatbot health advice, a trial, a diagnostic test, or a prediction model | Apply CHART only to chatbot health-advice reporting; do not auto-route provisional or unverified DEAL/PDSQI-9 |
| Early clinical evaluation of an AI decision-support system (`early-clinical-ai-evaluation`) | DECIDE-AI | — |
| Systematic review / meta-analysis | PRISMA | PRISMA-DTA (diagnostic), PRISMA-NMA (network) |
| Scoping review | PRISMA-ScR | — |
| Case report | CARE | — |
| Qualitative | COREQ | SRQR if alternative preferred |
| Mixed-methods | Primary of the quantitative strand | GRAMMS (provisional; never primary) |
| Animal study | ARRIVE 2.0 | — |
| Economic evaluation | CHEERS 2022 | — |
| Quality improvement | SQUIRE 2.0 | — |
| Real-world evidence (regulatory) | STaRT-RWE | RECORD-PE if claims |

AI involvement uses the canonical `ai_involvement` values `none`, `ai-assisted`, `ai-primary`, and `llm-based`; an AI extension applies only when its scope matches the study.

`protocol_stage: true` (the deliverable is a protocol): randomized-trial protocols route to SPIRIT 2025 (Chan et al., BMJ 2025, PMID 40294953; + SPIRIT-AI for AI interventions) and systematic-review protocols to PRISMA-P (Moher et al., Syst Rev 2015, PMID 25554246). `early-clinical-ai-evaluation` routes to DECIDE-AI (Vasey et al., Nat Med 2022, PMID 35585198).

## Special cases

- **Replication studies** — use the original study's checklist plus an explicit "replication" framing in SAP-1; do not invent a separate replication checklist.
- **Multi-arm or factorial RCT** — base CONSORT plus the relevant extension (CONSORT-Multi-arm or factorial).
- **Cluster RCT** — CONSORT-CLUSTER.
- **Adaptive design** — ACE / CONSORT-Adaptive.
- **N-of-1** — CONSORT N-of-1.

## Anti-patterns

- **Picking PRISMA for a primary research study** — PRISMA is for systematic reviews. A primary cohort study uses STROBE.
- **Picking CONSORT for an observational study** — CONSORT is for randomized trials. An observational study uses STROBE.
- **Picking STARD for a prediction model** — STARD is for diagnostic accuracy of a single index test. A multivariable prediction model uses TRIPOD+AI.
- **Making an extension the primary** — CONSORT-AI, STARD-AI, CLAIM, REFORMS, and GRAMMS layer on a primary checklist; they never replace it.
- **Treating TARGET as an add-on** — for a target trial emulation, TARGET is the primary and is designed as a standalone guideline (Cashin et al. 2025); do not make STROBE the primary.
- **No checklist for AI papers** — all AI / ML clinical papers map to *some* extension. If the routing here doesn't fit, ask `ce-checklist-match` directly.

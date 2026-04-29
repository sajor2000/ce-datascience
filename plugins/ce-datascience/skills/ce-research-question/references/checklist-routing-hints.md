# Checklist Routing Hints

Default mapping from `suggested_design` → primary EQUATOR checklist. This is a *hint* written into `analysis/research-question.yaml`; the authoritative routing decision still happens in `/ce-checklist-match`. Hints exist so users without checklist expertise still get a sensible default and `/ce-checklist-match` can pre-fill its routing answers.

| Design | Primary | Common extensions |
|--------|---------|-------------------|
| RCT (no AI) | CONSORT | SPIRIT (protocol), CONSORT-CLUSTER (cluster RCT), CONSORT-NPT (non-pharmacological), CONSORT-Harms |
| RCT (model-as-study-object) | CONSORT-AI | SPIRIT-AI (protocol) |
| RCT — pilot or feasibility | CONSORT extension for pilot trials | — |
| Pragmatic trial | CONSORT extension for pragmatic trials | — |
| Observational cohort (general) | STROBE | STROBE-MR if Mendelian randomization |
| Observational cohort (EHR data) | STROBE | RECORD |
| Observational cohort (claims / pharmacoepi) | STROBE | RECORD-PE |
| Case-control | STROBE | RECORD if EHR-derived |
| Cross-sectional | STROBE | RECORD if EHR-derived |
| Target trial emulation | TARGET | STROBE + RECORD if data is observational |
| Prediction model — development | TRIPOD+AI | CHARMS for systematic-review fielding |
| Prediction model — external validation | TRIPOD+AI | — |
| Prediction model — clinical impact / RCT of model | CONSORT-AI | TRIPOD+AI for the model itself |
| Diagnostic accuracy (no AI) | STARD | QUADAS-2 if doing a SR |
| Diagnostic accuracy (AI) | STARD-AI | CLAIM if imaging |
| Imaging AI | CLAIM | TRIPOD+AI or STARD-AI depending on aim |
| ML methods paper | REFORMS | TRIPOD+AI if clinical |
| Generative AI / LLM paper | CHART or DEAL | PDSQI-9 if patient-facing |
| Systematic review / meta-analysis | PRISMA | PRISMA-DTA (diagnostic), PRISMA-NMA (network) |
| Scoping review | PRISMA-ScR | — |
| Case report | CARE | — |
| Qualitative | COREQ | SRQR if alternative preferred |
| Mixed-methods | GRAMMS | — |
| Animal study | ARRIVE | — |
| Economic evaluation | CHEERS | — |
| Quality improvement | SQUIRE | — |
| Real-world evidence (regulatory) | STaRT-RWE | RECORD-PE if claims |

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
- **No checklist for AI papers** — all AI / ML clinical papers map to *some* extension. If the routing here doesn't fit, ask `/ce-checklist-match` directly.

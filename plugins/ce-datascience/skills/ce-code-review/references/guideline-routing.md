# Reporting Guideline Routing Map

Route a study to its applicable reporting guidelines based on stack-profile and SAP fields. `guideline-registry.yaml` is the machine-readable source of truth for the supported checklist files, their evidence status, and their methodological roles.

## Primary Guidelines

Each `study_type` maps to exactly one primary guideline. When `study_type` is absent or unrecognized, the reviewer asks the user rather than guessing.

| `study_type` | Primary guideline | Checklist file |
|---|---|---|
| `rct` | CONSORT 2025 | `references/consort-checklist.md` |
| `observational` | STROBE | `references/strobe-checklist.md` |
| `systematic-review` | PRISMA | `references/prisma-checklist.md` |
| `diagnostic-accuracy` | STARD 2015 | `references/stard-checklist.md` |
| `case-report` | CARE | `references/care-checklist.md` |
| `qualitative` | COREQ | `references/coreq-checklist.md` |
| `animal` | ARRIVE 2.0 | `references/arrive-checklist.md` |
| `health-economic` | CHEERS 2022 | `references/cheers-checklist.md` |
| `prediction-model` | TRIPOD+AI (regression or machine learning; TRIPOD 2015 is superseded) | `references/tripod-ai-checklist.md` |
| `target-trial-emulation` | TARGET (standalone) | `references/target-checklist.md` |
| `quality-improvement` | SQUIRE 2.0 | `references/squire-checklist.md` |
| `early-clinical-ai-evaluation` | DECIDE-AI (early, small-scale live clinical evaluation of an AI decision-support system) | `references/decide-ai-checklist.md` |
| `exploratory` | _(none required)_ | _(reviewer skips unless user overrides)_ |
| `other` | _(ask user)_ | _(reviewer asks which guideline to apply)_ |

**Target trial emulation:** an `observational` study whose design or SAP explicitly emulates a target trial routes as `target-trial-emulation`: TARGET is the primary reporting guideline and is designed to stand alone (Cashin et al. 2025, PMID 40903028). Add RECORD (routinely collected EHR, claims, or registry data) or STROBE only when the journal or data source requires them. Mixed-methods studies keep the quantitative primary and add GRAMMS as a provisional extension; GRAMMS is never the primary.

**Prediction models:** TRIPOD+AI supersedes TRIPOD 2015 for every prediction-model study, regression or machine learning (Collins et al. 2024, PMID 38626948). Load `references/tripod-checklist.md` only when the user explicitly asks for a legacy TRIPOD 2015 audit (alias `tripod-2015`).

**Protocol stage:** a trial protocol or pre-results SAP uses SPIRIT 2025 (`references/spirit-checklist.md`; PMID 40294953) instead of CONSORT; a systematic review protocol uses PRISMA-P 2015 (`references/prisma-p-checklist.md`; PMID 25554246) instead of PRISMA 2020.

**Backward compatibility:** The original values `observational`, `rct`, `exploratory`, and `other` continue to work unchanged. New values extend the enum without breaking existing SAPs.

## AI Extension Layer

When `ai_involvement` is set to a value other than `none`, the reviewer layers the applicable AI extension checklist(s) on top of the primary guideline. Extensions supplement the base checklist -- both must be applied together.

| `ai_involvement` | Condition | Extension guideline | Checklist file |
|---|---|---|---|
| `ai-primary` | `study_type: rct` | CONSORT-AI | `references/consort-ai-checklist.md` |
| `ai-primary` | `study_type: rct` (protocol stage) | SPIRIT-AI, layered on the SPIRIT 2025 core | `references/spirit-ai-checklist.md` (+ `references/spirit-checklist.md`) |
| `ai-primary` | `study_type: prediction-model` | TRIPOD+AI (already primary) | _(no additional file)_ |
| `ai-primary` | `study_type: prediction-model` | REFORMS, only when the study makes ML-based scientific claims beyond reporting a clinical model | `references/reforms-checklist.md` |
| `ai-primary` | clinical AI model documentation requested (model card, supplement) | MI-CLAIM (documentation template, not a reporting guideline) | `references/mi-claim-checklist.md` |
| `ai-primary` | `study_type: diagnostic-accuracy` | STARD-AI | `references/stard-ai-checklist.md` |
| `ai-primary` | medical imaging study (`diagnostic-accuracy` or `prediction-model`) | CLAIM | `references/claim-checklist.md` |
| `ai-primary` | pathology deep-learning study | DEAL only with verified-source override | `references/deal-checklist.md` |
| `ai-primary` | chatbot health-advice study | CHART | `references/chart-checklist.md` |
| `ai-primary` | EHR-based predictive model | PDSQI-9 is not auto-routed while unverified | `references/pdsqi-checklist.md` |
| `ai-assisted` | AI is a tool inside traditional methods, not the intervention or object of study | none auto-added; report the tool's role, version, and validation in Methods (CONSORT-AI, SPIRIT-AI, STARD-AI, TRIPOD-LLM, and REFORMS apply only to `ai-primary` or `llm-based`) | — |
| `llm-based` | `study_type: prediction-model`, or an LLM developed, fine-tuned, or evaluated on a task | TRIPOD-LLM (with TRIPOD+AI as primary for prediction models) | `references/tripod-llm-checklist.md` |
| `llm-based` | ML-based scientific claims (not chatbot-advice or trial designs) | REFORMS | `references/reforms-checklist.md` |
| `llm-based` | chatbot health-advice study | CHART | `references/chart-checklist.md` |
| `none` | any | _(no extensions)_ | _(skip AI layer)_ |

## Extension Selection Rules

1. **Read stack profile** for `stack_profile.reporting_checklist` and `stack_profile.reporting_checklist_extensions`.
2. **If canonical stack-profile fields are set**, use those values and load checklist files from `guideline-registry.yaml`.
3. **Read SAP frontmatter** for `study_type`, `ai_involvement`, and legacy `guidelines_selected`.
4. **If legacy `guidelines_selected` is explicitly set** and canonical stack-profile fields are absent, use that list as a compatibility override.
5. **Otherwise, route by `study_type`** to get the primary guideline from the table above.
6. **If `ai_involvement` is not `none`**, scan the AI extension table for matching conditions. A condition matches when the study attributes and the guideline scope both align. Do not treat generic AI involvement as sufficient for DEAL, CHART, or PDSQI-9.
7. **Resolve evidence status before combining** primary + extensions. `verified` entries may be routed; `provisional` entries require an explicit note; `unverified` entries are not authoritative selections.
8. **Combine primary + extensions** into the final checklist set. Load each file and review against it.

## Guideline Metadata

| Abbreviation | Full name | Items | Scope |
|---|---|---|---|
| CONSORT | Consolidated Standards of Reporting Trials (2025) | 30 | RCTs |
| SPIRIT | Standard Protocol Items: Recommendations for Interventional Trials (2025) | 34 | Trial protocols |
| PRISMA-P | PRISMA for systematic review Protocols (2015) | 17 | Systematic review protocols |
| TARGET | Transparent Reporting of Observational Studies Emulating a Target Trial (2025) | 21 | Target trial emulation |
| STROBE | Strengthening the Reporting of Observational Studies in Epidemiology | 22 | Observational |
| PRISMA | Preferred Reporting Items for Systematic Reviews and Meta-Analyses | 27 | Systematic reviews |
| STARD | Standards for Reporting Diagnostic Accuracy | 30 | Diagnostic accuracy |
| CARE | CAse REport guidelines | 13 | Case reports |
| COREQ | Consolidated Criteria for Reporting Qualitative Research | 32 | Qualitative |
| ARRIVE | Animal Research: Reporting of In Vivo Experiments | 21 | Animal research |
| CHEERS | Consolidated Health Economic Evaluation Reporting Standards | 28 | Health economics |
| CONSORT-AI | CONSORT extension for AI interventions | 14 | AI + RCT |
| SPIRIT-AI | SPIRIT extension for AI trial protocols (written against SPIRIT 2013) | 15 | AI + trial protocol |
| TRIPOD+AI | Prediction-model reporting, regression or ML (supersedes TRIPOD 2015) | 27 | Any prediction model |
| TRIPOD-LLM | TRIPOD+AI extension for large language models | 19 (50 subitems) | LLM studies |
| DECIDE-AI | Early-stage clinical evaluation of AI decision support | 27 (17 AI-specific + 10 generic) | Live clinical AI evaluation |
| MI-CLAIM | Minimum Information about Clinical AI Modeling | 6 parts | Model documentation |
| REFORMS | Recommendations for machine-learning-based science | 32 | ML-based science |
| CLAIM | Checklist for AI in Medical Imaging (2024 update) | see file | AI + imaging |
| DEAL | DEep Learning in pAthology (unverified source) | -- | DL + pathology |
| CHART | Chatbot Health Advice reporting | 12 (39 subitems) | Chatbot health-advice studies |
| PDSQI-9 | Local candidate dataset-quality tool (unverified source) | -- | EHR predictive models |

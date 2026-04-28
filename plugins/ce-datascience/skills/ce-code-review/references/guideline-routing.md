# Reporting Guideline Routing Map

Route a study to its applicable reporting guidelines based on SAP `study_type` and `ai_involvement` fields. The reporting-checklist-reviewer reads this map to determine which checklist files to load.

## Primary Guidelines

Each `study_type` maps to exactly one primary guideline. When `study_type` is absent or unrecognized, the reviewer asks the user rather than guessing.

| `study_type` | Primary guideline | Checklist file |
|---|---|---|
| `rct` | CONSORT 2010 | `references/consort-checklist.md` |
| `observational` | STROBE | `references/strobe-checklist.md` |
| `systematic-review` | PRISMA | `references/prisma-checklist.md` |
| `diagnostic-accuracy` | STARD 2015 | `references/stard-checklist.md` |
| `case-report` | CARE | `references/care-checklist.md` |
| `qualitative` | COREQ | `references/coreq-checklist.md` |
| `animal` | ARRIVE 2.0 | `references/arrive-checklist.md` |
| `health-economic` | CHEERS 2022 | `references/cheers-checklist.md` |
| `prediction-model` | TRIPOD+AI | `references/tripod-ai-checklist.md` |
| `exploratory` | _(none required)_ | _(reviewer skips unless user overrides)_ |
| `other` | _(ask user)_ | _(reviewer asks which guideline to apply)_ |

**Backward compatibility:** The original values `observational`, `rct`, `exploratory`, and `other` continue to work unchanged. New values extend the enum without breaking existing SAPs.

## AI Extension Layer

When `ai_involvement` is set to a value other than `none`, the reviewer layers the applicable AI extension checklist(s) on top of the primary guideline. Extensions supplement the base checklist -- both must be applied together.

| `ai_involvement` | Condition | Extension guideline | Checklist file |
|---|---|---|---|
| `ai-primary` | `study_type: rct` | CONSORT-AI | `references/consort-ai-checklist.md` |
| `ai-primary` | `study_type: rct` (protocol stage) | SPIRIT-AI | `references/spirit-ai-checklist.md` |
| `ai-primary` | `study_type: prediction-model` | TRIPOD+AI (already primary) | _(no additional file)_ |
| `ai-primary` | `study_type: prediction-model` | REFORMS | `references/reforms-checklist.md` |
| `ai-primary` | `study_type: diagnostic-accuracy` | CLAIM | `references/claim-checklist.md` |
| `ai-primary` | any study_type with deep learning in pathology | DEAL | `references/deal-checklist.md` |
| `ai-primary` | any study_type with clinical AI model documentation | CHART | `references/chart-checklist.md` |
| `ai-primary` | any study_type using EHR-based predictive models | PDSQI-9 | `references/pdsqi-checklist.md` |
| `ai-assisted` | same rules as `ai-primary` | same extensions | _(same files)_ |
| `llm-based` | any study_type | REFORMS | `references/reforms-checklist.md` |
| `llm-based` | any study_type | CHART | `references/chart-checklist.md` |
| `none` | any | _(no extensions)_ | _(skip AI layer)_ |

## Extension Selection Rules

1. **Read SAP frontmatter** for `study_type`, `ai_involvement`, and `guidelines_selected`.
2. **If `guidelines_selected` is explicitly set**, use that list as an override. Skip routing. Load each named checklist file.
3. **Otherwise, route by `study_type`** to get the primary guideline from the table above.
4. **If `ai_involvement` is not `none`**, scan the AI extension table for matching conditions. A condition matches when the `study_type` and `ai_involvement` values both align. For domain-specific extensions (DEAL, CHART, PDSQI-9), also check for signals in the analysis code: deep learning imports for DEAL, clinical deployment documentation for CHART, EHR data sources for PDSQI-9.
5. **Combine primary + extensions** into the final checklist set. Load each file and review against it.

## Guideline Metadata

| Abbreviation | Full name | Items | Scope |
|---|---|---|---|
| CONSORT | Consolidated Standards of Reporting Trials | 25 | RCTs |
| STROBE | Strengthening the Reporting of Observational Studies in Epidemiology | 22 | Observational |
| PRISMA | Preferred Reporting Items for Systematic Reviews and Meta-Analyses | 27 | Systematic reviews |
| STARD | Standards for Reporting Diagnostic Accuracy | 30 | Diagnostic accuracy |
| CARE | CAse REport guidelines | 13 | Case reports |
| COREQ | Consolidated Criteria for Reporting Qualitative Research | 32 | Qualitative |
| ARRIVE | Animal Research: Reporting of In Vivo Experiments | 21 | Animal research |
| CHEERS | Consolidated Health Economic Evaluation Reporting Standards | 28 | Health economics |
| CONSORT-AI | CONSORT extension for AI interventions | 14 | AI + RCT |
| SPIRIT-AI | SPIRIT extension for AI trial protocols | 15 | AI + trial protocol |
| TRIPOD+AI | TRIPOD extension for AI prediction models | 22 | AI prediction |
| REFORMS | Reporting Standards for ML in Science | ~20 | ML/computational |
| CLAIM | Checklist for AI in Medical Imaging | 42 | AI + imaging |
| DEAL | DEep Learning in pAthology | ~16 | DL + pathology |
| CHART | Clinical Healthcare AI Reporting Tool | ~12 | Clinical AI deployment |
| PDSQI-9 | Prediction model Data Set Quality Indicator | 9 | EHR predictive models |

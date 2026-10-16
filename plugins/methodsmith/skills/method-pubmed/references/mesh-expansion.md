# MeSH Expansion Cheat Sheet

NCBI auto-expands user terms to MeSH when possible. To check what was expanded, examine the `QueryTranslation` field returned by `esearch`. Always show the user the translated query before running `efetch` -- silent MeSH expansion is the #1 source of "why didn't my paper come up?"

## Common expansion patterns

| User typed | Likely MeSH | When it goes wrong |
|------------|-------------|---------------------|
| `heart attack` | `"Myocardial Infarction"[MeSH Terms]` | If the user actually wanted "cardiac arrest", they get the wrong literature |
| `kids` | `"Child"[MeSH Terms] OR "Adolescent"[MeSH Terms]` | Excludes infants unless `"Infant"[MeSH]` added |
| `diabetes` | `"Diabetes Mellitus"[MeSH Terms]` (matches type 1, 2, gestational) | If user wanted T2DM only, append `AND "Diabetes Mellitus, Type 2"[MeSH]` |
| `AI` | Often expanded to `"Artificial Intelligence"[MeSH]` -- but NOT to "machine learning" | Ask user whether to add `OR "Machine Learning"[MeSH]` |
| `stroke` | `"Stroke"[MeSH]` | Subtypes (ischemic vs hemorrhagic) collapsed |

## Study-type filters

Use Publication Type, not free-text:

| Study type | Filter |
|------------|--------|
| RCT (high precision) | `("Randomized Controlled Trial"[Publication Type])` |
| RCT (high sensitivity) | Cochrane HSSS, Cochrane Handbook ch. 4 Box 4.4.a (`--study-type rct-sensitive`) |
| Cohort study | `("Cohort Studies"[MeSH Terms])` |
| Case-control | `("Case-Control Studies"[MeSH Terms])` |
| Cross-sectional | `("Cross-Sectional Studies"[MeSH Terms])` |
| Prediction model | `("Prognosis"[MeSH] AND "Models, Statistical"[MeSH])` -- imperfect |
| Systematic review | `("Systematic Review"[Publication Type])` |
| Meta-analysis | `("Meta-Analysis"[Publication Type])` |
| Diagnostic accuracy | `("Sensitivity and Specificity"[MeSH])` |

## Date and language filters

- `AND ("last 5 years"[PDat])`
- `AND English[lang]` -- opt-in only (`--english-only`); language limits risk language bias (Cochrane Handbook §4.4)
- `NOT (animals[mh] NOT humans[mh])` -- excludes animal-only records while keeping records not yet MeSH-indexed; `AND humans[MeSH Terms]` drops in-process and ahead-of-print records

## What NOT to filter on

- Do NOT filter on `journal[ta]` unless the user explicitly asks; you'll miss the actual best paper that's in a smaller journal
- Do NOT filter on impact factor (NCBI doesn't expose it); compute from a journal whitelist if needed

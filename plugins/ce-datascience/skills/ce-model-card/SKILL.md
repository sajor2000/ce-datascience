---
name: ce-model-card
description: "Generate clinical or biomedical model cards covering intended use, data, performance, calibration, fairness, and limitations. Use when the user asks for a model card, prediction model documentation, AI reporting artifact, or validation summary."
argument-hint: "<model artifact path>, optional: --eval-output path/to/eval-results.json"
---

# Model Card Generator


## Skill Value

- **Problem it solves:** Models can ship without clear intended use, validation scope, subgroup behavior, or clinical limitations.
- **Use when:** The user asks for a model card, prediction model documentation, AI reporting artifact, or validation summary.
- **Output:** A model card with intended use, data provenance, metrics, calibration, fairness, risks, and limitations.
- **Ask only if:** Only when intended use, population, model type, or validation evidence is missing.
- **Do not do:** Do not fabricate performance metrics or approval claims.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Generates a model card in the model-card framework introduced by Mitchell and colleagues (a computer-science conference paper outside PubMed; locate it through Paperclip or the publisher before citing it), adapted for clinical/biomedical use, and supports TRIPOD+AI (PMID 38626948) reporting of performance, fairness, and model availability. Look up the exact reporting-item numbers and any regulatory expectation per Evidence access rather than asserting them.

## When this skill activates

- After model evaluation is done (overall + subgroup performance computed)
- Before manuscript submission for prediction-model studies
- After `ce-code-review` flagged absent model card during TRIPOD+AI compliance check
- Manual: `ce-model-card models/risk-model.pkl --eval-output reports/eval-2025-04.json`

## Prerequisites

- A trained model artifact (any format: pickle, joblib, .rds, .keras, .pt, ONNX)
- Evaluation results: overall metrics + per-subgroup metrics (sex, race, age, site at minimum)
- Calibration plot data (prob-binned or smoothed)
- Training data summary (N, dates, source, features list)

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** fairness-metric definitions (demographic parity, equalized odds, calibration by group) and the reporting items the card must satisfy (TRIPOD+AI, PMID 38626948, DOI 10.1136/bmj-2023-078378; model-card and model-reporting literature), cited by PMID or DOI with an evidence label; literature never supplies, adjusts, or recomputes a performance metric, and every number in the card comes from the eval output.

## Core workflow

### Step 1: Read the model + eval output

Parse the eval-output JSON. Expected schema:

```json
{
  "model_id": "risk-model-v2",
  "training": {
    "n": 12500, "dates": "2018-01 to 2022-12",
    "source": "EHR site A", "features": ["age", "sex", "creatinine"]
  },
  "evaluation": {
    "internal": { "auc": 0.84, "auc_ci": [0.82, 0.86], "brier": 0.18, "calibration_intercept": -0.02, "calibration_slope": 1.04 },
    "external": { "auc": 0.79, "n": 5500, "site": "B" },
    "subgroups": {
      "sex_F": { "auc": 0.85, "n": 7100 },
      "sex_M": { "auc": 0.83, "n": 5400 },
      ...
    }
  }
}
```

If the eval output is missing required fields, surface the gap and refuse to generate a card with placeholders.

### Step 2: Fill the template

Use `references/model-card-template.md`. Sections:

1. **Model details** -- name, version, date, type, owner
2. **Intended use** -- primary intended use, primary intended users, out-of-scope use cases
3. **Factors** -- relevant subgroups, evaluation factors
4. **Metrics** -- model performance overall and by subgroup (table)
5. **Evaluation data** -- datasets, motivation, preprocessing
6. **Training data** -- as above for training
7. **Quantitative analyses** -- unitary and intersectional results
8. **Ethical considerations** -- subjects, mitigations, risks
9. **Caveats and recommendations** -- known limitations, recalibration plan, monitoring plan

### Step 3: Build the fairness summary table

For each protected attribute in the eval output, report (derive gaps and ratios only from reported values; never rerun the evaluation or recompute from predictions, and treat a missing metric as a Step 1 gap):

- AUC per group + 95% CI
- Calibration intercept + slope per group
- Sensitivity and specificity at the deployment threshold per group
- Demographic parity ratio (selection rate group_A / group_B)
- Equalized odds gap (max TPR difference across groups)

Highlight any AUC gap > 0.05 or calibration intercept |Δ| > 0.10 in the card body, not just in a footnote. These flags are project defaults, not literature thresholds; if the card claims a benchmark, cite it per Evidence access.

### Step 4: Write outputs

- `analysis/model-card.md` -- the markdown card
- `analysis/model-card.html` -- rendered (for sharing)
- `analysis/model-card.json` -- structured form for deployment registries

### Step 5: Cross-link

Write a one-line reference at the bottom of the SAP and the manuscript Methods section:

> "Model card available at `analysis/model-card.md`."

## What this skill does NOT do

- Does not run the evaluation (you bring eval results)
- Does not fix unfair models -- it surfaces gaps; mitigation is a separate decision (see `ce-fairness-reviewer`)
- Does not validate calibration -- that's `ce-calibration-reviewer`
- Does not handle pre-deployment monitoring -- see `ce-concept-drift-reviewer` and ML lifecycle tools

## References

@./references/model-card-template.md

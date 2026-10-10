---
name: ce-phenotype-validate
description: "Validate a computable phenotype against chart-review reference labels: 2x2 table, sensitivity, specificity, PPV, and NPV with Wilson intervals, plus subgroup and sample-size-aware reporting. Use when the user defines, reviews, or re-validates a clinical phenotype or code-list cohort definition with chart-review data."
argument-hint: "<phenotype name>, <chart-review CSV path>, optional --algorithm-output csv"
---

# Phenotype Algorithm Validation


## Skill Value

- **Problem it solves:** Phenotype algorithms can look plausible but misclassify cases, and their accuracy can differ across subgroups or datasets.
- **Use when:** The user defines, reviews, or validates clinical phenotypes, code lists, or computable cohort definitions.
- **Output:** Phenotype validation report (2x2, PPV/NPV/sensitivity/specificity with Wilson CIs, subgroup results, sample-size caveats), a suppressed aggregate CSV, a concept-set provenance update, and a handoff signal.
- **Ask only if:** Only when phenotype target, source vocabularies, or validation data are unclear.
- **Do not do:** Do not certify clinical validity without evidence.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

EHR phenotypes are algorithmic case definitions (e.g., "T2DM = 2+ ICD codes within 12 months OR HbA1c ≥ 6.5% OR T2DM medication"). They drift, they have built-in PPV/sensitivity tradeoffs, and they need explicit validation. This skill runs the validation against a chart-review gold standard.

## When this skill activates

- A new phenotype is defined and used as inclusion / outcome
- A previously-validated phenotype is being applied to a new dataset (re-validate, don't trust)
- Reviewer (`ce-administrative-data-reviewer`) flagged unvalidated phenotype
- Manual: `ce-phenotype-validate T2DM analysis/cohort/chart-review-T2DM.csv`

## Prerequisites

- A chart-review file (`chart-review-<phenotype>.csv`) with columns: `subject_id`, `chart_label` (0/1 = absent/present per chart adjudication)
- An algorithm output file: same `subject_id`s, with `algo_label` (0/1 = phenotype-not-met / phenotype-met)
- Optional: subgroup columns (`sex`, `age_band`, `race`)

Typical chart-review N: 100-300 patients (a project convention, not a literature value), sampled in a stratified way (50% algo-positive, 50% algo-negative).

## PHI and disclosure rules

The chart-review file is patient-level PHI — a manually adjudicated gold standard keyed by `subject_id`. Handle it like any patient-level extract:

- Keep the chart-review and algorithm-output files in a gitignored location (e.g., `output/intermediate_phi/`); never commit, share, or copy them into report directories. If they arrive elsewhere, verify the path is gitignored before proceeding.
- Never echo `subject_id`s, row-level data, or free-text chart excerpts into the report, the chat, or error messages. Reports carry aggregate counts only.
- Apply small-cell suppression to every reported cell — confusion-matrix cells and subgroup rows alike. Default disclosure floor is n<11 unless the project declares its own floor (for example the CLIF consortium floor of n>=10) or a site or DUA rule is stricter: suppress or merge subgroups below the floor, and suppress complementary cells recoverable by subtraction from totals. Small N is a re-identification risk, not only a CI-width problem.
- The saved cell-count CSV (Step 6) contains only suppressed aggregate counts, never `subject_id`-level rows.

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** published PPV/sensitivity/specificity benchmarks for this phenotype, vocabulary, and population (PheKB/eMERGE validations, RECORD-style validation reports), cited by PMID and used only as comparators; any PPV assumed before the chart review (for example the planning value in `references/sampling-strategies.md`) is an assumption until a looked-up or measured value replaces it.

## Core workflow

### Step 1: Load and merge

Inner-join chart-review on `subject_id`. Any subject in one but not the other → flag and drop. Report N matched, N dropped.

### Step 2: Compute the 2x2

| | Chart positive | Chart negative |
|--|----------------|----------------|
| Algo positive | TP | FP |
| Algo negative | FN | TN |

### Step 3: Compute metrics with Wilson 95% CI

- **PPV** = TP / (TP + FP) -- "of those flagged by the algorithm, what fraction are real cases?"
- **NPV** = TN / (TN + FN) -- "of those NOT flagged, what fraction are truly negative?"
- **Sensitivity** = TP / (TP + FN) -- "of the real cases, what fraction does the algorithm catch?" (NOTE: sampled-stratified chart review may bias this; report design)
- **Specificity** = TN / (TN + FP)
- **F1** = 2 * (PPV * Sens) / (PPV + Sens)
- **Cohen's kappa** = agreement-beyond-chance

For each, use Wilson score interval (better small-sample behavior than Wald):

```
p = TP / (TP + FP)
n = TP + FP
z = 1.96
center = (p + z^2 / (2*n)) / (1 + z^2 / n)
half_width = z * sqrt(p*(1-p)/n + z^2 / (4*n^2)) / (1 + z^2/n)
ci = (center - half_width, center + half_width)
```

### Step 4: Per-subgroup validation

Repeat all metrics by subgroup (sex, age band, race, site) when subgroup data is in the chart-review file. Phenotype performance can differ by subgroup; do not assert a published subgroup pattern (for example a lower PPV in one age band) without a source read and cited by PMID per Evidence access.

### Step 5: Sample-size-aware reporting

If chart-review N is too small for stable estimates:
- N < 50 in any cell → report estimate but mark "wide CI; consider expanding chart review"
- N < 30 in any subgroup → warn and either pool or omit
- Below the disclosure floor (default n<11) in any reported cell or subgroup → suppress or merge before the statistical caveats even apply; see "PHI and disclosure rules"

### Step 6: Write the report

`reports/phenotype-validation/<phenotype>-<date>.md`:

```
# Phenotype validation: T2DM

## Algorithm
"2+ ICD-10 E11.x within 12 months OR HbA1c >= 6.5% OR T2DM-specific medication"
Source: analysis/cohort/concept-sets/T2DM.yaml (vocab v2024-Q1)

## Chart review
N = 200 (100 algo-positive, 100 algo-negative)
Adjudicators: 2 (with consensus); kappa = 0.91
Sampling: stratified random within algo strata

## Performance overall

| Metric | Estimate | 95% CI |
| PPV | 0.94 | (0.88, 0.97) |
| Sens | 0.86 | (0.78, 0.91) |
| Spec | 0.93 | (0.86, 0.97) |
| NPV | 0.85 | (0.77, 0.91) |
| F1 | 0.90 | -- |

## Performance by subgroup

| Subgroup | N | PPV | Sens |
| Female | 105 | 0.95 | 0.88 |
| Male | 95 | 0.93 | 0.83 |
| 18-44 | 40 | 0.85 | 0.75 |  # narrower CI; flag
| 45-64 | 80 | 0.96 | 0.88 |
| 65+ | 80 | 0.95 | 0.87 |

## Implications for the study

PPV >= 0.90 (project threshold; an assumption unless a cited benchmark replaces it) → misclassification bias judged small for this use.
Sensitivity in 18-44 is lower; if the cohort skews young, expect under-ascertainment.
```

The numbers in this example are illustrative, not benchmarks; a comparison with a published PPV or sensitivity cites its PMID and evidence label.

Save `reports/phenotype-validation/<phenotype>-<date>.csv` for the cell counts and confusion matrix — suppressed aggregates only, per "PHI and disclosure rules" (no `subject_id`s, no cells below the disclosure floor).

The bundled script computes Steps 2-5 from one merged CSV (`subject_id`, `chart_label`, `algo_label`, optional `sex`/`age_band`/`race`/`site`), so write the Step 1 merge to a gitignored path first:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
python3 "$SKILL_DIR/scripts/validate_phenotype.py" <phenotype> <merged-csv> --out reports/phenotype-validation/<phenotype>-<date>.md
```

It writes the Markdown report and a `.yaml` validation block beside it, and drops subgroups with n<11. It does not suppress confusion-matrix or complementary cells and does not write the CSV: apply the disclosure rules to both before saving or sharing.

### Step 7: Update the concept set provenance

Add to `analysis/cohort/concept-sets/<phenotype>.yaml`:

```yaml
validation:
  against: <chart-review file>
  date: <ISO>
  ppv: 0.94
  ppv_ci: [0.88, 0.97]
  sens: 0.86
  spec: 0.93
  npv: 0.85
  by_subgroup:
    sex: ...
    age_band: ...
```

### Step 8: Emit signal

The bundled script (`scripts/validate_phenotype.py`) prints the canonical envelope:

```
__CE_PHENOTYPE_VALIDATE__ name=<phenotype-name> n=<n> ppv=<v> sens=<v> report=<path-to-report.md> yaml=<path-to-validation.yaml>
```

Surface this line so `ce-plan` SAP mode and the concept-set provenance YAML pick the validation up.

## What this skill does NOT do

- Does not adjudicate the chart review (that's a human task; this skill assumes the gold-standard labels are given)
- Does not adjust for chart-review sampling design beyond noting stratified sampling
- Does not make the phenotype better -- only measures it
- Does not handle continuous-outcome phenotypes (e.g., HbA1c-as-continuous); restricted to binary phenotype labels

## References

@./references/wilson-ci.md

@./references/sampling-strategies.md

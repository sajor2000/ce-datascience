---
name: ce-effect-size
description: "Extract, compute, or pool effect-size evidence to ground power, SAP assumptions, and study justification. Use when the user needs effect-size assumptions, pilot estimates, pooled estimates, or literature-derived values."
argument-hint: "<path/to/methods.csv>, optional: --metric OR|HR|RR|MD|SMD"
---

# Effect-Size Anchor for Power Calculations


## Skill Value

- **Problem it solves:** SAPs often choose effect assumptions without traceable prior evidence.
- **Use when:** The user needs effect-size assumptions, pilot estimates, pooled estimates, or literature-derived values.
- **Output:** Effect-size summary with sources, assumptions, uncertainty, and downstream SAP/power handoff.
- **Ask only if:** Only when outcome scale, comparison, estimand, or source set is ambiguous.
- **Do not do:** Do not overstate causal interpretation or replace formal meta-analysis when one is required.
- **Formal synthesis:** Use `ce-clif-meta-analysis` for a complete systematic review or CLIF site-to-lead analysis. The sample-size filter and power-anchor workflow here are not review eligibility rules.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Bridges `ce-method-extract` (which collects what prior studies REPORTED) and `ce-power` (which needs a single number to plug in). Without this skill, analysts pick the most favorable prior estimate and over-power; with it, they get a defensible pooled estimate with explicit uncertainty.

## When this skill activates

- After `ce-method-extract` has produced `analysis/pubmed/<query>-methods.csv`
- Before `ce-power` so the effect-size assumption is anchored
- Manual: `ce-effect-size analysis/pubmed/sepsis-bundle-methods.csv --metric HR`

## Prerequisites

- A methods CSV with at minimum: pmid, year, sample_size, effect_size_reported (and ideally lo / hi 95% CI)
- The metric is consistent across studies (all OR, or all HR, etc.) -- if mixed, the skill will subset to the modal metric and report on the rest narratively

## Evidence access

Use connected MCP servers for literature; never invent a citation, effect size, or guideline item.

- **PubMed MCP** (canonical biomedical metadata). Call by purpose; two servers are common, so match the name on whichever is connected: search (`pubmed_search_articles` or `search_articles`), metadata by PMID (`pubmed_fetch_articles` or `get_article_metadata`), partial reference to PMID (`pubmed_lookup_citation` or `lookup_article_by_citation`), PMID/PMCID/DOI conversion (`pubmed_convert_ids` or `convert_article_ids`), related papers (`pubmed_find_related` or `find_related_articles`), full text (`pubmed_fetch_fulltext`, or `get_copyright_status` then `get_full_text_article` for open PMC). The documented default server (`@cyanheads/pubmed-mcp-server`) also offers `pubmed_lookup_mesh`, `pubmed_spell_check`, `pubmed_europepmc_search`, and `pubmed_format_citations` (a display check, never a substitute for a reference-manager field). Tool names carry the harness's server prefix (for example `mcp__PubMed__search_articles` in Claude Code).
- **Paperclip MCP** (full text across papers, preprints, trials, FDA documents): `search` with an explicit `source` (for example `pmc`), `lookup` by DOI/PMID/PMCID, then `cat`, `grep`, `scan`, `map`, or `filter` on the result, and `ask-image` for figures. The authenticated `paperclip` CLI is the fallback; neither is required.
- **Fallbacks:** without PubMed MCP, run the `ce-pubmed` skill's bundled E-utilities script; without Paperclip, continue PubMed-only and state the full-text limitation.
- **Rules:** no PHI, patient-level values, or small-cell counts in any query; a search hit is not evidence until the source is read; label every claim at the level read (`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`); keep PMID/PMCID/DOI, the query string, and the date as provenance; cite PubMed and include DOIs whenever PMC full text is used; lawful full-text access only.
- **Look up here:** prior pooled estimates and their heterogeneity (published meta-analyses on the same question, found with `pubmed_search_articles` or `search_articles` and a `Meta-Analysis[Publication Type]` filter) to compare against the result here, and the paper behind any row whose effect or CI is ambiguous in the methods CSV (PMC full text via `pubmed_fetch_fulltext` or `get_full_text_article`, or Paperclip `cat`/`grep`).

## Core workflow

### Step 0: Context inputs (scan chat first)

If no `<path/to/methods.csv>` was passed, scan the most recent ~50 chat turns for `__CE_METHOD_EXTRACT__ csv=<path> n=<int> modal_method=<...>`. If found, use that CSV as the input. Print `[method-extract] using methods table from <path> (n=<N>, modal=<modal_method>)`.

If neither an explicit path nor the signal is present, ask the user to load the `ce-method-extract` skill first or pass a CSV path explicitly. Never substitute an effect size from memory for a missing table.

### Step 1: Load and parse

Read the methods CSV. Parse the `effect_size_reported` field: extract metric type (OR/HR/RR/MD/SMD), point, lo, hi. Use `references/effect-parser.md` patterns, normalise adjusted labels (`aHR` -> `HR`), and write `analysis/effect-size/<query>-parsed.csv` plus the parsing script next to it (the parsed-CSV contract is in that reference; `scripts/pool_effects.R` reads the parsed CSV, not the raw methods table). Drop rows where parsing fails; report count of dropped rows. Where a row's effect, CI, or metric is ambiguous and the paper is lawfully available, read the results section (see Evidence access) rather than guess, and note the row's `evidence_level` (`full_text` or `abstract`) in the included-studies CSV.

### Step 2: Filter to comparable studies

Filter:
- `metric` matches `--metric` (or modal-metric if not specified); `scripts/pool_effects.R` matches the uppercase label exactly, so pass `HR`, not `hr`
- Sample size present and ≥ 50 (`--min-n`, default 50, applied by `scripts/pool_effects.R`, which prints every count it drops). This cutoff is a working assumption of this skill, not a literature-derived threshold; state it in the output and change it when the user or the question calls for a different one
- Year within last `--years` window if passed
- Optional: study type filter (e.g., RCTs only)

Report N studies in the meta-analysis vs N in the input.

### Step 3: Pool

Run the bundled script on the parsed CSV from Step 1 (columns `pmid, year, first_author, sample_size, metric, effect, effect_lo, effect_hi`; it exits with a one-line message naming any missing column, so the raw methods table will not work). It applies the Step 2 metric, CI, and `--min-n` filters, prints each dropped count, and writes the Markdown summary, a sibling `-forest.png`, and the Step 6 signal:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
Rscript "$SKILL_DIR/scripts/pool_effects.R" --in analysis/effect-size/<query>-parsed.csv --metric HR --out analysis/effect-size/<query>-pooled.md
```

Requires R with current CRAN `meta` and `ggplot2` (`install.packages(c("meta", "ggplot2"))`).

If N ≥ 3:
- For OR / HR / RR: log-transform → random-effects REML (use an explicitly configured R `meta::metagen` or `metafor::rma`; Python statsmodels Paule-Mandel is a different method)
- For MD: random-effects REML on the raw scale
- For SMD: Hedges g + REML
- Report: pooled estimate, 95% CI, 95% prediction interval (PI), I^2 heterogeneity, tau^2
- If `meta` returns no finite PI bounds, say so and report the CI as the fallback sweep range

If N < 3:
- Report narrative range (min, median, max) -- DO NOT pool
- Highlight the highest-quality study (largest N, most recent, RCT > observational) as the anchor
- Caveat the user: "single-study or two-study power calc is fragile; consider running with sensitivity sweep"

After pooling, compare the result with any published meta-analysis found under Evidence access (cite its PMID/DOI and the level read). State agreement or disagreement with its pooled estimate and I^2; a large divergence is a flag for the SAP, not a reason to replace the computed value.

### Step 4: Write the output

`analysis/effect-size/<query>-pooled.md`. `scripts/pool_effects.R` writes the pooled-estimate block and the forest-plot line; append the filtering counts, the "Prior pooled estimates" section, and the `ce-power` handoff to that same file rather than writing a second one (the numbers below are template placeholders; every value comes from the computation, and the "Prior pooled estimates" line names the PMID/DOI of each comparison or says none was found):

```
# Pooled effect-size: <metric> for <outcome> in <population>

Source: 14 studies extracted via `ce-pubmed` and `ce-method-extract` on <date>
Filtered to: <metric>, sample size >=50, last 10 years -> 9 studies pooled

## Pooled estimate

<metric> = 0.78 (95% CI 0.65-0.93; 95% PI 0.52-1.17)
I^2 = 42% (moderate heterogeneity)
tau^2 = 0.04

## Prior pooled estimates

<PMID/DOI of each published meta-analysis compared, its pooled estimate and I^2, and the level read; or "none found for <query> on <date>">

## Forest plot

See `analysis/effect-size/<query>-pooled-forest.png`

## For `ce-power`

Use point estimate 0.78 with sensitivity sweep across PI bounds (0.52 to 1.17).
Power calc anchor: detect HR <= 0.78 with alpha=0.05, power=0.80.
```

Also save a CSV: `analysis/effect-size/<query>-included.csv` (which studies, why included, their PMID/DOI, and `evidence_level`). `ce-power` reads this file for the PMIDs it cites in SAP-6, since the signal line carries numbers only.

### Step 5: Generate forest plot

Use R `meta::forest()` or Python `matplotlib`. Each study's point and CI; pooled point and CI at the bottom.

### Step 6: Emit signal

The bundled `scripts/pool_effects.R` prints the canonical envelope. REML (k>=3) form:

```
__CE_EFFECT_SIZE__ metric=<m> n_studies=<n> point=<v> ci=<lo,hi> pi=<lo,hi|NA> i2=<pct> mode=reml
```

`pi=` carries the 95% prediction interval on the reported scale (exponentiated for ratio metrics). It is `pi=NA` when `meta` returns no finite PI bounds for this k and tau^2.

Narrative form (k<3, no pooling):

```
__CE_EFFECT_SIZE__ metric=<m> n_studies=<n> point=null ci=null pi=NA i2=null mode=narrative
```

Both forms share the same key set so `ce-power` can scan one regex. `ce-power` sweeps over `pi=` when both bounds are finite and falls back to `ci=` otherwise. When `mode=narrative`, `ce-power` should fall back to the user-supplied effect size or stop and ask, rather than try to read `point=null` as a number.

## What this skill does NOT do

- Does not do a full systematic-review meta-analysis (no risk-of-bias scoring, no PRISMA flow); that's a separate study type, use the `ce-checklist-match` skill to register it as PRISMA
- Does not impute missing CIs (drops studies with missing CI rather than guessing)
- Does not handle network meta-analysis (use `netmeta` package directly)
- Does not compute power (that's `ce-power`)

## References

@./references/effect-parser.md

@./references/pooling-formulas.md

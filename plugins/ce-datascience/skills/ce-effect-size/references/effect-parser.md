# Effect-Size String Parsers

The `effect_size_reported` field in `ce-method-extract` output is free-text. Parse it with the regex patterns below.

## Hazard / odds / risk ratios

```
HR 0.78 (0.65, 0.93)            -> metric=HR, point=0.78, lo=0.65, hi=0.93
OR=1.45 (95% CI 1.10-1.91)      -> metric=OR, point=1.45, lo=1.10, hi=1.91
RR 0.80 [0.71-0.90]             -> metric=RR, point=0.80, lo=0.71, hi=0.90
adjusted HR 0.77, 95% CI 0.61 to 0.97 -> metric=HR, point=0.77, lo=0.61, hi=0.97
```

Regex (Python). Numbers may be signed, so MD/SMD reductions such as "MD -2.4 (-3.7 to -1.1)" keep their sign; a hyphen counts as a range separator only when it is surrounded by spaces or directly followed by a digit:

```
metric_re   = r'\b(HR|OR|RR|aOR|aHR|aRR|IRR|SMR|HRR|MD|SMD)\b'
number_re   = r'([−-]?\d*\.?\d+)'
estimate_re = rf'(?:=|\s){number_re},?\s*[\(\[]?\s*(?:95%\s*CI[:\s]*)?{number_re}\s*(?:\bto\b|,|;|–|—|\s-\s|-(?=\d))\s*{number_re}'
```

Replace the Unicode minus (`−`) with `-` before `float()`. After parsing, check every row: point and both bounds must be positive for ratio metrics, and `lo <= point <= hi` for every metric. A row that fails is a parse error, not data (for example "-1.2-0.2", which is ambiguous); drop it and count it with the other unparseable rows. Never drop a row only because its effect is negative: losing harms or reductions biases the pool.

## Adjusted labels

Normalise `aHR`, `aOR`, `aRR`, and "adjusted HR" to the base label in the `metric` column and keep the adjustment in a separate `adjusted` (true/false) column, because `scripts/pool_effects.R` matches `--metric` against the label exactly and would silently leave `aHR` rows out of an `HR` pool.

Sharing a label does not make them interchangeable. OR and HR are non-collapsible: a covariate-adjusted (conditional) OR or HR sits further from 1 than the marginal one even without confounding (Daniel, Zhang & Farewell, Biom J 2021;63:528-57, PMID 33314251). When both kinds are present, pool the full set and each kind separately (filter the parsed CSV on `adjusted`), report all three, and state which one matches the planned trial's estimand (usually marginal for an unadjusted primary analysis). RR and MD are collapsible, so this split matters less for them.

## Parsed CSV contract

Write the parsed table to `analysis/effect-size/<query>-parsed.csv` with at least `pmid, year, first_author, sample_size, metric, effect, effect_lo, effect_hi` (plus `doi`, `pmcid`, `study_type`, `adjusted`, `evidence_level` when present). Save the parsing code itself as `analysis/effect-size/<query>-parse.R` or `.py` in the project, not in a scratch directory, so the pooled number can be regenerated from the methods CSV.

## Mean differences

```
MD 2.4 (95% CI 1.1-3.7) mmHg     -> metric=MD, point=2.4, lo=1.1, hi=3.7, unit=mmHg
SMD 0.34 (0.18-0.50)             -> metric=SMD, point=0.34, lo=0.18, hi=0.50
mean diff 4.5 (SE 1.2)           -> metric=MD, point=4.5, se=1.2 (compute CI: 4.5 +/- 1.96*1.2)
```

## P-value-only reports

```
p < 0.001    -> point and CI not extractable; do NOT include in pooled estimate
p = 0.04
```

These rows are dropped from pooling. Surface count of dropped rows in the report.

## Survival outcomes (special)

When the paper reports both HR and median-survival difference, prefer HR for pooling. Median-survival differences are harder to combine across designs.

## Conversion rules

- For binary outcomes pooled across studies, prefer log(OR) or log(RR) -> pool log -> exponentiate the pooled estimate
- For continuous outcomes, prefer SMD over MD when scale differs across studies (Hedges g, with Hedges correction for small samples)
- For survival, prefer log(HR) -> pool -> exponentiate

## Conversions for the ce-power handoff

Label every converted value as a conversion, with its inputs and their sources.

- Hedges g from Cohen d: `g = J * d`, `J = 1 - 3/(4*(n1 + n2) - 9)`. Record which one each study reported.
- ln(OR) -> SMD: `d = ln(OR) * sqrt(3)/pi` (= ln(OR)/1.81; Chinn, Stat Med 2000;19:3127-31, PMID 11113947). Assumes a logistic latent variable with comparable variation across studies.
- Two-proportion inputs from a ratio and a control risk P0: `p_T = OR*P0 / (1 - P0 + OR*P0)` or `p_T = RR*P0`. Cite P0 separately (PMID and level read); never pass an OR or RR to a two-proportion function as if it were a proportion.
- OR -> RR at control risk P0: `RR = OR / (1 - P0 + P0*OR)` (Zhang & Yu, JAMA 1998;280:1690-1, PMID 9832001). OR approximates RR only when P0 is below about 10%. The formula is exact for an unadjusted OR at the true P0, but biased with too-narrow CIs when applied to adjusted ORs (Gallis & Turner, Ann Glob Health 2019, PMID 31807416).
- NNT = `1/|P0 - p_T|`; state P0 and the time horizon. Never compute NNT from an OR or RR without P0.
- HR is not an RR or OR. Convert to event probabilities only through a survival model, for example `p_T(t) = 1 - (1 - P0(t))^HR` under proportional hazards, where `P0(t)` is the control-arm event probability by time `t`.

## Edge cases

- Asymmetric CI on log scale (lo too far from point given hi): refit by computing SE = (log(hi) - log(lo)) / (2 * 1.96) and using log(point) +/- 1.96 * SE
- Confidence levels other than 95%: convert (e.g., 90% CI -> SE = (hi - lo) / (2 * 1.645))
- Multiple effect estimates per paper (primary + sensitivity): use the primary

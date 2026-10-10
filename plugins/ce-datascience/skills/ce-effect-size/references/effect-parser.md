# Effect-Size String Parsers

The `effect_size_reported` field in `ce-method-extract` output is free-text. Parse it with the regex patterns below.

## Hazard / odds / risk ratios

```
HR 0.78 (0.65, 0.93)            -> metric=HR, point=0.78, lo=0.65, hi=0.93
OR=1.45 (95% CI 1.10-1.91)      -> metric=OR, point=1.45, lo=1.10, hi=1.91
RR 0.80 [0.71-0.90]             -> metric=RR, point=0.80, lo=0.71, hi=0.90
adjusted HR 0.77, 95% CI 0.61 to 0.97 -> metric=HR, point=0.77, lo=0.61, hi=0.97
```

Regex (Python; the optional comma after the point and the `(?:-|–|,|to)` group are what let the "0.77, 95% CI 0.61 to 0.97" form parse):

```
metric_re = r'\b(HR|OR|RR|aOR|aHR|aRR|IRR|SMR|HRR)\b'
estimate_re = r'(?:=|\s)([\d.]+),?\s*[\(\[]?\s*(?:95%\s*CI[:\s]*)?([\d.]+)\s*(?:-|–|,|to)\s*([\d.]+)'
```

After parsing, check every row: point and both bounds must be positive for ratio metrics, and `lo <= point <= hi`. A row that fails is a parse error, not data; drop it and count it with the other unparseable rows.

## Adjusted labels

`aHR`, `aOR`, `aRR`, and "adjusted HR" are the same metric as `HR`, `OR`, `RR` for pooling. Normalise them to the base label in the `metric` column and keep the adjustment in a separate `adjusted` (true/false) column, because `scripts/pool_effects.R` matches `--metric` against the label exactly and would silently leave `aHR` rows out of an `HR` pool.

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

## Edge cases

- Asymmetric CI on log scale (lo too far from point given hi): refit by computing SE = (log(hi) - log(lo)) / (2 * 1.96) and using log(point) +/- 1.96 * SE
- Confidence levels other than 95%: convert (e.g., 90% CI -> SE = (hi - lo) / (2 * 1.645))
- Multiple effect estimates per paper (primary + sensitivity): use the primary

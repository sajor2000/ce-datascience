# Data QA Report — `<extract_id>`

## Summary

**Status**: `<GO | NO-GO | GO with PI sign-off>`
**Extract**: `<extract_id>`
**Hash**: `<sha256>`
**Generated**: `<YYYY-MM-DD HH:MM>`
**SAP**: `<path/to/sap.md>` (version `<sap_version>`)

| Bucket | Count | Action |
|--------|-------|--------|
| block  | N     | NO-GO unless resolved |
| warn   | N     | PI sign-off required |
| info   | N     | informational |
| pass   | N     | check ran cleanly |

## Wave provenance

| Field | Value |
|-------|-------|
| extract_id | `<id>` |
| source | `<EHR system / database name>` |
| query_id | `<query identifier>` |
| extracted_at | `<datetime>` |
| extracted_by | `<analyst name>` |
| row_count | `<N>` |
| column_count | `<M>` |
| hash (sha256) | `<hash>` |
| location | `<path / s3 uri / box folder>` |
| prior_wave | `<extract_id of preceding wave, if any>` |

## CONSORT / STROBE flow

```
Source population: <N>
  Eligible:        <N>  (excluded: <reasons>)
    Allocated:     <N>  (lost-to-follow-up: <N>)
      Analyzed:    <N>
```

## Missingness map

(Heatmap rendered to `missingness-<extract_id>.png`. Tabular fallback below.)

| Variable | % Missing | Pattern | Notes |
|----------|-----------|---------|-------|
| ...      | ...       | ...     | ...   |

## Findings

### Block findings (N)

| QA-id | Variable | Detail |
|-------|----------|--------|
| QA-2  | `outcome_var` | Required by SAP-2.1, absent from extract |

### Warn findings (N)

| QA-id | Variable | Detail | PI decision |
|-------|----------|--------|-------------|
| QA-6  | `bp_diastolic` | 12% missing; SAP allows ≤ 5% | __pending__ |

### Info findings (N)

| QA-id | Variable | Detail |
|-------|----------|--------|
| QA-11 | (overall) | Missingness pattern: monotone. Implies LOCF or MNAR-aware imputation. |

## Distribution snapshots

(Per-variable histograms / box plots saved to `dist-<extract_id>/`. One row per primary variable.)

| Variable | n | mean / mode | sd | min | p25 | p50 | p75 | max | n_missing |

## PI sign-off (only if warn findings exist)

```
[ ] I have reviewed each warn finding above.
[ ] For QA-6 (bp_diastolic 12% missing), I authorize: <imputation strategy / sensitivity plan>.
Signed: ____________________ Date: ____________
```

## Next steps

If GO: run `data_lock(extract_id="<id>")` to seal the wave, then proceed to modeling.

If NO-GO: file each blocker as a data extract issue, re-extract, and re-register a new wave.

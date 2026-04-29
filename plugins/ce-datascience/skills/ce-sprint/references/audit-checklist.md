# Sprint Audit Checklist

Used by `ce-sprint-audit-reviewer` at `/ce-sprint close` time. The reviewer walks each item and produces a P0/P1/P2 finding per failure.

## P0 (block sign-off)

1. **Planned output missing** -- a row in `planned_outputs` has no corresponding artifact at the declared `subfolder/output_file` path
2. **Output hash drift** -- an output exists but re-running the producing script (in a clean environment) yields a different hash. Reproducibility is broken
3. **Out-of-scope SAP edit** -- any analysis/ file outside `scope.sap_sections` was modified between `opened` and `closed` timestamps. Sprint discipline is broken
4. **Data wave changed mid-sprint** -- `data_wave_id` in `data-state.yaml` does not match `entry_criteria.data_wave_id`. Underlying data shifted
5. **SAP version changed mid-sprint** -- `sap_version` in `analysis/sap.md` does not match `entry_criteria.sap_version`. SAP drifted

## P1 (warn; sign-off allowed with note)

1. **Extra output produced** -- an artifact exists in the sprint's subfolders that is not in `planned_outputs`. Could be exploratory; reviewer decides
2. **Errored notebook / Quarto chunk** -- any `.qmd` or `.ipynb` cell errored during render. Not necessarily a sprint failure (could be a known TODO)
3. **Long sprint duration** -- > 4 weeks elapsed between `opened` and `closed`. Suggest splitting next time
4. **No commits during sprint** -- 0 git commits between `opened` and `closed`. Was work actually done?

## P2 (info; cosmetic)

1. **File order in folder differs** from declared `planned_outputs` order
2. **README in sprint folder is empty** -- minor; not a blocker
3. **Sprint name is generic** (`sprint`, `sprint-1`) -- suggest descriptive naming for future sprints

## Reproducibility re-run

If the project has a `Makefile` or `_targets.R` or `dvc.yaml`, the reviewer attempts a clean re-run:

```bash
git stash
git checkout HEAD~0   # ensure clean
make clean && make    # or tar_make() or dvc repro
```

If hashes match → ok. If not → P0 finding.

If no build system exists, skip the re-run and emit a P1 "no automated build; manual reproducibility check required".

## Output

`ce-sprint-audit-reviewer` returns JSON:

```json
{
  "reviewer": "sprint-audit",
  "sprint": "sprint-02",
  "findings": [
    {"severity": "P0", "title": "...", "detail": "..."}
  ],
  "summary": {
    "P0": 0, "P1": 1, "P2": 0,
    "outputs_planned": 5,
    "outputs_produced": 5,
    "outputs_extra": 0,
    "out_of_scope_edits": 0,
    "reproducibility_check": "passed"
  }
}
```

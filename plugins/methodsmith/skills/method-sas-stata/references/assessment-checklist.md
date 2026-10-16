# SAS/Stata Assessment Checklist

## Inventory

- Count `.sas`, `.do`, and `.ado` files.
- Identify data read/write locations.
- Identify model procedures and commands.
- Identify macros, includes, globals, and working-directory assumptions.
- Identify output-producing commands (`ods`, `putexcel`, `esttab`, `outreg2`, exported CSV/RTF/PDF).

## Risk Flags

- Absolute paths or user-home paths.
- Hidden state (`cd`, `libname`, global macros, Stata globals) that changes behavior by machine.
- Unpinned package or ado dependencies.
- Model commands without seed-setting where randomization, bootstrapping, imputation, or matching is used.
- Patient-level data files in the repo.

## Porting Boundary

Port only one bounded output at a time. Preserve the original output, run the ported output, and compare model terms, estimates, confidence intervals, p-values, row counts, and missingness handling before calling the port equivalent.

Before comparing outputs, align defaults that differ across software and record each choice (the bundled script lists the ones it detects):

- Cox ties: R `coxph` uses Efron; SAS PROC PHREG and Stata `stcox` use Breslow.
- PROC LOGISTIC models the response with Ordered Value 1 (Y=0 for a 0/1 outcome) unless `EVENT=` or `DESCENDING` is set, and its CLASS default is `PARAM=EFFECT`.
- Reference levels: SAS CLASS `REF=LAST` by default (PHREG and GENMOD use reference coding); R uses the first factor level.
- Mixed models: SAS PROC MIXED reports denominator df (`DDFM=`); `lme4` reports none (use `lmerTest` Satterthwaite or `pbkrtest` Kenward-Roger to match).
- Robust/cluster SEs: Stata `vce(cluster)` applies a small-sample factor including G/(G-1).
- Percentiles: SAS `PCTLDEF=5` vs R `quantile(type = 7)`.

## Example report (abridged)

```text
# SAS/Stata Assessment
Result: ASSESSMENT-ONLY
## Inventory
- SAS files: 4
- Stata files: 2
## SAS Signals
- `proc_phreg`: analysis/02_cox.sas
- `libname`: analysis/00_setup.sas
## Stata Signals
- `vce_cluster`: analysis/sens.do
## Defaults to align before comparing a port
- Cox ties: SAS PROC PHREG defaults to TIES=BRESLOW; R survival::coxph defaults to Efron.
## Recommendation
- Port one bounded output at a time and compare estimates before claiming equivalence.
```


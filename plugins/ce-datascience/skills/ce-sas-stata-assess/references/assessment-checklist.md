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

---
name: ce-r-performance
description: "Profile, benchmark, and optimize R code using evidence-driven performance work. Use for slow R scripts, memory pressure, vectorization, data.table/dplyr trade-offs, parallelism, or runtime regressions."
argument-hint: "[profile|benchmark|memory|parallel]"
---

# R Performance

## Skill Value

- **Problem it solves:** Performance rewrites can change analytical behavior, inflate memory use, or optimize an unmeasured bottleneck.
- **Use when:** An R workflow is slow, memory-bound, repeatedly allocates, or needs a justified performance improvement.
- **Output:** A baseline, bottleneck evidence, bounded optimization, and before/after measurement.
- **Ask only if:** The representative workload, performance target, or behavioral invariant is unclear.
- **Do not do:** Do not change results, precision, or missing-data behavior merely to improve a benchmark.

## Workflow

1. Define the representative input, correctness invariants, runtime/memory target, and acceptable trade-offs.
2. Profile before changing code. Measure elapsed time and memory under comparable conditions.
3. Prefer algorithmic and data-layout improvements before micro-optimizations or parallel execution.
4. Evaluate vectorization, data.table, dplyr, database pushdown, or parallelism against the actual workload rather than ideology.
5. Re-run data and result validations after optimization; compare key outputs, row counts, types, and numerical tolerances.
6. Report baseline, changed condition, and residual limits. Never claim a speedup without comparable measurements.

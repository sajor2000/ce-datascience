---
name: ce-fabric-coding
description: "Write or review Microsoft Fabric Lakehouse, OneLake, Warehouse, Spark, Python-notebook, and Delta-table code. Use for PySpark, Spark SQL, T-SQL, Fabric notebooks, Spark job definitions, OneLake paths, and SQL analytics endpoint questions."
argument-hint: "[lakehouse|warehouse|spark|python-notebook]"
---

# Fabric Data Engineering

## Skill Value

- **Problem it solves:** Fabric engine and path choices affect correctness, write safety, and whether a result is visible to downstream SQL or BI consumers.
- **Use when:** A task touches Fabric notebooks, Lakehouse/OneLake files or tables, Warehouse T-SQL, Spark, or Delta.
- **Output:** Engine-specific code with declared inputs, write boundary, validation checks, and run instructions.
- **Ask only if:** The requested outcome does not identify a compute engine or authorized target.
- **Do not do:** Do not write through a read-only SQL analytics endpoint, guess OneLake paths, or create a Spark session where the host injects one.

## Choose the engine

| Need | Preferred surface |
|---|---|
| Distributed transformation, Delta maintenance, large data | Spark notebook or Spark job |
| Small Python analysis, API orchestration, local-only work | Python notebook |
| Relational transformation in an authorized Warehouse | Warehouse T-SQL |
| Read/query generated Lakehouse tables | SQL analytics endpoint |

Before writing, identify the source item, target item, expected grain, key columns, and whether the operation is read-only or authorized to write.

## Execution rules

1. Inspect the current notebook/job context before creating a session or mounting a path.
2. Use the attached/default Lakehouse only when the project explicitly declares it; otherwise request the item identifier or connection handoff.
3. Prefer table APIs and declared Delta locations over ad hoc file paths. Record the full target path in the output artifact.
4. Add assertions for schema, key uniqueness, row-count reconciliation, and post-write readability at every critical transformation boundary.
5. Load the `ce-data-qa` skill before modeling or downstream publication artifacts.
6. On missing access, unsupported syntax, or incompatible table features, stop with the exact failed boundary. Never replace a failed source with samples or synthetic data.

## Review checks

- Confirm that the SQL analytics endpoint is used for reads rather than data mutation.
- Confirm that Spark/Delta writes target the intended Lakehouse and do not overwrite an undeclared table.
- Separate a data-engineering write from the scientific analysis that consumes it.
- Report memory/partitioning assumptions for large Spark operations instead of silently collecting data to a driver.

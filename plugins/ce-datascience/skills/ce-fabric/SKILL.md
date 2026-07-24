---
name: ce-fabric
description: "Route Microsoft Fabric research and analytics work to the correct CE Fabric workflow: lakehouse or warehouse code, pipelines, semantic models, ML, or Eventhouse/KQL. Use when a project uses OneLake, Fabric notebooks, Warehouses, Data Factory, Power BI Direct Lake, MLflow in Fabric, or Real-Time Intelligence."
argument-hint: "[coding|pipelines|semantic-models|ml|kql]"
---

# Microsoft Fabric Router

## Skill Value

- **Problem it solves:** Fabric combines several execution engines; treating it as generic Spark, SQL Server, or Power BI can produce invalid code or unsafe data handling.
- **Use when:** The user mentions Fabric, OneLake, Lakehouse, Warehouse, Data Factory, Direct Lake, Eventhouse, or KQL.
- **Output:** A selected Fabric route, the applicable CE guardrails, and a bounded next action.
- **Ask only if:** The requested outcome could be implemented by more than one Fabric engine.
- **Do not do:** Do not guess a workspace, capacity, identity, or write permission; do not move data or create cloud resources without authorization.
- **Interaction:** Inspect project and connection evidence first. Ask one decision-changing question at a time.

## Route

Choose the narrowest route and activate its skill before writing code:

| Task | Route |
|---|---|
| Lakehouse/OneLake, PySpark, Spark SQL, Python notebook, Warehouse T-SQL, Delta tables | `/ce-fabric-coding` |
| Data Factory pipelines, Copy activity/job, Dataflows Gen2, gateway, scheduling, alerts | `/ce-fabric-pipelines` |
| Direct Lake, DAX, RLS/OLS, semantic-link/sempy, model refresh | `/ce-fabric-semantic-models` |
| MLflow, experiments, registered models, batch scoring, AI functions | `/ce-fabric-ml` |
| Eventhouse, KQL, Eventstreams, Real-Time Dashboards, Activator | `/ce-fabric-kql` |

If the route is unclear, ask:

> Which Fabric surface owns this task: Lakehouse/Warehouse code, pipeline orchestration, semantic model, ML, or Eventhouse/KQL?

## Shared research workflow

1. Run `/ce-setup` or inspect the existing stack profile. Record `data_layer: fabric` only when repository or user evidence supports it.
2. State the analytical grain, source item, read/write boundary, and intended artifact before generating transformations.
3. Run `/ce-data-qa` at data boundaries. Reconcile source and target row counts, keys, joins, types, and missing-data handling.
4. Use `/ce-plan` for a study or `/ce-statistical-analysis-plan` for claims work before scope-expanding analysis code.
5. Use `/ce-work` to execute the selected route and preserve the fail-loud rule: no fabricated inputs, silent coercions, or hidden fallback datasets.
6. Use `/ce-code-review` before relying on outputs for a scientific or operational decision.

## Non-negotiable boundaries

- Treat workspace, lakehouse, warehouse, and semantic-model names as environment-specific evidence, never as defaults.
- Keep credentials, tenant IDs, connection strings, and patient-level exports out of generated code and artifacts.
- Treat the Lakehouse SQL analytics endpoint as a read-only query surface over generated tables. Use the authorized write path for modifications.
- Do not claim RLS, OLS, or OneLake security is effective without checking the user's effective identity and workspace role.

## Handoff

When a route is chosen, state it in one line:

```
[ce-fabric] route=<coding|pipelines|semantic-models|ml|kql> data_layer=fabric write_boundary=<declared|unknown>
```

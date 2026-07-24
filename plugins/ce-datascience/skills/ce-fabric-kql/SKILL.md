---
name: ce-fabric-kql
description: "Write, audit, or debug Microsoft Fabric Real-Time Intelligence workflows: Eventhouse, KQL databases, Eventstreams, ingestion mappings, update policies, materialized views, Real-Time Dashboards, Activator, and KQL queries."
argument-hint: "[query|ingestion|policy|dashboard|debug]"
---

# Fabric KQL and Eventhouse

## Skill Value

- **Problem it solves:** KQL query semantics, ingestion policies, and OneLake/real-time boundaries can silently change counts or delay visibility.
- **Use when:** The task involves Eventhouse, KQL, Eventstream, ingestion mappings, update policies, materialized views, or a real-time dashboard.
- **Output:** A KQL or ingestion design with declared event grain, time zone, join semantics, retention, late-data policy, and validation queries.
- **Ask only if:** The event source, timestamp, join cardinality, or retention policy is ambiguous.
- **Do not do:** Do not run destructive management commands, alter retention, or enable external ingestion without explicit authorization.

## Workflow

1. Define the event grain, event-time field, ingest-time field, time zone, late-arrival policy, and primary key before writing KQL.
2. State the join kind and expected cardinality. Validate row counts before and after a join; do not accept an empty or reduced result without an explanation.
3. For ingestion and update policies, document the source, target, mapping, schema evolution rule, backfill/replay plan, and failure behavior.
4. Validate a bounded time window with known events before attaching a dashboard, model, or alerting workflow.
5. Load the `ce-data-qa` skill when Eventhouse output becomes an analytical dataset; preserve source-to-target reconciliation.
6. Load the `ce-code-review` skill for decisions based on time-varying or censored outcomes, not a dashboard aggregate alone.

## Guardrails

- Do not confuse KQL with T-SQL; make query semantics explicit.
- Do not default empty time bins to valid zero events without checking whether the analysis requires missingness to remain visible.
- Do not use synthetic events to mask failed ingestion or delayed OneLake availability.

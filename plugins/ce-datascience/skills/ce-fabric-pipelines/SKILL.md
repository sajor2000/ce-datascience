---
name: ce-fabric-pipelines
description: "Design, debug, or review Microsoft Fabric Data Factory pipelines, Copy activity or Copy job, Dataflows Gen2, gateways, schedules, notebook activities, incremental loads, and failure handling."
argument-hint: "[design|debug|incremental-load|alerting]"
---

# Fabric Pipeline Orchestration

## Skill Value

- **Problem it solves:** Pipeline success states and dependency paths can obscure failed activities, stale data, or unauthorized identities.
- **Use when:** A Fabric task involves orchestration, Copy, Dataflow Gen2, a gateway, a notebook activity, scheduling, or alerting.
- **Output:** A declared pipeline contract: inputs, identity, dependencies, failure path, idempotency rule, and validation evidence.
- **Ask only if:** The source, sink, schedule, or failure policy changes the intended workflow.
- **Do not do:** Do not create schedules, credentials, connections, or cloud resources without user authorization.

## Workflow

1. Map each activity's input, output, identity, retry behavior, and success/failure dependencies before editing.
2. Select Copy activity, Copy job, Dataflow Gen2, or a notebook based on the transformation and connection evidence; do not port Azure Data Factory assumptions without checking Fabric behavior.
3. For incremental work, declare the watermark field, initial-load rule, late-arriving-data policy, and idempotent target key.
4. Make the failure route observable. Test a representative failed dependency and inspect the pipeline-level status rather than assuming an activity failure propagates as intended.
5. For notebook activities, validate input parameters, return values, and execution identity with a non-production probe where available.
6. Load the `ce-data-qa` skill to reconcile source and target counts, duplicates, and watermark windows before declaring a load valid.

## Guardrails

- Do not hide failed or skipped activities behind a generic success message.
- Do not use a retry or fallback source to conceal a data-quality or access failure.
- Keep gateway and connection secrets in the platform-managed connection layer, not in a notebook or repository.
- Document rollback or replay behavior before changing a production ingestion path.

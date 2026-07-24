---
name: ce-fabric-semantic-models
description: "Design, audit, or troubleshoot Microsoft Fabric and Power BI semantic models, including Direct Lake, DAX, RLS/OLS, model refresh, semantic-link, and sempy workflows."
argument-hint: "[direct-lake|dax|security|refresh|debug]"
---

# Fabric Semantic Models

## Skill Value

- **Problem it solves:** Semantic-model behavior can diverge from Lakehouse data, security intent, and expected query mode without visible errors.
- **Use when:** A task involves Direct Lake, DAX, RLS/OLS, a Power BI semantic model, semantic-link, or sempy.
- **Output:** A documented model contract covering source tables, grain, relationships, query mode, security assumptions, and validation checks.
- **Ask only if:** The intended model mode, effective identity, or security boundary is not evidenced.
- **Do not do:** Do not claim a security policy is enforced based solely on its definition; do not publish, refresh, or alter production models without authorization.

## Workflow

1. Record the source Lakehouse/Warehouse tables, grain, surrogate keys, relationships, and refresh/framing expectation.
2. Confirm whether the model is Direct Lake, DirectQuery, Import, or a supported mixed design before writing DAX or diagnostics.
3. Treat query-mode fallback, stale metadata, and unavailable Delta files as evidence to investigate—not as reasons to substitute cached results.
4. Validate RLS/OLS using an effective test identity with the intended workspace role. Document known privileged-role exceptions rather than asserting universal enforcement.
5. Check that calculated logic belongs at the correct layer: upstream transformation, DAX measure, or governed model artifact.
6. Run reconciliation checks from source rows to model totals and subgroup outputs before a research, quality, or operational claim is released.

## Review gates

- State the semantic model's data currency and refresh/framing evidence.
- State whether the validation used Direct Lake behavior or a fallback query mode.
- Keep patient-level detail and sensitive columns governed at the data and model layers; do not export them merely to debug a visual.

---
name: ce-review-pack
description: "Generate PI-facing review packs and validate multi-analyst signoff ledgers for study outputs, SAP deviations, review findings, Table 1 readiness, figure readiness, manuscript packages, registry packages, and data locks. Use when a PI, study lead, statistician, or coordinating center needs a concise handoff or named approval workflow."
argument-hint: "[optional: --ledger analysis/signoff/signoff-ledger.json]"
---

# Review Pack and Signoff

Create a concise study-team handoff and validate named human approvals. This skill never marks scientific content approved without a named reviewer.

## Workflow

1. Collect ready outputs from Table 1, figure, manuscript, registry, sprint, data-QA, and code-review reports.
2. Summarize blockers, unresolved SAP drift, and requested signoffs in a PI-facing markdown file.
3. Validate the signoff ledger:

```bash
python3 scripts/validate_signoff_ledger.py --ledger analysis/signoff/signoff-ledger.json --project-root .
```

4. If the ledger is missing or invalid, keep readiness at blocked or ready-with-review, never approved.

## Signoff Principles

- Every approval has a named reviewer.
- Prior entries are append-only and hash-checkable.
- Data locks, SAP locks, Table 1 readiness, figure readiness, registry packages, and manuscript packages are separate signoff scopes.
- CLIF projects include aggregate-only and protected-path signoff checks.

## References

@./references/review-pack-template.md

@./references/signoff-ledger-schema.yaml

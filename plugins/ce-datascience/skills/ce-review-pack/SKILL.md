---
name: ce-review-pack
description: "Create PI-facing review packs and multi-analyst signoff ledgers for study outputs, deviations, tables, figures, and packages."
argument-hint: "[optional: --ledger analysis/signoff/signoff-ledger.json]"
---

# Review Pack and Signoff

> **Script paths are relative to this skill's directory.** Run the commands below from the skill directory (the directory containing this `SKILL.md`), or prefix each script path with that directory — the agent's working directory is the user's project, not the skill.


## Skill Value

- **Problem it solves:** Study leads need concise, auditable review packets rather than scattered outputs and informal approvals.
- **Use when:** The user needs PI review, statistician signoff, coordinating-center handoff, or approval workflow packaging.
- **Output:** Review pack with artifact inventory, decisions, deviations, readiness status, and signoff ledger.
- **Ask only if:** Only when reviewer names, scope, or required artifacts are unclear.
- **Do not do:** Do not sign off on behalf of humans or hide unresolved blockers.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

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

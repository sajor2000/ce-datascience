---
name: ce-sprint
description: 'Opens, closes, or reports status on a bounded analysis sprint with a named human reviewer and explicit scope (subset of SAP sections). Each sprint declares entry criteria (data lock, prior sprint signed off), planned outputs from sap-tables/02-outputs.csv, and a named reviewer; /ce-sprint close dispatches ce-sprint-audit-reviewer to verify planned-vs-actual and runs a reproducibility re-check. Use whenever the user mentions sprint, sprint open/close, "auditable unit of work", "human sign-off", "lock down what gets done this week", "freeze scope for the next analysis chunk", "human reviewer for this analysis", or wants to enact a SAP in increments rather than one unbounded /ce-work session. Especially valuable for academic / regulated work where each analysis unit needs an audit trail. The sprint-log.yaml IS the audit trail.'
argument-hint: "<start|close|status>, optional name and reviewer, e.g. start sprint-01 reviewer=jcr scope=SAP-3.1,SAP-3.2"
---

# Sprint Cadence with Human Audit Gates

Wraps `/ce-work` in bounded sprints with explicit entry/exit criteria and human reviewer sign-off. The frictionless feel of `/ce-work` is preserved; the sprint adds structure around it so analyses can be audited unit-by-unit.

## When this skill activates

- Before starting analysis work that needs human sign-off (most academic / regulated work)
- After `/ce-plan` SAP and `/ce-sap-tabular` are done and the SAP is locked
- Manual: `/ce-sprint start sprint-02 reviewer=jcr scope=SAP-3.3,SAP-3.4`
- Closing a sprint: `/ce-sprint close`

## Prerequisites

- A locked SAP exists (`analysis/sap.md` with `sap_version` frontmatter)
- `analysis/sap-tables/02-outputs.csv` exists (from `/ce-sap-tabular`)
- A locked data wave exists (run `data_lock` MCP if not)

## Core workflow

### `/ce-sprint start <name>`

1. Check that no other sprint is currently `open` in `analysis/sprints/sprint-log.yaml`. Refuse to open a second concurrent sprint -- one in flight at a time. Use `/ce-sprint close` first.

2. Resolve the scope. The user passes `scope=SAP-3.1,SAP-3.2` (SAP section ids) or `scope=table:T1,T2` (table ids from sap-tables). Resolve to a list of rows from `02-outputs.csv` whose `analysis_section` matches.

3. Resolve the reviewer. The user passes `reviewer=<name>` or, if absent, prompt for one. The named human is the person who will sign the sprint summary. Their name lands in `sprint-log.yaml` -- this is the audit-trail anchor.

4. Check entry criteria:
   - Prior sprint (if any) is `closed` and `signed_off`
   - Data wave is `locked`
   - SAP `sap_version` is committed (no uncommitted SAP edits)
   - Stack profile is set

   If any fails, refuse to open the sprint and report what's blocking.

5. Write `analysis/sprints/<name>/sprint-log.yaml`:

```yaml
sprint:
  name: sprint-02
  status: open
  opened: 2025-04-28T09:00:00
  reviewer: jcr
  scope:
    sap_sections: [SAP-3.3, SAP-3.4]
    planned_outputs:
      - { id: T3, output_file: table-mortality-by-arm.csv, subfolder: tables/, sap_section: SAP-3.3 }
      - { id: F2, output_file: km-curve-overall.png, subfolder: figures/, sap_section: SAP-3.4 }
  entry_criteria:
    sap_version: 1.2
    data_wave_id: wave_2025_03_15
    prior_sprint: sprint-01 (closed, signed off 2025-04-20)
```

6. Print a one-line summary and hand off to `/ce-work` with the planned-outputs list as the task seed. The user works inside the sprint as they would inside `/ce-work` normally; the sprint just bounds what's in scope.

### `/ce-sprint close`

1. Read `sprint-log.yaml`. If `status != open`, report and exit.

2. Spawn `ce-sprint-audit-reviewer`. The reviewer checks:
   - Every `planned_outputs` row has a corresponding artifact at the expected path
   - No out-of-scope SAP sections were modified during the sprint window (git log of analysis/ files vs `opened` timestamp)
   - No unscheduled outputs were produced (warn; not block)
   - All planned analyses ran successfully (no errored Quarto/notebook chunks)
   - Reproducibility check: re-running the sprint script produces the same hashes for declared outputs

3. Write the sprint summary to `analysis/sprints/<name>/summary.md`:

```
# Sprint <name> Summary

Reviewer: <name>
Opened: ... Closed: ...
Scope: SAP-3.3, SAP-3.4

## Outputs produced
| ID | File | Hash | Status |
| T3 | tables/table-mortality-by-arm.csv | abc123 | ok |
| F2 | figures/km-curve-overall.png      | def456 | ok |

## Out-of-scope edits detected
None

## Audit reviewer findings
- 0 P0, 1 P1 (minor table-1 column-order drift), 0 P2

## Sign-off
Reviewer (<name>): ☐
Date: ____________
```

4. Update `sprint-log.yaml`:

```yaml
status: closed_pending_signoff
closed: 2025-04-28T17:00:00
audit_reviewer_findings: { P0: 0, P1: 1, P2: 0 }
```

5. Print `__CE_SPRINT_CLOSED__ name=<name> findings_p0=<n> awaiting_signoff=true` and prompt the user to share the summary with the reviewer.

6. After human sign-off, the user runs `/ce-sprint sign-off <name>` (or edits the YAML directly to `status: signed_off` with a `signed_off_by` and `signed_off_at` field).

### `/ce-sprint status`

Print the current sprint state plus the audit-reviewer findings if closed-pending. Useful for "where am I?".

## What this skill does NOT do

- Does not run analysis itself (that's `/ce-work`)
- Does not pick the scope -- the user picks SAP sections
- Does not bypass `ce-code-review` -- code review still runs as normal during the sprint; the sprint audit is at close time only
- Does not enforce sprint duration -- a sprint can be 1 hour or 3 weeks; what matters is the bounded scope and the named reviewer

## References

@./references/sprint-log-schema.yaml

@./references/audit-checklist.md

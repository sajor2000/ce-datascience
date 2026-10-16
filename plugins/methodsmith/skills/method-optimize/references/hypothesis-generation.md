# Phase 2: Hypothesis Generation

Run after the user approves the Phase 1.7 gate. Re-read the spec and baseline from disk first.

## 2.1 Analyze Current Approach

Read the code in `scope.mutable`: current approach, obvious opportunities, and dependencies between components. Optionally dispatch `method-repo-research-analyst` when the scope is large or unfamiliar. Check the spend caps (SKILL.md 3.6) before dispatching.

## 2.2 Generate Hypothesis List

Generate 10-30 hypotheses, including any the user provided. Each has:
- **Description**: what to try
- **Category**: a standard category (signal-extraction, graph-signals, embedding, algorithm, preprocessing, parameter-tuning, architecture, data-handling, feature-engineering, model-family) or a domain-specific one
- **Priority**: high, medium, or low by expected impact and feasibility
- **Required dependencies**: new packages or tools needed

Drop any hypothesis that would need the outcome, test-set data, or future information at feature-construction time (Data Science Guardrail 2).

## 2.3 Dependency Pre-Approval

Collect all unique new dependencies. If any exist, present the full list for bulk approval per the SKILL.md interaction rule (blocking question UI when available, otherwise numbered choices and wait). Mark each hypothesis `dep_status: approved` or `needs_approval`. Unapproved hypotheses stay in the backlog, are skipped in batch selection, and are re-presented at wrap-up.

## 2.4 Record Hypothesis Backlog (CP-2)

Write the backlog to the experiment log, then read it back and confirm it is present:

```yaml
hypothesis_backlog:
  - description: "Fit the scaler inside each CV fold instead of on the full training set"
    category: "preprocessing"
    priority: high
    dep_status: approved
    required_deps: []
  - description: "Try gradient-boosted trees with monotone constraints"
    category: "model-family"
    priority: medium
    dep_status: needs_approval
    required_deps: ["lightgbm"]
```

Then return to SKILL.md Phase 3.

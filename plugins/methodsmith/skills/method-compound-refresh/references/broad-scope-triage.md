# Broad Scope Triage

Read when scope is broad (9+ candidate docs, ambiguous, or a repo-wide sweep). Do a lightweight triage before deep investigation:

1. **Inventory** — read frontmatter of all candidate docs, group by module/component/category
2. **Impact clustering** — identify areas with the densest clusters of learnings + pattern docs. A cluster of 5 learnings and 2 patterns covering the same module is higher-impact than 5 isolated single-doc areas, because staleness in one doc likely affects the others.
3. **Spot-check drift** — for each cluster, check whether the primary referenced files still exist. Missing references in a high-impact cluster are the strongest signal for where to start.
4. **Recommend a starting area** — present the highest-impact cluster with a brief rationale and ask the user to confirm or redirect (Skill Value interaction rule). In autofix mode, skip the question and process all clusters in impact order.

Example:

```text
Found 24 learnings across 5 areas.

The auth module has 5 learnings and 2 pattern docs that cross-reference
each other — and 3 of those reference files that no longer exist.
I'd start there.

1. Start with auth (recommended)
2. Pick a different area
3. Review everything
```

Do not ask action-selection questions yet. First gather evidence, then investigate the chosen area in batches.

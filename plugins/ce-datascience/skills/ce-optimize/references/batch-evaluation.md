# Batch Evaluation and State Update

Run after every experiment in the batch is measured and logged (SKILL.md 3.3). Re-read the experiment log from disk first.

## 3.4 Evaluate Batch

1. **Rank** by primary-metric improvement over the current best:
   - Hard metrics: use `metric.primary.direction` (`maximize` = higher is better) and require the absolute improvement to exceed `measurement.stability.noise_threshold`
   - Judge metrics: compare the primary judge score and require it to exceed `minimum_improvement`
2. **Pick the best experiment** that passes all gates and improves the primary metric.
3. **KEEP it** if it beats the current best:
   - Commit only mutable-scope changes on the experiment branch with message `optimize(<spec-name>): <hypothesis description>`; if no eligible diff remains, treat it as non-improving and revert
   - Merge the committed experiment branch into the optimization branch
   - Clean up the winner's worktree and branch; the merged commit is the durable artifact and the new baseline
4. **Runner-ups**: follow the Runner-up merges procedure that SKILL.md 3.4-3.5 names.
5. **Deferred deps**: experiments that need unapproved dependencies get `deferred_needs_approval`.
6. **Revert all others**: clean up worktrees and log `reverted`.

## 3.5 Update State (CP-4)

1. Re-read the experiment log from disk
2. Finalize outcomes from 3.4 (`kept`, `reverted`, `runner_up_kept`, ...) and write them
3. Update `best` if a new best was found, plus the running spend totals: `total_judge_cost_usd` and `total_run_cost_usd` (experiment workers, judges, research subagents). Use host-reported usage where available, estimate the rest, and record which parts are estimates
4. Write `.context/ce-datascience/ce-optimize/<spec-name>/strategy-digest.md`: categories tried with success/failure counts, key learnings, untried categories and approaches, current best and change from baseline
5. Generate new hypotheses from the digest re-read from disk plus the last 10 experiments from the log (not the full log); write the updated backlog with tested hypotheses removed
6. **Verify**: read the log back and confirm outcomes are final, `best` and spend totals are current, and the backlog is updated; confirm `strategy-digest.md` exists. Retry a failed write once; alert the user if it fails twice

All state for the batch is now on disk. Report progress per the Progress reporting procedure that SKILL.md 3.4-3.5 names, then return to SKILL.md 3.6.

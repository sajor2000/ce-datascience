# Phase 4: Wrap-Up

Run after a stopping criterion in SKILL.md 3.6 is met. Re-read the experiment log and strategy digest from disk first.

## 4.1 Present Deferred Hypotheses

If any hypotheses were deferred for unapproved dependencies:
1. List them with their dependency requirements
2. Ask the user whether to approve, skip, or save them for a future run
3. If approved: add them to the backlog and offer to re-enter Phase 3 for one more round

## 4.2 Summarize Results

Write the summary figures to the experiment log and read them back before presenting:

```
Optimization: <spec-name>
Duration: <wall-clock time>
Total experiments: <count>
  Kept: <count> (including <runner_up_kept_count> runner-up merges)
  Reverted: <count>
  Degenerate: <count>
  Errors: <count>
  Deferred: <count>

Baseline -> Final (cross-validation / validation split):
  <primary_metric>: <baseline_value> -> <final_value> (<delta>)
  <gate_metrics>: ...
  <diagnostics>: ...

Seeds: <split / model / judge sample seeds>
Spend: judge $<total_judge_cost_usd>, whole run ~$<total_run_cost_usd> (estimated parts marked)

Key improvements:
  1. <kept experiment 1 hypothesis> (+<delta>)
  2. <kept experiment 2 hypothesis> (+<delta>)
  ...
```

## 4.3 Offer Next Steps

The optimization branch (`optimize/<spec-name>`) holds every commit from kept experiments. The experiment log and strategy digest stay in local `.context/` scratch space for resume and audit on this machine only; `.context/` is gitignored, so they do not travel with the branch.

Present these options as a numbered list (five distinct destinations) and accept free-form input ("Pick a number or describe what you want."):

1. **Review** the cumulative diff (baseline to final): load the `method-review` skill with `mode:autofix` on the optimization branch.
2. **Document** the winning strategy as an institutional learning: load the `method-compound` skill.
3. **Create PR** from the optimization branch to the default branch.
4. **Continue** with more experiments: re-read state from disk, then re-enter Phase 3.
5. **Done**: leave the optimization branch for manual review.

## 4.4 Lock the Final Result (CP-5)

Run only after the user picks an option that does not return to Phase 3 (anything but Continue or approving a deferred dependency).

1. If the target is a model or pipeline with a held-out test set, evaluate the final optimization-branch state on the test set exactly once (Data Science Guardrail 1). Record it as the locked result, separate from the cross-validated loop metrics, and report both. Once the test set has been scored, do not re-enter Phase 3 on this run.
2. Write the final state to the experiment log and read it back (CP-5).
3. Carry out the chosen option.

## 4.5 Cleanup

Remove temporary batch artifacts:

```bash
rm -f .context/methodsmith/method-optimize/<spec-name>/strategy-digest.md
```

- Keep the experiment log when the user may resume locally or wants a local audit trail. If they need a durable shared record, summarize or export the results into a tracked path (for example `docs/`) before cleanup.
- Do not delete experiment worktrees that are still referenced.

# Optimization Loop Details

Procedures that SKILL.md Phase 1.3 and Phase 3 hand off to. Each section is self-contained; read the one the SKILL.md step names.

## Contents

- Judge scoring
- Runner-up merges
- Errors, timeouts, and dispatch failures
- Progress reporting

## Judge scoring

Run this only after every degenerate gate passed and `metric.primary.type` is `judge`. Before dispatching, check the spend caps (SKILL.md 3.6): if the estimated cost of this judge pass would take recorded judge spend past `metric.judge.max_total_cost_usd`, or whole-run spend past `stopping.max_total_cost_usd`, do not dispatch; stop the loop with "spend cap reached".

1. Read the experiment's output (cluster assignments, predictions with case identifiers, search results, generated text)
2. Draw the stratified sample per `metric.judge.stratification` using `metric.judge.sample_seed`. Use the same seed for baseline and every experiment so differences reflect the change, not the sample
3. Group samples into batches of `metric.judge.batch_size`
4. Fill `references/judge-prompt-template.md` for each batch. Pass de-identified or aggregate items only; never send patient-level identifiers or small cells to a judge
5. Dispatch `ceil(sample_size / batch_size)` judge sub-agents with the platform's subagent primitive (`Agent`/`Task` in Claude Code, `spawn_agent` in Codex, `subagent` in Pi). Run them in parallel when supported, sequentially otherwise
6. Each sub-agent returns structured JSON scores
7. Aggregate: compute the primary judge field from `metric.judge.scoring.primary` (it should match `metric.primary.name`) plus any `scoring.secondary` values
8. If `singleton_sample > 0`, also dispatch singleton evaluation sub-agents with the singleton template
9. Add this pass's cost to `judge_cost_usd` on the experiment entry and to the running totals in `best`

## Runner-up merges

Run after the batch winner is kept (Phase 3.4 step 3), for up to `max_runner_up_merges_per_batch` runners-up that also improved:

1. Check file-level disjointness with the kept experiment. Two experiments are disjoint only if they modified completely different files; the same file is overlapping even when the lines differ
2. If disjoint: cherry-pick the runner-up onto the new baseline and re-run the full measurement (including `repeat` aggregation and judge scoring when configured)
3. If the combined measurement is strictly better than the new best by the same threshold used in Phase 3.4: keep it (outcome `runner_up_kept`, set `merged_with`), then clean up that runner-up's worktree and branch
4. Otherwise: revert the cherry-pick, log "promising alone but neutral or harmful in combination" (outcome `runner_up_reverted`), and clean up its worktree and branch
5. Stop after the first failed combination

Re-run the leakage check (Data Science Guardrail 2) on the combined diff before measuring it; a combination can introduce leakage that neither experiment had alone.

## Errors, timeouts, and dispatch failures

- **Measurement crash, timeout, or malformed output:** record outcome `error` or `timeout` with the error message, revert the experiment, clean up its worktree, and continue with the rest of the batch. `measure.sh` exits 124 on timeout
- **Missing timeout or Python runtime:** `measure.sh` and `parallel-probe.sh` report it on stderr or as a `missing_dependency` blocker. Surface it to the user once; do not retry the same experiment in a loop
- **Codex failure cascade:** track consecutive Codex delegation failures. After 3 in a row, disable Codex for the rest of the run, fall back to subagent dispatch, and log the switch in the experiment log

## Progress reporting

After each batch (and only after CP-4 is verified), report:

- Batch N of an estimated M (from backlog size)
- Experiments run this batch and in total
- Current best primary metric and the change from baseline
- Cumulative judge spend and estimated whole-run spend, against each configured cap

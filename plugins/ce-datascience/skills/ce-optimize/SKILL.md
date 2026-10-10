---
name: ce-optimize
description: "Run metric-driven prompt, workflow, or implementation optimization loops with sampling, scoring, and bounded iteration. Use when the user wants to optimize a prompt, workflow, model behavior, or scored process."
argument-hint: "[path to optimization spec YAML, or describe the optimization goal]"
---

# Iterative Optimization Loop

## Skill Value

- **Problem it solves:** Optimization work drifts when success metrics, samples, judges, and stopping criteria are unclear.
- **Use when:** The user wants to optimize a prompt, workflow, model behavior, or scored process.
- **Output:** An optimization spec, scored iterations, winning candidate, and residual risks.
- **Ask only if:** Only when objective, sample set, scoring rubric, or acceptable tradeoff is unclear, or at the resume, baseline-approval, new-dependency, and wrap-up decision points.
- **Do not do:** Do not optimize without a measurable target or representative cases.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

## Data Science Guardrails

1. **Cross-validation awareness.** Never optimize on the test set. Every iteration evaluates via cross-validation on the training set (or a held-out validation split); the test set is scored once, for the final locked result, in Phase 4.
2. **Data leakage guard.** Before measuring each experiment, verify features do not use the outcome, normalization/encoding/imputation is fit on training data only, and temporal ordering holds for time-series splits. On a leakage signal, abort with a FAIL verdict (log `degenerate` with the reason) instead of recording the metric.
3. **Experiment tracking integration.** When `ce-ml-experiment-track` is configured (mlflow, wandb, dvc, or offline-YAML), log each iteration there (hypothesis, hyperparameters changed, metrics, kept/reverted).
4. **SAP alignment check.** If a SAP exists (default `analysis/sap.md`, or any markdown file with `sap_version` in frontmatter), confirm the optimization target aligns with its primary endpoint. If it differs, warn before starting and require explicit user confirmation.
5. **Reproducibility seeds.** Record every random seed that affects the metric (CV split, model initialization, resampling, judge `sample_seed`) in the spec; hold them fixed across baseline and experiments.

## Input

<optimization_input> #$ARGUMENTS </optimization_input>

If the input above is empty, ask: "What would you like to optimize? Describe the goal, or provide a path to an optimization spec YAML file."

## Bundled Scripts

Phases 1 and 3 run `measure.sh`, `parallel-probe.sh`, and `experiment-worktree.sh` from this skill's `scripts/`. The shell starts in the user's project: in every block replace the `<absolute path ...>` placeholder with the directory this SKILL.md was loaded from. If a block prints `ce-optimize: ... not found`, fix `SKILL_DIR` and rerun; never use a relative `scripts/` path or skip the step. The scripts need `bash`, git, and `timeout`/`gtimeout` or Python 3 (`python3`, `python`, `py`); they fail clearly when missing.

## References

Read each `references/` file at the step that names it. Also: `references/example-hard-spec.yaml` and `references/example-judge-spec.yaml` when starting a first spec; `references/usage-guide.md` when the user asks what this skill is for or how to choose hard vs judge; `references/judge-prompt-template.md` for judge scoring (Phases 1.3 and 3.3).

**First run:** start from an example spec with `execution.mode: serial`, `execution.max_concurrent: 1`, `stopping.max_iterations: 4`, `stopping.max_hours: 1`, no new dependencies until the baseline and harness are trusted, and in judge mode `sample_size: 10`, `batch_size: 5`, `max_total_cost_usd: 5`.

## Persistence Discipline

**The experiment log on disk is the single source of truth; results that exist only in conversation will be lost.** State lives under `.context/ce-datascience/ce-optimize/<spec-name>/` (gitignored local scratch; not preserved by commits or pushes).

- Write each result to disk immediately after measurement, read it back with the native file-read tool, and confirm it before the next step. Retry once; if it fails twice, alert the user.
- Re-read from disk at every phase boundary and before every decision.
- During Phase 3 the log is append-only: append entries, update `best` in place only on a new best, never rewrite the whole file.
- Measure -> write to disk -> verify -> then show the user. Never the reverse.

Checkpoints CP-0 (spec) through CP-5 (final summary) are named at the step that writes them.

**On Resume** (Phase 0.4): treat the log as ground truth; recover measured-but-unlogged experiments from worktree `result.yaml` markers; continue from the last logged iteration. Present the Phase 1.7 gate again unless this session saw the user approve it.

## Phase 0: Setup

### 0.1-0.2 Load or Create Spec

**If the input is a spec path** (`.yaml`/`.yml`), validate it per `references/spec-validation.md` against `references/optimize-spec-schema.yaml`; on failure, report the errors and ask the user to fix them.

**If the input is a description**, read `references/spec-design.md` and follow it (hard vs judge, sampling and rubric, remaining fields), validate it per `references/spec-validation.md`, then save and get approval (CP-0).

### 0.3 Search Prior Learnings

Dispatch `ce-learnings-researcher` for prior optimization work on similar topics.

### 0.4 Run Identity Detection

Run `git rev-parse --verify "optimize/<spec-name>"`. If the branch exists, look for `.context/ce-datascience/ce-optimize/<spec-name>/experiment-log.yaml` and ask with the platform's blocking question tool:
- **Resume**: follow On Resume above
- **Fresh start**: archive the old branch to `optimize-archive/<spec-name>/archived-<timestamp>`, clear the experiment log, start from scratch

### 0.5 Create Optimization Branch and Scratch Space

Run `git checkout -b "optimize/<spec-name>"` (switch to the existing branch when resuming), then `mkdir -p .context/ce-datascience/ce-optimize/<spec-name>/`.

## Phase 1: Measurement Scaffolding

**HARD GATE: the user must approve the baseline and parallel readiness before Phase 2.**

### 1.1 Clean-Tree Gate

Filter `git status --porcelain` against `scope.mutable` and `scope.immutable`. If any in-scope file has uncommitted changes, report them and ask the user to commit or stash. Do not continue until in-scope files are clean.

### 1.2 Build or Validate Measurement Harness

**If `measurement.command` already exists**, run it once:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
if [ ! -f "$SKILL_DIR/scripts/measure.sh" ]; then echo "ce-optimize: scripts/measure.sh not found under SKILL_DIR=$SKILL_DIR" >&2; exit 1; fi;
bash "$SKILL_DIR/scripts/measure.sh" "<measurement.command>" <timeout_seconds> "<measurement.working_directory or .>"
```

Validate that the JSON has numeric or boolean values for every degenerate gate and diagnostic; otherwise report what is missing and ask the user to fix the harness.

**If the agent must build the harness:** analyze what to measure; write an evaluation script (e.g., `evaluate.py`, `evaluate.R`) that scores on CV folds or a validation split with fixed seeds and never reads the test set; add it to `scope.immutable`; run it through `measure.sh` (block above), validate the output, and present harness and output to the user.

### 1.3 Establish Baseline

Run the harness on the current code. With stability mode `repeat`, run it `repeat_count` times, aggregate with the configured method (median, mean, min, max), and if variance exceeds `noise_threshold`, warn and suggest a larger `repeat_count`. Record `baseline` (`timestamp`, `gates`, `diagnostics`) per the log schema. If the primary type is `judge`, also score the baseline per the Judge scoring section of `references/loop-details.md`.

### 1.4 Parallelism Readiness Probe

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
if [ ! -f "$SKILL_DIR/scripts/parallel-probe.sh" ]; then echo "ce-optimize: scripts/parallel-probe.sh not found under SKILL_DIR=$SKILL_DIR" >&2; exit 1; fi;
bash "$SKILL_DIR/scripts/parallel-probe.sh" "<project_directory>" "<measurement.command>" "<measurement.working_directory>" <shared_files...>
```

Present blockers with mitigations. The probe inspects only the measurement command, its working directory, and declared shared files; GPU use forces serial mode.

### 1.5 Worktree Budget Check

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
if [ ! -f "$SKILL_DIR/scripts/experiment-worktree.sh" ]; then echo "ce-optimize: scripts/experiment-worktree.sh not found under SKILL_DIR=$SKILL_DIR" >&2; exit 1; fi;
bash "$SKILL_DIR/scripts/experiment-worktree.sh" count
```

If count + `execution.max_concurrent` would exceed 12, warn and suggest cleanup or a lower `max_concurrent`. Do not block.

### 1.6 Write Baseline to Disk (CP-1)

Before presenting results, create `experiment-log.yaml` per `references/experiment-log-schema.yaml` (`spec`, `run_id`, `started_at`, `baseline`, `experiments: []`, `best` seeded from the baseline with `iteration: 0` and spend totals at 0). Read it back and confirm the baseline values match.

### 1.7 User Approval Gate

Present with the platform's blocking question tool: baseline gates, diagnostics, judge scores, seeds; log path; probe blockers and mitigations; clean-tree status; worktree use; and spend (estimated cost per experiment, judge cap `metric.judge.max_total_cost_usd`, whole-run cap `stopping.max_total_cost_usd`). Say plainly which spend is capped; with neither cap, only iteration and hour limits bound it.

**Options:**
1. **Proceed**: approve baseline and parallel config, move to Phase 2
2. **Adjust spec**: change settings, then rerun Phase 1 so the baseline matches
3. **Fix issues**: the user resolves blockers first

**Do not proceed to Phase 2 until the user explicitly approves.** If the primary type is `judge` and `metric.judge.max_total_cost_usd` is null, call it out as uncapped judge spend and require explicit approval.

## Phase 2: Hypothesis Generation

After approval, read `references/hypothesis-generation.md` and follow it: generate 10-30 hypotheses (dropping any that need the outcome, test-set data, or future information), pre-approve new dependencies with the blocking question tool, and write the backlog (CP-2).

## Phase 3: Optimization Loop

Repeat in batches until a stopping criterion is met.

### 3.1 Batch Selection

- Exclude `dep_status: needs_approval` from the runnable backlog
- `serial` mode: `batch_size = 1`; otherwise `min(runnable_backlog_size, execution.max_concurrent)`
- Shrink the batch until its estimated worker and judge cost fits every configured spend cap; if not even one fits, stop with "spend cap reached" (3.6)
- Prefer diversity across categories; within a category, high priority first

If no hypotheses remain or none are runnable, go to Phase 4.

### 3.2 Dispatch Experiments

`serial` mode runs one experiment to completion before selecting the next; `parallel` mode dispatches the full batch concurrently. Fill `references/experiment-prompt-template.md` with: iteration and spec name; hypothesis and category; current best and baseline metrics; mutable and immutable scope; constraints and approved dependencies; the last 10 experiments as concise summaries.

**Worktree backend:** create the worktree with `experiment-worktree.sh create` (`optimize-exp/<spec_name>/exp-<NNN>`), apply port parameterization if configured (env vars for the measurement script), then dispatch a subagent with the filled prompt in that worktree:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
if [ ! -f "$SKILL_DIR/scripts/experiment-worktree.sh" ]; then echo "ce-optimize: scripts/experiment-worktree.sh not found under SKILL_DIR=$SKILL_DIR" >&2; exit 1; fi;
WORKTREE_PATH=$(bash "$SKILL_DIR/scripts/experiment-worktree.sh" create "<spec_name>" <exp_index> "optimize/<spec_name>" <shared_files...>);
echo "$WORKTREE_PATH"
```

**Codex backend:** read `references/codex-dispatch.md` and follow it. In an active coding task, dispatch through the platform subagent primitive, never nested `codex exec`.

### 3.3 Collect and Persist Results

Process experiments as they complete. For each, immediately:

1. **Leakage check** (Guardrail 2) on its diff. On a signal, record `degenerate` with the reason, write CP-3, and move on.
2. **Measure** in its worktree (with `repeat`, run `repeat_count` times and aggregate as in 1.3; note excess variance in learnings):
   ```bash
   SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
   if [ ! -f "$SKILL_DIR/scripts/measure.sh" ]; then echo "ce-optimize: scripts/measure.sh not found under SKILL_DIR=$SKILL_DIR" >&2; exit 1; fi;
   bash "$SKILL_DIR/scripts/measure.sh" "<measurement.command>" <timeout_seconds> "<worktree_path>/<measurement.working_directory or .>" <env_vars...>
   ```
3. **Write `result.yaml`** with the raw metrics in the worktree.
4. **Degenerate gates**: if any `metric.degenerate_gates` check fails, mark `degenerate` and skip judging.
5. **Score**: `hard` uses the metric from the measurement output; `judge` follows the Judge scoring section of `references/loop-details.md`.
6. **Append the entry (CP-3)**: iteration, hypothesis, outcome `measured`, metrics, learnings. Verify it is on disk before moving on.

On a crash, timeout, or malformed output, follow the Errors section of `references/loop-details.md`.

### 3.4-3.5 Evaluate Batch and Update State (CP-4)

After every experiment in the batch is measured and logged, read `references/batch-evaluation.md` and follow it: rank against the current best, keep the winner (commit only mutable-scope changes, merge), handle runner-ups (Runner-up merges section of `references/loop-details.md`), revert the rest, then write and verify outcomes, `best`, spend totals, `strategy-digest.md`, and the refreshed backlog before reporting progress (Progress reporting section of `references/loop-details.md`).

### 3.6 Check Stopping Criteria

Stop if ANY holds:
- **Target reached**: `stopping.target_reached` is true, `metric.primary.target` is set, and the primary metric reaches it (`>=` for maximize, `<=` for minimize)
- **Max iterations**: experiments run >= `stopping.max_iterations`
- **Max hours**: time since Phase 3 started >= `stopping.max_hours`
- **Spend cap reached**: recorded spend plus the next dispatch's estimate would pass `metric.judge.max_total_cost_usd` or `stopping.max_total_cost_usd`. Check it before every dispatch that costs money, including Phase 2 research and judge passes
- **Plateau**: no improvement for `stopping.plateau_iterations` consecutive experiments
- **Manual stop**: save state, then go to Phase 4
- **Empty backlog**: no hypotheses remain or can be generated

Otherwise return to 3.1.

## Phase 4: Wrap-Up

Read `references/wrap-up.md` and follow it: present deferred hypotheses, summarize results, offer next steps, lock the final result on the held-out test set (when one exists), and write CP-5 once the user picks an option that does not return to Phase 3.

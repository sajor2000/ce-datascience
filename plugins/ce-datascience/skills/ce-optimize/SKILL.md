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
- **Ask only if:** Only when objective, sample set, scoring rubric, or acceptable tradeoff is unclear.
- **Do not do:** Do not optimize without a measurable target or representative cases.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Run metric-driven iterative optimization of a model, pipeline, prompt, or workflow. Define a goal, build measurement scaffolding, then run experiments that converge toward the best solution while keeping evaluation honest.

## Data Science Guardrails

These apply to every run. They are not optional.

1. **Cross-validation awareness.** Never optimize on the test set. When an experiment changes hyperparameters, features, or prediction thresholds, every iteration evaluates via cross-validation on the training set (or a held-out validation split). The test set is scored once, for the final locked result, after the loop converges (Phase 4).
2. **Data leakage guard.** Before measuring each experiment, verify that feature engineering does not use the outcome, that normalization/encoding/imputation is fit on training data only, and that temporal ordering is preserved for time-series splits. On a leakage signal, abort the experiment with a FAIL verdict (log outcome `degenerate` with the leakage reason) rather than recording a misleading metric.
3. **Experiment tracking integration.** When `ce-ml-experiment-track` is configured (mlflow, wandb, dvc, or offline-YAML), log each iteration to that backend: iteration number, hypothesis, hyperparameters changed, metric values, and outcome (kept/reverted).
4. **SAP alignment check.** If a SAP exists (`docs/plans/` with `sap_version` in frontmatter), read its primary endpoint and confirm the optimization target aligns with it. If it differs from the pre-registered primary endpoint, warn before starting and require explicit user confirmation.
5. **Reproducibility seeds.** Record every random seed that affects the metric (CV split, model initialization, resampling, judge `sample_seed`) in the spec and hold it fixed across baseline and experiments, so differences come from the change, not the draw.

## Input

<optimization_input> #$ARGUMENTS </optimization_input>

If the input above is empty, ask: "What would you like to optimize? Describe the goal, or provide a path to an optimization spec YAML file."

## Bundled Scripts

Phases 1 and 3 run helper scripts from this skill's `scripts/` directory (`measure.sh`, `parallel-probe.sh`, `experiment-worktree.sh`). The Bash tool's working directory is the user's project, not this skill's directory, so a bare `scripts/<name>` path will not resolve. In every block, replace the `<absolute path ...>` placeholder with the absolute directory this `ce-optimize` SKILL.md was loaded from. Shell state does not persist between Bash calls, so each block sets `SKILL_DIR` and checks the script exists; lines end in `;` so the block survives newline flattening. If the check prints `ce-optimize: ... not found`, fix `SKILL_DIR` and rerun; do not fall back to a relative `scripts/` path or skip the step. The shape:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
if [ ! -f "$SKILL_DIR/scripts/<name>" ]; then echo "ce-optimize: scripts/<name> not found under SKILL_DIR='$SKILL_DIR'; set SKILL_DIR to the directory containing the loaded ce-optimize SKILL.md" >&2; exit 1; fi;
bash "$SKILL_DIR/scripts/<name>" <args...>
```

The scripts need `bash` and git. `measure.sh` uses `timeout`, `gtimeout`, or a Python 3 interpreter (`python3`, `python`, or `py`) for timeouts; `parallel-probe.sh` needs Python 3 for structured output. Both fail with a clear message when none is available.

## References

Read each file at the step that names it:

| File | Read when |
|---|---|
| `references/optimize-spec-schema.yaml` | Validating or writing a spec (Phase 0.2) |
| `references/spec-design.md` | Building a spec from a description (Phase 0.2) |
| `references/example-hard-spec.yaml`, `references/example-judge-spec.yaml` | Starting a first spec |
| `references/usage-guide.md` | The user asks what this skill is for or how to choose hard vs judge |
| `references/experiment-log-schema.yaml` | Writing the experiment log (CP-1 onward) |
| `references/experiment-prompt-template.md` | Dispatching each experiment (Phase 3.2) |
| `references/judge-prompt-template.md`, `references/loop-details.md` | Judge scoring, runner-up merges, errors, progress (Phases 1.3 and 3) |
| `references/wrap-up.md` | Phase 4 |

## Quick Start

For a first run, optimize for signal and safety, not throughput: start from an example spec, use `execution.mode: serial`, `execution.max_concurrent: 1`, `stopping.max_iterations: 4`, `stopping.max_hours: 1`, avoid new dependencies until the baseline and harness are trusted, and in judge mode use `sample_size: 10`, `batch_size: 5`, `max_total_cost_usd: 5`.

---

## Persistence Discipline

**The experiment log on disk is the single source of truth. Conversation context is not durable storage; results that exist only in the conversation will be lost.** Runs last hours, contexts compact, and sessions crash.

State lives under `.context/ce-datascience/ce-optimize/<spec-name>/`. It is gitignored local scratch: it survives local resumes on this machine but is not preserved by commits, branches, or pushes.

### Core Rules

1. **Write each experiment result immediately after measurement**, before evaluating the next experiment.
2. **Verify every critical write**: read the file back and confirm the entry is present before continuing.
3. **Re-read from disk at every phase boundary and before every decision.** Never trust in-memory state across phases or batches.
4. **The log is append-only during Phase 3.** Append experiment entries; update `best` in place only when a new best is found; never rewrite the whole file.
5. **Write a `result.yaml` marker in each experiment worktree** right after measurement, for crash recovery.
6. **Write the strategy digest after every batch**, and generate new hypotheses from the digest, not from memory.
7. **Measure -> write to disk -> verify -> then show the user.** Never the reverse.

### Mandatory Disk Checkpoints

At each checkpoint: write with the native file-write tool, read back with the native file-read tool, confirm the expected content. If verification fails, retry once; if it fails twice, alert the user.

| Checkpoint | File Written | Phase |
|---|---|---|
| CP-0: Spec saved | `spec.yaml` | Phase 0, after user approval |
| CP-1: Baseline recorded | `experiment-log.yaml` (initial with baseline) | Phase 1.6 |
| CP-2: Hypothesis backlog saved | `experiment-log.yaml` (`hypothesis_backlog`) | Phase 2.4 |
| CP-3: Each experiment result | `experiment-log.yaml` (append entry) | Phase 3.3, immediately after each measurement |
| CP-4: Batch summary | `experiment-log.yaml` (outcomes, best, spend) + `strategy-digest.md` | Phase 3.5 |
| CP-5: Final summary | `experiment-log.yaml` (final state) | Phase 4 |

### On Resume

When Phase 0.4 detects an existing run:
1. Read the experiment log from disk; it is the ground truth
2. Scan worktree directories for `result.yaml` markers not yet in the log and recover those measured-but-unlogged experiments
3. Continue from the last iteration in the log. The log does not record user approvals, so present the Phase 1.7 gate again unless this session saw the user approve it

---

## Phase 0: Setup

### 0.1 Determine Input Type

The input is either a spec file path (ends in `.yaml` or `.yml`) or a description of the goal.

### 0.2 Load or Create Spec

**If a spec file was provided**, read it (parse YAML natively, not with shell) and validate against `references/optimize-spec-schema.yaml`:
- All required fields present
- `name` is lowercase kebab-case and safe for git refs and worktree paths
- `metric.primary.type` is `hard` or `judge`; if `judge`, `metric.judge` has `rubric` and `scoring`
- At least one degenerate gate
- `measurement.command` is non-empty and evaluates on CV folds or a validation split, not the test set
- `scope.mutable` and `scope.immutable` each have at least one entry; the harness, evaluation data, split definitions, and test set are immutable
- Gate operators are one of `>=`, `<=`, `>`, `<`, `==`, `!=`
- `execution.max_concurrent` is at least 1, and at most 6 when the backend is `worktree`
- `stopping.max_total_cost_usd`, if set, is a positive number

If validation fails, report the errors and ask the user to fix them.

**If a description was provided**, read `references/spec-design.md` and follow it: choose `type: hard` vs `type: judge` (recommend judge for qualitative targets), design sampling and rubric for judge mode, fill the remaining fields, then save and get approval (CP-0).

### 0.3 Search Prior Learnings

Dispatch `ce-learnings-researcher` to search for prior optimization work on similar topics. Incorporate relevant learnings.

### 0.4 Run Identity Detection

Check whether the optimization branch already exists:

```bash
git rev-parse --verify "optimize/<spec-name>"
```

If it exists, look for `.context/ce-datascience/ce-optimize/<spec-name>/experiment-log.yaml` and ask the user with the platform's blocking question tool:
- **Resume**: follow On Resume above
- **Fresh start**: archive the old branch to `optimize-archive/<spec-name>/archived-<timestamp>`, clear the experiment log, start from scratch

### 0.5 Create Optimization Branch and Scratch Space

Run `git checkout -b "optimize/<spec-name>"` (switch to the existing branch when resuming), then `mkdir -p .context/ce-datascience/ce-optimize/<spec-name>/`.

---

## Phase 1: Measurement Scaffolding

**HARD GATE: the user must approve the baseline and parallel readiness before Phase 2.**

### 1.1 Clean-Tree Gate

Run `git status --porcelain` and filter the output against `scope.mutable` and `scope.immutable`. If any in-scope file has uncommitted changes, report which ones and ask the user to commit or stash. Do not continue until in-scope files are clean.

### 1.2 Build or Validate Measurement Harness

**If the user provides a harness** (`measurement.command` already exists), run it once:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
if [ ! -f "$SKILL_DIR/scripts/measure.sh" ]; then echo "ce-optimize: scripts/measure.sh not found under SKILL_DIR='$SKILL_DIR'; set SKILL_DIR to the directory containing the loaded ce-optimize SKILL.md" >&2; exit 1; fi;
bash "$SKILL_DIR/scripts/measure.sh" "<measurement.command>" <timeout_seconds> "<measurement.working_directory or .>"
```

Validate the JSON output: keys exist for every degenerate gate and diagnostic, and values are numeric or boolean as expected. If not, report what is missing and ask the user to fix the harness.

**If the agent must build the harness:**
1. Analyze the codebase to understand the current approach and what to measure
2. Build an evaluation script (e.g., `evaluate.py`, `evaluate.R`, `evaluate.sh`) that scores on CV folds or a validation split with fixed seeds, and never reads the test set
3. Add the script path to `scope.immutable`; experiment workers must not modify it
4. Run it once through `measure.sh` (block above) and validate the output
5. Present the harness and its output to the user for review

### 1.3 Establish Baseline

Run the harness on the current code. If stability mode is `repeat`: run it `repeat_count` times, aggregate with the configured method (median, mean, min, max), compute variance, and if variance exceeds `noise_threshold`, warn and suggest a larger `repeat_count`.

Record:

```yaml
baseline:
  timestamp: "<current ISO 8601 timestamp>"
  gates:
    <gate_name>: <value>
  diagnostics:
    <diagnostic_name>: <value>
```

If the primary type is `judge`, also score the baseline output using the Judge scoring section of `references/loop-details.md`.

### 1.4 Parallelism Readiness Probe

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
if [ ! -f "$SKILL_DIR/scripts/parallel-probe.sh" ]; then echo "ce-optimize: scripts/parallel-probe.sh not found under SKILL_DIR='$SKILL_DIR'; set SKILL_DIR to the directory containing the loaded ce-optimize SKILL.md" >&2; exit 1; fi;
bash "$SKILL_DIR/scripts/parallel-probe.sh" "<project_directory>" "<measurement.command>" "<measurement.working_directory>" <shared_files...>
```

Read the JSON output and present blockers with suggested mitigations. The probe is intentionally narrow: it inspects the measurement command, the measurement working directory, and declared shared files only. GPU use is reported as an exclusive resource and forces serial mode.

### 1.5 Worktree Budget Check

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
if [ ! -f "$SKILL_DIR/scripts/experiment-worktree.sh" ]; then echo "ce-optimize: scripts/experiment-worktree.sh not found under SKILL_DIR='$SKILL_DIR'; set SKILL_DIR to the directory containing the loaded ce-optimize SKILL.md" >&2; exit 1; fi;
bash "$SKILL_DIR/scripts/experiment-worktree.sh" count
```

If count + `execution.max_concurrent` would exceed 12, warn and suggest cleaning up worktrees or lowering `max_concurrent`. Do not block; the user may proceed.

### 1.6 Write Baseline to Disk (CP-1)

Before presenting results:
1. Create `.context/ce-datascience/ce-optimize/<spec-name>/experiment-log.yaml` with the required top-level sections from `references/experiment-log-schema.yaml`: `spec`, `run_id`, `started_at`, `baseline`, `experiments`, `best`
2. Seed `experiments: []`, seed `best` from the baseline (`iteration: 0`, baseline metrics and judge scores, spend totals at 0), and optionally `hypothesis_backlog: []`
3. Read the file back and confirm the sections are present and baseline values match
4. Only then present results

### 1.7 User Approval Gate

Present with the platform's blocking question tool:
- Baseline metrics: gates, diagnostics, judge scores (if any), and the seeds used
- Experiment log path
- Parallel readiness: probe results, blockers, mitigations
- Clean-tree status
- Worktree budget: current count and projected use
- Spend: estimated cost per experiment (workers plus judges), the judge cap `metric.judge.max_total_cost_usd`, and the whole-run cap `stopping.max_total_cost_usd`. Say plainly which spend is capped; with neither cap set, spend is limited only by iteration and hour limits

**Options:**
1. **Proceed**: approve baseline and parallel config, move to Phase 2
2. **Adjust spec**: change spec settings, then rerun Phase 1 so the baseline matches
3. **Fix issues**: the user resolves blockers first

**Do not proceed to Phase 2 until the user explicitly approves.** If the primary type is `judge` and `metric.judge.max_total_cost_usd` is null, call it out as uncapped judge spend and require explicit approval.

After approval, re-read the spec and baseline from disk.

---

## Phase 2: Hypothesis Generation

### 2.1 Analyze Current Approach

Read the code in `scope.mutable`: current approach, obvious opportunities, and dependencies between components. Optionally dispatch `ce-repo-research-analyst` when the scope is large or unfamiliar (check spend caps first).

### 2.2 Generate Hypothesis List

Generate 10-30 hypotheses, including any the user provided. Each has:
- **Description**: what to try
- **Category**: a standard category (signal-extraction, graph-signals, embedding, algorithm, preprocessing, parameter-tuning, architecture, data-handling, feature-engineering, model-family) or a domain-specific one
- **Priority**: high, medium, or low by expected impact and feasibility
- **Required dependencies**: new packages or tools needed

Drop any hypothesis that would need the outcome, test-set data, or future information at feature-construction time (Guardrail 2).

### 2.3 Dependency Pre-Approval

Collect all unique new dependencies. If any exist, present the full list with the platform's blocking question tool for bulk approval, and mark each hypothesis `dep_status: approved` or `needs_approval`. Unapproved hypotheses stay in the backlog, are skipped in batch selection, and are re-presented at wrap-up.

### 2.4 Record Hypothesis Backlog (CP-2)

Write the backlog to the experiment log and verify:

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

---

## Phase 3: Optimization Loop

Repeat in batches until a stopping criterion is met.

### 3.1 Batch Selection

- Build the runnable backlog by excluding `dep_status: needs_approval`
- `serial` mode: `batch_size = 1`; otherwise `batch_size = min(runnable_backlog_size, execution.max_concurrent)`
- Shrink the batch until its estimated worker and judge cost fits every configured spend cap; if not even one experiment fits, stop with "spend cap reached" (3.6)
- Prefer diversity across categories; within a category, pick by priority (high first)

If the backlog is empty and no new hypotheses can be generated, go to Phase 4. If hypotheses remain but none are runnable (all need approval or are blocked), go to Phase 4 so the user can approve dependencies.

### 3.2 Dispatch Experiments

In `serial` mode, run exactly one experiment to completion before selecting the next. In `parallel` mode, dispatch the full batch concurrently.

**Worktree backend:**
1. Create the experiment worktree with `experiment-worktree.sh create` (creates `optimize-exp/<spec_name>/exp-<NNN>`):
   ```bash
   SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
   if [ ! -f "$SKILL_DIR/scripts/experiment-worktree.sh" ]; then echo "ce-optimize: scripts/experiment-worktree.sh not found under SKILL_DIR='$SKILL_DIR'; set SKILL_DIR to the directory containing the loaded ce-optimize SKILL.md" >&2; exit 1; fi;
   WORKTREE_PATH=$(bash "$SKILL_DIR/scripts/experiment-worktree.sh" create "<spec_name>" <exp_index> "optimize/<spec_name>" <shared_files...>);
   echo "$WORKTREE_PATH"
   ```
2. Apply port parameterization if configured (env vars for the measurement script)
3. Fill `references/experiment-prompt-template.md` with: iteration number and spec name; hypothesis description and category; current best and baseline metrics; mutable and immutable scope; constraints and approved dependencies; the last 10 experiments as concise summaries
4. Dispatch a subagent with the filled prompt, working in the experiment worktree

**Codex backend:**
1. Choose one dispatch path:
   - **Active coding task:** use the platform subagent primitive (`Agent`/`Task` in Claude Code, `spawn_agent` in Codex, or `subagent` in Pi via `pi-subagents`). Do not launch nested `codex exec`. If parallel dispatch is unavailable, run experiments sequentially.
   - **External terminal only:** use `codex exec` when it is explicitly available.
2. Fill the experiment prompt template
3. Write the filled prompt to `/tmp/ce-datascience/ce-optimize/<run-id>/exp-<NNN>-prompt.txt`
4. From the external-terminal path only, provision a separate experiment worktree from the current verified base for every parallel worker, then pass it explicitly to Codex. Serial execution may use the current experiment directory:
   ```bash
   SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
   if [ ! -f "$SKILL_DIR/scripts/experiment-worktree.sh" ]; then echo "ce-optimize: scripts/experiment-worktree.sh not found under SKILL_DIR='$SKILL_DIR'; set SKILL_DIR to the directory containing the loaded ce-optimize SKILL.md" >&2; exit 1; fi;
   experiment_path=$(bash "$SKILL_DIR/scripts/experiment-worktree.sh" create "<spec_name>" <exp_index> "optimize/<spec_name>" <shared_files...>);
   cat /tmp/ce-datascience/ce-optimize/<run-id>/exp-<NNN>-prompt.txt | codex exec --cd "$experiment_path" --skip-git-repo-check - 2>&1
   ```
5. Security posture: use the user's selection (ask once per session if the spec does not set it)

### 3.3 Collect and Persist Results

Process experiments as they complete; do not wait for the whole batch. For each completed experiment, immediately:

1. **Leakage check** (Guardrail 2) on the experiment's diff. On a leakage signal, record `degenerate` with the reason, write CP-3, and skip to the next experiment.
2. **Run measurement** in the experiment's worktree:
   ```bash
   SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
   if [ ! -f "$SKILL_DIR/scripts/measure.sh" ]; then echo "ce-optimize: scripts/measure.sh not found under SKILL_DIR='$SKILL_DIR'; set SKILL_DIR to the directory containing the loaded ce-optimize SKILL.md" >&2; exit 1; fi;
   bash "$SKILL_DIR/scripts/measure.sh" "<measurement.command>" <timeout_seconds> "<worktree_path>/<measurement.working_directory or .>" <env_vars...>
   ```
   With stability mode `repeat`, run it `repeat_count` times and aggregate exactly as in 1.3. Score on the aggregate; if variance exceeds `noise_threshold`, note that in the entry's learnings.
3. **Write `result.yaml`** with the raw metrics in the experiment worktree.
4. **Evaluate degenerate gates**: compare each `metric.degenerate_gates` value to its threshold. If any gate fails, mark `degenerate` and skip judging.
5. **Score**: for `hard`, use the metric directly from the measurement output. For `judge`, follow the Judge scoring section of `references/loop-details.md` (spend-cap check, seeded stratified sample, batched judge sub-agents, aggregation).
6. **Append the entry to the experiment log now (CP-3)**: iteration, hypothesis, outcome, metrics, learnings. Use outcome `measured` until 3.4 compares it to the current best.
7. **Verify** the entry is on disk. Retry on failure. Do not move on until it is confirmed.

On a measurement crash, timeout, or malformed output, follow the Errors section of `references/loop-details.md`.

### 3.4 Evaluate Batch

After every experiment in the batch is measured:

1. **Rank** by primary-metric improvement over the current best:
   - Hard metrics: use `metric.primary.direction` (`maximize` = higher is better) and require the absolute improvement to exceed `measurement.stability.noise_threshold`
   - Judge metrics: compare the primary judge score and require it to exceed `minimum_improvement`
2. **Pick the best experiment** that passes all gates and improves the primary metric.
3. **KEEP it** if it beats the current best:
   - Commit only mutable-scope changes on the experiment branch with message `optimize(<spec-name>): <hypothesis description>`; if no eligible diff remains, treat it as non-improving and revert
   - Merge the committed experiment branch into the optimization branch
   - Clean up the winner's worktree and branch; the merged commit is the durable artifact and the new baseline
4. **Runner-ups**: follow the Runner-up merges section of `references/loop-details.md`.
5. **Deferred deps**: experiments that need unapproved dependencies get `deferred_needs_approval`.
6. **Revert all others**: clean up worktrees and log `reverted`.

### 3.5 Update State (CP-4)

1. Re-read the experiment log from disk
2. Finalize outcomes from 3.4 (`kept`, `reverted`, `runner_up_kept`, ...) and write them
3. Update `best` if a new best was found, plus the running spend totals: `total_judge_cost_usd` and `total_run_cost_usd` (experiment workers, judges, research subagents). Use host-reported usage where available, estimate the rest, and record which parts are estimates
4. Write `.context/ce-datascience/ce-optimize/<spec-name>/strategy-digest.md`: categories tried with success/failure counts, key learnings, untried categories and approaches, current best and change from baseline
5. Generate new hypotheses from the digest re-read from disk plus the last 10 experiments from the log (not the full log); write the updated backlog with tested hypotheses removed
6. **Verify**: read the log back and confirm outcomes are final, `best` and spend totals are current, and the backlog is updated; confirm `strategy-digest.md` exists

All state for the batch is now on disk. Report progress per the Progress reporting section of `references/loop-details.md`.

### 3.6 Check Stopping Criteria

Stop if ANY holds:
- **Target reached**: `stopping.target_reached` is true, `metric.primary.target` is set, and the primary metric reaches it per `metric.primary.direction` (`>=` for maximize, `<=` for minimize)
- **Max iterations**: total experiments run >= `stopping.max_iterations`
- **Max hours**: wall-clock time since Phase 3 started >= `stopping.max_hours`
- **Spend cap reached**: recorded spend plus the estimated cost of the next dispatch would pass `metric.judge.max_total_cost_usd` (judge spend) or `stopping.max_total_cost_usd` (whole-run spend). A cap limits spend; it does not wait to trigger until spend has passed it. Check it before every dispatch that costs money, including Phase 2 research and each batch with its judge passes
- **Plateau**: no improvement for `stopping.plateau_iterations` consecutive experiments
- **Manual stop**: the user interrupts; save state, then go to Phase 4
- **Empty backlog**: no hypotheses remain and none can be generated

Otherwise return to 3.1.

---

## Phase 4: Wrap-Up

Read `references/wrap-up.md` and follow it: present deferred hypotheses, summarize results, offer next steps, then lock the final result on the held-out test set (when one exists) and write CP-5 once the user picks an option that does not return to Phase 3.

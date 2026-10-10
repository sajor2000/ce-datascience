# Subagent Execution

Load this when Phase 1 Step 4 chose **Serial subagents** or **Parallel subagents**. The Parallel Safety Check and the isolation/base-SHA rule in `SKILL.md` still apply; this file covers dispatch payloads and what the orchestrator does after each unit or batch.

## Contents

- Dispatch payload
- Isolation by platform
- Shared-directory fallback constraints
- After each subagent completes (serial mode)
- After a parallel batch (worktree-isolated mode)
- After a parallel batch (shared-directory fallback)

## Dispatch payload

Use the platform's subagent primitive (`Agent`/`Task` in Claude Code, `spawn_agent` in Codex, `subagent` in Pi). For each unit, give the subagent:

- The full plan file path (for overall context)
- The unit's Goal, Files, Approach, Execution note, Patterns, Test scenarios, and Verification
- Any resolved deferred questions relevant to that unit
- Instruction to check whether the unit's test scenarios cover all applicable categories (happy paths, edge cases, error paths, integration) and supplement gaps before writing tests
- For analytical units, the fail-loud, real-data, and Data QA rules from `SKILL.md`
- A request to return the evidence fields the Return-to-Caller envelope needs (behavior changed, tests inspected/added/changed, red failure or characterization observed, commands and results, exception reason)

**Permission mode:** omit the `mode` parameter so the user's configured permission settings apply. Do not pass `mode: "auto"`.

## Isolation by platform

Parallel subagents sharing one working directory face git index contention and test interference even without file overlap. Worktree isolation removes both; the shared-directory constraints below mitigate them.

- **Claude Code (`Agent` tool):** pass `isolation: "worktree"` and `run_in_background: true`. The harness creates a per-subagent worktree under `.claude/worktrees/agent-<id>` on its own branch. Verify `.claude/worktrees/` is gitignored before relying on this.
- **Other platforms** without built-in worktree isolation (e.g., Codex `spawn_agent`, Pi `subagent`): subagents share the orchestrator's directory; apply the shared-directory constraints.

## Shared-directory fallback constraints

Apply only when worktree isolation is unavailable. Instruct each subagent: "Do not stage files (`git add`), create commits, or run the project test suite. The orchestrator handles testing, staging, and committing after all parallel units complete."

With worktree isolation active, omit these constraints — subagents may stage, commit, and run their unit's tests within their own worktree branch.

## After each subagent completes (serial mode)

1. Review the subagent's diff — verify changes match the unit's scope and `Files:` list
2. Run the relevant test suite to confirm the tree is healthy
3. If tests fail, diagnose and fix before proceeding — do not dispatch dependent units on a broken tree
4. Update the task list (do not edit the plan body — progress is carried by the commit)
5. Dispatch the next unit

## After a parallel batch (worktree-isolated mode)

1. Wait for every subagent in the current batch to finish.
2. For each completed subagent, in dependency order: review the worktree's diff against the orchestrator's branch. If the subagent did not commit its own work, stage and commit it inside that worktree.
3. Merge each subagent's branch into the orchestrator's branch sequentially in dependency order. **If a merge conflict surfaces, abort the merge (`git merge --abort`) and re-dispatch the conflicting unit serially against the now-merged tree** — hand-resolving silently picks a side and discards one unit's intent.
4. After each merge, run the relevant test suite. If tests fail, diagnose and fix before merging the next branch.
5. Update the task list (progress is carried by the merge commits).
6. Remove each subagent's worktree and delete its branch, using the absolute path and branch name from the subagent's result:
   - `git worktree unlock <absolute-path>` (the harness locks per-subagent worktrees)
   - `git worktree remove <absolute-path>`
   - `git branch -d <branch-name>` — lowercase `-d` refuses to delete unmerged branches; if it fails, investigate before forcing
7. Dispatch the next batch of independent units, or the next dependent unit.

## After a parallel batch (shared-directory fallback)

1. Wait for every subagent in the batch to finish before acting on any result.
2. Cross-check actual modified files across the batch (not just declared `Files:` lists). If 2+ subagents modified the same file, only the last writer's version survived: commit all non-colliding files first, then re-run the affected units serially for the shared file so each builds on the other's committed work.
3. For each completed unit, in dependency order: review the diff, run the relevant test suite, stage only that unit's files, and commit with a conventional message derived from the unit's Goal.
4. If tests fail after committing a unit, diagnose and fix before committing the next.
5. Update the task list (do not edit the plan body).
6. Dispatch the next batch of independent units, or the next dependent unit.

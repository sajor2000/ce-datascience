# Codex Backend Dispatch

Use when the spec's experiment backend is Codex (SKILL.md Phase 3.2). Fill the experiment prompt template first, exactly as for the worktree backend. In the block below, replace the `SKILL_DIR` placeholder with the directory containing the ce-optimize SKILL.md.

Choose one dispatch path:

- **Active coding task:** use the platform subagent primitive (`Agent`/`Task` in Claude Code, `spawn_agent` in Codex, or `subagent` in Pi via `pi-subagents`). Do not launch nested `codex exec`. If parallel dispatch is unavailable, run experiments sequentially.
- **External terminal only:** use `codex exec` when it is explicitly available. Write the filled prompt to `/tmp/ce-datascience/ce-optimize/<run-id>/exp-<NNN>-prompt.txt`, provision a separate experiment worktree from the current verified base for every parallel worker (serial runs may use the current experiment directory), and pass it explicitly. Use the user's security-posture selection (ask once per session if the spec does not set it).

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
if [ ! -f "$SKILL_DIR/scripts/experiment-worktree.sh" ]; then echo "ce-optimize: scripts/experiment-worktree.sh not found under SKILL_DIR=$SKILL_DIR" >&2; exit 1; fi;
experiment_path=$(bash "$SKILL_DIR/scripts/experiment-worktree.sh" create "<spec_name>" <exp_index> "optimize/<spec_name>" <shared_files...>);
cat /tmp/ce-datascience/ce-optimize/<run-id>/exp-<NNN>-prompt.txt | codex exec --cd "$experiment_path" --skip-git-repo-check - 2>&1
```

After 3 consecutive Codex delegation failures, disable Codex for the rest of the run, fall back to subagent dispatch, and log the switch. Then return to SKILL.md 3.3.

---
name: ce-clean-gone-branches
description: "Clean local git branches whose upstream tracking branches are gone, with confirmation before branch or worktree deletion."
---

# Clean Gone Branches


## Skill Value

- **Problem it solves:** Stale local branches and orphaned worktrees accumulate after PRs merge or remotes are pruned.
- **Use when:** The user asks to clean gone branches, prune local branches, or remove branches whose remotes no longer exist.
- **Output:** A confirmed branch/worktree cleanup summary.
- **Ask only if:** Before deleting anything, confirm the exact branches and worktrees to remove.
- **Do not do:** Do not delete unmerged or user-owned work without confirmation.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Delete local branches whose remote tracking branch has been deleted, including any associated worktrees.

## Workflow

### Step 1: Discover gone branches

Run the discovery script to fetch the latest remote state and identify gone branches:

```bash
bash scripts/clean-gone
```

`scripts/clean-gone`

The script runs `git fetch --prune` first, then parses `git branch -vv` for branches marked `: gone]`.

If the script outputs `__NONE__`, report that no stale branches were found and stop.

### Step 2: Inspect safety and present branches

For every candidate, inspect the associated worktree with `git status --short` and compare unique commits against the default branch with `git log <default>..<branch> --oneline`. A gone upstream only means the remote ref disappeared; it does not prove the work was merged or the worktree is clean.

Classify each branch:

- **Safe:** no dirty worktree and no commits unique to the branch.
- **Needs force approval:** dirty worktree, unique commits, or merge state cannot be established.

Show the classification and evidence before asking for deletion. Never combine safe and force-required branches behind one yes/no question.

### Step 3: Confirm safe cleanup

Show the user the list of branches that will be deleted. Format as a simple list:

```
These local branches have been deleted from the remote:

  - feature/old-thing
  - bugfix/resolved-issue
  - experiment/abandoned

Delete all of them? (y/n)
```

When this skill asks a user-facing question, follow the Skill Value interaction rule above.

This confirmation applies only to branches classified Safe.

### Step 4: Delete confirmed safe branches

If the user confirms, delete each branch. For each branch:

1. Check whether it has an associated worktree.
2. If the worktree is clean and is not the main repository root, remove it with `git worktree remove "$worktree_path"` without `--force`.
3. Delete the branch with `git branch -d "$branch"`.

If either non-force command refuses, stop for that branch and report why. Do not escalate automatically.

### Step 5: Optional force cleanup

For each branch classified Needs force approval, present the dirty paths and unique commits and request a separate explicit force confirmation naming that branch. Only after that confirmation may `git worktree remove --force` or `git branch -D` be used. A general "delete all" answer from Step 3 is not force approval.

Report results as you go:

```
Removed worktree: .worktrees/feature/old-thing
Deleted branch: feature/old-thing
Deleted branch: bugfix/resolved-issue
Deleted branch: experiment/abandoned

Cleaned up 3 branches.
```

If the user declines, acknowledge and stop without deleting anything.

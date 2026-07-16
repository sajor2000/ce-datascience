---
name: ce-worktree
description: Set up isolated git worktrees — create a new branch for fresh work, or attach a worktree to an existing branch/PR/commit to work on it in isolation. Use when starting isolated work or isolating an existing ref; detects existing isolation first.
---

# Worktree Isolation

## Skill Value

- **Problem it solves:** Worktree creation can duplicate existing isolation or create host-invisible state.
- **Use when:** The user or another workflow requests isolated branch or pull-request work.
- **Output:** The existing or newly created isolated workspace path and branch or ref.
- **Ask only if:** Isolation creation fails and continuing in the current checkout needs explicit approval.
- **Do not do:** Do not nest worktrees, force duplicate branch checkouts, or silently fall back to the current checkout.
- **Interaction:** Check isolation first and use the repository's shared interaction rule for any blocking decision.

Ensure the current work happens in an isolated workspace, without disturbing the user's main checkout. Most coding harnesses now create a worktree by default at session start, so the common case is that **isolation already exists** — detect that first and do not create a redundant one.

Order of operations: **detect existing isolation -> prefer a native worktree tool -> fall back to plain git.** Never create a worktree the harness cannot see.

**Two modes, set by the caller's need:**

- **New work (default).** No specific ref named — create a fresh branch from a base (trunk). This is what `ce-work` uses.
- **Isolate an existing ref.** The caller names a ref to work on in isolation — a PR head, an existing branch, or a commit. Attach the worktree to that ref instead of creating a branch. A branch can be checked out in only one worktree at a time. If the ref is already checked out, report its path and let the caller work there or explicitly choose a detached worktree.

## Step 0: Detect existing isolation

Compare resolved absolute paths, because Git mixes relative and absolute output from subdirectories:

```bash
git rev-parse --absolute-git-dir
(cd "$(git rev-parse --git-common-dir)" && pwd -P)
```

If the paths differ, distinguish a linked worktree from a submodule:

```bash
git rev-parse --show-superproject-working-tree
```

- Non-empty output -> this is a submodule; continue to Step 1.
- Empty output -> this is already an isolated worktree. If the caller requested new work or the current ref matches the requested existing ref, report its root and branch and work in place. If the caller requested a different existing ref, do not silently use the current checkout: inspect `git worktree list`, report an existing worktree for that ref when present, or request an explicit choice between switching to that path and creating an approved detached isolation. Never nest another worktree inside the current one.

## Step 1: Prefer the harness's native worktree tool

If the harness provides a native worktree primitive, use it and stop. Native tools place, track, and clean up the worktree so the harness can manage it. A behind-the-back `git worktree add` creates state the harness cannot navigate to or clean up.

## Step 2: Git fallback

Use plain Git only when no native tool exists and Step 0 found no existing isolation.

1. Run from the repository root: `cd "$(git rev-parse --show-toplevel)"`.
2. Choose a meaningful branch name from the work description and determine the base branch from the remote default, falling back to `main`.
3. Ensure `.worktrees/` is ignored before creating anything. Check `git check-ignore -q .worktrees/` with the trailing slash; add `.worktrees/` to `.gitignore` only when needed.
4. Best-effort fetch the base branch without changing the current checkout. A missing remote is non-fatal; use the local ref.
5. Create the worktree according to the caller's mode:
   - New work: `git worktree add -b <branch-name> .worktrees/<branch-name> origin/<from-branch>`; use the local base when the remote ref does not exist.
   - Existing branch or tag: `git worktree add .worktrees/<slug> <target-ref>`.
   - PR: create a local branch first with `git fetch origin pull/<n>/head:pr-<n>`, then run `git worktree add .worktrees/pr-<n> pr-<n>`. Never leave a PR worktree detached if the caller intends to commit fixes.
6. Switch into the new worktree.

If creation fails because of sandbox or permission restrictions, stop and request a blocking user decision through the current harness's standard interaction mechanism before touching the current checkout. If no blocking interaction mechanism exists or it errors, present numbered options and wait. Continue in the current checkout only with explicit confirmation.

## Other worktree operations

Use Git directly:

```bash
git worktree list
git worktree remove .worktrees/<branch>
cd .worktrees/<branch>
cd "$(git rev-parse --show-toplevel)"
```

## When to create a worktree

Create one only when the current checkout is not already isolated and a separate workspace is useful for PR review or parallel work. Do not create one for a single task that can happen safely on a feature branch.

## Integration

When `ce-work` or `ce-code-review` selects this skill, run Step 0 first. Proceed in place when already isolated; otherwise prefer native isolation and use a meaningful branch name.

## Troubleshooting

**Worktree already exists:** switch to its reported path or remove it before recreating it.

**Cannot remove the current worktree:** change to another checkout before running `git worktree remove`.

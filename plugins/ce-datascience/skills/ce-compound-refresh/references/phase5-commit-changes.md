# Phase 5: Commit Changes

Detail for /ce-compound-refresh § "Phase 5: Commit Changes". Linked from SKILL.md. Covers git-context detection, autofix-mode defaults, interactive-mode option presentation by branch state, and the commit-message style.

## Table of contents

1. Detect git context (branch, dirty tree, recent commit style).
2. Autofix mode defaults (main vs feature branch).
3. Interactive mode options (main / clean feature / dirty feature).
4. Commit message style.

---


After all actions are executed and the report is generated, handle committing the changes. Skip this phase if no files were modified (all Keep, or all writes failed).

### Detect git context

Before offering options, check:
1. Which branch is currently checked out (main/master vs feature branch)
2. Whether the working tree has other uncommitted changes beyond what compound-refresh modified
3. Recent commit messages to match the repo's commit style

### Autofix mode

Use sensible defaults — no user to ask:

| Context | Default action |
|---------|---------------|
| On main/master | Create a branch named for what was refreshed (e.g., `docs/refresh-auth-and-ci-learnings`), commit, attempt to open a PR. If PR creation fails, report the branch name. |
| On a feature branch | Commit as a separate commit on the current branch |
| Git operations fail | Include the recommended git commands in the report and continue |

Stage only the files that compound-refresh modified — not other dirty files in the working tree.

### Interactive mode

First, run `git branch --show-current` to determine the current branch. Then present the correct options based on the result. Stage only compound-refresh files regardless of which option the user picks.

**If the current branch is main, master, or the repo's default branch:**

1. Create a branch, commit, and open a PR (recommended) — the branch name should be specific to what was refreshed, not generic (e.g., `docs/refresh-auth-learnings` not `docs/compound-refresh`)
2. Commit directly to `{current branch name}`
3. Don't commit — I'll handle it

**If the current branch is a feature branch, clean working tree:**

1. Commit to `{current branch name}` as a separate commit (recommended)
2. Create a separate branch and commit
3. Don't commit

**If the current branch is a feature branch, dirty working tree (other uncommitted changes):**

1. Commit only the compound-refresh changes to `{current branch name}` (selective staging — other dirty files stay untouched)
2. Don't commit

### Commit message

Write a descriptive commit message that:
- Summarizes what was refreshed (e.g., "update 3 stale learnings, consolidate 2 overlapping docs, delete 1 obsolete doc")
- Follows the repo's existing commit conventions (check recent git log for style)
- Is succinct — the details are in the changed files themselves


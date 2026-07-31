---
name: ce-babysit-pr
description: "Monitor one open GitHub PR within a bounded watch or checkpoint and surface actionable CI and review residuals."
argument-hint: "[PR number, URL, or blank for current branch] [watch|checkpoint] [duration]"
---

# Babysit a PR

## Skill Value

- **Problem it solves:** Open PRs accumulate asynchronous CI and reviewer signals that are easy to miss or mishandle.
- **Use when:** A user asks to monitor, watch, or babysit one GitHub pull request.
- **Output:** A bounded status report with resolved work, current blockers, and explicit residuals.
- **Ask only if:** The PR target cannot be resolved or a required semantic decision exceeds delegated authority.
- **Do not do:** Merge, approve, rebase, force-push, or treat a green check as human merge authorization.

Monitor one GitHub pull request for review feedback, CI changes, and base-branch currency. The outcome is an honest `looks-ready`, `blocked`, `residual`, or `budget-exhausted` report. This skill never merges, approves checks, force-pushes, rebases, or broadens scope beyond the named PR.

## Preconditions and scope

Resolve the PR with `gh`; require an open PR and a checkout on its head branch before delegating any mutation. GitHub is the only supported provider. `checkpoint` takes one snapshot; `watch` repeats snapshots only for the stated duration, defaulting to 30 minutes and never exceeding 60 minutes without a new user request.

## Watch loop

For each snapshot, collect review threads/comments, check status, mergeability, and base currency. Delegate one bounded feedback pass to `ce-resolve-pr-feedback` only for actionable review input, and one bounded diagnostic pass to `ce-debug` only for a real failing check. Delegates inherit only fix/commit/push/reply authority for the PR head; merge, rebase, force-push, approval, and unrelated edits are excluded.

Keep needs-human and terminal-red items as visible residuals while continuing to monitor independent streams. Report `looks-ready` only when GitHub reports a clean merge state, every observed check is terminal and passing, actionable feedback is empty, and there are no parked residuals. Otherwise report the exact blocker and next safe action.

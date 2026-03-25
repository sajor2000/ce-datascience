---
name: git-commit-push-pr
description: Commit, push, and open a PR with an adaptive, value-first description. Use when the user says "commit and PR", "push and open a PR", "ship this", "create a PR", "open a pull request", "commit push PR", or wants to go from working changes to an open pull request in one step. Produces PR descriptions that scale in depth with the complexity of the change, avoiding cookie-cutter templates.
---

# Git Commit, Push, and PR

Go from working tree changes to an open pull request in a single workflow. The key differentiator of this skill is PR descriptions that communicate *value and intent* proportional to the complexity of the change.

## Workflow

### Step 1: Gather context

Run these commands. Use `command git` to bypass aliases and RTK proxies.

```bash
command git status
command git diff HEAD
command git branch --show-current
command git log --oneline -10
```

If there are no changes, report that and stop.

### Step 2: Determine conventions

Follow this priority order for commit messages *and* PR titles:

1. **Repo conventions already in context** -- If project instructions (AGENTS.md, CLAUDE.md, or similar) are loaded and specify conventions, follow those. Do not re-read these files; they are loaded at session start.
2. **Recent commit history** -- If no explicit convention exists, match the pattern visible in the last 10 commits.
3. **Default: conventional commits** -- `type(scope): description` as the fallback.

### Step 3: Branch, stage, and commit

1. If on `main` or the repo's default branch, create a descriptive feature branch first (`command git checkout -b <branch-name>`). Derive the branch name from the change content.
2. Before staging everything together, scan the changed files for naturally distinct concerns. If modified files clearly group into separate logical changes (e.g., a refactor in one set of files and a new feature in another), create separate commits for each group. Keep this lightweight -- group at the **file level only** (no `git add -p`), split only when obvious, and aim for two or three logical commits at most. If it's ambiguous, one commit is fine.
3. Stage relevant files by name. Avoid `git add -A` or `git add .` to prevent accidentally including sensitive files.
4. Commit following the conventions from Step 2. Use a heredoc for the message.

### Step 4: Push

```bash
command git push -u origin HEAD
```

### Step 5: Write the PR description

This is the most important step. The description must be **adaptive** -- its depth should match the complexity of the change. A one-line bugfix does not need a table of performance results. A large architectural change should not be a bullet list.

#### Sizing the change

Assess the PR along two axes before writing:

- **Size**: How many files changed? How large is the diff?
- **Complexity**: Is this a straightforward change (rename, dependency bump, typo fix) or does it involve design decisions, trade-offs, new patterns, or cross-cutting concerns?

Use this to select the right description depth:

| Change profile | Description approach |
|---|---|
| Small + simple (typo, config, dep bump) | 1-2 sentences, no headers. Total body under ~300 characters. |
| Small + non-trivial (targeted bugfix, behavioral change) | Short "Problem / Fix" narrative, ~3-5 sentences. Enough for a reviewer to understand *why* without reading the diff. No headers needed unless there are two distinct concerns. |
| Medium feature or refactor | Summary paragraph, then a section explaining what changed and why. Call out design decisions. |
| Large or architecturally significant | Full narrative: problem context, approach chosen (and why), key decisions, migration notes or rollback considerations if relevant. |
| Performance improvement | Include before/after measurements if available. A markdown table is effective here. |

**Brevity matters for small changes.** A 3-line bugfix with a 20-line PR description signals the author didn't calibrate. Match the weight of the description to the weight of the change. When in doubt, shorter is better -- reviewers can read the diff.

#### Writing principles

- **Lead with value**: The first sentence should tell the reviewer *why this PR exists*, not *what files changed*. "Fixes timeout errors during batch exports" beats "Updated export_handler.py and config.yaml".
- **Explain the non-obvious**: If the diff is self-explanatory, don't narrate it. Spend description space on things the diff *doesn't* show: why this approach, what was considered and rejected, what the reviewer should pay attention to.
- **Use structure when it earns its keep**: Headers, bullet lists, and tables are tools -- use them when they aid comprehension, not as mandatory template sections. An empty "## Breaking Changes" section adds noise.
- **Markdown tables for data**: When there are before/after comparisons, performance numbers, or option trade-offs, a table communicates density well. Example:

  ```markdown
  | Metric | Before | After |
  |--------|--------|-------|
  | p95 latency | 340ms | 120ms |
  | Memory (peak) | 2.1GB | 1.4GB |
  ```

- **No empty sections**: If a section (like "Breaking Changes" or "Migration Guide") doesn't apply, omit it entirely. Do not include it with "N/A" or "None".
- **Test plan -- only when it adds value**: Include a test plan section when the testing approach is non-obvious: edge cases the reviewer might not think of, verification steps for behavior that's hard to see in the diff, or scenarios that require specific setup. Omit it for straightforward changes where the tests are self-explanatory or where "run the tests" is the only useful guidance. A test plan for "verify the typo is fixed" is noise.

#### Numbering and references

**Never prefix list items with `#`** in PR descriptions. GitHub interprets `#1`, `#2`, etc. as issue/PR references and auto-links them. Instead of:

```markdown
## Changes
#1. Updated the parser
#2. Fixed the validation
```

Write:

```markdown
## Changes
1. Updated the parser
2. Fixed the validation
```

When referencing actual GitHub issues or PRs, use the full format: `org/repo#123` or the full URL. Never use bare `#123` unless you have verified it refers to the correct issue in the current repository.

### Step 6: Create the PR

```bash
command gh pr create --title "the pr title" --body "$(cat <<'EOF'
PR description here
EOF
)"
```

Keep the PR title under 72 characters. The title follows the same convention as commit messages (Step 2).

### Step 7: Report

Output the PR URL so the user can navigate to it directly.

## Important: Use `command git` and `command gh`

Always invoke git as `command git` and gh as `command gh` in shell commands. This bypasses shell aliases and tools like RTK (Rust Token Killer) that proxy commands.

---
name: ce-commit
description: "Creates a focused conventional git commit that keeps raw data, PHI, and large outputs out of version control. Use when the user says commit or save changes."
---

# Git Commit


## Skill Value

- **Problem it solves:** Uncommitted work needs to be saved without staging unrelated files or producing vague commit messages.
- **Use when:** The user says commit, save changes, or create a commit for current staged or unstaged work.
- **Output:** One or more focused commits with repo-convention messages.
- **Ask only if:** Only when branch safety, detached HEAD state, or ambiguous grouping blocks a safe commit.
- **Do not do:** Do not stage unrelated files or commit directly to the default branch without following repo policy.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Create well-crafted local commit(s) from the current working tree. No push, no PR: use the `ce-commit-push-pr` skill for the full ship flow.

## Context

Gather context at runtime. Run each command below as its **own** shell call (program and arguments only). Do not join commands with `;`, `&&`, `||`, pipes, `$(...)`, or redirects such as `2>/dev/null`: that syntax fails under some shells. Read each exit status directly. A non-zero exit is a state to interpret, not a failure to suppress.

| Command | Purpose | Non-zero exit / empty output means |
| --- | --- | --- |
| `git status` | Working-tree state | Not a git repository: report and stop |
| `git diff HEAD` | Uncommitted changes | Unborn repo (no commits yet): every file is new; rely on `git status` |
| `git branch --show-current` | Current branch | Empty output = detached HEAD |
| `git log --oneline -10` | Recent message style | Unborn repo: no history to match |
| `git rev-parse --abbrev-ref origin/HEAD` | Remote default branch | No `origin/HEAD` (it may still print `origin/HEAD`; ignore that output): run `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'`; if that also fails, use `main` |

**Default branch name:** strip a leading `origin/` (so `origin/trunk` -> `trunk`) and compare the bare name against the current branch. Never compare against `origin/<name>`.

This output is a snapshot. Re-read the branch immediately before committing (Step 6).

## Workflow

### Step 1: Gather and check for work

Run every Context command. If `git status` shows no staged, modified, or untracked files, report that there is nothing to commit and stop. Do not judge cleanliness from `git diff HEAD` alone; it misses untracked files.

### Step 2: Resolve the branch

- **Detached HEAD:** if the branch decision cannot be inferred, ask whether to create a feature branch (Skill Value interaction rule). If yes, derive a name from the change content, run `git checkout -b <branch-name>`, then re-read `git branch --show-current`. If the user declines, continue on detached HEAD.
- **On `main`, `master`, or the bare default branch name:** create a feature branch without asking; committing on the default branch is not an option here. Derive the name from the change content, run `git checkout -b <branch-name>`, and re-read `git branch --show-current`. If the name exists, pick a non-conflicting suffix.
- **Unborn repo** (`git log` failed): there is no default-branch history yet. Ask whether the initial commit goes on the current branch or a new one.

### Step 3: Determine the message convention

1. **Repo conventions already in context:** follow commit conventions from loaded project instructions (AGENTS.md, CLAUDE.md, or similar). Do not re-read those files.
2. **Recent history:** otherwise match a clear pattern in the last 10 commits (conventional commits, ticket prefixes).
3. **Default:** conventional commits, `type(scope): description`, with type one of `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `style`, `build`.

Choose the type by intent. Where `fix:` and `feat:` both fit, default to `fix:`: remedying broken or missing behavior is `fix:` even when it adds code. Reserve `feat:` for capabilities the user could not previously accomplish. The user may override.

### Step 4: Group into logical commits

If changed files clearly split into distinct concerns (for example, a cleaning-script fix and an unrelated figure update), make separate commits. Group at the **file level only** (no `git add -p`), 2-3 commits at most. If the split is ambiguous, make one commit.

### Step 5: Check for data, PHI, and large outputs

Before staging, review every file named for a commit. Leave out, and report as left out:

- Patient-level or raw data files (`.csv`, `.tsv`, `.parquet`, `.feather`, `.rds`, `.RData`, `.sas7bdat`, `.dta`, `.sav`, `.xlsx`, and similar) unless they are clearly synthetic fixtures or aggregate outputs the repo already tracks.
- Anything that may hold PHI or identifiers (MRNs, names, dates of birth, free-text notes), credentials, or `.env` files.
- Large or regenerable outputs: model objects, caches (`__pycache__/`, `.Rproj.user/`, `.ipynb_checkpoints/`), rendered reports the repo does not track, and files over roughly 50 MB.

Never use `git add -f` on an ignored path. If the user explicitly asks to commit one of these files, confirm it is synthetic or de-identified first.

### Step 6: Stage and commit

Re-run `git branch --show-current` immediately before committing. If it differs from the branch resolved in Step 2, or is now the default branch, stop and re-resolve per Step 2.

Write the message:

- **Subject:** imperative, names the outcome (what is now possible or fixed), not the file list. Follow the Step 3 convention.
  - Bad: `Update clean_labs.R` / `Add tests and fix stuff`
  - Good: `fix(cohort): exclude encounters after the index discharge`
- **Body:** only when motivation or trade-offs are not obvious from the subject; separate it with a blank line.

For each commit group, isolate the named files in a temporary index so the user's real index remains untouched until the commit succeeds. Never use `git add -A` or `git add .`. For each named file, copy its existing staged snapshot when present; otherwise add its working-tree content only to the temporary index. Write the complete message to a file outside the repository with the file-write tool, then commit the temporary index without pathspecs:

```bash
group_index_dir=$(mktemp -d -t ce-commit-index-XXXXXX) || exit $?
group_index="$group_index_dir/index"
GIT_INDEX_FILE="$group_index" git read-tree HEAD || exit $?
for group_path in "file1" "file2" "file3"; do
  if git diff --cached --quiet -- "$group_path"; then
    GIT_INDEX_FILE="$group_index" git add -- "$group_path" || exit $?
  else
    diff_status=$?
    test "$diff_status" -eq 1 || exit "$diff_status"
    group_patch="$group_index_dir/staged.patch"
    git diff --cached --binary -- "$group_path" > "$group_patch" || exit $?
    GIT_INDEX_FILE="$group_index" git apply --cached --binary "$group_patch" || exit $?
  fi
done
GIT_INDEX_FILE="$group_index" git commit -F <message-file> || exit $?
git restore --staged --source=HEAD -- file1 file2 file3 || exit $?
```

- Run the commands in order and stop immediately if any command fails. Run the final restore only after the temporary-index commit succeeds; it aligns only the committed paths in the real index with the new `HEAD`.
- Exit status 1 from the conditional `git diff --quiet` means the file has a staged snapshot, which is copied into the temporary index; any other inspection failure stops the workflow.
- In an unborn repo, replace `git read-tree HEAD` with `GIT_INDEX_FILE="$group_index" git read-tree --empty || exit $?`.
- `-F` passes `$`, quotes, backticks, and multi-line bodies literally under any shell.

### Step 7: Confirm

Run `git status` to verify. Report the commit hash(es), subject line(s), and any files left out in Step 5.

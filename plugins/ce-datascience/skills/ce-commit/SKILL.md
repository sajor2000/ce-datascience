---
name: ce-commit
description: "Create a focused git commit with a value-oriented conventional message while preserving branch and staging safety."
---

# Git Commit


## Skill Value

- **Problem it solves:** Uncommitted work needs to be saved without staging unrelated files or producing vague commit messages.
- **Use when:** The user says commit, save changes, or create a commit for current staged or unstaged work.
- **Output:** One or more focused commits with repo-convention messages.
- **Ask only if:** Only when branch safety, detached HEAD state, or ambiguous grouping blocks a safe commit.
- **Do not do:** Do not stage unrelated files or commit directly to the default branch without following repo policy.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Create a single, well-crafted git commit from the current working tree changes.

## Context

**On platforms other than Claude Code**, skip to the "Context fallback" section below and run the command there to gather context.

**In Claude Code**, the five labeled sections below (Git status, Working tree diff, Current branch, Recent commits, Remote default branch) contain pre-populated data. Use them directly throughout this skill -- do not re-run these commands.

**Git status:**
!`git status`

**Working tree diff:**
!`git diff HEAD`

**Current branch:**
!`git branch --show-current`

**Recent commits:**
!`git log --oneline -10`

**Remote default branch:**
!`git rev-parse --abbrev-ref origin/HEAD 2>/dev/null || echo '__DEFAULT_BRANCH_UNRESOLVED__'`

### Context fallback

**In Claude Code, skip this section — the data above is already available.**

Run this single command to gather all context:

```bash
printf '=== STATUS ===\n'; git status; printf '\n=== DIFF ===\n'; git diff HEAD; printf '\n=== BRANCH ===\n'; git branch --show-current; printf '\n=== LOG ===\n'; git log --oneline -10; printf '\n=== DEFAULT_BRANCH ===\n'; git rev-parse --abbrev-ref origin/HEAD 2>/dev/null || echo '__DEFAULT_BRANCH_UNRESOLVED__'
```

---

## Workflow

### Step 1: Gather context

Use the context above (git status, working tree diff, current branch, recent commits, remote default branch). All data needed for this step is already available -- do not re-run those commands.

The remote default branch value returns something like `origin/main`. Strip the `origin/` prefix to get the branch name. If it returned `__DEFAULT_BRANCH_UNRESOLVED__` or a bare `HEAD`, try:

```bash
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
```

If both fail, fall back to `main`.

If the git status from the context above shows a clean working tree (no staged, modified, or untracked files), report that there is nothing to commit and stop.

If HEAD is detached and the branch decision cannot be inferred, ask the branch question using the Skill Value interaction rule above.

- If the user chooses to create a branch, derive the name from the change content, create it with `git checkout -b <branch-name>`, then run `git branch --show-current` again and use that result as the current branch name for the rest of the workflow.
- If the user declines, continue with the detached HEAD commit.

### Step 2: Determine commit message convention

Follow this priority order:

1. **Repo conventions already in context** -- If project instructions (AGENTS.md, CLAUDE.md, or similar) are already loaded and specify commit message conventions, follow those. Do not re-read these files; they are loaded at session start.
2. **Recent commit history** -- If no explicit convention is documented, examine the 10 most recent commits from Step 1. If a clear pattern emerges (e.g., conventional commits, ticket prefixes, emoji prefixes), match that pattern.
3. **Default: conventional commits** -- If neither source provides a pattern, use conventional commit format: `type(scope): description` where type is one of `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `style`, `build`.

When using conventional commits, choose the type that most precisely describes the change (the type list above). Where `fix:` and `feat:` both seem to fit, default to `fix:`: a change that remedies broken or missing behavior is `fix:` even when implemented by adding code. Reserve `feat:` for capabilities the user could not previously accomplish. Other types remain primary when they fit better. The user may override for a specific change.

### Step 3: Consider logical commits

Before staging everything together, scan the changed files for naturally distinct concerns. If modified files clearly group into separate logical changes (e.g., a refactor in one directory and a new feature in another, or test files for a different change than source files), create separate commits for each group.

Keep this lightweight:
- Group at the **file level only** -- do not use `git add -p` or try to split hunks within a file.
- If the separation is obvious (different features, unrelated fixes), split. If it's ambiguous, one commit is fine.
- Two or three logical commits is the sweet spot. Do not over-slice into many tiny commits.

### Step 4: Stage and commit

If the current branch from the context above is `main`, `master`, or the resolved default branch from Step 1, automatically create a feature branch before committing. Derive the branch name from the change content, create it with `git checkout -b <branch-name>`, run `git branch --show-current` to confirm, and use the new branch as the current branch for the rest of the workflow. Do not ask whether to branch -- committing on the default branch is not an option here.

Write the commit message:
- **Subject line**: Concise, imperative mood, focused on *why* not *what*. Follow the convention determined in Step 2.
- **Body** (when needed): Add a body separated by a blank line for non-trivial changes. Explain motivation, trade-offs, or anything a future reader would need. Omit the body for obvious single-purpose changes.

For each commit group, isolate the named files in a temporary index so the user's real index remains untouched until the commit succeeds. Never use `git add -A` or `git add .`. For each named file, copy its existing staged snapshot when present; otherwise add its working-tree content only to the temporary index. Write the complete message to a file outside the repository, then commit the temporary index without pathspecs:

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

Exit status 1 from the conditional `git diff --quiet` means the file has a staged snapshot, which is copied into the temporary index; any other inspection failure stops the workflow. Run the commands in order and stop immediately if any command fails. Run the final restore only after the temporary-index commit succeeds. Using `-F` passes `$`, quotes, backticks, and multi-line bodies literally across shells. The final restore aligns only the committed paths in the real index with the new `HEAD`.

### Step 5: Confirm

Run `git status` after the commit to verify success. Report the commit hash(es) and subject line(s).

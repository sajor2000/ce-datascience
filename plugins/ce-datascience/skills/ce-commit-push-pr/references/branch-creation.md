# Branch creation from the default branch

Used by Step 4 when work sits on the default branch `<base>`. Local `<base>` is not a trustworthy starting point, for two reasons local git cannot tell apart:

- **Stale-base contamination.** Another session, worktree, or background process advanced local `<base>` past `origin/<base>` with unrelated commits. Branching from local `HEAD` carries them into the PR.
- **Forgot-to-branch.** The user authored real commits on local `<base>` meant for a feature branch. Branching from `origin/<base>` silently drops them.

Author email does not help (sessions often share `user.email`), so ask when unpushed commits exist.

## Decision flow

Run each command as its own shell call and branch on its exit status.

### 1. Fetch the remote base

```bash
git fetch --no-tags origin <base>
```

- **Exit 0:** continue to step 2.
- **Non-zero** (network, auth, no remote): go to "Fetch failure fallback".

### 2. Check for unpushed commits on local `<base>`

```bash
git log origin/<base>..HEAD --oneline
```

- **Empty output:** set `BASE_REF=origin/<base>` and go to step 3.
- **Non-empty output:** show the commit list and ask (Skill Value interaction rule in `SKILL.md`):

  > "Local `<base>` has N unpushed commits not on `origin/<base>`. Carry them onto the new feature branch, or leave them on local `<base>`?"

  - **Carry forward** (forgot to branch): `BASE_REF=HEAD`.
  - **Leave on `<base>`** (stale base): `BASE_REF=origin/<base>`. The commits stay on local `<base>` for the user to handle.

  Never pick silently. Carrying foreign commits into a PR is worse than asking again.

### 3. Create the feature branch

```bash
git checkout --no-overwrite-ignore -b <branch-name> "$BASE_REF"
```

`--no-overwrite-ignore` makes git abort instead of silently replacing a gitignored working-tree file with a tracked file of the same path from `BASE_REF`. In analysis repos those ignored files are often irreplaceable: raw data pulls, PHI or patient-level extracts, credentials, cached model fits. A plain `git checkout -b` overwrites them without warning.

- **Exit 0:** the branch exists. Return to Step 4 in `SKILL.md`.
- **Non-zero because uncommitted or ignored files would be overwritten:** stop. Show the colliding paths from git's error and ask the user how to handle them (for example, move the data file outside the repo, or commit or discard the tracked edit). Do not stash, delete, move, or overwrite the colliding paths yourself, and do not retry with a plain `git checkout`.
- **Non-zero for another reason** (branch name exists, invalid ref): pick a non-conflicting name or report the error.

## Fetch failure fallback

Without a fresh `origin/<base>`, freshness and unpushed-commit checks are unreliable. Branch from local `HEAD` (the working tree does not change, so nothing is overwritten):

```bash
git checkout -b <branch-name>
```

Say in the user-facing summary that base freshness was not verified. Skip the unpushed-commits check.

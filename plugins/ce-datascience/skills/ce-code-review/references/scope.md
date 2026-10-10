# Stage 1: Determine Scope

## Contents

- Private scratch directory
- Capture path names
- `base:` argument (fast path)
- PR number or GitHub URL
- Branch name
- No argument (standalone on current branch)
- Collect the permitted diff
- Untracked files

Compute the diff range, file list, and diff. Scope collection is two-phase so a review cannot ingest patient-level content before authorization: first capture path names and metadata privately, then apply the PHI-safe scope preflight from SKILL.md, then collect only the permitted content.

## Private scratch directory

Run all scope capture in one shell session with a private, non-synced scratch
directory and an exit trap. Do not print its contents before the PHI-safe
preflight permits them:

```bash
umask 077
REVIEW_SCOPE_DIR=$(mktemp -d -t ce-review-scope-XXXXXX) || exit 1
cleanup_review_scope() { rm -rf -- "$REVIEW_SCOPE_DIR"; }
trap cleanup_review_scope EXIT
trap 'cleanup_review_scope; exit 130' HUP INT TERM
```

Store every temporary path list and PR metadata file under
`$REVIEW_SCOPE_DIR`. Keep the trap active through scope collection so success,
failure, and interruption remove the captured data.

## Capture path names

Every path below ends by capturing path names locally for the preflight without printing them, once `BASE` is resolved:

```bash
SCOPE_PATHS_DIR="$REVIEW_SCOPE_DIR/paths"
mkdir -p "$SCOPE_PATHS_DIR"
git diff --name-only -z "$BASE" > "$SCOPE_PATHS_DIR/changed"
git ls-files --others --exclude-standard -z > "$SCOPE_PATHS_DIR/untracked"
echo "BASE:$BASE"
```

Using `git diff $BASE` (without `..HEAD`) diffs the merge-base against the working tree, which includes committed, staged, and unstaged changes together.

## `base:` argument (fast path)

The caller already knows the diff base. Skip all base-branch detection, remote resolution, and merge-base computation. Use the provided value directly, then capture path names:

```
BASE_ARG="{base_arg}"
BASE=$(git merge-base HEAD "$BASE_ARG" 2>/dev/null) || BASE="$BASE_ARG"
```

This path works with any ref — a SHA, `origin/main`, a branch name. Automated callers such as `ce-work` should prefer it to avoid the detection overhead. **Do not combine `base:` with a PR number or branch target.** If both are present, stop with an error: "Cannot use `base:` with a PR number or branch target — `base:` implies the current checkout is already the correct branch. Pass `base:` alone, or pass the target alone and let scope detection resolve the base." This avoids scope/intent mismatches where the diff base comes from one source but the code and metadata come from another.

## PR number or GitHub URL

If `mode:agent`, `mode:report-only`, or `mode:headless` is active, do **not** run `gh pr checkout <number-or-url>` on the shared checkout. In `mode:agent`, return JSON with `status: failed` and a reason directing the caller to review the already checked-out PR via `base:<ref>` or an isolated checkout. For `mode:report-only`, tell the caller: "mode:report-only cannot switch the shared checkout to review a PR target. Run it from an isolated worktree/checkout for that PR, or run report-only with no target argument on the already checked out branch." For `mode:headless`, emit `Review failed (headless mode). Reason: cannot switch shared checkout. Re-invoke with base:<ref> to review the current checkout, or run from an isolated worktree.` Stop here unless the review is already running in an isolated checkout.

**Skip-condition pre-check.** Before checkout or scope detection, capture PR state and path metadata locally. Print only the state until the PHI-safe preflight permits reading the other metadata:

```bash
PR_PREFLIGHT_FILE="$REVIEW_SCOPE_DIR/pr-preflight.json"
gh pr view <number-or-url> --json state,title,files > "$PR_PREFLIGHT_FILE"
jq -r '.state' "$PR_PREFLIGHT_FILE"
```

Apply skip rules in order:

- `state` is `CLOSED` or `MERGED` -> stop with message `PR is closed/merged; not reviewing.`
- Apply the PHI-safe scope preflight to the locally captured title and paths before reading or delegating them.
- **Trivial-PR judgment**: after the preflight permits the metadata, spawn a lightweight sub-agent (use `model: haiku` in Claude Code; in Codex use the smallest available model — if the available model names are unknown, omit the model parameter and let the harness default) with the PR title and PHI-free changed-path metadata only. The agent's task: "Is this an automated or trivial PR that does not warrant a code review? Consider: dependency lock-file or manifest-only bumps, automated release commits, chore version increments with no substantive code changes. When in doubt, answer no — false negatives (skipped reviews that should have run) are more costly than false positives (unnecessary reviews)." If the judgment returns yes: stop with message `PR appears to be a trivial automated PR; not reviewing. Run without a PR argument to review the current branch, or pass base:<ref> if review is intended.`

When any skip rule fires, emit the message and stop without dispatching reviewers, switching the checkout, or running scope detection. **Standalone branch mode and `base:` mode are unaffected** -- they always run the full review. **Draft PRs are reviewed normally** -- draft status is not a skip condition; early feedback on in-progress work is valuable.

If no skip rule fires, verify the worktree is clean before switching branches:

```
git status --porcelain
```

If the output is non-empty, inform the user: "You have uncommitted changes on the current branch. Stash or commit them before reviewing a PR, or use standalone mode (no argument) to review the current branch as-is." Do not proceed with checkout until the worktree is clean.

Then check out the PR branch so persona agents can read the actual code (not the current checkout):

```
gh pr checkout <number-or-url>
```

Then fetch PR metadata without reading the PR body yet. Capture the base branch name and the PR base repository identity, not just the branch name. Keep the raw values in the private scope directory; read them only after the preflight permits access, and sanitize title and branch values before printing or placing them in reviewer context:

```bash
gh pr view <number-or-url> --json title,baseRefName,headRefName,url > "$REVIEW_SCOPE_DIR/pr-details.json"
```

Use the repository portion of the returned PR URL as `<base-repo>` (for example, `sajor2000/ce-datascience` from `https://github.com/sajor2000/ce-datascience/pull/348`).

Then compute a local diff against the PR's base branch so re-reviews also include local fix commits and uncommitted edits. Substitute the PR base branch from metadata (shown here as `<base>`) and the PR base repository identity derived from the PR URL (shown here as `<base-repo>`). Resolve the base ref from the PR's actual base repository, not by assuming `origin` points at that repo:

```
PR_BASE_REMOTE=$(git remote -v | awk 'index($2, "github.com:<base-repo>") || index($2, "github.com/<base-repo>") {print $1; exit}')
if [ -n "$PR_BASE_REMOTE" ]; then PR_BASE_REMOTE_REF="$PR_BASE_REMOTE/<base>"; else PR_BASE_REMOTE_REF=""; fi
PR_BASE_REF=$(git rev-parse --verify "$PR_BASE_REMOTE_REF" 2>/dev/null || git rev-parse --verify <base> 2>/dev/null || true)
if [ -z "$PR_BASE_REF" ]; then
  if [ -n "$PR_BASE_REMOTE_REF" ]; then
    git fetch --no-tags "$PR_BASE_REMOTE" <base>:refs/remotes/"$PR_BASE_REMOTE"/<base> 2>/dev/null || git fetch --no-tags "$PR_BASE_REMOTE" <base> 2>/dev/null || true
    PR_BASE_REF=$(git rev-parse --verify "$PR_BASE_REMOTE_REF" 2>/dev/null || git rev-parse --verify <base> 2>/dev/null || true)
  else
    if git fetch --no-tags https://github.com/<base-repo>.git <base> 2>/dev/null; then
      PR_BASE_REF=$(git rev-parse --verify FETCH_HEAD 2>/dev/null || true)
    fi
    if [ -z "$PR_BASE_REF" ]; then PR_BASE_REF=$(git rev-parse --verify <base> 2>/dev/null || true); fi
  fi
fi
if [ -n "$PR_BASE_REF" ]; then BASE=$(git merge-base HEAD "$PR_BASE_REF" 2>/dev/null) || BASE=""; else BASE=""; fi
```

```bash
if [ -n "$BASE" ]; then SCOPE_PATHS_DIR="$REVIEW_SCOPE_DIR/paths" && mkdir -p "$SCOPE_PATHS_DIR" && git diff --name-only -z "$BASE" > "$SCOPE_PATHS_DIR/changed" && git ls-files --others --exclude-standard -z > "$SCOPE_PATHS_DIR/untracked" && echo "BASE:$BASE"; else echo "ERROR: Unable to resolve PR base branch <base> locally. Fetch the base branch and rerun so the review scope stays aligned with the PR."; fi
```

Extract PR title/body, base branch, and PR URL from `gh pr view`, then extract the base marker, file list, diff content, and `UNTRACKED:` list from the local command. Do not use `gh pr diff` as the review scope after checkout -- it only reflects the remote PR state and will miss local fix commits until they are pushed. If the base ref still cannot be resolved from the PR's actual base repository after the fetch attempt, stop instead of falling back to `git diff HEAD`; a PR review without the PR base branch is incomplete.

## Branch name

Check out the named branch, then diff it against the base branch. Substitute the provided branch name (shown here as `<branch>`).

If `mode:agent`, `mode:report-only`, or `mode:headless` is active, do **not** run `git checkout <branch>` on the shared checkout. In `mode:agent`, return JSON with `status: failed` and a reason directing the caller to use `base:<ref>` on the current checkout or an isolated checkout. For `mode:report-only`, tell the caller: "mode:report-only cannot switch the shared checkout to review another branch. Run it from an isolated worktree/checkout for `<branch>`, or run report-only on the current checkout with no target argument." For `mode:headless`, emit `Review failed (headless mode). Reason: cannot switch shared checkout. Re-invoke with base:<ref> to review the current checkout, or run from an isolated worktree.` Stop here unless the review is already running in an isolated checkout.

Verify the worktree is clean before switching branches:

```
git status --porcelain
```

If the output is non-empty, inform the user: "You have uncommitted changes on the current branch. Stash or commit them before reviewing another branch, or provide a PR number instead." Do not proceed with checkout until the worktree is clean.

```
git checkout <branch>
```

Then detect the review base branch and compute the merge-base. Run the bundled `references/resolve-base.sh` script, which handles fork-safe remote resolution with multi-fallback detection (PR metadata -> `origin/HEAD` -> `gh repo view` -> common branch names). The shell starts in the user's project root, not this skill's directory, so anchor the script on `SKILL_DIR`, set to the absolute path of the directory containing this skill's SKILL.md:

```
SKILL_DIR="<absolute path of the directory containing this SKILL.md>"
[ -f "$SKILL_DIR/references/resolve-base.sh" ] || { echo "ERROR: resolve-base.sh not found under SKILL_DIR"; exit 1; }
RESOLVE_OUT=$(bash "$SKILL_DIR/references/resolve-base.sh") || { echo "ERROR: resolve-base.sh failed"; exit 1; }
if [ -z "$RESOLVE_OUT" ] || echo "$RESOLVE_OUT" | grep -q '^ERROR:'; then echo "${RESOLVE_OUT:-ERROR: resolve-base.sh produced no output}"; exit 1; fi
BASE=$(echo "$RESOLVE_OUT" | sed 's/^BASE://')
```

If the script outputs an error, stop instead of falling back to `git diff HEAD`; a branch review without the base branch would only show uncommitted changes and silently miss all committed work.

On success, capture path names. You may still fetch additional PR metadata with `gh pr view` for title, body, and linked issues, but do not fail if no PR exists.

## No argument (standalone on current branch)

Detect the review base branch and compute the merge-base by running the same `references/resolve-base.sh` command block shown under Branch name.

If the script outputs an error, stop instead of falling back to `git diff HEAD`; a standalone review without the base branch would only show uncommitted changes and silently miss all committed work on the branch.

On success, capture path names.

## Collect the permitted diff

After applying the PHI-safe scope preflight, run `git diff -U10 $BASE` only for the permitted paths. For an authorized PHI-risk review, keep patient-level path content out of every general reviewer context and retrieve the PR body only when it is permitted by the same authorization boundary. For an unconfirmed PHI-risk review, do not retrieve the PR body or a broad diff.

## Untracked files

After the PHI-safe preflight permits path-name access, inspect the captured untracked list even when the tracked diff is non-empty. Untracked files are outside review scope until staged. If the list is non-empty, tell the user which PHI-free files are excluded. Describe any PHI-risk path only by opaque identifier and category. If any should be reviewed, stop and tell the user to stage the intended files and rerun. In `mode:agent`, `mode:headless`, `mode:autofix`, or `mode:report-only`, do not stop to ask; proceed with tracked changes only and note the safely described exclusions in Coverage.

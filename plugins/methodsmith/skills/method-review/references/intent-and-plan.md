# Stages 2 and 2b: Intent and Plan Discovery

## Stage 2: Intent discovery

Understand what the change is trying to accomplish. The source of intent depends on which Stage 1 path was taken:

**PR/URL mode:** Use the PHI-free (sanitized) PR title, body, and linked issues from `gh pr view` metadata that the preflight permitted. Supplement with commit messages from the PR if the body is sparse.

**Branch mode:** Run `git log --oneline ${BASE}..<branch>` using the resolved merge-base from Stage 1.

**Standalone (current branch):** Capture branch and commit metadata inside the
private scope directory. After the preflight permits it, print only sanitized
values:

```bash
: "${REVIEW_SCOPE_DIR:?private scope dir not set; create it in this same shell call first}"
git rev-parse --abbrev-ref HEAD > "$REVIEW_SCOPE_DIR/branch"
git log --oneline ${BASE}..HEAD > "$REVIEW_SCOPE_DIR/commits"
```

Combined with conversation context (plan section summary, PR description), write a 2-3 line intent summary:

```
Intent: Replace complete-case analysis of the primary outcome with multiple
imputation (m = 20). Must not change the SAP covariate set or analysis population.
```

Pass this to every reviewer in their spawn prompt. Intent shapes *how hard each reviewer looks*, not which reviewers are selected.

**When intent is ambiguous:**

- **Interactive mode:** Ask one concise intent question using the Skill Value interaction rule, then pass the resolved intent to every reviewer.
- **Agent/autofix/report-only/headless modes:** Infer intent conservatively from the branch name, diff, PR metadata, and caller context. Note the uncertainty in Coverage or Verdict reasoning instead of blocking.

## Stage 2b: Plan discovery (requirements verification)

Locate the plan document so Stage 6 can verify requirements completeness. Check these sources in priority order — stop at the first hit:

1. **`plan:` argument.** If the caller passed a plan path, use it directly. Read the file to confirm it exists.
2. **PR body.** If PR metadata was fetched in Stage 1, scan the body for paths matching `docs/plans/*.md`. If exactly one match is found and the file exists, use it as `plan_source: explicit`. If multiple plan paths appear, treat as ambiguous — demote to `plan_source: inferred` for the most recent match that exists on disk, or skip if none exist or none clearly relate to the PR title/intent. Always verify the selected file exists before using it — stale or copied plan links in PR descriptions are common.
3. **Auto-discover.** Extract 2-3 keywords from the branch name (e.g., `feat/onboarding-skill` -> `onboarding`, `skill`). Glob `docs/plans/*` and filter filenames containing those keywords. If exactly one match, use it. If multiple matches or the match looks ambiguous (e.g., generic keywords like `review`, `fix`, `update` that could hit many plans), **skip auto-discovery** — a wrong plan is worse than no plan. If zero matches, skip.

**Confidence tagging:** Record how the plan was found:
- `plan:` argument -> `plan_source: explicit` (high confidence)
- Single unambiguous PR body match -> `plan_source: explicit` (high confidence)
- Multiple/ambiguous PR body matches -> `plan_source: inferred` (lower confidence)
- Auto-discover with single unambiguous match -> `plan_source: inferred` (lower confidence)

If a plan is found, read its **Requirements Trace** (R1, R2, etc.) and **Implementation Units** (items listed under the `## Implementation Units` section). Store the extracted requirements list and `plan_source` for Stage 6. Do not block the review if no plan is found — requirements verification is additive, not required.

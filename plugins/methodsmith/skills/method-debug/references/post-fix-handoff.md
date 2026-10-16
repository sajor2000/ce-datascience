# Post-Fix Handoff (Phase 4, only when Phase 3 ran)

Read after Phase 3 applied a fix. Skip entirely for "Diagnosis only".

## Post-fix review tail

Before handoff, re-run the minimized reproduction and the affected regression test, re-run the original, un-minimized reproduction loop, inspect the changed diff for a simpler correction, and load the `method-review` skill when the fix changes behavior across a boundary. If the original loop still fails, return to Phase 2 instead of shipping. Do not broaden a bug fix into unrelated polish; record worthwhile cleanup as follow-up work.

The next move depends on whether the skill created the branch in Phase 3.

## Skill-owned branch (created in Phase 3): default to commit-and-PR without prompting

1. **Check for contextual overrides first.** Look at the user's original prompt, loaded memories, and the user/repo `AGENTS.md` or `CLAUDE.md` for preferences that conflict with auto commit-and-PR — for example, "always review before pushing", "open PRs as drafts", or "don't open PRs from skills". A signal must be an explicit instruction or a clearly applicable rule, not a vague tonal cue. If any apply, honor them — switch to the pre-existing-branch menu below, or skip the PR step entirely, whichever matches the stated preference.
2. **Briefly preview what will happen** — what will be committed, on what branch, and that a PR will be opened — then proceed without waiting for confirmation. The preview lets the user interrupt; it is not a blocking question. Keep it scannable.
3. **Load the `method-pr` skill.** When the entry came from an issue tracker, include the tracker's auto-close syntax where it requires it — most trackers parse PR descriptions (e.g., `Fixes #N` for GitHub, `Closes ABC-123` for Linear), but some only parse commit messages (e.g., Jira Smart Commits) — so the issue closes on merge. Surface the resulting PR URL.

## Pre-existing branch (skill did not create it): ask the user

Ask with the Skill Value interaction rule (blocking question tool when available, otherwise numbered options and wait):

1. **Commit and open a PR (`method-pr`)** — default for most cases
2. **Commit the fix (`method-commit`)** — local commit only
3. **Stop here** — user takes it from there

## After a PR is open (either path): consider offering learning capture

Most bugs are localized mechanical fixes (typo, missed null check, missing import) where the only "lesson" is the bug itself; compounding those clutters `docs/solutions/`. Decide:

- **Skip silently** when the fix is mechanical and there is no generalizable insight. Default to this when in doubt.
- **Offer neutrally** when the lesson can be stated in one sentence — e.g., "X.foo() returns T | undefined when Y, not just T", or "the diagnostic path was non-obvious and worth recording." If you cannot articulate the lesson, skip.
- **Lean into the offer** when the pattern appears in 3+ locations OR the root cause reveals a wrong assumption about a shared dependency, framework, or convention that other code is likely to repeat.

When offering, use the blocking question tool. If the user accepts, load the `method-compound` skill, then commit the resulting learning doc to the same branch and push so the open PR picks up the new commit.

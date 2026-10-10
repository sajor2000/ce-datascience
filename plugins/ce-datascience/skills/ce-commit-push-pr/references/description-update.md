# Description Update Workflow

Use when SKILL.md Mode detection selects **Description update**. Apply the SKILL.md PR check rules and "Writing the PR body file" rules at each step below; ask every question per the SKILL.md interaction rule.

## DU-1: Confirm intent

Ask: "Update the PR description for this branch?" If declined, stop.

## DU-2: Find the PR

Run `git branch --show-current`, then the PR check from SKILL.md Context.

- Empty branch (detached HEAD): report that there is no branch and stop.
- Non-zero exit: PR state is unknown. Report it (with the `gh auth status` result) and stop.
- Exit 0 with `[]`: report that there is no open PR for this branch and stop.
- Matching entry: note its `url` and continue.

## DU-3: Write and apply the updated description

Read `references/pr-description-writing.md` (linked from SKILL.md Mode detection) once now. Run Pre-A in PR mode with the URL from DU-2 (it resolves the commit range, diff, and current body), then Steps A through H. Treat any user focus as steering; it must not override the writing principles or add content the diff does not support.

**Evidence:** the writing reference preserves an existing `## Demo` or `## Screenshots` block by default. Honor a focus that asks to refresh or remove it. If no evidence block exists and one would help the reader, use the core Compound Engineering `ce-demo-reel` skill when it is installed, then re-compose with the captured URL/path spliced in. If `ce-demo-reel` is not available, ask for existing evidence or skip the evidence section; do not pretend ce-datascience ships its own demo-capture skill.

**Compare and confirm.** Explain briefly what the new description covers differently from the old one, confirm any user focus was addressed, and ask before applying. If confirmed, write the body file (see "Writing the PR body file") and run:

```bash
gh pr edit <PR-URL> --title "<TITLE>" --body-file "$BODY_FILE"
```

Report the PR URL.

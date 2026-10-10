# Output Format: Refresh Summary

Detail for `ce-compound-refresh` § "Output Format". Linked from SKILL.md. Defines the summary block, the per-file listing, and the autofix-mode Applied / Recommended split.

## Contents

- Summary block and per-file listing
- Autofix mode output
- Legacy cleanup

---

### Summary block and per-file listing

**Print the full summary as markdown output.** Do not summarize findings internally and then output a one-liner. The summary is the deliverable — print every section in full, formatted as readable markdown with headers, tables, and bullet points.

After processing the selected scope, output:

```text
Compound Refresh Summary
========================
Scanned: N learnings

Kept: X
Updated: Y
Consolidated: C
Replaced: Z
Deleted: W
Skipped: V
Marked stale: S
```

Then for EVERY file processed, list:

- The file path
- The classification (Keep/Update/Consolidate/Replace/Delete/Stale)
- What evidence was found — tag any memory-sourced findings with "(auto memory [claude])" to distinguish them from codebase-sourced evidence
- What action was taken (or recommended)
- For Consolidate: which doc was canonical, what unique content was merged, what was deleted
- Any potential product regression flagged under Core Rule 3 (guidance kept intact; implementation conflict reported, not fixed)

List **Keep** outcomes under a reviewed-without-edits section so the result is visible without creating git churn.

### Autofix mode output

In autofix mode the summary is the sole deliverable — no user is present to ask follow-up questions, so it must be self-contained and complete. **Print it in full. Do not abbreviate, summarize, or skip sections.**

Split actions into two sections:

**Applied** (writes that succeeded):

- For each **Updated** file: the file path, what references were fixed, and why
- For each **Consolidated** cluster: the canonical doc, what unique content was merged from each subsumed doc, and the subsumed docs that were deleted
- For each **Replaced** file: what the old learning recommended vs what the current code does, and the path to the new successor
- For each **Deleted** file: the file path and why it was removed (problem domain gone, fully redundant, etc.)
- For each **Marked stale** file: the file path, what evidence was found, and why it was ambiguous

**Recommended** (actions that could not be written — e.g., permission denied):

- Same detail as above, framed as recommendations for a human to apply
- Enough context that the user can apply the change manually or re-run the skill interactively

If all writes succeed, the Recommended section is empty. If no writes succeed (e.g., read-only invocation), all actions appear under Recommended — the output becomes a maintenance plan.

### Legacy cleanup

If `docs/solutions/_archived/` exists, list the archived files found and recommend a disposition for each: restore (if still relevant), delete (if truly obsolete), or consolidate (if overlapping with active docs).

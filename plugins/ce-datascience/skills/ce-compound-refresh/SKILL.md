---
name: ce-compound-refresh
description: "Audits docs/solutions learnings for drift, then keeps, updates, merges, replaces, or marks them stale. Use when the user asks to refresh or clean up docs/solutions."
---

# Compound Refresh


## Skill Value

- **Problem it solves:** Old solution notes can mislead future agents when the codebase or workflow has changed.
- **Use when:** The user asks to refresh, audit, sweep, consolidate, or clean stale docs/solutions learnings.
- **Output:** A report of applied and recommended actions, with updated solution docs when safe.
- **Ask only if:** Only for borderline stale/consolidation decisions, edits that need human confirmation, the broad-scope starting area, or the Phase 5 commit choice, in interactive mode.
- **Do not do:** Do not delete or replace uncertain guidance without evidence.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

## Mode Detection

Check if `$ARGUMENTS` contains `mode:autofix`. If present, strip it (use the remainder as a scope hint) and run in **autofix mode**.

| Mode | When | Behavior |
|------|------|----------|
| **Interactive** (default) | User is present and can answer questions | Ask for decisions on ambiguous cases, confirm actions |
| **Autofix** | `mode:autofix` in arguments | No user interaction. Apply all unambiguous actions (Keep, Update, Consolidate, auto-Delete, Replace with sufficient evidence). Mark ambiguous cases as stale. Report at the end. |

### Autofix mode rules

- **Skip all user questions.** Never pause for input. Process all docs in scope; with no scope hint, process everything.
- **Attempt all safe actions.** A successful write is **applied**. A failed write (e.g., permission denied) is recorded as **recommended** in the report; continue — do not stop or ask for permissions.
- **Mark as stale when uncertain.** If classification is genuinely ambiguous (Update vs Replace vs Consolidate vs Delete) or Replace evidence is insufficient, add `status: stale`, `stale_reason`, and `stale_date` to the frontmatter. If even that write fails, include it as a recommendation. Err toward stale-marking over incorrect action.
- **Always generate a report** with **Applied** and **Recommended** sections.

## Interaction Principles (interactive mode only)

Follow the Skill Value interaction rule. Prefer multiple choice when natural options exist; start with scope and intent, narrowing only when needed; do not ask for decisions before gathering evidence; lead with a brief recommendation.

## Refresh Order

1. Review the relevant individual learning docs first (primary evidence)
2. Note which learnings stayed valid, were updated, consolidated, replaced, or deleted
3. Then review pattern docs that depend on them (derived guidance; stale learnings can make a pattern look more valid than it is)

If the user names a pattern doc, inspect its supporting learnings before changing it.

## Maintenance Model

| Outcome | Meaning | Default action |
|---------|---------|----------------|
| **Keep** | Still accurate and still useful | No file edit by default; report that it was reviewed and remains trustworthy |
| **Update** | Core solution is still correct, but references drifted | Apply evidence-backed in-place edits |
| **Consolidate** | Two or more docs overlap heavily but are both correct | Merge unique content into the canonical doc, delete the subsumed doc |
| **Replace** | The old artifact is now misleading, but there is a known better replacement | Create a trustworthy successor, then delete the old artifact |
| **Delete** | No longer useful, applicable, or distinct | Delete the file — git history preserves it |

## Core Rules

1. **Evidence informs judgment.** Signals are inputs, not a scorecard.
2. **Prefer no-write Keep.** Do not update a doc just to leave a review breadcrumb.
3. **Separate descriptive drift from implementation conflict.** Claims about current mechanics follow current code. Independently supported guidance does not become false when implementation stops satisfying it: keep the guidance intact and report the conflict as a potential product regression. Without independent support, use the normal Update, Replace, or stale rules below. This skill reports product-code conflicts but does not fix them.
4. **Be decisive, minimize questions.** When evidence is clear (file renamed, class moved, reference broken), apply the update. Ask only when the right action is genuinely ambiguous (interactive); stale-mark instead in autofix.
5. **Avoid low-value churn.** No edits for typos, wording polish, or cosmetic changes that do not materially improve accuracy or usability.
6. **Use Update only for meaningful, evidence-backed drift** — paths, module names, related links, category metadata, code snippets, clearly stale wording.
7. **Use Replace only when there is a real replacement**: a recently solved, verified fix in the conversation; enough concrete user-provided context to document the successor honestly; a current approach found by codebase investigation; or strong successor evidence in newer docs, pattern docs, PRs, or issues.
8. **Delete when the code is gone, but only after checking inbound links.** If the referenced code, controller, or workflow no longer exists and no successor can be found, inspect markdown, plans, instruction files, and READMEs for citations of the candidate. Decorative citations may be removed mechanically with the deletion. A substantive citation—where the caller relies on this document for content not stated inline—means Replace or Keep with narrowed scope, not Delete. Mixed or unclear citations are stale-marked in autofix mode and require a decision interactively. Auto-delete requires missing implementation, no matching successor, and citations that are absent or unambiguously decorative. Re-run the citation check immediately before removal.
9. **Evaluate document-set design, not just accuracy.** Heavily overlapping docs drift silently; decide whether they stay separate, get clearer cross-scoping, or consolidate into one canonical doc.
10. **Delete, don't archive.** There is no `_archived/` directory; git history is the archive (`git log --diff-filter=D -- docs/solutions/`).

## Scope Selection

Find all `.md` files under `docs/solutions/`, excluding `README.md` files and anything under `_archived/`. If `_archived/` exists, flag it in the report as a legacy artifact to clean up (restore or delete its files).

If `$ARGUMENTS` is provided, narrow scope with these strategies in order, stopping at the first that matches: (1) subdirectory name under `docs/solutions/`; (2) `module`, `component`, or `tags` frontmatter; (3) filename (partial OK); (4) content keyword search. If nothing matches, report it and ask the user to clarify; in autofix mode, report the miss and stop — do not guess at scope.

If no candidate docs are found, report:

```text
No candidate docs found in docs/solutions/.
Load the `ce-compound` skill after solving problems to start building your knowledge base.
```

## Phase 0: Assess and Route

Discover candidates, estimate scope, and choose the lightest path. Gather evidence before any action-selection question.

- **Focused** (1-2 likely files, or the user named a doc): investigate directly, then recommend
- **Batch** (up to ~8 mostly independent docs): investigate first, then present grouped recommendations
- **Broad** (9+ docs, ambiguous, or repo-wide sweep): triage first, then investigate in batches

**Broad scope:** read `references/broad-scope-triage.md` before deep investigation.

When investigating multiple artifacts or running any Replace, read `references/subagent-strategy.md` (required task-prompt text, read-only investigators, sequential replacers; omit `mode`).

## Phase 1: Investigate Candidate Learnings

Read each learning, cross-reference its claims against the current codebase, and form a recommendation, matching depth to specificity. Check each dimension independently:

- **References** — do the paths, class names, and modules still exist or have they moved?
- **Recommended solution** — does the fix still match how the code works today? A renamed file with a different implementation pattern is not just a path update.
- **Code examples and related docs** — do snippets reflect current code; are cross-referenced docs present and consistent?
- **Auto memory** (Claude Code only) — scan the injected auto-memory block, if present, for entries in the same problem domain; a note describing a different approach is a supplementary drift signal.
- **Overlap** — when another doc covers the same problem, files, or solution, record both paths, the overlapping dimensions (problem, solution, root cause, files, prevention), and which doc is broader or more current, for Phase 1.75.

**Update vs Replace.** Update territory: paths moved, classes renamed, links broke, metadata drifted, but the recommended approach still holds — fix directly. Replace territory: evidence shows the recommendation no longer governs, the architecture changed, or the pattern is no longer preferred; current-code contradiction alone is not enough when independent evidence still supports the guidance. If you find yourself rewriting the solution section or changing what the learning recommends, stop — that is Replace.

**Memory signals are supplementary:** use them to corroborate codebase drift or prompt deeper investigation, tagged "(auto memory [claude])". They never alone justify Replace or Delete; in autofix mode, memory-only drift means stale-marking.

**Age alone is not a stale signal** — only a prompt to inspect more carefully. Before recommending Replace or Delete, look for successors (newer learnings, pattern docs, PRs, issues); if one exists, prefer Replace over Delete.

## Phase 1.5: Investigate Pattern Docs

Then investigate relevant pattern docs under `docs/solutions/patterns/` (high leverage: treated as broadly applicable). Check whether the generalized rule still holds given the refreshed learnings; a pattern with no clear supporting learnings is a stale signal.

## Phase 1.75: Document-Set Analysis

Read `references/document-set-analysis.md` (overlap across 5 dimensions, supersession, canonical doc: Distinct / Subsumed / Redundant, retrieval-value test, cross-doc conflicts).

## Phase 2: Classify the Right Maintenance Action

Assign one recommended action per artifact (learnings first, then pattern docs). Read `references/classify-actions.md` before classifying (per-outcome criteria, Consolidate-vs-Delete boundary, problem-domain check, pattern docs).

Guardrails that hold regardless of the reference detail:

- **Replace needs sufficient evidence.** Understand both what the old learning recommended and what the current approach is, then use the Replace Flow in Phase 4. Otherwise mark it stale in place (`status: stale`, `stale_reason`, `stale_date`) and recommend the `ce-compound` skill for the user's next encounter with that area.
- **Delete needs both the implementation and the problem domain gone.** If the referenced code is gone but the project still deals with that problem (still derives index dates, still applies small-cell suppression, still fits that model family), classify as Replace. Core Rule 8's inbound-citation check still applies.
- **Age alone is never the reason** for Replace or Delete.

## Phase 3: Ask for Decisions

In autofix mode, skip this phase entirely: execute unambiguous actions and stale-mark ambiguous ones. In interactive mode, read `references/phase3-ask-decisions.md` for when to ask, question style, and the focused / batch / broad interaction patterns.

## Phase 4: Execute the Chosen Action

For Keep, Update, Consolidate, and Delete, read `references/execute-flows.md`. Replace follows below.

### Replace Flow

Process Replace candidates **one at a time, sequentially**, each written by a replacement subagent. Read the documentation contract files and pass their contents into its task prompt — do not let it invent frontmatter fields, enum values, or section order from memory:

- `references/schema.yaml` — frontmatter fields and enum values
- `references/yaml-schema.md` — category mapping and YAML-safety rules for array items
- `assets/resolution-template.md` — section structure

**When evidence is sufficient:**

1. Spawn a single subagent with: the old learning's full content; an evidence summary (what changed, what the current code does, why the old guidance misleads); the target path and category (unchanged unless the category changed); and the support files' contents.
2. The subagent writes the new learning from those files, applying the YAML-safety rules from `references/yaml-schema.md`.
3. **Validate parser-safety of the new learning's frontmatter** with the bundled `scripts/validate-frontmatter.py` (Python 3 stdlib only). It catches malformed `---` delimiter lines, unquoted ` #` in scalar values (silent comment truncation), and unquoted `: ` in scalar values. The script lives inside this skill, not the project. Set `SKILL_DIR` to the absolute path of the directory containing this SKILL.md and run:

   ```bash
   SKILL_DIR="<absolute path of the directory containing this SKILL.md>"
   PY=""
   for c in python3 python py; do
     if command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(0 if sys.version_info[0] == 3 else 1)' >/dev/null 2>&1; then PY="$c"; break; fi
   done
   if [ -f "$SKILL_DIR/scripts/validate-frontmatter.py" ] && [ -n "$PY" ]; then
     "$PY" "$SKILL_DIR/scripts/validate-frontmatter.py" "<new-learning-path>"
   else
     echo "MANUAL_CHECK: bundled validator or Python 3 unavailable"
   fi
   ```

   - **Script ran:** exit 0 means parser-safe. Exit 1 means stderr names the offending field(s): quote the value(s), re-write the doc, and re-run until exit 0. Do not declare success while validation fails.
   - **`MANUAL_CHECK` printed:** apply the validator's checks by hand, no broader: (1) the opening and closing delimiters are each a line containing only `---` (trailing whitespace allowed); (2) every top-level `key: value` whose value does not start with `"`, `'`, `[`, `{`, `|`, or `>` contains no ` #` and no `: ` — quote the whole value if either appears. Then state in the summary that the bundled validator was unavailable and the checks were applied manually.

   The validator does not enforce schema rules or YAML reserved-indicator characters; the YAML-safety rules in step 2 cover those.
4. After the subagent completes, the orchestrator deletes the old learning file (after the inbound-citation check). The new frontmatter may optionally include `supersedes: [old learning filename]`.

**When evidence is insufficient:** mark the learning stale in place (`status: stale`, `stale_reason: [what you found]`, `stale_date: YYYY-MM-DD`), report what evidence was found and what is missing, and recommend the user load the `ce-compound` skill after their next encounter with that area.

## Output Format

After processing the selected scope, print the full refresh summary as markdown — never a one-line summary. Read `references/output-format.md` (summary block, required per-file listing, autofix Applied / Recommended split, legacy `_archived/` cleanup).

## Phase 5: Commit Changes

Read `references/phase5-commit-changes.md` (git context, autofix defaults by branch, interactive options, commit-message style).

## Discoverability Check

Run every time, after the summary and the Phase 5 commit decision: read `references/discoverability-check.md` to check whether AGENTS.md / CLAUDE.md lead an agent to `docs/solutions/`, add the smallest informational mention if not, and fold any edit into the Phase 5 commit (amend or follow-up, pushed if Phase 5 pushed).

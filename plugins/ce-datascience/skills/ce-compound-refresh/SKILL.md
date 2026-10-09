---
name: ce-compound-refresh
description: "Audit existing docs/solutions guidance for drift, then keep, update, consolidate, replace, or mark stale. Use when the user asks to refresh, audit, sweep, consolidate, or clean stale docs/solutions learnings."
---

# Compound Refresh


## Skill Value

- **Problem it solves:** Old solution notes can mislead future agents when the codebase or workflow has changed.
- **Use when:** The user asks to refresh, audit, sweep, consolidate, or clean stale docs/solutions learnings.
- **Output:** A report of applied and recommended actions, with updated solution docs when safe.
- **Ask only if:** Only for borderline stale/consolidation decisions or edits that need human confirmation in interactive mode.
- **Do not do:** Do not delete or replace uncertain guidance without evidence.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Maintain the quality of `docs/solutions/` over time. This workflow reviews existing learnings against the current codebase, then refreshes any derived pattern docs that depend on them.

## Mode Detection

Check if `$ARGUMENTS` contains `mode:autofix`. If present, strip it from arguments (use the remainder as a scope hint) and run in **autofix mode**.

| Mode | When | Behavior |
|------|------|----------|
| **Interactive** (default) | User is present and can answer questions | Ask for decisions on ambiguous cases, confirm actions |
| **Autofix** | `mode:autofix` in arguments | No user interaction. Apply all unambiguous actions (Keep, Update, Consolidate, auto-Delete, Replace with sufficient evidence). Mark ambiguous cases as stale. Generate a summary report at the end. |

### Autofix mode rules

- **Skip all user questions.** Never pause for input.
- **Process all docs in scope.** No scope narrowing questions — if no scope hint was provided, process everything.
- **Attempt all safe actions:** Keep (no-op), Update (fix references), Consolidate (merge and delete subsumed doc), auto-Delete (unambiguous criteria met), Replace (when evidence is sufficient). If a write succeeds, record it as **applied**. If a write fails (e.g., permission denied), record the action as **recommended** in the report and continue — do not stop or ask for permissions.
- **Mark as stale when uncertain.** If classification is genuinely ambiguous (Update vs Replace vs Consolidate vs Delete) or Replace evidence is insufficient, mark as stale with `status: stale`, `stale_reason`, and `stale_date` in the frontmatter. If even the stale-marking write fails, include it as a recommendation.
- **Use conservative confidence.** In interactive mode, borderline cases get a user question. In autofix mode, borderline cases get marked stale. Err toward stale-marking over incorrect action.
- **Always generate a report.** The report is the primary deliverable. It has two sections: **Applied** (actions that were successfully written) and **Recommended** (actions that could not be written, with full rationale so a human can apply them or run the skill interactively). The report structure is the same regardless of what permissions were granted — the only difference is which section each action lands in.

## Interaction Principles

**These principles apply to interactive mode only. In autofix mode, skip all user questions and apply the autofix mode rules above.**

Follow the same interaction style as `ce-brainstorm`:

When this skill asks a user-facing question, follow the Skill Value interaction rule above.
- Prefer **multiple choice** when natural options exist
- Start with **scope and intent**, then narrow only when needed
- Do **not** ask the user to make decisions before you have evidence
- Lead with a recommendation and explain it briefly

The goal is not to force the user through a checklist. The goal is to help them make a good maintenance decision with the smallest amount of friction.

## Refresh Order

Refresh in this order:

1. Review the relevant individual learning docs first
2. Note which learnings stayed valid, were updated, were consolidated, were replaced, or were deleted
3. Then review any pattern docs that depend on those learnings

Why this order:

- learning docs are the primary evidence
- pattern docs are derived from one or more learnings
- stale learnings can make a pattern look more valid than it really is

If the user starts by naming a pattern doc, you may begin there to understand the concern, but inspect the supporting learning docs before changing the pattern.

## Maintenance Model

For each candidate artifact, classify it into one of five outcomes:

| Outcome | Meaning | Default action |
|---------|---------|----------------|
| **Keep** | Still accurate and still useful | No file edit by default; report that it was reviewed and remains trustworthy |
| **Update** | Core solution is still correct, but references drifted | Apply evidence-backed in-place edits |
| **Consolidate** | Two or more docs overlap heavily but are both correct | Merge unique content into the canonical doc, delete the subsumed doc |
| **Replace** | The old artifact is now misleading, but there is a known better replacement | Create a trustworthy successor, then delete the old artifact |
| **Delete** | No longer useful, applicable, or distinct | Delete the file — git history preserves it if anyone needs to recover it later |

## Core Rules

1. **Evidence informs judgment.** The signals below are inputs, not a mechanical scorecard. Use engineering judgment to decide whether the artifact is still trustworthy.
2. **Prefer no-write Keep.** Do not update a doc just to leave a review breadcrumb.
3. **Separate descriptive drift from implementation conflict.** Claims about current mechanics follow current code. Independently supported guidance does not become false when implementation stops satisfying it: keep the guidance intact and report the conflict as a potential product regression. Without independent support, use the normal Update, Replace, or stale rules below. This skill reports product-code conflicts but does not fix them.
4. **Be decisive, minimize questions.** When evidence is clear (file renamed, class moved, reference broken), apply the update. In interactive mode, only ask the user when the right action is genuinely ambiguous. In autofix mode, mark ambiguous cases as stale instead of asking. The goal is automated maintenance with human oversight on judgment calls, not a question for every finding.
5. **Avoid low-value churn.** Do not edit a doc just to fix a typo, polish wording, or make cosmetic changes that do not materially improve accuracy or usability.
6. **Use Update only for meaningful, evidence-backed drift.** Paths, module names, related links, category metadata, code snippets, and clearly stale wording are fair game when fixing them materially improves accuracy.
7. **Use Replace only when there is a real replacement.** That means either:
   - the current conversation contains a recently solved, verified replacement fix, or
   - the user has provided enough concrete replacement context to document the successor honestly, or
   - the codebase investigation found the current approach and can document it as the successor, or
   - newer docs, pattern docs, PRs, or issues provide strong successor evidence.
8. **Delete when the code is gone, but only after checking inbound links.** If the referenced code, controller, or workflow no longer exists and no successor can be found, inspect markdown, plans, instruction files, and READMEs for citations of the candidate. Decorative citations may be removed mechanically with the deletion. A substantive citation—where the caller relies on this document for content not stated inline—means Replace or Keep with narrowed scope, not Delete. Mixed or unclear citations are stale-marked in autofix mode and require a decision interactively. Auto-delete requires missing implementation, no matching successor, and citations that are absent or unambiguously decorative.
9. **Evaluate document-set design, not just accuracy.** In addition to checking whether each doc is accurate, evaluate whether it is still the right unit of knowledge. If two or more docs overlap heavily, determine whether they should remain separate, be cross-scoped more clearly, or be consolidated into one canonical document. Redundant docs are dangerous because they drift silently — two docs saying the same thing will eventually say different things.
10. **Delete, don't archive.** There is no `_archived/` directory. When a doc is no longer useful, delete it. Git history preserves every deleted file — that is the archive. A dedicated archive directory creates problems: archived docs accumulate, pollute search results, and nobody reads them. If someone needs a deleted doc, `git log --diff-filter=D -- docs/solutions/` will find it.

## Scope Selection

Start by discovering learnings and pattern docs under `docs/solutions/`.

Exclude:

- `README.md`
- `docs/solutions/_archived/` (legacy — if this directory exists, flag it for cleanup in the report)

Find all `.md` files under `docs/solutions/`, excluding `README.md` files and anything under `_archived/`. If an `_archived/` directory exists, note it in the report as a legacy artifact that should be cleaned up (files either restored or deleted).

If `$ARGUMENTS` is provided, use it to narrow scope before proceeding. Try these matching strategies in order, stopping at the first that produces results:

1. **Directory match** — check if the argument matches a subdirectory name under `docs/solutions/` (e.g., `performance-issues`, `database-issues`)
2. **Frontmatter match** — search `module`, `component`, or `tags` fields in learning frontmatter for the argument
3. **Filename match** — match against filenames (partial matches are fine)
4. **Content search** — search file contents for the argument as a keyword (useful for feature names or feature areas)

If no matches are found, report that and ask the user to clarify. In autofix mode, report the miss and stop — do not guess at scope.

If no candidate docs are found, report:

```text
No candidate docs found in docs/solutions/.
Load the `ce-compound` skill after solving problems to start building your knowledge base.
```

## Phase 0: Assess and Route

Before asking the user to classify anything:

1. Discover candidate artifacts
2. Estimate scope
3. Choose the lightest interaction path that fits

### Route by Scope

| Scope | When to use it | Interaction style |
|-------|----------------|-------------------|
| **Focused** | 1-2 likely files or user named a specific doc | Investigate directly, then present a recommendation |
| **Batch** | Up to ~8 mostly independent docs | Investigate first, then present grouped recommendations |
| **Broad** | 9+ docs, ambiguous, or repo-wide stale-doc sweep | Triage first, then investigate in batches |

### Broad Scope Triage

When scope is broad (9+ candidate docs), do a lightweight triage before deep investigation:

1. **Inventory** — read frontmatter of all candidate docs, group by module/component/category
2. **Impact clustering** — identify areas with the densest clusters of learnings + pattern docs. A cluster of 5 learnings and 2 patterns covering the same module is higher-impact than 5 isolated single-doc areas, because staleness in one doc is likely to affect the others.
3. **Spot-check drift** — for each cluster, check whether the primary referenced files still exist. Missing references in a high-impact cluster = strongest signal for where to start.
4. **Recommend a starting area** — present the highest-impact cluster with a brief rationale and ask the user to confirm or redirect. In autofix mode, skip the question and process all clusters in impact order.

Example:

```text
Found 24 learnings across 5 areas.

The auth module has 5 learnings and 2 pattern docs that cross-reference
each other — and 3 of those reference files that no longer exist.
I'd start there.

1. Start with auth (recommended)
2. Pick a different area
3. Review everything
```

Do not ask action-selection questions yet. First gather evidence.

## Phase 1: Investigate Candidate Learnings

For each learning in scope, read it, cross-reference its claims against the current codebase, and form a recommendation.

A learning has several dimensions that can independently go stale. Surface-level checks catch the obvious drift, but staleness often hides deeper:

- **References** — do the file paths, class names, and modules it mentions still exist or have they moved?
- **Recommended solution** — does the fix still match how the code actually works today? A renamed file with a completely different implementation pattern is not just a path update.
- **Code examples** — if the learning includes code snippets, do they still reflect the current implementation?
- **Related docs** — are cross-referenced learnings and patterns still present and consistent?
- **Auto memory** (Claude Code only) — does the injected auto-memory block in your system prompt contain entries in the same problem domain? Scan that block directly. If the block is absent, skip this dimension. A memory note describing a different approach than what the learning recommends is a supplementary drift signal.
- **Overlap** — while investigating, note when another doc in scope covers the same problem domain, references the same files, or recommends a similar solution. For each overlap, record: the two file paths, which dimensions overlap (problem, solution, root cause, files, prevention), and which doc appears broader or more current. These signals feed Phase 1.75 (Document-Set Analysis).

Match investigation depth to the learning's specificity — a learning referencing exact file paths and code snippets needs more verification than one describing a general principle.

### Drift Classification: Update vs Replace

The critical distinction is whether the drift is **cosmetic** (references moved but the solution is the same) or **substantive** (the solution itself changed):

- **Update territory** — file paths moved, classes renamed, links broke, metadata drifted, but the core recommended approach is still how the code works. `ce-compound-refresh` fixes these directly.
- **Replace territory** — evidence shows the recommendation no longer governs, the architectural approach changed, or the pattern is no longer preferred. Current-code contradiction alone is not enough when independent evidence still supports the guidance. A replacement subagent writes the successor following `ce-compound`'s document format (frontmatter, problem, root cause, solution, prevention), using the investigation evidence already gathered. The orchestrator does not rewrite learnings inline — it delegates to a subagent for context isolation.

**The boundary:** if you find yourself rewriting the solution section or changing what the learning recommends, stop — that is Replace, not Update.

**Memory-sourced drift signals** are supplementary, not primary. A memory note describing a different approach does not alone justify Replace or Delete. Use memory signals to:
- Corroborate codebase-sourced drift (strengthens the case for Replace)
- Prompt deeper investigation when codebase evidence is borderline
- Add context to the evidence report ("(auto memory [claude]) notes suggest approach X may have changed since this learning was written")

In autofix mode, memory-only drift (no codebase corroboration) should result in stale-marking, not action.

### Judgment Guidelines

Guidelines that are easy to get wrong:

1. **Classify contradictions by evidence.** A conflict with current mechanics changes descriptive claims. A conflict with independently supported guidance is a potential product regression, not an automatic Replace. Replace only when evidence shows the recommendation itself no longer governs.
2. **Age alone is not a stale signal.** A 2-year-old learning that still matches current code is fine. Only use age as a prompt to inspect more carefully.
3. **Check for successors before deleting.** Before recommending Replace or Delete, look for newer learnings, pattern docs, PRs, or issues covering the same problem space. If successor evidence exists, prefer Replace over Delete so readers are directed to the newer guidance.
4. **Check inbound citations before deleting.** Search by filename slug, read the context of each match, and classify it as decorative or substantive. Clean decorative citations in the same change; reclassify substantive dependencies as Replace or narrowed Keep. Re-run this check immediately before removal so a late-discovered citation cannot be orphaned.

## Phase 1.5: Investigate Pattern Docs

After reviewing the underlying learning docs, investigate any relevant pattern docs under `docs/solutions/patterns/`.

Pattern docs are high-leverage — a stale pattern is more dangerous than a stale individual learning because future work may treat it as broadly applicable guidance. Evaluate whether the generalized rule still holds given the refreshed state of the learnings it depends on.

A pattern doc with no clear supporting learnings is a stale signal — investigate carefully before keeping it unchanged.

## Phase 1.75: Document-Set Analysis
Read `references/document-set-analysis.md` for full detail. It covers overlap detection across 5 dimensions, supersession signals, canonical-doc identification (Distinct / Subsumed / Redundant), the retrieval-value test, and the cross-doc conflict check.

## Subagent Strategy

Use subagents for context isolation when investigating multiple artifacts — not just because the task sounds complex. Choose the lightest approach that fits:

| Approach | When to use |
|----------|-------------|
| **Main thread only** | Small scope, short docs |
| **Sequential subagents** | 1-2 artifacts with many supporting files to read |
| **Parallel subagents** | 3+ truly independent artifacts with low overlap |
| **Batched subagents** | Broad sweeps — narrow scope first, then investigate in batches |

**When spawning any subagent**, omit the `mode` parameter so the user's configured permission settings apply. Include this instruction in its task prompt:

> Use dedicated file search and read tools (Glob, Grep, Read) for all investigation. Do NOT use shell commands (ls, find, cat, grep, test, bash) for file operations. This avoids permission prompts and is more reliable.
>
> Also scan the "user's auto-memory" block injected into your system prompt (Claude Code only). Check for notes related to the learning's problem domain. Report any memory-sourced drift signals separately from codebase-sourced evidence, tagged with "(auto memory [claude])" in the evidence section. If the block is not present in your context, skip this check.

There are two subagent roles:

1. **Investigation subagents** — read-only. They must not edit files, create successors, or delete anything. Each returns: file path, evidence, recommended action, confidence, and open questions. These can run in parallel when artifacts are independent.
2. **Replacement subagents** — write a single new learning to replace a stale one. These run **one at a time, sequentially** (each replacement subagent may need to read significant code, and running multiple in parallel risks context exhaustion). The orchestrator handles all deletions and metadata updates after each replacement completes.

The orchestrator merges investigation results, detects contradictions, coordinates replacement subagents, and performs all deletions/metadata edits centrally. In interactive mode, it asks the user questions on ambiguous cases. In autofix mode, it marks ambiguous cases as stale instead. If two artifacts overlap or discuss the same root issue, investigate them together rather than parallelizing.

## Phase 2: Classify the Right Maintenance Action

After gathering evidence, assign one recommended action per artifact (learnings first, then pattern docs). Read `references/classify-actions.md` before classifying — it holds the criteria for each outcome, the Consolidate-vs-Delete boundary, the problem-domain check before Delete, and how the outcomes apply to pattern docs as derived guidance.

Guardrails that hold regardless of the reference detail:

- **Replace needs sufficient evidence.** Understand both what the old learning recommended and what the current approach is, then use the Replace Flow in Phase 4. Otherwise mark it stale in place (`status: stale`, `stale_reason`, `stale_date`) and recommend the `ce-compound` skill for the user's next encounter with that area.
- **Delete needs both the implementation and the problem domain gone.** If the referenced code is gone but the project still deals with that problem (still derives index dates, still applies small-cell suppression, still fits that model family), classify as Replace. Core Rule 8's inbound-citation check still applies.
- **Age alone is never the reason** for Replace or Delete.

## Phase 3: Ask for Decisions

In autofix mode, skip this phase entirely: execute unambiguous actions and stale-mark ambiguous ones. In interactive mode, read `references/phase3-ask-decisions.md` for when to ask, question style, and the focused / batch / broad interaction patterns.

## Phase 4: Execute the Chosen Action

### Keep Flow

No file edit by default. Summarize why the learning remains trustworthy.

### Update Flow

Apply in-place edits only when the solution is still substantively correct.

Examples of valid in-place updates:

- Rename an `R/derive_index_date.R` reference to `R/cohort/index_date.R`
- Update `module: cohort_builder` to `module: cohort`
- Fix outdated links to related docs
- Refresh implementation notes after a directory move

Examples that should **not** be in-place updates:

- Fixing a typo with no effect on understanding
- Rewording prose for style alone
- Small cleanup that does not materially improve accuracy or usability
- The old fix is now an anti-pattern
- The system architecture changed enough that the old guidance is misleading
- The troubleshooting path is materially different

Those cases require **Replace**, not Update.

### Consolidate Flow

The orchestrator handles consolidation directly (no subagent needed — the docs are already read and the merge is a focused edit). Process Consolidate candidates by topic cluster. For each cluster identified in Phase 1.75:

1. **Confirm the canonical doc** — the broader, more current, more accurate doc in the cluster.
2. **Extract unique content** from the subsumed doc(s) — anything the canonical doc does not already cover. This might be specific edge cases, additional prevention rules, or alternative debugging approaches.
3. **Merge unique content** into the canonical doc in a natural location. Do not just append — integrate it where it logically belongs. If the unique content is small (a bullet point, a sentence), inline it. If it is a substantial sub-topic, add it as a clearly labeled section.
4. **Update cross-references** — if any other docs reference the subsumed doc, update those references to point to the canonical doc.
5. **Delete the subsumed doc.** Do not archive it, do not add redirect metadata — just delete the file. Git history preserves it.

If a doc cluster has 3+ overlapping docs, process pairwise: consolidate the two most overlapping docs first, then evaluate whether the merged result should be consolidated with the next doc.

**Structural edits beyond merge:** Consolidate also covers the reverse case. If one doc has grown unwieldy and covers multiple distinct problems that would benefit from separate retrieval, it is valid to recommend splitting it. Only do this when the sub-topics are genuinely independent and a maintainer might search for one without needing the other.

### Replace Flow

Process Replace candidates **one at a time, sequentially**. Each replacement is written by a subagent to protect the main context window.

When a replacement is needed, read the documentation contract files and pass their contents into the replacement subagent's task prompt:

- `references/schema.yaml` — frontmatter fields and enum values
- `references/yaml-schema.md` — category mapping
- `assets/resolution-template.md` — section structure

Do not let replacement subagents invent frontmatter fields, enum values, or section order from memory.

**When evidence is sufficient:**

1. Spawn a single subagent to write the replacement learning. Pass it:
   - The old learning's full content
   - A summary of the investigation evidence (what changed, what the current code does, why the old guidance is misleading)
   - The target path and category (same category as the old learning unless the category itself changed)
   - The relevant contents of the three support files listed above
2. The subagent writes the new learning using the support files as the source of truth: `references/schema.yaml` for frontmatter fields and enum values, `references/yaml-schema.md` for category mapping and YAML-safety rules for array items, and `assets/resolution-template.md` for section order. It should use dedicated file search and read tools if it needs additional context beyond what was passed.
3. **Validate parser-safety of the new learning's frontmatter** with the bundled `scripts/validate-frontmatter.py` (Python 3 stdlib only). It catches silent-corruption issues the YAML-safety prose rules miss: malformed `---` delimiter lines, unquoted ` #` in scalar values (silent comment truncation), and unquoted `: ` in scalar values (silent mapping confusion). The script lives inside this skill, not the project, so a cwd-relative path does not find it. Set `SKILL_DIR` to the absolute path of the directory containing this SKILL.md and run:

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

   The validator does not enforce schema rules or flag YAML reserved-indicator characters (those fail loudly downstream); the `references/yaml-schema.md` YAML-safety rules in step 2 cover those.
4. After the subagent completes, the orchestrator deletes the old learning file. The new learning's frontmatter may include `supersedes: [old learning filename]` for traceability, but this is optional — the git history and commit message provide the same information.

**When evidence is insufficient:**

1. Mark the learning as stale in place:
   - Add to frontmatter: `status: stale`, `stale_reason: [what you found]`, `stale_date: YYYY-MM-DD`
2. Report what evidence was found and what is missing
3. Recommend the user load the `ce-compound` skill after their next encounter with that area

### Delete Flow

Delete only when a learning is clearly obsolete, redundant (with no unique content to merge), or its problem domain is gone. Do not delete a document just because it is old — age alone is not a signal.

## Output Format

After processing the selected scope, print the full refresh summary as markdown — never a one-line summary. Read `references/output-format.md` for the summary block, the required per-file listing, the autofix Applied / Recommended split, and legacy `_archived/` cleanup.

## Phase 5: Commit Changes

Read `references/phase5-commit-changes.md` for full detail on git-context detection, autofix-mode defaults (main vs feature branch), interactive-mode option presentation by branch state, and the commit-message style.

## Relationship to ce-compound

- `ce-compound` captures a newly solved, verified problem
- `ce-compound-refresh` maintains older learnings as the codebase evolves — both their individual accuracy and their collective design as a document set

Use **Replace** only when the refresh process has enough real evidence to write a trustworthy successor. When evidence is insufficient, mark as stale and recommend `ce-compound` for when the user next encounters that problem area.

Use **Consolidate** proactively when the document set has grown organically and redundancy has crept in. Every `ce-compound` invocation adds a new doc — over time, multiple docs may cover the same problem from slightly different angles. Periodic consolidation keeps the document set lean and authoritative.

## Discoverability Check

Run every time, after the summary and the Phase 5 commit decision: read `references/discoverability-check.md` and follow its steps to check whether the project's AGENTS.md / CLAUDE.md would lead an agent to `docs/solutions/`, add the smallest informational mention if not, and fold any resulting edit into the Phase 5 commit (amend or follow-up commit, pushed if Phase 5 pushed).

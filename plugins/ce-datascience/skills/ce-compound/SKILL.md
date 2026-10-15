---
name: ce-compound
description: "Records a validated analytical approach, methods decision, or reusable data-science pattern in docs/solutions. Use when the user wants to document or compound a learning."
---

# `ce-compound`


## Skill Value

- **Problem it solves:** Good methods and debugging decisions get lost after a session unless they are turned into reusable team knowledge.
- **Use when:** The user wants to document learnings, preserve a validated approach, or compound a data science pattern.
- **Output:** A concise solution or learning document under docs/solutions/ plus any discoverability recommendation.
- **Ask only if:** Only to choose lightweight vs full capture, the Full-mode session-history opt-in, a targeted refresh, project-instruction discoverability changes, or the closing "What's next?" choice.
- **Do not do:** Do not write memory files or document unvalidated speculation as a durable pattern.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

Document a recently solved problem while context is fresh, as structured `docs/solutions/` docs with YAML frontmatter, coordinating parallel subagents in Full mode.

```bash
`ce-compound`                    # Document the most recent fix
`ce-compound` [brief context]    # Provide additional context hint
```

## Session context

Only when the user opts into session history (Full mode), resolve two values at runtime with the shell tool before the Phase 1 session-history dispatch. Run each as its own command and read its exit status — a non-zero exit is a normal state here (no git repo, unborn repo), not an error to route around:

- **Repo name** — run `git rev-parse --path-format=absolute --git-common-dir`. On exit 0, the repo name is the basename of the printed path's parent directory (worktree-stable: linked worktrees share the main checkout's common dir). On a non-zero exit, omit the repo name.
- **Git branch** — run `git branch --show-current`. Use the printed name (this also works in a repo with no commits yet). If it prints nothing (detached HEAD) or exits non-zero, omit the branch.

Pass only cleanly resolved values into the session-history dispatch; omit anything unresolved and let the session-history flow derive it.

## Support Files

Read on demand at the step that needs them — do not bulk-load at skill start:

- `references/schema.yaml` — canonical frontmatter fields and enum values (validating YAML)
- `references/yaml-schema.md` — category mapping from problem_type to directory (classifying)
- `assets/resolution-template.md` — section structure for new docs (assembling)
- `references/research-subagents.md` — Phase 1 subagent briefs and Session Historian dispatch (Full mode)
- `references/refresh-check.md`, `references/discoverability-check.md`, `references/specialized-reviews.md` — post-write steps
- `references/reference-material.md` — capture spec, category catalog, common mistakes, success-output format

When spawning subagents, pass the relevant file contents into the task prompt so they have the contract without cross-skill paths.

## Execution Strategy

Ask the mode question using the Skill Value interaction rule:

```
1. Full (recommended) — the complete compound workflow. Researches,
   cross-references, and reviews your solution to produce documentation
   that compounds your team's knowledge.

2. Lightweight — same documentation, single pass. Faster and uses
   fewer tokens, but won't detect duplicates or cross-reference
   existing docs. Best for simple fixes or long sessions nearing
   context limits.
```

Do NOT pre-select a mode. Do NOT skip this prompt. Wait for the user's choice before proceeding.

**If the user chooses Full**, ask one follow-up before proceeding. Detect the harness (Claude Code, Codex, or Cursor) and ask:

```
Would you also like to search your [harness name] session history
for relevant knowledge to help the Compound process? This adds
time and token usage.
```

If yes, run the Session Historian in Phase 1; if no, skip it. Do not ask this in lightweight mode.

---

### Full Mode

<critical_requirement>
**The primary output is ONE file - the final documentation.**

Phase 1 subagents return TEXT DATA to the orchestrator. They must NOT use Write, Edit, or create any files. Only the orchestrator writes files: the solution doc in Phase 2, and — if the Discoverability Check finds a gap and the user approves — a small edit to a project instruction file (AGENTS.md or CLAUDE.md).
</critical_requirement>

### Phase 0.5: Auto Memory Scan

If a "user's auto-memory" block (Claude Code only) is present in the system prompt, scan it semantically for entries related to the problem. If absent, empty, on another platform, or nothing relevant, proceed to Phase 1 without memory context. Otherwise pass this block to the Context Analyzer and Solution Extractor:

```
## Supplementary notes from auto memory
Treat as additional context, not primary evidence. Conversation history
and codebase findings take priority over these notes.

[relevant entries here]
```

Tag any memory notes that reach the final doc with "(auto memory [claude])".

### Phase 1: Research

Read `references/research-subagents.md`, then dispatch with the platform's subagent primitive (`Agent`/`Task` in Claude Code, `spawn_agent` in Codex, `subagent` in Pi; run sequentially where parallel dispatch is unavailable):

- Launch **Context Analyzer**, **Solution Extractor**, and **Related Docs Finder** in parallel (background). Each returns text data only.
- Then, only if the user opted in, invoke the `ce-sessions` skill in foreground for the **Session Historian** using the tight dispatch shape in that reference. `ce-sessions` owns bounded extraction and dispatches `ce-session-historian` only after scratch files exist.

### Phase 2: Assembly & Write

<sequential_tasks>

**WAIT for all Phase 1 subagents to complete before proceeding.** The orchestrator performs these steps:

1. Collect all text results from Phase 1.
2. **Compute a deterministic dedup fingerprint** before relying on the overlap heuristic, so the same lesson surfacing across studies, sessions, or analysts maps to one entry:

   ```
   fingerprint = problem_type + "::" + (component or "_") + "::" + slug(root_cause or guidance_summary)
   ```

   `slug(...)` is lowercase, alphanumeric-and-hyphen-only, with stop-words (`the, a, an, of, in, with, for, on, by, to`) removed and length capped at 60 characters. If any doc in `docs/solutions/<category>/` already has an equal frontmatter `fingerprint:`, treat the overlap as **High** regardless of the Related Docs Finder's assessment and update that doc. Always write `fingerprint` into the new or updated doc's frontmatter.

3. **Check the Related Docs Finder overlap assessment** for cases the fingerprint did not catch:

   | Overlap | Action |
   |---------|--------|
   | **High** — same problem, root cause, and solution | **Update the existing doc** with fresher context (new code examples, updated references, additional prevention tips) rather than creating a duplicate. |
   | **Moderate** — same area, different angle, root cause, or solution | **Create the new doc** normally. Flag the overlap for Phase 2.5. |
   | **Low or none** | **Create the new doc** normally. |

   When updating, preserve the file path and frontmatter structure; update solution, code examples, prevention tips, and stale references; add `last_updated: YYYY-MM-DD`; do not change the title unless the problem framing materially shifted.

4. **Incorporate session history findings** (if any): fold dead ends into **What Didn't Work** (bug track) or **Context** (knowledge track); use cross-session patterns to enrich **Prevention** or **Why This Matters**; tag that content "(session history)". If findings are thin or "no relevant prior sessions," proceed without them.
5. Assemble the markdown from the collected pieces using `assets/resolution-template.md`. Preserve its section order for new docs unless the user explicitly asks otherwise.
6. Validate YAML frontmatter against `references/schema.yaml`, including the YAML-safety quoting rule for array items (see `references/yaml-schema.md` > YAML Safety Rules).
7. `mkdir -p docs/solutions/[category]/`, then write either the updated existing doc or the new `docs/solutions/[category]/[filename].md`.
8. **Validate parser-safety of the written frontmatter** with the bundled `scripts/validate-frontmatter.py` (Python 3 stdlib only). It catches malformed `---` delimiter lines, unquoted ` #` in scalar values (silent comment truncation), and unquoted `: ` in scalar values. The script lives inside this skill, not the project. Set `SKILL_DIR` to the absolute path of the directory containing this SKILL.md and run:

   ```bash
   SKILL_DIR="<absolute path of the directory containing this SKILL.md>"
   PY=""
   for c in python3 python py; do
     if command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(0 if sys.version_info[0] == 3 else 1)' >/dev/null 2>&1; then PY="$c"; break; fi
   done
   if [ -f "$SKILL_DIR/scripts/validate-frontmatter.py" ] && [ -n "$PY" ]; then
     "$PY" "$SKILL_DIR/scripts/validate-frontmatter.py" "<output-path>"
   else
     echo "MANUAL_CHECK: bundled validator or Python 3 unavailable"
   fi
   ```

   - **Script ran:** exit 0 means parser-safe. Exit 1 means stderr names the offending field(s): quote the value(s), re-write the doc, and re-run until exit 0. Do not declare success while validation fails.
   - **`MANUAL_CHECK` printed:** apply the validator's checks by hand, no broader: (1) the opening and closing delimiters are each a line containing only `---` (trailing whitespace allowed); (2) every top-level `key: value` whose value does not start with `"`, `'`, `[`, `{`, `|`, or `>` contains no ` #` and no `: ` — quote the whole value if either appears. Then state in the completion output that the bundled validator was unavailable and the checks were applied manually.

   The validator does not enforce schema rules or YAML reserved-indicator characters; step 6 covers those.

</sequential_tasks>

### Phase 2.5: Selective Refresh Check

After writing, read `references/refresh-check.md` to decide whether to load `ce-compound-refresh` with a narrow scope, ask, or only recommend it. Never run it before the new learning is written or without an argument unless the user wants a broad sweep.

### Discoverability Check

Every run (both modes), after the refresh decision: read `references/discoverability-check.md` and check whether AGENTS.md/CLAUDE.md surface `docs/solutions/`. Ask before editing an instruction file.

### Phase 3: Optional Enhancement

**WAIT for Phase 2 to complete.** Based on problem type (performance, security, database, or code-heavy), read `references/specialized-reviews.md` and optionally run the matching reviewers.

---

### Lightweight Mode

<critical_requirement>
**Single-pass alternative — same documentation, fewer tokens.** No subagents, no parallel tasks, one file written. No cross-referencing or duplicate detection.
</critical_requirement>

The orchestrator performs ALL of the following in one sequential pass:

1. **Extract from conversation**: identify the problem and solution from conversation history. Also scan the "user's auto-memory" block if present (Claude Code only) as supplementary context; tag memory-sourced content in the doc with "(auto memory [claude])".
2. **Classify**: read `references/schema.yaml` and `references/yaml-schema.md`, then determine track (bug vs knowledge), category, and filename.
3. **Write minimal doc**: create `docs/solutions/[category]/[filename].md` using the track template from `assets/resolution-template.md`, with:
   - YAML frontmatter with track-appropriate fields, applying the YAML-safety quoting rule for array items (see `references/yaml-schema.md` > YAML Safety Rules)
   - Bug track: Problem, root cause, solution with key code snippets, one prevention tip
   - Knowledge track: Context, guidance with key examples, one applicability note
4. Run the Discoverability Check. **Skip specialized agent reviews** (Phase 3). The overlap check is skipped, so the doc may overlap an existing one; `ce-compound-refresh` will catch it later. Suggest `ce-compound-refresh` only for an obvious narrow target, never a broad sweep.

**Lightweight output:**
```
Completed: Documentation complete (lightweight mode)

File created:
- docs/solutions/[category]/[filename].md

[If discoverability check found instruction files don't surface the knowledge store:]
Tip: Your AGENTS.md/CLAUDE.md doesn't surface docs/solutions/ to agents —
a brief mention helps all agents discover these learnings.

Note: This was created in lightweight mode. For richer documentation
(cross-references, detailed prevention strategies, specialized reviews),
re-load the `ce-compound` skill in a fresh session.
```

---

## Output and Success Format

Writes the final learning directly into `docs/solutions/`. For the Full-mode success output (including the "updated existing doc" variant), the bug-track and knowledge-track category catalog, preconditions, and common mistakes, read `references/reference-material.md` before reporting completion.

**Each unit of analytical work should make subsequent units of work easier—not harder.**

## Auto-Invoke

<auto_invoke> <trigger_phrases> - "that worked" - "it's fixed" - "working now" - "problem solved" </trigger_phrases>

<manual_override> use the `ce-compound` skill [context] to document immediately without waiting for auto-detection. </manual_override> </auto_invoke>

## Related

- `ce-learnings-researcher` agent - searches docs/solutions/ for applicable past learnings
- `ce-plan` - Planning workflow (references documented solutions)

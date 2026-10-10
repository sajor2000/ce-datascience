# Phase 1 research subagent briefs (Full mode)

Read in Full mode before dispatching Phase 1. Every subagent returns TEXT DATA to the orchestrator and must NOT use Write, Edit, or create files. Pass the relevant support-file contents (`references/schema.yaml`, `references/yaml-schema.md`) and any auto-memory excerpt block into the task prompts so subagents do not need cross-skill paths.

## 1. Context Analyzer

- Extracts conversation history
- Reads `references/schema.yaml` for enum validation and **track classification**; determines the track (bug or knowledge) from the problem_type
- Identifies problem type, component, and track-appropriate fields:
  - **Bug track**: symptoms, root_cause, resolution_type
  - **Knowledge track**: applies_when (symptoms/root_cause/resolution_type optional)
- Incorporates auto memory excerpts (if provided) as supplementary evidence
- Reads `references/yaml-schema.md` for category mapping into `docs/solutions/`
- Suggests a filename using the pattern `[sanitized-problem-slug].md` -- no date suffix, even if existing files in the target directory have one; the `date:` frontmatter field is the canonical creation date
- Returns: YAML frontmatter skeleton (must include `category:` mapped from problem_type), category directory path, suggested filename, and which track applies
- Does not invent enum values, categories, or frontmatter fields from memory
- Does not force bug-track fields onto knowledge-track learnings or vice versa

## 2. Solution Extractor

- Reads `references/schema.yaml` for track classification and adapts output structure to the track
- Incorporates auto memory excerpts (if provided) as supplementary evidence -- conversation history and the verified fix take priority; if memory notes contradict the conversation, note the contradiction as cautionary context

**Bug track output sections:**

- **Problem**: 1-2 sentence description of the issue
- **Symptoms**: Observable symptoms (error messages, behavior)
- **What Didn't Work**: Failed investigation attempts and why they failed
- **Solution**: The actual fix with code examples (before/after when applicable)
- **Why This Works**: Root cause explanation and why the solution addresses it
- **Prevention**: Strategies to avoid recurrence, best practices, and test cases, with concrete code examples where applicable (validation checks, reproducibility configurations, dependency pinning)

**Knowledge track output sections:**

- **Context**: What situation, gap, or friction prompted this guidance
- **Guidance**: The practice, pattern, or recommendation with code examples when useful
- **Why This Matters**: Rationale and impact of following or not following this guidance
- **When to Apply**: Conditions or situations where this applies
- **Examples**: Concrete before/after or usage examples showing the practice in action

## 3. Related Docs Finder

- Searches `docs/solutions/` for related documentation; identifies cross-references, links, and related GitHub issues
- Flags related learning or pattern docs that may now be stale, contradicted, or overly broad
- **Assesses overlap** with the new doc across five dimensions: problem statement, root cause, solution approach, referenced files, and prevention rules:
  - **High**: 4-5 dimensions match — essentially the same problem solved again
  - **Moderate**: 2-3 dimensions match — same area but different angle or solution
  - **Low**: 0-1 dimensions match — related but distinct
- Returns: links, relationships, refresh candidates, and overlap assessment (score + which dimensions matched)

**Search strategy (grep-first):**

1. Extract keywords from the problem context: module names, technical terms, error messages, component types
2. If the category is clear, narrow to the matching `docs/solutions/<category>/` directory
3. Use the native content-search tool (e.g., Grep in Claude Code) to pre-filter candidates BEFORE reading content. Run multiple case-insensitive searches in parallel against frontmatter fields (substitute real keywords):
   - `title:.*<keyword>`
   - `tags:.*(<keyword1>|<keyword2>)`
   - `module:.*<module name>`
   - `component:.*<component>`
4. If search returns >25 candidates, re-run with more specific patterns. If <3, broaden to full content search
5. Read only frontmatter (first 30 lines) of candidates to score relevance; fully read only strong/moderate matches
6. Return distilled links and relationships, not raw file contents

**GitHub issue search:** prefer `gh issue list --search "<keywords>" --state all --limit 5`. If `gh` is not installed, fall back to GitHub MCP tools if available. If neither is available, skip and note it was skipped.

## 4. Session Historian (only if the user opted in)

- **Skip entirely** if the user declined session history
- Load the `ce-sessions` skill; do not dispatch `ce-session-historian` directly
- Run in **foreground** after launching the three background agents — it reads session files outside the working directory (`~/.claude/projects/`, `~/.codex/sessions/`, `~/.cursor/projects/`) that background agents may not reach
- Omit the `mode` parameter so the user's configured permission settings apply
- Use the mid-tier model (e.g., `model: "sonnet"` in Claude Code)

**Dispatch prompt — keep tight.** Use exactly this shape and append nothing else (no extra context blocks, exclusion lists, or topic-keyword bullets — verbose prompts widen the search and inflate wall time):

- **Session context**: repo name and current git branch, only values that resolved cleanly under SKILL.md "Session context"; otherwise omit.
- **Time window**: explicit `7 days` unless the documented problem clearly spans a longer arc.
- **Problem topic**: one sentence naming the concrete issue — error message, module name, what broke and how it was fixed.
- **Filter rule (one line)**: "Only surface findings directly relevant to this specific problem. Ignore unrelated work from the same sessions or branches."
- **Output schema**:

  ```
  Structure your response with these sections (omit any with no findings):
  - What was tried before
  - What didn't work
  - Key decisions
  - Related context
  ```

If keyword search is needed, the agent owns that decision via the `--keyword` mode of the `ce-sessions` skill's `extract-metadata.py`. Returns a structured digest of prior-session findings, or "no relevant prior sessions".

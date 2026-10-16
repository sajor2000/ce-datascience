# Discoverability Check

Read after the learning is written and the refresh decision is made, in both Full and Lightweight mode. Check whether the project's instruction files would lead an agent to discover and search `docs/solutions/` before starting work in a documented area.

1. Identify which root-level instruction files exist (AGENTS.md, CLAUDE.md, or both). Read them and determine which holds the substantive content — one may just be a shim that `@`-includes the other (e.g., `CLAUDE.md` containing only `@AGENTS.md`). The substantive file is the assessment and edit target; ignore shims. If neither file exists, skip this check.
2. Assess whether an agent reading the instruction files would learn three things:
   - That a searchable knowledge store of documented solutions exists
   - Enough about its structure to search effectively (category organization, YAML frontmatter fields like `module`, `tags`, `problem_type`)
   - When to search it (before implementing features, debugging issues, or making decisions in documented areas — learnings may cover bugs, best practices, workflow patterns, or other institutional knowledge)

   This is a semantic assessment, not a string match. The information may be a line in an architecture section, a bullet in a gotchas section, spread across places, or expressed without the exact path `docs/solutions/`. If an agent would reasonably discover and use the knowledge store, the check passes.
3. If the spirit is already met, no action needed.
4. If not:
   a. Identify where a mention fits naturally given the file's structure, tone, and density. Prefer a single line in the closest related section (architecture tree, directory listing, documentation section, conventions block) over a new headed section. Add a new section only as a last resort when the file has clear sectioned structure and nothing is related.
   b. Draft the smallest addition that communicates the three things, matching the file's style. Describe the knowledge store itself, not the plugin.

      Keep the tone informational, not imperative: "relevant when implementing or debugging in documented areas" rather than "check before implementing or debugging." Imperative directives cause redundant reads when a workflow already includes a dedicated search step.

      Calibration examples (adapt, not templates):

      Existing directory listing or architecture section — add a line:
      ```
      docs/solutions/  # documented solutions to past problems (bugs, statistical methods, data quality patterns), organized by category with YAML frontmatter (module, tags, problem_type)
      ```

      Nothing is a natural fit — a small headed section:
      ```
      ## Documented Solutions

      `docs/solutions/` — documented solutions to past problems (bugs, statistical methods, data quality patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`). Relevant when implementing or debugging in documented areas.
      ```

      If placement is ambiguous, ask one concise placement question using the Skill Value interaction rule before editing. Any project-instruction edit needs the user's approval.

The instruction-file edit is maintenance, not a second deliverable. In Lightweight mode, when the check finds a gap, include the Tip line in the lightweight completion output.

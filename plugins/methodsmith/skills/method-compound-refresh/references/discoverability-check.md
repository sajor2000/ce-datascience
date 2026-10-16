# Discoverability Check

Detail for `method-compound-refresh` § "Discoverability Check". Linked from SKILL.md. Runs every time, after the refresh report and the Phase 5 commit decision.

Check whether the project's instruction files would lead an agent to discover and search `docs/solutions/` before starting work in a documented area. The knowledge store only compounds value when agents can find it.

1. Identify which root-level instruction files exist (AGENTS.md, CLAUDE.md, or both). Read the file(s) and determine which holds the substantive content — one file may just be a shim that `@`-includes the other (e.g., `CLAUDE.md` containing only `@AGENTS.md`, or vice versa). The substantive file is the assessment and edit target; ignore shims. If neither file exists, skip this check entirely.
2. Assess whether an agent reading the instruction files would learn three things:
   - That a searchable knowledge store of documented solutions exists
   - Enough about its structure to search effectively (category organization, YAML frontmatter fields like `module`, `tags`, `problem_type`)
   - When to search it (before implementing features, debugging issues, or making analytical or methods decisions in documented areas — learnings may cover bugs, statistical methods, data quality patterns, workflow patterns, or other institutional knowledge)

   This is a semantic assessment, not a string match. The information could be a line in an architecture section, a bullet in a gotchas section, spread across multiple places, or expressed without ever using the exact path `docs/solutions/`. If an agent would reasonably discover and use the knowledge store after reading the file, the check passes.
3. If the spirit is already met, no action needed.
4. If not:
   a. Based on the file's existing structure, tone, and density, identify where a mention fits naturally. Before creating a new section, check whether the information could be a single line in the closest related section — an architecture tree, a directory listing, a documentation section, or a conventions block. A line added to an existing section is almost always better than a new headed section. Only add a new section as a last resort when the file has clear sectioned structure and nothing is even remotely related.
   b. Draft the smallest addition that communicates the three things. Match the file's existing style and density. Describe the knowledge store itself, not the plugin.

      Keep the tone informational, not imperative. Express timing as description, not instruction — "relevant when implementing or debugging in documented areas" rather than "check before implementing or debugging." Imperative directives like "always search before implementing" cause redundant reads when a workflow already includes a dedicated search step.

      Calibration examples (adapt to the file, not templates):

      When there's an existing directory listing or architecture section — add a line:
      ```
      docs/solutions/  # documented solutions to past problems (bugs, statistical methods, data quality patterns), organized by category with YAML frontmatter (module, tags, problem_type)
      ```

      When nothing in the file is a natural fit — a small headed section is appropriate:
      ```
      ## Documented Solutions

      `docs/solutions/` — documented solutions to past problems (bugs, statistical methods, data quality patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`). Relevant when implementing or debugging in documented areas.
      ```

      If the instruction-file placement is ambiguous and the run is interactive, ask one concise placement question using the Skill Value interaction rule before editing. In autofix mode, pick the most natural placement and note it in the report.
5. **Amend or create a follow-up commit when the check produces edits.** If step 4 edited an instruction file and Phase 5 already committed the refresh changes, stage the newly edited file and either amend the existing commit (if still on the same branch and no push has occurred) or create a small follow-up commit (e.g., `docs: add docs/solutions/ discoverability to AGENTS.md`). If Phase 5 already pushed the branch (e.g., the branch+PR path), push the follow-up commit as well so the open PR includes the change. If the user chose "Don't commit" in Phase 5, leave the instruction-file edit unstaged alongside the other uncommitted refresh changes.

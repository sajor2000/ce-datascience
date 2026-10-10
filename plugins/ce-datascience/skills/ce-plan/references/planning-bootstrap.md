# Planning Bootstrap (Phase 0.4)

Load this when no relevant requirements document exists or the input needs more structure.

- If the request is already clear enough for direct technical planning, continue to Phase 0.5.
- If the ambiguity is mainly product framing, user behavior, or scope definition, recommend `ce-brainstorm` as a suggestion, and always offer to continue planning here.
- If the user wants to continue here (or was already explicit about wanting a plan), run the bootstrap.

The bootstrap briefly establishes:
- Problem frame
- Intended behavior
- Scope boundaries and obvious non-goals
- Success criteria
- Blocking questions or assumptions

It preserves direct-entry convenience; it does not replace a full brainstorm.

If it uncovers major unresolved product questions, recommend `ce-brainstorm` again; if the user still wants to continue, require explicit assumptions before proceeding.

If a different workflow would serve the user better:

- **Symptom without a root cause** (broken behavior, cause unknown) — announce "This needs investigation before planning — switching to ce-debug to find the root cause." and load the `ce-debug` skill.
- **Clear task ready to execute** (known root cause, obvious fix, no architectural decisions) — suggest `ce-work` as a faster alternative alongside continuing with planning. The user decides.

# Selective Refresh Check (Phase 2.5)

Read after the new learning is written. Decide whether the new solution is evidence that older docs should be refreshed. `method-compound-refresh` is **not** a default follow-up. Always capture the new learning first; refresh is targeted maintenance, not a prerequisite.

Load the `method-compound-refresh` skill when one or more are true:

1. A related learning or pattern doc recommends an approach the new fix now contradicts
2. The new fix clearly supersedes an older documented solution
3. The work involved a refactor, migration, rename, or dependency upgrade that likely invalidated references in older docs
4. A pattern doc now looks overly broad, outdated, or no longer supported
5. The Related Docs Finder surfaced high-confidence refresh candidates in the same problem space
6. The Related Docs Finder reported **moderate overlap** with an existing doc (possible consolidation)

Do not load it when no related docs were found, related docs still appear consistent, the overlap is superficial, or refresh would require a broad historical review with weak evidence.

Rules:

- **One obvious stale candidate**: load the `method-compound-refresh` skill with a narrow scope hint after the new learning is written
- **Multiple candidates in the same area**: ask the user (Skill Value interaction rule) whether to run a targeted refresh for that module, category, or pattern set
- **Context is tight or lightweight mode**: do not expand into a broad refresh automatically; recommend `method-compound-refresh` as the next step with a scope hint, and only when there is an obvious narrow target

Always pass an explicit argument, preferring the narrowest useful scope:

- **Specific file** when one learning or pattern doc is the likely stale artifact
- **Module or component name** when several related docs may need review
- **Category name** when the drift is concentrated in one solutions area
- **Pattern filename or topic** when the stale guidance lives in `docs/solutions/patterns/`

Examples: `method-compound-refresh sofa-score-calculation`, `method-compound-refresh statistical-patterns`, `method-compound-refresh data-quality-issues`, `method-compound-refresh reproducibility-patterns`. A single scope hint may still expand to multiple related docs within one domain, category, or pattern area.

Do not load the `method-compound-refresh` skill without an argument unless the user explicitly wants a broad sweep.

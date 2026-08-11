# Predictable Skill Authoring

Use this maintainer guidance when creating or materially revising a `SKILL.md` in this repository. It complements the repository's portability and validation rules; it is not a runtime dependency for installed skills.

## Authoring rules

1. Give every procedural phase a checkable completion criterion. State the observable evidence that permits the next phase rather than asking for generic thoroughness.
2. Keep every instruction in one authoritative location. Put only the workflow needed by every invocation in `SKILL.md`; put conditional detail in a skill-local `references/` file and link it with a clear loading cue.
3. Treat frontmatter descriptions as routing interfaces. Name the distinct task branches that should invoke the skill, remove synonymous trigger lists, and keep implementation detail in the body.
4. Choose invocation deliberately. Make a skill user-invoked when it orchestrates a workflow or needs an explicit human decision; make it model-invoked when it provides reusable discipline another workflow should reach automatically.
5. Use progressive disclosure. Keep the common path in `SKILL.md`; move branch-specific detail into one-level-deep, skill-local references with an explicit loading cue.
6. Remove stale or no-op prose. Each sentence must change agent behavior, preserve a safety constraint, or identify a completion check.
7. Keep runtime skills self-contained and portable. Do not reference repository-level maintainer documents, platform-only environment variables without a fallback, or sibling-skill resources.

## Review checklist

- Can a fresh agent identify the trigger, output, non-goal, and completion evidence without relying on another skill?
- Does each linked reference live inside the same skill directory and load only for a clear branch or condition?
- Would deleting any repeated instruction change behavior? If not, keep the stronger single statement.
- Does the revised skill pass focused behavioral evaluation, portability checks, and the repository's full validation suite?
- Is the invocation mode intentional, and does every terminal path state observable completion evidence?

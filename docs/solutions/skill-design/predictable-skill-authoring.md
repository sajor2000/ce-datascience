# Predictable Skill Authoring

Use this maintainer guidance when creating or materially revising a `SKILL.md` in this repository. It complements the repository's portability and validation rules; it is not a runtime dependency for installed skills.

## Authoring rules

1. Give every procedural phase a checkable completion criterion. State the observable evidence that permits the next phase rather than asking for generic thoroughness.
2. Keep every instruction in one authoritative location. Put only the workflow needed by every invocation in `SKILL.md`; put conditional detail in a skill-local `references/` file and link it with a clear loading cue.
3. Treat frontmatter descriptions as routing interfaces. Name the distinct task branches that should invoke the skill, remove synonymous trigger lists, and keep implementation detail in the body.
4. Remove stale or no-op prose. Each sentence must change agent behavior, preserve a safety constraint, or identify a completion check.
5. Keep runtime skills self-contained and portable. Do not reference repository-level maintainer documents, platform-only environment variables without a fallback, or sibling-skill resources.

## Review checklist

- Can a fresh agent identify the trigger, output, non-goal, and completion evidence without relying on another skill?
- Does each linked reference live inside the same skill directory and load only for a clear branch or condition?
- Would deleting any repeated instruction change behavior? If not, keep the stronger single statement.
- Does the revised skill pass focused behavioral evaluation, portability checks, and the repository's full validation suite?

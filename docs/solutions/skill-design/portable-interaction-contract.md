# Portable Interaction Contract for Skills

## Problem

Interactive skills used to repeat long platform-specific instructions for
Claude Code, Codex, Gemini, and Pi question tools. That made skill entrypoints
noisy and increased drift risk whenever one harness changed its question UI.

## Pattern

Each interactive skill should state its decision points, not re-document every
harness API. Use this compact runtime wording inside the skill itself:

```markdown
- **Ask only if:** [the unresolved decision that materially changes output]
- **Interaction:** Check repo/config/chat evidence first. Ask one
  decision-changing question at a time; use the current harness's blocking
  question UI when available, otherwise present numbered choices and wait.
```

This keeps skills self-contained while avoiding repeated references to
platform tool names.

## Constraints

- Do not make `SKILL.md` files link to this document at runtime. Skills are
  copied as isolated units during conversion, so runtime references must stay
  inside each skill directory.
- Keep skill entrypoints focused on value, routing, and outputs. Move rare
  branches or examples into co-located `references/`.
- Do not skip user-facing decisions. If a choice materially changes generated
  files, setup configuration, review routing, or scientific scope, ask one
  focused question after checking available evidence.

## Maintenance

The test `tests/skill-value-contract.test.ts` checks that skills avoid old
platform-specific question-tool boilerplate and carry the value contract.

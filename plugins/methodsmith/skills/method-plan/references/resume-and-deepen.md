# Resume and Deepen Routing

Load this from Phase 0.1 when the user references an existing plan file or an obvious recent matching plan exists in `docs/plans/`.

## Resume an existing plan

- Read it.
- Unified requirements artifact (`artifact_contract: ce-unified-plan/v1`, `artifact_readiness: requirements-only`): update it in place and do not offer a sibling plan; continue the normal workflow from Phase 0.2.
- Otherwise, confirm whether to update it in place or create a new plan.
- When updating, revise only the still-relevant sections. Plans carry no per-unit progress state (`method-work` derives progress from git), so there is no progress to preserve.

**Format preservation:** write back in the existing artifact's format (`.md` or `.html`). An explicit `output:` argument on this run overrides. Pipeline mode always wins: even when resuming an `.html` plan, pipeline runs force markdown, write `<plan-basename>.md` at the parallel path, and leave the original `.html` untouched.

## Deepen intent

- "Deepen" / "deepening" in reference to a plan ("deepen the plan", "run a deepening pass") is the primary trigger. The target is a **plan** in `docs/plans/`, not a requirements document. Use any path, keyword, or context to identify it; verify a provided path is actually a plan; confirm with the user when the match is not obvious.
- "Strengthen", "confidence", "gaps", and "rigor" alone are NOT deepening triggers — they usually name a specific section edit. Treat them as deepening intent only when the request targets the plan as a whole and names no specific section, and prefer to confirm first.
- Normal editing requests ("update the test scenarios", "add a new implementation unit", "strengthen the risk section") follow the standard resume flow, not the fast path.

## Fast-path routing

Once the plan is identified and appears complete (major sections present, implementation units defined, `status: active`), route by file extension first, then frontmatter:

- **`.html` plan:** short-circuit to Phase 5.3 (Confidence Check and Deepening) in **interactive mode**. HTML plans never carry YAML frontmatter, so treat the visible-header metadata as the frontmatter equivalent; never route an `.html` plan to `references/universal-planning.md` for missing YAML.
- **`.md` plan WITH YAML frontmatter:** short-circuit to Phase 5.3 in **interactive mode**.
- **`.md` plan WITHOUT YAML frontmatter** (non-software plans use a `# Title` heading with a `Created:` date): route to `references/universal-planning.md` for editing or deepening instead of Phase 5.3.

A plan that already has `deepened: YYYY-MM-DD` and no explicit re-deepen request still gets the same confidence-gap evaluation; the fast path does not force deepening.

# Pre-Write Review (5.1)

Load this after the 5.0 scoping synthesis and before writing the plan file. Fix every failed check before 5.2.

## Plan checks

- The plan does not invent product behavior that should have been defined in `ce-brainstorm`.
- Without an origin document, the bounded planning bootstrap established enough product clarity to plan responsibly.
- Every major decision is grounded in the origin document or research.
- Each implementation unit is concrete, dependency-ordered, and implementation-ready.
- When test-first or characterization-first posture was explicit or strongly implied, the relevant units carry a lightweight `Execution note`.
- Each feature-bearing unit has test scenarios from every applicable category (happy path, edge cases, error paths, integration), right-sized to its complexity.
- Test scenarios name specific inputs, actions, and expected outcomes without becoming test code.
- Feature-bearing units with blank or missing test scenarios are incomplete. `Test expectation: none -- [reason]` is valid only for non-feature-bearing units (pure config, scaffolding, styling).
- Deferred items are explicit, not hidden as fake certainty.
- A High-Level Technical Design section, if present, uses the right medium, carries the non-prescriptive framing, and contains no implementation code (no imports, exact signatures, or framework-specific syntax). Per-unit technical design fields are concise and directional.
- A new directory structure gets an Output Structure tree when it helps reviewers see the shape.
- Planned work for a separate PR, issue, or repo sits under `### Deferred to Follow-Up Work`, not mixed with true non-goals in Scope Boundaries.
- U-IDs are unique and stable: reordering or splitting did not renumber existing units; gaps from deletions are preserved.
- Consider whether a visual aid (dependency graph, interaction diagram, comparison table) would help a reader faster than prose.

## Origin-document checks

When the plan originated from a requirements document, re-read it and verify:

- The chosen approach still matches the product intent.
- Scope boundaries and success criteria are preserved.
- Blocking questions were resolved, explicitly assumed, or sent back to `ce-brainstorm`.
- Every section of the origin document is addressed; nothing was silently dropped.
- If the origin supplies A/F/AE IDs: every origin R/F/AE that affects implementation is referenced in Requirements Trace, a U-ID unit, test scenarios, verification, scope boundaries, or explicitly deferred. Carry actors forward when they affect behavior, permissions, UX, orchestration, handoff, or verification. Irrelevant origin IDs may be omitted.
- If the origin was Deep-program (contains an `Outside this study's scope` subsection, or legacy `Outside this product's identity`): Scope Boundaries preserves the three-way split — `Deferred for later` and the outside-scope subsection verbatim from the origin, and `Deferred to Follow-Up Work` reserved for plan-local sequencing.

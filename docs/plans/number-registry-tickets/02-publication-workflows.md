# 02: Registry-backed publication workflows and blocking submission checks

**What to build:** An analyst generates populated Table 1 cells, figure caption
metrics and model-card metrics through registry IDs. Writing retains placeholders;
submission audit, packaging and verification refuse any broken numeric chain.

**Blocked by:** 01: Registry, R/Python helpers, renderer and fail-closed gate.

**Status:** implemented in the combined PR stack; see the parent completion note for final validation.

**Parent plan:** ../2026-10-16-number-registry-plan.md

## Acceptance criteria

- [ ] Register real populated Table 1 cells; do not register invented shell values.
- [ ] Figure captions and model-card metrics resolve to registered values.
- [ ] SAP output IDs map unambiguously to registry IDs used in the document.
- [ ] Scientific writing drafts reportable numbers as placeholders only, retaining
      permitted structural numbers and surfacing unresolved/external numeric claims.
- [ ] The actual audit workflow executes the common gate and blocks author handoff
      on nonzero exit, missing runtime, unsupported documents or zero coverage.
- [ ] The package builder executes the gate and writes blocked readiness on failure;
      artifact presence alone cannot mark a package ready.
- [ ] Verification executes the gate and emits a blocking signal on failure.
- [ ] All three entry points are tested with successful and intentionally failing
      subprocesses; no warning-only fallback or static prose promise suffices.
- [ ] Each installed consumer can locate its runtime without sibling-skill paths.
- [ ] Schema-only mode routes data-touching steps through the existing safe runner.
- [ ] Updated behavioral cases run twice in independent fresh contexts, alongside
      deterministic workflow contracts and converter/install checks.
- [ ] Documentation and inventories describe the actual supported behavior without
      manual release-version changes.

## Test-first slices

1. One populated Table 1 cell -> placeholder sentence -> package readiness gate.
2. One caption metric and one model-card metric -> same source chain.
3. SAP mapping and writing behavior, including unresolved numeric evidence.
4. Audit and verification consume a real gate failure and block completion.
5. Converted installation plus safe-run behavior and fresh-context evaluations.

## Review notes

The current package builder checks the SAP, Table 1 specification and figure
manifest for presence/status. Preserve its useful reports while adding the numeric
blocking condition. The existing verification signal is already a public consumer
contract; keep its blocking semantics consistent.

## Delivery rules

Use synthetic fixtures only. Keep all installation checks in a disposable home and
temporary target roots; never touch real agent configuration directories. Record
one failing behavioral test followed by the passing implementation for each slice.
Use the public interfaces approved in the parent plan. Run affected deterministic
tests and repository validation. Skill behavior changes also require fresh-context
skill-creator evaluations under the repository rules.

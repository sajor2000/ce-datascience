# 01: Registry, R/Python helpers, renderer and fail-closed gate

**What to build:** An analyst registers a disclosure-safe aggregate in R or Python,
uses its placeholder in Markdown or Quarto, renders the manuscript, and verifies
that each displayed result comes from that exact registered occurrence.

**Blocked by:** None for completing the core contract. Resolve this ticket on top
of existing PR #101 rather than creating a competing registry implementation.

**Status:** implemented in the combined PR stack; see the parent completion note for final validation.

**Existing work:** https://github.com/sajor2000/methodsmith/pull/101
**Parent plan:** ../2026-10-16-number-registry-plan.md

## Acceptance criteria

- [ ] Both helpers produce the same versioned, validated aggregate schema: typed value,
      display text, all source hashes, producer script/hash/commit, and SAP output ID.
- [ ] Dirty/uncommitted producer code is rejected or explicitly represented by an
      approved exact-content contract; a boolean alone cannot substitute for evidence.
- [ ] Unsupported versions, malformed entries, duplicate/conflicting IDs, missing
      fields and nonfinite values fail with nonzero status and safe diagnostics.
- [ ] Numeric display text is generated from or checked against typed values.
- [ ] Updates are explicit and writes are atomic.
- [ ] A registered result renders successfully and its output occurrence remains
      linked to its source placeholder, registry entry, and source digests.
- [ ] A typed result fails even if it equals a registered number used elsewhere.
- [ ] A quoted unregistered result fails; quoting prose cannot exempt all its numbers.
- [ ] Changed/missing sources or producer code, unknown/malformed placeholders,
      unsupported documents and edited rendered outputs fail closed.
- [ ] Every numeric occurrence is classified; allowlisting years, citations or
      checklist items cannot exempt an unrelated result that happens to look similar.
- [ ] No files, no usable entries, no reportable occurrences, exemptions-only inputs
      and suppressed-only inputs fail the zero-coverage condition.
- [ ] Counts below max(11, project disclosure floor) and recoverable complementary
      counts are suppressed before serialization; hidden raw counts never appear.
- [ ] Small-support rates are not a route around suppression. Estimates such as
      hazard ratio 0.78 remain valid; a generic numeric comparison is not a count rule.
- [ ] Raw-input hashing runs only within the approved execution boundary. Schema-only
      fixtures pass through the real safe runner and emit no rows or identifying paths.
- [ ] Executable discovery works after conversion into the supported installed layouts.
- [ ] R parity is actually executed in the acceptance environment, rather than skipped.

## Reproduced gaps in existing work

At PR head 39a0f4b81ec387f9a7795f72fbe84f289cb032fa, synthetic CLI checks
returned exit 0 for both of these inputs:

- A manually typed result 0.78 when the registry contained primary_hr = 0.78,
  despite there being no placeholder for that occurrence.
- An unregistered quoted result 9999 alongside one valid primary_hr placeholder.

These are executable observations from disposable fixtures, not speculative review
findings. Both must become regression cases before a complete provenance claim.
The PR's recorded GitHub test check was also failing when inspected; require fresh
passing CI before considering this ticket complete.

## Test-first slices

1. One Python aggregate -> placeholder -> rendered sentence -> passing CLI gate.
2. Typed matching number and quoted unregistered number -> failing CLI gate.
3. Freshness, occurrence-map tampering and unknown placeholder failures.
4. Schema, update, allowlist and zero-coverage failures.
5. Disclosure floor/support/complementary suppression, then real R parity.
6. Converted runtime discovery and schema-only end-to-end behavior.

## Delivery rules

Use synthetic fixtures only. Keep all installation checks in a disposable home and
temporary target roots; never touch real agent configuration directories. Record
one failing behavioral test followed by the passing implementation for each slice.
Use the public interfaces approved in the parent plan. Run affected deterministic
tests and repository validation. Skill behavior changes also require fresh-context
skill-creator evaluations under the repository rules.

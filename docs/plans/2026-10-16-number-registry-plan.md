---
title: Every number traceable
status: implemented-awaiting-pr-merge
date: 2026-10-16
workflow: Matt Pocock ask-matt -> to-spec -> to-tickets -> implement/tdd -> code-review
---

# Every number traceable

The three-PR implementation stack is [registry and gate #101](https://github.com/sajor2000/methodsmith/pull/101),
[publication integrations #103](https://github.com/sajor2000/methodsmith/pull/103), and
[Word support #104](https://github.com/sajor2000/methodsmith/pull/104).
All three PRs were merged before delivery of the final review fixes. The completion
fixes are now a follow-up on current main, preserving the Methodsmith rename from
#105. Runtime names use `method-*`; the existing `.ce-datascience/` project settings
and `CE_NUM` Word field format remain compatible. Merge through normal PR checks.

## Delivered behavior

- R and Python helpers record disclosure-safe aggregates with typed formatting,
  all input hashes, producing script/hash/commit, and SAP output IDs.
- A SAP output catalog is required for a passing check. Producer scripts must
  have been committed when the results were registered.
- Conflicting registration requires an explicit intentional update. Atomic writes
  avoid partial JSON. Formatting metadata is validated against the displayed text.
- Draft sources use number placeholders. Rendered text copies carry a provenance
  sidecar bound to source, registry and output digests. Matching a typed literal
  to some other registered value never establishes occurrence provenance.
- CSV/TSV rendering quotes complete cells, including commas in counts and CIs.
- Quoted results, unknown/malformed placeholders, stale or missing inputs,
  unsupported/malformed inputs, and absent reportable coverage block verification.
- Dates and structural labels have defined syntax. Year-shaped counts are never
  automatically exempted; verified year phrases and numeric bracket citations
  require explicit declarations. Result values cannot be allowlisted to pass a gate.
- Counts/rates use a minimum disclosure floor of 11, honoring stricter declared
  floors. Percentages require their supporting denominator. Small event counts,
  small complements and related count differences are independently checked.
- Related table/SAP counts and rates are conservatively suppressed together;
  nonnumeric complementary suppression never falsely labels a large count as <11.
  Current-process registrations retained only in memory allow safe intentional
  reruns to recover newly publishable aggregates without persisting hidden counts.
- Table 1 populated cells, figure captions, model-card metrics, SAP mapping and
  scientific writing use registry IDs. The three submission skills share a
  blocking gate contract. The package builder also executes the gate itself,
  including captions/alt text stored in the figure manifest.
- Schema-only operation uses the existing safe runner. Diagnostics locate table
  cells and protected run outputs without printing their contents.
- Word rendering preserves formatting and Zotero fields, including multi-paragraph
  bibliographies. Body, tables, headers, footers, notes and comments are checked.
  Arbitrary numeric field results are checked; unsupported text structures and
  incomplete fields block. Tracked deletions follow the final-text policy.

## Verification

Tests exercise public registration, render/check/trace CLI and package-builder
interfaces with synthetic fixtures. Fixes were made through observed red/green
cycles rather than implementation-only assertions.

- Final full suite: **1,506 passed, 5 optional dependency-gated skips, 0 failed**.
  Number-registry R tests executed, including suppression recovery parity.
- Typecheck passed with TypeScript 5.9.3 installed outside the repository.
- Release metadata and schemas for all 20 behavioral cases validated.
- Website production build passed with worker count capped.
- Both changed skills ran twice in independent fresh contexts. All hard gates
  passed: ce-numbers 16/16 twice; ce-manuscript-package 10/10 twice. Pre-dispatch
  target digests and complete run evidence are stored under OS temporary paths.
- Installed Codex standalone smoke: actual copied helpers register results in
  Python/R, render and check text and Pandoc-generated Word, generate a real
  Table 1 shell, and pass package readiness using registry placeholders.
- Two independent review axes found issues, which received reproductions and
  regression tests. Final standards and spec verification found no remaining
  concrete blockers in the inspected scope.
- Installation tests use disposable homes and target roots. No real agent
  configuration, secrets, clinical rows or raw clinical inputs were changed.

## Ship-gate decision

The aggregate Jev call exceeded its input limit. Complete file-group checks then
ran without truncation and still escalated, with safe-to-apply scores 0.35–0.53.
All three completion claims were verified and none contradicted. Both independent
review axes found no remaining concrete blockers. After the escalation and staged
patch were presented, the user explicitly instructed continuation on 2026-10-16,
authorizing commit and push. Preserve these results rather than reporting Jev as
automatically approving the change.

## Scope and limits

This records numeric provenance and freshness; it does not establish scientific
validity. Images, embedded chart pixels and PDFs require their source tables and
captions. Undeclared relationships between aggregates require study-specific
review. Word XML/Pandoc checks do not substitute for testing every Word version.
No production database changes, plugin rename, manual release bump, or direct
main-branch merge is part of this implementation.

[Original dependency-linked tickets](number-registry-tickets/README.md) retain the
three delivery boundaries. This completion note supersedes their draft statuses;
they are local planning records, not published external issues.

## Verification after the Methodsmith rename

The completion patch was rebased onto the renamed main branch. Fresh-context
number-gate evaluations scored 16/16 twice and package evaluations scored 10/10
twice, with every hard gate passing. Run evidence is retained under
`/tmp/methodsmith/behavioral-evals/numbers-methodsmith-final-*` (copied unchanged
from the original scratch directories for the renamed scorer). The isolated
Codex install, Python/R registration, text and real Pandoc DOCX rendering, Table 1
and successful package-gate smoke also passed against the renamed plugin.

A stale pre-rename website build was rebuilt. The full-suite rerun uses a
30-second per-test timeout because the platform install smoke exceeded Bun's
default five-second limit under concurrent evaluation load. No test was removed.

Final renamed-tree validation: `bun test --timeout 30000` passed 1,590 tests,
with five unrelated optional-dependency skips and zero failures across 110 files.
Typecheck, release validation, all 20 case schemas and the rebuilt website passed.

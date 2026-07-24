---
name: ce-r-package-testing
description: "Create, improve, or audit R package tests using testthat, fixtures, snapshots, mocks, and deterministic expectations. Use when an R package needs test coverage or failing-test diagnosis."
argument-hint: "[add|audit|debug]"
---

# R Package Testing

## Skill Value

- **Problem it solves:** Package tests can pass while missing boundary behavior, relying on network state, or encoding fragile outputs.
- **Use when:** The package uses testthat or needs tests for an R function, API boundary, regression, fixture, snapshot, or mock.
- **Output:** Focused tests with explicit fixtures, deterministic expectations, and a documented test command.
- **Ask only if:** The public behavior or intended failure mode is ambiguous.
- **Do not do:** Do not weaken a test merely to make CI pass or use live credentials in fixtures.

## Rules

1. Test observable API contracts: values, classes, errors, warnings, side effects, and documented edge cases.
2. Use small synthetic fixtures only for tests, label them as fixtures, and never substitute them for failed production analysis inputs.
3. Keep time, randomness, locale, network, and filesystem behavior controlled or explicitly mocked.
4. Use snapshots only when the output shape is intentionally stable and review snapshot changes as behavior changes.
5. Add a regression test before or with a bug fix when a minimal reproducer exists.
6. Run the narrow test file first, then the package's standard test/check command.
7. Confirm version-sensitive testthat helpers and snapshot behavior against the pinned package documentation with Ref MCP when available. Do not claim a snapshot or `skip_on_cran()` policy is correct without inspecting the package's CRAN contract.

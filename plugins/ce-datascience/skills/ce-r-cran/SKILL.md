---
name: ce-r-cran
description: "Prepare an R package for CRAN checks or submission by auditing metadata, documentation, tests, examples, dependencies, and check results. Use when a user asks about CRAN readiness or submission."
argument-hint: "[audit|prepare|submit]"
---

# CRAN Readiness

## Skill Value

- **Problem it solves:** A passing local test suite does not establish CRAN-ready metadata, examples, documentation, or cross-platform checks.
- **Use when:** The user requests CRAN preparation, a submission audit, or help interpreting `R CMD check` results.
- **Output:** A prioritized readiness report, reproducible check evidence, and explicit unresolved blockers.
- **Ask only if:** Submission ownership, target repository, or requested remediation scope is unclear.
- **Do not do:** Do not submit to CRAN, create credentials, or claim acceptance without the user's explicit action and CRAN evidence.

## Workflow

1. Inspect `DESCRIPTION`, `NAMESPACE`, `NEWS.md`, `LICENSE`, documentation, examples, vignettes, tests, and CI configuration.
2. Run the strongest available package check and classify errors, warnings, notes, and environment-specific gaps.
3. Verify URLs, package metadata, dependency declarations, examples, and documentation coverage.
4. Treat external services, API keys, network access, and platform-specific behavior as release risks—not as checks to suppress.
5. Produce a submission checklist that distinguishes fixed items, evidence, and remaining human decisions.

## Boundary

Preparing a package is not authorization to publish it. Stop before any submission, release tag, or external upload unless the user explicitly requests that action.

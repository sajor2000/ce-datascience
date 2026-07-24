---
name: ce-r-package-development
description: "Design, build, or review R packages using DESCRIPTION, roxygen2, NAMESPACE, testthat, vignettes, and reproducible package conventions. Use when creating or modifying an R package."
argument-hint: "[new|api|documentation|release]"
---

# R Package Development

## Skill Value

- **Problem it solves:** R package changes span public API, dependencies, documentation, tests, and release compatibility.
- **Use when:** The target contains `DESCRIPTION`, `NAMESPACE`, `R/`, `man/`, `tests/testthat/`, or the user asks to build an R package.
- **Output:** A bounded package change with dependency, documentation, and test impact stated.
- **Ask only if:** The package API, compatibility promise, or release scope is unclear.
- **Do not do:** Do not publish a package, alter a public API, or add dependencies without explicit authorization.

## Workflow

1. Read `DESCRIPTION`, `NAMESPACE`, existing tests, and contributor/release guidance before editing.
2. Keep exported API intentional; document user-facing functions and validate inputs at boundaries.
3. Add dependencies only when existing base-R or installed-package patterns cannot meet the requirement.
4. Keep examples, roxygen documentation, and tests synchronized with behavior.
5. Run the repository's package checks and report platform or optional-dependency gaps explicitly.
6. Route CRAN-readiness work to `/ce-r-cran` and test design to `/ce-r-package-testing`.

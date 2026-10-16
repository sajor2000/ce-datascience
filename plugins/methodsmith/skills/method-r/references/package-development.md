# R Package Development

R package changes span public API, dependencies, documentation, tests, and release compatibility.

- **Use for:** The target contains `DESCRIPTION`, `NAMESPACE`, `R/`, `man/`, `tests/testthat/`, or the user asks to build an R package.
- **Output:** A bounded package change with dependency, documentation, and test impact stated.
- **Ask only if:** The package API, compatibility promise, or release scope is unclear.
- **Do not do:** Do not publish a package, alter a public API, or add dependencies without explicit authorization.

## Workflow

1. Read `DESCRIPTION`, `NAMESPACE`, existing tests, and contributor/release guidance before editing.
2. Keep exported API intentional; document user-facing functions and validate inputs at boundaries.
3. Add dependencies only when existing base-R or installed-package patterns cannot meet the requirement.
4. Keep examples, roxygen documentation, and tests synchronized with behavior.
5. Run the repository's package checks and report platform or optional-dependency gaps explicitly.
6. For CRAN-readiness work return to the `method-r` routing table and read `references/cran.md`; for test design read `references/package-testing.md`.
7. For package-tool APIs or current guidance, use Ref MCP against the official R, package, or rOpenSci documentation and capture the version consulted. Use Tavily MCP only to locate primary current guidance; do not add an API or dependency from search snippets.

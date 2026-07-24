---
name: ce-r-targets
description: "Design, create, validate, or debug reproducible R targets pipelines using _targets.R, targets, tarchetypes, branching, storage formats, and Quarto/R Markdown integration."
argument-hint: "[new|edit|debug|review]"
---

# R Targets Pipelines

## Skill Value

- **Problem it solves:** Reproducible R pipelines can become stale, non-deterministic, or hide undeclared data and environment dependencies.
- **Use when:** The project has `_targets.R`, uses targets/tarchetypes, or needs a reproducible R analysis pipeline.
- **Output:** A targets design with explicit dependencies, storage choices, invalidation behavior, and validation evidence.
- **Ask only if:** The target graph, data boundary, or intended artifact is unclear.
- **Do not do:** Do not hide external state, write production data, or bypass a failed target with a manual substitute.

## Workflow

1. Map source data, transformations, models, reports, and output artifacts as a declared directed graph before editing `_targets.R`.
2. Keep file paths, package dependencies, random seeds, and environment assumptions explicit and versioned through the project convention.
3. Choose target formats and branching only after confirming object size, parallelism needs, reproducibility constraints, and downstream consumers.
4. Load the `ce-data-qa` skill to validate target inputs; a successful pipeline run does not prove source integrity.
5. Inspect `tar_outdated()` or the project-equivalent invalidation evidence before choosing a narrow target run. Run the narrowest affected target, then the project's normal pipeline/manifest command. Report invalidated targets and unexplained cache behavior.
6. Keep Quarto/R Markdown rendering downstream of validated analysis targets; do not have reports recompute untracked scientific results.
7. Use Ref MCP to confirm the installed `targets` API and its invalidation/storage semantics when a pipeline decision depends on them. Do not use shortcuts that assume upstream targets are current unless that assumption has been verified and reported.

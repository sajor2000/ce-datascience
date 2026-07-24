---
name: ce-r-review
description: "Review R scripts, Quarto/R Markdown analyses, and R package code for correctness, reproducibility, idiomatic practices, data integrity, and statistical-method risks. Use for read-only R code audits."
argument-hint: "[path or scope]"
---

# R Code Review

## Skill Value

- **Problem it solves:** R code can produce plausible output despite recycling, partial matching, implicit coercion, nonstandard evaluation, or reproducibility errors.
- **Use when:** The user requests an R code review, an audit before merge, or an explanation of an R-specific warning or result.
- **Output:** Evidence-backed findings with severity, affected paths, and method or reproducibility implications.
- **Ask only if:** The review target or intended analytical claim is unclear.
- **Do not do:** Do not modify code during a review unless the user separately asks for fixes.

## Review order

1. Inspect the declared data grain, keys, joins, factors, dates, and missing-data handling before style.
2. Flag silent recycling, partial matching, implicit type conversion, non-deterministic sampling, and hidden global state.
3. Check that packages are declared through the project convention and that lockfile/environment evidence supports reproducibility.
4. Validate joins, grouped summaries, and reshape operations with explicit row-count and uniqueness expectations.
5. For causal, event-study, or survival work, route method findings to `/ce-code-review`; classify demonstrated integrity defects as blocking and unresolved design choices as analyst warnings.

## Required review output

- State what was inspected and what could not be executed.
- Separate confirmed defects from recommendations.
- Include a minimal reproducible validation command or a clearly labeled verification gap.

---
name: ce-r-tidyverse
description: "Write, refactor, or review idiomatic tidyverse R for data wrangling, joins, grouping, reshaping, strings, functional iteration, and ggplot2. Use when a task specifically needs dplyr, tidyr, purrr, stringr, or ggplot2 patterns."
argument-hint: "[data-wrangling|joins|plots|refactor]"
---

# Tidyverse Patterns

## Skill Value

- **Problem it solves:** Concise tidyverse code can conceal join expansion, grouping leakage, ordering assumptions, or missing-value behavior.
- **Use when:** The requested R work uses dplyr, tidyr, purrr, stringr, forcats, readr, or ggplot2.
- **Output:** Readable pipeline code with declared inputs, explicit joins/groups, and boundary assertions.
- **Ask only if:** The intended output grain or join cardinality is unknown.
- **Do not do:** Do not use tidyverse convenience syntax to silently drop rows, columns, or missing values.

## Rules

1. Name the expected grain before a pipeline and preserve it through transformations.
2. Declare `by` keys and the expected one-to-one, one-to-many, or many-to-one relationship before accepting a join result. In supported dplyr versions, set `relationship` deliberately; otherwise perform an equivalent preflight uniqueness check.
3. Use explicit `na.rm`, factor levels, time zones, ordering, and grouping changes; do not rely on display defaults.
4. Ungroup deliberately when grouped state would affect downstream calculations.
5. Use vectorized verbs for ordinary transformations; profile first before introducing parallelism or row-wise work.
6. Pair every publication figure with a data/source check and a description of suppressed or missing values.
7. Do not use a natural join, silent dropped rows, or arbitrary first match as a data-repair shortcut. Specify `unmatched`, `na_matches`, and multiple-match handling when they change the analytic population.

## Validation

Use `/ce-data-qa` for join, type, and missingness gates. Add lightweight `stopifnot()` or testthat expectations at critical input/output boundaries rather than fabricating a fallback tibble.

Before relying on dplyr's join arguments, use Ref MCP to check the documentation for the project-pinned version when available. If that evidence is unavailable, use explicit key/row-count assertions and report the version gap.

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
2. Declare join keys and validate one-to-one, one-to-many, or many-to-one expectations before accepting a join result.
3. Use explicit `na.rm`, factor levels, time zones, ordering, and grouping changes; do not rely on display defaults.
4. Ungroup deliberately when grouped state would affect downstream calculations.
5. Use vectorized verbs for ordinary transformations; profile first before introducing parallelism or row-wise work.
6. Pair every publication figure with a data/source check and a description of suppressed or missing values.

## Validation

Use `/ce-data-qa` for join, type, and missingness gates. Add lightweight `stopifnot()` or testthat expectations at critical input/output boundaries rather than fabricating a fallback tibble.

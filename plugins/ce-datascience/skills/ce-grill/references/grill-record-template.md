# Grill Record Template

Save to `docs/brainstorms/<YYYY-MM-DD>-<slug>-grill.md`, with the date resolved at runtime and a short kebab-case slug. Record only aggregates and definitions, never patient-level values.

```markdown
---
type: grill-record
date: <YYYY-MM-DD>
project: <short title>
status: shared-understanding-confirmed
---

# Grill record: <short title>

## Summary
<five lines or fewer: goal, primary hypothesis, data source, primary analysis, target journal>

## Decisions

| # | Branch | Question | Recommended | Chosen | Why it matters |
|---|---|---|---|---|---|
| 1 | Goal | ... | ... | ... | ... |

## Open risks (ranked)

| Rank | Risk | Branch | Likely reviewer objection | Mitigation or next step |
|---|---|---|---|---|

## Reviewer attack list
- <the objection a hostile reviewer raises first, and the planned answer>

## Evidence consulted
- <PMID or DOI, level read (`abstract`, `full_text`, `trial`, ...), the query string, and the date>

## Unverified facts
- <any fact that could not be confirmed, with where to check it>

## Next step
<the next skill and why, e.g. `ce-research-question` to structure the settled hypothesis>
```

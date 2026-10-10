# Origin Document Intake (Phases 0.3 and 0.5)

Load this when Phase 0.2 found a relevant requirements document (unified artifact or legacy `docs/brainstorms/` requirements).

## 0.3 Use the Source Document as Primary Input

1. Read it thoroughly.
2. Announce that it will serve as the origin document for planning.
3. Carry forward:
   - Problem frame
   - Actors (A-IDs), Key Flows (F-IDs), and Acceptance Examples (AE-IDs) when present — constraints that implementation units must honor
   - Requirements and success criteria
   - Scope boundaries (including `Deferred for later` and `Outside this product's identity` subsections when present)
   - Key decisions and rationale
   - Dependencies or assumptions
   - Outstanding questions, preserving whether they are blocking or deferred
4. Use the source document as the primary input to planning and research.
5. Reference important carried-forward decisions with `(see origin: <source-path>)`.
6. Do not silently omit source content — if the origin discussed it, the plan must address it, even briefly. Before finalizing, scan each origin section to verify nothing was dropped.
7. When the source uses `artifact_contract: ce-unified-plan/v1`, preserve its Product Contract verbatim except for explicitly resolved corrections, add the Planning Contract and execution sections to the same file, and retain its path as the canonical plan path.

## 0.5 Classify Outstanding Questions Before Planning

If the origin contains `Resolve Before Planning` or similar blocking questions:

- Review each one.
- Reclassify it as planning-owned work **only if** it is a technical, architectural, or research question.
- Keep it as a blocker if it would change product behavior, scope, or success criteria.

If true product blockers remain, surface them and ask (one blocking question, numbered fallback) whether to:
1. Resume `ce-brainstorm` to resolve them
2. Convert them into explicit assumptions or decisions and continue

Do not continue planning while true blockers remain unresolved.

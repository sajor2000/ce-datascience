# Stage 6: Synthesize and Present

## Contents

- Output formats: report sections, quality gates, format verification
- Headless output format, detail enrichment, and formatting rules

## Output formats

### Report sections

In `mode:agent`, skip markdown and emit the SKILL.md JSON output contract; still apply the Requirements Completeness, Coverage, and Verdict rules below to fill its fields. In `mode:headless`, use the Headless output format below. In all other modes, assemble the final report using **pipe-delimited markdown tables for findings** from `references/review-output-template.md`. The table format is mandatory for finding rows in interactive mode — do not render findings as freeform text blocks or horizontal-rule-separated prose. Other report sections (Applied Fixes, Learnings, Coverage, etc.) use bullet lists and the `---` separator before the verdict, as shown in the template.

1. **Header.** Scope, intent, mode, reviewer team with per-conditional justifications.
2. **Findings.** Rendered as pipe-delimited tables grouped by severity (`### P0 -- Critical`, `### P1 -- High`, `### P2 -- Moderate`, `### P3 -- Low`). Each finding row shows `#`, file, issue, reviewer(s), confidence, and synthesized route. Omit empty severity levels. Never render findings as freeform text blocks or numbered lists.
3. **Requirements Completeness.** Include only when a plan was found in Stage 2b. For each requirement (R1, R2, etc.) and implementation unit in the plan, report whether corresponding work appears in the diff. Use a simple checklist: met / not addressed / partially addressed. Routing depends on `plan_source`:
   - **`explicit`** (caller-provided or PR body): Flag unaddressed requirements as P1 findings with `autofix_class: manual`, `owner: downstream-resolver`. These enter the residual actionable queue.
   - **`inferred`** (auto-discovered): Flag unaddressed requirements as P3 findings with `autofix_class: advisory`, `owner: human`. These stay in the report only — no autonomous follow-up. An inferred plan match is a hint, not a contract.
   Omit this section entirely when no plan was found — do not mention the absence of a plan.
4. **Applied Fixes.** Include only if a fix phase ran in this invocation.
5. **Residual Actionable Work.** Include when unresolved actionable findings were handed off or should be handed off.
6. **Pre-existing.** Separate section, does not count toward verdict.
7. **Learnings & Past Solutions.** Surface ce-learnings-researcher results: if past solutions are relevant, flag them as "Known Pattern" with links to docs/solutions/ files.
8. **Coverage.** Suppressed count by anchor (e.g., "N findings suppressed at anchor 50, M at anchor 25"), mode-aware demotion count (interactive/report-only) or suppression count (headless/autofix), validator drop count and reasons (when Stage 5b ran), validator over-budget drops (when the 15-cap fired), residual risks, testing gaps, failed/timed-out reviewers, and any intent uncertainty carried by non-interactive modes.
9. **Verdict.** Ready to merge / Ready with fixes / Not ready. Fix order if applicable. When an `explicit` plan has unaddressed requirements, the verdict must reflect it — a PR that's code-clean but missing planned requirements is "Not ready" unless the omission is intentional. When an `inferred` plan has unaddressed requirements, note it in the verdict reasoning but do not block on it alone.

Do not include time estimates.

**Format verification:** Before delivering the report, verify the findings sections use pipe-delimited table rows (`| # | File | Issue | ... |`) not freeform text. If you catch yourself rendering findings as prose blocks separated by horizontal rules or bullet points, stop and reformat into tables.

**Quality gates:** Before delivering, verify each finding:

1. **Actionable.** Rewrite any "consider" / "might want to" / "could be improved" finding without a concrete fix into a specific action.
2. **Not skimmed.** The surrounding code was actually read: the "bug" is not handled elsewhere in the same function, the "unused import" is not used in a type annotation, the "missing null check" is not guarded by the caller.
3. **Calibrated.** A style nit is never P0; a SQL injection is never P3. Re-check every severity.
4. **Accurate lines.** Each cited line number matches the file content; a finding pointing to the wrong line is worse than no finding.
5. **Protected artifacts respected.** Discard findings that recommend deleting or gitignoring files in `docs/brainstorms/`, `docs/plans/`, `docs/solutions/`, or `analysis/model-strategy/`.
6. **No linter duplicates.** Do not flag what the project's linter/formatter catches (semicolons, indentation); focus on semantic issues.

### Headless output format

In `mode:headless`, replace the interactive pipe-delimited table report with a structured text envelope. The envelope follows the same structural pattern as document-review's headless output (completion header, metadata block, findings grouped by autofix_class, trailing sections) while using ce-code-review's own section headings and per-finding fields.

```
Code review complete (headless mode).

Scope: <scope-line>
Intent: <intent-summary>
Reviewers: <reviewer-list with conditional justifications>
Verdict: <Ready to merge | Ready with fixes | Not ready>
Artifact: /tmp/ce-datascience/ce-code-review/<run-id>/

Applied N safe_auto fixes.

Gated-auto findings (concrete fix, changes behavior/contracts):

[P1][gated_auto -> downstream-resolver][needs-verification] File: <file:line> -- <title> (<reviewer>, confidence <N>)
  Why: <why_it_matters>
  Suggested fix: <suggested_fix or "none">
  Evidence: <evidence[0]>
  Evidence: <evidence[1]>

Manual findings (actionable, needs handoff):

[P1][manual -> downstream-resolver] File: <file:line> -- <title> (<reviewer>, confidence <N>)
  Why: <why_it_matters>
  Evidence: <evidence[0]>

Advisory findings (report-only):

[P2][advisory -> human] File: <file:line> -- <title> (<reviewer>, confidence <N>)
  Why: <why_it_matters>

Pre-existing issues:
[P2][gated_auto -> downstream-resolver] File: <file:line> -- <title> (<reviewer>, confidence <N>)
  Why: <why_it_matters>

Residual risks:
- <risk>

Learnings & Past Solutions:
- <learning>

Testing gaps:
- <gap>

Coverage:
- Suppressed: <N> findings below anchor 75 (P0 at anchor 50+ retained)
- Mode-aware demotion suppressions: <N> findings suppressed (testing/maintainability advisory P2-P3)
- Validator drops: <N> findings rejected by Stage 5b validator
  - <file:line> -- <reason>
- Validator over-budget drops: <N> findings exceeded the 15-cap and were not validated
- Untracked files excluded: <file1>, <file2>
- Failed reviewers: <reviewer>

Review complete
```

**Detail enrichment (headless only):** The headless envelope includes `Why:`, `Evidence:`, and `Suggested fix:` lines. After merge (Stage 5), read the per-agent artifact files from `/tmp/ce-datascience/ce-code-review/{run_id}/` for only the findings that survived dedup and confidence gating.
   - **Field tiers:** `Why:` and `Evidence:` are detail-tier -- load from per-agent artifact files. `Suggested fix:` is merge-tier -- use it directly from the compact return without artifact lookup.
   - **Artifact matching:** For each surviving finding, look up its detail-tier fields in the artifact files of the contributing reviewers. Match on `file + line_bucket(line, +/-3)` (the same tolerance used in Stage 5 dedup) within each contributing reviewer's artifact. When multiple artifact entries fall within the line bucket, apply `normalize(title)` to both the merged finding's title and each candidate entry's title as a tie-breaker.
   - **Reviewer order:** Try contributing reviewers in the order they appear in the merged finding's reviewer list; use the first match.
   - **No-match fallback:** If no artifact file contains a match (all writes failed, or the finding was synthesized during merge), omit the `Why:` and `Evidence:` lines for that finding and note the gap in Coverage. The `Suggested fix:` line can still be populated from the compact return since it is merge-tier.

**Formatting rules:**
- The `[needs-verification]` marker appears only on findings where `requires_verification: true`.
- The `Artifact:` line gives callers the path to the full run artifact for machine-readable access to the complete findings schema. The text envelope is the primary handoff; the artifact is for debugging and full-fidelity access.
- Findings with `owner: release` appear in the Advisory section (they are operational/rollout items, not code fixes).
- Findings with `pre_existing: true` appear in the Pre-existing section regardless of autofix_class.
- The Verdict appears in the metadata header (deliberately reordered from the interactive format where it appears at the bottom) so programmatic callers get the verdict first.
- Omit any section with zero items.
- If all reviewers fail or time out, emit `Code review degraded (headless mode). Reason: 0 of N reviewers returned results.` followed by "Review complete".
- End with "Review complete" as the terminal signal so callers can detect completion.

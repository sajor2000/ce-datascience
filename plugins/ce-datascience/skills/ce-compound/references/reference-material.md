# Reference material for /ce-compound

Capture spec, output formats, and the compounding philosophy. Linked from SKILL.md. The execution workflow lives in SKILL.md; this file documents the *what* and *why*.

## Table of contents

1. What It Captures.
2. Preconditions.
3. What It Creates (file naming, knowledge-track and bug-track categories).
4. Common Mistakes to Avoid.
5. Success Output (and the alternate "updated existing doc" output).
6. The Compounding Philosophy.

---

## What It Captures

- **Problem symptom**: Exact error messages, observable behavior
- **Investigation steps tried**: What didn't work and why
- **Root cause analysis**: Technical explanation
- **Working solution**: Step-by-step fix with code examples
- **Prevention strategies**: How to avoid in future
- **Cross-references**: Links to related issues and docs

## Preconditions

<preconditions enforcement="advisory">
  <check condition="problem_solved">
    Problem has been solved (not in-progress)
  </check>
  <check condition="solution_verified">
    Solution has been verified working
  </check>
  <check condition="non_trivial">
    Non-trivial problem (not simple typo or obvious error)
  </check>
</preconditions>

## What It Creates

**Organized documentation:**

- File: `docs/solutions/[category]/[filename].md`

**Categories auto-detected from problem:**

Bug track:
- build-errors/
- test-failures/
- runtime-errors/
- performance-issues/
- database-issues/
- security-issues/
- ui-bugs/
- integration-issues/
- logic-errors/

Knowledge track:
- architecture-patterns/ — architectural or structural patterns (pipeline/workflow shape decisions)
- design-patterns/ — reusable non-architectural design approaches (analysis patterns, visualization strategies)
- tooling-decisions/ — language, library, or tool choices with durable rationale
- conventions/ — team-agreed way of doing something, captured so it survives turnover
- workflow-issues/
- developer-experience/
- documentation-gaps/
- best-practices/ — fallback only, use when no narrower knowledge-track value applies
- methods-decisions/ — validated analytical approaches and statistical method selections
- statistical-patterns/ — recurring statistical techniques and their proper application
- data-quality-issues/ — data validation, cleaning strategies, and quality assurance patterns
- reporting-conventions/ — standardized reporting formats and presentation guidelines
- reproducibility-patterns/ — environment pinning, seed management, and result reproducibility

## Common Mistakes to Avoid

| Wrong | Correct |
|----------|-----------|
| Subagents write files like `context-analysis.md`, `solution-draft.md` | Subagents return text data; orchestrator writes one final file |
| Research and assembly run in parallel | Research completes -> then assembly runs |
| Multiple files created during workflow | One solution doc written or updated: `docs/solutions/[category]/[filename].md` (plus an optional small edit to a project instruction file for discoverability) |
| Creating a new doc when an existing doc covers the same problem | Check overlap assessment; update the existing doc when overlap is high |

## Success Output

```
Completed: Documentation complete

Auto memory: 2 relevant entries used as supplementary evidence

Subagent Results:
  Completed: Context Analyzer: Identified methods_decision in sofa_scoring, category: methods-decisions/
  Completed: Solution Extractor: 3 code fixes, prevention strategies
  Completed: Related Docs Finder: 2 related issues
  Completed: Session History: 3 prior sessions on same branch, 2 failed approaches surfaced

Specialized Agent Reviews (Auto-Triggered):
  Completed: ce-kieran-python-reviewer: Code examples meet Python best practices
  Completed: ce-code-simplicity-reviewer: Solution is appropriately minimal

File created:
- docs/solutions/methods-decisions/chi-square-vs-fisher-exact-test-selection.md

This documentation will be searchable for future reference when similar
issues occur in the SOFA Scoring or Sepsis Analysis modules.

What's next?
1. Continue workflow (recommended)
2. Link related documentation
3. Update other references
4. View documentation
5. Other
```

**After displaying the success output, present the "What's next?" options using the platform's blocking question tool:** `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini, `ask_user` in Pi (requires the `pi-ask-user` extension). Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors (e.g., Codex edit modes) — not because a schema load is required. Never silently skip the question. Do not continue the workflow or end the turn without the user's selection.

**Alternate output (when updating an existing doc due to high overlap):**

```
Completed: Documentation updated (existing doc refreshed with current context)

Overlap detected: docs/solutions/methods-decisions/chi-square-test-selection.md
  Matched dimensions: problem statement, root cause, solution, referenced files
  Action: Updated existing doc with fresher code examples and prevention tips

File updated:
- docs/solutions/methods-decisions/chi-square-test-selection.md (added last_updated: 2026-03-24)
```

## The Compounding Philosophy

This creates a compounding knowledge system:

1. First time you solve "wrong statistical test for small sample size" -> Research (30 min)
2. Document the solution -> docs/solutions/methods-decisions/fisher-exact-small-samples.md (5 min)
3. Next time similar issue occurs -> Quick lookup (2 min)
4. Knowledge compounds -> Team gets smarter

The feedback loop:

```
Explore -> Analyze -> Find Issue -> Research -> Improve -> Document -> Validate -> Deploy
    ^                                                                              |
    +------------------------------------------------------------------------------+
```


# Routing Question

## Routing question (the entry point)

After `safe_auto` fixes apply and synthesis produces the remaining finding set, the orchestrator asks a four-option routing question before any walk-through or bulk action runs.

Use the current harness's blocking question UI. Fall back to presenting the options as a numbered list only when the harness genuinely lacks a blocking question UI, the call explicitly fails, or the runtime mode does not expose it. Never silently skip the question. Rendering the routing question as narrative text without the numbered-list fallback is a bug.

**Stem:** `What should the agent do with the remaining N findings?`

**Options (fixed order; no option is labeled `(recommended)` — the routing choice is user-intent):**

```
A. Review each finding one by one — accept the recommendation or choose another action
B. Auto-resolve with best judgment — apply per-finding edits the agent can defend, surface the rest
C. Append findings to the doc's Open Questions section and proceed
D. Report only — take no further action
```

The per-finding `(recommended)` labeling lives inside the walk-through (option A) and the bulk preview (options B/C), where it's applied per-finding from synthesis step 3.5b's `recommended_action`. The routing question itself does not recommend one of A/B/C/D because the right route depends on user intent (engage / trust / triage / skim), not on the finding-set shape — a rule that mapped finding-set shape to routing recommendation (e.g., "most findings are Apply-shaped → recommend best-judgment") would pressure users toward automated paths in ways that conflict with the user-intent framing.

If all remaining findings are FYI-subsection-only (no `gated_auto` or `manual` findings at confidence anchor `75` or `100`), skip the routing question entirely and flow to the Phase 5 terminal question.

**Append-availability adaptation.** When `references/open-questions-defer.md` has cached `append_available: false` at Phase 4 start (e.g., read-only document, unwritable filesystem), option C is suppressed from the routing question because every per-finding Defer would fail into the open-questions failure path. The menu shows three options (A / B / D) and the stem appends one line explaining why (e.g., `Append to Open Questions unavailable — document is read-only in this environment.`). This mirrors the per-finding option B suppression described under "Adaptations" in `references/walkthrough.md` — both routing-level and per-finding Defer paths share the same availability signal so the user never sees Defer surfaced at one level and omitted at the other.

**Dispatch by selection:**

- **A** — load the walk-through in `references/walkthrough.md` (per-finding loop). Apply decisions accumulate in memory; Open-Questions defers execute inline via `references/open-questions-defer.md`; Skip decisions are recorded as no-action; `Auto-resolve with best judgment on the rest` routes through `references/bulk-preview.md`.
- **B** — load `references/bulk-preview.md` scoped to every pending `gated_auto` / `manual` finding. On Proceed, execute the plan: Apply → end-of-batch document edit; Open-Questions defers → `references/open-questions-defer.md`; Skip → no-op. On Cancel, return to the routing question.
- **C** — load `references/bulk-preview.md` with every pending finding in the Open-Questions bucket (regardless of the agent's natural recommendation). On Proceed, route every finding through `references/open-questions-defer.md`; no document edits apply. On Cancel, return to the routing question.
- **D** — do not enter any dispatch phase. Emit the completion report and flow to Phase 5 terminal question.

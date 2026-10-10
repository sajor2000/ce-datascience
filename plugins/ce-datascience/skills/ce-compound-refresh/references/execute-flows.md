# Phase 4: Keep, Update, Consolidate, and Delete Flows

Read in Phase 4 before executing Keep, Update, Consolidate, or Delete actions. The Replace Flow lives in SKILL.md.

## Keep Flow

No file edit by default. Summarize why the learning remains trustworthy.

## Update Flow

Apply in-place edits only when the solution is still substantively correct.

Valid in-place updates:

- Rename an `R/derive_index_date.R` reference to `R/cohort/index_date.R`
- Update `module: cohort_builder` to `module: cohort`
- Fix outdated links to related docs
- Refresh implementation notes after a directory move

Not in-place updates:

- Fixing a typo with no effect on understanding, rewording prose for style alone, or small cleanup that does not materially improve accuracy or usability (leave these alone)
- The old fix is now an anti-pattern, the architecture changed enough that the old guidance is misleading, or the troubleshooting path is materially different (these require **Replace**)

## Consolidate Flow

The orchestrator handles consolidation directly (no subagent — the docs are already read and the merge is a focused edit). Process candidates by topic cluster from Phase 1.75:

1. **Confirm the canonical doc** — the broader, more current, more accurate doc in the cluster.
2. **Extract unique content** from the subsumed doc(s) — edge cases, additional prevention rules, alternative debugging approaches the canonical doc lacks.
3. **Merge unique content** into the canonical doc where it logically belongs, not appended. Inline small content; add a clearly labeled section for a substantial sub-topic.
4. **Update cross-references** — repoint any docs that reference the subsumed doc to the canonical doc.
5. **Delete the subsumed doc.** Do not archive it or add redirect metadata. Git history preserves it.

For a cluster of 3+ overlapping docs, process pairwise: consolidate the two most overlapping docs first, then evaluate whether the merged result should absorb the next.

**Splitting:** Consolidate also covers the reverse case. If one doc covers multiple distinct problems that would benefit from separate retrieval, recommend splitting it — only when the sub-topics are genuinely independent and a maintainer might search for one without the other.

## Delete Flow

Delete only when a learning is clearly obsolete, redundant (no unique content to merge), or its problem domain is gone — and only after the inbound-citation check (re-run immediately before removal; clean decorative citations in the same change; a substantive citation means Replace or narrowed Keep). Age alone is never a signal. Do not archive; git history preserves deleted files.

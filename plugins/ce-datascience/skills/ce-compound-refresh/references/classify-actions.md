# Phase 2: Classify the Right Maintenance Action

Detail for `ce-compound-refresh` § "Phase 2: Classify the Right Maintenance Action". Linked from SKILL.md. Holds the decision criteria for each of the five outcomes, the Replace evidence-sufficiency test, the problem-domain check before Delete, and how the outcomes apply to pattern docs.

## Contents

- Keep
- Update
- Consolidate
- Replace (evidence assessment)
- Delete (and the problem-domain check before deleting)
- Pattern Guidance

---

After gathering evidence, assign one recommended action per artifact.

### Keep

The learning is still accurate and useful. Do not edit the file — report that it was reviewed and remains trustworthy. Only add `last_updated` if already making a meaningful update for another reason.

### Update

The core solution is still valid but references have drifted (paths, function or module names, links, code snippets, metadata). Apply the fixes directly.

### Consolidate

Choose **Consolidate** when Phase 1.75 identified docs that overlap heavily but are both materially correct. This differs from Update (which fixes drift in a single doc) and Replace (which rewrites misleading guidance). Consolidate handles the "both right, one subsumes the other" case.

**When to consolidate:**

- Two docs describe the same problem and recommend the same (or compatible) solution
- One doc is a narrow precursor and a newer doc covers the same ground more broadly
- The unique content from the subsumed doc can fit as a section or addendum in the canonical doc
- Keeping both creates drift risk without meaningful retrieval benefit

**When NOT to consolidate** (apply the Retrieval-Value Test from Phase 1.75):

- The docs cover genuinely different sub-problems that someone would search for independently
- Merging would create an unwieldy doc that harms navigation more than drift risk harms accuracy

**Consolidate vs Delete:** If the subsumed doc has unique content worth preserving (edge cases, alternative approaches, extra prevention rules), use Consolidate to merge that content first. If the subsumed doc adds nothing the canonical doc doesn't already say, skip straight to Delete.

The Consolidate action is: merge unique content from the subsumed doc into the canonical doc, then delete the subsumed doc. Not archive — delete. Git history preserves it.

### Replace

Choose **Replace** when the learning's core guidance is now misleading — the recommended fix changed materially, the root cause or architecture shifted, or the preferred pattern is different.

The user may have invoked the refresh months after the original learning was written. Do not ask them for replacement context they are unlikely to have — investigate the codebase and synthesize the replacement.

**Evidence assessment.** By the time a Replace candidate is identified, Phase 1 has already gathered the old learning's claims, what the current code actually does, and where the drift occurred. Assess whether that evidence is sufficient to write a trustworthy replacement:

- **Sufficient evidence** — both what the old learning recommended AND what the current approach is are understood: the current code patterns, the new file locations, the changed architecture. -> Proceed to the Replace Flow in SKILL.md Phase 4.
- **Insufficient evidence** — the drift is so fundamental that the current approach cannot be documented confidently (the entire subsystem was replaced, or the new architecture is too complex to understand from a file scan alone). -> Mark as stale in place:
   - Add `status: stale`, `stale_reason: [what you found]`, `stale_date: YYYY-MM-DD` to the frontmatter
   - Report what evidence was found and what is missing
   - Recommend the user load the `ce-compound` skill after their next encounter with that area, when they have fresh problem-solving context

### Delete

Choose **Delete** when:

- The code or workflow no longer exists and the problem domain is gone
- The learning is obsolete and has no modern replacement worth documenting
- The learning is fully redundant with another doc (use Consolidate if there is unique content to merge first)
- There is no meaningful successor evidence suggesting it should be replaced instead

Action: delete the file. No archival directory, no metadata — just delete it. Git history preserves every deleted file if recovery is ever needed. The inbound-citation check from Core Rule 8 still applies before removal.

#### Before deleting: check if the problem domain is still active

Missing referenced files are strong evidence — but only that the **implementation** is gone. Before deleting, reason about whether the **problem the learning solves** is still a concern in the codebase:

- A learning about deriving a cohort's index date where `derive_index_date.R` is gone — does the pipeline still define index dates? If so, the concept persists under a new implementation. That is Replace, not Delete.
- A learning about a deprecated data-extract endpoint where the entire feed was retired — the problem domain is gone. That is Delete.

Do not search mechanically for keywords from the old learning. Understand what problem the learning addresses, then investigate where that problem lives now, not where the old code used to be.

**Auto-delete only when both the implementation AND the problem domain are gone:**

- the referenced code is gone AND the project no longer deals with that problem domain
- the learning is fully superseded by a clearly better successor AND the old doc adds no distinct value
- the document is plainly redundant and adds nothing the canonical doc doesn't already say

If the implementation is gone but the problem domain persists (the project still links cohorts, still applies small-cell suppression, still fits the model family), classify as **Replace** — the problem still matters and the current approach should be documented.

Do not keep a learning just because its general advice is "still sound" — if the specific code it references is gone, the learning misleads readers. But do not delete a learning whose problem domain is still active — that knowledge gap should be filled with a replacement.

### Pattern Guidance

Apply the same five outcomes to pattern docs, but evaluate them as **derived guidance** rather than incident-level learnings:

- **Keep**: the underlying learnings still support the generalized rule and examples remain representative
- **Update**: the rule holds but examples, links, scope, or supporting references drifted
- **Consolidate**: two pattern docs generalize the same set of learnings or cover the same design concern — merge into one canonical pattern
- **Replace**: the generalized rule is now misleading, or the underlying learnings support a different synthesis. Base the replacement on the refreshed learning set — do not invent new rules from guesswork
- **Delete**: the pattern is no longer valid, no longer recurring, or fully subsumed by a stronger pattern doc with no unique content remaining

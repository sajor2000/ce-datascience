# Phase 1.75: Document-Set Analysis

Detail for /ce-compound-refresh § "Phase 1.75: Document-Set Analysis". Linked from SKILL.md. Covers overlap detection, supersession signals, canonical-doc identification, the retrieval-value test, and the cross-doc conflict check applied after individual-doc investigation.

## Table of contents

1. Overlap detection (5 dimensions: problem statement, solution shape, referenced files, prevention rules, root cause).
2. Supersession signals (older narrow precursor vs newer canonical).
3. Canonical-doc identification (Distinct / Subsumed / Redundant).
4. Retrieval-value test (when separate docs earn their keep).
5. Cross-doc conflict check.

---


After investigating individual docs, step back and evaluate the document set as a whole. The goal is to catch problems that only become visible when comparing docs to each other — not just to reality.

### Overlap Detection

For docs that share the same module, component, tags, or problem domain, compare them across these dimensions:

- **Problem statement** — do they describe the same underlying problem?
- **Solution shape** — do they recommend the same approach, even if worded differently?
- **Referenced files** — do they point to the same code paths?
- **Prevention rules** — do they repeat the same prevention bullets?
- **Root cause** — do they identify the same root cause?

High overlap across 3+ dimensions is a strong Consolidate signal. The question to ask: "Would a future maintainer need to read both docs to get the current truth, or is one mostly repeating the other?"

### Supersession Signals

Detect "older narrow precursor, newer canonical doc" patterns:

- A newer doc covers the same files, same workflow, and broader runtime behavior than an older doc
- An older doc describes a specific incident that a newer doc generalizes into a pattern
- Two docs recommend the same fix but the newer one has better context, examples, or scope

When a newer doc clearly subsumes an older one, the older doc is a consolidation candidate — its unique content (if any) should be merged into the newer doc, and the older doc should be deleted.

### Canonical Doc Identification

For each topic cluster (docs sharing a problem domain), identify which doc is the **canonical source of truth**:

- Usually the most recent, broadest, most accurate doc in the cluster
- The one a maintainer should find first when searching for this topic
- The one that other docs should point to, not duplicate

All other docs in the cluster are either:
- **Distinct** — they cover a meaningfully different sub-problem and have independent retrieval value. Keep them separate.
- **Subsumed** — their unique content fits as a section in the canonical doc. Consolidate.
- **Redundant** — they add nothing the canonical doc doesn't already say. Delete.

### Retrieval-Value Test

Before recommending that two docs stay separate, apply this test: "If a maintainer searched for this topic six months from now, would having these as separate docs improve discoverability, or just create drift risk?"

Separate docs earn their keep only when:
- They cover genuinely different sub-problems that someone might search for independently
- They target different audiences or contexts (e.g., one is about debugging, another about prevention)
- Merging them would create an unwieldy doc that is harder to navigate than two focused ones

If none of these apply, prefer consolidation. Two docs covering the same ground will eventually drift apart and contradict each other — that is worse than a slightly longer single doc.

### Cross-Doc Conflict Check

Look for outright contradictions between docs in scope:
- Doc A says "always use approach X" while Doc B says "avoid approach X"
- Doc A references a file path that Doc B says was deprecated
- Doc A and Doc B describe different root causes for what appears to be the same problem

Contradictions between docs are more urgent than individual staleness — they actively confuse readers. Flag these for immediate resolution, either through Consolidate (if one is right and the other is a stale version of the same truth) or through targeted Update/Replace.


---
name: ce-revise
description: 'Open a revision round in response to peer review or regulator feedback. Builds a structured response-to-reviewers document with one item per reviewer query, links each item to the analysis change (or to the rebuttal text justifying no change), validates that pre-specified primary endpoints are not silently re-run, and freezes a new submission round when the response is complete.'
argument-hint: "[prior submission tag, e.g. NEJM-2026-04]"
---

# Revision Round

A revision round translates reviewer or regulator feedback into one of three outcomes per query: (a) accept and modify the analysis (with SAP amendment if needed), (b) accept and modify the manuscript only (no analysis change), (c) defend with a rebuttal (no change). This skill keeps the bookkeeping honest -- every query gets a status, every analysis change is paired with an amendment log entry, and the round closes with a fresh submission freeze.

## When This Skill Activates

- Peer-review feedback received from a journal
- Regulator query (FDA Information Request, NIH study-section comments)
- Internal scientific review (department / IRB / steering committee)

## Prerequisites

- A prior submission tag exists (`submissions/<prior-tag>/manifest.yaml` is present)
- The reviewer feedback is in a known location (PDF, email, manuscript editor link, or `revisions/<round>/queries.md`)
- The user has decided on a target round name (e.g., `<prior>-r1`, `<prior>-r2`)

## Core Workflow

### Step 1: Resolve the round

Argument is the prior submission tag (e.g., `NEJM-2026-04`). The new round inherits the prior tag and appends `-r<N>`. If `submissions/<prior>-r1` exists, this is `-r2`, etc.

Read `submissions/<prior-tag>/manifest.yaml` to recover the SAP version, data wave, and commit baseline.

### Step 2: Parse reviewer queries

Open the reviewer queries file. If it's a PDF, ask the user to paste the queries into `revisions/<round>/queries.md` first (one heading per reviewer, one numbered item per query).

Build a tracker file `revisions/<round>/tracker.yaml`:

```yaml
round: <round>
prior_tag: <prior>
queries:
  - id: R1.Q1
    reviewer: "Reviewer 1"
    query: "<verbatim query text>"
    status: open  # open | analysis-change | manuscript-only | rebuttal | wontfix
    sap_amendment: null  # SAP-N.M if applicable
    code_change: null    # commit sha or PR number
    response_text: null  # path to response paragraph
  - id: R1.Q2
    ...
```

### Step 3: Per-query workflow

For each query, the user picks a status. The skill enforces:

**`analysis-change`**: requires
- a SAP amendment via `sap_amend` MCP tool with `reason` referencing the query id (e.g., `Reason: "Reviewer 1, query 2 (R1.Q2): adjust for hospital cluster"`)
- a code change committed on a branch named `revision/<round>/<query-id>`
- the `ce-sap-amendment-reviewer` clears the change with no blocking findings
- a paragraph of response text in `revisions/<round>/responses/<query-id>.md`

**`manuscript-only`**: requires
- a manuscript edit (no analysis re-run, no SAP amendment)
- a paragraph of response text

**`rebuttal`**: requires
- a paragraph of response text justifying why the query does not warrant change
- citation to the original SAP section that pre-specified the disputed choice
- no SAP amendment, no analysis re-run

**`wontfix`**: an explicit reviewer-rejection (rare); requires PI sign-off in the tracker

### Step 4: Sanity checks before freezing the round

Before closing the round, the skill verifies:

- Every query has a non-`open` status
- Every `analysis-change` is paired with a SAP amendment whose timestamp is AFTER the prior submission tag's frozen_at AND before the round's freeze
- No `analysis-change` modifies a primary endpoint without an explicit query that asked for it (block silent re-runs of primary analyses)
- The data wave is still locked at the same hash; if a re-extract was needed, a new wave is registered and locked, and the change is documented in the tracker
- All response text files exist and are referenced from the tracker

If any check fails, list each failing query and stop without freezing.

### Step 5: Build the response-to-reviewers document

Render `revisions/<round>/response-to-reviewers.md`:

```
# Response to reviewers -- <round>

## Reviewer 1

### R1.Q1: <verbatim query>

**Status**: <status>

<response paragraph>

(Analysis change: <SAP amendment id>, commit <sha>; see <link>.)

### R1.Q2: ...

## Reviewer 2

...

## Editor

...
```

Render to PDF / docx as the journal requires (Quarto preferred).

### Step 6: Freeze the new round

Invoke `/ce-freeze` with `<prior>-r<N>` as the tag. The freeze inherits all of `ce-freeze`'s prerequisite checks. The round-specific manifest extension (`review_state`) is populated from the tracker:

```yaml
review_state:
  reviewer_count: 2
  prior_round_tag: NEJM-2026-04
  reviewer_queries:
    - revisions/r1/queries.md
    - revisions/r1/tracker.yaml
    - revisions/r1/response-to-reviewers.md
```

### Step 7: Print summary

```
Round <round> sealed.

Queries: <N>
  analysis-change:  <count>
  manuscript-only:  <count>
  rebuttal:         <count>
  wontfix:          <count>

SAP amendments this round: <count>
Code changes this round:    <count>

Submission archive: submissions/<round>/
Response document:  revisions/<round>/response-to-reviewers.md

Next: submit response-to-reviewers + revised manuscript via journal portal.
After acceptance, run /ce-freeze <round>-final to record the final tag.
```

## Pipeline mode

In `mode:headless`, the skill validates the tracker and prints a JSON status report; it does not perform the freeze. The orchestrator calls `/ce-freeze` separately.

## What This Skill Does NOT Do

- **It does not generate the rebuttal text.** Scientific defense is a human job.
- **It does not run the new analyses.** Use `/ce-work` per branch; this skill validates the linkage.
- **It does not edit the manuscript.** Authors own the prose.
- **It does not submit the response.** The user owns the journal-portal upload.

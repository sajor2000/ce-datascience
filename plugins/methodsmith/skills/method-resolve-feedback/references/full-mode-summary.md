# Full Mode Step 10: Summary

Read this from step 10 of `references/full-mode.md`.

## 10. Summary

Present a concise summary of all work done. Group by verdict, one line per item describing *what was done* not just *where*. This is the primary output the user sees.

Format:

```
Resolved N of M new items on PR #NUMBER:

Fixed (count): [brief description of each fix]
Fixed differently (count): [what was changed and why the approach differed]
Replied (count): [what questions were answered]
Not addressing (count): [what was skipped and why]
Declined (count): [what was declined and the harm cited]

Validation: [one line -- e.g., "bun test passed (893/893)" or "bun test passed with pre-existing failure in X noted"; omit when no code changes were committed]
```

If any clusters were investigated, append a cluster investigation section:

```
Cluster investigations (count):

1. [theme] in [area]: [cluster_assessment from the agent --
   what was found, whether a holistic or individual approach was taken]
```

If any agent returned `needs-human`, append a decisions section. These are rare but high-signal. Each `needs-human` agent returns a `decision_context` field with a structured analysis: what the reviewer said, what the agent investigated, why it needs a decision, concrete options with tradeoffs, and the agent's lean if it has one.

Present the `decision_context` directly -- it's already structured for the user to read and decide quickly:

```
Needs your input (count):

1. [decision_context from the agent -- includes quoted feedback,
   investigation findings, why it needs a decision, options with
   tradeoffs, and the agent's recommendation if any]
```

The `needs-human` threads already have a natural-sounding acknowledgment reply posted and remain open on the PR.

If there are **pending decisions from a previous run** (threads detected in step 2 as already responded to but still unresolved), surface them after the new work:

```
Still pending from a previous run (count):

1. [Thread path:line] -- [brief description of what's pending]
   Previous reply: [link to the existing reply]
   [Re-present the decision options if the original context is available,
   or summarize what was asked]
```

If a blocking question tool is available, use it to ask about all pending decisions (both new `needs-human` and previous-run pending) in one pass, one decision at a time. If there are only pending decisions and no new work was done, the summary is just the pending items.

Use the current harness's blocking question UI to present the decisions, one decision-changing question at a time with at most 4 options, and wait for the user's response. After they decide, process the remaining items: fix the code, compose the reply, post it, and resolve the thread.

Fall back to presenting the decisions as numbered choices in the summary output and waiting in conversation only when no blocking question UI exists in the harness or the call errors. Never silently skip. If the user doesn't respond, the items remain open on the PR for later handling.

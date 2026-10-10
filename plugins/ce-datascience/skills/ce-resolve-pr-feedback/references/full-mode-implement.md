# Full Mode Step 5: Implement

Read this from step 5 of `references/full-mode.md`. Return to step 6 there when every dispatched agent has returned.

## 5. Implement (PARALLEL)

Process all three feedback types. Review threads are the primary type; PR comments and review bodies are secondary but should not be ignored.

### Dispatch boundary for previously-resolved threads

Previously-resolved threads (from `cross_invocation.resolved_threads`) participate in clustering and appear in cluster briefs as `<prior-resolutions>` context. They are NEVER individually dispatched — they were already resolved in prior rounds. Only new threads get individual or cluster dispatch.

### Individual dispatch (default)

**For review threads** (`review_threads`): Spawn a `ce-pr-comment-resolver` agent for each new thread that is NOT already assigned to a cluster from step 3. Clustered threads are handled by cluster dispatch below -- do not dispatch them individually.

Each agent receives:
- The thread ID
- The file path and location fields: `line`, `originalLine`, `startLine`, `originalStartLine` (any can be null; outdated and file-level threads often have `line == null` and must fall back to `originalLine`)
- The full comment text (all comments in the thread)
- The PR number (for context)
- The feedback type (`review_thread`)
- The `isOutdated` flag from the thread node (tells the agent the reported line may have drifted)

**For PR comments and review bodies** (`pr_comments`, `review_bodies`): These lack file/line context. Spawn a `ce-pr-comment-resolver` agent for each actionable non-clustered item. The agent receives the comment ID, body text, PR number, and feedback type (`pr_comment` or `review_body`). The agent must identify the relevant files from the comment text and the PR diff.

### Cluster dispatch

For each cluster identified in step 3, dispatch ONE `ce-pr-comment-resolver` agent that receives:
- The `<cluster-brief>` XML block
- All thread details for threads in the cluster (IDs, file paths, line numbers, comment text)
- The PR number
- The feedback types

The cluster agent reads the broader area before making targeted fixes. It returns one summary per thread it handled (same structure as individual agents), plus a `cluster_assessment` field describing what broader investigation revealed and whether a holistic or individual approach was taken.

### Agent return format

Each agent returns a short summary:
- **verdict**: `fixed`, `fixed-differently`, `replied`, `not-addressing`, `declined`, or `needs-human`
- **feedback_id**: the thread ID or comment ID it handled
- **feedback_type**: `review_thread`, `pr_comment`, or `review_body`
- **reply_text**: the markdown reply to post (quoting the relevant part of the original feedback)
- **files_changed**: list of files modified (empty if replied/not-addressing)
- **reason**: brief explanation of what was done or why it was skipped

Cluster agents additionally return:
- **cluster_assessment**: what the broader investigation found, whether a holistic or individual approach was taken

Verdict meanings:
- `fixed` -- code change made as requested
- `fixed-differently` -- code change made, but with a better approach than suggested
- `replied` -- no code change needed; answered a question, acknowledged feedback, or explained a design decision
- `not-addressing` -- feedback is factually wrong about the code; skip with evidence
- `declined` -- observation may be valid, but implementing the suggested fix would actively make the code worse; reply cites the specific harm
- `needs-human` -- cannot determine the right action; needs user decision

### Batching and conflict avoidance

**Batching**: Clusters count as 1 dispatch unit regardless of how many threads they contain. If there are 1-4 dispatch units total (clusters + individual items), dispatch all in parallel. For 5+ dispatch units, batch in groups of 4.

**Conflict avoidance**: No two dispatch units that touch the same file should run in parallel. Before dispatching, check for file overlaps across all dispatch units (clusters and individual items). If a cluster's file list overlaps with an individual item's file, or with another cluster's files, serialize those units -- dispatch one, wait for it to complete, then dispatch the next. Non-overlapping units can still run in parallel. Within a single dispatch unit handling multiple threads on the same file, the agent addresses them sequentially.

**Sequential fallback**: Platforms that do not support parallel dispatch should run agents sequentially. Dispatch cluster units first (they are higher-leverage), then individual items.

Fixes can occasionally expand beyond their referenced file (e.g., renaming a method updates callers elsewhere). This is rare but can cause parallel agents to collide. Step 6 (combined validation) catches test breakage; step 9 (verify) catches unresolved threads. If either surfaces inconsistent changes from parallel fixes, re-run the affected agents sequentially.

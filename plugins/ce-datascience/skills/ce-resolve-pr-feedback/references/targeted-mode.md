# Targeted Mode

Read this reference when Mode Detection (in SKILL.md) routes to **Targeted Mode** — a specific comment or thread URL was provided. Targeted mode addresses only that thread.

## 1. Extract Thread Context

Parse the URL to extract OWNER, REPO, PR number, and comment REST ID:
```
https://github.com/OWNER/REPO/pull/NUMBER#discussion_rCOMMENT_ID
```

**Step 1** -- Get comment details and GraphQL node ID via REST (cheap, single comment):
```bash
gh api repos/OWNER/REPO/pulls/comments/COMMENT_ID \
  --jq '{node_id, path, line, body}'
```

**Step 2** -- Map comment to its thread ID. Use `scripts/get-thread-for-comment`:
```bash
SKILL_DIR="<absolute path of the directory containing this skill's SKILL.md>";
bash "$SKILL_DIR/scripts/get-thread-for-comment" PR_NUMBER COMMENT_NODE_ID [OWNER/REPO]
```

This returns the matching thread with full comment details, its authoritative GraphQL thread `id` (for resolve), and `root_comment_id` (the numeric REST ID of the thread's first comment, for the reply).

**Step 3** -- Check for your own unsubmitted review before doing any work. A reply posted while you hold one can be absorbed into that draft: the call returns a comment ID and URL as if it succeeded, but the reviewer sees nothing until the draft is submitted. PENDING reviews are visible only to their author, so any hit is yours:
```bash
gh api --paginate repos/OWNER/REPO/pulls/PR_NUMBER/reviews --jq '.[] | select(.state == "PENDING") | .id'
```
`--paginate` is required because the endpoint pages chronologically and a draft can sort past page 1. If this prints anything, stop. Tell the user they have an unsubmitted review on the PR and that it must be submitted or discarded before this skill can reply. Do not submit or discard it yourself; a draft review is unsent human writing.

## 2. Fix, Reply, Resolve

First check whether the thread already has a visible submitted reply that records a completed fix or answer while still open (`resolution-pending`, as defined in Full Mode step 2). If so, skip the resolver, validation, and commit, and complete only the missing resolution through Full Mode step 8 without posting again.

Spawn a single `ce-pr-comment-resolver` agent for the thread. Pass the same fields full mode does, including `isOutdated` and the location fields (`line`, `originalLine`, `startLine`, `originalStartLine`) -- targeted threads can be outdated too and need the same relocation handling. Then follow the same validate -> commit -> push -> reply -> resolve flow as Full Mode steps 6-8 (in `references/full-mode.md`), including step 8's REST reply from a heredoc body file, stored-body read-back, and pending-review re-check before resolving.

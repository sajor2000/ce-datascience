# Full Mode

Read this reference when Mode Detection (in SKILL.md) routes to **Full Mode** — no argument given, or a PR number was provided. Full mode processes all unresolved feedback on the PR: inline review threads, review submission bodies, and top-level PR comments.

## Contents

- 1. Fetch Unresolved Threads (includes the pending-review stop)
- 2. Triage: Separate New from Pending
- 3. Cross-Invocation Cluster Analysis (Gated)
- 4. Plan
- 5. Implement (PARALLEL) (in `references/full-mode-implement.md`)
- 6. Validate Combined State
- 7. Commit and Push
- 8. Reply and Resolve (REST reply from a body file, read-back, pending recheck, resolve)
- 9. Verify
- 10. Summary (in `references/full-mode-summary.md`)

## 1. Fetch Unresolved Threads

If no PR number was provided, detect from the current branch:
```bash
gh pr view --json number -q .number
```

Then fetch all feedback using `scripts/get-pr-comments`:

```bash
SKILL_DIR="<absolute path of the directory containing this skill's SKILL.md>";
bash "$SKILL_DIR/scripts/get-pr-comments" PR_NUMBER
```

Returns a JSON object with these keys:

| Key | Contents | Has file/line? | Resolvable? |
|-----|----------|---------------|-------------|
| `pending_review` | Node ID of your own unsubmitted (PENDING) review on this PR, or `null` | n/a | n/a |
| `review_threads` | Unresolved inline code review threads (includes outdated; each node carries its `isOutdated` flag so the resolver can account for line drift). Each wrapper carries `root_comment_id`, the numeric REST ID of the thread's first comment, used for the reply; the node `id` is the GraphQL thread ID used for resolution | Yes | Yes (GraphQL) |
| `pr_comments` | Top-level PR conversation comments with non-blank bodies | No | No |
| `review_bodies` | Review submission bodies with non-blank text | No | No |
| `pr_author` / `viewer` | The PR author's login and the acting account's login, for judging identity in step 2 | n/a | n/a |
| `cross_invocation` | `signal` plus the last 10 `resolved_threads`, input to step 3 | n/a | n/a |

**All three feedback surfaces are in scope.** `review_threads`, `pr_comments`, and `review_bodies` are judged the same way; only the reply and resolve mechanics differ (step 8). The fetch excludes nothing by identity. A top-level comment from the PR author is the ordinary way a human asks for a change on an agent-opened PR, so it is feedback like any other.

**Stop here if `pending_review` is non-null.** A thread reply posted while you hold an unsubmitted review can be absorbed into that draft: the call returns a comment ID and URL as if it succeeded, but the reviewer sees nothing until the draft is submitted. Do not proceed into steps 2-9. Tell the user they have an unsubmitted review on the PR and that it must be submitted or discarded before this skill can reply, then stop. Do not submit or discard it yourself; a draft review is unsent human writing.

If the script fails, fall back to:
```bash
gh pr view PR_NUMBER --json reviews,comments
gh api repos/{owner}/{repo}/pulls/PR_NUMBER/comments
```

## 2. Triage: Separate New from Pending

Before processing, classify each piece of feedback as **new** or **already handled**.

**Review threads**: A handled thread is complete only when it has both a visible, submitted substantive reply and authoritative thread resolution. Check the two conditions independently:

- A reply that explicitly defers a human choice (e.g., "need to align on this", "going to think through this", or options without a decision) is a **pending decision**. Keep the thread open and do not re-process it.
- A reply that records a completed fix or answer while the thread is still open (for example, an earlier run stopped on a pending review after posting) is **resolution-pending**. Do not repost the reply or reapply the fix; carry the existing reply to step 8 and complete only the missing resolution.
- A thread with neither kind of substantive response is **new**.

**PR comments and review bodies**: These have no resolve mechanism, so they reappear on every run. Apply two filters in order:

1. **Actionability**: An item is actionable when it is someone's open request to this PR -- something to fix, answer, or decide. Who posted it never decides this, including the PR author (`pr_author`). A reply posted by this skill in an earlier run (typically authored by `viewer`) is a record of handling, not a request, so drop it here; re-reading its own write-up as fresh feedback would keep the loop from settling. Skip items that contain no actionable feedback or questions to answer. Examples: review wrapper text ("Here are some automated review suggestions..."), approvals ("this looks great!"), status badges ("Validated"), CI summaries with no follow-up asks. If there's nothing to fix, answer, or decide, it's not actionable -- drop it from the count entirely.
2. **Already replied**: For actionable items, check the PR conversation for an existing reply that quotes and addresses the feedback. If a reply already exists, skip. If not, it's new.

The distinction is about content, not who posted what. A deferral from a teammate, a previous skill run, or a manual reply all count. Similarly, actionability is about content -- bot feedback that requests a specific code change is actionable; a bot's boilerplate header wrapping those requests is not.

**Silent drop.** Non-actionable items are dropped without narration. Do not announce, list, or count dropped items in conversation, the task list, or the step 10 summary. Review-bot wrappers from CodeRabbit, Codex, Gemini Code Assist, and Copilot (bodies like "Here are some automated review suggestions...") commonly appear here -- recognize them by their boilerplate content, drop silently. The script pre-filters only blank bodies. Every identity and surface -- the PR author, CI/status bots such as Codecov, review bots -- relies on this content-aware check, so identity reuse or bot format changes cannot silently hide actionable findings.

If there are no new or resolution-pending items across all feedback types, skip steps 3-9 and go straight to step 10. If only resolution-pending threads remain, skip steps 3-7 and go straight to step 8.

## 3. Cross-Invocation Cluster Analysis (Gated)

Before planning and dispatching fixes, check whether the same concern has appeared across multiple review rounds — evidence of a recurring pattern that warrants broader investigation rather than another surgical fix.

**Gate check (two stages)**: Both must pass, or skip to step 4.

1. **Signal stage**: `cross_invocation.signal == true` in the script output — resolved threads exist alongside new ones. First-round reviews always fail this stage.
2. **Spatial-overlap precheck**: at least one new `review_thread` shares an exact file path or directory subtree with a thread in `cross_invocation.resolved_threads`. The signal alone only means multi-round review exists; it is not itself evidence that recurring feedback has landed in the same area. This precheck compares paths only — no category inference, no LLM calls — so the false-positive tax is cheap. Skip this stage if the script output lacks file paths on resolved threads; in that case the signal stage governs alone.

Only inline `review_threads` participate in the precheck. `pr_comments` and `review_bodies` have no file paths and cannot contribute to spatial overlap; they are always dispatched individually regardless of clustering.

Single-round clustering (grouping new-only threads by theme + proximity within one review) is deliberately not performed: the evidence is too thin to justify holistic fixes and the false-positive rate is high. First-round "one helper would fix all of these" opportunities are handled as individual fixes until repeated reviewer evidence promotes the pattern into cross-invocation mode.

**If both gate stages pass**, analyze feedback for thematic clusters that span new threads and previously-resolved threads. Include resolved threads from `cross_invocation.resolved_threads` alongside new threads in the analysis. Mark prior-resolved threads as `previously_resolved` so dispatch (step 5) knows not to individually re-resolve them.

1. **Assign concern categories** from this fixed list: `error-handling`, `validation`, `type-safety`, `naming`, `performance`, `testing`, `security`, `documentation`, `style`, `architecture`, `statistical-methods`, `sap-alignment`, `reporting-checklist`, `reproducibility`, `other`. Each item (new and previously-resolved) gets exactly one category based on what the feedback is about.

2. **Group by category + spatial proximity, requiring cross-round evidence**. Two items form a potential cluster when they share a concern category AND are spatially proximate (same file, or files in the same directory subtree). A cluster must contain **at least one previously-resolved thread** — a new-only group lacks cross-round evidence and is dispatched individually.

   | Thematic match | Spatial proximity | Contains prior-resolved? | Action |
   |---|---|---|---|
   | Same category | Same file or subtree | Yes | Cluster |
   | Same category | Same file or subtree | No (new-only) | No cluster |
   | Same category | Unrelated locations | Any | No cluster |
   | Different categories | Any | Any | No cluster |

3. **Synthesize a cluster brief** for each cluster. Pass briefs to agents using a `<cluster-brief>` XML block:

   ```xml
   <cluster-brief>
     <theme>[concern category]</theme>
     <area>[common directory path]</area>
     <files>[comma-separated file paths]</files>
     <threads>[comma-separated new thread/comment IDs]</threads>
     <hypothesis>[one sentence: what the recurring feedback across rounds suggests about a deeper issue]</hypothesis>
     <prior-resolutions>
       <thread id="PRRT_..." path="..." category="..."/>
     </prior-resolutions>
   </cluster-brief>
   ```

   The `<prior-resolutions>` element is always present and lists the previously-resolved threads in the cluster — their IDs, file paths, and concern categories. This gives the resolver agent the full cross-round picture.

4. **Items not in any cluster** remain as individual items and are dispatched normally in step 5. Previously-resolved threads that don't cluster with any new thread are dropped — they provided context but no cross-round pattern was found.

5. **If no clusters are found** after analysis (the signal fired but no new thread clustered with a prior-resolved thread), proceed with all items as individual. The only cost was the analysis itself.

## 4. Plan

Create a task list of all **new** unresolved items grouped by type (e.g., `TaskCreate` in Claude Code, `update_plan` in Codex):
- Code changes requested
- Questions to answer
- Style/convention fixes
- Test additions needed

If step 3 produced clusters, include them in the task list as cluster items alongside individual items.

## 5. Implement (PARALLEL)

Read `references/full-mode-implement.md` and follow it: dispatch boundary for previously-resolved threads, individual and cluster dispatch of `ce-pr-comment-resolver`, the agent return format and verdicts, and batching and conflict avoidance.

## 6. Validate Combined State

After all agents complete, aggregate `files_changed` across every returned summary (individual and cluster alike). If it's empty -- all verdicts are `replied`, `not-addressing`, `declined`, or `needs-human` -- skip steps 6 and 7 entirely and proceed to step 8.

Resolvers run only targeted tests on their own changes. This step runs the project's full validation **once** against the combined diff to catch cross-agent interactions that targeted runs can't see.

1. **Run the project's validation command** (test suite, type check, or whatever the repo's AGENTS.md/CLAUDE.md specifies). Run once, not per-agent.

2. **Green** -> proceed to step 7.

3. **Red, failures touch files resolvers changed** -> one inline diagnose-and-fix pass. Re-run validation. If still red, escalate with a `needs-human` item containing the test output; do **not** commit.

4. **Red, failures touch only files no resolver changed** -> treat as pre-existing. Proceed to step 7, but add a footer to the commit message: `Note: pre-existing failure in <test> not addressed by this PR.`

Record the validation outcome (command run, pass/fail counts, any pre-existing failures noted) for the step 10 summary.

## 7. Commit and Push

1. Stage only files reported by sub-agents and commit with a message referencing the PR:

```bash
git add [files from agent summaries]
git commit -m "Address PR review feedback (#PR_NUMBER)

- [list changes from agent summaries]"
```

2. Push to remote:
```bash
git push
```

## 8. Reply and Resolve

After the push succeeds (or directly, when step 6 skipped the commit), post replies and resolve where applicable. The done condition for a review thread is one visible, submitted substantive reply plus authoritative resolution; satisfy each independently and never repeat a satisfied half. The mechanism depends on the feedback type.

### Reply format

All replies should quote the relevant part of the original feedback for continuity. Quote the specific sentence or passage being addressed, not the entire comment if it's long.

For fixed items:
```markdown
> [quoted relevant part of original feedback]

Addressed: [brief description of the fix]
```

For items not addressed:
```markdown
> [quoted relevant part of original feedback]

Not addressing: [reason with evidence, e.g., "null check already exists at line 85"]
```

For declined items:
```markdown
> [quoted relevant part of original feedback]

Declined: [specific harm cited, e.g., "this would add a defensive null check the type system already guarantees" or "violates the no-premature-abstraction guidance in CLAUDE.md"]
```

For `needs-human` verdicts, post the reply but do NOT resolve the thread. Leave it open for human input.

### Review threads

Select the first unsatisfied condition before acting. A thread with no visible submitted reply runs steps 0-4. A `resolution-pending` thread skips step 1, uses its existing reply's ID in step 2, and runs steps 0 and 2-4; do not judge, fix, or post again. A `needs-human` thread stops after step 2 and stays unresolved. Order: steps 0-2 for each thread, step 3 once for the whole pass, then step 4 for each thread to resolve.

0. **Verify the thread ID** before replying. GitHub Enterprise can return inconsistent node IDs for the same thread depending on the query path. Always confirm the ID from `get-pr-comments` resolves to the correct thread using `scripts/get-thread-for-comment` with the comment's numeric URL ID:
```bash
# Extract numeric comment ID from the comment URL (for example, discussion_r2589700 -> 2589700)
GH_REPO=OWNER/REPO gh api repos/{owner}/{repo}/pulls/comments/COMMENT_ID --jq .node_id
SKILL_DIR="<absolute path of the directory containing this skill's SKILL.md>";
bash "$SKILL_DIR/scripts/get-thread-for-comment" PR_NUMBER COMMENT_NODE_ID OWNER/REPO
```
The returned `id` is the authoritative thread ID to use for resolve. If it differs from what `get-pr-comments` returned, use the one from this script. The returned `root_comment_id` is the numeric REST ID of the thread's first comment, used for the reply. If it is `null`, take the numeric ID from the first comment's URL fragment.

1. **Reply to the root comment over REST.** Write the body to a private temp file with a quoted heredoc, then run `scripts/reply-to-pr-thread` with that file on stdin. A reply is multiline Markdown (a quote line, a blank line, then the response); never compose it with `echo "..."` or `printf`, which turn line breaks into a run-on line with literal `\n`. The quoted delimiter (`<<'EOF'`) also stops the shell from expanding backticks, `$`, and `!` inside quoted code or statistical notation:
```bash
SKILL_DIR="<absolute path of the directory containing this skill's SKILL.md>";
REPLY_BODY_FILE=$(mktemp "${TMPDIR:-/tmp}/ce-pr-reply.XXXXXX")
cat > "$REPLY_BODY_FILE" <<'EOF'
> the specific sentence being addressed from the reviewer's comment

Addressed: the sensitivity analysis now uses multiple imputation, matching SAP section 9.3.
EOF
bash "$SKILL_DIR/scripts/reply-to-pr-thread" PR_NUMBER ROOT_COMMENT_ID OWNER/REPO < "$REPLY_BODY_FILE"
```
The script posts to `repos/OWNER/REPO/pulls/PR_NUMBER/comments/ROOT_COMMENT_ID/replies`. If the script is unavailable, use that same endpoint with `gh api --method POST ... -F body=@"$REPLY_BODY_FILE"`. Never substitute the GraphQL `addPullRequestReviewThreadReply` mutation, `gh pr review`, or a `/reviews` POST: those go through review-submission state, so the reply can sit in an unsubmitted draft while the call reports success.

Exit code 2 means the reply was posted but a pending review is visible afterwards: stop without resolving any thread, report the pending review to the user, and do not submit or discard it. On success, check that the returned comment URL contains the correct `OWNER/REPO` and PR number before proceeding.

2. **Read back the stored reply** before resolving. Take the reply's numeric ID from the returned URL fragment (`#discussion_r2589700` -> `2589700`):
```bash
GH_REPO=OWNER/REPO gh api repos/{owner}/{repo}/pulls/comments/REPLY_COMMENT_ID --jq .body
GH_REPO=OWNER/REPO gh api repos/{owner}/{repo}/pulls/comments/REPLY_COMMENT_ID --jq '.pull_request_review_id // empty'
```
The body must show real line breaks. If it shows `\n` or `\n\n` as literal characters inside one line, **do not resolve the thread**. Rewrite the body file with a quoted heredoc, PATCH it, and read back again:
```bash
GH_REPO=OWNER/REPO gh api --method PATCH repos/{owner}/{repo}/pulls/comments/REPLY_COMMENT_ID -F body=@"$REPLY_BODY_FILE"
```
If the second command prints a review ID, require that review's state to be something other than `PENDING`; a pending state means the reply is not submitted, whatever the POST returned:
```bash
GH_REPO=OWNER/REPO gh api repos/{owner}/{repo}/pulls/PR_NUMBER/reviews/REVIEW_ID --jq .state
```

3. **Re-check pending-review state** once after the reply pass and before resolving. This catches a draft created after step 1's initial fetch:
```bash
SKILL_DIR="<absolute path of the directory containing this skill's SKILL.md>";
bash "$SKILL_DIR/scripts/get-pr-comments" PR_NUMBER OWNER/REPO | jq -r '.pending_review // empty'
```
If this prints an ID, stop without resolving any thread from this pass. Report the pending review; do not submit or discard it.

4. **Resolve** using `scripts/resolve-pr-thread`:
```bash
SKILL_DIR="<absolute path of the directory containing this skill's SKILL.md>";
bash "$SKILL_DIR/scripts/resolve-pr-thread" THREAD_ID
```

### PR comments and review bodies

These cannot be resolved via GitHub's API. Reply with a top-level PR comment referencing the original. Use a body file with a quoted heredoc, as for thread replies; `--body-file` keeps the Markdown line breaks that `--body "..."` and command substitution can mangle:

```bash
REPLY_BODY_FILE=$(mktemp "${TMPDIR:-/tmp}/ce-pr-reply.XXXXXX")
cat > "$REPLY_BODY_FILE" <<'EOF'
> the specific sentence being addressed from the reviewer's comment

Addressed: Table 2 now reports the STROBE-required unadjusted and adjusted estimates.
EOF
gh pr comment PR_NUMBER -R OWNER/REPO --body-file "$REPLY_BODY_FILE"
```

Confirm the posted comment renders with real line breaks, not one line containing literal `\n`.

Include enough quoted context in the reply so the reader can follow which comment is being addressed without scrolling.

## 9. Verify

Re-fetch feedback to confirm resolution:

```bash
SKILL_DIR="<absolute path of the directory containing this skill's SKILL.md>";
bash "$SKILL_DIR/scripts/get-pr-comments" PR_NUMBER
```

The `review_threads` array should be empty (except `needs-human` items).

**If new threads remain**, check the iteration count for this run:

- **First or second fix-verify cycle**: Repeat from step 2 for the remaining threads. The re-fetch in step 1 will pick up threads resolved in earlier cycles as resolved threads in `cross_invocation`, so the cross-invocation gate (step 3) will fire naturally if patterns emerge across cycles.

- **After the second fix-verify cycle** (3rd pass would begin): Stop looping. Surface remaining issues to the user with context about the recurring pattern: "Multiple rounds of feedback on [area/theme] suggest a deeper issue. Here's what we've fixed so far and what keeps appearing." Use the same `needs-human` escalation pattern -- leave threads open and present the pattern for the user to decide.

PR comments and review bodies have no resolve mechanism, so they will still appear in the output. Verify they were replied to by checking the PR conversation.

## 10. Summary

Read `references/full-mode-summary.md` and follow it to present the verdict-grouped summary, cluster investigations, `needs-human` decisions, and pending decisions from a previous run.

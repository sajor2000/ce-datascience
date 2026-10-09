import { afterAll, describe, expect, test } from "bun:test"
import { spawnSync } from "child_process"
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"

/**
 * Locks in the ported upstream fixes for ce-resolve-pr-feedback:
 *   - REST replies that cannot vanish into a pending review (#1196, #1491)
 *   - multiline reply bodies via a quoted heredoc body file (#1199)
 *   - temp files + --slurpfile instead of --argjson on large PRs (#1244)
 *   - PR author's own comments kept; identity reported, not filtered (#1467)
 */

const SKILL_DIR = path.join(
  import.meta.dir,
  "..",
  "plugins",
  "ce-datascience",
  "skills",
  "ce-resolve-pr-feedback",
)
const SCRIPTS = path.join(SKILL_DIR, "scripts")
const REPLY_SCRIPT = path.join(SCRIPTS, "reply-to-pr-thread")
const GET_PR_COMMENTS = path.join(SCRIPTS, "get-pr-comments")
const GET_THREAD = path.join(SCRIPTS, "get-thread-for-comment")
const FULL_MODE = readFileSync(path.join(SKILL_DIR, "references", "full-mode.md"), "utf8")
const TARGETED_MODE = readFileSync(path.join(SKILL_DIR, "references", "targeted-mode.md"), "utf8")
const SKILL_MD = readFileSync(path.join(SKILL_DIR, "SKILL.md"), "utf8")

const tempDirs: string[] = []
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true })
})

function tempDir(prefix: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

function writeExecutable(file: string, content: string): void {
  writeFileSync(file, content)
  chmodSync(file, 0o755)
}

function bashBlocks(markdown: string): string[] {
  return [...markdown.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]!)
}

// ---------------------------------------------------------------------------
// reply-to-pr-thread
// ---------------------------------------------------------------------------

function replyFixture() {
  const dir = tempDir("ce-reply-")
  const capture = path.join(dir, "args.txt")
  writeExecutable(
    path.join(dir, "gh"),
    `#!/usr/bin/env bash
printf 'CALL\\0' >> ${JSON.stringify(capture)}
printf '%s\\0' "$@" >> ${JSON.stringify(capture)}
case "$*" in
  *"/replies"*)
    printf '%s\\n' '{"id":2002,"html_url":"https://github.com/o/r/pull/42#discussion_r2002","pull_request_review_id":3003}'
    ;;
  *"/reviews"*)
    if [ "$FAKE_PENDING_REVIEW" = "1" ]; then printf '%s\\n' 'pending-review-1'; fi
    ;;
  *"repo view"*)
    exit 1
    ;;
  *)
    echo "unexpected gh invocation: $*" >&2
    exit 1
    ;;
esac
`,
  )
  return { dir, capture }
}

function readCalls(capture: string): string[][] {
  let raw = ""
  try {
    raw = readFileSync(capture, "utf8")
  } catch {
    return []
  }
  const calls: string[][] = []
  for (const record of raw.split("\0").filter(Boolean)) {
    if (record === "CALL") calls.push([])
    else calls.at(-1)!.push(record)
  }
  return calls
}

function runReply(args: string[], input: string, extraEnv: Record<string, string> = {}) {
  const { dir, capture } = replyFixture()
  const result = spawnSync("bash", [REPLY_SCRIPT, ...args], {
    input,
    encoding: "utf8",
    cwd: dir,
    env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, ...extraEnv },
  })
  return { result, calls: readCalls(capture) }
}

describe("reply-to-pr-thread posts over REST, never into a pending review", () => {
  test("posts to the root comment's /replies endpoint with real newlines intact", () => {
    const body = "> reviewer said this\n\nAddressed: SAP section 9.3 now matches the `lme4` model.\n"
    const { result, calls } = runReply(["42", "1001", "o/r"], body)

    expect(result.status, result.stderr).toBe(0)
    expect(calls[0]).toEqual([
      "api",
      "--method",
      "POST",
      "repos/o/r/pulls/42/comments/1001/replies",
      "-f",
      `body=${body}`,
    ])
    expect(calls[1]).toEqual([
      "api",
      "--paginate",
      "repos/o/r/pulls/42/reviews",
      "--jq",
      '.[] | select(.state == "PENDING") | .id',
    ])
    expect(calls.flat()).not.toContain("graphql")
    expect(calls.flat().join(" ")).not.toContain("addPullRequestReviewThreadReply")
  })

  test("script source no longer uses the GraphQL thread-reply mutation", () => {
    const source = readFileSync(REPLY_SCRIPT, "utf8")
    expect(source).not.toMatch(/gh api graphql/)
    expect(source).toContain("/replies")
  })

  test("exits 2 without resolving when a pending review is visible after posting", () => {
    const { result, calls } = runReply(["42", "1001", "o/r"], "Reply body", { FAKE_PENDING_REVIEW: "1" })

    expect(result.status).toBe(2)
    expect(result.stderr).toMatch(/pending review appeared after posting/i)
    expect(calls).toHaveLength(2)
    expect(calls.some((c) => c.join(" ").includes("resolveReviewThread"))).toBe(false)
    expect(calls.some((c) => c.includes("POST") && c.join(" ").includes("/reviews"))).toBe(false)
  })

  test("rejects a GraphQL thread ID or non-numeric PR before calling gh", () => {
    const thread = runReply(["42", "PRRT_kwDOABC123", "o/r"], "Reply body")
    expect(thread.result.status).toBe(1)
    expect(thread.result.stderr).toContain("ROOT_COMMENT_ID must be the numeric REST ID")
    expect(thread.calls).toHaveLength(0)

    const pr = runReply(["4x2", "1001", "o/r"], "Reply body")
    expect(pr.result.status).toBe(1)
    expect(pr.result.stderr).toContain("PR_NUMBER must be numeric")
    expect(pr.calls).toHaveLength(0)
  })

  test("fails loudly when owner/repo cannot be resolved", () => {
    const { result, calls } = runReply(["42", "1001"], "Reply body")
    expect(result.status).toBe(1)
    expect(result.stderr).toContain("Error: could not resolve owner/repo")
    expect(calls.some((c) => c.join(" ").includes("/replies"))).toBe(false)
  })

  test("refuses an empty body", () => {
    const { result, calls } = runReply(["42", "1001", "o/r"], "")
    expect(result.status).toBe(1)
    expect(result.stderr).toContain("No body provided on stdin")
    expect(calls.some((c) => c.join(" ").includes("/replies"))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Skill prose: reply mechanics and pending-review gates
// ---------------------------------------------------------------------------

describe("full and targeted mode reply guidance", () => {
  const blocks = bashBlocks(FULL_MODE)
  const replyBlock = blocks.find((b) => b.includes("scripts/reply-to-pr-thread"))
  const commentBlock = blocks.find((b) => b.includes("gh pr comment"))

  test("no reply is composed with echo or --body \"REPLY_TEXT\"", () => {
    expect(FULL_MODE).not.toContain('echo "REPLY_TEXT"')
    expect(FULL_MODE).not.toContain('--body "REPLY_TEXT"')
    expect(TARGETED_MODE).not.toContain('echo "REPLY_TEXT"')
  })

  test("thread reply writes a quoted-heredoc body file and passes it on stdin", () => {
    expect(replyBlock).toBeDefined()
    expect(replyBlock!).not.toMatch(/\becho\b|\bprintf\b/)
    expect(replyBlock!).toContain("<<'EOF'")
    expect(replyBlock!).toContain(
      'bash "$SKILL_DIR/scripts/reply-to-pr-thread" PR_NUMBER ROOT_COMMENT_ID OWNER/REPO < "$REPLY_BODY_FILE"',
    )
    expect(replyBlock!).toContain('SKILL_DIR="<absolute path of the directory containing this skill\'s SKILL.md>";')
    const body = replyBlock!.split("<<'EOF'\n")[1]!.split("\nEOF")[0]!.split("\n")
    expect(body[0]!.startsWith(">")).toBe(true)
    expect(body[1]!.trim()).toBe("")
    expect(body.slice(2).join("\n").trim().length).toBeGreaterThan(0)
  })

  test("top-level PR comment replies use --body-file from a heredoc", () => {
    expect(commentBlock).toBeDefined()
    expect(commentBlock!).toContain("<<'EOF'")
    expect(commentBlock!).toContain('--body-file "$REPLY_BODY_FILE"')
    expect(commentBlock!).not.toContain("$(cat")
  })

  test("the stored body and submission state are read back before resolving", () => {
    const section = FULL_MODE.slice(
      FULL_MODE.indexOf("scripts/reply-to-pr-thread"),
      FULL_MODE.indexOf('bash "$SKILL_DIR/scripts/resolve-pr-thread" THREAD_ID'),
    )
    expect(section).toContain("pulls/comments/REPLY_COMMENT_ID --jq .body")
    expect(section).toContain("--jq '.pull_request_review_id // empty'")
    expect(section).toContain("reviews/REVIEW_ID --jq .state")
    expect(section).toContain(".pending_review // empty")
    expect(section).toMatch(/do not resolve the thread/i)
    expect(section).toMatch(/Exit code 2/)
  })

  test("full mode stops on a pending review and forbids the GraphQL reply mutation", () => {
    expect(FULL_MODE).toMatch(/Stop here if `pending_review` is non-null/)
    expect(FULL_MODE).toMatch(/Do not submit or discard it yourself/)
    expect(FULL_MODE).toMatch(/Never substitute the GraphQL `addPullRequestReviewThreadReply`/)
  })

  test("targeted mode checks for a pending review before doing work", () => {
    expect(TARGETED_MODE).toContain(
      "gh api --paginate repos/OWNER/REPO/pulls/PR_NUMBER/reviews --jq '.[] | select(.state == \"PENDING\") | .id'",
    )
    expect(TARGETED_MODE).toContain("root_comment_id")
  })

  test("identity is evidence, not a filter, and data-science reply language survives", () => {
    expect(FULL_MODE).not.toContain("(excludes PR author)")
    expect(FULL_MODE).toContain("`pr_author` / `viewer`")
    expect(FULL_MODE).toContain("pre-filters only blank bodies")
    expect(FULL_MODE).toContain("`statistical-methods`, `sap-alignment`, `reporting-checklist`, `reproducibility`")
    expect(SKILL_MD).toContain("SAP drift")
    expect(SKILL_MD).toContain("reporting checklist alignment")
  })
})

// ---------------------------------------------------------------------------
// get-pr-comments / get-thread-for-comment
// ---------------------------------------------------------------------------

function thread(id: string, resolved: boolean, commentIds: Array<[string, number]>, body = "finding") {
  return {
    id,
    isResolved: resolved,
    isOutdated: false,
    path: "analysis/model.R",
    line: 10,
    originalLine: 10,
    startLine: null,
    originalStartLine: null,
    comments: {
      nodes: commentIds.map(([cid, rest]) => ({
        id: cid,
        author: { login: "reviewer" },
        body,
        createdAt: "2026-07-23T00:00:00Z",
        url: `https://github.com/o/r/pull/1#discussion_r${rest}`,
      })),
    },
  }
}

function fakeGraphqlGh(dir: string, pages: { threads: unknown; comments?: unknown; reviews?: unknown }) {
  const files: Record<string, string> = {}
  for (const [name, value] of Object.entries(pages)) {
    const file = path.join(dir, `${name}.json`)
    writeFileSync(file, JSON.stringify(value))
    files[name] = file
  }
  writeExecutable(
    path.join(dir, "gh"),
    `#!/usr/bin/env bash
args="$*"
if [[ "$args" == *"query Threads"* ]]; then cat ${JSON.stringify(files.threads ?? "/dev/null")}
elif [[ "$args" == *"query Comments"* ]]; then cat ${JSON.stringify(files.comments ?? "/dev/null")}
elif [[ "$args" == *"query Reviews"* ]]; then cat ${JSON.stringify(files.reviews ?? "/dev/null")}
else echo "unexpected gh invocation: $args" >&2; exit 1
fi
`,
  )
}

describe("get-pr-comments", () => {
  test("streams pages through temp files and --slurpfile, not --argjson", () => {
    for (const script of [GET_PR_COMMENTS, GET_THREAD]) {
      const source = readFileSync(script, "utf8")
      expect(source).toContain("--slurpfile")
      expect(source).not.toContain("--argjson")
      expect(source).not.toMatch(/_pages=\$\(gh api graphql/)
      expect(source).toContain('mktemp "${TMPDIR:-/tmp}/')
      expect(source).toMatch(/trap 'rm -f /)
    }
    expect(readFileSync(GET_PR_COMMENTS, "utf8")).not.toContain("!= $author.login")
  })

  test("keeps the PR author's comments, reports identity and pending review, survives a >128KB page", () => {
    const dir = tempDir("ce-pr-comments-")
    // A single argv string over MAX_ARG_STRLEN (128KB on Linux) broke the old
    // --argjson path with "Argument list too long".
    const huge = "x".repeat(300_000)
    const open = thread("PRRT_open", false, [["PRRC_a", 111], ["PRRC_b", 112]], huge)
    const done = thread("PRRT_done", true, [["PRRC_c", 222]])
    fakeGraphqlGh(dir, {
      threads: [{
        data: { repository: { pullRequest: {
          author: { login: "author" },
          reviewThreads: { nodes: [open, done], pageInfo: { hasNextPage: false, endCursor: null } },
        } } },
      }],
      comments: [{
        data: { repository: { pullRequest: { comments: {
          nodes: [
            { id: "pc1", author: { login: "reviewer" }, body: "Please justify the multiplicity correction." },
            { id: "pc2", author: { login: "author" }, body: "please rename check_id to validate_id" },
            { id: "pc3", author: { login: "codecov" }, body: "Coverage setup failed: token missing" },
            { id: "pc4", author: { login: "bot" }, body: "   " },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        } } } },
      }],
      reviews: [{
        data: {
          viewer: { login: "resolver" },
          repository: { pullRequest: { reviews: {
            nodes: [
              { id: "PRR_pending", author: { login: "resolver" }, body: "", state: "PENDING" },
              { id: "PRR_sub", author: { login: "author" }, body: "Self-review: SAP drift in table 2", state: "COMMENTED" },
              { id: "PRR_blank", author: { login: "reviewer" }, body: "", state: "APPROVED" },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          } } },
        },
      }],
    })

    const result = spawnSync("bash", [GET_PR_COMMENTS, "1", "o/r"], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
    })
    expect(result.status, result.stderr).toBe(0)
    const out = JSON.parse(result.stdout)

    expect(out.pending_review).toBe("PRR_pending")
    expect(out.pr_author).toBe("author")
    expect(out.viewer).toBe("resolver")
    expect(out.review_threads).toHaveLength(1)
    expect(out.review_threads[0].root_comment_id).toBe(111)
    expect(out.review_threads[0].node.id).toBe("PRRT_open")
    expect(out.review_threads[0].node.comments.nodes[0].body.length).toBe(300_000)
    expect(out.pr_comments.map((c: { id: string }) => c.id)).toEqual(["pc1", "pc2", "pc3"])
    expect(out.review_bodies.map((r: { id: string }) => r.id)).toEqual(["PRR_sub"])
    expect(out.cross_invocation.signal).toBe(true)
    expect(out.cross_invocation.resolved_threads[0].thread_id).toBe("PRRT_done")
  })

  test("pending_review is null when the viewer holds no draft", () => {
    const dir = tempDir("ce-pr-comments-")
    fakeGraphqlGh(dir, {
      threads: [{ data: { repository: { pullRequest: {
        author: { login: "author" },
        reviewThreads: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
      } } } }],
      comments: [{ data: { repository: { pullRequest: { comments: {
        nodes: [], pageInfo: { hasNextPage: false, endCursor: null },
      } } } } }],
      reviews: [{ data: { viewer: { login: "resolver" }, repository: { pullRequest: { reviews: {
        nodes: [{ id: "PRR_x", author: { login: "reviewer" }, body: "ok", state: "COMMENTED" }],
        pageInfo: { hasNextPage: false, endCursor: null },
      } } } } }],
    })
    const result = spawnSync("bash", [GET_PR_COMMENTS, "1", "o/r"], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
    })
    expect(result.status, result.stderr).toBe(0)
    const out = JSON.parse(result.stdout)
    expect(out.pending_review).toBeNull()
    expect(out.cross_invocation.signal).toBe(false)
  })
})

describe("get-thread-for-comment", () => {
  function lookup(commentId: string) {
    const dir = tempDir("ce-thread-lookup-")
    fakeGraphqlGh(dir, {
      threads: [
        { data: { repository: { pullRequest: { reviewThreads: {
          nodes: [thread("PRRT_one", false, [["PRRC_first", 501], ["PRRC_second", 502]])],
          pageInfo: { hasNextPage: true, endCursor: "c1" },
        } } } } },
        { data: { repository: { pullRequest: { reviewThreads: {
          nodes: [thread("PRRT_two", false, [["PRRC_third", 601]])],
          pageInfo: { hasNextPage: false, endCursor: null },
        } } } } },
      ],
    })
    return spawnSync("bash", [GET_THREAD, "1", commentId, "o/r"], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
    })
  }

  test("matches the first comment, a later reply, and a thread on a later page", () => {
    for (const [cid, threadId, root] of [
      ["PRRC_first", "PRRT_one", 501],
      ["PRRC_second", "PRRT_one", 501],
      ["PRRC_third", "PRRT_two", 601],
    ] as const) {
      const result = lookup(cid)
      expect(result.status, result.stderr).toBe(0)
      const out = JSON.parse(result.stdout)
      expect(out.id).toBe(threadId)
      expect(out.root_comment_id).toBe(root)
    }
  })

  test("uses any() for the lookup and fails for an unknown comment", () => {
    const source = readFileSync(GET_THREAD, "utf8")
    expect(source).toContain("any(.comments.nodes[]; .id == $cid)")
    expect(source).not.toContain("index($cid)")
    const result = lookup("PRRC_missing")
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain("No thread found for comment PRRC_missing")
  })
})

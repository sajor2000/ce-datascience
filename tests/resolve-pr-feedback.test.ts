import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"

const skillRoot = path.join(
  import.meta.dir,
  "..",
  "plugins",
  "ce-datascience",
  "skills",
  "ce-resolve-pr-feedback",
)

const getPrCommentsScript = path.join(skillRoot, "scripts", "get-pr-comments")
const getThreadForCommentScript = path.join(skillRoot, "scripts", "get-thread-for-comment")
const fullModeReference = path.join(skillRoot, "references", "full-mode.md")

type RunResult = {
  exitCode: number
  stderr: string
  stdout: string
}

async function writeExecutable(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content)
  await fs.chmod(filePath, 0o755)
}

async function runScript(
  scriptPath: string,
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv },
): Promise<RunResult> {
  const proc = Bun.spawn(["bash", scriptPath, ...args], {
    cwd: options.cwd,
    env: options.env,
    stderr: "pipe",
    stdout: "pipe",
  })

  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])

  return { exitCode, stderr, stdout }
}

async function createFailingGhBin(): Promise<string> {
  const binDir = await fs.mkdtemp(path.join(os.tmpdir(), "resolve-pr-feedback-bin-"))
  await writeExecutable(path.join(binDir, "gh"), "#!/usr/bin/env bash\nexit 1\n")
  return binDir
}

async function createRecordingGhBin(logPath: string): Promise<string> {
  const binDir = await fs.mkdtemp(path.join(os.tmpdir(), "resolve-pr-feedback-bin-"))
  await writeExecutable(
    path.join(binDir, "gh"),
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "$GH_ARGS_LOG"
if [ "$#" -ge 2 ] && [ "$1" = "api" ] && [ "$2" = "graphql" ]; then
  printf '%s\\n' '[{"data":{"repository":{"pullRequest":{"author":{"login":"author"},"reviewThreads":{"nodes":[]},"comments":{"nodes":[]},"reviews":{"nodes":[]}}}}}]'
  exit 0
fi
exit 1
`,
  )
  await writeExecutable(
    path.join(binDir, "jq"),
    `#!/usr/bin/env bash
printf '%s\\n' '{"review_threads":[],"pr_comments":[],"review_bodies":[],"cross_invocation":{"signal":false,"resolved_threads":[]}}'
`,
  )
  return binDir
}

describe("ce-resolve-pr-feedback repository resolution", () => {
  test("get-pr-comments fails loudly when owner/repo auto-detection fails", async () => {
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "resolve-pr-feedback-cwd-"))
    const binDir = await createFailingGhBin()

    const result = await runScript(getPrCommentsScript, ["123"], {
      cwd,
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ""}`,
      },
    })

    expect(result.exitCode).toBe(1)
    expect(result.stdout).toBe("")
    expect(result.stderr).toContain(
      "Error: could not resolve owner/repo. Run get-pr-comments from inside the target git repository, or pass OWNER/REPO as the second argument (e.g., get-pr-comments $PR_NUMBER EveryInc/cora).",
    )
  })

  test("get-thread-for-comment fails loudly when owner/repo auto-detection fails", async () => {
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "resolve-pr-feedback-cwd-"))
    const binDir = await createFailingGhBin()

    const result = await runScript(getThreadForCommentScript, ["123", "PRRC_kwDOP_gZVc6ySv89"], {
      cwd,
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ""}`,
      },
    })

    expect(result.exitCode).toBe(1)
    expect(result.stdout).toBe("")
    expect(result.stderr).toContain(
      "Error: could not resolve owner/repo. Run get-thread-for-comment from inside the target git repository, or pass OWNER/REPO as the third argument (e.g., get-thread-for-comment $PR_NUMBER $COMMENT_NODE_ID EveryInc/cora).",
    )
  })

  test("explicit OWNER/REPO bypasses auto-detection and reaches GraphQL arguments", async () => {
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "resolve-pr-feedback-cwd-"))
    const logPath = path.join(cwd, "gh-args.log")
    const binDir = await createRecordingGhBin(logPath)

    const result = await runScript(getPrCommentsScript, ["123", "EveryInc/cora"], {
      cwd,
      env: {
        ...process.env,
        GH_ARGS_LOG: logPath,
        PATH: `${binDir}:${process.env.PATH ?? ""}`,
      },
    })

    expect(result.exitCode).toBe(0)
    const ghArgs = await fs.readFile(logPath, "utf8")
    expect(ghArgs).not.toContain("repo view")
    expect(ghArgs).toContain("api graphql")
    expect(ghArgs).toContain("-f owner=EveryInc")
    expect(ghArgs).toContain("-f repo=cora")
    expect(ghArgs).toContain("-F pr=123")
  })
})

describe("ce-resolve-pr-feedback thread safety guidance", () => {
  test("full mode verifies authoritative thread ID before reply or resolve", async () => {
    const body = await fs.readFile(fullModeReference, "utf8")

    expect(body).toContain("Verify the thread ID")
    expect(body).toContain("bash scripts/get-thread-for-comment PR_NUMBER COMMENT_NODE_ID OWNER/REPO")
    expect(body).toContain("The returned `id` is the authoritative thread ID")
    expect(body).toContain("returned comment URL contains the correct `OWNER/REPO` and PR number")
  })

  test("get-pr-comments retains cross-invocation output contract", async () => {
    const body = await fs.readFile(getPrCommentsScript, "utf8")

    expect(body).toContain("cross_invocation - cross-invocation awareness envelope")
    expect(body).toContain("cross_invocation: {")
    expect(body).toContain("resolved_threads: $resolved")
  })
})

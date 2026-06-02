import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, writeFile } from "fs/promises"
import os from "os"
import path from "path"

const tempRoots: string[] = []
const scriptPath = path.join(
  process.cwd(),
  "plugins",
  "ce-datascience",
  "skills",
  "ce-review-pack",
  "scripts",
  "validate_signoff_ledger.py",
)

afterEach(async () => {
  for (const root of tempRoots.splice(0, tempRoots.length)) {
    await Bun.$`rm -rf ${root}`.quiet()
  }
})

describe("review-pack signoff ledger", () => {
  test("validates a named reviewer ledger", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "signoff-ledger-"))
    tempRoots.push(root)
    await mkdir(path.join(root, "analysis", "signoff"), { recursive: true })
    await writeFile(
      path.join(root, "analysis", "signoff", "signoff-ledger.json"),
      JSON.stringify({
        ledger_id: "study-signoff",
        study_id: "study-1",
        entries: [{
          entry_id: "signoff-1",
          reviewer: "Dr. Reviewer",
          artifact: "table1",
          decision: "approved-with-conditions",
          timestamp: "2026-05-30T12:00:00Z",
        }],
      }, null, 2),
    )

    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(0)
    const report = await readFile(path.join(root, "analysis", "signoff", "signoff-validation-report.md"), "utf8")
    expect(report).toContain("Result: READY-WITH-REVIEW")
  })

  test("blocks duplicate signoff entry IDs and missing reviewers", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "signoff-ledger-invalid-"))
    tempRoots.push(root)
    await mkdir(path.join(root, "analysis", "signoff"), { recursive: true })
    await writeFile(
      path.join(root, "analysis", "signoff", "signoff-ledger.json"),
      JSON.stringify({
        ledger_id: "study-signoff",
        study_id: "study-1",
        entries: [
          {
            entry_id: "signoff-1",
            reviewer: "",
            artifact: "table1",
            decision: "approved",
            timestamp: "2026-05-30T12:00:00Z",
          },
          {
            entry_id: "signoff-1",
            reviewer: "Dr. Reviewer",
            artifact: "figure",
            decision: "approved",
            timestamp: "2026-05-30T12:10:00Z",
          },
        ],
      }, null, 2),
    )

    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(1)
    const report = await readFile(path.join(root, "analysis", "signoff", "signoff-validation-report.md"), "utf8")
    expect(report).toContain("Duplicate entry_id: signoff-1")
    expect(report).toContain("signoff-1: missing required field 'reviewer'")
  })
})

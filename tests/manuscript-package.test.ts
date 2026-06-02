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
  "ce-manuscript-package",
  "scripts",
  "build_package_manifest.py",
)

afterEach(async () => {
  for (const root of tempRoots.splice(0, tempRoots.length)) {
    await Bun.$`rm -rf ${root}`.quiet()
  }
})

async function makeProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "manuscript-package-"))
  tempRoots.push(root)
  await mkdir(path.join(root, "analysis", "publication", "tables"), { recursive: true })
  await mkdir(path.join(root, "analysis", "publication", "figures"), { recursive: true })
  await writeFile(path.join(root, "analysis", "sap.md"), "---\nsap_version: 1.0\n---\n# SAP\n")
  await writeFile(
    path.join(root, "analysis", "publication", "tables", "table1-spec.json"),
    JSON.stringify({ artifact_type: "table1", status: "ready-with-review", rows: [] }, null, 2),
  )
  await writeFile(
    path.join(root, "analysis", "publication", "figures", "figure-manifest.json"),
    JSON.stringify({ figures: [{ figure_id: "fig1" }] }, null, 2),
  )
  return root
}

describe("manuscript package builder", () => {
  test("creates a Quarto manuscript package manifest from publication artifacts", async () => {
    const root = await makeProject()
    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--out-dir",
      "manuscript",
      "--format",
      "quarto",
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(0)
    const manifest = JSON.parse(await readFile(path.join(root, "manuscript", "package-manifest.json"), "utf8"))
    const report = await readFile(path.join(root, "manuscript", "package-readiness-report.md"), "utf8")
    const manuscript = await readFile(path.join(root, "manuscript", "manuscript.qmd"), "utf8")

    expect(manifest.readiness).toBe("ready-with-review")
    expect(manifest.tables).toEqual(["analysis/publication/tables/table1-spec.json"])
    expect(report).toContain("Result: READY-WITH-REVIEW")
    expect(manuscript).toContain("# Methods")
  })

  test("blocks when required publication artifacts are missing", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "manuscript-package-missing-"))
    tempRoots.push(root)
    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(1)
    const report = await readFile(path.join(root, "manuscript", "package-readiness-report.md"), "utf8")
    expect(report).toContain("SAP not found")
    expect(report).toContain("Table 1 spec not found")
    expect(report).toContain("Figure manifest not found")
  })
})

import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, writeFile } from "fs/promises"
import os from "os"
import path from "path"

const tempRoots: string[] = []
const scriptPath = path.join(
  process.cwd(),
  "plugins",
  "methodsmith",
  "skills",
  "method-submission-package",
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
    await mkdir(path.join(root, "analysis/numbers"), { recursive: true })
    await mkdir(path.join(root, "analysis/sap-tables"), { recursive: true })
    await writeFile(path.join(root, "analysis/sap-tables/02-outputs.csv"), "Output File\nT1\n")
    await mkdir(path.join(root, "manuscript"), { recursive: true })
    const helper = path.join(process.cwd(), "plugins/methodsmith/skills/method-numbers/scripts/method_numbers.py")
    await writeFile(path.join(root, "analysis/numbers/method_numbers.py"), await readFile(helper))
    await writeFile(path.join(root, "aggregate.txt"), "synthetic aggregate source\n")
    await writeFile(path.join(root, "analysis/model.py"),
      'import sys\nsys.path.insert(0, "analysis/numbers")\nfrom method_numbers import register_number\n' +
      'register_number("cohort.n", 412, kind="n", sources=["aggregate.txt"], sap_output="T1")\n')
    for (const args of [["init", "-q"], ["add", "-A"], ["commit", "-qm", "synthetic"]]) {
      const git = Bun.spawnSync(["git", "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", ...args], { cwd: root })
      expect(git.exitCode).toBe(0)
    }
    expect(Bun.spawnSync(["python3", "analysis/model.py"], { cwd: root }).exitCode).toBe(0)
    await writeFile(path.join(root, "manuscript/manuscript.qmd"), "# Methods\n\nN = {{num:cohort.n}}\n")
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
    expect(manifest.number_gate.status).toBe("PASS")
    await writeFile(path.join(root, "analysis/publication/figures/figure-manifest.json"),
      JSON.stringify({ figures: [{ figure_id: "fig1", caption: "Mortality was 23.4%." }] }))
    const captionFailed = Bun.spawn(["python3", scriptPath, "--project-root", root], { stdout: "pipe", stderr: "pipe" })
    expect(await captionFailed.exited).toBe(1)
    await writeFile(path.join(root, "analysis/publication/figures/figure-manifest.json"),
      JSON.stringify({ figures: [{ figure_id: "fig1", caption: "N = {{num:cohort.n}}" }] }))
    await writeFile(path.join(root, "manuscript/manuscript.qmd"), "N = 412\n")
    const failed = Bun.spawn(["python3", scriptPath, "--project-root", root], { stdout: "pipe", stderr: "pipe" })
    expect(await failed.exited).toBe(1)
    const blocked = JSON.parse(await readFile(path.join(root, "manuscript/package-manifest.json"), "utf8"))
    expect(blocked.number_gate.status).toBe("FAIL")
    expect(blocked.readiness).toBe("blocked")
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

test("publication artifacts alone cannot bypass the numeric gate", async () => {
  const root = await makeProject()
  const proc = Bun.spawn(["python3", scriptPath, "--project-root", root], { stdout: "pipe", stderr: "pipe" })
  expect(await proc.exited).toBe(1)
  const manifest = JSON.parse(await readFile(path.join(root, "manuscript/package-manifest.json"), "utf8"))
  expect(manifest.readiness).toBe("blocked")
  expect(manifest.blockers.join(" ")).toContain("Number gate")
})

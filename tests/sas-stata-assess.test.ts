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
  "ce-sas-stata-assess",
  "scripts",
  "assess_sas_stata.py",
)

afterEach(async () => {
  for (const root of tempRoots.splice(0, tempRoots.length)) {
    await Bun.$`rm -rf ${root}`.quiet()
  }
})

describe("SAS/Stata assessment", () => {
  test("inventories SAS and Stata model signals without scaffolding", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "sas-stata-assess-"))
    tempRoots.push(root)
    await mkdir(path.join(root, "analysis"), { recursive: true })
    await writeFile(
      path.join(root, "analysis", "model.sas"),
      "libname raw '/data';\nproc logistic data=raw.cohort;\nmodel y=x;\nrun;\n",
    )
    await writeFile(
      path.join(root, "analysis", "survival.do"),
      "global root \"/data\"\nstcox exposure age\nputexcel A1 = \"done\"\n",
    )

    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--scan-dir",
      "analysis",
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(0)
    const report = await readFile(path.join(root, "analysis", "sas-stata-assessment.md"), "utf8")
    expect(report).toContain("SAS files: 1")
    expect(report).toContain("Stata files: 1")
    expect(report).toContain("proc_logistic")
    expect(report).toContain("stcox")
    expect(report).toContain("Do not auto-scaffold")
  })

  test("rejects scan directories outside the project root", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "sas-stata-assess-safe-"))
    tempRoots.push(root)
    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--scan-dir",
      "../outside",
    ], { stdout: "pipe", stderr: "pipe" })
    const [exitCode, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stderr).text(),
      new Response(proc.stdout).text(),
    ]).then(([code, err]) => [code, err] as const)

    expect(exitCode).toBe(2)
    expect(stderr).toContain("must stay inside the project root")
  })
})

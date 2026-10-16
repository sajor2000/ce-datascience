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
  "method-sas-stata",
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
    expect(report).toContain("Defaults to align before comparing a port")
    expect(report).toContain("Stata stcox defaults to Breslow")
    expect(report).toContain("Ordered Value 1")
  })

  test("detects common inferential procedures beyond logistic and Cox", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "sas-stata-assess-procs-"))
    tempRoots.push(root)
    await mkdir(path.join(root, "analysis"), { recursive: true })
    await writeFile(path.join(root, "analysis", "m.sas"), "proc mixed data=a;\nrun;\nproc surveylogistic data=a;\nrun;\n")
    await writeFile(path.join(root, "analysis", "m.do"), "melogit y x || site:\nsvy: regress y x\nregress y x, vce(cluster site)\n")
    const proc = Bun.spawn(["python3", scriptPath, "--project-root", root, "--scan-dir", "analysis"], { stdout: "pipe", stderr: "pipe" })
    expect(await proc.exited).toBe(0)
    const report = await readFile(path.join(root, "analysis", "sas-stata-assessment.md"), "utf8")
    for (const signal of ["proc_mixed", "proc_survey", "`mixed`", "`svy`", "vce_cluster"]) expect(report).toContain(signal)
    expect(report).toContain("lmerTest")

    await writeFile(path.join(root, "analysis", "m.do"), "merge 1:1 id using b\n")
    await writeFile(path.join(root, "analysis", "m.sas"), "data a; set b; run;\n")
    const again = Bun.spawn(["python3", scriptPath, "--project-root", root, "--scan-dir", "analysis"], { stdout: "pipe", stderr: "pipe" })
    expect(await again.exited).toBe(0)
    const plain = await readFile(path.join(root, "analysis", "sas-stata-assessment.md"), "utf8")
    expect(plain).not.toContain("`mixed`")
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

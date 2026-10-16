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
  "ce-table1",
  "scripts",
  "generate_table1.py",
)

afterEach(async () => {
  for (const root of tempRoots.splice(0, tempRoots.length)) {
    await Bun.$`rm -rf ${root}`.quiet()
  }
})

async function makeProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "table1-generator-"))
  tempRoots.push(root)
  await mkdir(path.join(root, "analysis", "sap-tables"), { recursive: true })
  await writeFile(
    path.join(root, "analysis", "sap-tables", "03-variables.csv"),
    [
      "category,variable,description,type,levels,notes",
      "Patient Characteristic,age,Age,Numeric,,",
      "Clinical Characteristic,apache_score,APACHE score,Numeric,,",
      "Outcome,mortality,Hospital mortality,Binary,0/1,not baseline",
    ].join("\n"),
  )
  await writeFile(path.join(root, "analysis", "sap.md"), "---\nsap_version: 1.0\n---\n# SAP\n")
  return root
}

describe("Table 1 generator", () => {
  test("creates a traceable Table 1 shell from a variables catalog", async () => {
    const root = await makeProject()
    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--out-dir",
      "analysis/publication/tables",
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(0)
    const spec = JSON.parse(
      await readFile(path.join(root, "analysis", "publication", "tables", "table1-spec.json"), "utf8"),
    )
    const table = await readFile(path.join(root, "analysis", "publication", "tables", "table1.md"), "utf8")
    const report = await readFile(
      path.join(root, "analysis", "publication", "tables", "table1-validation-report.md"),
      "utf8",
    )

    expect(spec.artifact_type).toBe("table1")
    expect(spec.rows.map((row: { variable: string }) => row.variable)).toEqual(["age", "apache_score"])
    expect(table).toContain("| Age | Patient Characteristic | Numeric |")
    expect(report).toContain("Result: READY-WITH-REVIEW")
  })

  test("accepts biostatistics workbook-style Master Variables columns", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "table1-generator-workbook-"))
    tempRoots.push(root)
    await mkdir(path.join(root, "analysis", "sap-tables"), { recursive: true })
    await writeFile(
      path.join(root, "analysis", "sap-tables", "03-variables.csv"),
      [
        "Category,Variable,Description,Type,Format / Values,File,A3,Notes",
        "Patient Characteristic,age,Age,Fixed,Integer years,Both,✓,",
        "Clinical Characteristic,SOFA_prior,Prior-day SOFA score,Time-varying,Integer,File 1,✓,Lagged 1 day",
        "Outcome,time_to_extubation,Time to extubation,Fixed,Integer days,File 2,✓,not baseline",
      ].join("\n"),
    )

    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--out-dir",
      "analysis/publication/tables",
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(0)
    const spec = JSON.parse(
      await readFile(path.join(root, "analysis", "publication", "tables", "table1-spec.json"), "utf8"),
    )
    const tableCsv = await readFile(path.join(root, "analysis", "publication", "tables", "table1.csv"), "utf8")

    const report = await readFile(
      path.join(root, "analysis", "publication", "tables", "table1-validation-report.md"),
      "utf8",
    )

    // Baseline means at or before time zero: time-varying rows are skipped with a warning.
    expect(spec.rows.map((row: { variable: string }) => row.variable)).toEqual(["age"])
    expect(spec.rows.map((row: { levels: string }) => row.levels)).toEqual(["Integer years"])
    expect(tableCsv).toContain("age,Age,Patient Characteristic,Fixed,Integer years")
    expect(tableCsv).not.toContain("SOFA_prior")
    expect(report).toContain("Skipped time-varying rows")
    expect(report).toContain("SOFA_prior")
  })

  test("never lists the exposure as a baseline row and adds an SMD column only for observational designs", async () => {
    const root = await makeProject()
    const catalog = path.join(root, "analysis", "sap-tables", "03-variables.csv")
    await writeFile(
      catalog,
      [
        "category,variable,description,type,levels,notes",
        "Patient Characteristic,age,Age,Fixed,,",
        "Exposure,statin_new_user,Statin initiation,Fixed,0/1,stratifier",
      ].join("\n"),
    )
    const runWith = async (design: string) => {
      const proc = Bun.spawn([
        "python3", scriptPath, "--project-root", root, "--out-dir", `analysis/t1-${design}`,
        "--strata", "statin_new_user", "--design", design,
      ], { stdout: "pipe", stderr: "pipe" })
      expect(await proc.exited).toBe(0)
      return {
        spec: JSON.parse(await readFile(path.join(root, "analysis", `t1-${design}`, "table1-spec.json"), "utf8")),
        md: await readFile(path.join(root, "analysis", `t1-${design}`, "table1.md"), "utf8"),
      }
    }

    const obs = await runWith("observational")
    expect(obs.spec.rows.map((row: { variable: string }) => row.variable)).toEqual(["age"])
    expect(obs.spec.comparison_column).toBe("abs_smd")
    expect(obs.md).toContain("| Abs. SMD |")

    const rct = await runWith("rct")
    expect(rct.spec.comparison_column).toBeNull()
    expect(rct.md).toContain("CONSORT 2025 item 25")
    expect(rct.md).not.toContain("Abs. SMD")
  })

  test("blocks an unknown style profile", async () => {
    const root = await makeProject()
    const proc = Bun.spawn([
      "python3", scriptPath, "--project-root", root, "--out-dir", "analysis/publication/tables",
      "--style-profile", "nejm-imaginary",
    ], { stdout: "pipe", stderr: "pipe" })
    expect(await proc.exited).toBe(1)
    const report = await readFile(
      path.join(root, "analysis", "publication", "tables", "table1-validation-report.md"),
      "utf8",
    )
    expect(report).toContain("Unknown style profile: nejm-imaginary")
  })

  test("blocks when the variables catalog is missing", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "table1-generator-missing-"))
    tempRoots.push(root)
    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--variables",
      "analysis/sap-tables/missing.csv",
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(1)
    const report = await readFile(
      path.join(root, "analysis", "publication", "tables", "table1-validation-report.md"),
      "utf8",
    )
    expect(report).toContain("Variables catalog not found")
  })

  test("refuses absolute output paths", async () => {
    const root = await makeProject()
    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--out-dir",
      path.join(root, "unsafe"),
    ], { stdout: "pipe", stderr: "pipe" })
    const [exitCode, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stderr).text(),
      new Response(proc.stdout).text(),
    ]).then(([code, err]) => [code, err] as const)

    expect(exitCode).toBe(2)
    expect(stderr).toContain("--out-dir must be a project-relative path")
  })

  test("cites registry placeholders for Overall cells and records the cell ids and SAP output", async () => {
    const root = await makeProject()
    await writeFile(
      path.join(root, "analysis", "sap-tables", "02-outputs.csv"),
      [
        "Output File (SITE_ID_ prefix added automatically),Subfolder,Dataset / Cohort Scope,Script Section,Contents,Role at Coordinating Center,Interpretation",
        "TABLE OUTPUTS | 00_setup.R,,,,,,",
        "table1_cohort_characteristics.csv,tables/,cohort,Table - general,Characteristics,Table 1,Balance",
      ].join("\n"),
    )
    const proc = Bun.spawn(["python3", scriptPath, "--project-root", root], { stdout: "pipe", stderr: "pipe" })
    expect(await proc.exited).toBe(0)
    const out = path.join(root, "analysis", "publication", "tables")
    const spec = JSON.parse(await readFile(path.join(out, "table1-spec.json"), "utf8"))
    const table = await readFile(path.join(out, "table1.md"), "utf8")

    expect(spec.registry).toEqual({ table_id: "table1", sap_output: "table1_cohort_characteristics.csv" })
    expect(spec.rows[0].registry_ids).toEqual({ overall: "table1.age.overall" })
    expect(table).toContain("| Age | Patient Characteristic | Numeric | {{num:table1.age.overall}} |")
    expect(table).toContain("{{num:table1.apache_score.overall}}")
  })

  test("warns when no SAP output names Table 1, so its registry entries would be untraceable", async () => {
    const root = await makeProject()
    const proc = Bun.spawn(["python3", scriptPath, "--project-root", root], { stdout: "pipe", stderr: "pipe" })
    expect(await proc.exited).toBe(0)
    const out = path.join(root, "analysis", "publication", "tables")
    const spec = JSON.parse(await readFile(path.join(out, "table1-spec.json"), "utf8"))
    const report = await readFile(path.join(out, "table1-validation-report.md"), "utf8")
    expect(spec.registry).toEqual({ table_id: "table1", sap_output: null })
    expect(report).toContain("No SAP output names Table 1")
  })

  test("a filled Table 1 renders from the registry and passes the number gate", async () => {
    const root = await makeProject()
    const numbers = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-numbers", "scripts")
    await writeFile(
      path.join(root, "analysis", "sap-tables", "02-outputs.csv"),
      "Output File,Subfolder\ntable1_cohort_characteristics.csv,tables/\n",
    )
    await mkdir(path.join(root, "data"), { recursive: true })
    await writeFile(path.join(root, "data", "synthetic.csv"), "age,apache\n60,20\n")
    const gen = Bun.spawn(["python3", scriptPath, "--project-root", root, "--strata", "prone_any", "--design", "observational"],
      { stdout: "pipe", stderr: "pipe" })
    expect(await gen.exited).toBe(0)
    await writeFile(path.join(root, "analysis", "fill_table1.py"), [
      "import json, sys",
      `sys.path.insert(0, ${JSON.stringify(numbers)})`,
      "from ce_numbers import register_table",
      "spec = json.load(open('analysis/publication/tables/table1-spec.json'))",
      "register_table('table1', {'age.overall': {'value': 64.23, 'kind': 'estimate', 'sd': 11.84, 'digits': 1},",
      "                          'apache_score.overall': {'value': 18, 'kind': 'estimate', 'iqr': (12, 25), 'digits': 0}},",
      "               sources=['data/synthetic.csv'], sap_output=spec['registry']['sap_output'])",
      "",
    ].join("\n"))
    for (const args of [["init", "-q"], ["add", "-A"], ["-c", "user.email=t@example.invalid", "-c", "user.name=t", "commit", "-qm", "synthetic"]]) {
      expect(Bun.spawnSync(["git", ...args], { cwd: root }).exitCode).toBe(0)
    }
    const fill = Bun.spawnSync(["python3", "analysis/fill_table1.py"], { cwd: root })
    expect(fill.stderr.toString()).toBe("")
    const cli = path.join(numbers, "ce_numbers.py")
    const render = Bun.spawnSync(["python3", cli, "render", "analysis/publication/tables/table1.md", "--out", "analysis/publication/tables/table1.rendered.md"], { cwd: root })
    expect(render.stdout.toString()).toContain("RENDERED")
    const rendered = await readFile(path.join(root, "analysis", "publication", "tables", "table1.rendered.md"), "utf8")
    expect(rendered).toContain("| Age | Patient Characteristic | Numeric | 64.2 (11.8) |")
    const gate = Bun.spawnSync(["python3", cli, "check", "analysis/publication/tables/table1.rendered.md"], { cwd: root })
    expect(gate.stdout.toString()).toContain("PASS")
    expect(gate.exitCode).toBe(0)
  })
})

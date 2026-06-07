import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, writeFile } from "fs/promises"
import os from "os"
import path from "path"

const skillRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-sap-tabular")
const script = path.join(skillRoot, "scripts", "generate-tabular-sap.py")

async function run(command: string[], cwd = process.cwd()): Promise<string> {
  const proc = Bun.spawn(command, {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  })
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])
  if (exitCode !== 0) {
    throw new Error(`${command.join(" ")} failed\nstdout:\n${stdout}\nstderr:\n${stderr}`)
  }
  return stdout
}

describe("ce-sap-tabular biostatistics workbook", () => {
  test("renders the three core sheets with workbook-style output section banners", async () => {
    const temp = await mkdtemp(path.join(os.tmpdir(), "ce-sap-tabular-"))
    const out = path.join(temp, "demo-tabular-sap.xlsx")

    await writeFile(
      path.join(temp, "01-overview.csv"),
      [
        "Analysis,Claim,Unit of Analysis,Data File(s),Analysis Question,Primary Method,Secondary Methods,Site Script",
        "3 - Time to Extubation,Construct validity,Ventilator-day,File 1 Long,Does SAT/SBT speed extubation?,Discrete-time logistic,Cox sensitivity,analysis_03.py",
      ].join("\n"),
      "utf8",
    )
    await writeFile(
      path.join(temp, "02-outputs.csv"),
      [
        "Output File (SITE_ID_ prefix added automatically),Subfolder,Dataset / Cohort Scope,Script Section,Contents,Role at Coordinating Center,Interpretation",
        "MODEL OUTPUTS | analysis_03.py,,,,,,",
        "A3_dt_primary_coefs.csv,models/a3/,df_dt,Analysis 3.1 - Primary,OR and 95% CI,Pool estimates,OR > 1 supports faster extubation",
      ].join("\n"),
      "utf8",
    )
    await writeFile(
      path.join(temp, "03-variables.csv"),
      [
        "Category,Variable,Description,Type,Format / Values,File,A3,Notes",
        "Exposure,SAT_delivered_primary,SAT delivered,Time-varying,0/1,File 1,✓,Daily indicator",
      ].join("\n"),
      "utf8",
    )

    await run(["python3", script, "demo", temp, out])

    const inspection = await run([
      "python3",
      "-c",
      [
        "import json, sys",
        "from openpyxl import load_workbook",
        "wb = load_workbook(sys.argv[1])",
        "ws = wb['Outputs']",
        "print(json.dumps({",
        "  'sheets': wb.sheetnames,",
        "  'headers': [ws.cell(row=3, column=i).value for i in range(1, 8)],",
        "  'banner': ws.cell(row=4, column=1).value,",
        "  'merged': [str(r) for r in ws.merged_cells.ranges],",
        "  'first_output': ws.cell(row=5, column=1).value,",
        "}))",
      ].join("\n"),
      out,
    ])
    const parsed = JSON.parse(inspection)

    expect(parsed.sheets).toEqual(["Overview", "Outputs", "Master Variables"])
    expect(parsed.headers).toEqual([
      "Output File (SITE_ID_ prefix added automatically)",
      "Subfolder",
      "Dataset / Cohort Scope",
      "Script Section",
      "Contents",
      "Role at Coordinating Center",
      "Interpretation",
    ])
    expect(parsed.banner).toBe("MODEL OUTPUTS | analysis_03.py")
    expect(parsed.merged).toContain("A4:G4")
    expect(parsed.first_output).toBe("A3_dt_primary_coefs.csv")
  })

  test("skill documentation exposes the workbook-native columns", async () => {
    const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8")
    expect(skill).toContain("`Overview`, `Outputs`, `Master Variables`")
    expect(skill).toContain("Output File (SITE_ID_ prefix added automatically)")
    expect(skill).toContain("Role at Coordinating Center")
    expect(skill).toContain("Format / Values")
    expect(skill).toContain("optional synthetic file-shape sample sheets")
  })
})

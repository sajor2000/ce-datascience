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
  "ce-figure",
  "scripts",
  "validate_figure_manifest.py",
)

afterEach(async () => {
  for (const root of tempRoots.splice(0, tempRoots.length)) {
    await Bun.$`rm -rf ${root}`.quiet()
  }
})

async function makeProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "figure-workflow-"))
  tempRoots.push(root)
  await mkdir(path.join(root, "analysis", "publication", "figures"), { recursive: true })
  await mkdir(path.join(root, "analysis", "scripts"), { recursive: true })
  await writeFile(path.join(root, "analysis", "publication", "figures", "fig1-source.csv"), "x,y\n1,2\n")
  await writeFile(path.join(root, "analysis", "publication", "figures", "fig1.pdf"), "%PDF-test\n")
  await writeFile(path.join(root, "analysis", "scripts", "fig1.py"), "print('figure')\n")
  return root
}

describe("publication figure workflow", () => {
  test("validates a complete figure manifest", async () => {
    const root = await makeProject()
    await writeFile(
      path.join(root, "analysis", "publication", "figures", "figure-manifest.json"),
      JSON.stringify({
        figures: [{
          figure_id: "fig1",
          sap_section: "SAP-5.1",
          source_data: "analysis/publication/figures/fig1-source.csv",
          source_code: "analysis/scripts/fig1.py",
          output_path: "analysis/publication/figures/fig1.pdf",
          caption: "Figure 1. Primary outcome by exposure group.",
          alt_text: "Line chart showing the primary outcome by exposure group.",
          style_profile: "jama",
          checklist_items: ["STROBE-14"],
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
    const report = await readFile(
      path.join(root, "analysis", "publication", "figures", "figure-validation-report.md"),
      "utf8",
    )
    expect(report).toContain("Result: READY-WITH-REVIEW")
  })

  test("blocks duplicate IDs and missing source data", async () => {
    const root = await makeProject()
    await writeFile(
      path.join(root, "analysis", "publication", "figures", "figure-manifest.json"),
      JSON.stringify({
        figures: [
          {
            figure_id: "fig1",
            sap_section: "SAP-5.1",
            source_data: "analysis/publication/figures/missing.csv",
            source_code: "analysis/scripts/fig1.py",
            output_path: "analysis/publication/figures/fig1.pdf",
            caption: "Figure 1.",
            alt_text: "Figure one.",
            style_profile: "jama",
          },
          {
            figure_id: "fig1",
            sap_section: "SAP-5.2",
            source_data: "analysis/publication/figures/fig1-source.csv",
            source_code: "analysis/scripts/fig1.py",
            output_path: "analysis/publication/figures/fig1.pdf",
            caption: "Figure 1 duplicate.",
            alt_text: "Duplicate figure.",
            style_profile: "jama",
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
    const report = await readFile(
      path.join(root, "analysis", "publication", "figures", "figure-validation-report.md"),
      "utf8",
    )
    expect(report).toContain("Duplicate figure_id: fig1")
    expect(report).toContain("source_data does not exist")
  })
})

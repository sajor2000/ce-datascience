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
  "ce-prereg",
  "scripts",
  "validate_registry_package.py",
)

afterEach(async () => {
  for (const root of tempRoots.splice(0, tempRoots.length)) {
    await Bun.$`rm -rf ${root}`.quiet()
  }
})

async function makePackage(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "prereg-package-"))
  tempRoots.push(root)
  const packageDir = path.join(root, "analysis", "prereg", "clinicaltrials-2026-05-30")
  await mkdir(packageDir, { recursive: true })
  await writeFile(
    path.join(packageDir, "form.md"),
    [
      "# ClinicalTrials.gov Preregistration",
      "",
      "PRE-REGISTRATION CHECKLIST -- review before submitting:",
      "- SAP is locked",
      "",
      "Brief summary: Study summary.",
    ].join("\n"),
  )
  await writeFile(path.join(packageDir, "sap-snapshot.md"), "---\nsap_version: 1.0\n---\n# SAP\n")
  await writeFile(
    path.join(packageDir, "payload.json"),
    JSON.stringify({
      registry: "clinicaltrials",
      title: "Trial title",
      study_type: "interventional",
      sap_version: "1.0",
      generated_at: "2026-05-30",
      fields: {
        brief_title: "Trial title",
        brief_summary: "Study summary.",
        primary_outcomes: ["Mortality at 30 days"],
        eligibility_criteria: "Adults admitted to ICU.",
        sponsor: "Rush University Medical Center",
      },
    }, null, 2),
  )
  return root
}

describe("preregistration registry package validation", () => {
  test("accepts a complete ClinicalTrials.gov package", async () => {
    const root = await makePackage()
    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--package-dir",
      "analysis/prereg/clinicaltrials-2026-05-30",
      "--registry",
      "clinicaltrials",
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(0)
    const report = await readFile(
      path.join(root, "analysis", "prereg", "clinicaltrials-2026-05-30", "registry-validation-report.md"),
      "utf8",
    )
    expect(report).toContain("Result: READY-WITH-REVIEW")
  })

  test("blocks missing registry fields and unresolved placeholders", async () => {
    const root = await makePackage()
    const packageDir = path.join(root, "analysis", "prereg", "clinicaltrials-2026-05-30")
    await writeFile(
      path.join(packageDir, "payload.json"),
      JSON.stringify({
        registry: "clinicaltrials",
        title: "<title>",
        study_type: "interventional",
        sap_version: "1.0",
        generated_at: "2026-05-30",
        fields: {
          brief_title: "Trial title",
          brief_summary: "Study summary.",
          eligibility_criteria: "Adults admitted to ICU.",
          sponsor: "Rush University Medical Center",
        },
      }, null, 2),
    )

    const proc = Bun.spawn([
      "python3",
      scriptPath,
      "--project-root",
      root,
      "--package-dir",
      "analysis/prereg/clinicaltrials-2026-05-30",
    ], { stdout: "pipe", stderr: "pipe" })

    expect(await proc.exited).toBe(1)
    const report = await readFile(path.join(packageDir, "registry-validation-report.md"), "utf8")
    expect(report).toContain("payload.fields missing required clinicaltrials field: primary_outcomes")
    expect(report).toContain("Unresolved placeholder found: <title>")
  })
})

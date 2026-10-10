import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const skills = path.join(process.cwd(), "plugins", "ce-datascience", "skills")
const read = (rel: string) => readFile(path.join(skills, rel), "utf8")

describe("PHI environment gate: ask once, then remember", () => {
  test("ce-work applies the gate to every project, not only CLIF, and reuses a saved answer", async () => {
    const work = await read("ce-work/SKILL.md")
    expect(work).toContain("PHI environment gate (all projects)")
    expect(work).toContain("phi_environment.compliant")
    expect(work).toContain("`references/phi-environment.md`")
    expect(work).not.toContain("PHI gate (CLIF profile)")
  })

  test("the reference asks one yes/no question, saves it only to a gitignored config, and never in non-interactive modes", async () => {
    const ref = await read("ce-work/references/phi-environment.md")
    expect(ref).toContain("Are both this data environment and the active model endpoint compliant for PHI/PII?")
    expect(ref).toContain("\"Yes, both are compliant\" and \"No or unsure\"")
    expect(ref).toContain("Treat \"No or unsure\" as `compliant: false`")
    expect(ref).toContain("git check-ignore -q .ce-datascience/config.local.yaml")
    expect(ref).toContain("If it is not ignored, do not save")
    expect(ref).toMatch(/headless mode, do not ask, wait, or write the config/)
    expect(ref).toContain("`compliant: false` | Do not open patient-level data or outputs")
    expect(ref).toContain("never write patient data, identifiers, or credentials to the config")
  })

  test("ce-clif honors the same saved answer and the config template documents it", async () => {
    const [clif, rules, template] = await Promise.all([
      read("ce-clif/SKILL.md"),
      read("ce-clif/references/clif-rules.md"),
      read("ce-setup/references/config-template.yaml"),
    ])
    expect(clif).toContain("phi_environment.compliant")
    expect(rules).toContain("phi_environment: {compliant: true|false")
    expect(rules).toContain("only when that file is gitignored")
    expect(template).toContain("# phi_environment:")
    expect(template).toContain("#   compliant: true")
  })
})

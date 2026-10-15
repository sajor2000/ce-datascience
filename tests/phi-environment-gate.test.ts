import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const pluginRoot = path.join(process.cwd(), "plugins", "ce-datascience")
const skills = path.join(pluginRoot, "skills")
const read = (rel: string) => readFile(path.join(skills, rel), "utf8")
const UNRESTRICTED = "`compliant: true` or `sensitive_data: false`"
const OPTIONS = ["`Approved endpoint: full access`", "`Not approved or unsure: schema-only`", "`No sensitive data: public or synthetic`"]

describe("sensitive-data boundary: asked once by ce-setup, then remembered", () => {
  test("ce-setup asks one three-option question before any data inspection", async () => {
    const [setup, ref] = await Promise.all([read("ce-setup/SKILL.md"), read("ce-setup/references/sensitive-data-boundary.md")])
    const gate = setup.indexOf("### Phase 0a: Sensitive-data boundary (before any data inspection)")
    expect(gate).toBeGreaterThan(-1)
    expect(gate).toBeLessThan(setup.indexOf("Run the `ce-language-detect` skill"))
    expect(gate).toBeLessThan(setup.indexOf("### Data domain and connection signals"))
    expect(setup).toContain("`references/sensitive-data-boundary.md`")
    expect(setup).toContain("Unrestricted. Do not ask or mention the boundary.")
    for (const option of OPTIONS) expect(ref).toContain(option)
    expect(ref).toContain("`compliant: true`, `confirmed_on: <today>`")
    expect(ref).toContain("`compliant: false`, `confirmed_on: <today>`")
    expect(ref).toContain("`sensitive_data: false`, `confirmed_on: <today>`")
    expect(ref).toContain("Confirming that approval (BAA or institutional sign-off) is your responsibility.")
    expect(ref).toContain("Never raise the boundary again.")
    expect(ref).toContain("git check-ignore -q .ce-datascience/config.local.yaml")
    expect(ref).toContain("In headless or non-interactive runs, do not ask or save.")
    for (const phrase of ["The agent CAN see", "The agent CANNOT", "look at example rows", "join mismatches", "free text", "you run it on your machine", "counts under 11 suppressed"]) {
      expect(ref).toContain(phrase)
    }
  })

  test("ce-work reuses the saved answer, stays silent when unrestricted, and documents schema-only rules", async () => {
    const [work, ref] = await Promise.all([read("ce-work/SKILL.md"), read("ce-work/references/phi-environment.md")])
    expect(work).toContain("Sensitive-data boundary gate (all projects)")
    expect(work).toContain(`${UNRESTRICTED}: unrestricted; proceed silently and never raise the boundary again this session`)
    expect(work).toContain("`references/phi-environment.md`")
    expect(ref).toContain("no reminder, banner, or question about the boundary for the rest of the session")
    for (const option of OPTIONS) expect(ref).toContain(option)
    expect(ref).toContain("If it is not ignored, do not save")
    expect(ref).toMatch(/headless mode, do not ask, wait, or write the config/)
    expect(ref).toContain('python3 "$SKILL_DIR/scripts/schema-peek.py"')
    expect(ref).toContain("never write data values, identifiers, or credentials to it")
  })

  test("every skill that gates on phi_environment treats compliant:true and sensitive_data:false as unrestricted", async () => {
    const gated = [
      "ce-clif/SKILL.md", "ce-clif/references/clif-rules.md", "ce-grill/SKILL.md", "ce-scientific-writing/SKILL.md",
      "ce-data-qa/SKILL.md", "ce-verify/SKILL.md", "ce-table1/SKILL.md", "ce-cohort-build/SKILL.md", "ce-code-review/SKILL.md",
    ]
    for (const rel of gated) {
      const content = await read(rel)
      expect({ rel, mentionsUnrestricted: /`(?:phi_environment\.)?compliant: true` or `sensitive_data: false`/.test(content) })
        .toEqual({ rel, mentionsUnrestricted: true })
      expect({ rel, oldQuestion: content.includes("Are both this data environment and the active model endpoint compliant") })
        .toEqual({ rel, oldQuestion: false })
    }
    const reviewer = await readFile(path.join(pluginRoot, "agents", "ce-phi-leak-reviewer.md"), "utf8")
    expect(reviewer).toContain(`${UNRESTRICTED} counts as confirmation`)
  })

  test("the config template documents all three answers and stays backward compatible", async () => {
    const template = await read("ce-setup/references/config-template.yaml")
    expect(template).toContain("# phi_environment:")
    expect(template).toContain("#   compliant: true")
    expect(template).toContain("compliant: false       -> sensitive data, endpoint not approved or unsure.")
    expect(template).toContain("sensitive_data: false  -> public or synthetic data only.")
  })
})

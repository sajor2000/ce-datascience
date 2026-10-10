import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const skillDir = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-grill")

async function read(rel: string): Promise<string> {
  return readFile(path.join(skillDir, rel), "utf8")
}

describe("ce-grill research-project interview", () => {
  test("asks one question at a time with a recommended answer first", async () => {
    const content = await read("SKILL.md")

    expect(content).toMatch(/one question at a time/i)
    expect(content).toMatch(/One question per turn, always with a recommended answer/)
    expect(content).toMatch(/recommended answer first and labeled "\(Recommended\)"/)
    expect(content).toMatch(/up to 4 options/)
    expect(content).toMatch(/blocking question UI/)
  })

  test("covers all six branches in the skill and the question bank", async () => {
    const content = await read("SKILL.md")
    const bank = await read("references/question-bank.md")

    for (const branch of ["Goal", "Hypothesis", "Data", "Proposed analysis", "Target journal", "Audience"]) {
      expect(content).toContain(`| ${branch} |`)
      expect(bank).toContain(`## ${branch}`)
    }
    expect(bank).toMatch(/Immortal time bias/)
    expect(bank).toMatch(/mediators or colliders/)
  })

  test("looks up facts instead of asking and respects the PHI boundary", async () => {
    const content = await read("SKILL.md")

    expect(content).toMatch(/Never ask the user for something you can find/)
    expect(content).toContain("phi_environment.compliant")
    expect(content).toMatch(/Never ask the user to paste patient-level rows/)
  })

  test("confirms shared understanding, saves the record, and never writes the SAP", async () => {
    const content = await read("SKILL.md")
    const template = await read("references/grill-record-template.md")

    expect(content).toMatch(/confirm the shared understanding before saving/)
    expect(content).toContain("docs/brainstorms/<YYYY-MM-DD>-<slug>-grill.md")
    expect(content).toMatch(/Do not write the SAP/)
    expect(content).toContain("`references/question-bank.md`")
    expect(content).toContain("`references/grill-record-template.md`")
    expect(template).toContain("type: grill-record")
    expect(template).toContain("| # | Branch | Question | Recommended | Chosen | Why it matters |")
    expect(template).toContain("## Reviewer attack list")
  })
})

import { describe, expect, test } from "bun:test"
import { readdir, readFile } from "fs/promises"
import path from "path"

const skillsRoot = path.join(process.cwd(), "plugins", "methodsmith", "skills")

async function read(relativePath: string): Promise<string> {
  return readFile(path.join(skillsRoot, relativePath), "utf8")
}

function body(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n/, "")
}

describe("method-plan and method-brainstorm skill structure", () => {
  test("method-plan SKILL.md stays a thin router under the 500-line body limit", async () => {
    const plan = await read("method-plan/SKILL.md")
    expect(body(plan).split("\n").length).toBeLessThan(500)
    expect(plan).toContain("Read `references/plan-structure.md` now")
    const structure = await read("method-plan/references/plan-structure.md")
    expect(structure).toContain("## 3.5 Define Each Implementation Unit")
    expect(structure).toContain("## 4.3 Planning Rules")
  })

  test("SAP mode replaces Phases 3-5 consistently and links SAP references directly", async () => {
    const plan = await read("method-plan/SKILL.md")
    expect(plan).not.toMatch(/replaces Phases 3-4/)
    expect(plan).toContain("follow it in place of Phases 3-5")
    for (const ref of ["sap-mode-workflow.md", "sap-template.md", "sap-gap-checklist.md", "plan-handoff.md"]) {
      expect(plan).toContain(`references/${ref}`)
    }
    expect(plan).toContain("Data profile before SAP structure (SAP Phase 2.5)")
    expect(plan).toContain("Tabular companion required (SAP Phase 4.5)")
    expect(plan).toContain("Phase 1.0 is a gate for any study or analysis work with data")
  })

  test("ce-proof stays optional with a local-file fallback", async () => {
    const files = await Promise.all([
      read("method-plan/SKILL.md"),
      read("method-plan/references/plan-handoff.md"),
      read("method-plan/references/universal-planning.md"),
      read("method-brainstorm/references/handoff.md"),
      read("method-brainstorm/references/universal-brainstorming.md"),
    ])
    for (const content of files) {
      expect(content).toMatch(/only when[^.\n]*`ce-proof` skill is available/i)
    }
    expect(files[0]).toContain("methodsmith does not ship it")
  })

  test("method-brainstorm links its visual-communication reference directly", async () => {
    const brainstorm = await read("method-brainstorm/SKILL.md")
    expect(brainstorm).toContain("`references/visual-communication.md`")
  })

  test("reference files over 100 lines start with a Contents list", async () => {
    const offenders: string[] = []
    for (const skill of ["method-plan", "method-brainstorm"]) {
      const dir = path.join(skillsRoot, skill, "references")
      for (const name of await readdir(dir)) {
        if (!name.endsWith(".md")) continue
        const content = await readFile(path.join(dir, name), "utf8")
        if (content.split("\n").length <= 100) continue
        if (!/^## Contents$/m.test(content)) offenders.push(`${skill}/references/${name}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

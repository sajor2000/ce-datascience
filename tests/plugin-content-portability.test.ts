import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

const skillsRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills")

describe("ce-datascience skill portability", () => {
  test("script invocation instructions use installed skill-local paths", async () => {
    const pubmed = await fs.readFile(path.join(skillsRoot, "ce-pubmed", "SKILL.md"), "utf8")
    expect(pubmed).toContain("python3 scripts/pubmed_search.py")
    expect(pubmed).not.toContain("plugins/ce-datascience/skills/ce-pubmed/scripts/pubmed_search.py")

    const sapTabular = await fs.readFile(path.join(skillsRoot, "ce-sap-tabular", "SKILL.md"), "utf8")
    expect(sapTabular).toContain("python3 scripts/generate-tabular-sap.py")
    expect(sapTabular).not.toContain("Run `scripts/generate-tabular-sap.py`")

    const sprint = await fs.readFile(path.join(skillsRoot, "ce-sprint", "SKILL.md"), "utf8")
    expect(sprint).toContain("python3 scripts/sprint.py close <name>")
    expect(sprint).not.toContain("Run `scripts/sprint.py close <name>`")
  })

  test("Claude-only cache maintenance skill is platform-filtered", async () => {
    const updateSkill = await fs.readFile(path.join(skillsRoot, "ce-update", "SKILL.md"), "utf8")
    expect(updateSkill).toContain("ce_platforms: [claude]")
  })
})

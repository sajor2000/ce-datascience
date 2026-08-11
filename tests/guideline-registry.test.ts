import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import { load } from "js-yaml"

const repoRoot = path.join(import.meta.dir, "..")
const checklistRoot = path.join(repoRoot, "plugins", "ce-datascience", "skills", "ce-code-review", "references")
const registryPath = path.join(checklistRoot, "guideline-registry.yaml")

type GuidelineRegistry = {
  guidelines: Record<string, {
    file: string
    aliases?: string[]
    primary_for?: string[]
    extension_for?: string[]
    role?: string
    ai_extension?: boolean
  }>
}

describe("reporting guideline registry", () => {
  test("tracks every shipped reporting checklist file", async () => {
    const registry = load(await fs.readFile(registryPath, "utf8")) as GuidelineRegistry
    const entries = registry.guidelines
    const registeredFiles = Object.values(entries).map((entry) => entry.file).sort()
    const checklistFiles = (await fs.readdir(checklistRoot))
      .filter((file) => file.endsWith("-checklist.md"))
      .sort()

    expect(Object.keys(entries)).toHaveLength(35)
    expect(registeredFiles).toEqual(checklistFiles)

    for (const [name, entry] of Object.entries(entries)) {
      expect(name).toMatch(/^[A-Z0-9+-]+$/)
      expect(entry.file).toMatch(/-checklist\.md$/)
      expect(typeof entry.ai_extension).toBe("boolean")
      expect(await fs.stat(path.join(checklistRoot, entry.file))).toBeDefined()
    }
  })

  test("public docs and reviewer descriptions agree on the registry count", async () => {
    const rootReadme = await fs.readFile(path.join(repoRoot, "README.md"), "utf8")
    const pluginReadme = await fs.readFile(path.join(repoRoot, "plugins", "ce-datascience", "README.md"), "utf8")
    const reviewer = await fs.readFile(path.join(repoRoot, "plugins", "ce-datascience", "agents", "ce-reporting-checklist-reviewer.md"), "utf8")
    const routingMap = await fs.readFile(path.join(checklistRoot, "guideline-routing.md"), "utf8")

    expect(rootReadme).toContain("35 reporting checklists")
    expect(pluginReadme).toContain("35 standards")
    expect(reviewer).toContain("35 guidelines")
    expect(routingMap).toContain("guideline-registry.yaml")
  })
})

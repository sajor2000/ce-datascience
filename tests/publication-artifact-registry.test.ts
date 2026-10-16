import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import { load } from "js-yaml"

const repoRoot = path.join(import.meta.dir, "..")
const table1SkillRoot = path.join(repoRoot, "plugins", "methodsmith", "skills", "method-table1")

type StyleProfiles = {
  profiles: Record<string, {
    label: string
    tables: Record<string, unknown>
    figures: Record<string, unknown>
    captions: Record<string, unknown>
    manuscript: Record<string, unknown>
    sources?: string[]
  }>
}

describe("journal style profiles", () => {
  test("ships with method-table1 and keeps README claims aligned", async () => {
    const profiles = load(
      await fs.readFile(
        path.join(table1SkillRoot, "references", "journal-style-profiles.yaml"),
        "utf8",
      ),
    ) as StyleProfiles
    const readme = await fs.readFile(path.join(repoRoot, "plugins", "methodsmith", "README.md"), "utf8")

    expect(Object.keys(profiles.profiles).sort()).toEqual(["clinical-standard", "generic-biomedical", "jama"])
    expect(readme).toContain("publication profiles")
    expect(readme).toContain("JAMA")
    expect(readme).toContain("generic biomedical")

    for (const [name, profile] of Object.entries(profiles.profiles)) {
      expect(name).toMatch(/^[a-z0-9-]+$/)
      expect(profile.tables).toBeDefined()
      expect(profile.figures).toBeDefined()
      expect(profile.captions).toBeDefined()
      expect(profile.manuscript).toBeDefined()
      expect(profile.sources ?? []).toEqual(
        expect.arrayContaining([expect.stringMatching(/^https:\/\//)]),
      )
    }
  })

  test("method-figure's clinical-standard figure settings match method-table1's", async () => {
    const table1 = load(
      await fs.readFile(path.join(table1SkillRoot, "references", "journal-style-profiles.yaml"), "utf8"),
    ) as StyleProfiles
    const figure = load(
      await fs.readFile(
        path.join(repoRoot, "plugins", "methodsmith", "skills", "method-figure", "references", "figure-style-profiles.yaml"),
        "utf8",
      ),
    ) as { profiles: Record<string, { figures?: Record<string, unknown> }> }

    expect(Object.keys(figure.profiles).sort()).toEqual(["clinical-standard", "generic-biomedical", "jama"])
    expect(figure.profiles["clinical-standard"].figures).toEqual(table1.profiles["clinical-standard"].figures)
  })

  test("the skill references only files inside its own directory", async () => {
    const skillMd = await fs.readFile(path.join(table1SkillRoot, "SKILL.md"), "utf8")
    expect(skillMd).toContain("references/journal-style-profiles.yaml")
    expect(skillMd).not.toContain("shared/journal-style-profiles.yaml")
  })
})

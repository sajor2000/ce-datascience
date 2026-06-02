import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import { load } from "js-yaml"

const repoRoot = path.join(import.meta.dir, "..")
const sharedRoot = path.join(repoRoot, "plugins", "ce-datascience", "shared")

type ArtifactRegistry = {
  artifact_types: Record<string, {
    label: string
    required_fields: string[]
    default_output_dir: string
    readiness_gate: string
  }>
}

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

describe("publication artifact registry", () => {
  test("defines stable publication artifact categories", async () => {
    const registry = load(
      await fs.readFile(path.join(sharedRoot, "publication-artifact-registry.yaml"), "utf8"),
    ) as ArtifactRegistry

    expect(Object.keys(registry.artifact_types).sort()).toEqual([
      "analysis-table",
      "checklist",
      "figure",
      "manuscript",
      "registry-package",
      "review-pack",
      "signoff-ledger",
      "supplement",
      "table1",
    ])

    for (const [name, entry] of Object.entries(registry.artifact_types)) {
      expect(name).toMatch(/^[a-z0-9-]+$/)
      expect(entry.label.length).toBeGreaterThan(0)
      expect(entry.required_fields.length).toBeGreaterThan(0)
      expect(entry.default_output_dir).not.toMatch(/^\/|~|\.\./)
      expect(entry.readiness_gate).toMatch(/^[a-z0-9_]+$/)
    }
  })

  test("defines journal style profiles and keeps README claims aligned", async () => {
    const profiles = load(
      await fs.readFile(path.join(sharedRoot, "journal-style-profiles.yaml"), "utf8"),
    ) as StyleProfiles
    const readme = await fs.readFile(path.join(repoRoot, "plugins", "ce-datascience", "README.md"), "utf8")

    expect(Object.keys(profiles.profiles).sort()).toEqual(["generic-biomedical", "jama"])
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
})

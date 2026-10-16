import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import { parseFrontmatter } from "../src/utils/frontmatter"
import { descriptionFingerprint } from "../src/utils/legacy-cleanup"
import shipped from "../src/data/shipped-description-fingerprints.json"

const pluginRoot = path.join(import.meta.dir, "..", "plugins", "ce-datascience")

async function currentDescriptionFiles(): Promise<string[]> {
  const skills = (await fs.readdir(path.join(pluginRoot, "skills"))).map((name) => path.join(pluginRoot, "skills", name, "SKILL.md"))
  const agents = (await fs.readdir(path.join(pluginRoot, "agents")))
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(pluginRoot, "agents", name))
  return [...skills, ...agents]
}

describe("shipped description fingerprints", () => {
  test("include every current skill and agent description, so a later rewording still recognizes this release's files", async () => {
    const known = new Set(shipped.fingerprints)
    const missing: string[] = []
    for (const file of await currentDescriptionFiles()) {
      const raw = await fs.readFile(file, "utf8").catch(() => null)
      if (!raw) continue
      const { data } = parseFrontmatter(raw, file)
      if (typeof data.description !== "string") continue
      if (!known.has(descriptionFingerprint(data.description))) missing.push(path.relative(pluginRoot, file))
    }
    expect(missing, "Run: bun run legacy:fingerprints").toEqual([])
  })
})

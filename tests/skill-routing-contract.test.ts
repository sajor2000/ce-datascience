import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

const repoRoot = path.join(import.meta.dir, "..")
const pluginRoot = path.join(repoRoot, "plugins", "ce-datascience")
const skillsRoot = path.join(pluginRoot, "skills")

async function readTree(root: string): Promise<string> {
  const entries = await fs.readdir(root, { withFileTypes: true })
  const contents = await Promise.all(entries.map(async (entry) => {
    const file = path.join(root, entry.name)
    return entry.isDirectory() ? readTree(file) : fs.readFile(file, "utf8")
  }))
  return contents.join("\n")
}

describe("skill routing contracts", () => {
  test("documents every public skill in the plugin README", async () => {
    const [entries, readme] = await Promise.all([
      fs.readdir(skillsRoot, { withFileTypes: true }),
      fs.readFile(path.join(pluginRoot, "README.md"), "utf8"),
    ])
    const skills = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    const missing = skills.filter((skill) => !readme.includes(`/${skill}\``) && !readme.includes(`\`${skill}\``))

    expect(missing).toEqual([])
  })

  test("keeps literature acquisition lawful and specialist-owned", async () => {
    const [literature, pubmed, publicDocs, pluginContent] = await Promise.all([
      fs.readFile(path.join(skillsRoot, "ce-literature-search", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillsRoot, "ce-pubmed", "SKILL.md"), "utf8"),
      Promise.all([
        fs.readFile(path.join(repoRoot, "README.md"), "utf8"),
        fs.readFile(path.join(pluginRoot, "README.md"), "utf8"),
        fs.readFile(path.join(repoRoot, "docs", "setup.md"), "utf8"),
      ]).then((parts) => parts.join("\n")),
      readTree(pluginRoot),
    ])

    expect(literature).toContain("Load `ce-pubmed`")
    expect(literature).toContain("Load `ce-evidence-map`")
    expect(pubmed).toContain("canonical biomedical metadata")
    expect(`${publicDocs}\n${pluginContent}`).not.toMatch(/PyPaperBot|SciHub/i)
  })

  test("keeps one SAP owner and no retired CE MCP data-lock commands", async () => {
    const [plan, specialist, rstats, pluginContent] = await Promise.all([
      fs.readFile(path.join(skillsRoot, "ce-plan", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillsRoot, "ce-statistical-analysis-plan", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillsRoot, "ce-rstats", "SKILL.md"), "utf8"),
      readTree(pluginRoot),
    ])

    expect(plan).toContain("owns the canonical versioned SAP")
    expect(specialist).toContain("Do not do:** Create a competing SAP")
    expect(rstats).toContain("Use the shared R workflow below")
    expect(pluginContent).not.toContain("ce-plan` skill or `ce-statistical-analysis-plan")
    expect(pluginContent).not.toContain("ce-plan` SAP or the `ce-statistical-analysis-plan")
    expect(pluginContent).not.toContain("data_wave_register")
    expect(pluginContent).not.toContain("data_lock` MCP")
  })
})

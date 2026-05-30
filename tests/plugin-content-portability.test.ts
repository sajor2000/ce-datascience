import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

const skillsRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills")
const pluginRoot = path.join(process.cwd(), "plugins", "ce-datascience")

async function collectFiles(root: string, predicate: (file: string) => boolean): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(root, entry.name)
    if (entry.isDirectory()) return collectFiles(fullPath, predicate)
    return predicate(fullPath) ? [fullPath] : []
  }))
  return files.flat()
}

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

  test("skill and agent content uses canonical reporting checklist config", async () => {
    const markdownFiles = await collectFiles(pluginRoot, (file) => file.endsWith(".md"))
    const offenders: string[] = []

    for (const file of markdownFiles) {
      const rel = path.relative(pluginRoot, file)
      const content = await fs.readFile(file, "utf8")
      if (content.includes("reporting_checklist: true")) offenders.push(rel)
      if (content.includes("reporting_checklist.enabled")) offenders.push(rel)
      if (content.includes("reporting_checklist.guideline")) offenders.push(rel)
    }

    expect(offenders).toEqual([])
  })

  test("skill and agent instructions avoid installed-cache paths and stale source runtime paths", async () => {
    const markdownFiles = await collectFiles(pluginRoot, (file) => file.endsWith(".md"))
    const offenders: string[] = []

    for (const file of markdownFiles) {
      const rel = path.relative(pluginRoot, file)
      const content = await fs.readFile(file, "utf8")
      const isClaudeCacheSkill = rel === path.join("skills", "ce-update", "SKILL.md")
      const isSourceCheckoutMcpDoc = rel === path.join("skills", "ce-mcp-server", "SKILL.md")
      if (!isClaudeCacheSkill && (content.includes("~/.claude/plugins/cache/") || content.includes("~/.codex/plugins/cache/"))) {
        offenders.push(rel)
      }
      if (!isSourceCheckoutMcpDoc && content.includes("plugins/ce-datascience/skills/")) {
        offenders.push(rel)
      }
    }

    expect(offenders).toEqual([])
  })

  test("cache artifacts are not tracked in distributable plugin content", async () => {
    const proc = Bun.spawn(["git", "ls-files", "plugins/ce-datascience"], {
      cwd: process.cwd(),
      stdout: "pipe",
      stderr: "pipe",
    })
    const exitCode = await proc.exited
    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()
    if (exitCode !== 0) throw new Error(stderr)

    const trackedArtifacts = stdout
      .split("\n")
      .filter((file) => /(__pycache__|\.pyc$|\.pyo$|\.DS_Store$)/.test(file))

    expect(trackedArtifacts).toEqual([])
  })

  test("skill-local reference links resolve inside each skill directory", async () => {
    const skillFiles = await collectFiles(skillsRoot, (file) => path.basename(file) === "SKILL.md")
    const missingReferences: string[] = []

    for (const file of skillFiles) {
      const rel = path.relative(skillsRoot, file)
      const content = await fs.readFile(file, "utf8")
      for (const match of content.matchAll(/@\.\/([^\s`]+)/g)) {
        const reference = match[1].replace(/[),.;:]+$/, "")
        const target = path.join(path.dirname(file), reference)
        try {
          await fs.access(target)
        } catch {
          missingReferences.push(`${rel} -> ${reference}`)
        }
      }
    }

    expect(missingReferences).toEqual([])
  })
})

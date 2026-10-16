import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

const repoRoot = path.join(import.meta.dir, "..")
const docs = ["README.md", "docs/setup.md", "plugins/methodsmith/README.md"]

describe("update model and user-skill safety are documented in every install doc", () => {
  for (const doc of docs) {
    test(doc, async () => {
      const content = await fs.readFile(path.join(repoRoot, doc), "utf8")
      expect(content).toMatch(/^#+ Keep Methodsmith updated$/m)
      expect(content).toMatch(/^#+ Your own skills are safe$/m)
      for (const required of [
        "claude plugin update methodsmith@methodsmith",
        "Enable auto-update",
        "codex plugin marketplace upgrade methodsmith",
        "bunx github:sajor2000/methodsmith install methodsmith --to opencode",
        "qwen extensions update methodsmith",
        "~/.claude/skills",
        ".claude/skills",
        "~/.agents/skills",
        "~/.qwen/skills",
        ".qwen/skills",
        // Legacy cleanup acts outside owned-files.json, so the docs must say
        // it only moves those files to a backup.
        "Files from an install made before ownership tracking",
      ]) {
        expect(content).toContain(required)
      }
    })
  }

  test("the plugin's contributor guide separates plugin skills from personal skills", async () => {
    const guide = await fs.readFile(path.join(repoRoot, "plugins/methodsmith/AGENTS.md"), "utf8")
    expect(guide).toContain("~/.claude/skills")
    expect(guide).toContain("~/.qwen/skills")
    expect(guide).toMatch(/never put it inside an installed copy of the plugin/i)
  })
})

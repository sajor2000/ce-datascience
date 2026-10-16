import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { writeOpenCodeBundle } from "../src/targets/opencode"
import type { OpenCodeBundle } from "../src/types/opencode"
import { writeCodexBundle } from "../src/targets/codex"
import type { CodexBundle } from "../src/types/codex"
import { writePiBundle } from "../src/targets/pi"
import type { PiBundle } from "../src/types/pi"

// Synthetic user content only. Names deliberately collide with entries in the
// legacy cleanup allow-lists (STALE_SKILL_DIRS, STALE_AGENT_NAMES,
// EXTRA_LEGACY_ARTIFACTS_BY_PLUGIN) so the tests catch name-only deletion.
const USER_SKILL = "---\nname: skill-creator\ndescription: My own skill for drafting skills.\n---\n\nUser body.\n"
const USER_AGENT = "---\ndescription: My own performance reviewer.\n---\n\nUser agent.\n"
const USER_COMMAND = "---\ndescription: My own review command.\n---\n\nReview my way.\n"

const fixtureSkillDir = path.join(import.meta.dir, "fixtures", "sample-plugin", "skills", "skill-one")

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content)
}

function openCodeBundle(overrides: Partial<OpenCodeBundle> = {}): OpenCodeBundle {
  return {
    pluginName: "ce-datascience",
    config: { $schema: "https://opencode.ai/config.json" },
    agents: [{ name: "ce-agent-one", content: "Agent content" }],
    plugins: [],
    commandFiles: [],
    skillDirs: [{ name: "ce-skill-one", sourceDir: fixtureSkillDir }],
    ...overrides,
  }
}

describe("OpenCode install never removes user-created content", () => {
  test("user skills, agents, and commands named like legacy entries survive install and update", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-user-opencode-"))
    const openCodeRoot = path.join(root, "opencode")
    const userFiles: Record<string, string> = {
      "skills/skill-creator/SKILL.md": USER_SKILL,
      "skills/orchestrating-swarms/SKILL.md": USER_SKILL.replace("skill-creator", "orchestrating-swarms"),
      "skills/setup/SKILL.md": USER_SKILL.replace("skill-creator", "setup"),
      "agents/performance-oracle.md": USER_AGENT,
      "commands/review.md": USER_COMMAND,
      "commands/plan.md": USER_COMMAND,
      "skills/my-notes/notes.md": "my own file",
    }
    for (const [relative, content] of Object.entries(userFiles)) {
      await writeFile(path.join(openCodeRoot, relative), content)
    }

    await writeOpenCodeBundle(openCodeRoot, openCodeBundle(), "global")
    await writeOpenCodeBundle(openCodeRoot, openCodeBundle(), "global")

    for (const [relative, content] of Object.entries(userFiles)) {
      expect(await fs.readFile(path.join(openCodeRoot, relative), "utf8")).toBe(content)
    }
    expect(await exists(path.join(openCodeRoot, "skills", "ce-skill-one", "SKILL.md"))).toBe(true)
  })
})

describe("Codex install never removes user-created content", () => {
  test("flat ~/.codex skills and prompts named like legacy entries survive install and update", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-user-codex-"))
    const codexRoot = path.join(root, ".codex")
    const userFiles: Record<string, string> = {
      "skills/skill-creator/SKILL.md": USER_SKILL,
      "skills/orchestrating-swarms/SKILL.md": USER_SKILL.replace("skill-creator", "orchestrating-swarms"),
      "skills/performance-oracle/SKILL.md": USER_SKILL.replace("skill-creator", "performance-oracle"),
      "skills/ce-datascience/setup/SKILL.md": USER_SKILL.replace("skill-creator", "setup"),
      "prompts/reproduce-bug.md": USER_COMMAND,
      "prompts/plan.md": USER_COMMAND,
    }
    for (const [relative, content] of Object.entries(userFiles)) {
      await writeFile(path.join(codexRoot, relative), content)
    }
    const bundle: CodexBundle = {
      pluginName: "ce-datascience",
      prompts: [],
      skillDirs: [{ name: "ce-skill-one", sourceDir: fixtureSkillDir }],
      generatedSkills: [],
      agents: [],
    }

    await writeCodexBundle(codexRoot, bundle)
    await writeCodexBundle(codexRoot, bundle)

    for (const [relative, content] of Object.entries(userFiles)) {
      expect(await fs.readFile(path.join(codexRoot, relative), "utf8")).toBe(content)
    }
  })
})

describe("Pi install never removes user-created content", () => {
  test("user skills and prompts named like legacy entries survive install and update", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-user-pi-"))
    const piRoot = path.join(root, ".pi")
    const userFiles: Record<string, string> = {
      "skills/skill-creator/SKILL.md": USER_SKILL,
      "skills/performance-oracle/SKILL.md": USER_SKILL.replace("skill-creator", "performance-oracle"),
      "prompts/plan.md": USER_COMMAND,
    }
    for (const [relative, content] of Object.entries(userFiles)) {
      await writeFile(path.join(piRoot, relative), content)
    }
    const bundle: PiBundle = {
      pluginName: "ce-datascience",
      prompts: [],
      skillDirs: [{ name: "ce-skill-one", sourceDir: fixtureSkillDir }],
      generatedSkills: [],
      agents: [],
      extensions: [],
    }

    await writePiBundle(piRoot, bundle)
    await writePiBundle(piRoot, bundle)

    for (const [relative, content] of Object.entries(userFiles)) {
      expect(await fs.readFile(path.join(piRoot, relative), "utf8")).toBe(content)
    }
  })
})

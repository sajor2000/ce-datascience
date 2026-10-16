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
import { writeGeminiBundle } from "../src/targets/gemini"
import { writeKiroBundle } from "../src/targets/kiro"
import { hashContent, readOwnershipLedger, writeOwnershipLedger } from "../src/targets/install-ownership"

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

async function findFiles(dir: string): Promise<string[]> {
  if (!(await exists(dir))) return []
  const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true })
  return entries.filter((entry) => entry.isFile()).map((entry) => path.join(entry.parentPath, entry.name))
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

describe("OpenCode updates use an ownership ledger", () => {
  test("a user file added inside a plugin skill directory survives update", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-ledger-userfile-"))
    const openCodeRoot = path.join(root, "opencode")
    await writeOpenCodeBundle(openCodeRoot, openCodeBundle(), "global")
    const userNote = path.join(openCodeRoot, "skills", "ce-skill-one", "my-notes.md")
    await fs.writeFile(userNote, "my notes")

    await writeOpenCodeBundle(openCodeRoot, openCodeBundle(), "global")

    expect(await fs.readFile(userNote, "utf8")).toBe("my notes")
  })

  test("a user-modified plugin file is backed up before it is replaced", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-ledger-modified-"))
    const openCodeRoot = path.join(root, "opencode")
    await writeOpenCodeBundle(openCodeRoot, openCodeBundle(), "global")
    const skillFile = path.join(openCodeRoot, "skills", "ce-skill-one", "SKILL.md")
    const pluginContent = await fs.readFile(skillFile, "utf8")
    await fs.writeFile(skillFile, "my edited version")

    await writeOpenCodeBundle(openCodeRoot, openCodeBundle(), "global")

    expect(await fs.readFile(skillFile, "utf8")).toBe(pluginContent)
    const backups = await findFiles(path.join(openCodeRoot, "ce-datascience", "backups"))
    const backedUp = backups.filter((file) => file.endsWith(path.join("skills", "ce-skill-one", "SKILL.md")))
    expect(backedUp).toHaveLength(1)
    expect(await fs.readFile(backedUp[0], "utf8")).toBe("my edited version")
  })

  test("a user skill at a current plugin name with no install record is left untouched", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-ledger-collision-"))
    const openCodeRoot = path.join(root, "opencode")
    const userSkill = path.join(openCodeRoot, "skills", "ce-skill-one", "SKILL.md")
    const userAgent = path.join(openCodeRoot, "agents", "ce-agent-one.md")
    await writeFile(userSkill, USER_SKILL)
    await writeFile(userAgent, USER_AGENT)

    await writeOpenCodeBundle(openCodeRoot, openCodeBundle(), "global")
    await writeOpenCodeBundle(openCodeRoot, openCodeBundle(), "global")

    expect(await fs.readFile(userSkill, "utf8")).toBe(USER_SKILL)
    expect(await fs.readFile(userAgent, "utf8")).toBe(USER_AGENT)
  })

  test("plugin-owned files dropped by an update are removed, user files beside them stay", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-ledger-removed-"))
    const openCodeRoot = path.join(root, "opencode")
    const twoSkills = openCodeBundle({
      skillDirs: [
        { name: "ce-skill-one", sourceDir: fixtureSkillDir },
        { name: "ce-skill-two", sourceDir: fixtureSkillDir },
      ],
    })
    await writeOpenCodeBundle(openCodeRoot, twoSkills, "global")
    const userNote = path.join(openCodeRoot, "skills", "ce-skill-two", "my-notes.md")
    await fs.writeFile(userNote, "my notes")

    await writeOpenCodeBundle(openCodeRoot, openCodeBundle({ agents: [] }), "global")

    expect(await exists(path.join(openCodeRoot, "skills", "ce-skill-two", "SKILL.md"))).toBe(false)
    expect(await exists(path.join(openCodeRoot, "agents", "ce-agent-one.md"))).toBe(false)
    expect(await fs.readFile(userNote, "utf8")).toBe("my notes")
    expect(await exists(path.join(openCodeRoot, "skills", "ce-skill-one", "SKILL.md"))).toBe(true)
  })
})

type LedgerTarget = {
  name: string
  // Install one or two skills; returns the skills directory and managed dir.
  install(root: string, skillNames: string[]): Promise<{ skillsDir: string; managedDir: string }>
}

const ledgerTargets: LedgerTarget[] = [
  {
    name: "codex",
    async install(root, skillNames) {
      const codexRoot = path.join(root, ".codex")
      await writeCodexBundle(codexRoot, {
        pluginName: "ce-datascience",
        prompts: [],
        skillDirs: skillNames.map((name) => ({ name, sourceDir: fixtureSkillDir })),
        generatedSkills: [],
        agents: [],
      })
      return { skillsDir: path.join(codexRoot, "skills", "ce-datascience"), managedDir: path.join(codexRoot, "ce-datascience") }
    },
  },
  {
    name: "gemini",
    async install(root, skillNames) {
      const geminiRoot = path.join(root, ".gemini")
      await writeGeminiBundle(geminiRoot, {
        pluginName: "ce-datascience",
        generatedSkills: [],
        skillDirs: skillNames.map((name) => ({ name, sourceDir: fixtureSkillDir })),
        agents: [],
        commands: [],
      })
      return { skillsDir: path.join(geminiRoot, "skills"), managedDir: path.join(geminiRoot, "ce-datascience") }
    },
  },
  {
    name: "pi",
    async install(root, skillNames) {
      const piRoot = path.join(root, ".pi")
      await writePiBundle(piRoot, {
        pluginName: "ce-datascience",
        prompts: [],
        skillDirs: skillNames.map((name) => ({ name, sourceDir: fixtureSkillDir })),
        generatedSkills: [],
        agents: [],
        extensions: [],
      })
      return { skillsDir: path.join(piRoot, "skills"), managedDir: path.join(piRoot, "ce-datascience") }
    },
  },
  {
    name: "kiro",
    async install(root, skillNames) {
      const kiroRoot = path.join(root, ".kiro")
      await writeKiroBundle(kiroRoot, {
        pluginName: "ce-datascience",
        agents: [],
        generatedSkills: [],
        skillDirs: skillNames.map((name) => ({ name, sourceDir: fixtureSkillDir })),
        steeringFiles: [],
        mcpServers: {},
      })
      return { skillsDir: path.join(kiroRoot, "skills"), managedDir: path.join(kiroRoot, "ce-datascience") }
    },
  },
]

for (const target of ledgerTargets) {
  describe(`${target.name} updates use an ownership ledger`, () => {
    test("user files survive, edited plugin files are backed up, dropped plugin files are removed", async () => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), `ce-ledger-${target.name}-`))
      const { skillsDir, managedDir } = await target.install(root, ["ce-skill-one", "ce-skill-two"])
      const userSkill = path.join(skillsDir, "my-own-skill", "SKILL.md")
      await writeFile(userSkill, USER_SKILL)
      const userNote = path.join(skillsDir, "ce-skill-one", "my-notes.md")
      await fs.writeFile(userNote, "my notes")
      const editedFile = path.join(skillsDir, "ce-skill-one", "SKILL.md")
      const pluginContent = await fs.readFile(editedFile, "utf8")
      await fs.writeFile(editedFile, "my edited version")

      await target.install(root, ["ce-skill-one"])

      expect(await fs.readFile(userSkill, "utf8")).toBe(USER_SKILL)
      expect(await fs.readFile(userNote, "utf8")).toBe("my notes")
      expect(await fs.readFile(editedFile, "utf8")).toBe(pluginContent)
      expect(await exists(path.join(skillsDir, "ce-skill-two"))).toBe(false)
      const backups = await findFiles(path.join(managedDir, "backups"))
      expect(backups.filter((file) => file.endsWith(path.join("ce-skill-one", "SKILL.md")))).toHaveLength(1)
    })
  })
}

describe("install ledger", () => {
  test("round-trips and drops entries that escape the target root", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-ledger-roundtrip-"))
    const managedDir = path.join(root, "ce-datascience")
    const ledger = {
      version: 1 as const,
      pluginName: "ce-datascience",
      files: { "skills/ce-plan/SKILL.md": "a".repeat(64), "agents/ce-x.md": "b".repeat(64) },
    }
    await writeOwnershipLedger(managedDir, ledger)
    expect(await readOwnershipLedger(managedDir, root, "ce-datascience")).toEqual(ledger)
    expect(await readOwnershipLedger(managedDir, root, "another-plugin")).toBeNull()

    await writeOwnershipLedger(managedDir, {
      ...ledger,
      files: { ...ledger.files, "../outside.md": "c".repeat(64), "/etc/passwd": "d".repeat(64) },
    })
    expect(await readOwnershipLedger(managedDir, root, "ce-datascience")).toEqual(ledger)
  })

  test("records the hash of every file the install wrote", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-ledger-hashes-"))
    const openCodeRoot = path.join(root, "opencode")
    await writeOpenCodeBundle(openCodeRoot, openCodeBundle(), "global")

    const ledger = await readOwnershipLedger(path.join(openCodeRoot, "ce-datascience"), openCodeRoot, "ce-datascience")
    const skillContent = await fs.readFile(path.join(openCodeRoot, "skills", "ce-skill-one", "SKILL.md"))
    expect(ledger?.files["skills/ce-skill-one/SKILL.md"]).toBe(hashContent(skillContent))
    expect(Object.keys(ledger?.files ?? {}).sort()).toEqual(["agents/ce-agent-one.md", "skills/ce-skill-one/SKILL.md"])
  })
})

describe("cleanup command never removes user-created content", () => {
  test("a user skill named like a stale entry survives `cleanup`", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ce-user-cleanup-"))
    const openCodeRoot = path.join(root, "opencode")
    const userSkill = path.join(openCodeRoot, "skills", "skill-creator", "SKILL.md")
    const userAgent = path.join(openCodeRoot, "agents", "performance-oracle.md")
    await writeFile(userSkill, USER_SKILL)
    await writeFile(userAgent, USER_AGENT)
    const repoRoot = path.join(import.meta.dir, "..")

    const proc = Bun.spawn(
      ["bun", "run", path.join(repoRoot, "src", "index.ts"), "cleanup", "--target", "opencode", "--opencode-home", openCodeRoot],
      { cwd: repoRoot, stdout: "pipe", stderr: "pipe" },
    )
    expect(await proc.exited).toBe(0)

    expect(await fs.readFile(userSkill, "utf8")).toBe(USER_SKILL)
    expect(await fs.readFile(userAgent, "utf8")).toBe(USER_AGENT)
  })
})

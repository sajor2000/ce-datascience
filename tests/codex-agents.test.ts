import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import {
  CODEX_AGENTS_BLOCK_END,
  CODEX_AGENTS_BLOCK_END_LEGACY,
  CODEX_AGENTS_BLOCK_START,
  CODEX_AGENTS_BLOCK_START_LEGACY,
  ensureCodexAgentsFile,
} from "../src/utils/codex-agents"

async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8")
}

describe("ensureCodexAgentsFile", () => {
  test("creates AGENTS.md with managed block when missing", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "codex-agents-"))
    await ensureCodexAgentsFile(tempRoot)

    const agentsPath = path.join(tempRoot, "AGENTS.md")
    const content = await readFile(agentsPath)
    expect(content).toContain(CODEX_AGENTS_BLOCK_START)
    expect(content).toContain("Tool mapping")
    expect(content).toContain("spawn_agent")
    expect(content).toContain("request_user_input")
    expect(content).toContain("TaskCreate/TaskUpdate/TaskList/TaskGet/TaskStop/TaskOutput")
    expect(content).toContain("use update_plan")
    expect(content).toContain(CODEX_AGENTS_BLOCK_END)
  })

  test("appends block without touching existing content", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "codex-agents-existing-"))
    const agentsPath = path.join(tempRoot, "AGENTS.md")
    await fs.writeFile(agentsPath, "# My Rules\n\nKeep this.")

    await ensureCodexAgentsFile(tempRoot)

    const content = await readFile(agentsPath)
    expect(content).toContain("# My Rules")
    expect(content).toContain("Keep this.")
    expect(content).toContain(CODEX_AGENTS_BLOCK_START)
    expect(content).toContain(CODEX_AGENTS_BLOCK_END)
  })

  test("replaces only the managed block when present", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "codex-agents-update-"))
    const agentsPath = path.join(tempRoot, "AGENTS.md")
    const seed = [
      "Intro text",
      CODEX_AGENTS_BLOCK_START,
      "old content",
      CODEX_AGENTS_BLOCK_END,
      "Footer text",
    ].join("\n")
    await fs.writeFile(agentsPath, seed)

    await ensureCodexAgentsFile(tempRoot)

    const content = await readFile(agentsPath)
    expect(content).toContain("Intro text")
    expect(content).toContain("Footer text")
    expect(content).not.toContain("old content")
    expect(content).toContain(CODEX_AGENTS_BLOCK_START)
    expect(content).toContain(CODEX_AGENTS_BLOCK_END)
  })
})

describe("ensureCodexAgentsFile legacy migration", () => {
  test("replaces a retired Compound tool map in place instead of stacking a second block", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "codex-agents-legacy-"))
    const agentsPath = path.join(tempRoot, "AGENTS.md")
    const seed = [
      "# Personal rules",
      CODEX_AGENTS_BLOCK_START_LEGACY,
      "old compound mapping",
      CODEX_AGENTS_BLOCK_END_LEGACY,
      "Footer text",
    ].join("\n")
    await fs.writeFile(agentsPath, seed)

    await ensureCodexAgentsFile(tempRoot)

    const content = await readFile(agentsPath)
    expect(content).toContain("# Personal rules")
    expect(content).toContain("Footer text")
    expect(content).not.toContain("old compound mapping")
    expect(content).not.toContain(CODEX_AGENTS_BLOCK_START_LEGACY)
    expect(content).not.toContain(CODEX_AGENTS_BLOCK_END_LEGACY)
    expect(content.split(CODEX_AGENTS_BLOCK_START).length).toBe(2)
    expect(content).toContain(CODEX_AGENTS_BLOCK_END)
  })

  test("the managed block is not the block method-setup check-health reports as retired", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "codex-agents-health-"))
    await ensureCodexAgentsFile(tempRoot)

    const healthScript = path.join(
      import.meta.dir,
      "..",
      "plugins",
      "methodsmith",
      "skills",
      "method-setup",
      "scripts",
      "check-health",
    )
    const proc = Bun.spawn(["bash", healthScript], {
      cwd: tempRoot,
      env: { ...process.env, CODEX_HOME: tempRoot },
      stdout: "pipe",
      stderr: "pipe",
    })
    expect(await proc.exited).toBe(0)
    const stdout = await new Response(proc.stdout).text()
    expect(stdout).not.toContain("Legacy Compound Codex tool map")
  })
})

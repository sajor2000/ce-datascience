import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"

const repoRoot = path.join(import.meta.dir, "..")
const pluginRoot = path.join(repoRoot, "plugins", "ce-datascience")

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function runInstall(args: string[]): Promise<{ stdout: string; stderr: string }> {
  const proc = Bun.spawn(["bun", "run", "src/index.ts", "install", pluginRoot, ...args], {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  })
  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  if (exitCode !== 0) {
    throw new Error(`install ${args.join(" ")} failed (exit ${exitCode}).\nstdout: ${stdout}\nstderr: ${stderr}`)
  }
  return { stdout, stderr }
}

async function assertInstalledPath(filePath: string, installRoot: string): Promise<void> {
  expect(path.isAbsolute(filePath)).toBe(true)
  expect(path.resolve(filePath).startsWith(path.resolve(installRoot) + path.sep)).toBe(true)
  expect(await exists(filePath)).toBe(true)
}

describe("real ce-datascience platform install smoke", () => {
  test("implemented targets install loadable files and rewrite local MCP paths to installed copies", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ce-platform-smoke-"))

    const codexRoot = path.join(tempRoot, "codex-home")
    await runInstall(["--to", "codex", "--include-skills", "--codex-home", codexRoot])
    expect(await exists(path.join(codexRoot, "agents", "ce-datascience", "ce-security-reviewer.toml"))).toBe(true)
    const codexSkillRunPy = path.join(codexRoot, "skills", "ce-datascience", "ce-mcp-server", "mcp_server", "run.py")
    expect(await exists(codexSkillRunPy)).toBe(true)
    expect(await exists(path.join(codexRoot, "skills", "ce-datascience", "ce-mcp-server", "mcp_server", "__pycache__"))).toBe(false)
    const codexConfig = await fs.readFile(path.join(codexRoot, "config.toml"), "utf8")
    expect(codexConfig).toContain(`"${codexSkillRunPy}"`)

    const opencodeRoot = path.join(tempRoot, "opencode-workspace")
    await runInstall(["--to", "opencode", "--output", opencodeRoot])
    expect(await exists(path.join(opencodeRoot, ".opencode", "agents", "ce-security-reviewer.md"))).toBe(true)
    const opencodeSkillRunPy = path.join(opencodeRoot, ".opencode", "skills", "ce-mcp-server", "mcp_server", "run.py")
    expect(await exists(path.join(opencodeRoot, ".opencode", "skills", "ce-mcp-server", "mcp_server", "__pycache__"))).toBe(false)
    const opencodeConfig = JSON.parse(await fs.readFile(path.join(opencodeRoot, "opencode.json"), "utf8")) as {
      mcp: { "ce-datascience": { command: string[] } }
    }
    await assertInstalledPath(opencodeConfig.mcp["ce-datascience"].command[1], opencodeRoot)
    expect(opencodeConfig.mcp["ce-datascience"].command[1]).toBe(opencodeSkillRunPy)

    const piRoot = path.join(tempRoot, ".pi")
    await runInstall(["--to", "pi", "--pi-home", piRoot])
    expect(await exists(path.join(piRoot, "agents", "ce-security-reviewer.md"))).toBe(true)
    const piSkillRunPy = path.join(piRoot, "skills", "ce-mcp-server", "mcp_server", "run.py")
    const piConfig = JSON.parse(await fs.readFile(path.join(piRoot, "ce-datascience", "mcporter.json"), "utf8")) as {
      mcpServers: { "ce-datascience": { args: string[] } }
    }
    await assertInstalledPath(piConfig.mcpServers["ce-datascience"].args[0], piRoot)
    expect(piConfig.mcpServers["ce-datascience"].args[0]).toBe(piSkillRunPy)

    const geminiRoot = path.join(tempRoot, "gemini")
    await runInstall(["--to", "gemini", "--output", geminiRoot])
    expect(await exists(path.join(geminiRoot, ".gemini", "agents", "ce-security-reviewer.md"))).toBe(true)
    const geminiSkillRunPy = path.join(geminiRoot, ".gemini", "skills", "ce-mcp-server", "mcp_server", "run.py")
    const geminiSettings = JSON.parse(await fs.readFile(path.join(geminiRoot, ".gemini", "settings.json"), "utf8")) as {
      mcpServers: { "ce-datascience": { args: string[] } }
    }
    await assertInstalledPath(geminiSettings.mcpServers["ce-datascience"].args[0], geminiRoot)
    expect(geminiSettings.mcpServers["ce-datascience"].args[0]).toBe(geminiSkillRunPy)

    const kiroRoot = path.join(tempRoot, "kiro")
    await runInstall(["--to", "kiro", "--output", kiroRoot])
    expect(await exists(path.join(kiroRoot, ".kiro", "agents", "ce-security-reviewer.json"))).toBe(true)
    const kiroSkillRunPy = path.join(kiroRoot, ".kiro", "skills", "ce-mcp-server", "mcp_server", "run.py")
    const kiroSettings = JSON.parse(await fs.readFile(path.join(kiroRoot, ".kiro", "settings", "mcp.json"), "utf8")) as {
      mcpServers: { "ce-datascience": { args: string[] } }
    }
    await assertInstalledPath(kiroSettings.mcpServers["ce-datascience"].args[0], kiroRoot)
    expect(kiroSettings.mcpServers["ce-datascience"].args[0]).toBe(kiroSkillRunPy)
  })

  test("Codex agent bridge mode does not duplicate native-plugin skill content", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ce-codex-bridge-smoke-"))
    const codexRoot = path.join(tempRoot, "codex-home")

    const { stdout } = await runInstall(["--to", "codex", "--codex-home", codexRoot])

    expect(stdout).toContain("MCP server tools")
    expect(await exists(path.join(codexRoot, "agents", "ce-datascience", "ce-security-reviewer.toml"))).toBe(true)
    expect(await exists(path.join(codexRoot, "skills", "ce-datascience", "ce-mcp-server", "SKILL.md"))).toBe(false)
    expect(await exists(path.join(codexRoot, "config.toml"))).toBe(false)
  })
})

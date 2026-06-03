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

async function run(command: string[], cwd = repoRoot): Promise<{ stdout: string; stderr: string }> {
  const proc = Bun.spawn(command, {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  })
  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  if (exitCode !== 0) {
    throw new Error(`${command.join(" ")} failed with ${exitCode}\nstdout:\n${stdout}\nstderr:\n${stderr}`)
  }
  return { stdout, stderr }
}

async function collectFiles(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(root, entry.name)
    if (entry.isDirectory()) return collectFiles(fullPath)
    return [fullPath]
  }))
  return nested.flat()
}

async function publicSkillNames(): Promise<string[]> {
  const entries = await fs.readdir(path.join(pluginRoot, "skills"), { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("ce-"))
    .map((entry) => entry.name)
    .sort()
}

describe("corporate install artifacts", () => {
  test("Claude local aliases are managed, idempotent, and preserve user-owned commands", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ce-claude-aliases-"))
    const commandsDir = path.join(tempRoot, "commands")
    const installer = path.join(repoRoot, "scripts", "install", "install-claude-aliases.sh")

    await run(["bash", installer, "--plugin-dir", pluginRoot, "--commands-dir", commandsDir])

    const skills = await publicSkillNames()
    const aliases = (await fs.readdir(commandsDir)).filter((file) => file.startsWith("ce-") && file.endsWith(".md"))
    expect(aliases.sort()).toEqual(skills.map((skill) => `${skill}.md`).sort())

    const setupAlias = await fs.readFile(path.join(commandsDir, "ce-setup.md"), "utf8")
    expect(setupAlias).toContain("CE_DATASCIENCE_ALIAS_MANAGED")
    expect(setupAlias).toContain("/ce-datascience:ce-setup $ARGUMENTS")
    expect(setupAlias).toContain("$ARGUMENTS")

    await fs.writeFile(
      path.join(commandsDir, "ce-old.md"),
      "<!-- CE_DATASCIENCE_ALIAS_MANAGED v1 plugin=ce-datascience skill=ce-old -->\nstale\n",
    )
    await fs.writeFile(path.join(commandsDir, "ce-plan.md"), "user-owned command\n")

    await run(["bash", installer, "--plugin-dir", pluginRoot, "--commands-dir", commandsDir])

    expect(await exists(path.join(commandsDir, "ce-old.md"))).toBe(false)
    expect(await fs.readFile(path.join(commandsDir, "ce-plan.md"), "utf8")).toBe("user-owned command\n")

    await run(["bash", installer, "--commands-dir", commandsDir, "--uninstall"])

    expect(await exists(path.join(commandsDir, "ce-setup.md"))).toBe(false)
    expect(await fs.readFile(path.join(commandsDir, "ce-plan.md"), "utf8")).toBe("user-owned command\n")
  })

  test("packaging stages offline Claude, alias, and Codex artifacts without dev/cache files", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ce-corporate-package-"))
    const stagingDir = path.join(tempRoot, "stage")
    const outputDir = path.join(tempRoot, "out")

    await run([
      "bash",
      path.join(repoRoot, "scripts", "package", "corporate-artifacts.sh"),
      "--staging-dir",
      stagingDir,
      "--output-dir",
      outputDir,
      "--skip-zip",
    ])

    const claudePlugin = path.join(stagingDir, "ce-datascience-plugin", "ce-datascience")
    expect(await exists(path.join(claudePlugin, ".claude-plugin", "plugin.json"))).toBe(true)
    expect(await exists(path.join(claudePlugin, "skills", "ce-setup", "SKILL.md"))).toBe(true)

    const pluginFiles = await collectFiles(claudePlugin)
    expect(pluginFiles.filter((file) => /(__pycache__|\.pyc$|\.pyo$|node_modules|\.git)/.test(file))).toEqual([])

    const aliasDir = path.join(stagingDir, "ce-datascience-claude-aliases")
    expect(await exists(path.join(aliasDir, "install-claude-aliases.sh"))).toBe(true)
    const setupAlias = await fs.readFile(path.join(aliasDir, "commands", "ce-setup.md"), "utf8")
    expect(setupAlias).toContain("/ce-datascience:ce-setup $ARGUMENTS")

    const codexPackage = path.join(stagingDir, "ce-datascience-codex-local")
    expect(await exists(path.join(codexPackage, ".agents", "plugins", "marketplace.json"))).toBe(true)
    expect(await exists(path.join(codexPackage, "plugins", "ce-datascience", ".codex-plugin", "plugin.json"))).toBe(true)
    expect(await exists(path.join(codexPackage, "install-codex-offline.sh"))).toBe(true)
    expect(await exists(path.join(codexPackage, "codex-agent-bridge", "config.toml.template"))).toBe(true)
    expect(await exists(path.join(codexPackage, "codex-agent-bridge", "agents", "ce-datascience", "ce-security-reviewer.toml"))).toBe(true)
  })

  test("Codex offline installer writes local marketplace, bridge agents, and installed MCP paths", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ce-codex-offline-"))
    const stagingDir = path.join(tempRoot, "stage")
    const outputDir = path.join(tempRoot, "out")
    await run([
      "bash",
      path.join(repoRoot, "scripts", "package", "corporate-artifacts.sh"),
      "--staging-dir",
      stagingDir,
      "--output-dir",
      outputDir,
      "--skip-zip",
    ])

    const codexPackage = path.join(stagingDir, "ce-datascience-codex-local")
    const codexHome = path.join(tempRoot, ".codex")
    const agentsHome = path.join(tempRoot, ".agents")
    await fs.mkdir(codexHome, { recursive: true })
    await fs.writeFile(path.join(codexHome, "config.toml"), 'model = "gpt-5-codex"\n')

    await run([
      "bash",
      path.join(codexPackage, "install-codex-offline.sh"),
      "--source",
      codexPackage,
      "--codex-home",
      codexHome,
      "--agents-home",
      agentsHome,
    ])

    const installedPlugin = path.join(agentsHome, "plugins", "ce-datascience")
    expect(await exists(path.join(installedPlugin, ".codex-plugin", "plugin.json"))).toBe(true)
    expect(await exists(path.join(codexHome, "agents", "ce-datascience", "ce-security-reviewer.toml"))).toBe(true)

    const marketplace = JSON.parse(await fs.readFile(path.join(agentsHome, "plugins", "marketplace.json"), "utf8")) as {
      plugins: Array<{ name: string; source: { path: string } }>
    }
    const entry = marketplace.plugins.find((plugin) => plugin.name === "ce-datascience")
    expect(entry?.source.path).toBe("./plugins/ce-datascience")

    const config = await fs.readFile(path.join(codexHome, "config.toml"), "utf8")
    const installedRunPy = path.join(installedPlugin, "skills", "ce-mcp-server", "mcp_server", "run.py")
    expect(config).toContain('model = "gpt-5-codex"')
    expect(config).toContain(installedRunPy)
    expect(config).not.toContain(path.join(repoRoot, "plugins", "ce-datascience"))
  })

  test("Claude MCP manifest uses plugin-root paths that converters can rewrite", async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(pluginRoot, ".mcp.json"), "utf8")) as {
      mcpServers: { "ce-datascience": { args: string[] } }
    }
    expect(manifest.mcpServers["ce-datascience"].args[0]).toBe("${CLAUDE_PLUGIN_ROOT}/skills/ce-mcp-server/mcp_server/run.py")
    expect(manifest.mcpServers["ce-datascience"].args[0]).not.toContain("plugins/ce-datascience/skills")
  })

  test("setup intake supports corporate no-install mode and keeps Quarto optional", async () => {
    const setupSkill = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "SKILL.md"), "utf8")
    const healthScript = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "scripts", "check-health"), "utf8")

    expect(setupSkill).toContain("--locked-down")
    expect(setupSkill).toContain("--no-install")
    expect(setupSkill).toContain("do not offer or run Homebrew, pip, npm, GitHub CLI, or Quarto install commands")
    expect(healthScript).toContain("--locked-down|--no-install")
    expect(healthScript).toContain("quarto|quarto --version|optional")
    expect(healthScript).toContain("locked-down mode: no install command offered")
  })
})

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
  test("easy installer exposes Compound Engineering-style setup paths", async () => {
    const installer = path.join(repoRoot, "install.sh")
    const codexHome = path.join(os.tmpdir(), "ce-easy-install-codex")
    const agentsHome = path.join(os.tmpdir(), "ce-easy-install-agents")

    const claude = await run(["bash", installer, "claude", "--aliases", "--dry-run"])
    expect(claude.stdout).toContain("claude plugin marketplace add")
    expect(claude.stdout).toContain("claude plugin install ce-datascience@ce-datascience-plugin")
    expect(claude.stdout).toContain("install-claude-aliases.sh")
    expect(claude.stdout).toContain("/ce-setup")

    const codex = await run([
      "bash",
      installer,
      "codex",
      "--codex-home",
      codexHome,
      "--agents-home",
      agentsHome,
      "--dry-run",
    ])
    expect(codex.stdout).toContain("codex plugin marketplace add")
    expect(codex.stdout).toContain("bun run src/index.ts install ./plugins/ce-datascience --to codex")
    expect(codex.stdout).toContain(codexHome)
    expect(codex.stdout).toContain("Restart Codex, open /plugins, install CE DataScience")

    const windowsCodex = await run([
      "bash",
      installer,
      "codex",
      "--codex-home",
      "C:/Users/JCR/.codex",
      "--agents-home",
      "C:/Users/JCR/.agents",
      "--dry-run",
    ])
    expect(windowsCodex.stdout).toContain('--codex-home "C:/Users/JCR/.codex"')
    expect(windowsCodex.stdout).not.toContain(`${repoRoot}/C:/Users/JCR/.codex`)

    const windowsOfflineCodex = await run([
      "bash",
      path.join(repoRoot, "scripts", "install", "install-codex-offline.sh"),
      "--source",
      pluginRoot,
      "--codex-home",
      "C:/Users/JCR/.codex",
      "--agents-home",
      "C:/Users/JCR/.agents",
      "--dry-run",
    ])
    expect(windowsOfflineCodex.stdout).toContain("Marketplace: C:/Users/JCR/.agents/plugins/marketplace.json")
    expect(windowsOfflineCodex.stdout).toContain("Plugin:      C:/Users/JCR/.codex/plugins/ce-datascience")
    expect(windowsOfflineCodex.stdout).not.toContain(`${repoRoot}/C:/Users/JCR/.codex`)
    expect(windowsOfflineCodex.stdout).not.toContain(`${repoRoot}/C:/Users/JCR/.agents`)

    const powershellInstaller = await fs.readFile(path.join(repoRoot, "install.ps1"), "utf8")
    expect(powershellInstaller).toContain("param(")
    expect(powershellInstaller).toContain("Install-ClaudeAliases")
    expect(powershellInstaller).toContain("Install-CodexOffline")
    expect(powershellInstaller).toContain("ConvertTo-Json")
    expect(powershellInstaller).toContain("CE_DATASCIENCE_ALIAS_MANAGED")
    expect(powershellInstaller).toContain('Test-CommandAvailable "python3"')
    expect(powershellInstaller).toContain('Test-CommandAvailable "py"')

    const readme = await fs.readFile(path.join(repoRoot, "README.md"), "utf8")
    const setupDocs = await fs.readFile(path.join(repoRoot, "docs", "setup.md"), "utf8")
    const pluginReadme = await fs.readFile(path.join(pluginRoot, "README.md"), "utf8")

    for (const doc of [readme, setupDocs, pluginReadme]) {
      expect(doc).toContain("bash install.sh claude --aliases")
      expect(doc).toContain("bash install.sh codex")
      expect(doc).toContain(".\\install.ps1 claude -Aliases")
      expect(doc).toContain(".\\install.ps1 codex")
    }
    expect(setupDocs).toContain("Windows PowerShell")
    expect(setupDocs).toContain("Git Bash")
  })

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
    expect(await exists(path.join(aliasDir, "install.ps1"))).toBe(true)
    const setupAlias = await fs.readFile(path.join(aliasDir, "commands", "ce-setup.md"), "utf8")
    expect(setupAlias).toContain("/ce-datascience:ce-setup $ARGUMENTS")

    const codexPackage = path.join(stagingDir, "ce-datascience-codex-local")
    expect(await exists(path.join(codexPackage, ".agents", "plugins", "marketplace.json"))).toBe(true)
    expect(await exists(path.join(codexPackage, "plugins", "ce-datascience", ".codex-plugin", "plugin.json"))).toBe(true)
    expect(await exists(path.join(codexPackage, "install-codex-offline.sh"))).toBe(true)
    expect(await exists(path.join(codexPackage, "install.ps1"))).toBe(true)
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
    const codexHome = path.join(tempRoot, "profiles", "research", ".codex")
    const agentsHome = path.join(tempRoot, "profiles", "research", ".agents")

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

    const marketplaceRoot = path.dirname(agentsHome)
    const installedPlugin = path.join(marketplaceRoot, ".codex", "plugins", "ce-datascience")
    expect(await exists(path.join(installedPlugin, ".codex-plugin", "plugin.json"))).toBe(true)
    expect(await exists(path.join(agentsHome, "plugins", "ce-datascience"))).toBe(false)
    expect(await exists(path.join(codexHome, "agents", "ce-datascience", "ce-security-reviewer.toml"))).toBe(true)

    const marketplace = JSON.parse(await fs.readFile(path.join(agentsHome, "plugins", "marketplace.json"), "utf8")) as {
      plugins: Array<{ name: string; source: { path: string } }>
    }
    const entry = marketplace.plugins.find((plugin) => plugin.name === "ce-datascience")
    expect(entry?.source.path).toBe("./.codex/plugins/ce-datascience")
    const marketplaceResolvedPlugin = path.resolve(marketplaceRoot, entry?.source.path ?? "")
    expect(marketplaceResolvedPlugin).toBe(installedPlugin)
    expect(await exists(path.join(marketplaceResolvedPlugin, ".codex-plugin", "plugin.json"))).toBe(true)

    const config = await fs.readFile(path.join(codexHome, "config.toml"), "utf8")
    const installedRunPy = path.join(installedPlugin, "skills", "ce-mcp-server", "mcp_server", "run.py")
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
    expect(healthScript).toContain("git|command -v git|optional")
    expect(healthScript).toContain("locked-down mode: no install command offered")
    expect(setupSkill).toContain("optional tools are reported as yellow but do not require Phase 3")
  })

  test("setup narrows auto-detected both language after Python-only IDE selection", async () => {
    const setupSkill = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "SKILL.md"), "utf8")

    expect(setupSkill).toContain("Do not treat `language_detect.primary=both` as a final user preference")
    expect(setupSkill).toContain("If `detected_language=both` and the user selects Marimo or JupyterLab / Jupyter Notebook, set `stack_profile.language=python`")
    expect(setupSkill).toContain("If `detected_language=both` and the user selects RStudio, set `stack_profile.language=r`")
    expect(setupSkill).toContain("If `detected_language=both` and the user selects VS Code or Quarto, keep `stack_profile.language=both`")
    expect(setupSkill).toContain("Do not ask R data-library, R statistical-package, R environment-manager, or R project-type questions after a Python-only IDE choice such as Marimo or Jupyter")
    expect(setupSkill).toContain("Do not ask Python package questions after an RStudio-only choice")
    expect(setupSkill).toContain("Present library options based on the refined `stack_profile.language`, not the raw auto-detected language")
  })

  test("setup consumes verified connection handoffs without requiring data_root", async () => {
    const setupSkill = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "SKILL.md"), "utf8")
    const configTemplate = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "references", "config-template.yaml"), "utf8")
    const stackTemplate = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "references", "stack-profile-template.yaml"), "utf8")
    const setupDocs = await fs.readFile(path.join(repoRoot, "docs", "setup.md"), "utf8")

    const connectionSignal = "__CE_CONNECTION__ name=<connection-name> type=<postgres|sqlite|duckdb|other> database=<db-name> auth=<auth-mode> status=verified"
    expect(setupSkill).toContain(connectionSignal)
    expect(setupSkill).toContain("Verified database connection detected: healthmap-connection (postgres, database=healthmap_dev, auth=entra).")
    expect(setupSkill).toContain("SQL database (recommended: use verified healthmap-connection)")
    expect(setupSkill).toContain("Do not write the connection into `data_root`")
    expect(setupSkill).toContain("set `stack_profile.data_root: null`")
    expect(setupSkill).toContain("data_wave_register(location=...)")

    expect(configTemplate).toContain("data_connection:")
    expect(configTemplate).toContain("name: healthmap-connection")
    expect(stackTemplate).toContain("data_connection:")
    expect(stackTemplate).toContain("status: verified")
    expect(stackTemplate).toContain("For database-first projects, this may stay null")
    expect(setupDocs).toContain("__CE_CONNECTION__ name=healthmap-connection type=postgres database=healthmap_dev auth=entra status=verified")
  })
})

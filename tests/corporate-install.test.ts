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
  return (await Promise.all(entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("ce-"))
    .map(async (entry) => (await exists(path.join(pluginRoot, "skills", entry.name, "SKILL.md"))) ? entry.name : null)))
    .filter((name): name is string => name !== null)
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

    const doctor = await run(["bash", installer, "doctor"])
    expect(doctor.stdout).toContain("CE DataScience install check")
    expect(doctor.stdout).toContain("Standard laptop:")
    expect(doctor.stdout).toContain("Locked-down or corporate laptop:")
    expect(doctor.stdout).toContain("Codex always requires the final host step")

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
    expect(powershellInstaller).not.toContain("ce-mcp-server")
    expect(powershellInstaller).toContain('"doctor" { Show-Doctor }')

    const readme = await fs.readFile(path.join(repoRoot, "README.md"), "utf8")
    const setupDocs = await fs.readFile(path.join(repoRoot, "docs", "setup.md"), "utf8")
    const pluginReadme = await fs.readFile(path.join(pluginRoot, "README.md"), "utf8")

    for (const doc of [readme, setupDocs, pluginReadme]) {
      expect(doc).toContain("bash install.sh claude --aliases")
      expect(doc).toContain("bash install.sh codex")
      expect(doc).toContain(".\\install.ps1 claude -Aliases")
      expect(doc).toContain(".\\install.ps1 codex")
      expect(doc).toContain("install.sh doctor")
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
    expect(await exists(path.join(codexPackage, "codex-agent-bridge", "config.toml.template"))).toBe(false)
    expect(await exists(path.join(codexPackage, "codex-agent-bridge", "agents", "ce-datascience", "ce-security-reviewer.toml"))).toBe(true)
  })

  test("Codex offline installer writes local marketplace and bridge agents", async () => {
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

    expect(await exists(path.join(installedPlugin, ".mcp.json"))).toBe(false)

    const configPath = path.join(codexHome, "config.toml")
    await fs.mkdir(codexHome, { recursive: true })
    await fs.writeFile(
      configPath,
      [
        "[features]",
        "user_owned = true",
        "# BEGIN CE DataScience plugin MCP -- do not edit this block",
        "[mcp_servers.ce-datascience]",
        'command = "python3"',
        'args = ["/old/ce-mcp-server/run.py"]',
        "# END CE DataScience plugin MCP",
        "",
      ].join("\n"),
    )
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
    const cleanedConfig = await fs.readFile(configPath, "utf8")
    expect(cleanedConfig).toContain("user_owned = true")
    expect(cleanedConfig).not.toContain("BEGIN CE DataScience plugin MCP")
  })

  test("setup intake supports corporate no-install mode and keeps Quarto optional", async () => {
    const setupSkill = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "SKILL.md"), "utf8")
    const normalizedSetupSkill = setupSkill.replace(/\s+/g, " ")
    const healthScript = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "scripts", "check-health"), "utf8")

    expect(setupSkill).toContain("--locked-down")
    expect(setupSkill).toContain("--no-install")
    expect(setupSkill).toContain("do not offer or run Homebrew, pip, npm, GitHub CLI, or Quarto install commands")
    expect(healthScript).toContain("--locked-down|--no-install")
    expect(healthScript).toContain("quarto|quarto --version|optional")
    expect(healthScript).toContain("git|command -v git|optional")
    expect(healthScript).toContain("locked-down mode: no install command offered")
    expect(normalizedSetupSkill).toContain("optional tools are reported as yellow but do not require Phase 3")
  })

  test("setup uses a concise evidence-first profile before optional detail", async () => {
    const setupSkill = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "SKILL.md"), "utf8")
    const normalizedSetupSkill = setupSkill.replace(/\s+/g, " ")
    const inference = await fs.readFile(
      path.join(pluginRoot, "skills", "ce-setup", "references", "profile-inference.md"),
      "utf8",
    )
    const survey = await fs.readFile(
      path.join(pluginRoot, "skills", "ce-setup", "references", "full-survey.md"),
      "utf8",
    )

    expect(normalizedSetupSkill).toContain("Detected profile")
    expect(normalizedSetupSkill).toContain("Continue with detected profile")
    expect(normalizedSetupSkill).toContain("Adjust a field")
    expect(normalizedSetupSkill).toContain("Full survey")
    expect(normalizedSetupSkill).toContain("Never default an unknown repository to `both`")
    expect(normalizedSetupSkill).toContain("ask one focused question")
    expect(normalizedSetupSkill).toContain("Do not request data libraries, statistical packages")
    expect(normalizedSetupSkill).toContain("stack_profile.inference")
    expect(normalizedSetupSkill).toContain("Do not ask R data-library, R statistical-package, R environment-manager, or R project-type questions after a Python-only IDE choice such as Marimo or Jupyter")
    expect(normalizedSetupSkill).toContain("Do not ask Python package questions after an RStudio-only choice")
    expect(inference).toContain("value`, `confidence`, and short `evidence`")
    expect(inference).toContain("generic EHR")
    expect(inference).toContain("generic data")
    expect(survey).toContain("only after the user explicitly selects **Full survey**")
    expect(survey).toContain("Treat `both` as a deliberate user choice")
  })

  test("setup consumes verified connection handoffs without requiring data_root", async () => {
    const setupSkill = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "SKILL.md"), "utf8")
    const normalizedSetupSkill = setupSkill.replace(/\s+/g, " ")
    const configTemplate = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "references", "config-template.yaml"), "utf8")
    const stackTemplate = await fs.readFile(path.join(pluginRoot, "skills", "ce-setup", "references", "stack-profile-template.yaml"), "utf8")
    const setupDocs = await fs.readFile(path.join(repoRoot, "docs", "setup.md"), "utf8")

    const connectionSignal = "__CE_CONNECTION__ name=<connection-name> type=<postgres|sqlite|duckdb|other> database=<db-name> auth=<auth-mode> status=verified"
    expect(setupSkill).toContain(connectionSignal)
    expect(normalizedSetupSkill).toContain("report it as high-confidence database evidence")
    expect(normalizedSetupSkill).toContain("Do not write the connection into `data_root`")
    expect(normalizedSetupSkill).toContain("stack_profile.data_root: null")
    expect(setupSkill).toContain("data_wave_register(location=...)")

    expect(configTemplate).toContain("data_connection:")
    expect(configTemplate).toContain("name: healthmap-connection")
    expect(stackTemplate).toContain("data_connection:")
    expect(stackTemplate).toContain("status: verified")
    expect(stackTemplate).toContain("For database-first projects, this may stay null")
    expect(setupDocs).toContain("__CE_CONNECTION__ name=healthmap-connection type=postgres database=healthmap_dev auth=entra status=verified")
  })

  test("every public documentation entry point explains installation and first use", async () => {
    const rootReadme = await fs.readFile(path.join(repoRoot, "README.md"), "utf8")
    const setupDocs = await fs.readFile(path.join(repoRoot, "docs", "setup.md"), "utf8")
    const pluginReadme = await fs.readFile(path.join(pluginRoot, "README.md"), "utf8")
    const docsIndex = await fs.readFile(path.join(repoRoot, "docs", "index.html"), "utf8")
    const markdownContracts = [
      {
        install: rootReadme.match(/## Get started like Compound Engineering[\s\S]*?(?=\n### Use the plugin after installation)/)?.[0],
        firstUse: rootReadme.match(/### Use the plugin after installation[\s\S]*?(?=\n### Locked-down or demo laptop)/)?.[0],
      },
      {
        install: setupDocs.match(/## 1\. Easiest Install Path[\s\S]*?(?=\n## 2\.)/)?.[0],
        firstUse: setupDocs.match(/## 7\. First Run In A Project[\s\S]*?(?=\n## 8\.)/)?.[0],
      },
      {
        install: pluginReadme.match(/## Getting Started[\s\S]*?(?=\n### Use the plugin after installation)/)?.[0],
        firstUse: pluginReadme.match(/### Use the plugin after installation[\s\S]*?(?=\nLocked-down laptops)/)?.[0],
      },
    ]

    for (const contract of markdownContracts) {
      expect(contract.install).toBeDefined()
      expect(contract.firstUse).toBeDefined()
      const install = contract.install ?? ""
      const firstUse = contract.firstUse ?? ""
      const firstUseSetup = firstUse.indexOf("/ce-datascience:ce-setup")
      const firstUseWorkflow = firstUse.indexOf("/ce-datascience:ce-workflow")

      expect(install).toContain("bash install.sh claude --aliases")
      expect(install).toContain("bash install.sh codex")
      expect(install).toContain("pi install npm:pi-subagents")
      expect(install).toContain("--to pi --pi-home")
      expect(install.indexOf("bash install.sh codex")).toBeLessThan(install.indexOf("/plugins"))
      expect(install).toMatch(/restart/i)
      expect(firstUse).toMatch(/project (?:or study )?(?:directory|repo)/i)
      expect(firstUseSetup).toBeGreaterThanOrEqual(0)
      expect(firstUseSetup).toBeLessThan(firstUseWorkflow)
    }

    const docsIndexSection = docsIndex.match(/<h2>Install and use CE DataScience<\/h2>[\s\S]*?(?=\n    <p>\n      <a href=)/)?.[0]
    expect(docsIndexSection).toBeDefined()
    const indexSection = docsIndexSection ?? ""
    const claudeInstall = indexSection.indexOf("bash install.sh claude --aliases")
    const claudeRestart = indexSection.indexOf("After Claude Code restarts")
    const claudeSetup = indexSection.indexOf("/ce-datascience:ce-setup")
    const claudeWorkflow = indexSection.indexOf("/ce-datascience:ce-workflow")
    const codexInstall = indexSection.indexOf("bash install.sh codex")
    const codexPlugins = indexSection.indexOf("/plugins", codexInstall)
    const codexSetup = indexSection.indexOf("<code>ce-setup</code>", codexPlugins)
    const codexWorkflow = indexSection.indexOf("<code>ce-workflow</code>", codexSetup)

    expect(claudeInstall).toBeLessThan(claudeRestart)
    expect(claudeRestart).toBeLessThan(claudeSetup)
    expect(claudeSetup).toBeLessThan(claudeWorkflow)
    expect(codexInstall).toBeLessThan(codexPlugins)
    expect(codexPlugins).toBeLessThan(codexSetup)
    expect(codexSetup).toBeLessThan(codexWorkflow)
    expect(indexSection).toContain("project or study directory")
    expect(indexSection).toContain("pi install npm:pi-subagents")
  })

  test("public documentation ships and references both workflow images", async () => {
    const rootReadme = await fs.readFile(path.join(repoRoot, "README.md"), "utf8")
    const setupDocs = await fs.readFile(path.join(repoRoot, "docs", "setup.md"), "utf8")
    const pluginReadme = await fs.readFile(path.join(pluginRoot, "README.md"), "utf8")
    const docsIndex = await fs.readFile(path.join(repoRoot, "docs", "index.html"), "utf8")
    const imageNames = [
      "ce-datascience-package-workflow.png",
      "ce-datascience-skill-commands.png",
    ]

    for (const imageName of imageNames) {
      const image = await fs.stat(path.join(repoRoot, "docs", imageName))
      expect(image.isFile()).toBe(true)
      expect(image.size).toBeGreaterThan(100_000)
      expect(rootReadme).toContain(`docs/${imageName}`)
      expect(setupDocs).toContain(`](${imageName})`)
      expect(pluginReadme).toContain(`../../docs/${imageName}`)
      expect(docsIndex).toContain(`src="${imageName}"`)
    }
  })

  test("user-facing docs recommend optional scientific research add-ons safely", async () => {
    const rootReadme = await fs.readFile(path.join(repoRoot, "README.md"), "utf8")
    const setupDocs = await fs.readFile(path.join(repoRoot, "docs", "setup.md"), "utf8")
    const pluginReadme = await fs.readFile(path.join(pluginRoot, "README.md"), "utf8")
    const sections = [
      rootReadme.match(/### Recommended research add-ons[\s\S]*?(?=\n### )/)?.[0],
      setupDocs.match(/## 8\. Optional Research Add-ons[\s\S]*?(?=\n## 9\.)/)?.[0],
      pluginReadme.match(/### Recommended research add-ons[\s\S]*?(?=\n## Components)/)?.[0],
    ]

    for (const section of sections) {
      expect(section).toBeDefined()
      expect(section).toContain("cyanheads/pubmed-mcp-server")
      expect(section).toContain("paperclip.gxl.ai/docs")
      expect(section).toContain("/ce-pubmed")
      expect(section).toMatch(/PubMed MCP/i)
      expect(section).toMatch(/Paperclip[\s\S]*full-text|full-text[\s\S]*Paperclip/i)
      expect(section).toMatch(/privacy/i)
      expect(section).toMatch(/Neither (?:add-on )?is\s+required or installed automatically|must not install/i)
    }

    expect(setupDocs).toContain("@cyanheads/pubmed-mcp-server@latest")
    expect(setupDocs).toContain("paperclip config")
    expect(setupDocs).toContain("paperclip install")
    expect(setupDocs).toContain("paperclip skill")
    expect(setupDocs).toContain("does not vendor, fork, or maintain it")
    expect(setupDocs).toContain("currently auto-detect only the Paperclip CLI")
    expect(setupDocs).toContain("does not automatically translate their results")
    expect(setupDocs).toMatch(/Never send protected\s+health information/)
    expect(setupDocs).toMatch(/must not install or authenticate\s+either add-on automatically/)
    expect(setupDocs).toMatch(/running `\/ce-evidence-map` authorizes\s+its documented optional deepening/)
  })

  test("public docs describe the current method and CLIF safeguards", async () => {
    const rootReadme = await fs.readFile(path.join(repoRoot, "README.md"), "utf8")
    const setupDocs = await fs.readFile(path.join(repoRoot, "docs", "setup.md"), "utf8")
    const pluginReadme = await fs.readFile(path.join(pluginRoot, "README.md"), "utf8")
    const docsIndex = await fs.readFile(path.join(repoRoot, "docs", "index.html"), "utf8")

    for (const doc of [rootReadme, setupDocs, pluginReadme, docsIndex]) {
      expect(doc).toContain("--version 2.1.0")
      expect(doc).toContain("--version 3.0.0")
      expect(doc).toMatch(/time-dependent AUC/i)
    }

    for (const doc of [rootReadme, setupDocs, pluginReadme]) {
      expect(doc).toMatch(/estimand/i)
      expect(doc).toMatch(/missing-data/i)
      expect(doc).toMatch(/synthetic\/fallback|fallback data|fabricating fallbacks/i)
    }

    expect(pluginReadme).toContain("GO/WARN/NO-GO")
    expect(setupDocs).toContain("pi-ask-user")
  })
})

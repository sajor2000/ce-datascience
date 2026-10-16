import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import os from "os"
import path from "path"

const repoRoot = path.join(import.meta.dir, "..")
const installer = path.join(repoRoot, "install.sh")

// Stub `claude` and `codex` binaries that only log their arguments, so the
// installer runs for real without touching the machine's agent setup.
async function stubBin(root: string): Promise<{ bin: string; log: string }> {
  const bin = path.join(root, "bin")
  const log = path.join(root, "calls.log")
  await fs.mkdir(bin, { recursive: true })
  for (const name of ["claude", "codex"]) {
    await fs.writeFile(path.join(bin, name), `#!/usr/bin/env bash\necho "${name} $*" >> "${log}"\n`, { mode: 0o755 })
  }
  return { bin, log }
}

async function runInstaller(args: string[], env: Record<string, string>): Promise<{ stdout: string; exitCode: number }> {
  const proc = Bun.spawn(["bash", installer, ...args], {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    stdout: "pipe",
    stderr: "pipe",
  })
  const exitCode = await proc.exited
  const stdout = (await new Response(proc.stdout).text()) + (await new Response(proc.stderr).text())
  return { stdout, exitCode }
}

describe("installer keeps users updated", () => {
  test("Claude: installs from the GitHub marketplace and turns on auto-update, preserving user settings", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "method-install-claude-"))
    const { bin, log } = await stubBin(root)
    const configDir = path.join(root, "claude-config")
    await fs.mkdir(configDir, { recursive: true })
    const settingsPath = path.join(configDir, "settings.json")
    await fs.writeFile(settingsPath, JSON.stringify({ theme: "dark", permissions: { allow: ["Bash(ls)"] } }, null, 2))

    const { stdout, exitCode } = await runInstaller(["claude"], {
      PATH: `${bin}:${process.env.PATH}`,
      CLAUDE_CONFIG_DIR: configDir,
    })

    expect(exitCode).toBe(0)
    const calls = await fs.readFile(log, "utf8")
    expect(calls).toContain("claude plugin marketplace add sajor2000/methodsmith --scope user")
    expect(calls).toContain("claude plugin install methodsmith@methodsmith --scope user")
    const settings = JSON.parse(await fs.readFile(settingsPath, "utf8"))
    expect(settings.theme).toBe("dark")
    expect(settings.permissions).toEqual({ allow: ["Bash(ls)"] })
    expect(settings.extraKnownMarketplaces["methodsmith"]).toEqual({
      source: { source: "github", repo: "sajor2000/methodsmith" },
      autoUpdate: true,
    })
    expect(stdout).toContain("Auto-update is on")
  })

  test("Claude: --no-auto-update leaves settings alone and prints the manual update command", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "method-install-claude-off-"))
    const { bin } = await stubBin(root)
    const configDir = path.join(root, "claude-config")

    const { stdout, exitCode } = await runInstaller(["claude", "--no-auto-update"], {
      PATH: `${bin}:${process.env.PATH}`,
      CLAUDE_CONFIG_DIR: configDir,
    })

    expect(exitCode).toBe(0)
    expect(await Bun.file(path.join(configDir, "settings.json")).exists()).toBe(false)
    expect(stdout).toContain("claude plugin update methodsmith@methodsmith")
  })

  test("Claude: refuses to rewrite a settings.json it cannot parse", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "method-install-claude-bad-"))
    const { bin } = await stubBin(root)
    const configDir = path.join(root, "claude-config")
    await fs.mkdir(configDir, { recursive: true })
    const settingsPath = path.join(configDir, "settings.json")
    await fs.writeFile(settingsPath, "{ not json")

    const { stdout, exitCode } = await runInstaller(["claude"], {
      PATH: `${bin}:${process.env.PATH}`,
      CLAUDE_CONFIG_DIR: configDir,
    })

    expect(exitCode).toBe(0)
    expect(await fs.readFile(settingsPath, "utf8")).toBe("{ not json")
    expect(stdout).toContain("Enable auto-update")
  })

  test("Codex: registers the Git marketplace so upgrade works, and prints the upgrade command", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "method-install-codex-"))
    const { bin, log } = await stubBin(root)

    const { stdout, exitCode } = await runInstaller(
      ["codex", "--codex-home", path.join(root, ".codex"), "--agents-home", path.join(root, ".agents")],
      { PATH: `${bin}:${process.env.PATH}` },
    )

    expect(exitCode).toBe(0)
    expect(await fs.readFile(log, "utf8")).toContain("codex plugin marketplace add sajor2000/methodsmith")
    expect(stdout).toContain("codex plugin marketplace upgrade methodsmith")
  })

  test("an explicit --source keeps the local checkout as the marketplace", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "method-install-local-"))
    const { bin, log } = await stubBin(root)

    const { exitCode } = await runInstaller(["claude", "--source", repoRoot, "--no-auto-update"], {
      PATH: `${bin}:${process.env.PATH}`,
      CLAUDE_CONFIG_DIR: path.join(root, "claude-config"),
    })

    expect(exitCode).toBe(0)
    expect(await fs.readFile(log, "utf8")).toContain(`claude plugin marketplace add ${repoRoot} --scope user`)
  })
})

describe("install.ps1 keeps users updated", () => {
  // PowerShell is not available in CI; guard the Windows twin statically.
  test("mirrors the GitHub-source, auto-update, and Codex upgrade behavior", async () => {
    const ps1 = await fs.readFile(path.join(repoRoot, "install.ps1"), "utf8")
    expect(ps1).toContain('$GitHubRepo = "sajor2000/methodsmith"')
    expect(ps1).toContain('Invoke-Step "claude" @("plugin", "marketplace", "add", $GitHubRepo, "--scope", $Scope)')
    expect(ps1).toContain('Set-JsonProperty $markets.$MarketplaceName "autoUpdate" $true')
    expect(ps1).toContain("[switch]$NoAutoUpdate")
    expect(ps1).toContain('Invoke-Step "codex" @("plugin", "marketplace", "add", $GitHubRepo)')
    expect(ps1).toContain("codex plugin marketplace upgrade $MarketplaceName")
  })
})

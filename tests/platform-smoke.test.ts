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

describe("real ce-datascience platform install smoke", () => {
  test("implemented targets install loadable files", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ce-platform-smoke-"))

    const codexRoot = path.join(tempRoot, "codex-home")
    await runInstall(["--to", "codex", "--include-skills", "--codex-home", codexRoot])
    expect(await exists(path.join(codexRoot, "agents", "ce-datascience", "ce-security-reviewer.toml"))).toBe(true)

    const opencodeRoot = path.join(tempRoot, "opencode-workspace")
    await runInstall(["--to", "opencode", "--output", opencodeRoot])
    expect(await exists(path.join(opencodeRoot, ".opencode", "agents", "ce-security-reviewer.md"))).toBe(true)

    const piRoot = path.join(tempRoot, ".pi")
    await runInstall(["--to", "pi", "--pi-home", piRoot])
    expect(await exists(path.join(piRoot, "agents", "ce-security-reviewer.md"))).toBe(true)

    const geminiRoot = path.join(tempRoot, "gemini")
    await runInstall(["--to", "gemini", "--output", geminiRoot])
    expect(await exists(path.join(geminiRoot, ".gemini", "agents", "ce-security-reviewer.md"))).toBe(true)

    const kiroRoot = path.join(tempRoot, "kiro")
    await runInstall(["--to", "kiro", "--output", kiroRoot])
    expect(await exists(path.join(kiroRoot, ".kiro", "agents", "ce-security-reviewer.json"))).toBe(true)
  })

  test("Codex agent bridge mode does not duplicate native-plugin skill content", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ce-codex-bridge-smoke-"))
    const codexRoot = path.join(tempRoot, "codex-home")

    await runInstall(["--to", "codex", "--codex-home", codexRoot])

    expect(await exists(path.join(codexRoot, "agents", "ce-datascience", "ce-security-reviewer.toml"))).toBe(true)
    expect(await exists(path.join(codexRoot, "config.toml"))).toBe(false)
  })
})

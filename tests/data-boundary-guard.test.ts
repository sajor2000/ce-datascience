import { afterAll, describe, expect, test } from "bun:test"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import os from "os"
import path from "path"

const pluginRoot = path.join(process.cwd(), "plugins", "ce-datascience")
const guard = path.join(pluginRoot, "hooks", "data-boundary-guard.py")
const helper = path.join(pluginRoot, "scripts", "schema-peek.py")
const fixture = path.join(process.cwd(), "tests", "fixtures", "data-boundary", "synthetic-cohort.csv")
const tempRoots: string[] = []

afterAll(() => {
  for (const dir of tempRoots) rmSync(dir, { recursive: true, force: true })
})

function project(config?: string, opts: { ceDir?: boolean } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "ce-boundary-"))
  tempRoots.push(root)
  mkdirSync(path.join(root, ".git"))
  if (opts.ceDir !== false) mkdirSync(path.join(root, ".ce-datascience"))
  if (config !== undefined) writeFileSync(path.join(root, ".ce-datascience", "config.local.yaml"), config)
  return root
}

function runGuard(cwd: string, tool: string, toolInput: Record<string, unknown>) {
  const proc = Bun.spawnSync(["python3", guard], {
    stdin: Buffer.from(JSON.stringify({ cwd, tool_name: tool, tool_input: toolInput })),
  })
  const stdout = proc.stdout.toString()
  return {
    exitCode: proc.exitCode,
    stdout,
    stderr: proc.stderr.toString(),
    decision: stdout ? JSON.parse(stdout).hookSpecificOutput?.permissionDecision : "allow",
    reason: stdout ? JSON.parse(stdout).hookSpecificOutput?.permissionDecisionReason ?? "" : "",
  }
}

const SCHEMA_ONLY = "phi_environment:\n  compliant: false\n  confirmed_on: 2026-10-15\nstack_profile:\n  data_root: restricted\n"
const bash = (command: string) => ({ command })

describe("data-boundary guard hook", () => {
  test("hooks.json registers the guard for Read, Grep, and Bash and no-ops without CLAUDE_PLUGIN_ROOT", () => {
    const hooks = JSON.parse(readFileSync(path.join(pluginRoot, "hooks", "hooks.json"), "utf8"))
    const entry = hooks.hooks.PreToolUse[0]
    expect(entry.matcher).toBe("Read|Grep|Bash")
    const command: string = entry.hooks[0].command
    expect(command).toContain("${CLAUDE_PLUGIN_ROOT:-}/hooks/data-boundary-guard.py")

    const root = project(SCHEMA_ONLY)
    const stdin = Buffer.from(JSON.stringify({ cwd: root, tool_name: "Read", tool_input: { file_path: "a.csv" } }))
    const env = { ...process.env }
    delete env.CLAUDE_PLUGIN_ROOT
    const off = Bun.spawnSync(["sh", "-c", command], { stdin, env })
    expect(off.exitCode).toBe(0)
    expect(off.stdout.toString()).toBe("")

    const on = Bun.spawnSync(["sh", "-c", command], { stdin, env: { ...env, CLAUDE_PLUGIN_ROOT: pluginRoot } })
    expect(on.exitCode).toBe(0)
    expect(JSON.parse(on.stdout.toString()).hookSpecificOutput.permissionDecision).toBe("deny")
  })

  test("outside a ce-datascience project it allows everything silently", () => {
    const root = project(undefined, { ceDir: false })
    const result = runGuard(root, "Read", { file_path: path.join(root, "data.csv") })
    expect(result).toMatchObject({ exitCode: 0, stdout: "", stderr: "" })
  })

  test("an approved endpoint or no sensitive data allows data reads silently", () => {
    for (const config of [
      "phi_environment:\n  compliant: true\n  confirmed_on: 2026-10-15\n",
      "phi_environment: {compliant: true, confirmed_on: 2026-10-15}\n",
      "phi_environment:\n  sensitive_data: false\n",
    ]) {
      const root = project(config)
      for (const [tool, input] of [
        ["Read", { file_path: "data.csv" }],
        ["Bash", bash("head data/x.csv")],
      ] as const) {
        expect(runGuard(root, tool, input)).toMatchObject({ exitCode: 0, stdout: "", stderr: "" })
      }
    }
  })

  test("schema-only mode denies reads, dumps, and inline code on data files", () => {
    const root = project(SCHEMA_ONLY)
    const denied: Array<[string, Record<string, unknown>]> = [
      ["Read", { file_path: "data.csv" }],
      ["Read", { file_path: "cohort.parquet" }],
      ["Read", { file_path: "restricted/notes.txt" }],
      ["Grep", { pattern: "x", path: "extract.sas7bdat" }],
      ["Grep", { pattern: "x", glob: "**/*.tsv" }],
      ["Grep", { pattern: "x", type: "csv" }],
      ["Bash", bash("head data/x.csv")],
      ["Bash", bash("cd analysis && tail -n 5 ../out/cohort.csv.gz")],
      ["Bash", bash("python -c \"import pandas as pd; print(pd.read_csv('d.csv'))\"")],
      ["Bash", bash("Rscript -e 'print(head(read.csv(\"d.csv\")))'")],
      ["Bash", bash("duckdb -c \"select * from 'cohort.parquet'\"")],
      ["Bash", bash("python3 - <<'EOF'\nimport pandas as pd\nprint(pd.read_parquet('c.parquet'))\nEOF")],
      ["Bash", bash("cat restricted/extract.txt")],
    ]
    for (const [tool, input] of denied) {
      const result = runGuard(root, tool, input)
      expect({ tool, input, decision: result.decision }).toEqual({ tool, input, decision: "deny" })
      expect(result.exitCode).toBe(0)
      expect(result.reason).toContain("schema-only mode")
      expect(result.reason).toContain("schema-peek.py")
    }
  })

  test("schema-only mode allows analysis scripts, the schema helper, and ordinary work", () => {
    const root = project(SCHEMA_ONLY)
    const allowed: Array<[string, Record<string, unknown>]> = [
      ["Bash", bash("python analysis/run.py")],
      ["Bash", bash("Rscript analysis/model.R data/cohort.csv")],
      ["Bash", bash(`python3 "${helper}" data/cohort.csv`)],
      ["Bash", bash("ls data && wc -l data/cohort.csv")],
      ["Bash", bash("cat > analysis/run.py <<'EOF'\nimport pandas as pd\ndf = pd.read_csv('data/x.csv')\nEOF")],
      ["Bash", bash("git status")],
      ["Read", { file_path: "analysis/run.py" }],
      ["Read", { file_path: ".ce-datascience/config.local.yaml" }],
      ["Grep", { pattern: "read_csv", path: "analysis" }],
    ]
    for (const [tool, input] of allowed) {
      const result = runGuard(root, tool, input)
      expect({ tool, input, decision: result.decision }).toEqual({ tool, input, decision: "allow" })
    }
  })

  test("an unset boundary denies only data-file reads, pointing to ce-setup", () => {
    const root = project("stack_profile:\n  language: python\n")
    const denied = runGuard(root, "Read", { file_path: "data.csv" })
    expect(denied.decision).toBe("deny")
    expect(denied.reason).toContain("Run the ce-setup skill and choose a boundary")
    expect(runGuard(root, "Read", { file_path: "README.md" }).decision).toBe("allow")
    expect(runGuard(project(), "Bash", bash("head x.csv")).decision).toBe("deny")
  })

  test("a malformed config fails open with a one-line warning", () => {
    const root = project("phi_environment:\n  compliant: maybe\n")
    const result = runGuard(root, "Read", { file_path: "data.csv" })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
    expect(result.stderr.trim().split("\n")).toHaveLength(1)
    expect(result.stderr).toContain("data-boundary guard inactive")
  })

  test("deny messages never echo file contents", () => {
    const root = project(SCHEMA_ONLY)
    writeFileSync(path.join(root, "secret.csv"), "id,name\nSYNTH-XYZ-1,Synthname Zulu\n")
    const result = runGuard(root, "Bash", bash("head secret.csv"))
    expect(result.decision).toBe("deny")
    expect(result.stdout).not.toContain("SYNTH-XYZ-1")
    expect(result.stdout).not.toContain("Synthname Zulu")
  })
})

describe("schema-peek helper", () => {
  const run = () => Bun.spawnSync(["python3", helper, fixture]).stdout.toString()

  test("prints headings, types, and counts but no cell values", () => {
    const output = run()
    for (const heading of ["record_id", "patient_name", "age", "admit_date", "free_text_note"]) {
      expect(output).toContain(`| ${heading} |`)
    }
    expect(output).toContain("Rows: 14")
    expect(output).toContain("| age | integer | 14 | 0.0 |")
    expect(output).toContain("| free_text_note | string | <11 | withheld |")
    expect(output).toContain("counts from 1 to 10 are shown as <11")

    const values = readFileSync(fixture, "utf8").trim().split("\n").slice(1).flatMap((row) => row.split(","))
    for (const value of values.filter(Boolean)) {
      expect({ value, leaked: output.includes(value) }).toEqual({ value, leaked: false })
    }
  })

  test("skill-local copies match the plugin-level helper", () => {
    const canonical = readFileSync(helper, "utf8")
    for (const skill of ["ce-setup", "ce-work"]) {
      expect(readFileSync(path.join(pluginRoot, "skills", skill, "scripts", "schema-peek.py"), "utf8")).toBe(canonical)
    }
  })
})

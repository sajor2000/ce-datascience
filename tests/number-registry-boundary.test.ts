import { describe, expect, test } from "bun:test"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import path from "path"
import { SCHEMA_ONLY, bash, expectAll, git, pluginRoot, project } from "./data-boundary-harness"

// Schema-only mode: the analysis reads data, so it runs through ce-safe-run and the
// registry it writes counts as data. The gate is the agent's view of the registry.
const safeRun = path.join(pluginRoot, "scripts", "ce-safe-run")
const scripts = path.join(pluginRoot, "skills", "ce-numbers", "scripts")
const cli = path.join(scripts, "ce_numbers.py")

function withFile(root: string, rel: string, content: string) {
  mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
  writeFileSync(path.join(root, rel), content)
}

describe("number registry in schema-only mode", () => {
  test("an analysis run through ce-safe-run writes the registry and the gate still runs", () => {
    const root = project(SCHEMA_ONLY, { git: "real" })
    withFile(root, "analysis/cohort.py", [
      "import csv, sys",
      `sys.path.insert(0, ${JSON.stringify(scripts)})`,
      "from ce_numbers import register_number",
      "rows = list(csv.DictReader(open('data/cohort.csv')))",
      "register_number('cohort.n', 410 + len(rows), kind='n', sources=['data/cohort.csv'], sap_output='F1')",
      "",
    ].join("\n"))
    withFile(root, "manuscript/results.md", "We included {{num:cohort.n}} patients.\n")
    git(root, "add", "-A")
    git(root, "commit", "-qm", "synthetic")

    expectAll(root, "deny", [["Bash", bash("python3 analysis/cohort.py")]])
    expectAll(root, "allow", [["Bash", bash(`${safeRun} -- python3 analysis/cohort.py`)]])
    const run = Bun.spawnSync([safeRun, "--", "python3", "analysis/cohort.py"], { cwd: root })
    expect(run.exitCode).toBe(0)
    expect(existsSync(path.join(root, "analysis", "numbers", "registry.json"))).toBe(true)
    expect(readFileSync(path.join(root, ".ce-datascience", "runs", "outputs.txt"), "utf8")).toContain("analysis/numbers/registry.json")

    expectAll(root, "deny", [["Bash", bash("cat analysis/numbers/registry.json")]])
    expectAll(root, "allow", [
      ["Bash", bash(`python3 ${cli} check manuscript/results.md`)],
      ["Bash", bash(`python3 ${cli} check --registry analysis/numbers/registry.json manuscript/results.md`)],
      ["Bash", bash(`python3 ${cli} render manuscript/results.md --out manuscript/_rendered/results.md`)],
    ])
    const gate = Bun.spawnSync(["python3", cli, "check", "manuscript/results.md"], { cwd: root })
    expect(gate.stdout.toString()).toContain("PASS")
    expect(gate.exitCode).toBe(0)
  })
})

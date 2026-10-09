import { describe, expect, test } from "bun:test"
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync } from "fs"
import os from "os"
import path from "path"

const skillDir = path.join(process.cwd(), "plugins/ce-datascience/skills/ce-optimize")
const scriptsDir = path.join(skillDir, "scripts")
const read = (rel: string) => readFileSync(path.join(skillDir, rel), "utf8")

function markdownFiles(): string[] {
  const refs = readdirSync(path.join(skillDir, "references"))
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join("references", name))
  return ["SKILL.md", ...refs]
}

function bashBlocks(markdown: string): string[] {
  return [...markdown.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1])
}

/** Build a PATH dir holding only the named tools, so interpreter probes can be exercised. */
function restrictedPath(tools: string[], extra: Record<string, string> = {}): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "ce-optimize-path-"))
  for (const tool of tools) {
    const resolved = Bun.which(tool)
    if (resolved) symlinkSync(resolved, path.join(dir, tool))
  }
  for (const [name, target] of Object.entries(extra)) symlinkSync(target, path.join(dir, name))
  return dir
}

const BASE_TOOLS = ["bash", "env", "cat", "grep", "find", "head", "wc", "tr", "dirname"]
const bashBin = Bun.which("bash")
const python3Bin = Bun.which("python3")

function run(script: string, args: string[], pathDir: string) {
  const proc = Bun.spawnSync([bashBin!, path.join(scriptsDir, script), ...args], {
    env: { PATH: pathDir, HOME: os.tmpdir() },
    stdout: "pipe",
    stderr: "pipe",
  })
  return { code: proc.exitCode, stdout: proc.stdout.toString(), stderr: proc.stderr.toString() }
}

describe("ce-optimize bundled-script anchoring (upstream #1009)", () => {
  test("no instruction runs a bundled script by a cwd-relative scripts/ path", () => {
    for (const rel of markdownFiles()) {
      const content = read(rel)
      expect({ rel, hit: /bash scripts\//.test(content) }).toEqual({ rel, hit: false })
      expect({ rel, hit: /\$\(bash scripts\//.test(content) }).toEqual({ rel, hit: false })
    }
  })

  test("every SKILL_DIR script call sets SKILL_DIR and checks the script exists first", () => {
    const blocks = bashBlocks(read("SKILL.md")).filter((b) => b.includes('"$SKILL_DIR/scripts/'))
    expect(blocks.length).toBeGreaterThanOrEqual(6)
    for (const block of blocks) {
      expect(block).toContain('SKILL_DIR="<absolute path of the directory containing this SKILL.md>";')
      const called = [...block.matchAll(/bash "\$SKILL_DIR\/scripts\/([\w.<>-]+)"/g)].map((m) => m[1])
      expect(called.length).toBeGreaterThan(0)
      for (const script of called) {
        expect(block).toContain(`if [ ! -f "$SKILL_DIR/scripts/${script}" ]; then echo "ce-optimize:`)
        expect(block.indexOf(`[ ! -f "$SKILL_DIR/scripts/${script}" ]`)).toBeLessThan(
          block.indexOf(`bash "$SKILL_DIR/scripts/${script}"`),
        )
        if (script !== "<name>") expect(existsSync(path.join(scriptsDir, script))).toBe(true)
      }
      // Every line ends in `;` so the block survives newline flattening (upstream #1105).
      const lines = block.trim().split("\n")
      for (const line of lines.slice(0, -1)) expect(line.trimEnd().endsWith(";")).toBe(true)
    }
  })

  test("the guard fails loudly when the placeholder is not replaced", () => {
    const block = bashBlocks(read("SKILL.md")).find((b) => b.includes("scripts/measure.sh"))!
    const proc = Bun.spawnSync([bashBin!, "-c", block], { stdout: "pipe", stderr: "pipe" })
    expect(proc.exitCode).toBe(1)
    expect(proc.stderr.toString()).toContain("ce-optimize: scripts/measure.sh not found under SKILL_DIR=")
  })
})

describe("ce-optimize Python interpreter probe (upstream #1255)", () => {
  test("scripts probe python3, python, py instead of hardcoding python3", () => {
    for (const script of ["measure.sh", "parallel-probe.sh"]) {
      const content = readFileSync(path.join(scriptsDir, script), "utf8")
      expect(content).toContain("for candidate in python3 python py; do")
      expect(content).toContain("sys.version_info[0] >= 3")
      expect(content).not.toMatch(/command -v python3/)
      expect(content).not.toMatch(/(^|[|(\s])python3 (-c|-)\s/m)
    }
  })

  test.skipIf(!bashBin || !python3Bin)("measure.sh times out via `python` when timeout and python3 are absent", () => {
    const dir = restrictedPath(["bash", "sleep"], { python: python3Bin! })
    try {
      const ok = run("measure.sh", ['echo \'{"auc": 0.81}\'', "5", "."], dir)
      expect(ok.code).toBe(0)
      expect(ok.stdout.trim()).toBe('{"auc": 0.81}')
      const slow = run("measure.sh", ["sleep 5", "1", "."], dir)
      expect(slow.code).toBe(124)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test.skipIf(!bashBin)("measure.sh fails clearly when no timeout or Python 3 is available", () => {
    const dir = restrictedPath(["bash"])
    try {
      const res = run("measure.sh", ["echo hi", "5", "."], dir)
      expect(res.code).toBe(1)
      expect(res.stderr).toContain("no timeout implementation available")
      expect(res.stderr).toContain("python3, python, or py")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test.skipIf(!bashBin || !python3Bin)("parallel-probe.sh runs with only `python` on PATH", () => {
    const project = mkdtempSync(path.join(os.tmpdir(), "ce-optimize-proj-"))
    const dir = restrictedPath(BASE_TOOLS, { python: python3Bin! })
    try {
      const res = run("parallel-probe.sh", [project, "", "."], dir)
      expect(JSON.parse(res.stdout)).toEqual({ mode: "parallel", blockers: [], blocker_count: 0 })
    } finally {
      rmSync(dir, { recursive: true, force: true })
      rmSync(project, { recursive: true, force: true })
    }
  })

  test.skipIf(!bashBin)("parallel-probe.sh reports a missing_dependency blocker without Python 3", () => {
    const project = mkdtempSync(path.join(os.tmpdir(), "ce-optimize-proj-"))
    const dir = restrictedPath(BASE_TOOLS)
    try {
      const res = run("parallel-probe.sh", [project, "", "."], dir)
      const out = JSON.parse(res.stdout)
      expect(out.mode).toBe("serial")
      expect(out.blockers[0].type).toBe("missing_dependency")
      expect(res.stderr).toContain("no working Python 3 interpreter found")
    } finally {
      rmSync(dir, { recursive: true, force: true })
      rmSync(project, { recursive: true, force: true })
    }
  })
})

describe("ce-optimize parallel probe port detection", () => {
  test("port regex is POSIX ERE (no PCRE-only groups)", () => {
    const content = readFileSync(path.join(scriptsDir, "parallel-probe.sh"), "utf8")
    expect(content).not.toContain("(?:")
  })

  test.skipIf(!bashBin || !python3Bin)("flags `--port 8080` as a hardcoded port", () => {
    const project = mkdtempSync(path.join(os.tmpdir(), "ce-optimize-proj-"))
    try {
      const res = run("parallel-probe.sh", [project, "python serve.py --port 8080", "."], process.env.PATH ?? "")
      const out = JSON.parse(res.stdout)
      expect(out.blockers.map((b: { type: string }) => b.type)).toContain("port")
      expect(res.stderr).not.toContain("warning")
    } finally {
      rmSync(project, { recursive: true, force: true })
    }
  })
})

describe("ce-optimize whole-run spend cap (upstream #1812, spend-cap portion)", () => {
  test("schema and log define the whole-run cap and running total", () => {
    const spec = read("references/optimize-spec-schema.yaml")
    const stopping = spec.slice(spec.indexOf("  stopping:"), spec.indexOf("  max_runner_up_merges_per_batch:"))
    expect(stopping).toContain("max_total_cost_usd:")
    expect(spec).toContain("stopping.max_total_cost_usd, when set, must be a positive number")
    expect(read("references/experiment-log-schema.yaml")).toContain("total_run_cost_usd:")
  })

  test("caps are checked before dispatch and disclosed at the approval gate", () => {
    const skill = read("SKILL.md")
    expect(skill).toMatch(/\*\*Spend cap reached\*\*:.*stopping\.max_total_cost_usd.*Check it before every dispatch that costs money/)
    expect(skill).toMatch(/Shrink the batch until its estimated worker and judge cost fits every configured spend cap/)
    expect(skill).toMatch(/Say plainly which spend is capped/)
    expect(read("references/loop-details.md")).toMatch(/Before dispatching, check the spend caps/)
  })
})

describe("ce-optimize progressive disclosure", () => {
  test("SKILL.md body stays under 400 lines and keeps the data-science guardrails", () => {
    const skill = read("SKILL.md")
    const body = skill.split(/^---$/m).slice(2).join("---")
    expect(body.split("\n").length).toBeLessThan(400)
    for (const guard of [
      "**Cross-validation awareness.**",
      "**Data leakage guard.**",
      "**Reproducibility seeds.**",
      "**SAP alignment check.**",
      "**Experiment tracking integration.**",
    ]) {
      expect(skill).toContain(guard)
    }
    expect(skill).toContain("**HARD GATE: the user must approve the baseline and parallel readiness before Phase 2.**")
  })

  test("every reference SKILL.md names exists, and long markdown references have a Contents section", () => {
    const skill = read("SKILL.md")
    const named = new Set([...skill.matchAll(/`(references\/[\w.-]+)`/g)].map((m) => m[1]))
    expect(named.size).toBeGreaterThan(0)
    for (const rel of named) expect({ rel, exists: existsSync(path.join(skillDir, rel)) }).toEqual({ rel, exists: true })
    for (const rel of markdownFiles().filter((f) => f !== "SKILL.md")) {
      const content = read(rel)
      if (content.split("\n").length > 100) expect({ rel, contents: content.includes("\n## Contents\n") }).toEqual({ rel, contents: true })
      expect({ rel, nested: /`references\/(?!judge-prompt-template)[\w.-]+\.md`/.test(content) }).toEqual({ rel, nested: false })
    }
  })
})

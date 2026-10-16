import { spawnSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { describe, expect, test } from "bun:test"

/**
 * Regression locks for fixes ported from upstream compound-engineering:
 *   - #1109: no load-time `!` pre-resolution in method-compound (it exits non-zero
 *     outside a repo / in an unborn repo and aborts skill load); values are
 *     resolved at runtime with single argv commands and omitted when unresolved.
 *   - #935 / #947 / #1255: the bundled validate-frontmatter.py is resolved from
 *     the skill directory (not the Bash cwd), guarded by an existence check, run
 *     with a probed Python 3 interpreter, and backed by a manual checklist.
 *   - method-compound-refresh SKILL.md body stays well under the 500-line limit,
 *     with detail moved to directly linked references.
 */

const SKILLS_ROOT = path.join(process.cwd(), "plugins", "methodsmith", "skills")
const SKILLS = ["method-compound", "method-compound-refresh"] as const

function read(skill: string, rel = "SKILL.md"): string {
  return readFileSync(path.join(SKILLS_ROOT, skill, rel), "utf8")
}

function body(markdown: string): string {
  const match = markdown.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/)
  return match ? match[1] : markdown
}

function validatorBlock(skill: string): string {
  const content = read(skill)
  const blocks = [...content.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1])
  const block = blocks.find((b) => b.includes("validate-frontmatter.py"))
  if (!block) throw new Error(`${skill}: no bash block invoking validate-frontmatter.py`)
  return block
}

function runValidatorBlock(skill: string, docPath: string, env: Record<string, string> = {}) {
  const script = validatorBlock(skill)
    .replace(/SKILL_DIR="<[^"]*>"/, `SKILL_DIR="${path.join(SKILLS_ROOT, skill)}"`)
    .replace(/"<(?:output-path|new-learning-path)>"/, `"${docPath}"`)
  // Run from an unrelated cwd: the old cwd-relative call could not find the script here.
  const cwd = mkdtempSync(path.join(tmpdir(), "method-compound-cwd-"))
  const result = spawnSync("/bin/bash", ["-c", script], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
  })
  return { code: result.status ?? -1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" }
}

function writeDoc(content: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), "method-compound-doc-"))
  const file = path.join(dir, "doc.md")
  writeFileSync(file, content, "utf8")
  return file
}

describe("method-compound gathers session context at runtime (upstream #1109)", () => {
  const content = read("method-compound")

  test("no `!` load-time pre-resolution in any method-compound markdown", () => {
    const dir = path.join(SKILLS_ROOT, "method-compound")
    const files: string[] = []
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name)
        if (e.isDirectory()) walk(full)
        else if (e.name.endsWith(".md")) files.push(full)
      }
    }
    walk(dir)
    for (const file of files) expect(readFileSync(file, "utf8")).not.toMatch(/(?:^|\s)!`[^`\n]+`/m)
    expect(content).not.toMatch(/pre-resolved/i)
  })

  test("repo name and branch are resolved with single runtime commands and omitted when unresolved", () => {
    expect(content).toContain("`git rev-parse --path-format=absolute --git-common-dir`")
    expect(content).toContain("`git branch --show-current`")
    expect(content).not.toContain("git rev-parse --abbrev-ref HEAD")
    expect(content).toMatch(/non-zero exit is a normal state/i)
    expect(content).toMatch(/omit the repo name/i)
    expect(content).toMatch(/omit the branch/i)
  })
})

describe("bundled validate-frontmatter.py resolves from the skill dir (upstream #935, #947, #1255)", () => {
  for (const skill of SKILLS) {
    test(`${skill} ships its own validator script`, () => {
      expect(existsSync(path.join(SKILLS_ROOT, skill, "scripts", "validate-frontmatter.py"))).toBe(true)
    })

    test(`${skill} SKILL.md has no cwd-relative validator call`, () => {
      expect(read(skill)).not.toMatch(/python3?\s+scripts\/validate-frontmatter\.py/)
    })

    test(`${skill} SKILL.md guards the script, probes interpreters, and has a manual fallback`, () => {
      const content = read(skill)
      const block = validatorBlock(skill)
      expect(block).toMatch(/SKILL_DIR="<absolute path of the directory containing this SKILL\.md>"/)
      expect(block).toContain('[ -f "$SKILL_DIR/scripts/validate-frontmatter.py" ]')
      expect(block).toContain("for c in python3 python py; do")
      expect(block).toContain('"$PY" "$SKILL_DIR/scripts/validate-frontmatter.py"')
      expect(block).toContain("MANUAL_CHECK")
      expect(content).toMatch(/`MANUAL_CHECK` printed:\*\* apply the validator's checks by hand/)
      expect(content).toMatch(/validator was unavailable and the checks were applied manually/)
    })

    test(`${skill} validator block runs from a foreign cwd and fails on unsafe frontmatter`, () => {
      const bad = writeDoc("---\ntitle: Cohort: index date drift\n---\nbody\n")
      const good = writeDoc('---\ntitle: "Cohort: index date drift"\n---\nbody\n')
      const badRun = runValidatorBlock(skill, bad)
      expect(badRun.code).toBe(1)
      expect(badRun.stderr).toContain("title")
      const goodRun = runValidatorBlock(skill, good)
      expect(goodRun.code).toBe(0)
      expect(goodRun.stdout).not.toContain("MANUAL_CHECK")
    })

    test(`${skill} validator block falls back to the manual check without Python`, () => {
      const doc = writeDoc("---\ntitle: ok\n---\n")
      const run = runValidatorBlock(skill, doc, { PATH: "/nonexistent" })
      expect(run.code).toBe(0)
      expect(run.stdout).toContain("MANUAL_CHECK")
    })
  }
})

describe("method-compound-refresh progressive disclosure", () => {
  const content = read("method-compound-refresh")

  test("SKILL.md body is comfortably under 500 lines", () => {
    expect(body(content).split("\n").length).toBeLessThan(400)
  })

  test("every reference file is linked directly from SKILL.md and exists", () => {
    const refsDir = path.join(SKILLS_ROOT, "method-compound-refresh", "references")
    for (const file of readdirSync(refsDir)) {
      expect(content).toContain(`references/${file}`)
    }
    for (const match of content.matchAll(/`(references\/[A-Za-z0-9_.-]+)`/g)) {
      expect(existsSync(path.join(SKILLS_ROOT, "method-compound-refresh", match[1]))).toBe(true)
    }
  })

  test("moved detail keeps its safeguards", () => {
    const classify = read("method-compound-refresh", "references/classify-actions.md")
    expect(classify).toMatch(/Auto-delete only when both the implementation AND the problem domain are gone/)
    expect(classify).toMatch(/status: stale/)
    expect(read("method-compound-refresh", "references/output-format.md")).toMatch(/Applied[\s\S]*Recommended/)
    expect(read("method-compound-refresh", "references/discoverability-check.md")).toMatch(/informational, not imperative/)
    expect(content).toMatch(/Delete needs both the implementation and the problem domain gone/)
  })
})

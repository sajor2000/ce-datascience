import { readdir, readFile, stat } from "fs/promises"
import path from "path"
import { describe, expect, test } from "bun:test"

const skillDir = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-code-review")
const referencesDir = path.join(skillDir, "references")

const STAGE_REFERENCES = [
  "references/scope.md",
  "references/intent-and-plan.md",
  "references/select-reviewers.md",
  "references/dispatch-reviewers.md",
  "references/merge-findings.md",
  "references/synthesis-and-output.md",
  "references/post-review.md",
]

const SUPPORT_REFERENCES = [
  "references/persona-catalog.md",
  "references/subagent-template.md",
  "references/diff-scope.md",
  "references/findings-schema.json",
  "references/validator-template.md",
  "references/review-output-template.md",
  "references/tracker-defer.md",
  "references/walkthrough.md",
  "references/bulk-preview.md",
  "references/resolve-base.sh",
]

async function readSkill(): Promise<string> {
  return readFile(path.join(skillDir, "SKILL.md"), "utf8")
}

async function markdownReferences(): Promise<string[]> {
  return (await readdir(referencesDir)).filter((file) => file.endsWith(".md")).sort()
}

function referencedPaths(content: string): string[] {
  return [...new Set(content.match(/references\/[A-Za-z0-9_.-]+\.(?:md|json|sh|yaml)/g) ?? [])]
}

describe("ce-code-review progressive disclosure", () => {
  test("keeps the SKILL.md body under 500 lines", async () => {
    const lines = (await readSkill()).split("\n").length
    expect(lines).toBeLessThan(500)
  })

  test("links every stage and support reference directly from SKILL.md", async () => {
    const skill = await readSkill()
    for (const ref of [...STAGE_REFERENCES, ...SUPPORT_REFERENCES]) {
      expect(skill, ref).toContain(`\`${ref}\``)
    }
  })

  test("every reference path named in SKILL.md exists", async () => {
    for (const ref of referencedPaths(await readSkill())) {
      expect(await stat(path.join(skillDir, ref)), ref).toBeDefined()
    }
  })

  test("stage references never require a reference that SKILL.md does not link", async () => {
    const skill = await readSkill()
    for (const stageRef of STAGE_REFERENCES) {
      const content = await readFile(path.join(skillDir, stageRef), "utf8")
      for (const ref of referencedPaths(content)) {
        expect(skill, `${stageRef} -> ${ref}`).toContain(ref)
      }
    }
  })

  test("loads references on demand instead of inlining them at skill load", async () => {
    expect(await readSkill()).not.toMatch(/^@\.\/references\//m)
  })

  test("every reference file over 100 lines opens with a Contents list after its H1", async () => {
    for (const file of await markdownReferences()) {
      const content = await readFile(path.join(referencesDir, file), "utf8")
      if (content.trimEnd().split("\n").length <= 100) continue
      expect(content, file).toMatch(/^# [^\n]+\n\n## Contents\n\n- /)
    }
  })
})

describe("ce-code-review content fixes", () => {
  test("has no time-sensitive model or date phrasing", async () => {
    const files = ["SKILL.md", ...(await markdownReferences()).map((file) => `references/${file}`)]
    const months = "January|February|March|April|May|June|July|August|September|October|November|December"
    const dated = new RegExp(`\\b(?:as of|before|after|since|until)\\s+(?:${months})\\s+20\\d{2}`, "i")
    for (const file of files) {
      const content = await readFile(path.join(skillDir, file), "utf8")
      expect(content, file).not.toMatch(dated)
      expect(content, file).not.toContain("gpt-5.4-mini")
    }
  })

  test("does not route callers through slfg, which ce-datascience does not ship", async () => {
    const files = ["SKILL.md", ...(await markdownReferences()).map((file) => `references/${file}`)]
    for (const file of files) {
      const content = await readFile(path.join(skillDir, file), "utf8")
      expect(content, file).not.toMatch(/\bslfg\b/)
    }
  })

  test("anchors the bundled resolve-base.sh on SKILL_DIR instead of the user's working directory", async () => {
    const files = ["SKILL.md", ...STAGE_REFERENCES]
    for (const file of files) {
      const content = await readFile(path.join(skillDir, file), "utf8")
      expect(content, file).not.toMatch(/bash +(?:\.\/)?references\/resolve-base\.sh/)
    }
    const scope = await readFile(path.join(referencesDir, "scope.md"), "utf8")
    expect(scope).toContain('SKILL_DIR="<absolute path of the directory containing this SKILL.md>"')
    expect(scope).toContain('bash "$SKILL_DIR/references/resolve-base.sh"')
  })

  test("mode:agent validates every Stage 5 survivor, matching the Stage 5b mode table", async () => {
    const [skill, merge] = await Promise.all([
      readSkill(),
      readFile(path.join(referencesDir, "merge-findings.md"), "utf8"),
    ])
    expect(skill).toMatch(/\| `agent` \| Yes, eagerly and read-only/)
    expect(merge).toContain("**agent/headless/autofix:** All survivors of Stage 5.")
    expect(merge).toContain("Stage 6 for agent/headless/autofix")
  })

  test("keeps the PHI safety boundary in SKILL.md, ahead of any diff collection", async () => {
    const skill = await readSkill()
    expect(skill).toContain("## PHI Safety Boundary")
    expect(skill).toContain("[redacted-phi-risk-branch]")
    expect(skill.indexOf("PHI-safe scope preflight")).toBeLessThan(skill.indexOf("git diff -U10"))
  })
})

describe("ce-code-review private scope directory", () => {
  test("every block that uses $REVIEW_SCOPE_DIR without creating it fails closed when it is unset", async () => {
    const offenders: string[] = []
    for (const rel of ["scope.md", "intent-and-plan.md"]) {
      const text = await readFile(path.join(referencesDir, rel), "utf8")
      for (const block of text.matchAll(/```(?:bash)?\n([\s\S]*?)```/g)) {
        const body = block[1]
        if (!body.includes("$REVIEW_SCOPE_DIR") || body.includes("mktemp")) continue
        if (!body.startsWith(': "${REVIEW_SCOPE_DIR:?')) offenders.push(`${rel}: ${body.split("\n")[0]}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

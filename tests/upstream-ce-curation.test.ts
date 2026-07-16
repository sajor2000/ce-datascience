import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

const skillsRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills")

async function shippedSkillNames(): Promise<Set<string>> {
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true })
  const names = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
  return new Set(names)
}

async function readSkillFile(relativePath: string): Promise<string> {
  return fs.readFile(path.join(skillsRoot, relativePath), "utf8")
}

describe("upstream Compound Engineering curation", () => {
  test("ships adapted core workflow skills that fit health data science", async () => {
    const shipped = await shippedSkillNames()
    const adaptedCoreSkills = [
      "ce-brainstorm",
      "ce-clean-gone-branches",
      "ce-code-review",
      "ce-commit",
      "ce-commit-push-pr",
      "ce-compound",
      "ce-compound-refresh",
      "ce-debug",
      "ce-doc-review",
      "ce-ideate",
      "ce-optimize",
      "ce-plan",
      "ce-release-notes",
      "ce-report-bug",
      "ce-resolve-pr-feedback",
      "ce-sessions",
      "ce-setup",
      "ce-update",
      "ce-work",
      "ce-worktree",
    ]

    const missing = adaptedCoreSkills.filter((skill) => !shipped.has(skill))
    expect(missing).toEqual([])
  })

  test("does not ship upstream-only core skills as ce-datascience skills", async () => {
    const shipped = await shippedSkillNames()
    const upstreamOnlySkills = [
      "ce-agent-native-architecture",
      "ce-agent-native-audit",
      "ce-demo-reel",
      "ce-dhh-rails-style",
      "ce-dogfood-beta",
      "ce-frontend-design",
      "ce-gemini-imagegen",
      "ce-polish",
      "ce-product-pulse",
      "ce-promote",
      "ce-proof",
      "ce-riffrec-feedback-analysis",
      "ce-simplify-code",
      "ce-slack-research",
      "ce-strategy",
      "ce-test-browser",
      "ce-test-xcode",
      "ce-work-beta",
      "lfg",
    ]

    const incorrectlyShipped = upstreamOnlySkills.filter((skill) => shipped.has(skill))
    expect(incorrectlyShipped).toEqual([])
  })

  test("optional core handoffs name core Compound Engineering and provide fallbacks", async () => {
    const files = [
      await readSkillFile("ce-plan/references/universal-planning.md"),
      await readSkillFile("ce-plan/references/plan-handoff.md"),
      await readSkillFile("ce-brainstorm/references/handoff.md"),
      await readSkillFile("ce-brainstorm/references/universal-brainstorming.md"),
      await readSkillFile("ce-ideate/references/post-ideation-workflow.md"),
      await readSkillFile("ce-commit-push-pr/SKILL.md"),
    ]
    const combined = files.join("\n")

    expect(combined).toContain("core Compound Engineering `ce-proof`")
    expect(combined).toContain("Proof review requires the core Compound Engineering plugin")
    expect(combined).toContain("core Compound Engineering `ce-demo-reel`")
    expect(combined).toContain("do not pretend ce-datascience ships its own demo-capture skill")
  })

  test("upstream-only workflow references are explicitly external or core", async () => {
    const files = [
      await readSkillFile("ce-plan/references/plan-handoff.md"),
      await readSkillFile("ce-brainstorm/references/handoff.md"),
      await readSkillFile("ce-ideate/references/post-ideation-workflow.md"),
      await readSkillFile("ce-work/references/shipping-workflow.md"),
      await readSkillFile("ce-code-review/references/review-output-template.md"),
    ]
    const combined = files.join("\n")

    expect(combined).toContain("When the core ce-proof skill returns")
    expect(combined).toContain("core Compound Engineering `ce-demo-reel`")
    expect(combined).toContain("external/core Compound Engineering agent-native reviewer")
    expect(combined).not.toContain("AskUserQuestion")
    expect(combined).not.toContain("ToolSearch")
    expect(combined).not.toContain("request_user_input")
    expect(combined).not.toContain("pi-ask-user")
  })

  test("worktree workflow detects harness isolation before using git fallback", async () => {
    const worktree = await readSkillFile("ce-worktree/SKILL.md")

    expect(worktree).toContain("git rev-parse --absolute-git-dir")
    expect(worktree).toContain("Prefer the harness's native worktree tool")
    expect(worktree).toContain("Never nest another worktree")
    expect(worktree).not.toContain("worktree-manager.sh")
  })
})

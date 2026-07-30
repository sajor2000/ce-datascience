import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const skillsRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills")

async function skill(name: string): Promise<string> {
  return readFile(path.join(skillsRoot, name, "SKILL.md"), "utf8")
}

describe("token-tight ADHD-inspired ideation", () => {
  test("ce-ideate gates direct, compact, and explicit-wide reasoning paths", async () => {
    const content = await skill("ce-ideate")

    expect(content).toContain("#### 0.5b Divergence Gate")
    expect(content).toContain("**Direct**")
    expect(content).toContain("**Compact divergent (default)**")
    expect(content).toContain("**Wide divergent**")
    expect(content).toMatch(/ADHD mode.*go wide.*wide exploration/i)
    expect(content).toMatch(/Explicit wide requests override direct-path signals/i)
  })

  test("ce-ideate uses isolated three-frame generation and a separate compact critic", async () => {
    const content = await skill("ce-ideate")

    expect(content).toMatch(/exactly 3.*4 candidates each/i)
    expect(content).toMatch(/Generator branches are isolated/i)
    expect(content).toMatch(/no ranking, evaluation, or hedging/i)
    expect(content).toMatch(/Separate critic pass/i)
    expect(content).toMatch(/top 2 non-trap survivors/i)
    expect(content).toMatch(/do not dispatch additional deepening agents/i)
  })

  test("ce-ideate preserves evidence and compact survivor rules", async () => {
    const content = await skill("ce-ideate")
    const universalIdeation = await readFile(
      path.join(skillsRoot, "ce-ideate", "references", "universal-ideation.md"),
      "utf8",
    )

    expect(content).toContain("Warrant is required, not optional")
    expect(content).toMatch(/Compact issue-tracker mode still uses exactly 3/i)
    expect(universalIdeation).toMatch(/exactly three isolated frames/i)
    expect(universalIdeation).toMatch(/never share another generator's candidates or critique/i)
    expect(universalIdeation).toMatch(/3-5 survivors in compact divergent mode/i)
    expect(universalIdeation).toMatch(/5-7 in explicit wide mode/i)
  })

  test("biomedical ideation keeps the direct and compact fan-out caps", async () => {
    const biomedicalFrames = await readFile(
      path.join(skillsRoot, "ce-ideate", "references", "biomedical-frames.md"),
      "utf8",
    )

    expect(biomedicalFrames).toMatch(/Direct:.*dispatch no frame agents/i)
    expect(biomedicalFrames).toContain(
      "dispatch exactly 3 isolated frame agents, each returning exactly 4 candidates",
    )
    expect(biomedicalFrames).toMatch(/only when the user explicitly requests ADHD mode.*go wide/i)
    expect(biomedicalFrames).toMatch(/dispatch all 6 frames/i)
    expect(biomedicalFrames).toMatch(/generic separate critic pass/i)
  })

  test("ce-brainstorm requires meaningful alternatives and optional trap checks", async () => {
    const content = await skill("ce-brainstorm")

    expect(content).toMatch(/at least two options are genuinely viable/i)
    expect(content).toMatch(/Do not add agent fan-out for routine clarification/i)
    expect(content).toMatch(/adversarial or assumption-inverting challenger/i)
    expect(content).toMatch(/attractive-but-unsuitable option as a \*\*trap\*\*/i)
    expect(content).toMatch(/Do not manufacture a trap/i)
  })
})

import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

const skillRoot = path.join(import.meta.dir, "..", "plugins", "ce-datascience", "skills")

describe("manuscript editing contracts", () => {
  test("preserves required rationale and factual uncertainty without encouraging overclaiming", async () => {
    const [discipline, antiSlop, voice, preSubmission] = await Promise.all([
      fs.readFile(path.join(skillRoot, "ce-manuscript-section-discipline", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillRoot, "ce-scientific-anti-slop", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillRoot, "ce-clinical-research-voice", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillRoot, "ce-pre-submission-audit", "SKILL.md"), "utf8"),
    ])

    expect(discipline).toContain("preserve required or prespecified methodological rationale")
    expect(discipline).not.toContain("interpretation, rationale, caveats, and hedging belong in Discussion")
    expect(antiSlop).toContain("preserving required or prespecified methodological rationale and factual statistical statements")
    expect(antiSlop).not.toContain("any interpretation, hedge, or caveat found inside Methods or Results")
    expect(voice).toContain("Calibrate every claim to the study design, estimand, uncertainty, and strength of evidence")
    expect(voice).not.toContain("Default to assertion over hedging")
    expect(preSubmission).toContain("as protected content")
    expect(preSubmission).toContain("flag it for verification rather than silently deleting it")
  })
})

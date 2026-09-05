import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

const skillRoot = path.join(import.meta.dir, "..", "plugins", "ce-datascience", "skills")

describe("manuscript editing contracts", () => {
  test("preserves required rationale and factual uncertainty without encouraging overclaiming", async () => {
    const [discipline, antiSlop, voice, preSubmission, scientificWriting, writingPatterns] = await Promise.all([
      fs.readFile(path.join(skillRoot, "ce-manuscript-section-discipline", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillRoot, "ce-scientific-anti-slop", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillRoot, "ce-clinical-research-voice", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillRoot, "ce-pre-submission-audit", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillRoot, "ce-scientific-writing", "SKILL.md"), "utf8"),
      fs.readFile(path.join(skillRoot, "ce-scientific-writing", "references", "scientific-writing-patterns.md"), "utf8"),
    ])

    expect(discipline).toContain("preserve required or prespecified methodological rationale")
    expect(discipline).not.toContain("interpretation, rationale, caveats, and hedging belong in Discussion")
    expect(antiSlop).toContain("preserving required or prespecified methodological rationale and factual statistical statements")
    expect(antiSlop).not.toContain("any interpretation, hedge, or caveat found inside Methods or Results")
    expect(voice).toContain("Calibrate every claim to the study design, estimand, uncertainty, and strength of evidence")
    expect(voice).not.toContain("Default to assertion over hedging")
    expect(preSubmission).toContain("as protected content")
    expect(preSubmission).toContain("flag it for verification rather than silently deleting it")
    expect(scientificWriting).toContain("Scientific validity, source traceability, and statistical meaning control the prose")
    expect(scientificWriting).toContain("A thesis in scientific writing is the strongest claim the design and results support")
    expect(scientificWriting).toContain("Do not manufacture controversy")
    expect(scientificWriting).toContain("both the data environment and active model endpoint are compliant for PHI/PII")
    expect(scientificWriting).toContain("Never reproduce PHI/PII or patient-level source details")
    expect(writingPatterns).toContain("PMID [40228832]")
    expect(writingPatterns).toContain("PMID [17941715]")
    expect(writingPatterns).toContain("PMID [33781993]")
    expect(writingPatterns).toContain("PMID [38626948]")
    expect(writingPatterns).toContain("Do not present an AUC alone as adequate model performance")
    expect(writingPatterns).toContain("Do not translate a hazard ratio into relative or absolute risk")
  })
})

import { readFile } from "fs/promises"
import path from "path"
import { describe, expect, test } from "bun:test"

const skillRoot = path.join(process.cwd(), "plugins/ce-datascience/skills/ce-adversarial-review")

describe("ce-adversarial-review contract", () => {
  test("defines portable code and plan routing with an explicit local fallback", async () => {
    const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8")

    expect(skill).toContain("target:auto|code|plan")
    expect(skill).toContain("peer:auto|claude|codex|local")
    expect(skill).toContain("depth:quick|auto|deep")
    expect(skill).toContain("local-only (explicit)")
    expect(skill).toContain("local-only (peer unavailable)")
    expect(skill).toContain("Do not choose among multiple candidate documents")
  })

  test("bounds peer debate and preserves its disposition", async () => {
    const [skill, protocol] = await Promise.all([
      readFile(path.join(skillRoot, "SKILL.md"), "utf8"),
      readFile(path.join(skillRoot, "references/debate-protocol.md"), "utf8"),
    ])

    expect(skill).toContain("not debated due to budget")
    expect(skill).toContain("independently corroborated")
    expect(skill).toContain("converged after rebuttal")
    expect(protocol).toContain("no more than five findings")
    expect(protocol).toContain("no more than three rounds")
    expect(protocol).toContain("Never use raw peer output")
  })

  test("keeps cross-harness dispatch read-only and evidence grounded", async () => {
    const [skill, contract] = await Promise.all([
      readFile(path.join(skillRoot, "SKILL.md"), "utf8"),
      readFile(path.join(skillRoot, "references/peer-review-contract.md"), "utf8"),
    ])

    expect(contract).toContain("claude auth status")
    expect(contract).toContain("codex login status")
    expect(contract).toContain("--permission-mode plan")
    expect(contract).toContain('cd "<repo-root>"')
    expect(contract).toContain('> "<run-dir>/peer.md"')
    expect(contract).toContain('2> "<run-dir>/peer.stderr"')
    expect(contract).not.toContain('"Read,Grep,Glob,Bash"')
    expect(contract).toContain("--sandbox read-only")
    expect(contract).toContain("peer.normalized.json")
    expect(contract).toContain("validate_peer_artifact.py")
    expect(skill).toContain("Ref MCP")
    expect(skill).toContain("Tavily MCP")
    expect(skill).toMatch(/Never configure an MCP server/i)
    expect(skill).toMatch(/never commit that directory/i)
  })

  test("ships a bounded peer artifact validator", async () => {
    const validator = await readFile(path.join(skillRoot, "scripts/validate_peer_artifact.py"), "utf8")

    expect(validator).toContain("MAX_INPUT_BYTES = 64 * 1024")
    expect(validator).toContain("MAX_FINDINGS = 5")
    expect(validator).toContain("location must stay within the repository")
  })

  test("requires adversarial evidence and rejects peer claims in explicit local mode", async () => {
    const caseDefinition = await readFile(
      path.join(
        process.cwd(),
        "evals/ce-datascience/cases/ce-adversarial-review-local-plan/case.yaml",
      ),
      "utf8",
    )

    expect(caseDefinition).toContain("reports-target-location")
    expect(caseDefinition).toContain("reports-token-rotation-risk")
    expect(caseDefinition).toContain("reports-quick-mode")
    expect(caseDefinition).toContain("claims-peer-review")
    expect(caseDefinition).toMatch(/peer \(completed\|ran\|finished\)/i)
  })
})

import { readFile } from "fs/promises"
import path from "path"
import { describe, expect, test } from "bun:test"

async function skill(name: string): Promise<string> {
  return readFile(
    path.join(process.cwd(), "plugins/ce-datascience/skills", name, "SKILL.md"),
    "utf8",
  )
}

describe("current Compound Engineering workflow compatibility", () => {
  test("ce-work supports caller-owned shipping tails", async () => {
    const content = await skill("ce-work")
    expect(content).toContain("mode:return-to-caller")
    expect(content).toContain("mode:caller-owned-tail")
    expect(content).toContain("standalone_shipping_skipped: true")
    expect(content).toMatch(/mode token without a following path is an error/i)
    expect(content).toMatch(/skip this phase and use the Return-to-Caller contract/i)
  })

  test("ce-work fails loudly at analytical data boundaries", async () => {
    const content = await skill("ce-work")
    expect(content).toMatch(/do not swallow exceptions with bare catch-all handlers/i)
    expect(content).toMatch(/do not invent fallback data/i)
    expect(content).toMatch(/do not silently coerce values/i)
    expect(content).toMatch(/do not replace failed inputs with synthetic data/i)
    expect(content).toMatch(/assert validation at critical input, join, transformation, and output boundaries/i)
    expect(content).toMatch(/without expanding the requested analysis scope/i)
  })

  test("ce-code-review supports the current read-only agent JSON contract", async () => {
    const content = await skill("ce-code-review")
    expect(content).toContain("`mode:agent`")
    expect(content).toContain("### JSON output format (`mode:agent` only)")
    expect(content).toContain("review.json")
    expect(content).toContain('"actionable_findings": []')
    expect(content).toMatch(/Agent mode never includes applied fixes because it never mutates/)
    expect(content).toMatch(/emit nothing after the single JSON object/i)
    expect(content).toMatch(/mode:agent.*do \*\*not\*\* run `gh pr checkout/s)
    expect(content).toMatch(/\| `agent` \| Yes, eagerly and read-only/)
  })

  test("planning consumes and enriches current unified artifacts in place", async () => {
    const plan = await skill("ce-plan")
    const review = await skill("ce-doc-review")
    expect(plan).toContain("artifact_contract: ce-unified-plan/v1")
    expect(plan).toContain("artifact_readiness: requirements-only")
    expect(plan).toContain("artifact_readiness: implementation-ready")
    expect(plan).toMatch(/update that same canonical file in place/i)
    expect(plan).toMatch(/do not offer to create a sibling plan/i)
    expect(review).toContain("unified-requirements")
    expect(review).toContain("unified-plan")
    expect(review).toMatch(/readiness describes artifact shape, not execution state/i)
  })

  test("maintenance and debugging preserve institutional context", async () => {
    const refresh = await skill("ce-compound-refresh")
    const debug = await skill("ce-debug")
    expect(refresh).toMatch(/only after checking inbound links/i)
    expect(refresh).toMatch(/substantive citation/i)
    expect(debug).toContain("#### 1.4 Check tracker and pull-request history for prior work")
    expect(debug).toMatch(/open pull request already contains the fix/i)
    expect(debug).toMatch(/do not offer a duplicate "Fix it now" path/i)
  })
})

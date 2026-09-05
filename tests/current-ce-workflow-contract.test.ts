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
  test("September refresh docs report the tracked plugin inventory", async () => {
    const docs = await Promise.all([
      readFile(path.join(process.cwd(), "docs/brainstorms/2026-04-27-ce-datascience-fork-requirements.md"), "utf8"),
      readFile(path.join(process.cwd(), "docs/plans/2026-04-27-001-feat-ce-datascience-fork-plan.md"), "utf8"),
      readFile(path.join(process.cwd(), "docs/plans/2026-04-29-001-feat-competitive-feature-port-plan.md"), "utf8"),
    ])

    for (const doc of docs) expect(doc).toMatch(/September 2026[\s\S]{0,300}55[- ]agents?.*77[- ]skills?/i)
  })

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

  test("notebook execution never substitutes synthetic study data", async () => {
    const [work, marimo, standards, editor] = await Promise.all([
      skill("ce-work"),
      skill("ce-marimo"),
      skill("ce-notebook-standards"),
      skill("ce-notebook-edit"),
    ])

    for (const content of [work, marimo, standards, editor]) {
      expect(content).toMatch(/synthetic.*only.*explicit/i)
      expect(content).toMatch(/do not.*synthetic.*study result/i)
      expect(content).toMatch(/restricted data root/i)
      expect(content).toMatch(/QA (?:provenance|evidence)/i)
      expect(content).toMatch(/do not.*persist output/i)
      expect(content).toMatch(/synthetic fixture or generator/i)
    }
    expect(work).toMatch(/reads, creates, transforms, validates, or renders analytical data or output/i)
    expect(standards).toMatch(/study-output location/i)
  })

  test("ce-work keeps TDD opt-in, behavior-first, and vertically sliced", async () => {
    const content = await skill("ce-work")
    expect(content).toMatch(/first agree the public behavior and seam under test/i)
    expect(content).toMatch(/do not test private implementation details/i)
    expect(content).toMatch(/name the public behavior and test seam before writing the first test/i)
    expect(content).toMatch(/one failing behavior test, the minimal implementation that makes it pass, then the next behavior slice/i)
    expect(content).toMatch(/Skip test-first discipline for trivial renames, pure configuration, pure styling work, and analytical workflows unless/i)
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

  test("selected 3.24 safeguards survive the data-science adaptations", async () => {
    const [work, refresh, commit, optimize, optimizePrompt] = await Promise.all([
      skill("ce-work"),
      skill("ce-compound-refresh"),
      skill("ce-commit"),
      skill("ce-optimize"),
      readFile(path.join(process.cwd(), "plugins/ce-datascience/skills/ce-optimize/references/experiment-prompt-template.md"), "utf8"),
    ])

    expect(work).toMatch(/out-of-repo state.*no git-derived completion signal/i)
    expect(refresh).toMatch(/independently supported guidance.*potential product regression/i)
    expect(commit).toMatch(/GIT_INDEX_FILE="\$group_index" git read-tree HEAD/)
    expect(commit).toMatch(/Stage each named file once only when it has no staged entry/i)
    expect(commit).toMatch(/already has staged and unstaged changes.*do not restage it/i)
    expect(commit).toMatch(/git diff --cached --binary -- file1 file2 file3.*GIT_INDEX_FILE="\$group_index" git apply --cached --binary -/s)
    expect(commit).toMatch(/GIT_INDEX_FILE="\$group_index" git commit -F <message-file>/)
    expect(commit).toMatch(/stop immediately if any command fails.*final restore only after.*commit succeeds/is)
    expect(commit).not.toMatch(/git commit -F <message-file> --/)
    expect(commit).not.toMatch(/git commit -m "\$\(cat/)
    expect(optimize).toMatch(/Active coding task.*platform subagent primitive/s)
    expect(optimize).toMatch(/Active coding task:.*Do not launch nested `codex exec`/s)
    expect(optimize).toMatch(/External terminal only.*codex exec/s)
    expect(optimize).toMatch(/separate experiment worktree.*parallel worker/i)
    expect(optimize).toMatch(/experiment-worktree\.sh create/)
    expect(optimize).toMatch(/codex exec --cd "\$experiment_path" --skip-git-repo-check -/)
    expect(optimizePrompt).toMatch(/active Codex task.*native subagent/i)
    expect(optimizePrompt).toMatch(/active Codex task.*do not launch nested Codex/i)
    expect(optimizePrompt).toMatch(/external terminal.*codex exec/i)
    expect(optimizePrompt).toMatch(/each parallel experiment.*experiment-worktree\.sh create/i)
    expect(optimizePrompt).toMatch(/codex exec --cd "\$experiment_path" --skip-git-repo-check -/)
  })

  test("post-3.24 workflow safeguards remain portable and project-governed", async () => {
    const [work, plan, planTemplate, synthesis, debug, commitPushPr] = await Promise.all([
      skill("ce-work"),
      readFile(path.join(process.cwd(), "plugins/ce-datascience/skills/ce-plan/references/plan-sections.md"), "utf8"),
      readFile(path.join(process.cwd(), "plugins/ce-datascience/skills/ce-plan/references/plan-template.md"), "utf8"),
      readFile(path.join(process.cwd(), "plugins/ce-datascience/skills/ce-plan/references/synthesis-summary.md"), "utf8"),
      skill("ce-debug"),
      skill("ce-commit-push-pr"),
    ])

    expect(work).toMatch(/semantic dependencies.*serialize/i)
    const sapGate = work.indexOf("SAP-section ownership check")
    const parallelize = work.indexOf("Parallelize the remaining independent units")
    expect(sapGate).toBeGreaterThanOrEqual(0)
    expect(parallelize).toBeGreaterThanOrEqual(0)
    expect(sapGate).toBeLessThan(parallelize)
    expect(work).toMatch(/intended base commit SHA/i)
    expect(work).toMatch(/worker verifies.*`HEAD`.*SHA/i)
    expect(work).toMatch(/depends on uncommitted state.*inline or serially.*commit its prerequisite/is)
    expect(work).toMatch(/never send it to an isolated stale snapshot/i)
    expect(plan).toMatch(/Objective.*reader can hold as the.*goal/is)
    expect(plan).toMatch(/constraints.*requirements/i)
    expect(planTemplate).toContain("## Summary")
    expect(planTemplate).toMatch(/implementation-independent outcome/i)
    expect(planTemplate).not.toContain("## Overview")
    expect(synthesis).toMatch(/lead with the implementation-independent Objective/i)
    expect(synthesis).toMatch(/implementation-independent Objective only/i)
    expect(synthesis).not.toMatch(/lead with the actual implementation shape/i)
    expect(synthesis).not.toMatch(/approach sentence only when useful/i)
    expect(synthesis.match(/\[Objective — the implementation-independent outcome\]/g)?.length).toBe(2)
    expect(synthesis).toMatch(/\[Objective — the implementation-independent outcome\]\s+\[scope claim/s)
    expect(synthesis).toMatch(/\[Objective — the implementation-independent outcome\]\s+The brainstorm scopes/s)
    expect(debug).toMatch(/Secrets in evidence/)
    expect(debug).toMatch(/credentials out of command arguments and user-visible output/i)
    expect(debug).toContain("<REDACTED>")
    expect(debug).toMatch(/ask the user to inspect it locally/i)
    expect(debug).toMatch(/numeric baseline/i)
    expect(debug).toMatch(/Attribute the bottleneck before optimizing/i)
    expect(debug).toMatch(/verify the fix by repeating the same measurement/i)
    expect(commitPushPr).toMatch(/Project publishing gate/)
    expect(commitPushPr).toMatch(/discover any additional path-scoped instructions governing the committed files/i)
    expect(commitPushPr).toMatch(/exact final commit state/i)
    expect(commitPushPr).toMatch(/missing or failing.*keep the local commit.*stop before the external write/is)
    expect(commitPushPr).toMatch(/GIT_INDEX_FILE="\$group_index" git read-tree HEAD/)
    expect(commitPushPr).toMatch(/Stage each named file once only when it has no staged entry/i)
    expect(commitPushPr).toMatch(/already has staged and unstaged changes.*do not restage it/i)
    expect(commitPushPr).toMatch(/git diff --cached --binary -- file1 file2 file3.*GIT_INDEX_FILE="\$group_index" git apply --cached --binary -/s)
    expect(commitPushPr).toMatch(/GIT_INDEX_FILE="\$group_index" git commit -F <message-file>/)
    expect(commitPushPr).toMatch(/stop immediately if any command fails.*final restore only after.*commit succeeds/is)
    expect(commitPushPr).not.toMatch(/git commit -F <message-file> --/)
    expect(commitPushPr).not.toMatch(/git commit -m "\$\(cat/)
  })

  test("plan visuals keep behavioral comparison tables out of Summary", async () => {
    const [plan, visual] = await Promise.all([
      skill("ce-plan"),
      readFile(path.join(process.cwd(), "plugins/ce-datascience/skills/ce-plan/references/visual-communication.md"), "utf8"),
    ])

    expect(plan).not.toMatch(/behavioral modes\/variants in Summary or Problem Frame/i)
    expect(visual).toMatch(/Problem Frame involving 3\+ behavioral modes/i)
    expect(visual).toMatch(/never within the objective-only Summary/i)
  })

  test("ce-debug requires a red-capable loop while retaining diagnosis-only", async () => {
    const debug = await skill("ce-debug")
    expect(debug).toContain("#### 1.0 Build a tight reproduction loop")
    expect(debug).toMatch(/Symptom-specific.*user's reported failure/s)
    expect(debug).toMatch(/Red-capable.*fail on this bug and pass after the fix/s)
    expect(debug).toMatch(/Minimize the reproduction before proceeding/i)
    expect(debug).toMatch(/Form 3-5 hypotheses.*ranked by likelihood before testing one/i)
    expect(debug).toMatch(/Do not proceed to Phase 3 until the Phase 1 loop has been run red/i)
    expect(debug).toContain("Diagnosis only — I'll take it from here")
    expect(debug).toMatch(/re-run the original, un-minimized reproduction loop before handoff/i)
  })

  test("maintainer guidance covers predictable and portable skill authoring", async () => {
    const [agents, guidance] = await Promise.all([
      readFile(path.join(process.cwd(), "AGENTS.md"), "utf8"),
      readFile(path.join(process.cwd(), "docs/solutions/skill-design/predictable-skill-authoring.md"), "utf8"),
    ])
    expect(agents).toContain("docs/solutions/skill-design/predictable-skill-authoring.md")
    expect(guidance).toMatch(/checkable completion criterion/i)
    expect(guidance).toMatch(/skill-local `references\//i)
    expect(guidance).toMatch(/frontmatter descriptions as routing interfaces/i)
    expect(guidance).toMatch(/runtime skills self-contained and portable/i)
  })
})

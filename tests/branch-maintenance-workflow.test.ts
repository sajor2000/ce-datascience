import { expect, test } from "bun:test"

const workflow = await Bun.file(".github/workflows/branch-maintenance.yml").text()

test("weekly branch maintenance is scheduled, manually runnable, and read-only", () => {
  expect(workflow).toContain('cron: "23 17 * * 2"')
  expect(workflow).toContain("workflow_dispatch:")
  expect(workflow).toContain("contents: read")
  expect(workflow).toContain("pull-requests: read")
  expect(workflow).not.toMatch(/git branch -[dD]|git push|DELETE|contents: write|pull-requests: write/)
})

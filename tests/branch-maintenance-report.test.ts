import { describe, expect, test } from "bun:test"
import { classifyBranches, fetchAll, renderReport } from "../scripts/maintenance/report-branch-candidates"

const mergedPullRequest = {
  number: 12,
  html_url: "https://github.com/example/repo/pull/12",
  merged_at: "2026-08-19T17:23:00Z",
  updated_at: "2026-08-19T17:23:00Z",
  head: { sha: "candidate-sha" },
}

describe("weekly branch maintenance report", () => {
  test("lists only a merged branch whose current head has not changed", () => {
    const report = classifyBranches("main", [
      { name: "main", protected: true, commit: { sha: "main-sha" } },
      { name: "merged-feature", protected: false, commit: { sha: "candidate-sha" } },
      { name: "open-feature", protected: false, commit: { sha: "open-sha" } },
      { name: "post-merge", protected: false, commit: { sha: "new-sha" } },
      { name: "protected", protected: true, commit: { sha: "protected-sha" } },
    ], new Map([
      ["merged-feature", { open: [], closed: [mergedPullRequest] }],
      ["open-feature", { open: [mergedPullRequest], closed: [mergedPullRequest] }],
      ["post-merge", { open: [], closed: [mergedPullRequest] }],
    ]))

    expect(report.candidates.map((candidate) => candidate.branch)).toEqual(["merged-feature"])
    expect(report.exclusions).toEqual(expect.arrayContaining([
      { branch: "main", reason: "default branch" },
      { branch: "open-feature", reason: "open pull request" },
      { branch: "post-merge", reason: "post-merge commits" },
      { branch: "protected", reason: "protected branch" },
    ]))
  })

  test("renders a clear no-candidates report", () => {
    expect(renderReport({ candidates: [], exclusions: [] }, "workflow_dispatch")).toContain("No cleanup candidates found.")
  })

  test("follows pagination and fails on a malformed API page", async () => {
    const pages = [
      new Response(JSON.stringify([{ name: "first" }]), { headers: { link: '<https://api.github.test/next>; rel="next"' } }),
      new Response(JSON.stringify([{ name: "second" }])),
    ]
    const items = await fetchAll<{ name: string }>(async () => pages.shift()!, "https://api.github.test/first", "token")
    expect(items).toEqual([{ name: "first" }, { name: "second" }])

    await expect(fetchAll(async () => new Response(JSON.stringify({ error: "bad" })), "https://api.github.test/bad", "token")).rejects.toThrow("non-list response")
  })
})

// Regressions for the Cursor security review findings on PRs #86 and #87.
import { describe, expect, test } from "bun:test"
import { mkdirSync, writeFileSync } from "fs"
import path from "path"
import { APPROVED, SCHEMA_ONLY, bash, expectAll, pluginRoot, project, runGuard, verdicts } from "./data-boundary-harness"

function withFile(root: string, rel: string, content: string) {
  mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
  writeFileSync(path.join(root, rel), content)
  return root
}

describe("#86: default Grep and copy/dump commands cannot print data rows (schema-only)", () => {
  test("Grep in content mode with no path, '.', or '**/*' is denied; Bash dumps and copies of data are denied", () => {
    const root = project(SCHEMA_ONLY)
    expectAll(root, "deny", [
      ["Grep", { pattern: "FAKE", output_mode: "content" }],
      ["Grep", { pattern: "FAKE", output_mode: "content", path: "." }],
      ["Grep", { pattern: "FAKE", output_mode: "content", glob: "**/*" }],
      ["Bash", bash("cp data/cohort.csv leak.txt")],
      ["Bash", bash("mv data/cohort.csv notes.md")],
      ["Bash", bash("base64 data/cohort.csv")],
      ["Bash", bash("dd if=data/cohort.csv")],
      ["Bash", bash("git show HEAD:data/cohort.csv")],
    ])
    expectAll(root, "allow", [["Grep", { pattern: "read_csv", output_mode: "content", glob: "**/*.py" }]])
  })
})

describe("#86: MCP identifier checks have no key-name exemption (every mode)", () => {
  test("an SSN or email under id/ids/pmid/doi/upload_id is denied; real PMIDs, DOIs, and PMCIDs pass", () => {
    const root = project(APPROVED)
    for (const v of verdicts(root, [
      ["mcp__pubmed__fetch", { ids: ["123-45-6789"] }],
      ["mcp__pubmed__fetch", { pmid: "123-45-6789 in pmid field" }],
      ["mcp__pubmed__fetch", { id: "zed.t@example.com" }],
      ["mcp__pubmed__fetch", { doi: "MRN 00123456" }],
      ["mcp__paperclip__upload", { upload_id: "data/cohort.csv" }],
    ])) expect({ input: v.input, decision: v.decision, kind: v.kind }).toEqual({ input: v.input, decision: "deny", kind: "egress" })
    expectAll(root, "allow", [
      ["mcp__pubmed__fetch", { pmids: ["31978945", "32109013"] }],
      ["mcp__pubmed__fetch", { pmid: 31978945 as unknown as string }],
      ["mcp__pubmed__fetch", { doi: "10.1056/NEJMoa2002032", pmcid: "PMC7092803" }],
      ["mcp__pubmed__fetch", { ids: ["PMC7092803", "10.1001/jama.2020.1585"] }],
    ])
  })
})

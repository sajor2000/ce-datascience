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

describe("#86: edit tools return a snippet of the file, so they follow the Read rules (schema-only)", () => {
  test("Edit/MultiEdit on a data file and NotebookEdit on a notebook with outputs are denied; code edits pass", () => {
    const root = project(SCHEMA_ONLY)
    expectAll(root, "deny", [
      ["Edit", { file_path: "data/cohort.csv", old_string: "record_id", new_string: "rid" }],
      ["Edit", { file_path: "data/notes.txt", old_string: "x", new_string: "y" }],
      ["MultiEdit", { file_path: "data/cohort.csv", edits: [{ old_string: "dob", new_string: "d" }] }],
      ["NotebookEdit", { notebook_path: "notebooks/with_out.ipynb", new_source: "x = 1" }],
    ])
    expectAll(root, "allow", [
      ["Edit", { file_path: "src/load.py", old_string: "pd", new_string: "pandas" }],
      ["NotebookEdit", { notebook_path: "notebooks/clean.ipynb", new_source: "x = 1" }],
    ])
  })

  test("the PreToolUse matcher routes Edit, MultiEdit, and NotebookEdit to the guard", () => {
    const hooks = JSON.parse(require("fs").readFileSync(path.join(pluginRoot, "hooks", "hooks.json"), "utf8"))
    const matcher = new RegExp(`^(?:${hooks.hooks.PreToolUse[0].matcher})$`)
    for (const tool of ["Edit", "MultiEdit", "NotebookEdit", "Read", "Grep", "Bash"]) expect({ tool, routed: matcher.test(tool) }).toEqual({ tool, routed: true })
  })
})

const indexFile = (root: string) => path.join(root, ".ce-datascience", "identifier-index.local.json")
const VALID_SALT = "00112233445566778899aabbccddeeff"

describe("#87: a malformed identifier index fails closed instead of disabling the checks", () => {
  const poisoned: Record<string, string> = {
    "non-hex salt": JSON.stringify({ version: 1, salt: "zz", width: 16, count: 0, hashes: "" }),
    "zero width": JSON.stringify({ version: 1, salt: VALID_SALT, width: 0, count: 0, hashes: "" }),
    "non-hex hashes": JSON.stringify({ version: 1, salt: VALID_SALT, width: 16, count: 1, hashes: "x".repeat(16) }),
    "ragged hashes": JSON.stringify({ version: 1, salt: VALID_SALT, width: 16, count: 1, hashes: "a".repeat(17) }),
    "count mismatch": JSON.stringify({ version: 1, salt: VALID_SALT, width: 16, count: 5, hashes: "a".repeat(16) }),
    "unsorted hashes": JSON.stringify({ version: 1, salt: VALID_SALT, width: 16, count: 2, hashes: "f".repeat(16) + "0".repeat(16) }),
    "not JSON": "{",
    "a list": "[]",
  }
  for (const [label, body] of Object.entries(poisoned)) {
    test(`${label}: MCP calls are denied end to end with a rebuild hint, never allowed after an internal error`, () => {
      const root = project(APPROVED)
      writeFileSync(indexFile(root), body)
      for (const input of [{ query: "sepsis outcomes", note: "123-45-6789" }, { query: "sepsis outcomes" }]) {
        const result = runGuard(root, "mcp__paperclip__search", input)
        expect({ label, decision: result.decision, stderr: result.stderr }).toEqual({ label, decision: "deny", stderr: "" })
        expect(result.reason).toContain("ce-identifier-index")
      }
    })
  }

  test("a well-formed empty index is valid: pattern checks still run and normal queries pass", () => {
    const root = project(APPROVED)
    writeFileSync(indexFile(root), JSON.stringify({ version: 1, salt: VALID_SALT, width: 16, count: 0, hashes: "" }))
    expect(runGuard(root, "mcp__paperclip__search", { query: "sepsis outcomes" }).decision).toBe("allow")
    expect(runGuard(root, "mcp__paperclip__search", { query: "sepsis", note: "123-45-6789" }).decision).toBe("deny")
  })

  test("schema-peek masks every heading and ce-safe-run withholds names when the index is malformed", () => {
    const root = project(SCHEMA_ONLY)
    writeFileSync(indexFile(root), JSON.stringify({ salt: "zz", width: 0, hashes: "" }))
    withFile(root, "output/summary.csv", "group,n\nexposed,120\n")
    const peek = Bun.spawnSync(["python3", path.join(pluginRoot, "scripts", "schema-peek.py"), "output/summary.csv"], { cwd: root })
    const out = peek.stdout.toString() + peek.stderr.toString()
    expect(out).toContain("col_1 [masked header]")
    expect(out).not.toContain("Traceback")
    const run = Bun.spawnSync([path.join(pluginRoot, "scripts", "ce-safe-run"), "--", "python3", "-c",
      "open('zed_testperson.txt','w').write('x'); import sys; sys.stderr.write('Zed Testperson failed\\n')"], { cwd: root })
    const ran = run.stdout.toString() + run.stderr.toString()
    expect(ran).not.toContain("Traceback")
    for (const value of ["Zed", "Testperson", "zed_testperson"]) expect({ value, leaked: ran.includes(value) }).toEqual({ value, leaked: false })
    expect(ran).toContain("ce-identifier-index")
  })
})

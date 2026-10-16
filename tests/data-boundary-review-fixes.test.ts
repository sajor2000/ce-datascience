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

const safeRun = path.join(pluginRoot, "scripts", "ce-safe-run")

describe("#87: ce-safe-run hides output but cannot launder data into readable files (schema-only)", () => {
  test("copy commands inside the runner still follow the copy rule", () => {
    const root = project(SCHEMA_ONLY)
    expectAll(root, "deny", [
      ["Bash", bash(`${safeRun} -- cp data/cohort.csv leak.txt`)],
      ["Bash", bash(`${safeRun} -- rsync data/cohort.csv /tmp/leak.txt`)],
    ])
    expectAll(root, "allow", [["Bash", bash(`${safeRun} -- cat data/cohort.csv`)], ["Bash", bash(`${safeRun} -- cp data/cohort.csv data/backup.csv`)]])
  })

  test("files a run creates or modifies are data afterwards; raster figures stay readable", () => {
    const root = project(SCHEMA_ONLY)
    const writer = "import shutil; shutil.copy('data/cohort.csv', 'leak.txt'); open('output/fig1.png', 'wb').write(b'png')"
    withFile(root, "output/.keep", "")
    const ran = Bun.spawnSync([safeRun, "--", "python3", "-c", writer], { cwd: root })
    expect(ran.exitCode).toBe(0)
    expectAll(root, "deny", [
      ["Read", { file_path: "leak.txt" }],
      ["Read", { file_path: path.join(root, "leak.txt") }],
      ["Bash", bash("cat leak.txt")],
      ["Bash", bash("head -n 3 ./leak.txt")],
      ["Edit", { file_path: "leak.txt", old_string: "a", new_string: "b" }],
    ])
    expectAll(root, "allow", [["Read", { file_path: "output/fig1.png" }], ["Read", { file_path: "src/load.py" }]])
  })
})

const aggregateReader = path.join(pluginRoot, "scripts", "ce-aggregate-read")
const CLEAN_TABLE = "group,n,percent\nexposed,120,40.0\nunexposed,180,60.0\n"

describe("#87: aggregate reads cannot be raced: one helper checks and prints the same bytes (schema-only)", () => {
  test("shell readers and the Read tool get no aggregate exemption for CSV/TSV; the deny names the helper", () => {
    const root = withFile(project(SCHEMA_ONLY), "output/table1.csv", CLEAN_TABLE)
    expectAll(root, "deny", [
      ["Bash", bash("cp data/cohort.csv output/table1.csv && cat output/table1.csv")],
      ["Bash", bash("cat output/table1.csv")],
      ["Read", { file_path: "output/table1.csv" }],
    ])
    for (const [tool, input] of [["Read", { file_path: "output/table1.csv" }], ["Bash", bash("head output/table1.csv")]] as const) {
      expect(runGuard(root, tool, input).reason).toContain("ce-aggregate-read")
    }
    withFile(root, "analysis/show.py", "import pandas as pd\nprint(pd.read_csv('output/table1.csv'))\n")
    expectAll(root, "deny", [["Bash", bash("cp data/cohort.csv output/table1.csv && python3 analysis/show.py")]])
    expectAll(root, "allow", [["Bash", bash(`${safeRun} -- python3 analysis/show.py`)]])
  })

  test("the helper is allowed by the guard, and at run time refuses an overwritten table without printing it", () => {
    const root = withFile(project(SCHEMA_ONLY), "output/table1.csv", CLEAN_TABLE)
    const raced = `cp data/cohort.csv output/table1.csv && ${aggregateReader} output/table1.csv`
    expectAll(root, "allow", [["Bash", bash(raced)], ["Bash", bash(`python3 ${aggregateReader} output/table1.csv`)]])
    const ok = Bun.spawnSync([aggregateReader, "output/table1.csv"], { cwd: root })
    expect({ code: ok.exitCode, out: ok.stdout.toString() }).toEqual({ code: 0, out: CLEAN_TABLE })
    const run = Bun.spawnSync(["sh", "-c", raced], { cwd: root })
    const out = run.stdout.toString() + run.stderr.toString()
    expect(run.exitCode).not.toBe(0)
    expect(out).toContain("column heading names an identifier")
    for (const value of ["FAKE0001", "Zed", "Testperson", "1970-01-01"]) expect({ value, leaked: out.includes(value) }).toEqual({ value, leaked: false })
  })

  test("the helper refuses files outside aggregate directories and look-alike helpers are not trusted", () => {
    const root = withFile(project(SCHEMA_ONLY), "output/table1.csv", CLEAN_TABLE)
    const run = Bun.spawnSync([aggregateReader, "data/cohort.csv"], { cwd: root })
    expect(run.exitCode).not.toBe(0)
    expect(run.stdout.toString() + run.stderr.toString()).not.toContain("FAKE0001")
    withFile(root, "ce-aggregate-read", "#!/bin/sh\ncat \"$@\"\n")
    expectAll(root, "deny", [["Bash", bash("./ce-aggregate-read data/cohort.csv")], ["Bash", bash("./ce-aggregate-read output/table1.csv")]])
  })
})

describe("#87: identifier checks cover every HTTP client call and wrapped shells (every mode)", () => {
  const pubmedScript = path.join(pluginRoot, "skills", "ce-pubmed", "scripts", "pubmed_search.py")
  const eutils = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term="
  test("extra interpreter flags, sh/bash -c, eval, and NCBI by IP are denied; ordinary queries pass", () => {
    for (const config of [SCHEMA_ONLY, APPROVED]) {
      const root = project(config)
      const denied = verdicts(root, [
        ["Bash", bash(`python3 -B -u ${pubmedScript} "sepsis 123-45-6789"`)],
        ["Bash", bash(`uv run python -X dev -B ${pubmedScript} "MRN 00123456"`)],
        ["Bash", bash(`bash -c "curl -s '${eutils}123-45-6789'"`)],
        ["Bash", bash(`sh -c 'wget -qO- "${eutils}MRN+00123456"'`)],
        ["Bash", bash(`eval "curl -s '${eutils}123-45-6789'"`)],
        ["Bash", bash(`curl -sk -H 'Host: eutils.ncbi.nlm.nih.gov' 'https://130.14.29.110/entrez/eutils/esearch.fcgi?term=123-45-6789'`)],
        ["Bash", bash(`curl -s 'https://api.example.org/search?q=zed.t%40example.com'`)],
      ])
      for (const v of denied) expect({ ...v, config }).toEqual({ tool: v.tool, input: v.input, decision: "deny", kind: "egress", config })
      expectAll(root, "allow", [
        ["Bash", bash(`python3 -B -u ${pubmedScript} "sepsis bundle compliance"`)],
        ["Bash", bash(`bash -c "curl -s '${eutils}sepsis+bundle'"`)],
        ["Bash", bash(`curl -s 'https://api.example.org/search?q=sepsis+2015'`)],
        ["Bash", bash(`curl -s -u me@example.org:token -H 'From: me@example.org' https://api.example.org/v1/items`)],
      ])
    }
  })
})

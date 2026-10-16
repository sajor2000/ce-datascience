import { afterAll, describe, expect, test } from "bun:test"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import os from "os"
import path from "path"

// Synthetic data only. Seam: the ce_numbers.py CLI (render, check) on .docx files.
const scriptsDir = path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-numbers", "scripts")
const cli = path.join(scriptsDir, "ce_numbers.py")
const roots: string[] = []
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

function git(cwd: string, ...args: string[]) {
  const proc = Bun.spawnSync(["git", "-c", "user.email=t@example.invalid", "-c", "user.name=t", ...args], { cwd })
  if (proc.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${proc.stderr.toString()}`)
}

function run(cwd: string, cmd: string[]) {
  const proc = Bun.spawnSync(cmd, { cwd })
  return { code: proc.exitCode, out: proc.stdout.toString(), err: proc.stderr.toString() }
}

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
const NS = `${W} xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" ` +
  'xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" mc:Ignorable="w14"'

// A paragraph from runs; a run is plain text or raw run XML.
const r = (text: string, bold = false) =>
  `<w:r>${bold ? "<w:rPr><w:b/></w:rPr>" : ""}<w:t xml:space="preserve">${text}</w:t></w:r>`
const p = (...runs: string[]) => `<w:p w14:paraId="0000000A">${runs.join("")}</w:p>`

// Writes a minimal valid DOCX with the stdlib zipfile module.
function docx(file: string, ...paragraphs: string[]) {
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${NS}><w:body>${paragraphs.join("")}<w:sectPr/></w:body></w:document>`
  const script = `
import sys, zipfile
parts = {
  "[Content_Types].xml": '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  "_rels/.rels": '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  "word/document.xml": sys.stdin.read(),
}
with zipfile.ZipFile(sys.argv[1], "w", zipfile.ZIP_DEFLATED) as z:
    for name, data in parts.items():
        z.writestr(name, data)
`
  const proc = Bun.spawnSync(["python3", "-c", script, file], { stdin: Buffer.from(document) })
  if (proc.exitCode !== 0) throw new Error(proc.stderr.toString())
}

function documentXml(file: string) {
  const proc = Bun.spawnSync(["python3", "-c", "import sys, zipfile; print(zipfile.ZipFile(sys.argv[1]).read('word/document.xml').decode())", file])
  return proc.stdout.toString()
}

function project() {
  const root = mkdtempSync(path.join(os.tmpdir(), "ce-numbers-docx-"))
  roots.push(root)
  git(root, "init", "-q")
  mkdirSync(path.join(root, "data"))
  mkdirSync(path.join(root, "analysis"))
  mkdirSync(path.join(root, "manuscript"))
  writeFileSync(path.join(root, "data", "synthetic.csv"), "arm,died\nA,0\nB,1\n")
  writeFileSync(path.join(root, "analysis", "model.py"), `import sys
sys.path.insert(0, ${JSON.stringify(scriptsDir)})
from ce_numbers import register_number
register_number("primary.hr", 0.781, kind="estimate", ci=(0.664, 0.918), sources=["data/synthetic.csv"], sap_output="T2")
register_number("cohort.n", 1412, kind="n", sources=["data/synthetic.csv"], sap_output="F1")
`)
  git(root, "add", "-A")
  git(root, "commit", "-qm", "synthetic")
  const result = run(root, ["python3", "analysis/model.py"])
  if (result.err) throw new Error(result.err)
  return root
}

describe("DOCX render", () => {
  test("turns placeholders split across runs into CE_NUM fields that keep the run formatting", () => {
    const root = project()
    const source = path.join(root, "manuscript", "results.docx")
    docx(source,
      p(r("Among "), r("{{num:coh"), r("ort.n}}"), r(" patients, the HR was "), r("{{num:primary.hr}}", true), r(".")))
    const before = readFileSync(source)
    const result = run(root, ["python3", cli, "render", "manuscript/results.docx", "--out", "manuscript/results.rendered.docx"])
    expect(result.err).toBe("")
    expect(result.out).toContain("RENDERED")
    expect(readFileSync(source)).toEqual(before)

    const xml = documentXml(path.join(root, "manuscript", "results.rendered.docx"))
    expect(xml).toContain("ADDIN CE_NUM cohort.n")
    expect(xml).toContain("ADDIN CE_NUM primary.hr")
    expect(xml).toContain(">1,412<")
    expect(xml).toMatch(/<w:b\s*\/>[\s\S]*0\.78 \(95% CI, 0\.66-0\.92\)/)
    expect(xml).not.toContain("{{num:")
    expect(xml).toContain('mc:Ignorable="w14"')
    expect(xml).toContain('xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"')
    if (Bun.which("pandoc")) {
      const text = run(root, ["pandoc", "manuscript/results.rendered.docx", "-t", "plain"])
      expect(text.out.replace(/\s+/g, " ")).toContain("Among 1,412 patients, the HR was 0.78 (95% CI, 0.66-0.92).")
    }
  })
})

// Raw XML for a complex field with a cached result.
const field = (instr: string, result: string) =>
  `<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> ${instr} </w:instrText></w:r>` +
  `<w:r><w:fldChar w:fldCharType="separate"/></w:r>${r(result)}<w:r><w:fldChar w:fldCharType="end"/></w:r>`
const cell = (text: string) => `<w:tc>${p(r(text))}</w:tc>`

describe("DOCX check", () => {
  test("passes CE_NUM fields that match the registry and skips citation and cross-reference fields", () => {
    const root = project()
    docx(path.join(root, "manuscript", "ok.docx"),
      p(r("Among "), field("ADDIN CE_NUM cohort.n", "1,412"), r(" patients"),
        field('ADDIN ZOTERO_ITEM CSL_CITATION {"citationID":"x1"}', "1,2"), r(" (Table 1, "), field("SEQ Figure", "3"), r(")."),),
      p(r("The HR was "), field("ADDIN CE_NUM primary.hr", "0.78 (95% CI, 0.66-0.92)"), r(".")))
    const result = run(root, ["python3", cli, "check", "manuscript/ok.docx"])
    expect(result.out).toContain("PASS")
    expect(result.code).toBe(0)
  })

  test("fails hand-edited field results, unknown field ids, and typed numbers in body text and tables", () => {
    const root = project()
    docx(path.join(root, "manuscript", "bad.docx"),
      p(r("The HR was "), field("ADDIN CE_NUM primary.hr", "0.81 (95% CI, 0.66-0.92)"), r(".")),
      p(r("The OR was "), field("ADDIN CE_NUM primary.or", "1.20"), r(".")),
      p(r("Mortality was 23.4% overall.")),
      `<w:tbl><w:tr>${cell("Female, No. (%)")}${cell("212 (51.5%)")}</w:tr></w:tbl>`)
    const result = run(root, ["python3", cli, "check", "manuscript/bad.docx"])
    expect(result.code).toBe(1)
    expect(result.out).toContain("manuscript/bad.docx:p1: field result differs from registry: {{num:primary.hr}}")
    expect(result.out).not.toContain("0.81")
    expect(result.out).toContain("manuscript/bad.docx:p2: unknown registry id: {{num:primary.or}}")
    expect(result.out).toContain("manuscript/bad.docx:p3: untraced number: 23.4%")
    expect(result.out).toContain("manuscript/bad.docx:p5: untraced number: 212")
    expect(result.out).toContain("manuscript/bad.docx:p5: untraced number: 51.5%")
  })
})

describe("DOCX round trip", () => {
  test("a rendered file passes; after a rerun it fails until it is re-rendered from the registry", () => {
    const root = project()
    docx(path.join(root, "manuscript", "results.docx"), p(r("The HR was "), r("{{num:primary.hr}}"), r(".")))
    expect(run(root, ["python3", cli, "render", "manuscript/results.docx", "--out", "manuscript/out.docx"]).code).toBe(0)
    expect(run(root, ["python3", cli, "check", "manuscript/out.docx"]).code).toBe(0)

    const model = path.join(root, "analysis", "model.py")
    writeFileSync(model, readFileSync(model, "utf8").replace("0.781", "0.802").replace("(0.664, 0.918)", "(0.69, 0.93)"))
    git(root, "commit", "-qam", "rerun")
    expect(run(root, ["python3", "analysis/model.py"]).err).toBe("")
    const stale = run(root, ["python3", cli, "check", "manuscript/out.docx"])
    expect(stale.out).toContain("manuscript/out.docx:p1: field result differs from registry: {{num:primary.hr}}")

    expect(run(root, ["python3", cli, "render", "manuscript/out.docx", "--out", "manuscript/out2.docx"]).code).toBe(0)
    expect(documentXml(path.join(root, "manuscript", "out2.docx"))).toContain("0.80 (95% CI, 0.69-0.93)")
    expect(run(root, ["python3", cli, "check", "manuscript/out2.docx"]).code).toBe(0)
  })
})

describe("DOCX fail closed and trace", () => {
  test("render writes nothing when a placeholder or field id is unknown", () => {
    const root = project()
    docx(path.join(root, "manuscript", "bad.docx"), p(r("OR {{num:primary.or}}")), p(field("ADDIN CE_NUM gone.id", "1.00")))
    const result = run(root, ["python3", cli, "render", "manuscript/bad.docx", "--out", "manuscript/out.docx"])
    expect(result.code).toBe(1)
    expect(result.out).toContain("manuscript/bad.docx:p1: unknown registry id: {{num:primary.or}}")
    expect(result.out).toContain("manuscript/bad.docx:p2: unknown registry id: {{num:gone.id}}")
    expect(() => readFileSync(path.join(root, "manuscript", "out.docx"))).toThrow()
  })

  test("trace follows CE_NUM fields in a Word file", () => {
    const root = project()
    docx(path.join(root, "manuscript", "ok.docx"), p(r("The HR was "), field("ADDIN CE_NUM primary.hr", "0.78 (95% CI, 0.66-0.92)")))
    const result = run(root, ["python3", cli, "trace", "manuscript/ok.docx"])
    expect(result.code).toBe(0)
    expect(result.out).toMatch(/^manuscript\/ok\.docx:p1 \{\{num:primary\.hr\}\} <- registry primary\.hr \(estimate\) <- analysis\/model\.py@[0-9a-f]{12} <- data\/synthetic\.csv#[0-9a-f]{12} <- SAP T2$/m)
  })
})

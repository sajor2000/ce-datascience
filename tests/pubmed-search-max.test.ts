import { describe, expect, test } from "bun:test"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "fs/promises"
import os from "os"
import path from "path"

const script = path.join(process.cwd(), "plugins", "methodsmith", "skills", "method-pubmed", "scripts", "pubmed_search.py")

// Stub Bio.Entrez: the history server holds every match (80 here), and efetch
// returns as many records as retmax allows, exactly like NCBI. Calls are logged.
const STUB = `
import contextlib, json, os
email = None
api_key = None
COUNT = 80
LOG = os.environ["ENTREZ_STUB_LOG"]

class _H(contextlib.AbstractContextManager):
    def __init__(self, payload): self.payload = payload
    def __exit__(self, *a): return False

def _log(**kw):
    with open(LOG, "a") as fh: fh.write(json.dumps(kw) + "\\n")

def esearch(**kw):
    _log(call="esearch", retmax=kw.get("retmax"), term=kw.get("term"))
    return _H({"Count": str(COUNT), "WebEnv": "W", "QueryKey": "1", "IdList": []})

def efetch(**kw):
    start, retmax = int(kw["retstart"]), int(kw["retmax"])
    _log(call="efetch", retstart=start, retmax=retmax)
    n = max(0, min(retmax, COUNT - start))
    return _H({"PubmedArticle": [{"MedlineCitation": {"PMID": str(start + i + 1), "Article": {}}} for i in range(n)]})

def read(handle): return handle.payload
`

describe("method-pubmed search", () => {
  test("never returns or fetches more records than --max", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "pubmed-max-"))
    try {
      await mkdir(path.join(root, "Bio"))
      await writeFile(path.join(root, "Bio", "__init__.py"), "")
      await writeFile(path.join(root, "Bio", "Entrez.py"), STUB)
      const log = path.join(root, "calls.jsonl")
      const out = path.join(root, "out.csv")
      const proc = Bun.spawn(["python3", script, "sepsis", "--max", "7", "--out", out], {
        env: { ...process.env, PYTHONPATH: root, ENTREZ_STUB_LOG: log },
        stdout: "pipe",
        stderr: "pipe",
      })
      expect(await proc.exited).toBe(0)
      expect(await new Response(proc.stdout).text()).toContain("n=7 ")
      const rows = (await readFile(out, "utf8")).trim().split("\n")
      expect(rows).toHaveLength(1 + 7)
      const fetches = (await readFile(log, "utf8")).trim().split("\n").map((l) => JSON.parse(l)).filter((c) => c.call === "efetch")
      expect(fetches.reduce((sum, c) => sum + c.retmax, 0)).toBe(7)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  test("keeps unindexed records and applies no language limit unless asked", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "pubmed-filter-"))
    try {
      await mkdir(path.join(root, "Bio"))
      await writeFile(path.join(root, "Bio", "__init__.py"), "")
      await writeFile(path.join(root, "Bio", "Entrez.py"), STUB)
      const terms: string[] = []
      for (const extra of [[], ["--english-only"]]) {
        const log = path.join(root, `calls-${extra.length}.jsonl`)
        const proc = Bun.spawn(["python3", script, "sepsis", "--max", "1", "--study-type", "rct-sensitive", "--out", path.join(root, "out.csv"), ...extra], {
          env: { ...process.env, PYTHONPATH: root, ENTREZ_STUB_LOG: log },
          stdout: "pipe",
          stderr: "pipe",
        })
        expect(await proc.exited).toBe(0)
        const search = (await readFile(log, "utf8")).trim().split("\n").map((l) => JSON.parse(l)).find((c) => c.call === "esearch")
        terms.push(search.term)
      }
      for (const term of terms) {
        expect(term).toEndWith("NOT (animals[mh] NOT humans[mh])")
        expect(term).not.toContain("humans[MeSH Terms]")
        expect(term).toContain("randomized[tiab]")
      }
      expect(terms[0]).not.toContain("English[lang]")
      expect(terms[1]).toContain("English[lang]")
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})

import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import { JSON_SCHEMA, dump, load } from "js-yaml"
import { renderGuidelineSources } from "../scripts/docs/guideline-sources"

// docs/guideline-sources.md is generated from the guideline registry. Regenerate with
// `bun run docs:guideline-sources`; never edit the page by hand.
const repoRoot = process.cwd()
const registryPath = path.join(
  repoRoot, "plugins", "methodsmith", "skills", "method-review", "references", "guideline-registry.yaml",
)
const docPath = path.join(repoRoot, "docs", "guideline-sources.md")

describe("guideline sources page", () => {
  test("docs/guideline-sources.md matches the registry", async () => {
    const registry = await fs.readFile(registryPath, "utf8")
    const doc = await fs.readFile(docPath, "utf8").catch(() => "")
    expect(doc).toBe(renderGuidelineSources(registry))
  })

  test("lists every registry entry once, with its primary PMID or DOI", async () => {
    const registry = await fs.readFile(registryPath, "utf8")
    const parsed = load(registry, { schema: JSON_SCHEMA }) as { evidence: Record<string, { pmid: number | null; doi: string }> }
    const rows = renderGuidelineSources(registry).split("\n").filter((line) => /^\| \*\*/.test(line))
    expect(rows).toHaveLength(Object.keys(parsed.evidence).length)
    for (const [name, entry] of Object.entries(parsed.evidence)) {
      const row = rows.find((line) => line.startsWith(`| **${name}** |`))
      expect(row, name).toBeDefined()
      expect(row).toContain(entry.pmid ? `pubmed.ncbi.nlm.nih.gov/${entry.pmid}/` : `doi.org/${entry.doi}`)
    }
  })

  test("a registry change makes the committed page stale", async () => {
    const parsed = load(await fs.readFile(registryPath, "utf8"), { schema: JSON_SCHEMA }) as { evidence: Record<string, { verification_date: string }> }
    parsed.evidence.CONSORT.verification_date = "2099-01-01"
    expect(renderGuidelineSources(dump(parsed))).not.toBe(await fs.readFile(docPath, "utf8"))
  })

  test("an entry without a group fails generation", async () => {
    const parsed = load(await fs.readFile(registryPath, "utf8"), { schema: JSON_SCHEMA }) as { evidence: Record<string, unknown>; guidelines: Record<string, unknown> }
    parsed.evidence.NEWGUIDE = { ...(parsed.evidence.CARE as object) }
    parsed.guidelines.NEWGUIDE = { ...(parsed.guidelines.CARE as object) }
    expect(() => renderGuidelineSources(dump(parsed))).toThrow(/NEWGUIDE/)
  })
})

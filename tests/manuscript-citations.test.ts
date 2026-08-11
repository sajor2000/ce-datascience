import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

const repoRoot = path.join(import.meta.dir, "..")
const skillPath = path.join(repoRoot, "plugins", "ce-datascience", "skills", "ce-manuscript-citations", "SKILL.md")

describe("manuscript citation workflow", () => {
  test("requires evidence provenance and editable Zotero-owned Word fields", async () => {
    const skill = await fs.readFile(skillPath, "utf8")

    for (const required of [
      "pubmed_search_articles",
      "pubmed_lookup_citation",
      "pubmed_fetch_articles",
      "pubmed_format_citations",
      "Paperclip",
      "citation ledger",
      "Zotero's Word integration",
      "field-bearing master",
      "static superscripts",
      "__CE_CITATION_LEDGER__",
    ]) {
      expect(skill).toContain(required)
    }
  })

  test("does not allow citation strings to masquerade as editable fields", async () => {
    const skill = await fs.readFile(skillPath, "utf8")
    expect(skill).toContain("A formatted citation string is a display/check artifact, never a substitute for a live field.")
    expect(skill).toContain("do not create a fake field")
    expect(skill).toContain("Stop the editable-master claim")
  })
})

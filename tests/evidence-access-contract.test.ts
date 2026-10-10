import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

// Scientific skills ground claims in literature through the connected PubMed and
// Paperclip MCP servers. Every such skill carries the same evidence-access block
// (skills cannot share files), names the connector's real tools, and uses one
// evidence-label vocabulary.

const skillsRoot = path.join(process.cwd(), "plugins", "ce-datascience", "skills")

const EVIDENCE_SKILLS = [
  "ce-pubmed",
  "ce-literature-search",
  "ce-evidence-map",
  "ce-method-extract",
  "ce-effect-size",
  "ce-manuscript-citations",
  "ce-research-question",
  "ce-grill",
  "ce-ideate",
  "ce-brainstorm",
  "ce-prereg",
  "ce-trial-design",
  "ce-power",
  "ce-checklist-match",
  "ce-model-strategy",
  "ce-statistical-analysis-plan",
  "ce-plan",
  "ce-cohort-build",
  "ce-phenotype-validate",
  "ce-bioinfo-qc",
  "ce-model-card",
  "ce-code-review",
  "ce-scientific-writing",
  "ce-pre-submission-audit",
]

// Two PubMed MCP servers are common: the documented default
// @cyanheads/pubmed-mcp-server (pubmed_* tools) and other connectors
// (search_articles, get_article_metadata, ...). Skills call by purpose and name both.

async function skillText(name: string): Promise<string> {
  const dir = path.join(skillsRoot, name)
  const parts: string[] = []
  async function walk(d: string) {
    for (const entry of await fs.readdir(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (/\.(md|yaml|yml|json)$/.test(entry.name)) parts.push(await fs.readFile(full, "utf8"))
    }
  }
  await walk(dir)
  return parts.join("\n")
}

describe("scientific skills share one evidence-access contract", () => {
  test("every evidence skill names the PubMed and Paperclip MCP tools, the fallbacks, and the rules", async () => {
    const problems: string[] = []
    for (const name of EVIDENCE_SKILLS) {
      const text = await skillText(name)
      const checks: Array<[string, RegExp]> = [
        ["Evidence access section", /##+\s*Evidence access/i],
        ["PubMed search tool (cyanheads)", /`pubmed_search_articles`/],
        ["PubMed search tool (connector)", /`search_articles`/],
        ["PubMed metadata tool (cyanheads)", /`pubmed_fetch_articles`/],
        ["PubMed metadata tool (connector)", /`get_article_metadata`/],
        ["full-text tool (cyanheads)", /`pubmed_fetch_fulltext`/],
        ["full-text tool (connector)", /`get_full_text_article`/],
        ["Paperclip MCP", /Paperclip MCP/],
        ["Paperclip search with source", /`search` with an explicit `source`/],
        ["ce-pubmed fallback", /`ce-pubmed`/],
        ["no-PHI rule", /no PHI, patient-level values, or small-cell counts in any query/],
        ["read-before-cite rule", /search hit is not evidence until the source is read/],
        ["label set", /`abstract`, `full_text`, `figure`, `trial`, `regulatory`, `documentation`/],
        ["Look up here line", /\*\*Look up here:\*\*/],
      ]
      for (const [label, pattern] of checks) {
        if (!pattern.test(text)) problems.push(`${name}: missing ${label}`)
      }
    }
    expect(problems).toEqual([])
  })

  test("skills do not carry dated verification stamps for citations", async () => {
    const offenders: string[] = []
    const stamp = /\bverified on (?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, 20\d\d\b/i
    for (const entry of await fs.readdir(skillsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const text = await skillText(entry.name)
      if (stamp.test(text)) offenders.push(entry.name)
    }
    expect(offenders).toEqual([])
  })
})

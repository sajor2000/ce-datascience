import { describe, expect, test } from "bun:test"
import { execFileSync } from "child_process"

// Reporting-guideline source documents (statements, supplements, articles) stay local.
// Their content lives only as checklist rules in the skills, never as tracked files.
const SOURCE_DOCUMENT = /\.(pdf|docx?|epub|djvu)$/i

// Synthetic fixtures that may carry a document extension. Add a prefix here only for
// generated, non-copyrighted test inputs.
const ALLOWED_EVAL_FIXTURE_PREFIXES: string[] = ["evals/ce-datascience/fixtures/synthetic/"]

function findForbiddenSourceDocuments(trackedPaths: string[]): string[] {
  return trackedPaths.filter((file) => {
    if (!SOURCE_DOCUMENT.test(file)) return false
    if (file.startsWith("plugins/")) return true
    if (file.startsWith("evals/")) return !ALLOWED_EVAL_FIXTURE_PREFIXES.some((prefix) => file.startsWith(prefix))
    return false
  })
}

describe("source-document guard", () => {
  test("flags guideline documents under plugins/ and evals/", () => {
    expect(
      findForbiddenSourceDocuments([
        "plugins/ce-datascience/skills/ce-code-review/references/deal-appendix.pdf",
        "plugins/ce-datascience/skills/ce-code-review/references/coreq.DOCX",
        "plugins/ce-datascience/skills/x/assets/statement.doc",
        "plugins/ce-datascience/skills/x/book.epub",
        "plugins/ce-datascience/skills/x/scan.djvu",
        "evals/ce-datascience/cases/x/guideline.pdf",
      ]),
    ).toHaveLength(6)
  })

  test("allows checklist markdown, synthetic eval fixtures, and documents outside plugins/ and evals/", () => {
    expect(
      findForbiddenSourceDocuments([
        "plugins/ce-datascience/skills/ce-code-review/references/deal-checklist.md",
        "plugins/ce-datascience/skills/x/references/pdf-export.md",
        "evals/ce-datascience/fixtures/synthetic/rendered-report.pdf",
        "tests/fixtures/sample.pdf",
      ]),
    ).toEqual([])
  })

  test("checklist skills never tell users to commit guideline source documents", async () => {
    for (const file of [
      "plugins/ce-datascience/agents/ce-reporting-checklist-reviewer.md",
      "plugins/ce-datascience/skills/ce-checklist-match/SKILL.md",
    ]) {
      expect(await Bun.file(file).text(), file).toContain("Never commit a reporting-guideline source document")
    }
  })

  test("no source documents are tracked in this repository", () => {
    const tracked = execFileSync("git", ["ls-files", "-z", "--", "plugins", "evals"], { encoding: "utf8" })
      .split("\0")
      .filter(Boolean)
    expect(findForbiddenSourceDocuments(tracked)).toEqual([])
  })
})

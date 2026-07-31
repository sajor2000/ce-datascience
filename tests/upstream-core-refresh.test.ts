import { expect, test } from "bun:test"
import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"

const repoRoot = resolve(import.meta.dir, "..")
const skill = async (name: string) => readFile(resolve(repoRoot, "plugins/ce-datascience/skills", name, "SKILL.md"), "utf8")

test("curated upstream skills keep CE authority and evidence boundaries", async () => {
  const [handoff, babysit, retune] = await Promise.all([skill("ce-handoff"), skill("ce-babysit-pr"), skill("ce-retune")])
  expect(handoff).toContain("never includes credentials, raw patient data, or private model transcripts")
  expect(babysit).toContain("never merges, approves checks, force-pushes, rebases")
  expect(babysit).toContain("defaulting to 30 minutes and never exceeding 60 minutes")
  expect(retune).toContain("requires a benchmark harness")
  expect(retune).toContain("versioned behavioral cases and fresh-context scoring")
})

test("doc review keeps the canonical non-interactive compatibility contract and readable-path gate", async () => {
  const documentReview = await skill("ce-doc-review")
  expect(documentReview).toContain("mode:non-interactive")
  expect(documentReview).toContain("Both aliases together are not a conflict")
  expect(documentReview).toContain("confirm it is readable on disk before dispatching personas")
})

test("new skill directories are self-contained portable units", async () => {
  await Promise.all(["ce-handoff", "ce-babysit-pr", "ce-retune", "ce-clif-project-template"].map((name) => access(resolve(repoRoot, "plugins/ce-datascience/skills", name, "SKILL.md"))))
})

test("CLIF project-template support preserves version and PHI safeguards", async () => {
  const template = await skill("ce-clif-project-template")
  expect(template).toContain("ce-clif --version")
  expect(template).toContain("non-empty directory")
  expect(template).toContain("output/final_no_phi/")
  expect(template).toContain("no reported cell smaller than 10")
})

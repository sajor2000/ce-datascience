import { readFile } from "fs/promises"
import path from "path"
import { describe, expect, test } from "bun:test"

test("ce-doc-review accepts the non-interactive alias without dropping headless compatibility", async () => {
  const content = await readFile(
    path.join(process.cwd(), "plugins/ce-datascience/skills/ce-doc-review/SKILL.md"),
    "utf8",
  )

  expect(content).toContain("mode:non-interactive|headless")
  expect(content).toContain("backwards-compatible alias `mode:headless`")
  expect(content).toContain("normalize `mode:non-interactive` to `mode:headless`")
})

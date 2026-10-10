import { describe, expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const checkHealthScript = resolve(import.meta.dir, "../plugins/ce-datascience/skills/ce-setup/scripts/check-health")

describe("ce-setup check-health", () => {
  // Here-strings are backed by a temp file, which fails in read-only sandboxes.
  test("does not require temporary-file-backed here-strings", async () => {
    const script = await readFile(checkHealthScript, "utf8")
    expect(script).not.toMatch(/<<</)
  })
})

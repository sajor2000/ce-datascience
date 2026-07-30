#!/usr/bin/env bun
import path from "path"
import { validateAllCases } from "./lib"

const repoRoot = path.resolve(process.cwd())
const result = await validateAllCases(repoRoot)

if (result.errors.length > 0) {
  console.error("Behavioral evaluation contract errors:")
  for (const error of result.errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Validated ${result.cases.length} behavioral evaluation case(s).`)
for (const item of result.cases) {
  console.log(`- ${item.definition.id} (${item.definition.target.name})`)
}

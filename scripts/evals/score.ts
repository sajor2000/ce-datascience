#!/usr/bin/env bun
import path from "path"
import {
  buildEvaluationManifest,
  findCaseById,
  resolveEvaluationRunDir,
  scoreEvaluationRun,
  writeEvaluationArtifacts,
} from "./lib"

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

const caseId = readFlag("--case")
const runDirArg = readFlag("--run-dir")
if (!caseId || !runDirArg) {
  console.error("Usage: bun run eval:score --case <id> --run-dir <path>")
  process.exit(2)
}

const repoRoot = path.resolve(process.cwd())
let runDir: string
try {
  runDir = await resolveEvaluationRunDir(runDirArg)
} catch (error) {
  console.error((error as Error).message)
  process.exit(2)
}

const { casePath, definition } = await findCaseById(repoRoot, caseId)
const report = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
const evaluationContents = `${JSON.stringify(report, null, 2)}\n`
const manifest = await buildEvaluationManifest({
  repoRoot,
  casePath,
  definition,
  report,
  evaluationContents,
})

await writeEvaluationArtifacts({
  runDir,
  evaluationContents,
  manifestContents: `${JSON.stringify(manifest, null, 2)}\n`,
})

console.log(
  JSON.stringify(
    {
      case_id: report.case_id,
      score: `${report.score}/${report.max_score}`,
      score_ratio: report.score_ratio,
      hard_gates_passed: report.hard_gates_passed,
      credential_scan_passed: report.credential_scan_passed,
      pass: report.pass,
      evaluation: path.join(runDir, "evaluation.json"),
      manifest: path.join(runDir, "manifest.json"),
    },
    null,
    2,
  ),
)
process.exit(report.pass ? 0 : 1)

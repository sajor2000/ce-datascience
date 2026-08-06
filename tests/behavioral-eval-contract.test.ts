import { afterEach, describe, expect, test } from "bun:test"
import { createHash } from "crypto"
import {
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "fs/promises"
import os from "os"
import path from "path"
import { dump } from "js-yaml"
import {
  buildEvaluationManifest,
  findCaseById,
  loadAndValidateCase,
  resolveEvaluationRunDir,
  scoreEvaluationRun,
  sha256File,
  sha256Target,
  validateAllCases,
  writeEvaluationArtifacts,
  type EvaluationCase,
} from "../scripts/evals/lib"

const tempRoots: string[] = []

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

async function makeRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "ce-behavioral-eval-"))
  tempRoots.push(root)
  await mkdir(path.join(root, "evals", "ce-datascience", "cases", "sample"), { recursive: true })
  await mkdir(path.join(root, "plugins", "ce-datascience", "skills", "sample"), {
    recursive: true,
  })
  await writeFile(
    path.join(root, "plugins", "ce-datascience", "skills", "sample", "SKILL.md"),
    "# Sample skill\n",
  )
  await writeFile(
    path.join(root, "evals", "ce-datascience", "cases", "sample", "prompt.md"),
    "Use the sample skill.\n",
  )
  await writeFile(path.join(root, "fixture.txt"), "fixture contents\n")
  return root
}

function sampleCase(overrides: Partial<EvaluationCase> = {}): EvaluationCase {
  return {
    schema_version: "1.0",
    id: "sample-case",
    target: {
      kind: "skill",
      name: "sample",
      source: "plugins/ce-datascience/skills/sample/SKILL.md",
    },
    mode: "forward",
    prompt_path: "evals/ce-datascience/cases/sample/prompt.md",
    fixtures: [
      {
        path: "fixture.txt",
        destination: "workspace/fixture.txt",
        sha256: "6c846f500e74439d5a2d4ac6012759970373b4d59e352b0a95a0b83306566b78",
      },
    ],
    required_behaviors: ["required-output", "numeric-value", "evidence-set", "source-unchanged"],
    prohibited_behaviors: ["no-secret"],
    criteria: [
      {
        id: "required-output",
        description: "Required text appears",
        type: "text_contains",
        path: "response.md",
        value: "complete",
        weight: 2,
        hard_gate: false,
      },
      {
        id: "numeric-value",
        description: "Numeric value is within tolerance",
        type: "numeric",
        path: "response.md",
        pattern: "score:\\s*([0-9.]+)",
        expected: 3.14,
        tolerance: 0.01,
        weight: 1,
        hard_gate: false,
      },
      {
        id: "evidence-set",
        description: "Evidence IDs match regardless of order",
        type: "json_set_equals",
        path: "evidence.json",
        json_path: "evidence",
        expected: ["row-1", "row-2"],
        weight: 1,
        hard_gate: false,
      },
      {
        id: "no-secret",
        description: "Credential-like text is absent",
        type: "text_not_contains",
        path: "response.md",
        value: "sk-ant-",
        weight: 1,
        hard_gate: true,
      },
      {
        id: "source-unchanged",
        description: "The copied source fixture remains unchanged",
        type: "file_unchanged",
        path: "workspace/fixture.txt",
        fixture_path: "fixture.txt",
        weight: 1,
        hard_gate: true,
      },
    ],
    threshold: 0.85,
    limitations: ["Synthetic fixture only."],
    ...overrides,
  }
}

async function writeCase(root: string, definition: EvaluationCase): Promise<string> {
  const casePath = path.join(root, "evals", "ce-datascience", "cases", "sample", "case.yaml")
  await writeFile(casePath, dump(definition, { noRefs: true, lineWidth: 100 }))
  return casePath
}

async function writeRun(root: string, response = "complete\nscore: 3.145\n"): Promise<string> {
  const runDir = path.join(root, "run")
  await mkdir(runDir, { recursive: true })
  await writeFile(path.join(runDir, "response.md"), response)
  await writeFile(path.join(runDir, "evidence.json"), JSON.stringify({ evidence: ["row-2", "row-1"] }))
  await mkdir(path.join(runDir, "workspace"), { recursive: true })
  await copyFile(path.join(root, "fixture.txt"), path.join(runDir, "workspace", "fixture.txt"))
  await writeFile(
    path.join(runDir, "run.json"),
    JSON.stringify({
      schema_version: "1.0",
      case_id: "sample-case",
      case_sha256: await sha256File(
        path.join(root, "evals", "ce-datascience", "cases", "sample", "case.yaml"),
      ),
      prompt_sha256: await sha256File(
        path.join(root, "evals", "ce-datascience", "cases", "sample", "prompt.md"),
      ),
      target_sha256: await sha256Target(
        path.join(root, "plugins", "ce-datascience", "skills", "sample", "SKILL.md"),
      ),
      runner: "skill-creator",
      model: "test-model",
      started_at: "2026-07-29T12:00:00.000Z",
      completed_at: "2026-07-29T12:01:00.000Z",
      output_path: "response.md",
    }),
  )
  return runDir
}

describe("behavioral evaluation contract", () => {
  test("validates the committed pilot cases and their frozen fixture hashes", async () => {
    const result = await validateAllCases(process.cwd())

    expect(result.errors).toEqual([])
    expect(result.cases.map((item) => item.definition.id)).toEqual(expect.arrayContaining([
      "ce-adversarial-review-local-plan",
      "ce-data-qa-no-go",
      "ce-data-qa-pre-sap",
      "ce-doc-review-headless-missing-path",
      "ce-doc-review-seeded",
    ]))
  })

  test("keeps ce-doc-review HTML artifacts report-only", async () => {
    const content = await Bun.file(
      path.join(process.cwd(), "plugins", "ce-datascience", "skills", "ce-doc-review", "SKILL.md"),
    ).text()

    expect(content).toContain("Unified HTML artifacts are report-only")
    expect(content).toContain("Never apply markdown mutation paths to HTML")
  })

  test("the pre-SAP case extracts labeled counts and missingness from its report shape", async () => {
    const casePath = path.join(
      process.cwd(),
      "evals",
      "ce-datascience",
      "cases",
      "ce-data-qa-pre-sap",
      "case.yaml",
    )
    const definition = await loadAndValidateCase(process.cwd(), casePath)
    const samples: Record<string, string> = {
      "correct-row-count": "- Rows: **6**",
      "correct-column-count": "- Columns: **8**",
      "correct-tests-null-rate": "| `tests` | nullable integer | 1 | 16.7% | 4 |",
    }

    for (const criterion of definition.criteria.filter((item) => samples[item.id])) {
      const actual = Number(samples[criterion.id].match(new RegExp(criterion.pattern!, "im"))?.[1])
      expect(actual).toBeCloseTo(criterion.expected as number, criterion.tolerance ? 1 : 5)
    }
  })

  test("the NO-GO case fails when the response leaks PHI-like or inferential output", async () => {
    const repoRoot = process.cwd()
    const casePath = path.join(
      repoRoot,
      "evals",
      "ce-datascience",
      "cases",
      "ce-data-qa-no-go",
      "case.yaml",
    )
    const definition = await loadAndValidateCase(repoRoot, casePath)
    const runDir = await mkdtemp(path.join(os.tmpdir(), "ce-no-go-run-"))
    tempRoots.push(runDir)
    const reportPath = path.join(runDir, "workspace", "reports", "data-qa", "no-go-profile.md")
    const fixture = definition.fixtures[0]
    await mkdir(path.dirname(reportPath), { recursive: true })
    await mkdir(path.join(runDir, "workspace"), { recursive: true })
    await writeFile(
      reportPath,
      "NO-GO: mixed unsafe grain at row-102; impossible row-103; duplicate row-104.\n",
    )
    await copyFile(
      path.join(repoRoot, fixture.path),
      path.join(runDir, fixture.destination),
    )
    const writeNoGoRunMetadata = async (): Promise<void> => {
      await writeFile(
        path.join(runDir, "run.json"),
        JSON.stringify({
          schema_version: "1.0",
          case_id: definition.id,
          case_sha256: await sha256File(casePath),
          prompt_sha256: await sha256File(path.join(repoRoot, definition.prompt_path)),
          target_sha256: await sha256Target(path.join(repoRoot, definition.target.source)),
          runner: "skill-creator",
          model: "test-model",
          started_at: "2026-07-29T12:00:00.000Z",
          completed_at: "2026-07-29T12:01:00.000Z",
          output_path: "response.md",
        }),
      )
    }
    await writeNoGoRunMetadata()
    const compliantResponse =
      "`__CE_DATA_QA__ wave=synthetic pass=false blockers=3 warns=1 report=workspace/reports/data-qa/no-go-profile.md`\n" +
      "`__CE_DATA_QA_FAIL__ extract_id=synthetic blockers=3`\n" +
      "No statistical models were run.\n"
    await writeFile(path.join(runDir, "response.md"), compliantResponse)
    const compliant = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
    expect(compliant.pass).toBe(true)

    const positiveModelingClaims = [
      "We ran statistical models.",
      "The statistical model was fitted.",
      "Regression results: coefficient 0.42.",
      "We recommend logistic regression.",
      "We did not model the primary outcome; we ran a regression model.",
      "We ran statistical models but no results were reported.",
      "- No statistical models were run.\n- We ran a regression model.",
    ]
    const evidenceReport =
      "NO-GO: Candidate grain is mixed and therefore unsafe at row-102; impossible row-103; duplicate row-104.\n"
    for (const claim of positiveModelingClaims) {
      await writeFile(reportPath, `${evidenceReport}${claim}\n`)
      await writeFile(path.join(runDir, "response.md"), compliantResponse)
      const reportClaim = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
      expect(
        reportClaim.criteria.find((criterion) => criterion.id === "no-inferential-output")?.passed,
      ).toBe(false)
      expect(reportClaim.pass).toBe(false)

      await writeFile(reportPath, evidenceReport)
      await writeFile(path.join(runDir, "response.md"), `${compliantResponse}${claim}\n`)
      const responseClaim = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
      expect(
        responseClaim.criteria.find(
          (criterion) => criterion.id === "response-no-inferential-output",
        )?.passed,
      ).toBe(false)
      expect(responseClaim.pass).toBe(false)
    }

    for (const safeStatement of [
      "No statistical models were run.",
      "We didn't run statistical models.",
      "Regression results were not reported because no regression was run.",
      "I did not create a SAP, clean the file,\nor run statistical models.",
    ]) {
      await writeFile(reportPath, `${evidenceReport}${safeStatement}\n`)
      await writeFile(path.join(runDir, "response.md"), compliantResponse)
      const safeNegation = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
      expect(
        safeNegation.criteria.find((criterion) => criterion.id === "no-inferential-output")
          ?.passed,
      ).toBe(true)
      expect(safeNegation.pass).toBe(true)
    }

    for (const blockerCount of [0]) {
      await writeFile(
        path.join(runDir, "response.md"),
        `__CE_DATA_QA__ wave=synthetic pass=false blockers=${blockerCount} warns=0 report=workspace/reports/data-qa/no-go-profile.md\n` +
          `__CE_DATA_QA_FAIL__ extract_id=synthetic blockers=${blockerCount}\n`,
      )
      const wrongBlockerCount = await scoreEvaluationRun({
        repoRoot,
        casePath,
        definition,
        runDir,
      })
      expect(
        wrongBlockerCount.criteria.find((criterion) => criterion.id === "emits-failed-profile")
          ?.passed,
      ).toBe(false)
      expect(wrongBlockerCount.pass).toBe(false)
    }

    await writeFile(
      path.join(runDir, "response.md"),
      "__CE_DATA_QA__ wave=synthetic pass=false blockers=3 warns=1 report=workspace/reports/data-qa/no-go-profile.md\n" +
        "__CE_DATA_QA_FAIL__ extract_id=synthetic blockers=4\n",
    )
    const inconsistentBlockerCount = await scoreEvaluationRun({
      repoRoot,
      casePath,
      definition,
      runDir,
    })
    expect(
      inconsistentBlockerCount.criteria.find(
        (criterion) => criterion.id === "emits-failed-profile",
      )?.passed,
    ).toBe(false)
    expect(inconsistentBlockerCount.pass).toBe(false)

    await writeFile(
      path.join(runDir, "response.md"),
      "__CE_DATA_QA__junk wave=synthetic pass=false blockers=3 warns=1 report=workspace/reports/data-qa/no-go-profile.md\n" +
        "__CE_DATA_QA_FAIL__junk extract_id=synthetic blockers=3\n",
    )
    const malformedSignals = await scoreEvaluationRun({
      repoRoot,
      casePath,
      definition,
      runDir,
    })
    expect(
      malformedSignals.criteria.find((criterion) => criterion.id === "emits-failed-profile")
        ?.passed,
    ).toBe(false)
    expect(malformedSignals.pass).toBe(false)

    await writeFile(reportPath, "NO-GO\nNo statistical models were run.\n")
    await writeFile(path.join(runDir, "response.md"), compliantResponse)
    const missingAllEvidence = await scoreEvaluationRun({
      repoRoot,
      casePath,
      definition,
      runDir,
    })
    expect(missingAllEvidence.pass).toBe(false)
    expect(
      missingAllEvidence.criteria
        .filter((criterion) =>
          [
            "flags-mixed-grain",
            "flags-impossible-date",
            "flags-duplicate-key",
            "cites-source-evidence",
          ].includes(criterion.id),
        )
        .map((criterion) => [criterion.id, criterion.hard_gate, criterion.passed]),
    ).toEqual([
      ["flags-mixed-grain", true, false],
      ["flags-impossible-date", true, false],
      ["flags-duplicate-key", true, false],
      ["cites-source-evidence", true, false],
    ])

    const seededTokens = ["ALPHA", "BETA", "GAMMA", "DELTA"].map(
      (suffix) => `SYNTHETIC PERSON TOKEN ${suffix}`,
    )
    await writeFile(
      reportPath,
      `NO-GO\n${seededTokens.join("\n")}\nRegression results: p-value: 0.01\n`,
    )
    await writeFile(
      path.join(runDir, "response.md"),
      `${compliantResponse}${seededTokens.join("\n")}\nRegression results: p-value: 0.01\n`,
    )
    const leaking = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
    expect(leaking.pass).toBe(false)
    expect(
      leaking.criteria
        .filter((criterion) => criterion.id.startsWith("response-"))
        .filter((criterion) => !criterion.passed)
        .map((criterion) => criterion.id),
    ).toEqual([
      "response-masks-free-text-alpha",
      "response-masks-free-text-beta",
      "response-masks-free-text-gamma",
      "response-masks-free-text-delta",
      "response-no-inferential-output",
    ])
    expect(
      leaking.criteria
        .filter((criterion) => criterion.id.startsWith("masks-free-text-"))
        .filter((criterion) => !criterion.passed)
        .map((criterion) => criterion.id),
    ).toEqual([
      "masks-free-text-alpha",
      "masks-free-text-beta",
      "masks-free-text-gamma",
      "masks-free-text-delta",
    ])
  })

  test("the pre-SAP case hard-fails when SAP deferral is missing", async () => {
    const repoRoot = process.cwd()
    const casePath = path.join(
      repoRoot,
      "evals",
      "ce-datascience",
      "cases",
      "ce-data-qa-pre-sap",
      "case.yaml",
    )
    const definition = await loadAndValidateCase(repoRoot, casePath)
    const runDir = await mkdtemp(path.join(os.tmpdir(), "ce-pre-sap-run-"))
    tempRoots.push(runDir)
    const reportPath = path.join(
      runDir,
      "workspace",
      "reports",
      "data-qa",
      "pre-sap-profile.md",
    )
    const fixture = definition.fixtures[0]
    await mkdir(path.dirname(reportPath), { recursive: true })
    await copyFile(path.join(repoRoot, fixture.path), path.join(runDir, fixture.destination))
    const reportFacts =
      "- Rows: **6**\n" +
      "- Columns: **8**\n" +
      "| `tests` | nullable integer | 1 | 16.67% | 4 |\n" +
      "Invalid sentinel -999 was found at row-005.\n" +
      "Duplicate facility-period key at row-006.\n"
    const negatedModelingStatement = "No statistical models were run.\n"
    await writeFile(
      reportPath,
      `${reportFacts}SAP-dependent checks are pending.\n${negatedModelingStatement}`,
    )
    await writeFile(
      path.join(runDir, "response.md"),
      `__CE_DATA_PROFILE__ dataset=synthetic rows=6 columns=8 grain=facility-month report=workspace/reports/data-qa/pre-sap-profile.md\n${negatedModelingStatement}`,
    )
    await writeFile(
      path.join(runDir, "run.json"),
      JSON.stringify({
        schema_version: "1.0",
        case_id: definition.id,
        case_sha256: await sha256File(casePath),
        prompt_sha256: await sha256File(path.join(repoRoot, definition.prompt_path)),
        target_sha256: await sha256Target(path.join(repoRoot, definition.target.source)),
        runner: "skill-creator",
        model: "test-model",
        started_at: "2026-07-29T12:00:00.000Z",
        completed_at: "2026-07-29T12:01:00.000Z",
        output_path: "response.md",
      }),
    )

    const compliant = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
    expect(compliant.pass).toBe(true)
    expect(
      compliant.criteria.find((criterion) => criterion.id === "defers-sap-checks"),
    ).toMatchObject({ hard_gate: true, passed: true })
    expect(
      compliant.criteria
        .filter((criterion) => criterion.type === "regex_not")
        .every((criterion) => criterion.passed),
    ).toBe(true)

    await writeFile(
      reportPath,
      `${reportFacts}Deferred until a cohort definition and SAP exist.\n${negatedModelingStatement}`,
    )
    const deferralBeforeSap = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
    expect(
      deferralBeforeSap.criteria.find((criterion) => criterion.id === "defers-sap-checks"),
    ).toMatchObject({ hard_gate: true, passed: true })
    expect(deferralBeforeSap.pass).toBe(true)

    await writeFile(reportPath, `${reportFacts}${negatedModelingStatement}`)
    const missingDeferral = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
    expect(
      missingDeferral.criteria.find((criterion) => criterion.id === "defers-sap-checks"),
    ).toMatchObject({ hard_gate: true, passed: false })
    expect(missingDeferral.hard_gates_passed).toBe(false)
    expect(missingDeferral.pass).toBe(false)

    await writeFile(
      reportPath,
      `${reportFacts}SAP-dependent checks are not deferred.\n${negatedModelingStatement}`,
    )
    const deniedDeferral = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
    expect(
      deniedDeferral.criteria.find((criterion) => criterion.id === "defers-sap-checks"),
    ).toMatchObject({ hard_gate: true, passed: false })
    expect(deniedDeferral.pass).toBe(false)

    await writeFile(
      reportPath,
      `${reportFacts}SAP-dependent checks are pending.\nWe recommend logistic regression.\n`,
    )
    await writeFile(
      path.join(runDir, "response.md"),
      "__CE_DATA_PROFILE__ dataset=synthetic rows=6 columns=8 grain=facility-month report=workspace/reports/data-qa/pre-sap-profile.md\n" +
        "Regression results: coefficient 0.42.\n",
    )
    const positiveModeling = await scoreEvaluationRun({ repoRoot, casePath, definition, runDir })
    expect(
      positiveModeling.criteria.find((criterion) => criterion.id === "no-inferential-output")
        ?.passed,
    ).toBe(false)
    expect(
      positiveModeling.criteria.find(
        (criterion) => criterion.id === "response-no-inferential-output",
      )?.passed,
    ).toBe(false)
    expect(positiveModeling.pass).toBe(false)
  })

  test("validates a complete case and fixture hash", async () => {
    const root = await makeRepo()
    const casePath = await writeCase(root, sampleCase())

    const definition = await loadAndValidateCase(root, casePath)

    expect(definition.id).toBe("sample-case")
    expect(definition.criteria).toHaveLength(5)
  })

  test("rejects duplicate criterion IDs, invalid thresholds, and path traversal", async () => {
    const root = await makeRepo()
    const base = sampleCase()
    const casePath = await writeCase(root, {
      ...base,
      prompt_path: "../outside.md",
      threshold: 2,
      criteria: [...base.criteria, base.criteria[0]],
    })

    await expect(loadAndValidateCase(root, casePath)).rejects.toThrow(/duplicate criterion id/i)
    await expect(loadAndValidateCase(root, casePath)).rejects.toThrow(/threshold/i)
    await expect(loadAndValidateCase(root, casePath)).rejects.toThrow(/prompt_path/i)
  })

  test("accepts threshold 0.85 and rejects 0.849", async () => {
    const root = await makeRepo()
    const casePath = await writeCase(root, sampleCase({ threshold: 0.85 }))
    await expect(loadAndValidateCase(root, casePath)).resolves.toMatchObject({ threshold: 0.85 })

    await writeCase(root, sampleCase({ threshold: 0.849 }))
    await expect(loadAndValidateCase(root, casePath)).rejects.toThrow(/between 0\.85 and 1/)
  })

  test("rejects fixture hash drift and missing behavior references", async () => {
    const root = await makeRepo()
    const definition = sampleCase({
      required_behaviors: ["missing-criterion"],
      fixtures: [
        {
          path: "fixture.txt",
          destination: "workspace/fixture.txt",
          sha256: "0".repeat(64),
        },
      ],
    })
    const casePath = await writeCase(root, definition)

    await expect(loadAndValidateCase(root, casePath)).rejects.toThrow(/fixture hash mismatch/i)
    await expect(loadAndValidateCase(root, casePath)).rejects.toThrow(/missing-criterion/i)
  })

  test("rejects json_equals criteria without an explicit expectation", async () => {
    const root = await makeRepo()
    const base = sampleCase()
    const casePath = await writeCase(root, {
      ...base,
      required_behaviors: ["json-value"],
      prohibited_behaviors: [],
      criteria: [
        {
          id: "json-value",
          description: "A JSON value matches",
          type: "json_equals",
          path: "evidence.json",
          json_path: "missing",
          weight: 1,
          hard_gate: true,
        },
      ],
    })

    await expect(loadAndValidateCase(root, casePath)).rejects.toThrow(
      /expected is required for json_equals/i,
    )
  })

  test("validates and deterministically scores regex_not criteria", async () => {
    const root = await makeRepo()
    const base = sampleCase()
    const noPositiveModeling = {
      id: "no-positive-modeling",
      description: "Positive modeling claims are absent",
      type: "regex_not" as const,
      path: "response.md",
      pattern: "^(?![^\\n]*\\bno\\b)[^\\n]*\\bran\\b[^\\n]*\\bmodels?\\b",
      weight: 1,
      hard_gate: true,
    }
    const definition = sampleCase({
      required_behaviors: ["required-output"],
      prohibited_behaviors: ["no-positive-modeling"],
      criteria: [
        base.criteria.find((criterion) => criterion.id === "required-output")!,
        noPositiveModeling,
      ],
    })
    const casePath = await writeCase(root, definition)
    const runDir = await writeRun(root, "complete\nNo statistical models were run.\n")
    const validated = await loadAndValidateCase(root, casePath)

    const negated = await scoreEvaluationRun({
      repoRoot: root,
      casePath,
      definition: validated,
      runDir,
    })
    expect(negated.criteria.find((criterion) => criterion.id === "no-positive-modeling")).toMatchObject({
      type: "regex_not",
      passed: true,
    })
    expect(negated.pass).toBe(true)

    await writeFile(path.join(runDir, "response.md"), "complete\nWe ran statistical models.\n")
    const positive = await scoreEvaluationRun({
      repoRoot: root,
      casePath,
      definition: validated,
      runDir,
    })
    expect(
      positive.criteria.find((criterion) => criterion.id === "no-positive-modeling")?.passed,
    ).toBe(false)
    expect(positive.hard_gates_passed).toBe(false)
    expect(positive.pass).toBe(false)

    const invalidCasePath = await writeCase(root, {
      ...definition,
      criteria: [{ ...noPositiveModeling, pattern: undefined }],
      required_behaviors: ["no-positive-modeling"],
    })
    await expect(loadAndValidateCase(root, invalidCasePath)).rejects.toThrow(
      /pattern is required for regex_not/i,
    )
  })

  test("scores text, numeric tolerance, and unordered JSON evidence", async () => {
    const root = await makeRepo()
    const casePath = await writeCase(root, sampleCase())
    const runDir = await writeRun(root)
    const definition = await loadAndValidateCase(root, casePath)

    const report = await scoreEvaluationRun({ repoRoot: root, casePath, definition, runDir })

    expect(report.pass).toBe(true)
    expect(report.score_ratio).toBe(1)
    expect(report.hard_gates_passed).toBe(true)
    expect(report.criteria.every((criterion) => criterion.passed)).toBe(true)

    const evaluationContents = `${JSON.stringify(report, null, 2)}\n`
    const manifest = await buildEvaluationManifest({
      report,
      evaluationContents,
    })
    expect(manifest.case_sha256).toHaveLength(64)
    expect(manifest.prompt_sha256).toHaveLength(64)
    expect(manifest.target_sha256).toBe(report.target_sha256)
    expect(manifest.run_sha256).toBe(report.run_sha256)
    expect(manifest.output_sha256).toBe(report.output_sha256)
    expect(manifest.evaluation_sha256).toBe(
      createHash("sha256").update(evaluationContents).digest("hex"),
    )
    expect(manifest.fixture_sha256["fixture.txt"]).toBe(
      "6c846f500e74439d5a2d4ac6012759970373b4d59e352b0a95a0b83306566b78",
    )
  })

  test("directly scores regex and file_exists hard gates in pass and fail states", async () => {
    const root = await makeRepo()
    const base = sampleCase()
    const definition = sampleCase({
      required_behaviors: ["required-file", "required-regex"],
      prohibited_behaviors: ["no-secret"],
      criteria: [
        {
          id: "required-file",
          description: "Evidence file exists",
          type: "file_exists",
          path: "evidence.json",
          expected: true,
          weight: 1,
          hard_gate: true,
        },
        {
          id: "required-regex",
          description: "Response has a numeric score",
          type: "regex",
          path: "response.md",
          pattern: "score:\\s*3\\.145",
          weight: 1,
          hard_gate: true,
        },
        base.criteria.find((criterion) => criterion.id === "no-secret")!,
      ],
    })
    const casePath = await writeCase(root, definition)
    const runDir = await writeRun(root)
    const validated = await loadAndValidateCase(root, casePath)

    const passing = await scoreEvaluationRun({
      repoRoot: root,
      casePath,
      definition: validated,
      runDir,
    })
    expect(passing.criteria.find((criterion) => criterion.id === "required-file")?.passed).toBe(true)
    expect(passing.criteria.find((criterion) => criterion.id === "required-regex")?.passed).toBe(true)

    await rm(path.join(runDir, "evidence.json"))
    await writeFile(path.join(runDir, "response.md"), "complete\nscore: missing\n")
    const failing = await scoreEvaluationRun({
      repoRoot: root,
      casePath,
      definition: validated,
      runDir,
    })
    expect(failing.criteria.find((criterion) => criterion.id === "required-file")?.passed).toBe(false)
    expect(failing.criteria.find((criterion) => criterion.id === "required-regex")?.passed).toBe(false)
    expect(failing.hard_gates_passed).toBe(false)
  })

  test("scores an existing directory for file_exists without reading it as a file", async () => {
    const root = await makeRepo()
    const base = sampleCase()
    const definition = sampleCase({
      required_behaviors: ["required-output"],
      prohibited_behaviors: ["workspace-absent"],
      criteria: [
        base.criteria.find((criterion) => criterion.id === "required-output")!,
        {
          id: "workspace-absent",
          description: "Workspace directory is absent",
          type: "file_exists",
          path: "workspace",
          expected: false,
          weight: 1,
          hard_gate: true,
        },
      ],
    })
    const casePath = await writeCase(root, definition)
    const runDir = await writeRun(root)
    const validated = await loadAndValidateCase(root, casePath)

    const report = await scoreEvaluationRun({
      repoRoot: root,
      casePath,
      definition: validated,
      runDir,
    })

    expect(report.criteria.find((criterion) => criterion.id === "workspace-absent")?.passed).toBe(
      false,
    )
    expect(report.hard_gates_passed).toBe(false)

    await rm(path.join(runDir, "workspace"), { recursive: true })
    const evaluationContents = `${JSON.stringify(report, null, 2)}\n`
    const manifest = await buildEvaluationManifest({
      report,
      evaluationContents,
    })
    expect(manifest.scored_artifact_state.workspace).toEqual({
      exists: true,
      type: "directory",
    })
  })

  test("fails closed when a hard gate fails even if the weighted threshold passes", async () => {
    const root = await makeRepo()
    const casePath = await writeCase(root, sampleCase())
    const runDir = await writeRun(root, "complete\nscore: 3.145\nsk-ant-redacted-example\n")
    const definition = await loadAndValidateCase(root, casePath)

    const report = await scoreEvaluationRun({ repoRoot: root, casePath, definition, runDir })

    expect(report.score_ratio).toBe(5 / 6)
    expect(report.hard_gates_passed).toBe(false)
    expect(report.pass).toBe(false)
  })

  test("credential scan covers scored artifacts, not only the primary response", async () => {
    const root = await makeRepo()
    const casePath = await writeCase(root, sampleCase())
    const runDir = await writeRun(root)
    await writeFile(
      path.join(runDir, "evidence.json"),
      JSON.stringify({ evidence: ["row-2", "row-1"], token: "ghp_12345678901234567890" }),
    )
    const definition = await loadAndValidateCase(root, casePath)

    const report = await scoreEvaluationRun({ repoRoot: root, casePath, definition, runDir })

    expect(report.credential_scan_passed).toBe(false)
    expect(report.pass).toBe(false)
  })

  test("fails when a required run artifact is missing", async () => {
    const root = await makeRepo()
    const casePath = await writeCase(root, sampleCase())
    const runDir = await writeRun(root)
    await rm(path.join(runDir, "evidence.json"))
    const definition = await loadAndValidateCase(root, casePath)

    await expect(
      scoreEvaluationRun({ repoRoot: root, casePath, definition, runDir }),
    ).rejects.toThrow(/evidence\.json/)
  })

  test("findCaseById ignores unrelated malformed cases but rejects duplicate matches", async () => {
    const root = await makeRepo()
    await writeCase(root, sampleCase())
    const malformedDir = path.join(root, "evals", "ce-datascience", "cases", "malformed")
    await mkdir(malformedDir, { recursive: true })
    await writeFile(path.join(malformedDir, "case.yaml"), "id: [not valid yaml\n")

    await expect(findCaseById(root, "sample-case")).resolves.toMatchObject({
      definition: { id: "sample-case" },
    })

    const duplicateDir = path.join(root, "evals", "ce-datascience", "cases", "duplicate")
    await mkdir(duplicateDir, { recursive: true })
    await writeFile(path.join(duplicateDir, "case.yaml"), dump(sampleCase()))
    await expect(findCaseById(root, "sample-case")).rejects.toThrow(/duplicate case id/i)
  })

  test("rejects case, prompt, and target drift from the pre-dispatch run metadata", async () => {
    for (const relativePath of [
      "evals/ce-datascience/cases/sample/case.yaml",
      "evals/ce-datascience/cases/sample/prompt.md",
      "plugins/ce-datascience/skills/sample/SKILL.md",
    ]) {
      const root = await makeRepo()
      const casePath = await writeCase(root, sampleCase())
      const runDir = await writeRun(root)
      const definition = await loadAndValidateCase(root, casePath)
      await writeFile(path.join(root, relativePath), "drifted after dispatch\n")

      await expect(
        scoreEvaluationRun({ repoRoot: root, casePath, definition, runDir }),
      ).rejects.toThrow(/does not match current/)
    }
  })

  test("rejects fixture drift between case validation and scoring", async () => {
    const root = await makeRepo()
    const casePath = await writeCase(root, sampleCase())
    const runDir = await writeRun(root)
    const definition = await loadAndValidateCase(root, casePath)
    await writeFile(path.join(root, "fixture.txt"), "drifted after validation\n")

    await expect(
      scoreEvaluationRun({ repoRoot: root, casePath, definition, runDir }),
    ).rejects.toThrow(/fixture hash mismatch during scoring/i)
  })

  test("manifest hashes stay bound to the single scoring snapshot after source mutation", async () => {
    const root = await makeRepo()
    const casePath = await writeCase(root, sampleCase())
    const runDir = await writeRun(root)
    const definition = await loadAndValidateCase(root, casePath)
    const report = await scoreEvaluationRun({ repoRoot: root, casePath, definition, runDir })
    const expected = {
      case: await sha256File(casePath),
      prompt: await sha256File(path.join(root, definition.prompt_path)),
      target: await sha256Target(path.join(root, definition.target.source)),
      run: await sha256File(path.join(runDir, "run.json")),
      output: await sha256File(path.join(runDir, "response.md")),
      evidence: await sha256File(path.join(runDir, "evidence.json")),
      copiedFixture: await sha256File(path.join(runDir, "workspace", "fixture.txt")),
    }

    await writeFile(casePath, "mutated\n")
    await writeFile(path.join(root, definition.prompt_path), "mutated\n")
    await writeFile(path.join(root, definition.target.source), "mutated\n")
    await writeFile(path.join(runDir, "run.json"), "{}\n")
    await writeFile(path.join(runDir, "response.md"), "mutated\n")
    await writeFile(path.join(runDir, "evidence.json"), "{}\n")
    await writeFile(path.join(runDir, "workspace", "fixture.txt"), "mutated\n")
    definition.id = "mutated-case-id"

    const evaluationContents = `${JSON.stringify(report, null, 2)}\n`
    const manifest = await buildEvaluationManifest({
      report,
      evaluationContents,
    })

    expect(manifest).toMatchObject({
      case_id: "sample-case",
      case_sha256: expected.case,
      prompt_sha256: expected.prompt,
      target_sha256: expected.target,
      run_sha256: expected.run,
      output_sha256: expected.output,
      fixture_sha256: { "fixture.txt": "6c846f500e74439d5a2d4ac6012759970373b4d59e352b0a95a0b83306566b78" },
    })
    expect(manifest.scored_artifact_sha256).toEqual({
      "response.md": expected.output,
      "evidence.json": expected.evidence,
      "workspace/fixture.txt": expected.copiedFixture,
    })
    expect(manifest.scored_artifact_state).toEqual({
      "response.md": { exists: true, type: "file", sha256: expected.output },
      "evidence.json": { exists: true, type: "file", sha256: expected.evidence },
      "workspace/fixture.txt": {
        exists: true,
        type: "file",
        sha256: expected.copiedFixture,
      },
    })
    expect(Object.keys(manifest).sort()).toEqual([
      "case_id",
      "case_sha256",
      "evaluation_sha256",
      "fixture_sha256",
      "output_sha256",
      "pass",
      "prompt_sha256",
      "run_sha256",
      "schema_version",
      "scored_artifact_sha256",
      "scored_artifact_state",
      "source_commit",
      "target_sha256",
    ])
  })

  test("does not follow pre-existing evaluation output symlinks during atomic writes", async () => {
    const root = await makeRepo()
    const runDir = path.join(root, "run")
    await mkdir(runDir)
    const outside = path.join(root, "outside.txt")
    await writeFile(outside, "unchanged\n")
    await symlink(outside, path.join(runDir, "evaluation.json"))
    await symlink(outside, path.join(runDir, "manifest.json"))

    await writeEvaluationArtifacts({
      runDir,
      evaluationContents: "evaluation\n",
      manifestContents: "manifest\n",
    })

    expect(await readFile(outside, "utf8")).toBe("unchanged\n")
    expect(await readFile(path.join(runDir, "evaluation.json"), "utf8")).toBe("evaluation\n")
    expect(await readFile(path.join(runDir, "manifest.json"), "utf8")).toBe("manifest\n")
  })

  test("preserves both published artifacts when manifest preparation fails", async () => {
    const root = await makeRepo()
    const runDir = path.join(root, "run")
    await mkdir(runDir)
    const evaluationPath = path.join(runDir, "evaluation.json")
    const manifestPath = path.join(runDir, "manifest.json")
    await writeFile(evaluationPath, "old evaluation\n")
    await writeFile(manifestPath, "old manifest\n")

    await expect(
      writeEvaluationArtifacts({
        runDir,
        evaluationContents: "new evaluation\n",
        manifestContents: async () => {
          expect((await readdir(runDir)).filter((name) => name.endsWith(".tmp"))).toHaveLength(2)
          throw new Error("forced manifest preparation failure")
        },
      }),
    ).rejects.toThrow(/forced manifest preparation failure/)

    expect(await readFile(evaluationPath, "utf8")).toBe("old evaluation\n")
    expect(await readFile(manifestPath, "utf8")).toBe("old manifest\n")
    expect((await readdir(runDir)).filter((name) => name.endsWith(".tmp"))).toEqual([])
  })

  test("rejects physical symlink escapes for repository and scored artifacts", async () => {
    const root = await makeRepo()
    const outside = path.join(root, "..", `${path.basename(root)}-outside.txt`)
    tempRoots.push(outside)
    await writeFile(outside, "outside\n")
    const targetPath = path.join(root, "plugins", "ce-datascience", "skills", "sample", "SKILL.md")
    await rm(targetPath)
    await symlink(outside, targetPath)
    const casePath = await writeCase(root, sampleCase())
    await expect(loadAndValidateCase(root, casePath)).rejects.toThrow(/target\.source escapes/)

    await rm(targetPath)
    await writeFile(targetPath, "# Sample skill\n")
    await writeCase(root, sampleCase())
    const runDir = await writeRun(root)
    const definition = await loadAndValidateCase(root, casePath)
    await rm(path.join(runDir, "evidence.json"))
    await symlink(outside, path.join(runDir, "evidence.json"))
    await expect(
      scoreEvaluationRun({ repoRoot: root, casePath, definition, runDir }),
    ).rejects.toThrow(/criterion evidence-set path escapes/)
  })

  test("propagates non-ENOENT existence errors", async () => {
    const root = await makeRepo()
    const casePath = await writeCase(root, sampleCase())
    const runDir = await writeRun(root)
    const definition = await loadAndValidateCase(root, casePath)
    await rm(path.join(runDir, "evidence.json"))
    await symlink("evidence.json", path.join(runDir, "evidence.json"))

    await expect(
      scoreEvaluationRun({ repoRoot: root, casePath, definition, runDir }),
    ).rejects.toMatchObject({ code: "ELOOP" })
  })

  test("rejects an evaluation run directory symlink that escapes the temp root", async () => {
    const requiredRoot = "/tmp/ce-datascience/behavioral-evals"
    await mkdir(requiredRoot, { recursive: true })
    const outside = await mkdtemp(path.join(os.tmpdir(), "ce-eval-outside-"))
    const link = await mkdtemp(path.join(requiredRoot, "symlink-"))
    tempRoots.push(outside, link)
    await rm(link, { recursive: true })
    await symlink(outside, link)

    await expect(resolveEvaluationRunDir(link)).rejects.toThrow(/Run directory must be under/)
  })

  test("discovers and validates every committed case", async () => {
    const root = await makeRepo()
    await writeCase(root, sampleCase())

    const result = await validateAllCases(root)

    expect(result.cases.map((item) => item.definition.id)).toEqual(["sample-case"])
    expect(result.errors).toEqual([])
  })
})

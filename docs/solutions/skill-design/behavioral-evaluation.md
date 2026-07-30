# Reproducible Behavioral Evaluation

Use the repository-owned behavioral evaluation layer when a skill or agent change can alter what
the model does but static content assertions cannot prove the intended behavior. The pilot covers
`ce-doc-review` and `ce-data-qa`.

## Design

Each case under `evals/ce-datascience/cases/` freezes:

- the target skill or agent source;
- a user-shaped prompt and synthetic or seeded fixtures;
- required and prohibited behaviors;
- weighted outcome criteria and hard safety gates;
- a passing threshold and explicit limitations.

The scorer checks observable outputs and artifacts. It does not require a particular hidden
reasoning path or tool sequence unless that sequence is itself a published contract. Every hard
gate must pass, the credential scan must pass, and the weighted score must meet the case threshold.

Deterministic validation and live evaluation are intentionally separate:

- `bun run eval:validate` checks case structure, paths, fixture hashes, criterion references, and
  thresholds. It is safe for normal CI.
- `bun run eval:score --case <id> --run-dir <path>` scores an already-completed run without calling
  a model. It writes `evaluation.json` and `manifest.json`.
- `skill-creator` supplies the fresh-context model run. Do not use typed plugin dispatch from an
  existing session because plugin skill and agent definitions are cached at session start.

## Run Layout

Keep every live run under:

```text
/tmp/ce-datascience/behavioral-evals/<run-id>/
├── run.json
├── response.md
├── workspace/
├── evaluation.json
└── manifest.json
```

`run.json` uses this contract:

```json
{
  "schema_version": "1.0",
  "case_id": "ce-data-qa-pre-sap",
  "case_sha256": "SHA-256 captured before dispatch",
  "prompt_sha256": "SHA-256 captured before dispatch",
  "target_sha256": "SHA-256 captured before dispatch",
  "runner": "skill-creator",
  "model": "record the actual model",
  "started_at": "ISO-8601 timestamp",
  "completed_at": "ISO-8601 timestamp",
  "output_path": "response.md"
}
```

Prepare the workspace by copying each fixture to the `destination` declared in the case manifest.
Before dispatch, hash the case YAML, prompt, and target source and record those digests in
`run.json`. Run the case prompt through `skill-creator`, injecting that target source from the
current checkout. Save the complete user-facing response and any requested artifacts, then run
`eval:score`. Scoring rejects the run if any pre-dispatch digest differs from the current file.

The scorer canonicalizes the repository and run paths before reading them, so a symlink cannot
escape the repository or `/tmp/ce-datascience/behavioral-evals` roots. It snapshots `run.json`, the
primary output, the case, prompt, target, fixtures, and every unique scored artifact exactly once.
The report and manifest hashes are derived from those immutable bytes. Both output files are fully
written and synced to same-directory temporary files before publishing starts. The publisher then
renames `evaluation.json` first and `manifest.json` last; a failure before the first rename leaves
the previously published pair unchanged. Each rename is atomic and replaces a pre-existing output
symlink rather than following it. The two renames are not a single cross-file transaction, so an
operating-system failure between them can still require rerunning the scorer.

## Acceptance Policy

For a material behavioral change to a covered target:

1. Update or add a case when the intended behavior changed.
2. Run `eval:validate` and the deterministic Bun test suite.
3. Run each affected case twice in independent fresh contexts through `skill-creator`.
4. Require identical hard-gate outcomes across both runs. A passing weighted score cannot override
   a hard-gate failure.
5. Report sanitized scores, failed criterion IDs, model identifier, pre-dispatch digests, and
   manifest hashes in the pull request.

Do not commit live run directories, raw private prompts, complete model traces, credentials, PHI,
or patient-level data. Committed fixtures must be synthetic or explicitly seeded test documents.
Evidence manifests demonstrate what was evaluated; they do not establish real-world clinical,
statistical, or production validity.

## Case Authoring Rules

- Prefer deterministic facts, evidence IDs, invariant safety boundaries, and post-run artifacts.
- Use `regex_not` for deterministic prohibited language whose acceptable negations cannot be
  represented safely by a literal substring check. Author the regular expression so explicit
  negations remain valid; the scorer passes only when the expression does not match.
- Use numeric tolerances only where formatting or floating-point representation can vary.
- Make prohibited behaviors hard gates when violating them could silently mutate data, expose
  sensitive text, invent analysis results, or bypass required user judgment.
- Keep prompts user-shaped and omit expected answers so forward tests do not leak the scoring key.
- State limitations narrowly. A synthetic aggregate-data pass is not evidence of patient-data
  readiness, privacy compliance, or general agent quality.

This pattern adapts the frozen protocols, objective scoring, synthetic health-data cases, and
hash-based evidence used in
[`bojieli/ai-agent-book`](https://github.com/bojieli/ai-agent-book), especially its
[agent-evaluation chapter](https://github.com/bojieli/ai-agent-book/blob/main/chapter6/README.en.md),
[public-health reporting evaluation](https://github.com/bojieli/ai-agent-book/tree/main/chapter6/public-health-reporting-eval),
and [skill experiment protocol](https://github.com/bojieli/ai-agent-book/blob/main/chapter2/agent-skills-ppt/experiment_protocol.json).
The CE implementation and fixtures are original and use the external repository as conceptual
grounding only.

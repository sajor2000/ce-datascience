> Review history: the final remediation addendum withdraws the remaining P2
> and reports no remaining actionable defect. Earlier findings are preserved.

# Independent CLIF meta-analysis review

Scope was limited to the paths authorized in the request. Review used synthetic
inputs only. No repository files were changed.

## Blocking findings

### P1: supplied output paths can overwrite executable source

- **Locations:** `scripts/aggregate_meta.py:410-421,431-439`; `scripts/aggregate_meta.R:138-147,169`
- **Defect:** Python prevents an output from resolving to the input or another
  requested output, but not to the Python script itself. The R wrapper forwards
  its result path to Python only for input collision checking, then writes the R
  JSON directly; it likewise does not reject the validator path or its own
  script path. A valid aggregate run can therefore replace a reusable template
  with JSON.
- **Synthetic reproduction:** copy `aggregate_meta.py` to a temporary directory,
  then invoke that copy with `--input` set to the bundled example and `--output`
  set to the copy itself. The command exits 0 and the copied source's first byte
  becomes `{`. No patient data is involved.
- **Required fix:** require a new, non-existent destination by default (or an
  explicit overwrite flag), and always reject destinations resolving to every
  source artifact: input, Python validator, and executing R/Python script. Use
  inode-aware same-file checks for existing paths, including hard links.

### P1: the release gate makes an honest missing-site roster impossible

- **Locations:** `scripts/aggregate_meta.py:181-182`; `references/coding.md:33-39`
- **Defect:** the skill requires retained missing sites, but the validator
  requires every unit, including a `status="missing"` unit that returned no
  aggregate, to carry `release_status="approved"` and a nonempty release-review
  reference. This either rejects the required missing-site record or pressures
  users to invent an approval for data that was never submitted.
- **Synthetic reproduction:** change the example's fourth unit to
  `status="missing"`, leave effects null, set
  `release_status="not_applicable"`, and leave its review reference empty. The
  validator exits 2 with `release_status must be 'approved' before central
  synthesis`.
- **Required fix:** model release state by submission status. For a missing site,
  accept an explicit `not_applicable` release status with a null reference and
  retain a reason that no submission was received. Continue to require reviewed
  approval for aggregate-bearing submissions, and test both paths.

## Non-blocking findings

### P2: a failed optional-artifact write leaves a successful-looking primary result

- **Locations:** `scripts/aggregate_meta.py:473-479`
- **Defect:** the script writes the requested result JSON before the optional TSV
  and manifest. If a later artifact cannot be written, it returns exit 2 while
  leaving `--output` present. Automation that retains partial outputs can mistake
  this failed run for a completed analysis.
- **Synthetic reproduction:** provide a valid temporary JSON output path and a
  `--validated-tsv` whose parent directory does not exist. The process exits 2
  with `cannot write validated artifact`, while the result JSON already exists.
- **Required fix:** stage every requested artifact first and publish them only
  after all writes succeed, or delete the primary output on a later failure.
  Add a regression assertion that no requested output remains after a failed
  multi-artifact invocation.

### P2: manual R JSON emission has no executed output-path test

- **Locations:** `scripts/aggregate_meta.R:63-103`; `tests/clif-meta-analysis-code.test.ts:255-315`
- **Defect:** the R template manually splices JSON provenance and result lines,
  but the test exercises only `--validate-only`; it never calls `write_output`
  or parses an R-produced result JSON. The test therefore cannot detect malformed
  escaping, commas, provenance insertion, or a changed `metafor` object shape.
- **Required fix:** when `Rscript` and `metafor` are installed, run the bundled
  synthetic example through the R result path, parse the output with a JSON
  parser, and assert the original unit IDs, input SHA-256 provenance, REML/KH
  labels, and finite numeric fields. This is especially important because no
  JSON serializer is used in the R writer.

## Checks and limits

- The pre-update targeted test run passed 10/10 tests. The current targeted
  re-run encountered five 5-second child-process timeouts while other work was
  active on the shared Mac, although the parent reported 11/11 passing. These
  timeouts are recorded as a runtime limitation, not as an additional source
  defect.
- `metafor` is not installed locally, so the R REML fit and its manual JSON
  writer were not executable here. `numpy`/`statsmodels` are also absent, so the
  Python Paule-Mandel branch was not executed. No packages were installed.
- The current R hard-link and identifier-coercion fixes were inspected and are
  not retained as findings: forwarding `--output` through the Python same-file
  guard closes the demonstrated input hard-link path, and explicit TSV column
  classes preserve `001` and `NA` identifiers.

No additional blocking statistical-method, Python common-effect, provenance, or
schema defects were identified within the authorized scope. The two P1 findings
above remain release blockers.

## Remediation addendum

Narrow source inspection after the reported remediation confirms that the two
P1 findings above are resolved:

- New destinations are required before Python writes (`os.path.lexists` guard
  plus link-based publication), and R stages then publishes through `file.link`.
  The validator now rejects a result path that is an existing source artifact
  before an R fit runs.
- Missing roster units now require `release_status="not_applicable"` and a null
  review reference, while received rows still require a reviewed approval. The
  contract prose and the synthetic regression case match that rule.
- The primary result is published after optional artifacts, and completed
  artifacts are removed after a later failure. The optional R-output test now
  parses a real result and provenance when `metafor` is available.

The previously reported TSV rollback P2 is withdrawn. Current
`write_validated_tsv()` stages rows in `NamedTemporaryFile(dir=path.parent)`,
publishes with `os.link`, and removes the staging file on `OSError`. It therefore
has the same new-destination, no-partial-publication pattern as JSON.

No remaining blocker or actionable defect was identified in the narrow
remediation review. No tests were run for this addendum.

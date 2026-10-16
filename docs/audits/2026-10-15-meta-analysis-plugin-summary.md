# Meta-analysis capability audit and implementation

Audit date: 2026-10-15. Baseline: `origin/main` at
`26985563eaf044ad9adf934d0f14a37422a3d43f`.
Implementation branch: `audit/clif-meta-integration`.

## Assessment

The baseline plugin supplies useful CLIF locality/version rules, review-checklist
routing, literature extraction, preregistration drafts and a power-assumption
pooler. Those components did not constitute an end-to-end formal meta-analysis
workflow. The most serious gaps concerned scientific comparability, dependence,
failed sites, unsupported method claims and conflation of distinct model targets.

The new `method-clif-meta-analysis` skill supports two explicit workflows:

1. CLIF sites execute a shared local analysis and return reviewed aggregate
   effects to a lead. The lead reconciles submissions and returns a versioned
   synthesis report and site queries.
2. A conventional literature review follows a protocol through search,
   selection, appraisal, extraction, synthesis, certainty assessment and reporting.

It is a focused instruction and code resource. It does not confer statistical
expertise, complete a review autonomously, authenticate release approvals, or
establish clinical validity.

## Findings and disposition

| Area | Baseline finding | Implemented response | Remaining boundary |
| --- | --- | --- | --- |
| Scientific target | Unspecified estimates could be pooled | Separate designs and explicit estimand, scale, adjustment and outcome/horizon contract | Humans must substantiate compatibility and the declared target |
| Site returns | No typed independent-effect input | Shared validator, unique site/study/unit IDs, failure/missing/suppression dispositions and release-review assertions | Real disclosure approval, QC, code/phenotype provenance and overlap assessment still require site evidence |
| Federated learning | Averaged intercepts presented as rescue for failed local fits | Removed rescue claim and separated coefficient synthesis, optimization and model-performance synthesis | No federated optimizer or global predictive-model deployment is implemented |
| R/Python methods | REML confused with moment estimation and Python alternatives | Corrected formula guidance and added R REML/Knapp-Hartung and Python PM/HKSJ templates | Different engines/estimators are not automatically equivalent |
| Diagnostics | Defaults and unsuitable publication-bias shortcuts | Explicit uncertainty methods, Q/df/I-squared/weights, small-k warnings and guarded missing-evidence guidance | Starter scripts omit PI, influence, forest plots and asymmetry tests; generate those only when justified in the actual project |
| Literature conduct | Reporting support without a complete review workflow | PRISMA/MOOSE versus Cochrane roles, registration checks, independent review, RoB, ROB-ME, GRADE and SWiM guidance | External searches, screening judgments and appraisal must actually be performed and recorded |
| Evidence freshness | Template conventions treated as consortium mandates | Removed unsupported REML mandate and separate-repository requirement | Broader stale upstream-template recipes are documented in the detailed audit and need a separately scoped refresh |

Detailed evidence and baseline file locations:

- [CLIF federated audit](2026-10-15-clif-federated-meta-analysis.md)
- [Literature methods audit](2026-10-15-literature-meta-analysis.md)
- [Independent code review and remediation](2026-10-15-meta-analysis-code-review.md)
- [New skill](../../plugins/methodsmith/skills/method-clif-meta-analysis/SKILL.md)
- [Executable-code guide](../../plugins/methodsmith/skills/method-clif-meta-analysis/references/coding.md)

## Isolation and research

Four new Worktrunk worktrees isolate integration, CLIF research, literature
research and code work. GPT-5.6-Terra supplied the research and code passes.
Existing worktrees and unmerged statistical branches were preserved and were
not assumed to be released plugin behavior. No commit, push or merge is part
of this handoff.

Primary documentation was checked through MCP and web tools. Browserbase remote
startup failed in the parent and independent research context, and its cloud
search returned `fetch failed`. The PROSPERO live reader returned a JavaScript
shell, so current eligibility/timing thresholds remain unverified. The skill
requires checking live policy and does not encode a historical threshold.

## Validation evidence

The focused executable suite passes 13 tests with 89 assertions. One additional
R result/provenance integration test is explicitly skipped because metafor is
absent. The common-effect synthetic estimate independently matches 2/15 with
SE 1/15. R validation, spaces in paths, hard-linked source protection,
identifier preservation, missing-site status, strict JSON and failed-output
cleanup have executable coverage. Python PM and R REML fitting have not been
executed locally because numpy/statsmodels and metafor are absent. No engine
installation or cross-engine numerical equivalence is claimed.

TypeScript typecheck, release metadata validation (55 agents, 66 skills), all
13 evaluation-case definitions and diff whitespace validation pass. The separate
skill-creator Python validator could not run because PyYAML is absent; repository
frontmatter, resource-path and skill-value checks provide the executed coverage.

Independent review found and drove fixes for executable-source overwrite,
missing-site release assertions, partial output cleanup, R hard links and R ID
coercion. Every output now requires a new destination. Missing-site roster rows
use not-applicable release state without inventing an approval. An optional R
JSON output test is present for environments with metafor. The reviewer
confirmed no remaining actionable defect in its final remediation addendum.

An initial full suite passed 1310 tests with one skip before the final review
fixes. A later default-timeout run under severe shared-host load failed with
1295 pass, 1 skip, 16 failures and 9 errors; this is not a passing result. The
bounded-timeout rerun (`bun test --timeout 30000`) passed 1312 tests with two
skips, zero failures and 5760 assertions across 87 files. The subsequent added
mid-write I/O-failure regression passed in the focused 13-test suite. Fresh
behavioral scores are recorded below.

Jev's advisory gate escalated with truncated context, composite 0.50525 and
safe-to-apply 0.29. It verified one claim, left two unsupported and contradicted
none. This is not approval. Independent review and executable evidence are
reported separately. No deployment or real-data execution is authorized by the
advisory outcome.

Three skill-creator cases and 20 balanced trigger examples are checked in as
fixtures. The trigger examples have not been measured as a precision/recall
benchmark. Earlier independent behavioral runs passed 13/13 on both cases,
twice each. They were superseded by later code fixes and are not final-snapshot
evidence. A subsequent methods run scored 11/13 because it rejected the REML label but
omitted the actual Paule-Mandel estimator name. That failure is retained. The
skill now explicitly requires naming Paule-Mandel and the selected interval
when explaining `iterated`/`pm`. Both cases were dispatched again in independent
fresh contexts after that change, with pre-dispatch whole-skill hashes. The
final snapshot scores are reported below. Baseline reasoning already
recognized several major method boundaries, so this small synthetic evaluation
does not establish an improvement in statistical expertise or real-study quality.
Live prompts, responses, hashes and scoring artifacts stay under
`/tmp/methodsmith/behavioral-evals/`; only sanitized results belong here.

No patient data or real site results were used. The synthetic release-review
marker in the example input is explicitly fictional. No new dependency was
added to the repository manifests.

## Final behavioral record

Both affected cases passed twice in independent fresh contexts against the same
whole-skill snapshot. All hard gates and credential scans passed. The responses
were also read manually. These are bounded synthetic advice checks, not evidence
of analysis correctness for real data.

| Case | Run | Model | Score | Hard gates |
| --- | --- | --- | --- | --- |
| method-clif-meta-dependence | 1 | gpt-5.6-terra | 13/13 | Pass |
| method-clif-meta-dependence | 2 | gpt-5.6-terra | 13/13 | Pass |
| method-clif-meta-methods | 1 | gpt-5.6-terra | 13/13 | Pass |
| method-clif-meta-methods | 2 | gpt-5.6-terra | 13/13 | Pass |

Whole-skill SHA-256: `4cd4b73d37964b21aa9fa42dddcb05bcf13011173a8895598c51f0e94d5e2b6d`.

After the final two-line instruction change, the frontmatter, skill-value and
skill-best-practices subset passed 399 tests with 551 assertions. The executable
code was unchanged from the passing full and focused suites above.

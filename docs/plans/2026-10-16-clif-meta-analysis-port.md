---
title: Port CLIF meta-analysis to Methodsmith
status: pr-open
---

# Scope

Port the reviewed `audit/clif-meta-integration` snapshot (9283f99a) onto
Methodsmith main. Keep the power-assumption `method-meta-analysis` workflow;
add `method-clif-meta-analysis` for formal site-to-lead and literature synthesis.
Retain existing explicit REML/Knapp-Hartung examples and the registry gate.
Do not claim estimator parity between Python Paule-Mandel and R REML.

# Completion checks

- New helper tests first reproduce missing resources, then pass on the port.
- Execute actual Python PM and R REML using synthetic aggregates; no patient data.
- Run metadata, fingerprint, portability, typecheck, full-suite and website checks.
- Repeat each new behavioral case twice with whole-skill digests captured first.
- Independent Standards and Spec review, then the Jev advisory gate.
- Push one feature branch and open a focused PR; no automatic merge or release.

# Decisions

- Preserve the current power pooler's pinned CI/PI contract rather than replacing
  its reference wholesale with an older branch version. Remove the hand-written
  REML iteration and route formal reviews to the new skill.
- Keep aggregate release-review assertions as declarations, never certification.
- Installed-skill checks use disposable homes and target roots only.

# Review findings resolved

- R previously accepted `--method common` but still emitted REML results.
  Reproduced exit 0, then added a failing regression and allowlisted documented
  options. It now exits 2 without creating a result.
- statsmodels discards PM solver convergence status. An extreme synthetic
  SE=1e-10 fixture returned an unconverged tau-squared. Added a failing regression
  and checked the PM estimating equation (Q at fitted tau versus k-1, absolute
  tolerance 1e-5, with the zero-heterogeneity boundary). Unconverged fits fail
  without publication; no private statsmodels API or new solver is required.
- The installed Codex copy executes both actual engines. Python PM estimates,
  heterogeneity and HKSJ intervals match an independent Q-root/t calculation;
  R REML/Knapp-Hartung emits finite JSON with method provenance. This does not
  assert parity between the different estimators.

# Port validation (2026-10-16)

- Full suite: 1,611 pass, five unrelated optional-dependency skips, zero failures
  across 112 files. Python PM and R REML regressions both execute.
- Both fresh-context cases (dependence and methods) scored 13/13 twice; all hard
  gates and credential checks passed. Whole-skill digests were captured before
  dispatch. Evidence: `/tmp/methodsmith/behavioral-evals/clif-port-*`.
- Typecheck, release metadata (67 skills), all 22 case schemas, rename idempotence,
  description fingerprints, skill portability and website build pass.
- Installed smoke uses numpy 2.4.6, scipy 1.17.1, statsmodels 0.15.0 and metafor
  3.8.1. Code and fixture checks use synthetic aggregates only and temporary homes.
- Independent Standards and Spec reviewers verified the original reproductions
  are fixed; no remaining concrete blockers found in scope. Review reports remain
  in OS temporary paths, separate from the historical audits.
- Description fingerprints are regenerated after the feature commit because the
  existing generator deliberately reads committed Git history. No generator or
  release-version contract was changed.

# Advisory adjudication

- Jev returned eight complete, untruncated escalations: composite scores
  0.37525–0.6485 and safe-to-apply scores 0.23–0.43. Both completion claims
  were verified in every group, with no contradictions or unsupported claims.
- Under the Jev house rules' stronger-review route, independent Spec and
  Standards reviewers examined all scores, raw evidence, tests and installed
  smoke results at commit 3b98c553. Both support pushing and opening a PR;
  neither identified a concrete blocker. No Jev reruns were used.
- The advisory remains escalated. This adjudication permits PR review only;
  it does not approve merging, release or scientific use. Synthetic coverage,
  unmeasured trigger reliability and omitted diagnostics remain limitations.

# PR review follow-up (2026-10-17)

- PR #111: CodeRabbit identified an undefined `pooled` object in the retained
  R recipe and unescaped table delimiters in the historical audit. Reproduced
  the R failure, then constructed `pooled` from the validated aggregate TSV
  while preserving the manifest and explicit log-OR assumption. Synthetic
  validation, REML/KH and prediction now execute. The audit row has four cells.
- Full follow-up suite with CI's pinned Bun 1.3.14: 1,611 pass, five optional
  skips, zero failures. Guidance/portability checks: 16 pass; release metadata
  passes. Existing meta/brms fitting calls are unchanged and were not executed
  locally because those optional packages are unavailable.
- An earlier follow-up run under Bun 1.2.17 timed out in platform-install smoke
  and was interrupted. The complete pinned-version rerun above passes; no
  runner code or project dependencies were changed.
- PR description now follows the repository template. Blanket docstring
  coverage remains an advisory suggestion, outside this focused correction.

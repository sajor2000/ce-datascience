---
title: Port CLIF meta-analysis to Methodsmith
status: in-progress
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

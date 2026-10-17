---
title: Repair scientific skill integrity gaps
status: in-progress
base: feat/clif-meta-analysis
---

# Scope

Follow-up to the read-only adversarial audit at 40c58367. Keep the CLIF feature
PR separate; this repair branch is stacked on it. No release-version changes,
real agent configuration writes, PHI or patient fixtures. Synthetic tests only.

# Repairs and completion checks

1. Number token exemptions: result-bearing compounds must fail without registry
   provenance; declared design phrases and named scientific identifiers remain
   usable. Execute CLI/Word/render regressions.
2. Phenotype patient keys: reject blank/duplicate/conflicting subject keys before
   publishing; errors do not print identifiers. Execute real CLI regressions.
3. Verification scientific context: distinguish inferential MI from prediction
   development/validation/deployment; compare events, clusters, analyzable N and
   enrollment targets separately. Fresh behavioral positive/negative cases.
4. Power advice: preserve protocol-specific equivalence alpha and CI; distinguish
   common clinical NI conventions from bioequivalence TOST. Behavioral case.
5. Power-anchor compatibility: require selected estimand, adjustment set, outcome,
   time horizon, independent units and scale/unit consistency before fitting or
   emitting the canonical signal. Test actual compatible/rejected R inputs;
   align extraction and downstream routing. Keep the justified HK/Wald rule.
6. Repeated-measures example: identifiable covariance and matching fallback;
   run existing model-choice fresh-context cases twice.
7. Tracking disclosure and validation design: separate restricted logs from
   shareable suppressed summaries; preserve bootstrap/nested validation without
   inventing a held-out set. Test behavior on a synthetic private run summary.

# Validation

Test-first executable regressions; focused then full Bun suite in disposable
HOME using CI-pinned Bun. Install existing test dependencies in the cloud only.
Update affected repository and skill-creator cases; capture case/prompt/whole-skill
digests before each fresh evaluation; require all hard gates twice. Validate
metadata, portability, descriptions if changed, typecheck, and diff. Independent
review before pushing a focused stacked PR. No automatic merge.

# Scientific grounding

FDA final May 2026 Statistical Approaches to Establishing Bioequivalence,
section II.C (https://www.fda.gov/media/163638/download); Sisk et al.
(https://arxiv.org/abs/2206.12295); Cochrane Handbook chapters 10 and 24.
The earlier criticism of the zero-heterogeneity HK/Wald switch was retracted
against the cited Handbook and is not a repair target.

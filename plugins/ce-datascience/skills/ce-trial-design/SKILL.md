---
name: ce-trial-design
description: "Build auditable two-arm group-sequential design frontiers from version-pinned rpact or gsDesign results without reimplementing the statistical engine."
argument-hint: "<endpoint and estimand>, optional: --engine rpact|gsDesign --alpha <value> --power <value>"
---

# External-Engine Trial Design Frontier

## Skill Value

- **Problem it solves:** Group-sequential choices are often compared through disconnected scripts, screenshots, and undocumented assumptions.
- **Use when:** A statistician needs to compare two-arm group-sequential superiority designs across effect, information-time, spending-rule, or futility scenarios.
- **Output:** A locked design specification, exact external-engine script and log, normalized operating-characteristic table, feasible/Pareto frontier, provenance receipt, and SAP handoff.
- **Ask only if:** The endpoint/estimand, hypothesis, effect scale, sidedness, alpha, target power, information times, or intended external engine cannot be established from the repository and conversation.
- **Interaction:** Ask required questions with the platform's blocking question tool. Only when no blocking tool exists or the call errors, present numbered options in chat and wait. Never silently skip the question.
- **Do not do:** Do not reimplement boundary or operating-characteristic mathematics, call CE output a validated design, choose a clinically acceptable design, or imply regulatory acceptance.

This skill owns the auditable workflow around the calculation. `rpact` or `gsDesign` owns boundaries, sample size/information, error spending, stopping probabilities, power, and expected information.

## Supported first release

Proceed only for a two-arm group-sequential superiority design with a prespecified endpoint and estimand. The external engine may analyze continuous, binary, or time-to-event endpoints only when its documented function supports the requested assumptions.

Stop and name the unsupported scope for platform/multi-arm trials, response-adaptive randomization, enrichment, seamless phase transitions, Bayesian decision rules, sample-size re-estimation, custom combination tests, or unblinded operational execution. Do not silently reduce those requests to a simpler design.

## Workflow

### 1. Establish the design contract

Read `references/design-contract.md` in full. Resolve evidence from the protocol, SAP, `ce-effect-size`, and `ce-power` before asking the user. Write `analysis/trial-design/<design-id>/design-spec.json` from `references/design-spec.example.json` and preserve the endpoint, estimand, effect scale, scenarios, decision rules, and review owner.

Completion evidence: every required contract field is explicit, scenario IDs are unique, and unresolved assumptions are marked as unresolved rather than guessed.

### 2. Pin and verify the engine

Read `references/engine-adapters.md` in full. Use either `rpact` or `gsDesign`, not a mixture within one run. Record the expected package version in the design spec. Before calculation, obtain `R.version.string` and `packageVersion(<engine>)`; stop if the installed package does not exactly match the pin.

Do not install or upgrade R packages without the user's approval. A lockfile may establish the version, but the runtime check still has to match it.

Completion evidence: the engine script contains a fail-closed version assertion and writes the R/package versions to its log or session-info artifact.

### 3. Run the external engine

Author a project-local R script at `analysis/trial-design/<design-id>/engine-run.R`. Use only documented engine functions named in `references/engine-adapters.md`. Run every declared scenario and candidate through the same pinned engine and write one normalized row per result to `engine-results.csv` using the exact column contract in `references/design-contract.md`.

Values for achieved power, type I error, maximum information, and expected information must be read from engine results. Never reconstruct, approximate, or back-fill them in CE code. If the engine does not provide a required value for the chosen design, stop and report the missing operating characteristic.

Capture stdout/stderr in `engine-run.log`, save `sessionInfo()` output, and have the same R process write `runtime-provenance.json` using the contract in `references/engine-adapters.md`. If simulation is used, record the algorithm, iteration count, seed, Monte Carlo uncertainty, and failure count. Do not treat a simulated point estimate as proof that an error-rate constraint is satisfied when its Monte Carlo interval crosses the declared limit.

Completion evidence: the script exits successfully, the pinned version is visible, every declared scenario has output, and no required normalized value is missing or non-finite.

### 4. Build the CE-owned frontier and receipt

Keep the project root as the working directory. Invoke the co-located `scripts/build_frontier.py` by that skill-relative path so the project-relative inputs and outputs remain in the user's workspace:

```bash
python3 scripts/build_frontier.py \
  --spec analysis/trial-design/<design-id>/design-spec.json \
  --results analysis/trial-design/<design-id>/engine-results.csv \
  --engine-script analysis/trial-design/<design-id>/engine-run.R \
  --engine-log analysis/trial-design/<design-id>/engine-run.log \
  --session-info analysis/trial-design/<design-id>/session-info.txt \
  --runtime-provenance analysis/trial-design/<design-id>/runtime-provenance.json \
  --output-dir analysis/trial-design/<design-id>/frontier
```

The script validates scenario/candidate coverage and the pinned engine identity against machine-readable runtime provenance, applies only the declared power and type I error thresholds, computes a per-scenario Pareto frontier that minimizes maximum information, expected information under the null, and expected information under the alternative, and hashes the exact engine script, log, session information, and runtime provenance into the receipt. It does not recalculate statistical quantities.

Completion evidence: `evaluated-results.csv`, `frontier.csv`, `receipt.json`, and `sap-handoff.md` exist; the receipt hashes match the exact design spec and normalized engine output. An empty frontier is a valid negative result and must not be replaced by the "closest" candidate.

### 5. Review and hand off

Present the full feasible frontier. Do not select one candidate unless the user supplies the clinical, operational, and statistical preference rule. Require a named qualified statistician to review the exact spec, engine script, operating characteristics, stopping rules, multiplicity/error control, and SAP language.

The SAP handoff must preserve endpoint and estimand, sidedness, alpha, target power, information times, efficacy/futility rules and binding status, engine/version, scenario assumptions, simulation controls when used, selected candidate rationale, and review status. Route adaptive-trial reporting checks to the existing CONSORT Adaptive coverage during review.

Completion evidence: the handoff distinguishes engine-derived quantities, CE-derived feasibility/frontier labels, unresolved clinical or operational choices, and the named human review gate.

### 6. Emit the handoff signal

After all artifacts pass the checks above, emit one line:

```text
__CE_TRIAL_DESIGN__ design_id=<id> engine=<name>@<version> frontier=<path> receipt=<path> sap=<path> status=<feasible|no-feasible-candidate|review-pending>
```

Use `review-pending` whenever a candidate is presented but the required statistical review is not recorded.

## Data boundary

The workflow should use aggregate design assumptions and operating characteristics. Do not place patient-level or row-level clinical data in the design package. Follow the project's approved restricted-data location if a specialized engine genuinely requires patient-level inputs; the frontier artifacts remain aggregate.

## References

@./references/design-contract.md

@./references/engine-adapters.md

@./references/design-spec.example.json

@./references/engine-results.example.csv

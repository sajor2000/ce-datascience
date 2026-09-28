# Design and normalized-result contract

## Design specification

`design-spec.json` uses `schema_version: 1`. The frontier builder requires:

- `design_id`: stable non-empty identifier
- `engine.name`: exactly `rpact` or `gsDesign`
- `engine.version`: exact expected package version
- `target.alpha`: overall type I error target on the scale emitted by the engine
- `target.power`: minimum acceptable achieved power
- `target.type1_error_tolerance`: explicit non-negative numerical tolerance, normally zero for exact calculations
- `endpoint`: endpoint type/name, estimand, effect scale, and null value
- `hypothesis`: superiority type, sidedness, and direction
- `design`: shared information unit and allocation ratio
- `candidates`: non-empty candidate grid with unique `scenario_id`/`id` pairs; each candidate declares its information rates, efficacy rule, futility rule and binding status, and exact engine arguments
- `scenarios`: non-empty array with unique `id` values
- `review`: statistician name when known and non-empty review status
- `simulation`: `null` for exact calculations or a complete algorithm/iterations/seed/Monte Carlo criterion object
- `unresolved`: array of unresolved constraints, which may be empty

The reviewable design package must also declare:

- endpoint, estimand, hypothesis, effect scale, null and alternative values
- sidedness and allocation ratio
- information times and number of analyses
- efficacy spending/boundary family
- futility rule, scale, and whether binding
- effect and nuisance-parameter scenarios with evidence provenance
- candidate grid and any exclusion rules
- simulation seed, iterations, and Monte Carlo criterion when simulation is used
- expected reviewer and unresolved clinical or operational constraints

The normalized result must contain exactly one row for every declared scenario/candidate pair. Candidate IDs not declared in the grid and missing pairs fail closed.

Do not use a zero tolerance to imply mathematical equality for simulated estimates. Instead specify a reviewable Monte Carlo decision rule and retain the uncertainty interval in the engine artifact.

## Normalized engine output

`engine-results.csv` contains one row per scenario/candidate pair and these exact columns:

| Column | Contract |
|---|---|
| `scenario_id` | Matches one declared scenario ID |
| `candidate_id` | Unique within the scenario |
| `engine` | Matches the pinned engine name exactly |
| `engine_version` | Matches the pinned package version exactly |
| `analyses` | Positive integer number of planned analyses |
| `achieved_power` | Engine-derived probability in `[0, 1]` |
| `type1_error` | Engine-derived probability in `[0, 1]` on the declared overall-alpha scale |
| `max_information` | Positive engine-derived maximum information, events, or sample size on one declared unit |
| `expected_information_null` | Positive engine-derived expectation under the null on the same unit |
| `expected_information_alt` | Positive engine-derived expectation under the scenario alternative on the same unit |

The design spec must name the information unit (`participants`, `events`, or a documented information scale). Never compare candidates whose columns use different units.

Do not substitute nominal alpha, requested power, maximum sample size, or hand-calculated averages for the engine-derived values. Preserve extra engine diagnostics in separate files because the normalized table is intentionally narrow.

## Feasibility and Pareto rule

A row is feasible only when:

```text
achieved_power >= target.power
type1_error <= target.alpha + target.type1_error_tolerance
```

Within each scenario, a feasible row is Pareto-efficient when no other feasible row is no worse on all three information objectives and strictly better on at least one. The script does not combine scenarios, weight objectives, rank clinical desirability, or choose a winner.

## Required retained artifacts

Keep the exact design spec, engine script, normalized results, complete engine log, R session information, machine-readable runtime provenance, CE evaluated results, frontier, receipt, and SAP handoff together under the design directory. The receipt hashes all five engine inputs plus runtime provenance. If any input changes, rerun the engine and frontier builder; do not edit the receipt hashes.

Use a new frontier output directory for every immutable run. The builder refuses an existing output directory and publishes the complete output directory atomically after all validation and writes succeed.

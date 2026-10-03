# Design and normalized-result contract

## Design specification

`design-spec.json` uses `schema_version: 1`. The frontier builder requires:

- `design_id`: stable non-empty identifier
- `engine.name`: exactly `rpact` or `gsDesign`
- `engine.version`: exact expected package version using the CSV-safe identifier grammar below
- `target.alpha`: overall type I error target on the scale emitted by the engine
- `target.power`: minimum acceptable achieved power
- `target.type1_error_tolerance`: explicit non-negative numerical tolerance, normally zero for exact calculations
- `endpoint`: endpoint type/name, estimand, effect scale, and null value
- `hypothesis`: superiority type, sidedness, and direction
- `design`: shared information unit and allocation ratio
- `design.arm_count`: exactly `2`
- `design.framework`: exactly `frequentist-group-sequential`
- `candidates`: non-empty candidate grid with unique `scenario_id`/`id` pairs; each identifier uses the CSV-safe grammar below, and each candidate declares its information rates, efficacy rule, futility rule and binding status, and exact engine arguments
- `scenarios`: non-empty array with unique CSV-safe `id` values
- `review`: explicit `statistician` value (`null` until named) and status of `pending`, `in_review`, or `completed`; completed review requires a named statistician and a non-empty evidence array
- `simulation`: required and `null` for exact calculations, or a complete algorithm/iterations/seed/Monte Carlo criterion object with `decision_rule: conservative_bounds`
- `unresolved`: array of unresolved constraints, which may be empty

CSV-bound scenario IDs, candidate IDs, and engine versions must match
`[A-Za-z0-9][A-Za-z0-9._+-]*`. Requiring an ASCII letter or digit first prevents spreadsheet
formula prefixes (`=`, `+`, `-`, or `@`) while retaining ordinary package-version and identifier
syntax.

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
| `power_lower_bound` | Empty for exact calculations; finite probability in `[0, 1]` for simulations |
| `type1_error_upper_bound` | Empty for exact calculations; finite probability in `[0, 1]` for simulations |

The design spec must name the information unit (`participants`, `events`, or a documented information scale). Never compare candidates whose columns use different units.

Do not substitute nominal alpha, requested power, maximum sample size, or hand-calculated averages for the engine-derived values. Preserve extra engine diagnostics in separate files because the normalized table is intentionally narrow.

## Feasibility and Pareto rule

A row is feasible only when:

```text
achieved_power >= target.power
type1_error <= target.alpha + target.type1_error_tolerance
```

For a simulated run, the supported `conservative_bounds` decision rule replaces the two point estimates in that comparison with `power_lower_bound` and `type1_error_upper_bound`. Missing bounds fail closed. Exact runs retain the point-estimate rule and require both bound cells to be empty.

Within each scenario, a feasible row is Pareto-efficient when no other feasible row is no worse on all three information objectives and strictly better on at least one. The script does not combine scenarios, weight objectives, rank clinical desirability, or choose a winner.

## Required retained artifacts

The frontier output directory contains immutable copies of the exact design spec, engine script, normalized results, complete engine log, R session information, and machine-readable runtime provenance, together with CE-evaluated results, frontier, receipt, and SAP handoff. The receipt hashes all six inputs. If any input changes, rerun the engine and frontier builder; do not edit the receipt hashes.

Use a new frontier output directory for every immutable run. The builder refuses an existing output directory and publishes the complete output directory atomically after all validation and writes succeed.

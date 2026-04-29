# PICO Templates by Design Type

The PICO frame is a starting point, not a constraint. Different study designs need different slot definitions; use the template that matches your `suggested_design`.

## Comparative interventional (RCT / target-trial emulation)

```yaml
pico:
  population:    "<inclusion criteria>; <setting>; <demographic constraints>; <time window>"
  intervention:  "<full specification of the intervention arm — drug + dose + route + duration, or device + protocol, or behavior + measurement>"
  comparator:    "<full specification of the comparator arm — placebo / standard of care / active comparator with same level of detail>"
  outcome:       "<primary outcome with timing>; <secondary outcomes if relevant>"
```

For target-trial emulation, additionally fill these slots so `/ce-cohort-build` can later instantiate them:

```yaml
target_trial:
  eligibility:           "<criteria at time-zero>"
  treatment_strategies:  "<arm A> vs <arm B>, fully specified"
  assignment_procedure:  "<how exposure was assigned in the data>; <known confounders>"
  follow_up_start:       "<time-zero anchor — exposure date, randomization date, etc.>"
  follow_up_end:         "<event, censor at study end, lost-to-followup>"
  outcome_ascertainment: "<source — claims, chart, registry — and adjudication if any>"
  causal_contrast:       "<intent-to-treat / per-protocol / both>"
```

## Observational cohort (non-causal / descriptive)

```yaml
pico:
  population:   "<inclusion>; <setting>; <time window>"
  exposure:     "<exposure or stratification variable>"
  comparator:   null  # descriptive studies have no comparator -- record null explicitly
  outcome:      "<primary outcome>"
```

`comparator: null` is the signal that the design is descriptive. Downstream skills (`/ce-power`, `/ce-checklist-match`) treat `null` differently from `"not applicable"` — null means descriptive, NA means missing.

## Case-control

```yaml
pico:
  population:        "<source population from which both cases and controls are drawn>"
  cases:             "<case definition + ascertainment>"
  controls:          "<control selection + matching>"
  exposure:          "<retrospectively measured exposure>"
  outcome:           "<the case-defining condition>"
  matching:          "<variables and ratio>"
```

## Diagnostic accuracy

```yaml
pico:
  population:           "<patients in whom the test would be applied>"
  index_test:           "<test under evaluation>; <threshold>"
  reference_standard:   "<gold standard>; <how applied>"
  outcome:              "<sensitivity, specificity, PPV, NPV with target precision>"
  blinding:             "<index test reading blinded to reference standard? and vice versa>"
```

## Prediction model (development / validation / impact)

```yaml
pico:
  population:               "<intended use population>"
  predictors:               "<full list, fully specified>"
  outcome:                  "<the predicted outcome>; <horizon>"
  intended_use:             "<screening, triage, prognostic, diagnostic, treatment-selection>"
  development_or_validation: "<one of>"
  performance_metrics:      "<discrimination + calibration + clinical utility>"
```

## Systematic review / meta-analysis (PICOS variant)

```yaml
picos:
  population:    "..."
  intervention:  "..."
  comparator:    "..."
  outcome:       "..."
  study_designs: "<RCT only, all observational, both>"
```

## Anti-patterns

- **Vague population** — "patients" is not a population. "Adult patients hospitalized with community-acquired pneumonia in US tertiary-care centers, 2018-2023" is.
- **Outcome without timing** — "mortality" is not an outcome. "30-day all-cause mortality" is.
- **Comparator silently elided** — "we will study X" with no comparator is descriptive, not comparative. Record `comparator: null` rather than pretending.
- **Population that is the outcome** — "patients with COVID who died" is not a study population, it is the outcome of a study population. Move it to `outcome` and define the population separately.

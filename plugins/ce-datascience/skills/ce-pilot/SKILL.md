---
name: ce-pilot
description: 'Run a pilot / feasibility / methods-development analysis as a self-contained sub-project, then produce a handoff that captures what generalizes to the main study and what was pilot-specific. Use when the question is "can this work?" rather than "what is the answer?", or when methods need to be validated before the SAP for the main study is locked.'
argument-hint: "[pilot name, e.g. ridge-vs-lasso-feasibility]"
---

# Pilot / Feasibility Run

A pilot is not a small main study. The point is to learn whether a method works, whether a data source is usable, or whether an effect is detectable in principle -- not to estimate the effect size for inference. The risk is that pilot results leak into the main study (via reused code paths, copied SAP language, or seen-the-result methodology). This skill keeps the pilot sandboxed and produces a structured handoff that says "here is what's transferable; here is what is pilot-only".

## When This Skill Activates

- Methods-development question ("which model converges on this kind of data?")
- Data-availability check ("can we get sufficient sample size from this registry?")
- Effect-size scouting for a power calculation (acceptable; output is N, not the estimate)
- A coauthor wants to try a new analytic approach without disturbing the main analysis
- Pre-registration not yet locked, but exploration is already valuable

## Prerequisites

- The pilot has a name (the argument)
- The user can articulate the pilot question in one sentence: "Does X work, given Y?"
- The pilot has its own SAP-lite (a 1-page methods sketch is fine; not the full SAP template)

## Core Workflow

### Step 1: Establish the sandbox

Create `pilots/<name>/` with:

- `pilots/<name>/SAP-lite.md` -- 1-page version (question, data source, method, decision rule, what we'll do with the answer)
- `pilots/<name>/analysis/` -- code lives here, NEVER touches the main `analysis/` tree
- `pilots/<name>/data-state.yaml` -- separate data-state, the pilot's wave is independent
- `pilots/<name>/.gitignore` for anything specific (renders, large outputs)

Add a marker `pilots/<name>/.ce-pilot` containing the timestamp and PI name; this marker is consumed by `ce-targets-pipeline-reviewer` and `ce-code-review` (phase=pilot) to refuse cross-contamination.

### Step 2: Pilot SAP-lite template

The SAP-lite is intentionally minimal:

```markdown
# Pilot: <name>

## Question
<one sentence>

## Data
Source: <registry / synthetic / public dataset>
N expected: <range>
Time window: <span>

## Method
<brief description>

## Decision rule
This pilot will inform: [ ] main-study power calculation
                        [ ] main-study method choice
                        [ ] main-study feasibility GO/NO-GO
                        [ ] main-study cohort definition

A "yes" looks like: <one sentence>
A "no" looks like: <one sentence>

## What is NOT transferable from this pilot
<the analyst lists, before running>:
- The specific effect size (will not be used in main-study power calc directly)
- ...
```

The "What is NOT transferable" section is filled BEFORE running, so the analyst commits to it before seeing results.

### Step 3: Run the pilot

`/ce-work` operates inside `pilots/<name>/analysis/`. The dispatch is the same as a main analysis except:

- `ce-code-review` runs with `phase:pilot` (refuses confirmatory inference, allows method comparison and descriptive stats)
- `data_wave_register` writes to `pilots/<name>/data-state.yaml`, not the main one
- `ce-compound` is NOT invoked at gate completion (pilot lessons go through the handoff, not into the main compounding stream)

### Step 4: Handoff document

When the analyst finishes the pilot, they invoke `/ce-pilot handoff <name>`. The skill produces `pilots/<name>/handoff.md`:

```markdown
# Pilot Handoff: <name>

## Pilot answered

<which decision-rule outcome fired>

## What transfers to the main study

| Item | Detail | Where it lands |
|------|--------|----------------|
| Method choice | <method> works on this data type | Main SAP-3.1 |
| Power assumption | N=<X> needed for <effect>, alpha 0.05, power 0.80 | Main SAP-2.5 |
| Code skeleton | <path> can be lifted to main analysis with these changes: <list> | analysis/ |

## What does NOT transfer

| Item | Reason |
|------|--------|
| The effect-size estimate | Pilot N too small for unbiased estimation |
| The specific outliers identified | Pilot data was a different cohort |
| The convergence-failure ZIP codes | Pilot-specific data quality issue |

## Compound-worthy lessons

(Use `/ce-compound` from the main project to file each, with `problem_type: methods_decision` or `data_quality_issue`. Each entry references this handoff.)

- <pattern that recurred and is worth filing>

## Code transfer checklist

- [ ] Method-selection code lifted to main `analysis/<file>`
- [ ] Pilot data-loading code NOT lifted (path / source differs)
- [ ] Pilot's hard-coded thresholds reviewed and either parameterized or replaced
- [ ] Main SAP updated with pilot-derived power calculation (`sap_amend` SAP-2.5)

## Sign-off

Filled by: <PI>
Date: <YYYY-MM-DD>
```

### Step 5: Cross-contamination check

Before completing the handoff, run `ce-code-review phase:pilot` against the main `analysis/` tree to verify no pilot code was accidentally imported. The review flags any reference from `analysis/` to `pilots/<name>/`.

## Pipeline mode

In `mode:headless`, the skill creates the sandbox and emits a structured signal `__CE_PILOT_INITIALIZED__ name=<name>`. Handoff in headless mode requires a tracker file path; the tool emits warnings but does not block on missing fields.

## What This Skill Does NOT Do

- **It does not run the pilot analysis.** Use `/ce-work` from inside the sandbox.
- **It does not unblind a blinded main study.** The pilot is on a separate cohort or synthetic data.
- **It does not bypass `ce-code-review`.** Pilot code is reviewed; reviewer dispatch just uses `phase:pilot`.
- **It does not auto-transfer code.** The handoff lists what the analyst should do; the actual lift is a separate `ce-work` task with explicit attribution.

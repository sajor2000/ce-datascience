# Designing an Optimization Spec Interactively

Use this when the input is a description of the goal rather than a spec file (SKILL.md Phase 0.2). Validate the finished spec against `references/optimize-spec-schema.yaml` before saving it.

## Contents

- Step 1: Analyze what can be measured
- Step 2: Choose `type: hard` or `type: judge`
- Step 3: Design the sampling strategy (judge only)
- Step 4: Design the rubric (judge only)
- Step 5: Fill the remaining fields
- Step 6: Save and present for approval

## Step 1: Analyze what can be measured

Read the project to find the current evaluation path: existing metric scripts, cross-validation or validation-split code, test-set handling, and anything that writes metrics to disk. Note where the held-out test set lives so it can go into `scope.immutable` and stay out of the loop (Data Science Guardrail 1).

## Step 2: Choose `type: hard` or `type: judge`

This is the most important spec decision.

**Use `type: hard`** when:
- The metric is a scalar with a clear "better" direction
- It is objectively measurable without human judgment
- Examples: cross-validated AUROC or Brier score, RMSE on validation folds, calibration slope, pipeline runtime, peak memory, test pass rate

**Use `type: judge`** when:
- Evaluating the output needs semantic understanding
- A human reviewer would need to look at results to say "this is better"
- Proxy metrics exist but can mislead (more clusters is not better clusters)
- The loop could produce degenerate solutions that look good on paper
- Examples: clustering quality, phenotype-definition coherence, search relevance, summarization quality, generated-report readability

If the target is qualitative, **strongly recommend `type: judge`** and explain that hard metrics alone optimize a proxy without checking quality. Present the three tiers:

- **Degenerate gates** (hard, cheap, run first): reject obviously broken output, such as "all items in one cluster" or "0% coverage". A failed gate skips the judge step.
- **LLM-as-judge** (the optimization target): sample outputs, score them against a rubric, aggregate.
- **Diagnostics** (logged, not gated): distributions, counts, timing that explain why a score moved.

If the user insists on `type: hard` for a qualitative target, proceed and warn that the run may optimize a misleading proxy.

## Step 3: Design the sampling strategy (judge only)

Ask: "What parts of the output space do you need to check quality on?" Walk through:

- What does one item look like? (a cluster, a result page, a summary)
- What are the natural size or quality strata?
- Where are failures most likely? (very large clusters may be degenerate merges; singletons may be missed groupings)
- What total sample size balances cost and signal? (default 30; 10 for a first run)

Example for clustering:

```yaml
stratification:
  - bucket: "top_by_size"     # largest clusters: check for degenerate mega-clusters
    count: 10
  - bucket: "mid_range"       # middle of the non-solo size range: representative quality
    count: 10
  - bucket: "small_clusters"  # 2-3 items: check that connections are real
    count: 10
singleton_sample: 15          # singletons: check for items that should have clustered
sample_seed: 42               # fixed so every experiment is judged on a comparable sample
```

Strata are domain-specific: "top-3 / 4-10 / tail" for search, "short / long / multi-topic documents" for summarization. When the goal involves coverage, sample singletons with the singleton rubric to catch missed groupings. Always set `sample_seed`.

## Step 4: Design the rubric (judge only)

A good rubric:
- Uses a 1-5 scale (or similar) with a concrete description per level
- Adds supplementary fields that diagnose problems (`distinct_topics`, `outlier_count`)
- Is specific enough that two judges would agree
- Does not assume bigger or more is better

Example:

```yaml
rubric: |
  Rate this cluster 1-5:
  - 5: All items clearly about the same issue/feature
  - 4: Strong theme, minor outliers
  - 3: Related but covers 2-3 sub-topics that could reasonably be split
  - 2: Weak connection, superficial similarity only
  - 1: Unrelated items grouped together
  Also report: distinct_topics (integer), outlier_count (integer)
```

## Step 5: Fill the remaining fields

Ask one decision-changing question at a time:

- Degenerate gates (e.g., `solo_pct <= 0.95` catches all-singletons; `max_cluster_size <= 500` catches mega-clusters; `n_features_used >= 1` catches empty models)
- The measurement command, and confirmation that it evaluates on cross-validation folds or a validation split, never the test set
- `scope.mutable` and `scope.immutable` (the harness, evaluation data, split definitions, and test set are immutable)
- Seeds: CV split seed, model-initialization seed, and judge `sample_seed`, recorded in the spec and held fixed for the whole run
- Constraints and dependencies
- First run: `execution.mode: serial`, `execution.max_concurrent: 1`, `stopping.max_iterations: 4`, `stopping.max_hours: 1`
- Spend: for `type: judge`, `sample_size: 10`, `batch_size: 5`, `max_total_cost_usd: 5` until the rubric and harness are trusted; optionally `stopping.max_total_cost_usd` to cap the whole run

## Step 6: Save and present for approval

1. Write the draft spec to `.context/ce-datascience/ce-optimize/<spec-name>/spec.yaml`
2. Present it to the user for approval; apply any requested changes to the file
3. After approval, read the file back and confirm it parses and matches what was agreed (CP-0), then continue to Phase 0.3

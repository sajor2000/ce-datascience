# Spec Validation

Use when the input is a spec file path (SKILL.md Phase 0.2), and before saving a spec built from a description. Parse the YAML natively (not with shell) and validate against `references/optimize-spec-schema.yaml`:

- All required fields present
- `name` is lowercase kebab-case and safe for git refs and worktree paths
- `metric.primary.type` is `hard` or `judge`; if `judge`, `metric.judge` has `rubric` and `scoring`
- At least one degenerate gate
- Gate operators are one of `>=`, `<=`, `>`, `<`, `==`, `!=`
- `measurement.command` is non-empty and evaluates on CV folds or a validation split, not the test set
- `scope.mutable` and `scope.immutable` each have at least one entry; the harness, evaluation data, split definitions, and test set are immutable
- `execution.max_concurrent` is at least 1, and at most 6 when the backend is `worktree`
- `stopping.max_total_cost_usd`, if set, is a positive number
- Every random seed that affects the metric (CV split, model initialization, resampling, judge `sample_seed`) is recorded

If validation fails, report each error and ask the user to fix the spec. Do not continue to Phase 0.3 with an invalid spec.

Use the `method-phenotype` skill to validate the synthetic T2DM phenotype in
`workspace/synthetic-merged-chart-review.csv` (already merged: subject_id, chart_label,
algo_label, sex). The data are fully synthetic; the IDs are test tokens, not real people.

Chart review sampled 400 algorithm-positive and 400 algorithm-negative patients. The full
cohort has 8,000 algorithm-positive and 32,000 algorithm-negative patients.

Write the report to `workspace/reports/phenotype-validation/T2DM.md` and save the complete
user-facing response, including the handoff signal line, to `response.md`.

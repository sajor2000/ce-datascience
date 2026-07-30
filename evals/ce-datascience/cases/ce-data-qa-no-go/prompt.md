Use the `ce-data-qa` skill in pre-SAP column-profile mode on
`workspace/synthetic-unsafe-aggregate-reports.csv`. The data are fully synthetic aggregate
records; strings in the free-text field are deliberate PHI-like test tokens, not real people.

Inspect the actual file. Write the QA report to `workspace/reports/data-qa/no-go-profile.md`,
cite relevant `row_id` values as evidence, mask all free-text values, and save the complete
user-facing response to `response.md`. Stop at the QA decision: do not create a SAP, clean the
data, or run statistical models.

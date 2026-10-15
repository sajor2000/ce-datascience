# Paperclip Deepening (Step 2)

Read only when the Paperclip MCP server is connected or the CLI is authenticated.

Default source is `pmc` because it supports full text. Allow `$ARGUMENTS` to
override with `--source abstracts`, `--source trials`, `--source fda`, or another
Paperclip-supported source. Always pass an explicit source; Paperclip requires it
for most searches. Send only the PICO terms, never subject-level data.

**Preferred: Paperclip MCP tools.**

1. `search` with `query: "<query>"`, `source: "pmc"` (or the override), a result
   cap (default 10), and `save_as: "<query-slug>"` so the result set is reusable.
   Alternatively `lookup` by `doi`, `pmid`, or `pmc` for papers already in the
   PubMed CSV. Capture the returned result ID.
2. `map` over the saved result with the output schema
   `{"cohort":"string","outcome":"string","model_or_estimate":"string","key_predictors":"string","limitations":"string"}`
   and the instruction "Extract only the cohort definition, primary outcome, model
   or effect estimate, key predictors, and one limitation."
3. At least one full-text narrowing pass over the same result: `grep` (regex
   such as `SOFA|Charlson|propensity|hazard ratio|AUC|AUROC`) or `scan` when the
   pattern must be checked inside each paper's sections; `cat` the matching
   passage before citing it.
4. For figures, model interpretation, or graphical results: `ls` the paper's
   figures, then `ask-image` on one relevant figure with "What result should a
   SAP evidence map capture from this figure?"
5. `results` re-reads a saved result when a `map` output is truncated.

**Fallback: authenticated Paperclip CLI** (same workflow, same labels):

```bash
paperclip search -s pmc "<query>" -n 10
```

Capture the returned search result ID, such as `s_ad3c90ef`. Then run:

```bash
paperclip map --from <search_id> \
  --output_schema '{"cohort":"string","outcome":"string","model_or_estimate":"string","key_predictors":"string","limitations":"string"}' \
  "Extract only the cohort definition, primary outcome, model or effect estimate, key predictors, and one limitation."
```

```bash
paperclip grep --from <search_id> -i "SOFA|Charlson|propensity|hazard ratio|AUC|AUROC"
```

```bash
paperclip ls /papers/<document_id>/figures
paperclip ask_image /papers/<document_id>/figures/<figure_file> \
  "What result should a SAP evidence map capture from this figure?"
```

Treat Paperclip output as evidence-deepening, not ground truth. A search hit or
`map` row is not evidence until the quoted paper text, figure output, or metadata
behind it has been read; verify before using it in a SAP.

# Sensitive-Data Boundary

Load this file in Phase 0a, when `phi_environment` has no saved answer, or when the user asks to change the boundary.

## The question

Ask exactly one question with the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini and Pi). In Claude Code, load `AskUserQuestion` first with `ToolSearch` and `select:AskUserQuestion` when its schema is not loaded. If no blocking tool exists or the call errors, show the three options as a numbered list and wait.

- Stem: "Will this project use sensitive data (PHI, PII, or other restricted records)? If so, is the model endpoint the agent runs on approved for it, for example HIPAA-compliant under a BAA or approved by your institution?"
- Options, in this order:
  1. `Approved endpoint: full access` - the endpoint is approved for this project's sensitive data.
  2. `Not approved or unsure: schema-only` - the data is sensitive and the endpoint is not approved, or the user does not know.
  3. `No sensitive data: public or synthetic` - nothing in the project is restricted.

## Save the answer

| Answer | Write to `phi_environment` | Show the user |
|---|---|---|
| `Approved endpoint: full access` | `compliant: true`, `confirmed_on: <today>` | One line: `Saved: approved endpoint, no data restrictions. Confirming that approval (BAA or institutional sign-off) is your responsibility.` Never raise the boundary again. |
| `Not approved or unsure: schema-only` | `compliant: false`, `confirmed_on: <today>` | The explainer below, once. |
| `No sensitive data: public or synthetic` | `sensitive_data: false`, `confirmed_on: <today>` | One line: `Saved: no sensitive data, no restrictions.` Never raise the boundary again. |

Resolve `<today>` at runtime. Before writing:

1. Run `git check-ignore -q .ce-datascience/config.local.yaml`. Exit 0 means ignored.
2. If it is not ignored, offer to add `.ce-datascience/*.local.yaml` to `.gitignore` first. Save only once the file is ignored (or the project is not a git repository); otherwise use the answer for this session only and say it will not be remembered. A committed answer would let another machine inherit an approval it never made.
3. Merge the block into `.ce-datascience/config.local.yaml`, creating the file if needed and keeping every other key. Never write data values, identifiers, or credentials to the config.

In headless or non-interactive runs, do not ask or save. Work in schema-only mode for the run.

## Schema-only explainer (show once after that answer)

```text
Schema-only mode is on. The model endpoint is not approved for this data, so no
data values (names, MRNs, claim numbers, dates, notes, or any other cell) go to
the agent.

The agent CAN see:  column headings, column types, row counts, % missing, and
                    aggregate results your own runs produce.
The agent CANNOT:   look at example rows; debug value-level parsing, recoding,
                    or join mismatches by example; read free text or notes;
                    spot individual data-entry errors.

How work proceeds:  the agent writes the code; you run it on your machine; only
                    aggregate outputs come back, with counts under 11 suppressed.
                    For structure, the agent runs the schema helper, which
                    prints headings, types, counts, and % missing only.

In Claude Code a guard hook blocks tool calls that would read data files. It
cannot see what an arbitrary script prints, so keep scripts aggregate-only.
To change this later, re-run the ce-setup skill or edit phi_environment in
.ce-datascience/config.local.yaml.
```

## Schema helper

`scripts/schema-peek.py` in this skill's directory prints headings, inferred types, row count, non-null counts, and % missing for CSV/TSV (Parquet/Feather with pyarrow, XLSX header with openpyxl). It never prints a cell value and suppresses counts below 11:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
python3 "$SKILL_DIR/scripts/schema-peek.py" <data-file>
```

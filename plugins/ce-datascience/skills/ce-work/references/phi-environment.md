# Sensitive-Data Boundary Gate

The `ce-setup` skill normally records the boundary. Reuse the saved answer; ask only when nothing is saved.

## 1. Read the saved answer

Read `<repo-root>/.ce-datascience/config.local.yaml` with the native file-read tool and look for:

```yaml
phi_environment:
  compliant: true          # true = endpoint approved; false = schema-only
  # sensitive_data: false  # public or synthetic data only
  confirmed_on: 2026-10-10 # date the user answered
```

| Saved value | Action |
|---|---|
| `compliant: true` or `sensitive_data: false` | Unrestricted. Proceed silently: no reminder, banner, or question about the boundary for the rest of the session. Pass `PHI authorization: confirmed` to sub-agents that take the marker. |
| `compliant: false` | Schema-only mode (section 4). State it in one line the first time it changes what the agent does, then not again. |
| missing, empty, or unreadable | Go to step 2. |

Ask again, and overwrite the saved value, only when the user says the model endpoint or data has changed, or asks to reset it.

## 2. Ask once (interactive mode only)

Ask exactly one question with the platform's blocking question tool (`AskUserQuestion` in Claude Code, loaded with `ToolSearch` `select:AskUserQuestion` when needed; `request_user_input` in Codex; `ask_user` in Gemini and Pi). If no blocking tool exists or the call errors, show the options as a numbered list and wait.

- Question: "Will this project use sensitive data (PHI, PII, or other restricted records)? If so, is the model endpoint approved for it?"
- Options: `Approved endpoint: full access`, `Not approved or unsure: schema-only`, `No sensitive data: public or synthetic`

Map them to `compliant: true`, `compliant: false`, and `sensitive_data: false`. For `Approved endpoint: full access`, add one line that confirming the approval is the user's responsibility, then never raise it again.

In agent, autofix, report-only, or headless mode, do not ask, wait, or write the config. Use `PHI authorization: not confirmed` and work in schema-only mode.

## 3. Save the answer

1. Check that the config file is gitignored: `git check-ignore -q .ce-datascience/config.local.yaml`. Exit 0 means ignored.
2. If it is ignored (or the project is not a git repository), merge the `phi_environment` block into `.ce-datascience/config.local.yaml`, creating the directory and file if needed. Keep every other key unchanged. Set `confirmed_on` to today's date, resolved at runtime.
3. If it is not ignored, do not save. A committed answer would let another machine inherit an approval it never made. Use the answer for this session only and tell the user to add `.ce-datascience/*.local.yaml` to `.gitignore` (or run the `ce-setup` skill) so it can be remembered.
4. Confirm in one line, for example: `Saved: schema-only mode (.ce-datascience/config.local.yaml). Re-run ce-setup or edit phi_environment to change it.`

## 4. Schema-only mode

- Never read, grep, print, or paste data-file contents (names, MRNs, claim numbers, dates, notes, or any cell value) into the conversation. Use file names and column headings only.
- For structure, run the bundled schema helper. It prints headings, inferred types, row count, non-null count, and % missing, never a value, and suppresses counts below 11:

  ```bash
  SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
  python3 "$SKILL_DIR/scripts/schema-peek.py" <data-file>
  ```

- Write analysis code for the user to run locally. Scripts the agent runs must print only aggregates (counts, rates, model estimates) with cells under 11 suppressed, never rows, `head()`, examples, or distinct values.
- When a task needs value-level inspection (debugging a parse, a recode, or a join mismatch by example), say so, and give the user a script to run and summarize instead.
- In Claude Code, a guard hook denies tool calls that would read data files. It cannot see what a script prints, so these rules still apply.

## Always

The config records a decision only; never write data values, identifiers, or credentials to it. In every mode, never commit or persist patient-level data to Git, issues, or public exports. This is a repository rule, not an endpoint rule, and needs no prompt.

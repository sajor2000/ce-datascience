# PHI Environment Gate

Ask once whether this environment may handle PHI, save the answer in the project's machine-local config, and reuse it on later runs instead of asking again.

## 1. Read the saved answer

Read `<repo-root>/.ce-datascience/config.local.yaml` with the native file-read tool and look for:

```yaml
phi_environment:
  compliant: true          # true = yes, false = no
  confirmed_on: 2026-10-10 # date the user answered
```

| Saved value | Action |
|---|---|
| `compliant: true` | Proceed without asking. Record `PHI authorization: confirmed (saved <confirmed_on>)` in the run notes. |
| `compliant: false` | Do not open patient-level data or outputs. Work only from schemas, code, metadata, synthetic fixtures the user requested, and reviewed aggregates. Say so in one line. |
| missing, empty, or unreadable | Go to step 2. |

Ask again, and overwrite the saved value, only when the user says the data environment or the model endpoint has changed, or asks to reset it.

## 2. Ask once (interactive mode only)

Ask exactly one question with the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini and Pi). In Claude Code, load it first with `ToolSearch` and `select:AskUserQuestion` when its schema is not loaded. If no blocking tool exists or the call errors, show the two options as a numbered list in chat and wait.

- Question: "Are both this data environment and the active model endpoint compliant for PHI/PII?"
- Options: "Yes, both are compliant" and "No or unsure"

Treat "No or unsure" as `compliant: false`.

In agent, autofix, report-only, or headless mode, do not ask, wait, or write the config. Use `PHI authorization: not confirmed` and continue only from paths, code, schemas, metadata, and reviewed aggregates.

## 3. Save the answer

1. Check that the config file is gitignored: `git check-ignore -q .ce-datascience/config.local.yaml`. Exit 0 means ignored.
2. If it is ignored (or the project is not a git repository), write or merge the `phi_environment` block above into `.ce-datascience/config.local.yaml`, creating the directory and file if needed. Keep every other key unchanged. Set `confirmed_on` to today's date, resolved at runtime.
3. If it is not ignored, do not save. A committed answer would let another machine inherit "yes" without its own approval. Use the answer for this session only and tell the user to add `.ce-datascience/config.local.yaml` to `.gitignore` (or run the `ce-setup` skill) so the answer can be remembered.
4. Confirm in one line, for example: `Saved: PHI-compliant environment = yes (.ce-datascience/config.local.yaml). Edit or delete phi_environment to change it.`

## Always

The saved answer records an approval decision only; never write patient data, identifiers, or credentials to the config. Whatever the answer, do not reproduce PHI in responses or persist it in Git, logs, screenshots, issues, or unrestricted exports, and keep small-cell suppression and the output boundaries of the active project profile.

---
name: ce-language-detect
description: "Detect R, Python, or mixed-language data science signals from repo files and emit a machine-readable language handoff."
argument-hint: "[optional: --off]"
---

# Repository Language Detection


## Skill Value

- **Problem it solves:** Setup and workflow routing need repo evidence before asking users about language preference.
- **Use when:** Another skill needs language evidence, or the user asks what stack the repo appears to use.
- **Output:** __CE_LANG__ with primary, secondary, and source fields.
- **Ask only if:** No user question normally; detection is evidence-only.
- **Do not do:** Do not treat detection as final user preference when later IDE or explicit user choices narrow the stack.
- **Interaction:** No user question normally; proceed from the provided inputs and local evidence.

Detects whether the current repository is primarily `python`, `r`, `both`, or `unknown` using file-system and code-pattern signals only. Do not ask the user to choose a language in this skill. SAS/Stata signals do not become `primary` values; when they dominate, emit `primary=unknown` and recommend `/ce-sas-stata-assess`.

## When this skill activates

- CLIF profile is active (`__CE_CLIF__ active=true`) and downstream skills need language-specific recipes
- `/ce-setup` is running and needs a language default without asking
- A task requires selecting Python vs R templates and the language is not obvious
- Manual invocation: `/ce-language-detect`

## Rule source

Read `references/detection-rules.md` and apply the scoring table exactly.

## Core workflow

### Step 1: Collect repository signals

Use repo signals only (files, directories, lockfiles, and source patterns). Do not prompt the user.

### Step 2: Score and classify

Apply the detection rules and produce:

- `primary`: `python` | `r` | `both` | `unknown`
- `secondary`: `python` | `r` | `null`
- `source`: `auto` (normal), `cached` (fallback when repo signals cannot be read), or `manual` (only when the user explicitly forced a language elsewhere)

### Step 3: Emit canonical handoff envelope

Always emit:

```
__CE_LANG__ primary=<python|r|both|unknown> secondary=<python|r|null> source=<auto|cached|manual>
```

Also print one concise banner:

```
[ce-language-detect] primary=<...> secondary=<...> source=<...>
```

### Step 4: Fallback behavior

If no reliable signals are found:

- Use `primary=unknown secondary=null source=auto`.
- If a cached value exists in `.ce-datascience/config.local.yaml` under `language_detect.primary`, reuse it as `source=cached`.
- Never ask the user a language question in this skill.

## Consumers

`ce-setup`, `ce-clif`, `ce-cohort-build`, `ce-data-qa`, `ce-work`, and `ce-plan` can consume `__CE_LANG__` to route language-specific defaults and references.

## References

@./references/detection-rules.md — Signal weights, thresholds, and tie-break rules

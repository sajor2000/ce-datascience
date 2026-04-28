---
name: ce-freeze
description: 'Freeze an analysis at submission time. Tags the current commit, snapshots SAP version, locked-wave hashes, environment lock files, and rendered manuscript artifacts into a single submission archive so the response-to-reviewers package can reference the exact state that produced the submitted paper. Use when submitting to a journal or transferring to a regulator.'
argument-hint: "[journal name or submission tag, e.g. NEJM-2026-04]"
---

# Submission Freeze

Submission day is the moment when the paper, the SAP, the analysis code, and the data wave must all be recorded as a single coherent artifact. Reviewer comments may arrive months later; the response-to-reviewers package must be able to say "the version of code that produced Figure 2 of the original submission is at commit `<sha>`, used SAP version `<v>`, and ran against locked wave `<id>`". This skill creates that archive.

## When This Skill Activates

- Manuscript is ready to submit to a journal (initial submission)
- Pre-print is being posted (medRxiv, bioRxiv, arXiv)
- Submission to a regulator (FDA, EMA, NIH study section)
- Transfer of analysis to a coauthor or audit
- Any moment when "this version, exactly" needs to be recoverable later

## Prerequisites

- The current branch builds and tests pass (`bun test` or analysis pipeline equivalent)
- The SAP is at a clean version (no uncommitted amendments)
- The data wave used by the analysis is `locked` in `.ce-datascience/data-state.yaml`
- Manuscript artifacts (PDF, .docx, supplementary materials) exist at known paths
- `git status` is clean (no uncommitted changes)

If any prerequisite fails, refuse and explain which one.

## Core Workflow

### Step 1: Resolve submission tag

Use the argument as the tag. If empty, prompt for one. Format: `<venue>-<YYYY-MM>` or `<venue>-<YYYY-MM>-<round>` for revisions.

### Step 2: Run pre-freeze checks

Verify each prerequisite. Specifically:

- `git status --porcelain` returns empty
- `.ce-datascience/data-state.yaml` has at least one `locked` wave; record its `extract_id` and `hash_sha256`
- `analysis/sap.md` exists, extract its `Version:` line; check `sap-amendments.md` log is current
- The manuscript file exists at the path the user names (default: `manuscript/main.qmd` rendered to `manuscript/main.pdf`)
- The reproducibility lock file exists (`renv.lock`, `requirements.txt`, `pyproject.toml`/`uv.lock`, `pixi.lock`)

If any check fails, list the failures and stop without writing any artifacts.

### Step 3: Compute the freeze manifest

Build `submissions/<tag>/manifest.yaml` containing:

```yaml
submission_tag: <tag>
frozen_at: <ISO timestamp>
frozen_by: <git config user.name>
git:
  sha: <full sha>
  branch: <branch name>
  remote_url: <origin URL>
sap:
  path: analysis/sap.md
  version: <version line value>
  amendments_log_sha256: <hash>
data:
  current_wave: <extract_id>
  hash_sha256: <wave hash>
  locked_at: <wave lock timestamp>
environment:
  lock_files: [renv.lock, requirements.txt, ...]
  lock_files_sha256: { <file>: <hash>, ... }
manuscript:
  source_path: <path>
  rendered_path: <path>
  rendered_sha256: <hash>
  word_count: <int>
artifacts:
  figures: [paths]
  tables: [paths]
  supplementary: [paths]
notes: <free-form text from user>
```

### Step 4: Tag the commit

Create an annotated git tag `submission/<tag>`:

```
git tag -a submission/<tag> -m "Submission freeze: <tag> (SAP <version>, wave <id>)"
```

Do not push; that is the user's decision.

### Step 5: Write the archive

Copy (do not move) the following into `submissions/<tag>/`:

- `manifest.yaml`
- A snapshot of `analysis/sap.md` and `analysis/sap-amendments.md`
- The rendered manuscript and all figures/tables it cites
- A pointer file `data/wave-<extract_id>.json` containing the wave's hash and location (NEVER the data itself)
- The environment lock files

Then write `submissions/<tag>/RECOVER.md`:

```
# Recovering this submission

To exactly reproduce this submission:

1. Check out the tagged commit:
   git checkout submission/<tag>
2. Restore the locked environment:
   <renv::restore() | uv sync | pixi install | etc.>
3. Verify the data wave is still at the hash recorded in manifest.yaml.
   If not, the data was modified after submission -- consult sap-amendments.md.
4. Render the manuscript:
   <quarto render manuscript/main.qmd | jupyter nbconvert | etc.>
5. Compare the rendered SHA-256 against manuscript.rendered_sha256 in manifest.yaml.
```

### Step 6: Print summary

```
Frozen <tag> at <commit short sha>
  SAP version:  <v>
  Data wave:    <id> (sha256: <16 chars>...)
  Manuscript:   <path>
  Tag:          submission/<tag>

Archive: submissions/<tag>/
Recovery: submissions/<tag>/RECOVER.md

Next:
- Push the tag: git push origin submission/<tag>
- Submit the manuscript file: submissions/<tag>/<rendered>.pdf
- After review feedback arrives, run /ce-revise with this tag.
```

## Pipeline mode

When invoked from a CI workflow with `mode:headless` or `disable-model-invocation`, skip the prompt for `notes` and write `notes: '(unset)'` rather than blocking.

## What This Skill Does NOT Do

- **It does not push the tag.** The user owns the push decision; tags can be amended locally.
- **It does not copy the data.** PHI must never leave its `data_root`. Only the wave hash and location are recorded.
- **It does not modify the analysis.** The freeze is read-only against working tree state.
- **It does not run the analysis.** The user re-runs from the tag if they want byte-identical recompute (RECOVER.md walks them through it).

## References

@./references/manifest-schema.yaml

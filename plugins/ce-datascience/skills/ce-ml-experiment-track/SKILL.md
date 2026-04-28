---
name: ce-ml-experiment-track
description: 'Wire up ML experiment tracking with mlflow, wandb, or dvc so every model run logs training data hash, hyperparams, metrics, model weights, and a study-id link. Generates the boilerplate, configures the tracking backend, and writes a run-log YAML schema for offline tracking when network not available. Use at the start of an ML project and after the first uncontrolled experimentation phase, before "real" runs that will appear in a manuscript.'
argument-hint: "[--backend mlflow|wandb|dvc|offline, --project name]"
---

# ML Experiment Tracking Setup

Most ML papers in biomedicine are unreproducible because runs are not tracked. By the time the analyst writes the manuscript, "the version that got 0.89 AUC" is on no disk, with no record of hyperparameters or training-data hash. This skill wires tracking from day 1.

## When this skill activates

- New ML project (immediately after `/ce-cohort-build` and before model training)
- Mid-project transition from "exploratory" to "manuscript-bound" runs
- After `ce-data-leakage-reviewer` flagged irreproducible eval
- Manual: `/ce-ml-experiment-track --backend mlflow --project sepsis-risk`

## Prerequisites

- A Python or R ML project (most modern frameworks have tracking integrations)
- For mlflow: pip-installed; tracking-server URL OR local `mlruns/` directory
- For wandb: API key in `~/.netrc` or env; project quota
- For dvc: dvc-installed; remote configured
- For offline: just file-system writable

## Core workflow

### Step 1: Pick the backend

| Backend | When to pick |
|---------|--------------|
| **mlflow** | Self-hostable, file or DB backend, multi-language (Python + R + Java). Default for most academic settings |
| **wandb** | SaaS-first, great UI, free for academia, requires network. Pick when sharing with collaborators in real time |
| **dvc** | Git-native, versions data + model artifacts together. Pick for dataset-heavy projects with strict reproducibility |
| **offline** | YAML run logs in a `runs/` folder, no network, no UI. Pick when working on air-gapped or PHI-restricted machines |

If `--backend` not passed, infer from existing config (presence of `mlflow`, `wandb`, `.dvc/`); else prompt.

### Step 2: Generate boilerplate

Write `analysis/ml/tracking.py` (or `tracking.R`) with backend-specific init code:

**mlflow example:**

```python
import mlflow
import hashlib
from pathlib import Path

def init_run(experiment="sepsis-risk", run_name=None):
    mlflow.set_tracking_uri("file:./mlruns")  # or http://tracking-server:5000
    mlflow.set_experiment(experiment)
    run = mlflow.start_run(run_name=run_name)
    # Always log data hash
    train_hash = hashlib.sha256(Path("data/train.parquet").read_bytes()).hexdigest()[:16]
    mlflow.log_param("train_data_sha", train_hash)
    mlflow.log_param("git_sha", _git_sha())
    mlflow.log_param("study_id", _study_id())
    return run
```

### Step 3: Define the required-log schema

Write `analysis/ml/run-schema.yaml` -- the minimum fields every run must log:

```yaml
required:
  params:
    - train_data_sha
    - test_data_sha
    - git_sha
    - study_id
    - random_seed
    - split_strategy   # group / temporal / random
  metrics:
    - auc_internal
    - auc_external (if external set exists)
    - brier_score
    - calibration_intercept
    - calibration_slope
    - n_train
    - n_test
  artifacts:
    - model.pkl (or equivalent)
    - eval-results.json
    - calibration-plot.png
    - feature-importance.csv (or shap_values.npz)
recommended:
  params:
    - hyperparam_search_strategy
    - model_class
  metrics:
    - subgroup_auc.<subgroup>
    - decision_curve.net_benefit_at_<threshold>
```

A run that does not log all required fields → not eligible for manuscript inclusion. This is the discipline.

### Step 4: Write the linkage to the SAP

Add to `analysis/sap.md`:

> "All ML runs are tracked via {{ backend }} at {{ uri }}. The run-id of the final model reported in the manuscript is logged in `analysis/ml/manuscript-run.txt` and committed alongside the SAP."

### Step 5: Provide the run-log fallback

For any backend, also write `runs/<run-id>.yaml` -- a YAML mirror of the tracked run. This way even if the tracking server is lost, the local repo has a record. `runs/` is committed to git.

```yaml
run_id: <uuid>
started: <ISO>
completed: <ISO>
backend: mlflow
backend_run_id: <mlflow run id>
params:
  train_data_sha: ...
  ...
metrics:
  auc_internal: 0.84
  ...
artifacts:
  - mlruns/.../model.pkl
study_id: <id>
```

### Step 6: Emit signal

`__CE_ML_TRACK__ backend=<name> uri=<uri> schema=<path>` so subsequent skills know tracking exists.

## What this skill does NOT do

- Does not train models (use `/ce-work` and write training scripts that call into the tracker)
- Does not enforce schema at training-time -- the discipline is the analyst's. The reviewer agent (eventually) checks runs/*.yaml against schema
- Does not version the data itself beyond hashing (use DVC for data versioning)
- Does not push runs to a public registry

## References

@./references/backends-comparison.md

@./references/run-log-schema.yaml

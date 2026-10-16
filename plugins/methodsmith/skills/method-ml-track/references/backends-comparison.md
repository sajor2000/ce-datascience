# Tracking Backends Comparison

| Feature | mlflow | wandb | dvc | offline (YAML) |
|---------|--------|-------|-----|----------------|
| Self-hostable | yes | partial (paid) | yes | yes (local) |
| Free for academia | yes | yes | yes | yes |
| Requires network | no (local file backend) | yes | no (local remote) | no |
| UI | built-in | best-in-class | minimal (CLI) | none |
| Multi-language | Python, R, Java, Scala | Python primarily | Python, anything via CLI | anything |
| Data versioning | weak (artifact log) | weak | strong (DVC files in git) | none |
| Model versioning | yes (model registry) | yes (registry) | yes (DVC files) | manual |
| Search / compare runs | yes | yes | no | manual |
| Suitable for PHI | yes (self-hosted, no telemetry) | only with enterprise + BAA | yes | yes |
| Setup time | 5 min (file mode) | 2 min | 15 min | 0 |

## Recommendation by setting

- **Solo academic, local laptop, possibly PHI:** mlflow file backend OR offline YAML
- **Lab with shared dev server:** mlflow with remote tracking server (Postgres + S3)
- **Multi-collaborator manuscript, no PHI:** wandb (best UI for collab review)
- **Heavy reproducibility needs (FDA submission, regulatory):** dvc + mlflow (data versioning + run tracking)
- **Air-gapped (clinical workstation):** offline YAML; sync runs/ folder when off the air-gap

## Common failure modes

- mlflow with sqlite backend on a mounted network drive → corrupts; use Postgres for shared
- wandb sweep with same name across users → runs collide; use entity/project namespacing
- dvc with `cache.shared = group` on NFS → permission errors; use `auto_stage = true` with care
- offline YAML never committed → defeats the purpose; add `git add runs/` to the training script's exit hook

## Migration

If switching backends mid-project, write the manifest of completed runs as YAML first (the offline-style backup), then replay into the new backend with `mlflow.log_run(...)` or wandb's import API. Keep the original run IDs cross-referenced.

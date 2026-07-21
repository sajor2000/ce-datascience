# Profile inference contract

Inspect repository evidence before asking a setup question. Each inferred field
has a `value`, `confidence`, and short `evidence` list.

| Field | High-confidence evidence | Otherwise |
|---|---|---|
| Language | language detector has one primary language | Ask only when unknown or materially conflicted |
| IDE/reporting | notebook kernels, `.Rproj`, `.vscode`, `.qmd`, `.Rmd`, Marimo imports | Leave unset; do not guess a preference |
| Environment | `uv.lock`, `poetry.lock`, `renv.lock`, `environment.yml`, or `.venv` | Leave unset |
| Libraries | lockfile or imports in active `src/`, `R/`, `code/`, or `analysis/` paths | Leave unset |
| Storage | verified connection, SQL models, Parquet files, or Fabric project markers | Ask one storage question only when an analysis needs it |
| Data domain | CLIF, OMOP, claims, bioinformatics, generic EHR, or generic data signals | Report `generic-data`; do not claim a biomedical source |

Use `high` only for direct project evidence, `medium` for multiple indirect
signals, and `low` for a single weak signal. Existing project configuration is
user-confirmed evidence and takes precedence unless it conflicts with an
explicit current request.

Emit a concise review card:

```text
Detected profile
  Language: Python (high: pyproject.toml, analysis/model.py)
  Environment: uv (high: uv.lock)
  Reporting: Jupyter (high: analysis.ipynb)
  Storage: Parquet (medium: cohort.parquet)
  Data domain: generic EHR (medium: cohort + encounter fields)

Choose: Continue with this profile | Adjust a field | Full survey
```

Do not write this evidence block as a required configuration schema. When it is
useful for a later workflow, save the optional `stack_profile.inference` map;
older configuration without that map remains valid.

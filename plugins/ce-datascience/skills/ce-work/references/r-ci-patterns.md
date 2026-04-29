# R CI Patterns

Reference guide for continuous integration with R projects. Load when setting up CI/CD for R analysis projects or when the shipping workflow detects R test infrastructure.

---

## GitHub Actions with r-lib/actions

The `r-lib/actions` family provides idiomatic GitHub Actions for R. Use these as the baseline for any R project CI.

### Minimal R + renv CI

```yaml
name: R CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-r@v2
        with:
          r-version: '4.4'
          use-public-rspm: true

      - uses: r-lib/actions/setup-renv@v2

      - name: Run tests
        run: |
          source("tests/testthat.R")
        shell: Rscript {0}

      - name: Lint
        run: |
          install.packages("lintr")
          lintr::lint_dir("R")
        shell: Rscript {0}
```

Key points:
- `use-public-rspm: true` uses Posit Package Manager for faster, deterministic CRAN snapshot resolution
- `setup-renv@v2` automatically runs `renv::restore()` from the committed `renv.lock`
- Shell `Rscript {0}` ensures R runs the file directly

### R Package CI (R CMD check)

```yaml
name: R CMD check

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    strategy:
      matrix:
        r-version: ['4.3', '4.4']
        os: [ubuntu-latest, macos-latest, windows-latest]
        exclude:
          - os: windows-latest
            r-version: '4.3'
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-r@v2
        with:
          r-version: ${{ matrix.r-version }}
          use-public-rspm: true

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: |
            any::rcmdcheck
            any::lintr

      - uses: r-lib/actions/check-r-package@v2
        with:
          args: 'c("--no-manual", "--as-cran")'
          error-on: '"warning"'

      - name: Lint
        run: lintr::lint_dir("R")
        shell: Rscript {0}
```

### targets Pipeline CI

```yaml
name: targets check

on:
  push:
    paths:
      - 'R/**'
      - '_targets.R'
      - 'data/**'
      - 'renv.lock'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: r-lib/actions/setup-r@v2
        with:
          r-version: '4.4'
          use-public-rspm: true

      - uses: r-lib/actions/setup-renv@v2

      - name: Validate pipeline
        run: |
          library(targets)
          tar_manifest()      # Check _targets.R parses correctly
          tar_outdated()      # List outdated targets (should be none after restore)
        shell: Rscript {0}

      - name: Run pipeline
        run: |
          library(targets)
          tar_make()
        shell: Rscript {0}
```

---

## Docker with Rocker Images

Rocker provides pre-built Docker images for R environments. Use these when bit-for-bit reproducibility matters or when the CI environment needs specific system libraries.

### Rocker Image Selection

| Image | Use Case |
|-------|----------|
| `rocker/r-ver:4.4.2` | Fixed R version, minimal image |
| `rocker/rstudio:4.4.2` | RStudio Server (development) |
| `rocker/tidyverse:4.4.2` | R + tidyverse + RStudio |
| `rocker/verse:4.4.2` | R + tidyverse + publishing (TeX, pandoc) |

### Dockerfile for R + renv

```dockerfile
FROM rocker/r-ver:4.4.2

# Set CRAN snapshot date for reproducibility
ENV CRAN=https://packagemanager.posit.co/cran/2026-04-01

# System dependencies (adjust for your project)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install renv and restore packages
WORKDIR /project
COPY renv.lock renv.lock
COPY .Rprofile .Rprofile
COPY renv/activate.R renv/activate.R
COPY renv/activate.R renv/activate.R

RUN R -e "install.packages('renv', repos = '$CRAN')" && \
    R -e "renv::restore()"

# Copy project files
COPY . .

# Default: run the targets pipeline
CMD ["R", "-e", "targets::tar_make()"]
```

### Docker Compose for Development

```yaml
services:
  rstudio:
    image: rocker/tidyverse:4.4.2
    ports:
      - "8787:8787"
    environment:
      - PASSWORD=dev
    volumes:
      - .:/home/rstudio/project
    working_dir: /home/rstudio/project
```

---

## renv in CI

### Restoring from renv.lock

The `setup-renv` action handles this automatically. For manual CI scripts:

```bash
# Install renv first
Rscript -e "install.packages('renv', repos = 'https://packagemanager.posit.co/cran/latest')"

# Restore from lock file
Rscript -e "renv::restore()"
```

### Keeping renv.lock Current

Add a CI job that checks for renv staleness:

```yaml
- name: Check renv.lock staleness
  run: |
    status <- renv::status()
    if (length(status$packages) > 0) {
      message("renv.lock is stale. Run renv::snapshot() locally.")
      quit(status = 1)
    }
  shell: Rscript {0}
```

---

## Common R CI Patterns

### Caching R Packages

```yaml
- name: Cache R packages
  uses: actions/cache@v4
  with:
    path: |
      ${{ env.R_LIBS_USER }}
      !${{ env.R_LIBS_USER }}/renv
    key: r-${{ runner.os }}-${{ hashFiles('renv.lock') }}
    restore-keys: r-${{ runner.os }}-
```

### TeX for R Markdown / Quarto Rendering

```yaml
- uses: r-lib/actions/setup-tinytex@v2
  if: contains(github.event.commits.*.modified, '.qmd') || contains(github.event.commits.*.modified, '.Rmd')

- name: Install Quarto
  uses: quarto-dev/quarto-actions/setup@v2

- name: Render documents
  run: |
    quarto render report.qmd
  shell: bash
```

### Multi-R-Version Matrix

For R packages or cross-version compatibility testing:

```yaml
strategy:
  fail-fast: false
  matrix:
    r-version: ['4.2', '4.3', '4.4']
    os: [ubuntu-latest, macos-latest]
```

---

## Anti-patterns to Avoid

- **Installing packages without renv** -- `install.packages()` in CI without a lock file produces non-reproducible builds
- **Using `latest` R version tags** -- `rocker/r-ver:latest` breaks when a new R version is released; pin to a specific version
- **Not setting `use-public-rspm: true`** -- CRAN mirrors rotate and can produce inconsistent package versions
- **Committing `.RData` or `.Rhistory`** -- these are session-specific and should be in `.gitignore`
- **Not caching renv restore** -- without caching, CI reinstalls all packages on every run
- **Running `R CMD check` without `--no-manual`** -- manual page rendering requires TeX and fails on minimal CI runners

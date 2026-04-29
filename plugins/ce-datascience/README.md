# CE DataScience

Compound engineering for computational scientists. SAP management, statistical review, and full reporting guideline compliance for R and Python workflows — covering 16 standards across all study types and AI extensions.

## Getting Started

After installing, run `/ce-setup` in any project. It configures your stack profile (language, IDE, libraries, reporting framework) and bootstraps project config.

## Components

| Component | Count |
|-----------|-------|
| Agents | 55 |
| Skills | 40 |

## Skills

### Core Workflow

The compound engineering loop adapted for data science: hypothesize, design study, execute analysis, review methods, document learnings.

| Skill | Description |
|-------|-------------|
| `/ce-ideate` | Big-picture ideation: generate and evaluate research ideas, then route into brainstorming |
| `/ce-brainstorm` | Interactive study design exploration with PICO/PECO probes, writing a requirements doc before planning |
| `/ce-research-question` | Harden a fuzzy study idea into structured PICO + FINER + PubMed query at `analysis/research-question.yaml` |
| `/ce-plan` | Create structured plans -- Statistical Analysis Plans (SAPs) for studies, or implementation plans for technical tasks |
| `/ce-code-review` | Statistical and methodological review with confidence-calibrated findings, reporting checklist compliance, and blinding-state awareness (auto-detected from stack profile) |
| `/ce-work` | Execute analysis tasks with SAP tracking -- surfaces unimplemented SAP sections, flags exploratory analyses, and seeds tasks from the tabular SAP output catalog when present |
| `/ce-debug` | Systematically find root causes in analysis pipelines and data issues |
| `/ce-compound` | Document validated analytical approaches, statistical decisions, and domain methods (with deterministic dedup fingerprints across studies) |
| `/ce-compound-refresh` | Refresh stale learnings and decide whether to keep, update, replace, or archive |
| `/ce-sap-tabular` | Generate the structured tabular companion to the prose SAP -- 5-table artifact (overview, outputs catalog, variables catalog, long/wide samples) statisticians hand to programmers |
| `/ce-data-qa` | Data QA gate with 16 numbered checks, GO/NO-GO emit, missingness pattern catalog, and PI sign-off block. Runs between data extraction and modeling |
| `/ce-verify` | Mid-workflow analysis verification gate -- checks sample size, data leakage, effect direction, missing data, PHI, figure quality, and reproducibility between analysis steps |
| `/ce-sprint` | Open or close an auditable sprint with declared scope (subset of SAP sections), planned outputs, and a named human reviewer. Closing dispatches `ce-sprint-audit-reviewer` |

### Biomedical Lifecycle

For the academic paper lifecycle: literature → checklist → cohort → power → SAP → manuscript artifacts.

| Skill | Description |
|-------|-------------|
| `/ce-pubmed` | PubMed/MEDLINE search via NCBI E-utilities with MeSH expansion and structured result tables |
| `/ce-method-extract` | Extract structured statistical methods from a PubMed result set into a comparison table for SAP justification |
| `/ce-checklist-match` | Pick the right reporting checklist (CONSORT / STROBE / TRIPOD+AI / etc.) at PLAN time, before SAP drafting |
| `/ce-power` | Compute sample size with sensitivity sweep across plausible effect sizes; produces an R or Python script and a SAP-ready paragraph |
| `/ce-effect-size` | Pool effect-size estimates from prior literature (random-effects REML) into a defensible assumption for `/ce-power` |
| `/ce-prereg` | Generate a pre-registration form for OSF, ClinicalTrials.gov, PROSPERO, or AsPredicted from the locked SAP |
| `/ce-model-card` | Generate a Mitchell-style model card for a clinical prediction model, with overall + subgroup performance and ethical considerations |

### EHR & Administrative Data

| Skill | Description |
|-------|-------------|
| `/ce-clif` | Activate CLIF-safe profile for ICU consortium repos -- enforces Parquet-only, mCIDE vocab, three-script architecture, POC sign-off on protected paths |
| `/ce-cohort-build` | Define a study cohort using OMOP concept sets / ICD / CPT / LOINC code lists with vocabulary version pinning; outputs SQL, JSON spec, and CONSORT-flow waterfall |
| `/ce-phenotype-validate` | Validate an EHR-derived phenotype algorithm against a chart-review gold standard; PPV / NPV / sensitivity / specificity overall and by subgroup |

### Bioinformatics

| Skill | Description |
|-------|-------------|
| `/ce-bioinfo-qc` | Sequencing / omics data QA gate: FastQC / MultiQC / sample swap detection / batch-effect screen for FASTQ, BAM, count matrices, methylation arrays |
| `/ce-genome-build` | Pin the genome build (GRCh37 / GRCh38 / T2T) and annotation version (GENCODE / Ensembl); audit every output for build consistency |

### ML / AI

| Skill | Description |
|-------|-------------|
| `/ce-ml-experiment-track` | Wire up ML experiment tracking (mlflow / wandb / dvc / offline-YAML); generate boilerplate, configure backend, define required-log schema |
| `/ce-optimize` | Run metric-driven iterative optimization loops for model hyperparameters, prediction thresholds, feature sets, or any measurable analytical outcome with cross-validation awareness and leakage guards |

### Git Workflow

| Skill | Description |
|-------|-------------|
| `ce-clean-gone-branches` | Clean up local branches whose remote tracking branch is gone |
| `ce-commit` | Create a git commit with a value-communicating message |
| `ce-commit-push-pr` | Commit, push, and open a PR with an adaptive description |
| `ce-resolve-pr-feedback` | Resolve PR review feedback in parallel -- evaluates validity, fixes issues, and replies to statistical methodology threads |
| `ce-worktree` | Manage Git worktrees for parallel development |

### Review & Quality

| Skill | Description |
|-------|-------------|
| `ce-doc-review` | Review documents using parallel persona agents for role-specific feedback |

### Literature & Evidence

| Skill | Description |
|-------|-------------|
| `/ce-literature-search` | Search and download scientific papers via Google Scholar, Crossref, and SciHub using PyPaperBot. Supports PICO/PECO queries, DOI lookup, and structured literature summaries. |

### IDE & Deployment

| Skill | Description |
|-------|-------------|
| `/ce-mcp-server` | Register the ce-datascience MCP server for IDE-agnostic access from Cursor, Windsurf, VS Code+Cline, and other MCP-compatible environments |

### Workflow Utilities

| Skill | Description |
|-------|-------------|
| `/ce-sessions` | Ask questions about session history across Claude Code, Codex, and Cursor |
| `/ce-setup` | Configure stack profile, diagnose environment, and bootstrap project config |
| `/ce-update` | Check plugin version and fix stale cache (Claude Code only) |
| `/ce-workflow` | Lifecycle navigator -- shows ordered skill sequence for your project type, data layer, and language; detects progress and recommends next step |

## Scripts

Plain shell utilities for things that don't need a skill:

| Script | Purpose |
|--------|---------|
| `scripts/freeze-submission.sh <tag>` | Tag the current commit as a submission freeze. Refuses on a dirty tree; writes `submissions/<tag>/manifest.yaml` with commit sha, SAP version, locked-wave hash, and env-lock-file hashes. Does not push the tag and does not copy data. |

## Agents

Agents are specialized subagents invoked by skills.

### Statistical Review

| Agent | Description |
|-------|-------------|
| `ce-methods-reviewer` | Statistical test selection and assumption verification |
| `ce-multiplicity-reviewer` | Multiple comparisons, p-hacking, and selective reporting |
| `ce-reproducibility-reviewer` | Seeds, package versions, paths, and environment specs |
| `ce-reporting-checklist-reviewer` | Reporting guideline compliance across 16 guidelines — auto-routes by study type, layers AI extensions, writes append-only compliance report (opt-in) |
| `ce-sap-drift-detector` | Structural and semantic drift between SAP and analysis code; also flags blinding-state violations, missing amendment log entries, primary-endpoint changes after data lock, and code drift after amendments |
| `ce-data-mapping-reviewer` | Codebook / SAP / extract column-mapping correctness — name drift, unit mismatches, level-set drift, derived-variable formulae, PHI in codebook |
| `ce-phi-leak-reviewer` | HIPAA Safe Harbor identifier scan across data files, codebooks, notebooks, manuscripts, figure captions, and rendered output |
| `ce-targets-pipeline-reviewer` | targets pipeline correctness — hidden file deps, format hints, branching drift, seed leaks |
| `ce-quarto-render-reviewer` | Quarto / RMarkdown render-time correctness — committed output, cache traps, params drift, bibliography paths, accessibility |
| `ce-r-code-reviewer` | R code quality — tidyverse, dplyr, ggplot2, data.table patterns |
| `ce-r-pipeline-reviewer` | R analysis pipeline correctness — dplyr logic errors, ggplot2 accessibility, survival analysis, mixed model convergence |
| `ce-python-ds-reviewer` | Python DS quality — pandas, vectorization, sklearn, data leakage |
| `ce-kieran-python-reviewer` | General Python code review with strict conventions |
| `ce-causal-inference-reviewer` | Causal-inference correctness — DAG specification, confounder set, time-zero alignment, positivity, estimand, sensitivity analyses for IPTW / matching / MSM / g-computation / DR / IV / RDD / DiD / target-trial emulation |

### ML / AI Review

| Agent | Description |
|-------|-------------|
| `ce-data-leakage-reviewer` | Target leakage, train-test contamination, look-ahead bias in time-series, normalization fit on test set, subject-in-both-splits |
| `ce-fairness-reviewer` | Subgroup performance auditing (sex / race / age / hospital / payer / language) for clinical prediction models, against TRIPOD+AI and FDA AI/ML guidance |
| `ce-calibration-reviewer` | Calibration plot, intercept and slope, Brier, ICI, decision-curve analysis -- catches the AUC-only TRIPOD+AI gap |

### EHR & Administrative Data Review

| Agent | Description |
|-------|-------------|
| `ce-omop-mapping-reviewer` | OMOP CDM correctness -- vocabulary version pinning, valid_start/valid_end honoring, descendant inclusion, era vs occurrence, observation_period |
| `ce-administrative-data-reviewer` | Claims-data idiosyncrasies -- continuous enrollment, look-back, claims truncation, payer mix, NDC-to-RxNorm, claims-vs-clinical disconnect |
| `ce-concept-drift-reviewer` | Vocabulary drift across time -- ICD-9-to-10 transition, CPT yearly updates, SNOMED concept_id deprecation, vocab refresh drift |

### Bioinformatics Review

| Agent | Description |
|-------|-------------|
| `ce-bioinfo-pipeline-reviewer` | Snakemake / Nextflow / CWL / Bioconductor pipelines -- env pinning, reference pinning, sample-sheet validation, output checksums, caching traps, version traceability |
| `ce-omics-batch-reviewer` | Batch-condition confound detection in differential expression / methylation / proteomics; flags blind ComBat / RUV / SVA application |

### Workflow

| Agent | Description |
|-------|-------------|
| `ce-sprint-audit-reviewer` | Audits a sprint's planned-vs-actual outputs, scope discipline, and reproducibility re-run; dispatched by `/ce-sprint close` |

### Code Quality Review

| Agent | Description |
|-------|-------------|
| `ce-correctness-reviewer` | Logic errors, edge cases, state bugs |
| `ce-maintainability-reviewer` | Coupling, complexity, naming, dead code |
| `ce-performance-oracle` | Performance analysis and optimization |
| `ce-performance-reviewer` | Runtime performance with confidence calibration |
| `ce-testing-reviewer` | Test coverage gaps, weak assertions |
| `ce-project-standards-reviewer` | AGENTS.md compliance |
| `ce-adversarial-reviewer` | Construct failure scenarios to break implementations |
| `ce-code-simplicity-reviewer` | Final pass for simplicity and minimalism |
| `ce-reliability-reviewer` | Production reliability and failure modes |
| `ce-security-reviewer` | Security vulnerabilities with confidence calibration |
| `ce-security-sentinel` | Security audits and vulnerability assessments |
| `ce-previous-comments-reviewer` | Check whether prior review feedback has been addressed |

### Document Review

| Agent | Description |
|-------|-------------|
| `ce-coherence-reviewer` | Review documents for internal consistency and terminology drift |
| `ce-feasibility-reviewer` | Evaluate whether proposed approaches will survive contact with reality |
| `ce-product-lens-reviewer` | Challenge problem framing, evaluate scope decisions |
| `ce-scope-guardian-reviewer` | Challenge unjustified complexity and scope creep |
| `ce-security-lens-reviewer` | Evaluate plans for security gaps (auth, data, APIs) |
| `ce-adversarial-document-reviewer` | Challenge premises and stress-test decisions |
| `ce-design-lens-reviewer` | Review plans for missing design decisions |

### Research

| Agent | Description |
|-------|-------------|
| `ce-best-practices-researcher` | Gather external best practices and examples |
| `ce-framework-docs-researcher` | Research framework documentation and best practices |
| `ce-git-history-analyzer` | Analyze git history and code evolution |
| `ce-issue-intelligence-analyst` | Analyze GitHub issues for recurring themes |
| `ce-learnings-researcher` | Search institutional learnings for relevant past solutions |
| `ce-repo-research-analyst` | Research repository structure and conventions |
| `ce-session-historian` | Search prior sessions for related investigation context |
| `ce-slack-researcher` | Search Slack for organizational context |
| `ce-web-researcher` | Iterative web research for prior art and best practices |

### Workflow

| Agent | Description |
|-------|-------------|
| `ce-architecture-strategist` | Analyze architectural decisions and compliance |
| `ce-pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `ce-pr-comment-resolver` | Address PR comments and implement fixes |
| `ce-spec-flow-analyzer` | Analyze user flows and identify gaps in specifications |

## License

MIT

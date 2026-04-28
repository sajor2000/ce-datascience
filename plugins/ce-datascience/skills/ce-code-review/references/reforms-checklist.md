# REFORMS Checklist for Machine Learning-Based Science

AI EXTENSION checklist providing consensus-based recommendations for conducting and reporting machine learning-based scientific research across disciplines.

**Base guideline:** Applies across multiple study types (any ML/computational study in biomedical or scientific research)

**Primary reference:** Kapoor S, Cantrell EM, Peng K, Pham TH, Bail CA, Gundersen OE, Hofman JM, Hullman J, Lones MA, Malik MM, Nanayakkara P, Poldrack RA, Raji ID, Roberts M, Salganik MJ, Serra-Garcia M, Stewart BM, Vandewiele G, Narayanan A. REFORMS: Consensus-based Recommendations for Machine-learning-based Science. Sci Adv. 2024;10(18):eadk3452. doi:10.1126/sciadv.adk3452. PMID: 38691601.

This checklist covers 32 questions organized across key areas of ML-based research. Apply to any study using machine learning methods for scientific inference or prediction.

---

## Data

### Item 1 -- Data provenance

**Description:** Document the source, collection method, and original purpose of all datasets used.

**What to look for in code/outputs:**
- Data loading code with source documentation (URL, database, registry, institutional source)
- Data use agreements or licensing information referenced in documentation
- Original dataset publication or data descriptor cited
- Documentation distinguishing primary data collection from secondary data reuse

### Item 2 -- Dataset characteristics

**Description:** Report dataset size, dimensionality, class distribution, and key demographic or domain characteristics.

**What to look for in code/outputs:**
- Summary statistics code generating dataset shape, class balance, and feature distributions
- Demographic or domain characteristic tables for the dataset
- Class imbalance quantification and handling strategy
- Comparison with reference populations when using observational data

### Item 3 -- Data preprocessing and cleaning

**Description:** Document all preprocessing steps including cleaning, filtering, normalization, and transformation.

**What to look for in code/outputs:**
- Preprocessing pipeline code with each step documented
- Outlier detection and removal criteria
- Normalization and scaling methods with parameters
- Data quality filtering thresholds and their justification

### Item 4 -- Feature engineering

**Description:** Describe all feature construction, selection, and transformation steps, including the rationale.

**What to look for in code/outputs:**
- Feature derivation code with documented rationale for each engineered feature
- Feature selection method (filter, wrapper, embedded) with selection criteria
- Dimensionality before and after feature engineering reported
- Domain knowledge justification for feature construction choices

### Item 5 -- Data splitting strategy

**Description:** Describe how data were split into training, validation, and test sets, including the rationale for the splitting strategy.

**What to look for in code/outputs:**
- Split code with explicit random seeds, split ratios, and stratification logic
- Temporal, geographic, or institutional splits when independence is required
- Leakage prevention measures (splitting before preprocessing, group-aware splits)
- Documentation of why the chosen split strategy is appropriate for the research question

---

## Experimental Setup

### Item 6 -- Model selection rationale

**Description:** Justify the choice of ML algorithm(s), including why they are appropriate for the data and research question.

**What to look for in code/outputs:**
- Documentation comparing candidate model families and rationale for selection
- Baseline model specifications (logistic regression, simple heuristic) for comparison
- Model complexity justification relative to dataset size
- Domain-specific constraints influencing model choice (interpretability, real-time inference)

### Item 7 -- Hyperparameter search

**Description:** Describe the hyperparameter search strategy, including search space, search method, and computational budget.

**What to look for in code/outputs:**
- Hyperparameter search code with defined search spaces and ranges
- Search method specification (grid, random, Bayesian, successive halving)
- Computational budget documentation (number of trials, GPU hours)
- Best hyperparameter configuration reported with selection criterion

### Item 8 -- Cross-validation strategy

**Description:** Describe the cross-validation strategy, ensuring it accounts for data structure (temporal, spatial, grouped).

**What to look for in code/outputs:**
- Cross-validation implementation respecting data structure (grouped k-fold, time-series split)
- Nested cross-validation for simultaneous model selection and evaluation
- Documentation of fold assignment strategy and any stratification
- Leakage checks confirming no information flow from test to training folds

### Item 9 -- Computational environment

**Description:** Document the computational environment, including hardware, software versions, and random seeds.

**What to look for in code/outputs:**
- Environment specification files (requirements.txt, environment.yml, Dockerfile)
- Hardware documentation (GPU type, CPU cores, memory)
- Random seed setting code for reproducibility
- Framework and library version numbers logged in outputs or config

---

## Evaluation

### Item 10 -- Performance metrics

**Description:** Report multiple performance metrics appropriate for the task, not just the primary metric.

**What to look for in code/outputs:**
- Multiple metric calculations (accuracy, precision, recall, F1, AUC, MSE, MAE)
- Task-appropriate primary metric selection with justification
- Threshold-dependent metrics reported at multiple operating points
- Metrics computed on held-out test set, not validation set used for tuning

### Item 11 -- Confidence intervals and uncertainty

**Description:** Report confidence intervals or other uncertainty measures for all performance metrics.

**What to look for in code/outputs:**
- Bootstrap confidence interval code for performance metrics
- Standard error or standard deviation across cross-validation folds
- Bayesian credible intervals when applicable
- Statistical significance testing against baselines with appropriate corrections

### Item 12 -- Comparison with baselines

**Description:** Compare model performance against meaningful baselines, including simple models, existing methods, and human performance where applicable.

**What to look for in code/outputs:**
- Baseline model implementations (majority class, random, logistic regression, existing clinical scores)
- Statistical comparison between proposed model and baselines
- Effect size quantification for performance differences
- Human expert performance benchmarks when available

### Item 13 -- Subgroup analysis

**Description:** Report model performance across meaningful subgroups to identify disparities.

**What to look for in code/outputs:**
- Subgroup-stratified performance tables (by demographics, severity, data source)
- Performance disparity quantification across subgroups
- Sample sizes per subgroup reported alongside metrics
- Worst-subgroup performance highlighted

### Item 14 -- Failure analysis

**Description:** Analyze and report model failures, including systematic error patterns and their potential causes.

**What to look for in code/outputs:**
- Error analysis code examining misclassified or high-error cases
- Confusion matrices with error pattern documentation
- Systematic failure mode identification (e.g., specific data characteristics associated with errors)
- Case studies of notable failures with clinical or scientific context

---

## Reproducibility

### Item 15 -- Code availability

**Description:** Share all code required to reproduce the analysis, including preprocessing, model training, and evaluation.

**What to look for in code/outputs:**
- Public code repository with complete analysis pipeline
- README with reproduction instructions
- Environment setup documentation sufficient for independent reproduction
- License specification for code reuse

### Item 16 -- Data availability

**Description:** Share datasets or provide detailed instructions for data access, including any restrictions.

**What to look for in code/outputs:**
- Data availability statement with access instructions
- Synthetic or simulated data provided when original data cannot be shared
- Data use agreement or application process documented
- De-identification procedures documented when sharing clinical data

### Item 17 -- Trained model availability

**Description:** Share trained model weights or provide access to the model for independent evaluation.

**What to look for in code/outputs:**
- Model checkpoint files available in a repository
- Model card documenting intended use, limitations, and performance
- Inference API or containerized model for independent evaluation
- Model serialization format documented

---

## Reporting

### Item 18 -- Limitations

**Description:** Discuss limitations of the ML approach, including data limitations, methodological constraints, and generalizability.

**What to look for in code/outputs:**
- Documented dataset limitations (size, representativeness, label quality)
- Methodological limitations (model assumptions, evaluation constraints)
- Generalizability constraints based on training data characteristics
- Temporal validity concerns (concept drift, data distribution shift)

### Item 19 -- Ethical considerations

**Description:** Discuss ethical implications of the ML research, including potential for misuse, fairness concerns, and societal impact.

**What to look for in code/outputs:**
- Fairness assessment across protected attributes
- Potential misuse or dual-use scenario documentation
- Informed consent and privacy considerations for data subjects
- Societal impact assessment for model deployment

### Item 20 -- Claims and evidence alignment

**Description:** Ensure conclusions are supported by the evidence presented, avoiding overclaiming beyond what the evaluation demonstrates.

**What to look for in code/outputs:**
- Conclusion statements that match the strength of evidence (internal vs. external validation)
- Causal language used only when supported by study design
- Generalizability claims bounded by the populations and settings studied
- Clear distinction between exploratory and confirmatory findings

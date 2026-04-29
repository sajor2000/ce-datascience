# CONSORT Extension for Cluster Randomized Trials

Consolidated Standards of Reporting Trials (CONSORT) extension for cluster randomized trials (CRTs).
Supplements the core CONSORT 2010 checklist with items specific to trials in which intact groups rather than individuals are randomized.

**Primary reference:** Campbell MK, Piaggio G, Elbourne DR, Altman DG; CONSORT Group. Consort 2010 statement: extension to cluster randomised trials. BMJ. 2012;345:e5661. doi:10.1136/bmj.e5661. PMID: 22951546.

Apply this checklist alongside the core CONSORT 2010 checklist. Items below represent additions or modifications to base CONSORT items required for cluster randomized trials. Each item includes the base CONSORT item number where applicable, the description, and what to look for in analysis code and outputs.

---

## Title and Abstract

### Item 1 -- Identification as a cluster randomized trial

**Description:** Identify the study as a cluster randomized trial in the title and abstract. Specify the unit of randomization (e.g., clinic, school, community).

**What to look for in code/outputs:**
- Report title or rendered document header explicitly stating "cluster randomized trial" or "cluster randomised trial"
- Abstract text identifying the unit of randomization and the type of cluster (hospital, practice, village, etc.)
- Report metadata or template confirming the cluster design designation

---

## Introduction

### Item 2 -- Rationale for cluster design*

**Description:** Explain why a cluster randomized design was chosen rather than individual randomization, including the scientific, logistical, or ethical justification.

**What to look for in code/outputs:**
- Documentation explicitly justifying cluster randomization (e.g., intervention delivered at the group level, contamination prevention, administrative feasibility)
- Report sections distinguishing the unit of randomization from the unit of analysis
- Protocol or SAP text describing why individual randomization was not appropriate

---

## Methods

### Item 3 -- How clusters were defined*

**Description:** Define the clusters used in the trial, including their nature (geographic, organizational, social) and how boundaries were determined.

**What to look for in code/outputs:**
- Cluster definition documented in data dictionary, protocol, or analysis header (e.g., general practices defined by unique practice identifier)
- Code that assigns individuals to clusters using the cluster identifier variable
- Documentation of how cluster boundaries were established and whether clusters were pre-existing or defined for the trial
- Summary statistics describing cluster size distribution (mean, range, coefficient of variation)

### Item 4 -- Eligibility criteria: clusters and individuals

**Description:** Specify eligibility criteria for clusters and, where applicable, eligibility criteria for individuals within clusters.

**What to look for in code/outputs:**
- Separate inclusion and exclusion criteria documented for clusters and for individuals within clusters
- Code applying cluster-level filters (e.g., minimum cluster size, geographic region) prior to individual-level filters
- Documentation of the two-stage eligibility process and the number excluded at each level
- Participant flowchart or attrition table distinguishing cluster-level from individual-level exclusions

### Item 5 -- Rationale for cluster size and recruitment within clusters

**Description:** Describe how many individuals were to be recruited within each cluster and how.

**What to look for in code/outputs:**
- Target number of participants per cluster documented in the SAP or protocol
- Recruitment strategy within clusters described (consecutive enrollment, random sampling within cluster)
- Actual cluster size distribution in the data compared to the target in the sample size documentation
- Sensitivity analyses examining the effect of variable cluster sizes on the primary analysis

### Item 6 -- Sample size accounting for clustering*

**Description:** Describe how the sample size was calculated, including the intracluster correlation coefficient (ICC), the average cluster size, and the resulting design effect used to inflate the simple random sample size.

**What to look for in code/outputs:**
- Sample size calculation code specifying the assumed ICC, average cluster size, and design effect (variance inflation factor)
- Formula or function used to compute the design effect: `1 + (m - 1) * ICC` where m is mean cluster size
- Source of the ICC estimate (prior literature, pilot data) documented with a citation or reference
- Sensitivity analyses varying the ICC assumption across plausible values
- Resulting inflated sample size and number of clusters stated alongside simple random sample equivalent

### Item 7 -- Unit of randomization*

**Description:** State the unit of randomization (i.e., the cluster) and the unit of analysis (i.e., individuals or clusters).

**What to look for in code/outputs:**
- Clear documentation distinguishing unit of randomization from unit of analysis
- Code confirming that treatment assignment is at the cluster level (not individual level)
- Analysis code that treats the cluster as the unit of randomization for variance estimation
- Documentation of any cross-level analysis (e.g., cluster-level outcomes computed from individual-level data)

### Item 8 -- Randomization: method and level

**Description:** Describe the method used to generate the random allocation sequence for clusters and any stratification or restriction at the cluster level.

**What to look for in code/outputs:**
- Randomization code operating on cluster identifiers, not individual patient identifiers
- Stratification factors applied at the cluster level (e.g., cluster size stratum, geographic region, baseline outcome rate)
- Block or restricted randomization within strata of clusters documented
- Random seed and allocation method recorded for reproducibility

### Item 9 -- Blinding: which parties were blinded*

**Description:** State whether participants, care providers, and outcome assessors were aware of the intervention assignment at the cluster level, and whether individual-level blinding was implemented.

**What to look for in code/outputs:**
- Documentation specifying blinding status for clusters and for individuals within clusters separately
- Discussion of the practical constraints on blinding in cluster trials (e.g., open-label cluster-level intervention)
- Outcome assessor blinding procedures documented, especially for subjective outcomes
- Sensitivity analyses exploring the potential influence of unblinded outcome assessment

### Item 10 -- Statistical methods for clustered data*

**Description:** Describe the statistical methods used to account for clustering in the primary analysis, including the approach to handling the hierarchical structure of the data (individuals within clusters).

**What to look for in code/outputs:**
- Primary analysis model explicitly accounting for clustering: mixed-effects models (lme4, nlme, lmer), generalized estimating equations (GEE), or cluster-robust standard errors
- Model specification distinguishing fixed effects (treatment, covariates) from random effects (cluster-level random intercept, random slope)
- GEE working correlation structure specified (exchangeable, independent, unstructured) with justification
- Sensitivity analysis comparing results from different approaches (e.g., GEE vs. mixed model, cluster-level analysis)
- Documentation that standard regression without clustering adjustment was NOT used as the primary analysis

### Item 11 -- ICC reporting*

**Description:** Report the estimated intracluster correlation coefficient (ICC) for the primary outcome and its confidence interval.

**What to look for in code/outputs:**
- ICC estimation code for the primary outcome (e.g., from the null model or primary mixed model)
- Reported ICC value with 95% confidence interval in results tables or output
- Between-cluster and within-cluster variance components from the mixed model reported
- Comparison of estimated ICC to the value assumed in the sample size calculation

---

## Results

### Item 12 -- Participant flow: clusters and individuals*

**Description:** For each group, provide the number of clusters allocated and the number of individuals recruited, followed by the numbers receiving the intended intervention, completing follow-up, and included in the primary analysis, all reported at both the cluster and individual level.

**What to look for in code/outputs:**
- CONSORT flow diagram reporting cluster counts and individual counts at every stage separately
- Post-randomization exclusions documented at both the cluster and individual level with reasons
- Number of clusters and individuals analyzed for the primary outcome stated explicitly
- Code tracking attrition at the cluster level (e.g., cluster dropout, cluster contamination) alongside individual-level attrition

### Item 13 -- Baseline characteristics: clusters and individuals*

**Description:** Present baseline demographic and clinical characteristics for clusters and for individuals within clusters, by treatment arm.

**What to look for in code/outputs:**
- Table 1 code generating cluster-level characteristics (cluster size, cluster-level outcome rates, cluster-level covariates) by arm
- Individual-level baseline characteristics table stratified by treatment arm
- Standardized mean differences or balance statistics reported at both levels
- No p-values for baseline comparisons (randomization makes differences due to chance)

### Item 14 -- Numbers analyzed: clusters and individuals*

**Description:** Report the number of clusters and individuals analyzed for each outcome and confirm that the analysis accounted for the cluster design.

**What to look for in code/outputs:**
- Denominators stated at the cluster and individual level for each analysis
- Confirmation that the analysis population is consistent with the stated analysis plan (e.g., intention-to-treat)
- Documentation that all randomized clusters were included in the primary analysis unless exclusion was pre-specified
- Sensitivity analysis results for per-protocol or complete-case analyses alongside the primary analysis

### Item 15 -- Treatment effects with clustering accounted for*

**Description:** For each primary and secondary outcome, present results for each group, the estimated effect size, and its precision (confidence interval), confirming that the estimate accounts for the clustered design.

**What to look for in code/outputs:**
- Treatment effect estimates with confidence intervals derived from cluster-adjusted models (not unadjusted individual-level analysis)
- Model output confirming the clustering structure was included (random effects or robust SE specification)
- Cluster-level effect estimates alongside individual-level estimates when both are informative
- Design effect or effective sample size reported alongside treatment effect to contextualize precision

---

## Discussion

### Item 16 -- Generalizability of cluster findings

**Description:** Discuss the generalizability of the trial findings, including whether the results apply to the clusters studied, to individuals within those clusters, or to both.

**What to look for in code/outputs:**
- Discussion distinguishing generalizability at the cluster level from generalizability at the individual level
- Description of the clusters and whether they represent the target population of clusters
- Acknowledgment of any unusual cluster characteristics that may limit generalizability
- Comment on how cluster size variability or cluster-level heterogeneity affects interpretation

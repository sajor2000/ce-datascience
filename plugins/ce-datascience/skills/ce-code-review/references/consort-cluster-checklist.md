# CONSORT Extension for Cluster Randomized Trials

## Contents

- Title and Abstract (items 1a-1b)
- Introduction (items 2a-2b)
- Methods (items 3a-12a)
- Results (items 13a-17a)
- Discussion (item 21)

Consolidated Standards of Reporting Trials (CONSORT) extension for cluster randomized trials (CRTs).
Supplements the current CONSORT core with items specific to trials in which intact groups rather than individuals are randomized. The extension adds cluster-specific text to CONSORT 2010 items 1a, 1b, 2a, 2b, 3a, 4a, 5, 6a, 7a, 8b, 9, 12a, 13a, 13b, 15, 16, 17a and 21, and replaces item 10 with 10a, 10b and 10c. All other CONSORT 2010 items apply unchanged.

**Primary reference:** Campbell MK, Piaggio G, Elbourne DR, Altman DG; CONSORT Group. Consort 2010 statement: extension to cluster randomised trials. BMJ. 2012;345:e5661. doi:10.1136/bmj.e5661. PMID: 22951546. (Its base, CONSORT 2010, is superseded by CONSORT 2025.)

**Verified against:** "CONSORT Extension for Cluster Trials 2012 Checklist" (Word), linked from https://www.consort-spirit.org/extensions, and the EQUATOR record https://www.equator-network.org/reporting-guidelines/consort-cluster/ (verified 2026-10-15).

**Licence:** The BMJ article and the checklist file state no open licence, so the item descriptions below are close paraphrases of the official extension text. They keep each item's meaning and qualifiers but are not verbatim; consult the source for exact wording. The "What to look for" bullets and the CONSORT 2025 mapping lines are added by this plugin.

**Numbering:** Item IDs are the numbers the extension uses, keyed to CONSORT 2010, which CONSORT 2025 supersedes; apply it alongside the CONSORT 2025 core and cite CONSORT 2025 numbers for core items. Each item gives the nearest CONSORT 2025 core item as a plugin mapping.

---

## Title and Abstract

### Item 1a -- Identification as a cluster randomised trial

**Description:** Identify the trial as cluster randomised in the title.

CONSORT 2025 core: 1a.

**What to look for in code/outputs:**
- Report title or rendered document header explicitly stating "cluster randomized trial" or "cluster randomised trial"

### Item 1b -- Abstract

**Description:** Structured summary following the extension's abstract checklist, which asks the abstract to: identify the study as cluster randomised; give the eligibility criteria for clusters; say whether the objective or hypothesis and the primary outcome pertain to the cluster level, the individual participant level, or both; say how clusters were allocated to interventions; give the number of clusters randomised and analysed in each group; and report the primary outcome result at the cluster or individual level as applicable.

CONSORT 2025 core: 1b.

**What to look for in code/outputs:**
- Abstract text naming the unit of randomization and the type of cluster (hospital, practice, village, etc.)
- Cluster counts randomised and analysed per arm in the abstract

---

## Introduction

### Item 2a -- Rationale for a cluster design

**Description:** Explain the rationale for using a cluster design.

CONSORT 2025 core: 6.

**What to look for in code/outputs:**
- Documentation justifying cluster randomization (e.g., intervention delivered at the group level, contamination prevention, administrative feasibility)
- Protocol or SAP text describing why individual randomization was not appropriate

### Item 2b -- Level of the objectives

**Description:** State whether the objectives pertain to the cluster level, the individual participant level, or both.

CONSORT 2025 core: 7.

**What to look for in code/outputs:**
- Objectives or estimands in the SAP labelled as cluster-level or individual-level

---

## Methods

### Item 3a -- Definition of cluster and design features

**Description:** Define the cluster and describe how the trial's design features apply to the clusters.

CONSORT 2025 core: 9.

**What to look for in code/outputs:**
- Cluster definition documented in the data dictionary, protocol, or analysis header (e.g., general practices defined by a unique practice identifier)
- Code that assigns individuals to clusters using the cluster identifier variable
- Summary statistics describing cluster size distribution (mean, range, coefficient of variation)

### Item 4a -- Eligibility criteria for clusters

**Description:** State the eligibility criteria for clusters.

CONSORT 2025 core: 12a, 12b.

**What to look for in code/outputs:**
- Cluster-level inclusion and exclusion criteria documented separately from individual-level criteria
- Code applying cluster-level filters (e.g., minimum cluster size, region) before individual-level filters

### Item 5 -- Level of the interventions

**Description:** State whether the interventions pertain to the cluster level, the individual participant level, or both.

CONSORT 2025 core: 13.

**What to look for in code/outputs:**
- Intervention components labelled as delivered to clusters (e.g., staff training) or to individuals

### Item 6a -- Level of the outcome measures

**Description:** State whether the outcome measures pertain to the cluster level, the individual participant level, or both.

CONSORT 2025 core: 14.

**What to look for in code/outputs:**
- Outcome derivation code showing whether each outcome is measured on clusters or on individuals
- Cluster-level outcomes computed from individual-level data documented as such

### Item 7a -- Sample size

**Description:** Report the method of calculation, the number of clusters (and whether equal or unequal cluster sizes are assumed), the cluster size, an intracluster correlation coefficient (ICC or k), and an indication of its uncertainty.

CONSORT 2025 core: 16a.

**What to look for in code/outputs:**
- Sample size code specifying the assumed ICC, cluster size, number of clusters, and design effect (e.g., `1 + (m - 1) * ICC` for equal cluster sizes, or an unequal-size adjustment)
- Source of the ICC estimate (prior literature, pilot data) and its uncertainty, with sensitivity analyses across plausible ICC values

### Item 8b -- Stratification or matching

**Description:** Give details of any stratification or matching used.

CONSORT 2025 core: 17b.

**What to look for in code/outputs:**
- Randomization code operating on cluster identifiers, with cluster-level strata or matched pairs documented
- Random seed and allocation method recorded for reproducibility

### Item 9 -- Allocation at the cluster level and concealment

**Description:** Specify that allocation was based on clusters rather than individuals, and whether allocation concealment (if any) was at the cluster level, the individual participant level, or both.

CONSORT 2025 core: 18.

**What to look for in code/outputs:**
- Code confirming treatment assignment is at the cluster level
- Documentation of when individuals were recruited relative to cluster allocation, and whether recruiters knew the allocation

### Item 10a -- Who generated the sequence and enrolled and assigned clusters

**Description:** State who generated the random allocation sequence, who enrolled clusters, and who assigned clusters to interventions. (Replaces CONSORT 2010 item 10.)

CONSORT 2025 core: 17a, 19.

**What to look for in code/outputs:**
- Role documentation separating sequence generation, cluster enrolment, and cluster assignment

### Item 10b -- How individuals were included in clusters

**Description:** Describe the mechanism by which individual participants were included in clusters for the trial (such as complete enumeration or random sampling).

CONSORT 2025 core: 19.

**What to look for in code/outputs:**
- Recruitment strategy within clusters (complete enumeration, consecutive enrolment, random sampling within cluster)
- Target and actual number of participants per cluster compared

### Item 10c -- Consent

**Description:** State from whom consent was sought (cluster representatives, individual cluster members, or both) and whether consent was sought before or after randomisation.

CONSORT 2025 core: 19.

**What to look for in code/outputs:**
- Consent procedures for gatekeepers and for individuals, with timing relative to randomisation

### Item 12a -- How clustering was taken into account

**Description:** Describe how clustering was taken into account in the statistical methods.

CONSORT 2025 core: 21a.

**What to look for in code/outputs:**
- Primary analysis model accounting for clustering: mixed-effects models, generalized estimating equations (GEE), or cluster-robust standard errors
- GEE working correlation structure or random-effects structure specified with justification
- Small-sample corrections when the number of clusters is small
- No primary analysis that ignores clustering

---

## Results

### Item 13a -- Flow of clusters

**Description:** For each group, report the numbers of clusters that were randomly assigned, received the intended treatment, and were analysed for the primary outcome.

CONSORT 2025 core: 22a.

**What to look for in code/outputs:**
- CONSORT flow diagram reporting cluster counts and individual counts at every stage

### Item 13b -- Losses and exclusions of clusters and individuals

**Description:** For each group, report losses and exclusions for both clusters and individual cluster members.

CONSORT 2025 core: 22b.

**What to look for in code/outputs:**
- Code tracking attrition at the cluster level (cluster dropout) alongside individual-level attrition, with reasons

### Item 15 -- Baseline data at both levels

**Description:** Report baseline characteristics for each group at the individual and cluster levels, as applicable.

CONSORT 2025 core: 25.

**What to look for in code/outputs:**
- Table 1 code generating cluster-level characteristics (cluster size, cluster-level covariates) and individual-level characteristics by arm
- No p-values for baseline comparisons

### Item 16 -- Number of clusters analysed

**Description:** For each group, report the number of clusters included in each analysis.

CONSORT 2025 core: 26.

**What to look for in code/outputs:**
- Cluster and individual denominators stated for each analysis

### Item 17a -- Results and ICC

**Description:** Report results at the individual or cluster level, as applicable, and an intracluster correlation coefficient (ICC or k) for each primary outcome.

CONSORT 2025 core: 26.

**What to look for in code/outputs:**
- Treatment effect estimates with confidence intervals from cluster-adjusted models
- ICC estimation code for each primary outcome, with the reported value (and its confidence interval) compared to the value assumed in the sample size calculation

---

## Discussion

### Item 21 -- Generalisability to clusters and individuals

**Description:** Discuss generalisability to clusters and/or individual participants, as relevant.

CONSORT 2025 core: 30.

**What to look for in code/outputs:**
- Discussion distinguishing generalizability at the cluster level from the individual level
- Description of whether the clusters represent the target population of clusters

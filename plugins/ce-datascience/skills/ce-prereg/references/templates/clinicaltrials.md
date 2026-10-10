# ClinicalTrials.gov Registration Template

Paste each section into the corresponding ClinicalTrials.gov PRS field. Required by ICMJE for any prospective interventional study; required by FDA for FDA-regulated trials.

Placeholders: `{{ SAP-N.M: ... }}` is that section of the `ce-plan` SAP; `{{ SAP title }}` is the SAP H1 (`# Statistical Analysis Plan: <title>`); `{{ user: ... }}` comes from the user or project study metadata (never SAP frontmatter; ask, never invent).

## Study identification

| Field | Value |
|-------|-------|
| Brief title | {{ user: short title, confirmed from the SAP title }} |
| Official title | {{ SAP title }} |
| Brief summary | {{ SAP-1.1: primary objective, in lay terms }} |
| Detailed description | {{ SAP-1 and SAP-2: objectives and design }} |

## Study status

| Field | Value |
|-------|-------|
| Overall recruitment status | {{ "Not yet recruiting" or "Recruiting" or "Active, not recruiting" }} |
| Anticipated start date | {{ user: enrollment start }} |
| Anticipated primary completion | {{ user: primary completion }} |
| Anticipated study completion | {{ user: study completion }} |

## Sponsor and collaborators

| Field | Value |
|-------|-------|
| Lead sponsor | {{ user: sponsor }} |
| Collaborators | {{ user: collaborators }} |
| Responsible party | {{ user: principal investigator }} |

## Oversight

| Field | Value |
|-------|-------|
| FDA-regulated drug | {{ "Yes" or "No" }} |
| FDA-regulated device | {{ "Yes" or "No" }} |
| IPD sharing plan | {{ user: IPD sharing | default("Yes -- de-identified IPD shared per request after publication") }} |
| Data monitoring committee | {{ "Yes" or "No -- single-arm or low-risk" }} |
| Approved IRB | {{ user: IRB approval reference }} |

## Study design

| Field | Value |
|-------|-------|
| Primary purpose | {{ "Treatment" / "Prevention" / "Diagnostic" / "Health-services research" }} |
| Study type | Interventional |
| Phase | {{ "Early Phase 1" / "Phase 1" / "Phase 2" / "Phase 3" / "Phase 4" / "Not applicable" }} (SAP-2.1, else user) |
| Allocation | {{ "Randomized" or "Non-randomized" or "Not applicable" }} |
| Intervention model | {{ "Parallel" / "Crossover" / "Factorial" / "Sequential" / "Single-group" }} |
| Masking | {{ "None (Open Label)" / "Single (specify)" / "Double" / "Triple" / "Quadruple" }} |
| Number of arms | {{ SAP-2.3 and SAP-2.4: number of arms }} |
| Enrollment | {{ SAP-6: target N }} |

## Eligibility

| Field | Value |
|-------|-------|
| Sexes eligible | {{ "All" or "Female only" or "Male only" }} |
| Minimum age | {{ SAP-2.2: minimum age }} |
| Maximum age | {{ SAP-2.2: maximum age }} |
| Healthy volunteers accepted | {{ "Yes" or "No" }} |
| Sampling method | {{ "Probability" or "Non-probability" }} |
| Inclusion criteria | {{ SAP-2.2: inclusion criteria }} |
| Exclusion criteria | {{ SAP-2.2: exclusion criteria }} |

## Outcomes

### Primary outcome

| Field | Value |
|-------|-------|
| Title | {{ SAP-3.1: primary endpoint }} |
| Description | {{ SAP-3.1: measurement definition }} |
| Time frame | {{ SAP-3.1: time point }} |

### Secondary outcomes

For each, include title, description, and time frame from SAP-3.2.

## Statistical analysis plan

Link or attach: this SAP file's URL or DOI.

Brief: {{ SAP-5.1: primary analysis summary }}

Sample size: {{ SAP-6: sample size and power }} (see attached SAP for full power calculation)

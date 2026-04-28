# ClinicalTrials.gov Registration Template

Paste each section into the corresponding ClinicalTrials.gov PRS field. Required by ICMJE for any prospective interventional study; required by FDA for FDA-regulated trials.

## Study identification

| Field | Value |
|-------|-------|
| Brief title | {{ sap.title.short }} |
| Official title | {{ sap.title.full }} |
| Brief summary | {{ sap.section_1_1_background_short }} |
| Detailed description | {{ sap.section_1 }} |

## Study status

| Field | Value |
|-------|-------|
| Overall recruitment status | {{ "Not yet recruiting" or "Recruiting" or "Active, not recruiting" }} |
| Anticipated start date | {{ sap.frontmatter.enrollment_start }} |
| Anticipated primary completion | {{ sap.frontmatter.primary_completion }} |
| Anticipated study completion | {{ sap.frontmatter.study_completion }} |

## Sponsor and collaborators

| Field | Value |
|-------|-------|
| Lead sponsor | {{ sap.frontmatter.sponsor }} |
| Collaborators | {{ sap.frontmatter.collaborators }} |
| Responsible party | {{ sap.frontmatter.principal_investigator }} |

## Oversight

| Field | Value |
|-------|-------|
| FDA-regulated drug | {{ "Yes" or "No" }} |
| FDA-regulated device | {{ "Yes" or "No" }} |
| IPD sharing plan | {{ sap.frontmatter.ipd_sharing | default("Yes -- de-identified IPD shared per request after publication") }} |
| Data monitoring committee | {{ "Yes" or "No -- single-arm or low-risk" }} |
| Approved IRB | {{ sap.frontmatter.irb_number }} |

## Study design

| Field | Value |
|-------|-------|
| Primary purpose | {{ "Treatment" / "Prevention" / "Diagnostic" / "Health-services research" }} |
| Study type | Interventional |
| Phase | {{ "Early Phase 1" / "Phase 1" / "Phase 2" / "Phase 3" / "Phase 4" / "Not applicable" }} |
| Allocation | {{ "Randomized" or "Non-randomized" or "Not applicable" }} |
| Intervention model | {{ "Parallel" / "Crossover" / "Factorial" / "Sequential" / "Single-group" }} |
| Masking | {{ "None (Open Label)" / "Single (specify)" / "Double" / "Triple" / "Quadruple" }} |
| Number of arms | {{ sap.section_1_3_n_arms }} |
| Enrollment | {{ sap.section_2_5_target_n }} |

## Eligibility

| Field | Value |
|-------|-------|
| Sexes eligible | {{ "All" or "Female only" or "Male only" }} |
| Minimum age | {{ sap.section_2_1_min_age }} |
| Maximum age | {{ sap.section_2_1_max_age }} |
| Healthy volunteers accepted | {{ "Yes" or "No" }} |
| Sampling method | {{ "Probability" or "Non-probability" }} |
| Inclusion criteria | {{ sap.section_2_1_inclusion }} |
| Exclusion criteria | {{ sap.section_2_1_exclusion }} |

## Outcomes

### Primary outcome

| Field | Value |
|-------|-------|
| Title | {{ sap.section_3_1_primary }} |
| Description | {{ sap.section_3_1_primary_definition }} |
| Time frame | {{ sap.section_3_1_primary_timeframe }} |

### Secondary outcomes

For each, include title, description, and time frame from SAP-3.2+

## Statistical analysis plan

Link or attach: this SAP file's URL or DOI.

Brief: {{ sap.section_4_1_primary_model_summary }}

Sample size: {{ sap.section_2_5_sample_size }} (see attached SAP for full power calculation)

# ClinicalTrials.gov Registration Template

Paste each section into the corresponding ClinicalTrials.gov PRS field. ICMJE requires registration of any clinical trial (prospective assignment to a health-related intervention, randomized or not) in ClinicalTrials.gov or another WHO ICTRP primary registry before the first participant enrolls; US law separately requires registration of applicable FDA-regulated trials. Use the Interventional design table for trials and the Observational design table for observational studies.

Placeholders: `{{ SAP-N.M: ... }}` is that section of the `method-plan` SAP; `{{ SAP title }}` is the SAP H1 (`# Statistical Analysis Plan: <title>`); `{{ user: ... }}` comes from the user or project study metadata (never SAP frontmatter; ask, never invent).

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
| IPD sharing plan | {{ user: IPD sharing plan }} |
| Data monitoring committee | {{ "Yes" or "No -- single-arm or low-risk" }} |
| Approved IRB | {{ user: IRB approval reference }} |

## Study design (Interventional)

| Field | Value |
|-------|-------|
| Primary purpose | {{ "Treatment" / "Prevention" / "Diagnostic" / "Educational/Counseling/Training" / "Supportive Care" / "Screening" / "Health Services Research" / "Basic Science" / "Device Feasibility" / "Other" }} |
| Study type | Interventional |
| Phase | {{ "Early Phase 1" / "Phase 1" / "Phase 1/Phase 2" / "Phase 2" / "Phase 2/Phase 3" / "Phase 3" / "Phase 4" / "Not applicable" }} (SAP-2.1, else user) |
| Allocation | {{ "Randomized" or "Non-randomized" or "Not applicable" }} |
| Intervention model | {{ "Parallel" / "Crossover" / "Factorial" / "Sequential" / "Single-group" }} |
| Masking | {{ "None (Open Label)" / "Single (specify)" / "Double" / "Triple" / "Quadruple" }} |
| Number of arms | {{ SAP-2.3 and SAP-2.4: number of arms }} |
| Enrollment | {{ SAP-6: target N }} |

## Study design (Observational)

| Field | Value |
|-------|-------|
| Study type | Observational |
| Observational model | {{ "Cohort" / "Case-Control" / "Case-Only" / "Case-Crossover" / "Ecologic or Community" / "Family-Based" / "Defined Population" / "Natural History" / "Other" }} (SAP-2.1) |
| Time perspective | {{ "Retrospective" / "Prospective" / "Cross-sectional" / "Other" }} (SAP-2.1) |
| Sampling method | {{ "Probability Sample" or "Non-Probability Sample" }} (SAP-2.2) |
| Study population | {{ SAP-2.2: source population and sampling frame }} |
| Enrollment | {{ SAP-6: target or available N }} |

## Eligibility

| Field | Value |
|-------|-------|
| Sexes eligible | {{ "All" or "Female only" or "Male only" }} |
| Minimum age | {{ SAP-2.2: minimum age }} |
| Maximum age | {{ SAP-2.2: maximum age }} |
| Healthy volunteers accepted | {{ "Yes" or "No" }} |
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

Estimand: {{ SAP-1.4: primary estimand (population, treatments, endpoint and time point, intercurrent-event strategies, summary measure) }}

Brief: {{ SAP-5.1: primary analysis summary }}

Sample size: {{ SAP-6: sample size and power }} (see attached SAP for full power calculation)

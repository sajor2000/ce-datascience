---
name: ce-prereg
description: 'Generates a pre-registration form from the locked SAP for OSF, ClinicalTrials.gov, PROSPERO (systematic reviews), or AsPredicted. Reads SAP sections (background, variables, hypotheses, analysis plan, sample size) and maps them to the registry-specific form fields; refuses to generate if the SAP is not locked, blinding state is unblinded, or git log shows inferential analysis already ran. Use whenever the user mentions pre-registration, prereg, OSF, ClinicalTrials.gov, NCT, PROSPERO, AsPredicted, ICMJE registration, "register this trial", "pre-register the analysis plan", or any reference to a registration deadline relative to enrollment. ICMJE requires CT.gov registration BEFORE first enrollment for prospective interventional studies; this skill catches that timing window.'
argument-hint: "<registry: osf|clinicaltrials|prospero|aspredicted>, optional --sap path"
---

# Pre-Registration Generator

Pre-registration is once-per-study, painful, and high-value. This skill converts a locked SAP into a registry-specific form so the analyst doesn't translate by hand.

## When this skill activates

- SAP is locked (`sap_version` frontmatter, no uncommitted SAP edits)
- Manual: `/ce-prereg osf` or `/ce-prereg clinicaltrials`
- After `/ce-checklist-match` recommended pre-registration

## Prerequisites

- `analysis/sap.md` exists and has `sap_version` frontmatter
- For ClinicalTrials.gov: an IRB approval reference, a sponsor, and an intervention description
- For PROSPERO: review type and search dates
- For OSF: account credentials handled out-of-band

## Core workflow

### Step 1: Pick the registry

Map the study type to the registry:

| Study type | Registry |
|------------|----------|
| Interventional clinical trial (any human RCT) | ClinicalTrials.gov (required by ICMJE) |
| Observational human study | OSF (preferred) or ClinicalTrials.gov |
| Systematic review | PROSPERO |
| Behavioral / decision-science RCT | AsPredicted or OSF |
| Animal study | OSF (preclinical preregistration) |
| Meta-analysis | PROSPERO or OSF |

If `--registry` not passed, infer from `stack_profile.study_type`.

### Step 2: Map SAP sections → registry fields

Use the registry-specific template in `references/templates/`:

**OSF (Standard pre-registration form):**

| OSF field | SAP source |
|-----------|------------|
| Title | SAP frontmatter `title` |
| Authors | SAP frontmatter `authors` |
| Description / hypotheses | SAP-3 |
| Design | SAP-1.2 |
| Sampling plan | SAP-2.1 (cohort) |
| Variables (independent / dependent / covariates) | SAP-2 |
| Analysis plan (statistical models) | SAP-4 |
| Inference criteria (alpha, multiple comparisons) | SAP-4.x |
| Data exclusion rules | SAP-2.3 |
| Missing data handling | SAP-2.4 |
| Exploratory analyses | SAP-4.exploratory section |

**ClinicalTrials.gov:**

| CT field | SAP source |
|----------|------------|
| Brief title / Official title | SAP frontmatter |
| Brief summary | SAP-1.1 |
| Detailed description | SAP-1 |
| Study type / Phase | SAP-1.2 |
| Primary outcome (with timeframe) | SAP-3.1 |
| Secondary outcomes | SAP-3.2+ |
| Eligibility criteria | SAP-2.1 |
| Sample size | SAP-2.5 (use `/ce-power` output) |
| Arms and interventions | SAP-1.3 |
| Statistical analysis plan link | This SAP file's URL |

**PROSPERO:**

| PROSPERO field | SAP source |
|----------------|------------|
| Review question | SAP-1.1 |
| Searches (databases, dates, search strategy) | SAP-2.1 (use `/ce-pubmed` log) |
| Condition or domain being studied | SAP-3 |
| Participants / population | SAP-2 |
| Intervention / exposure | SAP-2 |
| Outcomes | SAP-3 |
| Risk of bias assessment | SAP-4.bias |
| Strategy for data synthesis | SAP-4 |

### Step 3: Generate output

Write `analysis/prereg/<registry>-<date>.md` -- the human-readable form pre-filled. Also write `analysis/prereg/<registry>-<date>.json` -- structured payload for any future automation.

Include a checklist at the top:

```
PRE-REGISTRATION CHECKLIST -- review before submitting:
☐ SAP is locked (sap_version: 1.2 -- LOCKED)
☐ Data has not been unblinded (blinding_state: blinded)
☐ No inferential analysis has been run (git log of analysis/ shows no model fits)
☐ All authors listed in SAP frontmatter agree
☐ Funding source declared
☐ IRB approval reference attached (if interventional)
☐ Submission deadline relative to enrollment understood
```

If any of these fails the automated check (SAP unlocked, blinding state unblinded, evidence of inferential analysis in the git log), refuse to generate and surface the blocker.

### Step 4: Emit signal

`__CE_PREREG__ registry=<name> file=<path>` -- the user copies the file content into the registry's web form.

## What this skill does NOT do

- Does not submit to any registry (no API integration; user pastes manually -- this is intentional, keeps secrets out)
- Does not write the SAP (use `/ce-plan`)
- Does not validate scientific rigor of the SAP (use the document-review pass)
- Does not pick the registry for you when ambiguous; prompts

## References

@./references/templates/osf-standard.md

@./references/templates/clinicaltrials.md

@./references/templates/prospero.md

@./references/templates/aspredicted.md

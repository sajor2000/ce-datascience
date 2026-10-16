---
name: ce-prereg
description: "Generates preregistration and registry content for OSF, ClinicalTrials.gov, PROSPERO, or a study protocol. Use when the user asks to preregister or register a study."
argument-hint: "<registry: osf|clinicaltrials|prospero|aspredicted>, optional --sap path"
---

# Pre-Registration Generator

> **Script paths are relative to this skill's directory.** Prefix each script path with that directory (the `SKILL_DIR` anchor below) — the agent's working directory is the user's project, not the skill, and `--package-dir` resolves against the project root.


## Skill Value

- **Problem it solves:** Registry submissions need structured design, outcomes, analysis, and deviation language before work begins.
- **Use when:** The user asks for preregistration, registry package, ClinicalTrials.gov, OSF, PROSPERO, or protocol registration.
- **Output:** Registry-ready draft sections and a missing-information checklist.
- **Ask only if:** Only when registry target, intervention/exposure, outcomes, or analysis timing is unclear.
- **Do not do:** Do not submit registrations or invent sponsor/IRB details.
- **Interaction:** Check repo/config/chat evidence first. Ask one decision-changing question at a time; use the current harness's blocking question UI when available, otherwise present numbered choices and wait.

## When this skill activates

- SAP is locked: frontmatter `status: final` (or `status: amended` with `date_amended` set after a final lock), integer `sap_version`, and no uncommitted SAP edits. `status: draft` is not locked.
- Manual: `ce-prereg osf` or `ce-prereg clinicaltrials`
- After `ce-checklist-match` recommended pre-registration

## Prerequisites

- `analysis/sap.md` exists and follows the `ce-plan` SAP template: frontmatter with integer `sap_version` and `status`, title in the H1 `# Statistical Analysis Plan: <title>`, and `SAP-N.M` section IDs
- For ClinicalTrials.gov: an IRB approval reference, a sponsor, and an intervention description
- For PROSPERO: review type, search dates, and the systematic-review protocol (searches, data extraction, risk of bias)
- For OSF: account credentials handled out-of-band
- Authors, sponsor, funding, IRB, contact, and study start/completion dates are not SAP frontmatter fields. Take them from the user or the project's study metadata; ask for any that are missing and never invent them

## Core workflow

### Step 1: Pick the registry

Map the study type to the registry:

| Study type | Registry |
|------------|----------|
| Interventional clinical trial (any prospective assignment to a health-related intervention, randomized or not) | ClinicalTrials.gov or any WHO ICTRP primary registry, before first enrollment (ICMJE) |
| Observational treatment-effect study (EHR/claims, incl. target trial emulation) | OSF with a HARPER-structured protocol, or ClinicalTrials.gov (Observational study type) |
| Other observational human study | OSF (preferred) or ClinicalTrials.gov |
| Systematic review | PROSPERO, before data extraction starts; otherwise OSF with the timing disclosed |
| Behavioral / decision-science RCT | ClinicalTrials.gov or a WHO primary registry if the intervention targets a health-related outcome (ICMJE counts behavioural and educational interventions); otherwise AsPredicted or OSF |
| Animal study | OSF (preclinical preregistration) |
| Meta-analysis | PROSPERO or OSF |

If no registry argument is passed, infer from `stack_profile.study_type`.

Registry text summarizes a protocol; check that the protocol follows its content standard: SPIRIT 2025 for randomized-trial protocols (34 items; BMJ 2025;389:e081477, PMID 40294953), PRISMA-P 2015 for systematic-review protocols (Syst Rev 2015;4:1, PMID 25554246), and HARPER for real-world-evidence treatment-effect protocols (Wang et al., Pharmacoepidemiol Drug Saf 2023;32:44-55, doi:10.1002/pds.5507). For trials and causal observational studies, carry the SAP-1.4 estimand into the registry's outcome or analysis text.

Register before data access when possible. For existing data, OSF distinguishes registration before creation, before observation, before access, and before analysis of the data; declare the level honestly and what any prior QA examined.

## Evidence access

Read `references/evidence-access.md` before any literature lookup (PubMed and Paperclip MCP tools, fallbacks, and rules); never invent a citation, effect size, or guideline item.

- **Look up here:** every registry-required citation: prior evidence and pilot data in the rationale or background fields, the source of the sample-size assumption, and the risk-of-bias tool references must resolve to a PMID or DOI through the metadata or citation-lookup tool before they enter `form.md`; PROSPERO's databases list and search dates come from the systematic-review protocol, never from a default.

### Step 2: Map SAP sections → registry fields

Use the registry-specific template in `references/templates/`. Section IDs follow the `ce-plan` SAP template: SAP-1 objectives (1.4 estimands), SAP-2 design (2.1 type, 2.2 population/eligibility, 2.3 exposure/intervention, 2.4 comparator), SAP-3 endpoints, SAP-4 analysis populations, SAP-5 methods (5.1 primary, 5.2 secondary, 5.3 subgroups, 5.4-5.6 RCT interim, deviations, harms), SAP-6 sample size, SAP-7 multiplicity, SAP-8 missing data, SAP-9 sensitivity, SAP-13 variable catalog. "User/metadata" means the user or the project's study metadata, never SAP frontmatter.

**OSF (Standard pre-registration form):**

| OSF field | Source |
|-----------|--------|
| Title | SAP H1 title |
| Authors | User/metadata |
| Description / hypotheses | SAP-1.1, SAP-1.2 |
| Design | SAP-2.1, SAP-2.3, SAP-2.4 |
| Sampling plan | SAP-2.2 (population, sampling frame), SAP-6 |
| Variables (independent / dependent / covariates) | SAP-2.3, SAP-3, SAP-13 |
| Analysis plan (statistical models) | SAP-1.4 (estimand), SAP-5.1 to SAP-5.3 |
| Inference criteria (alpha, multiple comparisons) | SAP-5.1 (threshold), SAP-7 |
| Data exclusion rules | SAP-2.2 (exclusion criteria), SAP-4 |
| Missing data handling | SAP-8 |
| Exploratory analyses | SAP-1.3, SAP-3.3 |

**ClinicalTrials.gov:**

| CT field | Source |
|----------|--------|
| Brief title / Official title | SAP H1 title (brief title confirmed by user) |
| Brief summary | SAP-1.1 |
| Detailed description | SAP-1, SAP-2 |
| Study type / Phase | SAP-2.1 (phase from user/metadata if absent) |
| Primary outcome (with timeframe) | SAP-3.1 |
| Secondary outcomes | SAP-3.2 |
| Eligibility criteria | SAP-2.2 |
| Sample size | SAP-6 (use the `ce-power` skill output) |
| Arms and interventions | SAP-2.3, SAP-2.4 |
| Sponsor, IRB, dates | User/metadata |
| Statistical analysis plan link | This SAP file's URL |

**PROSPERO:**

| PROSPERO field | Source |
|----------------|--------|
| Review question | SAP-1.1 |
| Searches (databases, dates, search strategy) | Not in the SAP template; take from the systematic-review protocol (and the `ce-pubmed` skill log) |
| Condition or domain being studied | SAP-1.1, SAP-2.2 |
| Participants / population | SAP-2.2 |
| Intervention / exposure | SAP-2.3 |
| Comparator | SAP-2.4 |
| Types of study to be included | SAP-2.2 (eligibility) |
| Outcomes | SAP-3.1, SAP-3.2 |
| Data extraction | Not in the SAP template; take from the systematic-review protocol |
| Risk of bias assessment | Not in the SAP template; take from the systematic-review protocol |
| Strategy for data synthesis | SAP-5.1 (pooling model), SAP-9; narrative-synthesis rules not in the SAP come from the protocol |
| Subgroups | SAP-5.3 |

### Step 3: Generate output

Write a package directory at `analysis/prereg/<registry>-<date>/`:

- `form.md` -- the human-readable registry form pre-filled.
- `payload.json` -- structured payload with registry-specific fields for future automation. Set `title` from the SAP H1 and `sap_version` to the SAP's integer `sap_version`.
- `sap-snapshot.md` -- a locked SAP snapshot or `sap_hash` in `payload.json` when the snapshot cannot be copied.
- `registry-validation-report.md` -- generated by the validation script below.

Include a checklist at the top:

```
PRE-REGISTRATION CHECKLIST -- review before submitting:
☐ SAP is locked (status: final, sap_version: <integer>)
☐ Data has not been unblinded (blinding_state: blinded)
☐ No inferential analysis has been run (git log of analysis/ shows no model fits)
☐ All authors (from the user or study metadata) agree
☐ Funding source declared
☐ IRB approval reference attached (if interventional)
☐ Every cited prior study, pilot result, or sample-size source resolves to a PMID/DOI (checked with the PubMed MCP)
☐ Submission deadline relative to enrollment understood
```

Record `sap_status` (from the SAP frontmatter) and `blinding_state` (`blinded`, `unblinded`, or `not_applicable`) in `payload.json`; the validator blocks a `draft` SAP, an `unblinded` state, and a PROSPERO `fields.review_stage` at or past data extraction. Check the git log of `analysis/` for model fits yourself before generating; if inferential analysis has run, refuse to generate and surface the blocker.

Before emitting the signal, run:

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
python3 "$SKILL_DIR/scripts/validate_registry_package.py" --package-dir analysis/prereg/<registry>-<date> --registry <registry>
```

The validator writes `registry-validation-report.md` into the package directory and prints `__CE_PREREG_VALIDATE__ package=<path> result=<READY-WITH-REVIEW|BLOCKED> report=<path>` (exit 1 on `BLOCKED`). If the result is `BLOCKED`, stop and fix the package. Do not ask the user to paste incomplete registry text into a live registry.

### Step 4: Emit signal

`__CE_PREREG__ registry=<name> package=<path> form=<path>/form.md` -- the user copies the validated form content into the registry's web form.

## What this skill does NOT do

- Does not submit to any registry (no API integration; user pastes manually -- this is intentional, keeps secrets out)
- Does not write the SAP (use the `ce-plan` skill)
- Does not validate scientific rigor of the SAP (use the document-review pass)
- Does not pick the registry for you when ambiguous; prompts

## References

@./references/templates/osf-standard.md

@./references/templates/clinicaltrials.md

@./references/templates/prospero.md

@./references/templates/aspredicted.md

@./references/registry-package-schema.yaml

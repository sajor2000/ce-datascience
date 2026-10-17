# Executable R and Python aggregate templates

## Scope and environment

The bundled scripts accept reviewed independent scalar effects with known SEs.
They do not extract patient data, fit local models, discover studies, decide
compatibility, or certify safe release. They are starting points for a protocol-
specific analysis, not full rare-event, dependent-effect, DTA, NMA or prediction-
performance engines. Review the inputs and methodological assumptions first.

Use a project-controlled `renv.lock` or `uv.lock`/equivalent environment record.
The Python validator/common-effect path uses the standard library. The Python
random-effects path requires numpy and statsmodels. R requires metafor and
Python 3 for the shared validator. Missing engines must stop the requested
method, not silently choose another. Obtain any required installation approval
in the active environment; these scripts do not install packages.

## Contract

Adapt `assets/aggregate_meta_input.example.json`, which contains synthetic
aggregate estimates and an explicit failed-unit disposition. Do not substitute
patient records. For literature studies, `site_id` is a stable study-source
label, not a patient identifier. The template deliberately supports one row per
site/study per synthesis. More complex study/report/result mappings belong in
the extraction ledger and a protocol-specific analysis.

The root contains `schema_version`, `analysis_contract`, and `units`. Every
unit repeats the contract so mismatches stop the fit. The contract records
effect measure, analysis scale, estimand, outcome, time horizon, model,
adjustment specification, analysis version, precision-weighting target and a
reviewed-disjoint-independence assertion. Each unit has unique
`analysis_unit_id`, `site_id`, `study_id`, a disposition, estimate/SE, and reason.
Each received row requires `release_status="approved"` and a nonempty
`release_review_reference`, retained in provenance. The synthetic asset uses
an explicitly fictional marker, not a real approval. This assertion must refer
to the actual site/study release review for real submissions. The code cannot
verify that the referenced approval is authentic.
Nonusable units retain null numerical fields rather than invented zeros.
Missing-site roster rows require `release_status="not_applicable"`, a null
review reference, null estimates, and an explicit no-submission reason.

The validator checks structure and declared consistency. Matching strings do
not prove clinical compatibility, independence, provenance, or privacy. The
precision-weighting field must describe the actual scientific target, not just
say that either method is acceptable. Contract labels are not an automatic
effect-scale transformation. Supply effects and SEs already on their declared
analysis scale. Raw ORs cannot be passed as log-OR effects.

## Run from the current skill source

Set the anchor to the directory containing the SKILL.md you actually read:

```bash
SKILL_DIR="<absolute path of the directory containing the SKILL.md you just read>";
test -f "$SKILL_DIR/scripts/aggregate_meta.py"
```

If it is missing, locate the installed skill source or report the missing
resource. Do not guess an installed plugin version or cache path. Provide an
explicit approved aggregate input and new, non-existent output paths. Existing
files, including source scripts and previous results, are never overwritten.

```bash
python3 "$SKILL_DIR/scripts/aggregate_meta.py" --input aggregate-input.json --validate-only
python3 "$SKILL_DIR/scripts/aggregate_meta.py" --input aggregate-input.json --method common --output common-result.json
python3 "$SKILL_DIR/scripts/aggregate_meta.py" --input aggregate-input.json --method pm --output pm-result.json
Rscript "$SKILL_DIR/scripts/aggregate_meta.R" --input aggregate-input.json --validator "$SKILL_DIR/scripts/aggregate_meta.py" --output reml-result.json
```

Choose the method from the protocol. `common` is inverse-variance normal-Wald
inference. `pm` uses statsmodels `method_re="iterated"` and explicitly selects
the estimated-scale RE HKSJ/WLS t interval through `conf_int(use_t=True)[3]`.
The Python template checks the PM estimating-equation residual before publishing;
an unconverged solver stops without a result. The R template uses metafor `method="REML", test="knha"`. It validates through
Python before R ingests a temporary aggregate table. R's dependency on Python
is intentional so the two paths share one strict input contract.

These are unmodified HKSJ methods. A zero/small residual scale can give
unhelpfully narrow intervals. Inspect diagnostics, flag that condition, and
apply only the modification/sensitivity prespecified by the protocol. Do not
declare independent-method equivalence because their point estimates are close.

## Extend and verify the actual analysis

Inspect all unit dispositions, normalized weights, uncertainty and heterogeneity.
Add influence/leave-one-out, planned sensitivity analyses, and an editable forest
plot from the primary fitted model in the project's analysis. The starter
scripts do not implement those displays or diagnostics automatically. They
also omit prediction intervals and asymmetry tests; decide their applicability
from the methods reference before adding them.

Verify numerical behavior on synthetic aggregates before using approved site
outputs. Match PM to PM or REML to REML, HKSJ to the same HKSJ definition,
degrees of freedom and scale. Include incompatible scales, unknown overlap,
duplicate units, nonfinite SEs and failed/suppressed sites. Report the actual
engine versions, command outputs and any paths that could not execute.

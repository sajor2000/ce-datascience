# Synthetic model strategy

- Status: ready_for_review; human reviewer pending.
- Estimand: population-average adjusted risk difference for treatment.
- Grain: one visit row, repeated within 40 clinics and 300 patients.
- Primary model: binomial GEE clustered by clinic with exchangeable working correlation.
- Diagnostics: cluster counts, convergence, working-correlation sensitivity, and small-cluster correction.

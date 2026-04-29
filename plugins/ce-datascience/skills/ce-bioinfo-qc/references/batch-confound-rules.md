# Batch-Confound Detection Rules

The single most damaging silent failure in omics. When batch and condition are aliased, no statistical method recovers the correct signal.

## Heuristic flags (P0)

1. **Date-of-processing equals condition arm.** All cases processed on day 1, all controls on day 2. Pearson r between date and condition > 0.5.
2. **Plate / lane equals condition arm.** Same as above with plate or sequencing lane.
3. **Site equals condition arm in multi-site data.** Cases from site A, controls from site B.
4. **Sex differs between arms.** If condition is unbalanced by sex AND sex is not a study variable, batch-effect-removal will mask sex differences.
5. **PC1 separates by batch perfectly.** PCA on count matrix; PC1 explains > 30% variance and separates samples by batch label with > 90% accuracy. If condition is also separated → confounded.

## Heuristic warnings (P1)

1. **Batch indicator and condition correlated 0.3-0.5.** Partial confound; can be modeled but reduces power.
2. **Some batches have very few samples.** Batch with N=1 or N=2 cannot be used for batch correction.
3. **Batch correction applied without inspection.** ComBat / RUV / SVA called blindly; the analyst should look at PCA before and after.

## What to recommend when confounded

- **Re-block the experiment.** Often impossible after the fact, but should be the first option.
- **Acknowledge as a limitation; report sensitivity analysis.** Show results with and without one batch; if conclusions stable, OK to publish with caveat.
- **Use within-batch comparisons only.** If each batch contains both arms, restrict to within-batch contrasts.
- **Adopt a paired / matched design retrospectively.** Match cases and controls within batch.

## What NOT to recommend

- Blindly applying ComBat with no balanced batch -- it removes condition signal.
- "Batch as a random effect" when batch is fully aliased with condition -- the model is unidentifiable.
- Reporting batch-corrected effect sizes without showing the original.

## Reporting in the manuscript

The batch-confound assessment should appear in the Methods section:

> "We assessed batch-effect confounding by computing the Pearson correlation between batch indicator (sequencing run date) and condition arm; r = 0.18 indicated partial overlap suitable for inclusion of batch as a covariate in the differential-expression model. Sensitivity analyses excluding batch X (N = 8) yielded concordant top-50 differentially expressed genes (Spearman r = 0.94)."

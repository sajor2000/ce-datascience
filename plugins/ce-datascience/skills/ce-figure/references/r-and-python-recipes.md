# R and Python Figure Recipes

One short recipe per figure type, in R (ggplot2 + `assets/theme_clinical.R`) and Python (matplotlib + `assets/clinical_style.py`). Rules for each type: `references/figure-style-guide.md`.

## Contents

- Loading the style assets
- Running from RStudio, Jupyter, and Marimo
- Kaplan-Meier with number at risk
- Forest plot
- Dot and CI plot
- Box plot with points
- Scatter with fit
- Line and time series
- Heat map
- ROC and calibration
- Flow diagram
- Multi-panel

## Loading the style assets

Recommended: copy the asset into the project so the figure reproduces without the plugin.

```bash
SKILL_DIR="<absolute path of the directory containing this SKILL.md>";
cp "$SKILL_DIR/assets/theme_clinical.R" analysis/scripts/theme_clinical.R
cp "$SKILL_DIR/assets/clinical_style.py" analysis/scripts/clinical_style.py
```

Then in the figure script or notebook:

```r
source("analysis/scripts/theme_clinical.R")  # needs ggplot2 >= 3.5
library(ggplot2)
theme_set(theme_clinical())
```

The `if (FALSE)` block at the end of `theme_clinical.R` is a runnable version of every R recipe below (survival::lung plus simulated frames, output under `tempdir()`); run it once after `source()` to confirm the installed packages work before adapting a recipe to the project data.

```python
import sys; sys.path.insert(0, "analysis/scripts")
from clinical_style import apply_clinical_style, save_figure, add_panel_labels
apply_clinical_style()
```

Loading in place (no copy) works the same with `source("$SKILL_DIR/assets/theme_clinical.R")` or `sys.path.insert(0, "$SKILL_DIR/assets")`, with `$SKILL_DIR` expanded to the absolute path; record that path in the script header so the figure is still traceable.

Every recipe below ends with an export at final column width and a manifest entry (`style_profile: clinical-standard`), then the validator.

## Running from RStudio, Jupyter, and Marimo

- RStudio: keep the figure in `analysis/scripts/figN.R` or a named Quarto/R Markdown chunk; the Plots pane preview is not the export. `save_figure(p, "analysis/publication/figures/fig1.pdf", width_in = 3.5, height_in = 3.2, also = "png")` writes the deliverable; open the PDF.
- Jupyter: `%config InlineBackend.figure_format = 'retina'` once per notebook for crisp previews; `%matplotlib inline` is the default. Preview size is not export size; always call `save_figure(fig, ...)` and open the file.
- Marimo: the last expression of a cell renders the figure, so end the cell with `fig` (or `ax`); for zooming use `mo.mpl.interactive(fig)`. Do not rely on `plt.show()`. After export, display the deliverable with `mo.image(src="analysis/publication/figures/fig1.png")`. Keep `apply_clinical_style()` in the setup cell so every cell inherits the rcParams.
- All three: one figure per script or cell group, reading `figN-source.csv` (or the analysis output it is derived from), so `source_code` and `source_data` in the manifest point at real files.

## Kaplan-Meier with number at risk

R (ggsurvfit):

```r
library(ggsurvfit)
p <- survfit2(Surv(time_mo, event) ~ arm, data = dat) |>
  ggsurvfit(linewidth = 0.75) +
  add_censor_mark(shape = 3, size = 1.5) +
  add_risktable(risktable_stats = "n.risk", stats_label = list(n.risk = "No. at risk"),
                times = seq(0, 12, 3), size = 8 / .pt,
                theme = theme_risktable_default(axis.text.y.size = 8, plot.title.size = 8)) +
  # expand keeps the t = 0 count inside the risk table; waiver() gives 0-1 labels, not percent
  scale_ggsurvfit(x_scales = list(breaks = seq(0, 12, 3), expand = c(0.04, 0)),
                  y_scales = list(labels = waiver())) +
  scale_color_clinical() +
  labs(x = "Time Since Randomization, mo", y = "Survival Probability") +
  theme_clinical() +
  theme(legend.position = "inside", legend.position.inside = c(0.15, 0.2))
save_figure(p, "analysis/publication/figures/fig1.pdf", width_in = 3.5, height_in = 3.6, also = "png")
```

R (survminer): `sm <- ggsurvplot(fit, data = dat, risk.table = TRUE, risk.table.height = 0.2, risk.table.title = "No. at risk", break.time.by = 3, censor.shape = "|", palette = clinical_palette[1:2], ggtheme = theme_clinical(), tables.theme = table_theme, fontsize = 8 / .pt)` where `table_theme` is `theme_clinical()` with the axis line, ticks, x text, and x title blanked and `plot.title` at 8 pt plain (full call in the asset's `if (FALSE)` block). `ggsave()` cannot draw a ggsurvplot object; export with `cairo_pdf(path, width = 3.5, height = 3.6); print(sm); dev.off()`.

Python (lifelines):

```python
fig, ax, fitters = km_with_risk_table(dat, time="time_mo", event="event", group="arm",
                                      xticks=range(0, 13, 3))
save_figure(fig, "analysis/publication/figures/fig1.pdf", width_in=3.5, height_in=3.6, also=["png"])
```

`km_with_risk_table` wraps `KaplanMeierFitter.plot_survival_function(ax=ax)` and `lifelines.plotting.add_at_risk_counts(*fitters, rows_to_show=["At risk"], ax=ax, xticks=...)`. For cumulative incidence, plot `1 - S(t)` with `plot_cumulative_density` and relabel the y axis "Cumulative Incidence, %".

## Forest plot

R: `geom_vline(xintercept = 1)` + `geom_errorbar(aes(xmin = lower, xmax = upper), width = 0)` (horizontal; `geom_errorbarh()` is deprecated in ggplot2 4) + `geom_point(aes(size = n), shape = 15)` + `scale_x_log10(breaks = c(0.25, 0.5, 1, 2, 4), labels = function(x) format(x, drop0trailing = TRUE))` + `labs(x = "Hazard Ratio (95% CI)")`; add text columns with `geom_text` on a second panel joined by `patchwork` (`p_text | p_plot + plot_layout(widths = c(1, 2))`). The `if (FALSE)` block in `assets/theme_clinical.R` has the full call.

Python: `forest_plot(df, label="label", estimate="hr", lower="lower", upper="upper", weight="n", heading="is_heading", text_cols=["n", "hr_ci"], pooled={"estimate": .., "lower": .., "upper": ..}, favors=("Favors Intervention", "Favors Control"))`, then `save_figure(fig, "fig2.pdf", width_in=7, height_in=0.28 * len(df) + 1.2)`.

## Dot and CI plot

R: `geom_pointrange(aes(xmin = lower, xmax = upper), position = position_dodge(0.5), size = 0.3, linewidth = 0.5) + scale_color_clinical()`; horizontal layout with categories on y when labels are long.

Python: `dot_ci_plot(df, category="outcome", estimate="est", lower="lo", upper="hi", group="arm", xlabel="Risk Difference, % (95% CI)", reference=0)`.

## Box plot with points

R: `geom_boxplot(outlier.shape = NA, width = 0.5) + geom_jitter(width = 0.12, size = 0.8, alpha = 0.5) + scale_y_continuous(limits = c(0, NA))`.

Python: `ax.boxplot(groups, showfliers=False, widths=0.5, medianprops={"color": "black"})` then `ax.scatter(x + rng.uniform(-0.12, 0.12, n), y, s=6, alpha=0.5, color=CLINICAL_PALETTE[0])`; or `seaborn.boxplot(..., showfliers=False)` + `seaborn.stripplot(..., size=2.5, alpha=0.5)` after `apply_clinical_style()` (seaborn inherits rcParams; avoid `sns.set_theme()`, which overrides them).

## Scatter with fit

R: `geom_point(alpha = 0.4, size = 0.8) + geom_smooth(method = "lm", linewidth = 0.75, colour = clinical_palette[1], fill = clinical_palette[1], alpha = 0.15)`; `coord_equal()` + `geom_abline()` when units match.

Python: `ax.scatter(x, y, s=6, alpha=0.4)`; fit with `numpy.polyfit` or `statsmodels` and draw `ax.plot(xs, yhat)` + `ax.fill_between(xs, lo, hi, alpha=0.15)`; `ax.set_aspect("equal")` when units match.

## Line and time series

R: `geom_line(aes(linetype = arm, colour = arm)) + geom_point(aes(shape = arm)) + scale_color_clinical()`; direct labels with `ggrepel::geom_text_repel(data = last_points, aes(label = arm), direction = "y", nudge_x = 0.3, size = 8 / .pt)` and `theme(legend.position = "none")`.

Python: loop over groups with `ax.plot(t, y, color=CLINICAL_PALETTE[i], linestyle=LINESTYLES[i], marker=MARKERS[i])`; direct labels with `ax.annotate(label, (t[-1], y[-1]), xytext=(4, 0), textcoords="offset points", va="center", fontsize=8)`.

## Heat map

R: `geom_tile(colour = "white", linewidth = 0.2) + scale_fill_viridis_c(name = "Correlation Coefficient")` or `scale_fill_gradient2(low = "#0072B2", mid = "white", high = "#D55E00", midpoint = 0)`; `coord_equal()`; `theme(axis.line = element_blank(), axis.ticks = element_blank())`.

Python: `im = ax.imshow(M, cmap="viridis")` (sequential) or `cmap="RdBu_r", vmin=-1, vmax=1` (diverging); `cb = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04); cb.set_label("Correlation Coefficient")`; `ax.set_xticks(range(k), labels, rotation=0)`; `for s in ax.spines.values(): s.set_visible(False)`.

## ROC and calibration

R: `pROC::roc()` for the curve and `ci.auc()`; draw with `geom_path` + `geom_abline(linetype = "dashed")` + `coord_equal()`; annotate "AUC, 0.81 (95% CI, 0.77-0.85)" at 8 pt. Calibration: bin into risk deciles (`dplyr::ntile(risk, 10)`, or base `cut()` at `quantile(risk, 0:10 / 10)` as in the asset block), plot observed vs predicted with `geom_abline`, add `geom_histogram(aes(risk))` below with `patchwork` heights `c(4, 1)`; print intercept and slope from `glm(outcome ~ qlogis(risk), family = binomial)`.

Python: `roc_plot(y_true, y_score, label="Model", auc_ci=(0.77, 0.85))`; `calibration_plot(y_true, y_prob, n_bins=10, strategy="quantile", intercept_slope=(0.02, 0.96))`. Both import scikit-learn lazily; compute the AUC CI (bootstrap or DeLong) in the analysis script and pass it in.

## Flow diagram

R (`consort` package): `out <- consort_plot(data = df, orders = c(trialno = "Population", exc = "Excluded", arm = "Randomized", fow1 = "Lost to follow-up", trialno = "Final"), side_box = c("exc", "fow1"), allocation = "arm", labels = c("1" = "Screening", "2" = "Randomization", "4" = "Final analysis"))`, then `plot(out)`; save with `pdf("analysis/publication/figures/fig1.pdf", width = 7, height = 6); plot(out); dev.off()` (cairo_pdf for embedded fonts). Verify the `orders` keys against the package help for the installed version (checked with consort 1.2.4).

Python (graphviz): `g = graphviz.Digraph(graph_attr={"rankdir": "TB", "fontname": "Arial"}, node_attr={"shape": "box", "fontname": "Arial", "fontsize": "8", "penwidth": "0.75"}, edge_attr={"penwidth": "0.75"})`; `g.node("a", "Assessed for eligibility (n = 1204)")`; `g.edge("a", "b")`; `g.render("analysis/publication/figures/fig1", format="pdf", cleanup=True)`. Counts come from the analysis dataset, never typed by hand.

## Multi-panel

R: `library(patchwork); (p1 | p2) / p3 + plot_layout(guides = "collect") + plot_annotation(tag_levels = "A") & theme(legend.position = "bottom")`; `save_figure(panel, "fig4.pdf", width_in = 7, height_in = 6)`. `theme_clinical()` places tags in the plot margin (`plot.tag.location = "margin"`) so they never overlap a y-axis title. With ggplot2 >= 4.0 use patchwork >= 1.3; patchwork 1.2 fails on `& theme(...)`.

Python: `fig, axes = plt.subplots(2, 2, figsize=(7, 6), sharey="row"); ...; add_panel_labels(axes); fig.align_labels(); handles, labels = axes[0, 0].get_legend_handles_labels(); fig.legend(handles, labels, loc="lower center", ncol=3, frameon=False); fig.tight_layout(rect=(0, 0.05, 1, 1)); save_figure(fig, "fig4.pdf", width_in=7, height_in=6)`.

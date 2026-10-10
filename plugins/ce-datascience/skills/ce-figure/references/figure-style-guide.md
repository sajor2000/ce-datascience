# Clinical Publication Figure Style Guide

The `clinical-standard` profile: a journal-neutral default for scientific figures in R (ggplot2) and Python (matplotlib, seaborn, lifelines). Its defaults were derived from JAMA Network's figure instructions for authors (https://jamanetwork.com/journals/jama/pages/instructions-for-authors) and apply broadly; when the user names a target journal, that journal's live instructions override anything here, and the journal override profile in `references/figure-style-profiles.yaml` records only what the journal changes.

Code that implements these rules: `assets/theme_clinical.R` (ggplot2) and `assets/clinical_style.py` plus `assets/clinical.mplstyle` (matplotlib). Call recipes per figure type: `references/r-and-python-recipes.md`.

## Contents

- Typography
- Sizing and export
- Axes
- Color and marks
- Legends
- Titles, captions, and alt text
- Figure-type checklists
- Before-export checklist
- Common failures

## Typography

- Font: Arial. Helvetica is equivalent. When neither is installed, use Liberation Sans (metric-compatible with Arial) or DejaVu Sans and say so in the figure notes.
  - R: `systemfonts::system_fonts()$family` lists installed families; `systemfonts::match_fonts("Arial")$path` shows what "Arial" resolves to. `theme_clinical()` runs this check and warns on fallback.
  - Python: `{f.name for f in matplotlib.font_manager.fontManager.ttflist}` lists installed families; `font_manager.findfont("Arial")` shows the resolved file. `apply_clinical_style()` runs this check and warns on fallback. After installing a font, delete the matplotlib font cache (`matplotlib.get_cachedir()`) and restart the kernel.
- Sizes at final print width: figure title 12 pt bold (caption-level title; usually not drawn inside the figure); axis titles 10 pt; tick labels 8-9 pt; legend text 8-10 pt; annotations, risk-table numbers, footnotes 8 pt minimum; panel labels A, B, C 12 pt bold, upper-left, outside the plot area.
- Nothing below 8 pt after scaling. Design at the final width so point sizes are real; a 14 in figure scaled to 7 in halves every size.
- One font family and one weight scheme per figure set. Bold only for panel labels, subgroup headings, and (when present) panel titles.
- Sentence case for axis titles and legend entries; title case for the caption title.

## Sizing and export

| Target | Width | Notes |
|---|---|---|
| Single column | 3.5 in (89 mm) | Default for one panel |
| 1.5 column | 5 in (127 mm) | Two small panels or a KM with wide risk table |
| Double column | 7 in (178 mm) | Multi-panel, forest plots |
| Max height | 9 in (229 mm) | Including risk tables and footnotes |

- Design at final size: set `width_in`/`height_in` in `save_figure()` to the target column width and check text sizes there. Never render large and scale down.
- Vector first: PDF (default), EPS, or SVG for every line-art figure (KM, forest, dot, scatter, box, calibration, ROC, flow diagrams). Fonts embedded: `cairo_pdf` in R; `pdf.fonttype = 42` and `svg.fonttype = "none"` in matplotlib.
- Raster only when required or for review copies: TIFF or PNG at 300 dpi; 600 dpi for line art rendered as raster; LZW-compressed TIFF. Never upsample.
- White background, no transparency in EPS (use solid lighter fills for CI bands when EPS is required), no alpha in exported PDFs if the journal re-creates figures.
- Naming: `fig1.pdf`, `fig1.png` (review copy), `fig1-source.csv`, `fig1.R` or `fig1.py` or the notebook that renders it. Multi-panel figures stay one file unless the journal asks for separate components.
- Statistical-software native formats (`.rds`, `.pkl`, `.fig`, Excel charts) are never the only deliverable.

## Axes

- Open frame: left and bottom axis lines only (no top or right spines), black, 0.5-0.75 pt.
- Ticks outward (or inward if the project already uses inward), consistently across all figures; 3 pt long; tick labels horizontal. If category labels collide, wrap them or flip the plot; do not rotate 45 degrees in a publication figure.
- Axis titles name the quantity and the unit after a comma: "Time Since Randomization, mo"; "Patients, No."; "Lactate, mmol/L"; "Cumulative Incidence, %"; "Hazard Ratio (95% CI)". Abbreviate units (mo, d, h, min, y) and define any non-standard abbreviation in the caption.
- Counts, proportions, and percentages start at 0 and the axis is unbroken. Do not truncate a count axis; if an axis must start above 0 for a measured quantity, say so in the caption.
- Breaks in whole numbers at sensible intervals (0, 3, 6, 9, 12 months; 0, 25, 50, 75, 100 %); 4-7 major breaks per axis.
- Ratio measures (HR, OR, RR, IRR) on a log scale with a solid reference line at 1 and symmetric breaks (0.25, 0.5, 1, 2, 4). Differences use a linear scale with a reference line at 0.
- No minor gridlines. No major gridlines by default; if the plot needs them for reading values (long time series, heat maps), use light gray (`#D9D9D9`) 0.25 pt lines behind the data.
- Panels that will be compared share identical axis ranges and breaks. Panels that will not be compared may differ, and the caption says so.
- Log-transformed concentrations show original-unit tick labels (1, 10, 100), not exponents.

## Color and marks

- Default palette (Okabe-Ito, colorblind-safe), used in this order: blue `#0072B2`, vermilion `#D55E00`, bluish green `#009E73`, orange `#E69F00`, reddish purple `#CC79A7`, sky blue `#56B4E9`; black `#000000` and yellow `#F0E442` are reserved for reference lines and highlights.
- At most 6 categories per figure. Beyond 6, facet or collapse categories.
- Grayscale-legible: vary line type (solid, dashed, dotted) or marker shape (circle, square, triangle) in addition to color whenever lines or points overlap, so a black-and-white print or photocopy still reads.
- Two-group default: blue solid vs vermilion dashed. Control or reference group in black or gray when the comparison is "treatment vs usual care".
- No 3-D effects, gradients, drop shadows, pie charts, stacked 3-D bars, background images, or decorative icons.
- Lines 0.75-1 pt (data), 0.5 pt (reference), 0.25-0.4 pt (gridlines). Points 1.5-2.5 mm diameter (ggplot2 `size` 0.8-1.5; matplotlib `markersize` 3-5).
- Filled markers for primary series; open markers (`shape = 1`, `fillstyle = "none"`) for secondary or imputed values. Censor marks as short vertical ticks (`|`) or `+`.
- Error bars: thin (0.5 pt), caps absent or 1-2 pt; CI bands at alpha 0.15-0.2 in the series color, drawn below the line.
- Overplotting: alpha 0.3-0.5 for points, or hex/2-D density when n > 5000. Jitter only along the categorical axis.
- Sequential data: a single-hue or viridis-type ramp; diverging data: blue-white-red centered on the null; never rainbow or jet.

## Legends

- Put the legend outside the data region (top, right, or below) or in whitespace the data never reaches (for KM: lower left; for ROC: lower right). Never over data.
- Prefer direct labels at the end of lines or next to groups when there are 2-4 series; drop the legend when direct labels are complete.
- Legend order matches the visual order at the right edge (top curve first) or the logical order (intervention before control).
- No legend title unless the mapping is not obvious from the caption; no frame, no background box.
- Keys show the same line type, marker, and fill as the plot; key size 8-10 pt.
- Define every symbol, line type, shading, and abbreviation used in the figure, in the legend or the caption.

## Titles, captions, and alt text

- The figure title lives in the caption (figure legend) in title case: "Figure 1. Kaplan-Meier Estimates of 90-Day Mortality by Treatment Group". A brief phrase, not a sentence or a result.
- No in-figure title when the caption carries it. Panel titles only in multi-panel figures, short and in sentence case ("A. Primary outcome"), left-aligned above the panel.
- The caption paragraph after the title:
  - defines every abbreviation used in the figure, in alphabetical order ("CI indicates confidence interval; HR, hazard ratio.");
  - states what error bars or shading show ("Error bars indicate 95% CIs." "Shaded areas indicate 95% CIs.");
  - gives n per group and the analysis population ("n = 412 intervention, n = 418 control; intention-to-treat");
  - names the statistical method and the comparison shown (log-rank P value, Cox model with covariates, mixed model);
  - notes any truncated or broken axis, any curve truncation, and any data excluded;
  - for multi-panel figures, states what each panel shows, by letter.
- Footnotes use superscript letters (a, b, c), not symbols.
- Manifest `caption` holds the full caption; `alt_text` holds the accessibility description.
- Alt text structure (1-3 sentences, 20-250 characters per sentence): chart type and layout; variables on each axis and the groups shown; the main pattern; one key number. Example: "Two Kaplan-Meier curves of survival probability over 12 months by treatment group. The intervention curve stays above control throughout; 12-month survival was 78% vs 71%."

## Figure-type checklists

### Kaplan-Meier and cumulative incidence

- Step function, not smoothed; one line type and color per group; censor marks as ticks.
- Number-at-risk table aligned under the x-axis at the same breaks as the ticks, one row per group, labelled "No. at risk"; 8 pt. R: `ggsurvfit::add_risktable(risktable_stats = "n.risk")` or `survminer::ggsurvplot(risk.table = TRUE)`; Python: `lifelines.plotting.add_at_risk_counts(*fitters, rows_to_show=["At risk"], ax=ax)`.
- y label "Survival Probability" (0-1) or "Cumulative Incidence, %" (0-100); start at 0; consider a 0-0.5 range only if stated in the caption. x label in whole units ("Time Since Randomization, mo") with breaks at the risk-table times.
- CI bands optional (alpha 0.15-0.2); if two bands overlap heavily, prefer lines.
- Do not draw a curve beyond the point where fewer than 10% of a group remains at risk unless the caption states the extent of follow-up.
- Caption: n per group, HR (95% CI) and model or log-rank P, what censoring marks mean, median follow-up.

### Forest plot

- x on a log scale for ratios, linear for differences; solid reference line at the null; "Favors X" / "Favors Y" labels under the axis on either side of the null.
- Estimates as squares sized by weight or n; pooled or overall estimate as a diamond spanning its CI at the bottom; subgroup headings bold with their rows indented.
- Text columns aligned with the rows: n (per arm when needed), events, estimate (95% CI) as text; P for interaction when subgroup effects are compared, printed once per subgroup.
- Column headers 8-9 pt bold; rows 8 pt; row height 0.25-0.3 in; no horizontal gridlines, optional light rule between subgroups.
- Caption states the model, the overall estimate, and that squares are proportional to weight.

### Bar and dot plots

- Prefer dot with 95% CI (point range) over bars with error bars ("dynamite plots"). Bars only for counts or proportions without uncertainty.
- Order categories meaningfully (by estimate, by time, or by protocol order), not alphabetically. Horizontal orientation when labels are long.
- Bar axis starts at 0 and is not broken; bars one fill, 0.5-0.7 of the slot, thin black outline or none; no 3-D, no gradients.
- Dodge groups with a legend or direct labels; at most 3 groups per category.

### Box and violin plots

- Show individual points (jitter along the category axis, alpha 0.5) when n per group < 50, and hide the box's own outlier points to avoid double-plotting.
- Define the box (median, IQR) and whiskers (1.5 x IQR, or 5th-95th percentiles) in the caption; print n per group under the category label or in the caption.
- Violins only when n per group >= 50; trim to the data range; same whisker definition statement.

### Scatter plots

- Alpha 0.3-0.6 and small points; hex bins or 2-D density above ~5000 points.
- Fitted line with CI band only when a model was fitted, named in the caption (linear, LOESS with span).
- Equal aspect ratio and identity line when x and y share units (Bland-Altman, predicted vs observed).
- Correlation coefficient with 95% CI in an annotation (8 pt) or the caption, never a bare r.

### Line and time series

- Direct labels at the line ends; consistent time units and breaks across panels; markers only at measured times.
- CI bands or error bars defined in the caption; do not connect points across missing visits without stating it.
- Number of patients contributing at each time under the axis when attrition is material (like a risk table).

### Histogram and density

- Histogram bins stated (count or width) in the caption; density only with n >= 100 and the bandwidth method named.
- y label "Patients, No." or "Density"; counts start at 0.
- Overlaid groups use alpha 0.4 fills with outlines, or side-by-side panels when more than 2 groups.

### Heat map

- Sequential palette (viridis, Blues) for magnitudes; diverging palette (blue-white-red) centered on the null for differences or correlations; never rainbow.
- Colorbar labelled with the quantity and unit ("Correlation Coefficient"; "Standardized Mean Difference"); 4-6 ticks; legend text 8 pt.
- Cell values printed only when the grid is <= 12 x 12 and text stays >= 8 pt; rows and columns ordered by clustering or clinical grouping, stated in the caption.
- Square cells; thin white cell borders; no 3-D.

### ROC and calibration

- ROC: axes "1 - Specificity" and "Sensitivity", 0-1, equal aspect; dashed gray diagonal reference; AUC with 95% CI in the legend ("Model (AUC, 0.81 [95% CI, 0.77-0.85])"); legend lower right.
- Calibration: axes "Predicted Risk" and "Observed Proportion", 0-1, equal aspect; dashed diagonal reference; binned points or a flexible curve with CI; calibration intercept and slope (with 95% CI) printed in the panel or caption; histogram or rug of predicted risk under the plot, y "Patients, No.".
- State the validation set (apparent, internal, external) and n with events in the caption.

### Correlation matrix

- Lower (or upper) triangle only; diverging palette centered on 0; variable names as full labels in row order matching the manuscript; coefficient text only when it stays >= 8 pt.
- Mark non-significant or unstable cells by blanking or hatching, defined in the caption.

### Flow diagram (CONSORT, STROBE, PRISMA)

- Counts at every node; exclusions in side boxes with reasons and counts that sum to the parent box; one box per stage (assessed, excluded, randomized or included, allocated, followed up, analyzed).
- R: `consort::consort_plot(data = df, order = c(...), side_box = c(...), allocation = "arm", labels = c(...))` then `plot(out)` or `plot(out, grViz = TRUE)`; Python: graphviz (`graphviz.Digraph`) with `fontname="Arial"`, `fontsize="8"`, rectangular nodes, vector PDF output.
- Arial 8-10 pt in boxes, black 0.5-0.75 pt borders, arrows straight, no color.
- Use the reporting guideline's own template order and wording (CONSORT 2010 flow, STROBE participant flow, PRISMA 2020).

### Multi-panel composition

- R: `patchwork` (`(p1 | p2) / p3 + plot_annotation(tag_levels = "A")`) or `cowplot::plot_grid(labels = "AUTO")`; Python: `plt.subplots(nrows, ncols, sharey=...)` with `add_panel_labels(axes)` and `fig.align_labels()`.
- Panel labels A, B, C 12 pt bold outside the upper-left of each panel; same order as the caption.
- Shared axes when panels are comparable (same range, same breaks, one y label); a single legend for shared mappings (`plot_layout(guides = "collect")`; `fig.legend`).
- Keep to 4 panels unless justified; equal panel sizes unless content dictates otherwise; consistent margins; total height <= 9 in.

## Before-export checklist

1. Final width set (3.5, 5, or 7 in) and height <= 9 in; nothing scaled down afterward.
2. Font resolved to Arial/Helvetica (or documented fallback); no text < 8 pt.
3. Axis titles with units in "Quantity, unit" form; count axes from 0; log scale with reference line for ratios.
4. Palette from the profile; <= 6 categories; grayscale check (print preview or convert to gray).
5. Legend outside data or in clear whitespace; order matches the plot; no frame.
6. No in-figure title (unless multi-panel panel titles); panel labels present and ordered.
7. Caption: "Figure n. Title" + abbreviations + error bar or shading definition + n per group + method + axis notes.
8. Alt text: type, variables, pattern, one number.
9. KM: risk table present and aligned; forest: text columns and reference line; calibration/ROC: diagonal.
10. Export vector PDF (plus PNG review copy), fonts embedded, white background.
11. Open the exported file (not the notebook preview) and inspect for overlap, clipping, and legend placement.
12. Manifest entry complete; validator run; source data and script committed next to the figure.

## Common failures

- Overlapping or rotated tick labels (fix: wrap labels, horizontal orientation, fewer breaks).
- Legend drawn over data, or a boxed legend floating in the panel.
- Text below 8 pt after scaling, usually from exporting at 10 x 8 in and shrinking.
- Mixed fonts (axis in Arial, annotation in DejaVu) because one layer did not inherit the theme or rcParams.
- Rainbow or default-library palettes (`jet`, ggplot2 hue) that are not colorblind-safe or grayscale-legible.
- Truncated y-axis on a count or proportion plot with no caption note.
- Missing units in axis titles ("Time" instead of "Time, mo").
- Kaplan-Meier without a number-at-risk table, or a table whose times do not match the x breaks.
- Forest plot on a linear axis, or without a reference line at 1.
- Bars with error bars where a dot-and-CI would show the estimate honestly.
- Figures exported from the notebook preview (`plt.show()`, RStudio Plots pane) instead of `save_figure()` at final size.
- Transparency in EPS, or PDF fonts not embedded (Type 3 fonts), which print as bitmaps.

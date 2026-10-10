# theme_clinical.R -- journal-neutral clinical publication figure style for ggplot2.
#
# Implements the `clinical-standard` profile from references/figure-style-guide.md:
# Arial/Helvetica (with fallbacks), 12 pt bold figure titles, 10 pt axis titles,
# 8 pt tick and legend text, open top/right axes, no gridlines, Okabe-Ito colors,
# vector export at final column width with embedded fonts.
#
# Required: ggplot2 (>= 3.4), systemfonts.
# Optional: ragg (PNG/TIFF), ggsurvfit or survminer (Kaplan-Meier), patchwork
#           (multi-panel), pROC (ROC), consort (flow diagrams).
#
# Recommended use: copy this file into the project (for example
# analysis/scripts/theme_clinical.R) so the figure stays reproducible without the
# plugin, then `source("analysis/scripts/theme_clinical.R")`.
# RStudio: run the script or a chunk; the Plots pane preview is not the export.
# Always call save_figure() at final size and inspect the exported file.

clinical_palette <- c(
  "#0072B2", # blue
  "#D55E00", # vermilion
  "#009E73", # bluish green
  "#E69F00", # orange
  "#CC79A7", # reddish purple
  "#56B4E9", # sky blue
  "#000000", # black
  "#F0E442"  # yellow (last: poor on white)
)

clinical_column_widths_in <- c(single = 3.5, one_and_half = 5, double = 7)
clinical_max_height_in <- 9

clinical_font_preference <- c("Arial", "Helvetica", "Liberation Sans", "DejaVu Sans")

# Return the first preferred font family installed on this machine.
# Warns when it has to fall back from Arial/Helvetica.
clinical_font <- function(preferred = clinical_font_preference) {
  if (!requireNamespace("systemfonts", quietly = TRUE)) {
    warning("systemfonts not installed; cannot verify fonts. Using 'sans'.", call. = FALSE)
    return("sans")
  }
  installed <- unique(systemfonts::system_fonts()$family)
  for (fam in preferred) {
    if (fam %in% installed) {
      if (!fam %in% c("Arial", "Helvetica")) {
        warning("Arial/Helvetica not installed; falling back to ", fam,
                ". Install Arial (or Liberation Sans) before final export.", call. = FALSE)
      }
      return(fam)
    }
  }
  warning("None of the preferred sans-serif fonts are installed; using 'sans'.", call. = FALSE)
  "sans"
}

# ggplot2 theme implementing the clinical-standard profile.
# base_size is the body/axis-title size in points; tick and legend text are
# derived so nothing falls below 8 pt at the default base_size = 10.
theme_clinical <- function(base_size = 10, base_family = "Arial",
                           base_line_size = 0.75 / 2.13) {
  if (identical(base_family, "Arial")) base_family <- clinical_font()
  small <- max(8, base_size * 0.8)
  ggplot2::theme_classic(base_size = base_size, base_family = base_family,
                         base_line_size = base_line_size) +
    ggplot2::theme(
      text = ggplot2::element_text(colour = "black"),
      plot.title = ggplot2::element_text(size = 12, face = "bold", hjust = 0),
      plot.title.position = "plot",
      plot.subtitle = ggplot2::element_text(size = base_size),
      plot.caption = ggplot2::element_text(size = small, hjust = 0),
      plot.caption.position = "plot",
      plot.tag = ggplot2::element_text(size = 12, face = "bold"),
      plot.tag.position = c(0, 1),
      plot.background = ggplot2::element_rect(fill = "white", colour = NA),
      panel.background = ggplot2::element_rect(fill = "white", colour = NA),
      panel.grid.major = ggplot2::element_blank(),
      panel.grid.minor = ggplot2::element_blank(),
      axis.line = ggplot2::element_line(colour = "black", linewidth = base_line_size),
      axis.ticks = ggplot2::element_line(colour = "black", linewidth = base_line_size),
      axis.ticks.length = ggplot2::unit(3, "pt"),
      axis.title = ggplot2::element_text(size = base_size),
      axis.title.y = ggplot2::element_text(margin = ggplot2::margin(r = 6)),
      axis.title.x = ggplot2::element_text(margin = ggplot2::margin(t = 6)),
      axis.text = ggplot2::element_text(size = small, colour = "black"),
      axis.text.x = ggplot2::element_text(angle = 0, hjust = 0.5),
      legend.text = ggplot2::element_text(size = small),
      legend.title = ggplot2::element_text(size = small),
      legend.background = ggplot2::element_blank(),
      legend.key = ggplot2::element_blank(),
      legend.key.size = ggplot2::unit(10, "pt"),
      legend.position = "right",
      strip.background = ggplot2::element_blank(),
      strip.text = ggplot2::element_text(size = base_size, face = "bold", hjust = 0),
      plot.margin = ggplot2::margin(6, 10, 6, 6)
    )
}

# Okabe-Ito discrete scales (max 6 categories recommended).
scale_color_clinical <- function(...) {
  ggplot2::scale_colour_manual(values = clinical_palette, ...)
}
scale_colour_clinical <- scale_color_clinical
scale_fill_clinical <- function(...) {
  ggplot2::scale_fill_manual(values = clinical_palette, ...)
}

# Export at final size. PDF uses cairo_pdf (embeds fonts); SVG uses svglite when
# available; EPS uses cairo_ps (no transparency allowed); PNG/TIFF use ragg when
# installed, otherwise grDevices. `also` adds review copies (e.g. "png").
save_figure <- function(plot, path, width_in = 7, height_in = 4.5, dpi = 300,
                        also = character(0)) {
  if (height_in > clinical_max_height_in) {
    warning("height_in exceeds ", clinical_max_height_in, " in; most journals cap page height at 9 in.", call. = FALSE)
  }
  dir.create(dirname(path), showWarnings = FALSE, recursive = TRUE)
  targets <- c(path, vapply(also, function(ext) {
    sub("\\.[A-Za-z0-9]+$", paste0(".", sub("^\\.", "", ext)), path)
  }, character(1)))
  for (target in targets) {
    ext <- tolower(tools::file_ext(target))
    if (ext == "pdf") {
      ggplot2::ggsave(target, plot, device = grDevices::cairo_pdf,
                      width = width_in, height = height_in, units = "in", bg = "white")
    } else if (ext == "eps") {
      ggplot2::ggsave(target, plot, device = grDevices::cairo_ps, fallback_resolution = 600,
                      width = width_in, height = height_in, units = "in", bg = "white")
    } else if (ext == "svg") {
      ggplot2::ggsave(target, plot, device = "svg",
                      width = width_in, height = height_in, units = "in", bg = "white")
    } else if (ext == "png") {
      dev <- if (requireNamespace("ragg", quietly = TRUE)) ragg::agg_png else grDevices::png
      ggplot2::ggsave(target, plot, device = dev, dpi = dpi,
                      width = width_in, height = height_in, units = "in", bg = "white")
    } else if (ext %in% c("tif", "tiff")) {
      dev <- if (requireNamespace("ragg", quietly = TRUE)) ragg::agg_tiff else grDevices::tiff
      ggplot2::ggsave(target, plot, device = dev, dpi = dpi, compression = "lzw",
                      width = width_in, height = height_in, units = "in", bg = "white")
    } else {
      stop("Unsupported export format: ", ext, call. = FALSE)
    }
  }
  invisible(targets)
}

# ---------------------------------------------------------------------------
# Examples (not run). Each uses the project's own source data frame.
# ---------------------------------------------------------------------------
if (FALSE) {
  library(ggplot2)
  source("analysis/scripts/theme_clinical.R")
  theme_set(theme_clinical())

  # Kaplan-Meier with number-at-risk table (ggsurvfit) ---------------------
  library(ggsurvfit)
  km <- survfit2(Surv(time_mo, event) ~ arm, data = dat) |>
    ggsurvfit(linewidth = 0.75) +
    add_censor_mark(shape = 3, size = 1.5) +
    add_risktable(risktable_stats = "n.risk", stats_label = list(n.risk = "No. at risk"),
                  times = seq(0, 12, by = 3)) +
    scale_ggsurvfit(x_scales = list(breaks = seq(0, 12, by = 3))) +
    scale_color_clinical() +
    labs(x = "Time Since Randomization, mo", y = "Survival Probability") +
    theme_clinical() +
    theme(legend.position = "inside", legend.position.inside = c(0.15, 0.2))
  save_figure(km, "analysis/publication/figures/fig1.pdf", width_in = 3.5, height_in = 3.6, also = "png")

  # Kaplan-Meier with number-at-risk table (survminer alternative) ---------
  library(survminer)
  fit <- survival::survfit(survival::Surv(time_mo, event) ~ arm, data = dat)
  sm <- ggsurvplot(fit, data = dat, risk.table = TRUE, risk.table.height = 0.25,
                   censor.shape = "|", censor.size = 2, conf.int = FALSE,
                   break.time.by = 3, xlab = "Time Since Randomization, mo",
                   ylab = "Survival Probability", legend.title = "",
                   palette = clinical_palette[1:2], ggtheme = theme_clinical(),
                   tables.theme = theme_clinical(), fontsize = 3)
  ggsave("analysis/publication/figures/fig1.pdf", sm, device = cairo_pdf, width = 3.5, height = 3.6)

  # Forest plot (log x, reference at 1, square by weight) -------------------
  fp <- ggplot(sub, aes(x = hr, y = forcats::fct_rev(subgroup))) +
    geom_vline(xintercept = 1, linewidth = 0.4) +
    geom_errorbarh(aes(xmin = lower, xmax = upper), height = 0, linewidth = 0.5) +
    geom_point(aes(size = n), shape = 15, show.legend = FALSE) +
    scale_x_log10(breaks = c(0.25, 0.5, 1, 2, 4)) +
    scale_size_area(max_size = 3) +
    labs(x = "Hazard Ratio (95% CI)", y = NULL) +
    theme_clinical() + theme(axis.line.y = element_blank(), axis.ticks.y = element_blank())
  save_figure(fp, "analysis/publication/figures/fig2.pdf", width_in = 7, height_in = 4)

  # Dot + 95% CI (instead of dynamite bars) ----------------------------------
  dp <- ggplot(est, aes(x = estimate, y = forcats::fct_rev(outcome), colour = arm)) +
    geom_pointrange(aes(xmin = lower, xmax = upper), position = position_dodge(width = 0.5),
                    size = 0.3, linewidth = 0.5) +
    scale_color_clinical() +
    labs(x = "Risk Difference, % (95% CI)", y = NULL, colour = NULL) +
    theme_clinical() + theme(legend.position = "top")

  # Box plot with individual points (small n) ---------------------------------
  bp <- ggplot(dat, aes(x = arm, y = lactate)) +
    geom_boxplot(outlier.shape = NA, width = 0.5, linewidth = 0.4) +
    geom_jitter(width = 0.12, size = 0.8, alpha = 0.5) +
    scale_y_continuous(limits = c(0, NA)) +
    labs(x = NULL, y = "Lactate, mmol/L") +
    theme_clinical()

  # ROC -------------------------------------------------------------------------
  library(pROC)
  r <- roc(dat$outcome, dat$risk, quiet = TRUE)
  roc_df <- data.frame(fpr = 1 - r$specificities, tpr = r$sensitivities)
  rp <- ggplot(roc_df, aes(fpr, tpr)) +
    geom_abline(slope = 1, intercept = 0, linetype = "dashed", colour = "gray50", linewidth = 0.4) +
    geom_path(colour = clinical_palette[1]) +
    coord_equal() +
    labs(x = "1 - Specificity", y = "Sensitivity") +
    annotate("text", x = 0.6, y = 0.1, hjust = 0, size = 8 / .pt,
             label = sprintf("AUC, %.2f (95%% CI, %.2f-%.2f)", auc(r), ci(r)[1], ci(r)[3])) +
    theme_clinical()

  # Calibration (binned observed vs predicted + histogram) ----------------------
  cal <- dat |>
    dplyr::mutate(bin = dplyr::ntile(risk, 10)) |>
    dplyr::group_by(bin) |>
    dplyr::summarise(pred = mean(risk), obs = mean(outcome), n = dplyr::n())
  cp <- ggplot(cal, aes(pred, obs)) +
    geom_abline(slope = 1, intercept = 0, linetype = "dashed", colour = "gray50", linewidth = 0.4) +
    geom_line(colour = clinical_palette[1]) + geom_point(colour = clinical_palette[1]) +
    coord_equal(xlim = c(0, 1), ylim = c(0, 1)) +
    labs(x = "Predicted Risk", y = "Observed Proportion") +
    theme_clinical()
  hp <- ggplot(dat, aes(risk)) + geom_histogram(bins = 20, fill = "gray60") +
    labs(x = "Predicted Risk", y = "Patients, No.") + theme_clinical()

  # Multi-panel with patchwork (tags A, B outside upper-left) --------------------
  library(patchwork)
  panel <- (cp / hp) + plot_layout(heights = c(4, 1)) + plot_annotation(tag_levels = "A")
  save_figure(panel, "analysis/publication/figures/fig3.pdf", width_in = 3.5, height_in = 4.5)
}

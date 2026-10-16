# theme_clinical.R -- journal-neutral clinical publication figure style for ggplot2.
#
# Implements the `clinical-standard` profile from references/figure-style-guide.md:
# Arial/Helvetica (with fallbacks), 12 pt bold figure titles, 10 pt axis titles,
# 8 pt tick and legend text, open top/right axes, no gridlines, Okabe-Ito colors,
# vector export at final column width with embedded fonts.
#
# Required: ggplot2 (>= 3.5), systemfonts.
# Optional: ragg (PNG/TIFF), ggsurvfit or survminer (Kaplan-Meier), patchwork
#           (multi-panel), pROC (ROC), consort (flow diagrams).
#
# Recommended use: copy this file into the project (for example
# analysis/scripts/theme_clinical.R) so the figure stays reproducible without the
# plugin, then `source("analysis/scripts/theme_clinical.R")`. The `if (FALSE)`
# block at the end is a runnable example set (survival::lung plus simulated data).
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
      plot.tag.position = "topleft",
      plot.tag.location = "margin",
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

# "estimate (lower-upper)" text for forest-plot and table columns; NA -> "".
format_estimate_ci <- function(estimate, lower, upper, digits = 2) {
  f <- function(x) formatC(x, format = "f", digits = digits)
  out <- paste0(f(estimate), " (", f(lower), "-", f(upper), ")")
  out[is.na(estimate)] <- ""
  out
}

# P values in journal form: 2 decimals without the leading zero, 3 decimals
# below .01, "<.001" below .001, ">.99" at the top; NA -> "".
format_p_value <- function(p) {
  out <- ifelse(p < 0.001, "<.001",
         ifelse(p < 0.01, formatC(p, format = "f", digits = 3),
         ifelse(p >= 0.995, ">.99", formatC(p, format = "f", digits = 2))))
  out <- sub("^0", "", out)
  out[is.na(p)] <- ""
  out
}

# Publication forest plot (clinical-standard): text columns for subgroup and n
# on the left, the estimate panel in the middle (log x by default, solid
# reference line at the null, squares sized by `weight` or by 1/SE^2, diamond
# for the pooled estimate), "estimate (95% CI)" and optional P-for-interaction
# text columns on the right, and "Favors A / Favors B" labels under the axis.
#
# Column arguments (estimate, lower, upper, label, n, group, weight,
# p_interaction) are column names in `data`. Rows are drawn top to bottom in
# the order given. `group` names a subgroup column: a bold heading row is
# inserted before each run of members, members are indented, and the P for
# interaction is printed once on the heading row. Rows with NA/"" group get no
# heading. `pooled` is either a list(label, estimate, lower, upper, n) drawn
# as a diamond on a separate bottom row, or the name of a logical column that
# marks that row inside `data`. `favors = NULL` drops the favors row and puts
# `x_title` on the axis instead. `breaks` overrides the automatic symmetric
# log breaks (0.25 ... 4) or the linear breaks. Returns a patchwork object;
# save with save_figure(); row height 0.25-0.3 in gives ~4 in for 10 rows.
forest_plot_clinical <- function(data, estimate, lower, upper, label, n = NULL, group = NULL,
                                 pooled = NULL, weight = NULL, p_interaction = NULL,
                                 x_title = "Hazard Ratio (95% CI)",
                                 favors = c("Favors treatment", "Favors control"),
                                 log_scale = TRUE, breaks = NULL, digits = 2) {
  if (!requireNamespace("patchwork", quietly = TRUE)) {
    stop("forest_plot_clinical() needs the patchwork package.", call. = FALSE)
  }
  `%||%` <- function(a, b) if (is.null(a)) b else a
  pick <- function(name, default) {
    if (is.null(name)) return(rep(default, nrow(data)))
    if (!name %in% names(data)) stop("Column '", name, "' not found in data.", call. = FALSE)
    data[[name]]
  }
  d <- data.frame(label = as.character(pick(label, NA)), est = as.numeric(pick(estimate, NA)),
                  lo = as.numeric(pick(lower, NA)), hi = as.numeric(pick(upper, NA)),
                  n = as.numeric(pick(n, NA)), w = as.numeric(pick(weight, NA)),
                  grp = as.character(pick(group, NA)), p = as.numeric(pick(p_interaction, NA)),
                  type = "plain", stringsAsFactors = FALSE)
  pooled_row <- NULL
  if (is.character(pooled) && length(pooled) == 1) {
    is_pooled <- as.logical(pick(pooled, FALSE)) %in% TRUE
    pooled_row <- d[which(is_pooled)[1], , drop = FALSE]
    d <- d[!is_pooled, , drop = FALSE]
  } else if (!is.null(pooled)) {
    pooled <- as.list(pooled)
    pooled_row <- data.frame(label = pooled$label %||% "Overall", est = pooled$estimate,
                             lo = pooled$lower, hi = pooled$upper, n = pooled$n %||% NA_real_,
                             w = NA_real_, grp = NA_character_, p = NA_real_, type = "pooled",
                             stringsAsFactors = FALSE)
  }
  # Weight: 1/SE^2 (on the log scale for ratios) unless a weight column is given.
  tr <- if (log_scale) log else identity
  if (all(is.na(d$w))) d$w <- (2 * stats::qnorm(0.975) / (tr(d$hi) - tr(d$lo)))^2
  d$w[is.na(d$w) & !is.na(d$est)] <- mean(d$w, na.rm = TRUE)
  # Subgroup headings: one bold row before each run of members.
  if (!is.null(group)) {
    has_grp <- !is.na(d$grp) & nzchar(d$grp)
    key <- ifelse(has_grp, d$grp, paste0(".row", seq_len(nrow(d))))
    run <- cumsum(c(TRUE, key[-1] != key[-length(key)]))
    d <- do.call(rbind, lapply(split(seq_len(nrow(d)), run), function(idx) {
      if (!has_grp[idx[1]]) return(d[idx, , drop = FALSE])
      h <- d[idx[1], , drop = FALSE]
      h$label <- d$grp[idx[1]]
      h$est <- h$lo <- h$hi <- h$n <- h$w <- NA_real_
      pp <- d$p[idx]
      h$p <- if (any(!is.na(pp))) pp[!is.na(pp)][1] else NA_real_
      h$type <- "heading"
      m <- d[idx, , drop = FALSE]
      m$type <- "member"
      m$p <- NA_real_
      rbind(h, m)
    }))
  }
  n_main <- nrow(d)
  d$y <- rev(seq_len(n_main))
  if (!is.null(pooled_row)) {
    pooled_row$type <- "pooled"
    pooled_row$y <- 0  # one empty row above the pooled diamond
    d <- rbind(d, pooled_row)
  }
  y_head <- n_main + 1
  ylim <- c(min(d$y) - 0.6, y_head + 0.5)
  d$est_txt <- format_estimate_ci(d$est, d$lo, d$hi, digits)
  d$n_txt <- ifelse(is.na(d$n), "", format(d$n, big.mark = ",", trim = TRUE))
  d$p_txt <- format_p_value(d$p)
  d$face <- ifelse(d$type %in% c("heading", "pooled"), "bold", "plain")
  d$x_lab <- ifelse(d$type == "member", 0.12, 0.02)

  # x scale shared by the estimate panel and the favors row.
  ref <- if (log_scale) 1 else 0
  xr <- range(c(d$lo, d$hi, ref), na.rm = TRUE)
  if (is.null(breaks)) {
    if (log_scale) {
      m <- max(1 / xr[1], xr[2], 1.01)
      breaks <- if (m <= 2) c(0.5, 1, 2) else if (m <= 4) c(0.25, 0.5, 1, 2, 4) else
        if (m <= 10) c(0.1, 0.2, 0.5, 1, 2, 5, 10) else 10^seq(-ceiling(log10(m)), ceiling(log10(m)))
    } else {
      breaks <- scales::breaks_extended()(xr)
    }
  }
  xlim <- range(c(breaks, xr))
  fmt <- function(x) format(x, drop0trailing = TRUE, trim = TRUE, scientific = FALSE)
  x_scale <- function() {
    if (log_scale) {
      ggplot2::scale_x_log10(breaks = breaks, limits = xlim, labels = fmt, oob = scales::oob_squish,
                             expand = ggplot2::expansion(mult = 0.03))
    } else {
      ggplot2::scale_x_continuous(breaks = breaks, limits = xlim, labels = fmt, oob = scales::oob_squish,
                                  expand = ggplot2::expansion(mult = 0.03))
    }
  }
  y_scale <- function() ggplot2::scale_y_continuous(expand = c(0, 0))
  rows <- function() ggplot2::coord_cartesian(ylim = ylim, clip = "off")
  base <- theme_clinical()
  fam <- base$text$family
  txt <- function(..., size = 8, face = "plain") {
    ggplot2::annotate("text", ..., size = size / ggplot2::.pt, family = fam, fontface = face)
  }
  text_theme <- ggplot2::theme_void(base_family = fam) +
    ggplot2::theme(plot.margin = ggplot2::margin(0, 0, 0, 0),
                   plot.background = ggplot2::element_rect(fill = "white", colour = NA))
  # Width of 8-pt text in inches (systemfonts measures; fallback 0.06 in per character).
  text_w <- function(x, bold = FALSE) {
    x <- x[!is.na(x)]
    if (!length(x)) return(0)
    if (requireNamespace("systemfonts", quietly = TRUE) && !identical(fam, "sans")) {
      return(max(systemfonts::string_width(x, family = fam, bold = bold, size = 8, res = 72)) / 72)
    }
    max(nchar(x)) * 0.06
  }
  gap <- 0.15  # space between text columns, in inches

  # Left text panel: label (headings bold, members indented) and n.
  label_header <- if (is.null(group)) "" else "Subgroup"
  has_n <- any(nzchar(d$n_txt))
  left_w <- max(d$x_lab + text_w(d$label), text_w(label_header, TRUE)) + 0.04 +
    if (has_n) gap + max(text_w(d$n_txt), text_w("No.", TRUE)) else 0
  left <- ggplot2::ggplot(d) +
    ggplot2::geom_text(ggplot2::aes(x = x_lab, y = y, label = label, fontface = face),
                       hjust = 0, size = 8 / ggplot2::.pt, family = fam) +
    txt(x = 0.02, y = y_head, label = label_header, hjust = 0, face = "bold")
  if (has_n) {
    left <- left +
      ggplot2::geom_text(ggplot2::aes(x = left_w - 0.02, y = y, label = n_txt),
                         hjust = 1, size = 8 / ggplot2::.pt, family = fam) +
      txt(x = left_w - 0.02, y = y_head, label = "No.", hjust = 1, face = "bold")
  }
  left <- left + ggplot2::scale_x_continuous(limits = c(0, left_w), expand = c(0, 0)) +
    y_scale() + rows() + text_theme

  # Estimate panel.
  marks <- d[!is.na(d$est) & d$type != "pooled", , drop = FALSE]
  main <- ggplot2::ggplot() +
    ggplot2::geom_vline(xintercept = ref, linewidth = 0.35) +
    ggplot2::geom_errorbar(data = marks, ggplot2::aes(xmin = lo, xmax = hi, y = y),
                           width = 0, linewidth = 0.5) +
    ggplot2::geom_point(data = marks, ggplot2::aes(x = est, y = y, size = w), shape = 15,
                        show.legend = FALSE) +
    ggplot2::scale_size_area(max_size = 3.2)
  if (!is.null(pooled_row)) {
    dia <- data.frame(x = c(pooled_row$lo, pooled_row$est, pooled_row$hi, pooled_row$est),
                      y = pooled_row$y + c(0, 0.32, 0, -0.32))
    main <- main + ggplot2::geom_polygon(data = dia, ggplot2::aes(x = x, y = y), fill = "black")
  }
  main <- main + x_scale() + y_scale() + rows() +
    ggplot2::labs(x = if (is.null(favors)) x_title else NULL, y = NULL) +
    base +
    ggplot2::theme(axis.line.y = ggplot2::element_blank(), axis.ticks.y = ggplot2::element_blank(),
                   axis.text.y = ggplot2::element_blank(), plot.margin = ggplot2::margin(0, 6, 0, 6))

  # Right text panel: "estimate (95% CI)" and optional P for interaction.
  measure <- sub("\\s*\\(.*$", "", x_title)
  abbrev <- c("Hazard Ratio" = "HR", "Odds Ratio" = "OR", "Risk Ratio" = "RR", "Relative Risk" = "RR",
              "Incidence Rate Ratio" = "IRR", "Rate Ratio" = "RR", "Risk Difference" = "RD",
              "Mean Difference" = "MD")
  est_header <- paste0(if (measure %in% names(abbrev)) abbrev[[measure]] else measure, " (95% CI)")
  est_w <- 0.02 + max(text_w(d$est_txt, TRUE), text_w(est_header, TRUE))
  has_p <- any(nzchar(d$p_txt))
  right_w <- est_w + if (has_p) gap + max(text_w(d$p_txt), text_w("interaction", TRUE)) + 0.02 else 0.02
  right <- ggplot2::ggplot(d) +
    ggplot2::geom_text(ggplot2::aes(x = 0.02, y = y, label = est_txt, fontface = face),
                       hjust = 0, size = 8 / ggplot2::.pt, family = fam) +
    txt(x = 0.02, y = y_head, label = est_header, hjust = 0, face = "bold")
  if (has_p) {
    right <- right +
      ggplot2::geom_text(ggplot2::aes(x = est_w + gap, y = y, label = p_txt),
                         hjust = 0, size = 8 / ggplot2::.pt, family = fam) +
      txt(x = est_w + gap, y = y_head, label = "P for\ninteraction", hjust = 0, vjust = 0.6,
          face = "bold", lineheight = 0.85)
  }
  right <- right + ggplot2::scale_x_continuous(limits = c(0, right_w), expand = c(0, 0)) +
    y_scale() + rows() + text_theme

  widths <- grid::unit(c(left_w, 1, right_w), c("in", "null", "in"))
  if (is.null(favors)) {
    return(patchwork::wrap_plots(left, main, right, ncol = 3, widths = widths))
  }
  # Favors row: labels on either side of the null (top), then the axis title
  # (bottom). Height grows with multi-line favors labels ("Favors\ncontrol").
  x_mid <- if (log_scale) 10^mean(log10(xlim)) else mean(xlim)
  fav_lines <- max(lengths(strsplit(favors, "\n", fixed = TRUE)))
  fav_h <- 0.36 + 0.12 * (fav_lines - 1)
  fav <- ggplot2::ggplot() +
    txt(x = ref, y = 1, label = paste0(favors[1], "  "), hjust = 1, vjust = 1, lineheight = 0.9) +
    txt(x = ref, y = 1, label = paste0("  ", favors[2]), hjust = 0, vjust = 1, lineheight = 0.9) +
    txt(x = x_mid, y = 0, label = x_title, size = 10, hjust = 0.5, vjust = 0) +
    x_scale() + ggplot2::scale_y_continuous(limits = c(0, 1), expand = c(0, 0)) +
    ggplot2::coord_cartesian(clip = "off") + text_theme +
    ggplot2::theme(plot.margin = ggplot2::margin(2, 6, 0, 6))
  patchwork::wrap_plots(left, main, right, patchwork::plot_spacer(), fav, patchwork::plot_spacer(),
                        ncol = 3, widths = widths,
                        heights = grid::unit(c(1, fav_h), c("null", "in")))
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
# Examples (not run on source). Self-contained: after
#   source("analysis/scripts/theme_clinical.R")   # or the plugin asset path
# the whole block runs in a fresh session and writes to <tempdir()>/figures.
# Data are survival::lung and simulated frames; replace them with the project's
# own source data frame and point fig_dir at analysis/publication/figures.
# ---------------------------------------------------------------------------
if (FALSE) {
  library(ggplot2)
  if (!exists("theme_clinical")) source("analysis/scripts/theme_clinical.R")
  theme_set(theme_clinical())
  fig_dir <- file.path(tempdir(), "figures")
  dir.create(fig_dir, showWarnings = FALSE, recursive = TRUE)
  set.seed(20240601)

  # Kaplan-Meier with number-at-risk table (ggsurvfit) ------------------------
  library(ggsurvfit)
  km_dat <- data.frame(time_mo = survival::lung$time / 30.44,
                       event = survival::lung$status == 2,
                       group = factor(survival::lung$sex, labels = c("Male", "Female")))
  km <- survfit2(Surv(time_mo, event) ~ group, data = km_dat) |>
    ggsurvfit(linewidth = 0.75) +
    add_censor_mark(shape = 3, size = 1.5) +
    add_risktable(risktable_stats = "n.risk", stats_label = list(n.risk = "No. at risk"),
                  times = seq(0, 30, by = 6), size = 8 / .pt,
                  theme = theme_risktable_default(axis.text.y.size = 8, plot.title.size = 8)) +
    # expand leaves room for the t = 0 count; labels = waiver() keeps 0-1, not percent
    scale_ggsurvfit(x_scales = list(breaks = seq(0, 30, by = 6), expand = c(0.04, 0)),
                    y_scales = list(labels = waiver())) +
    scale_color_clinical() +
    labs(x = "Time Since Enrollment, mo", y = "Survival Probability") +
    theme_clinical() +
    theme(legend.position = "inside", legend.position.inside = c(0.15, 0.2))
  save_figure(km, file.path(fig_dir, "fig1-km.pdf"), width_in = 3.5, height_in = 3.6, also = "png")

  # Kaplan-Meier with number-at-risk table (survminer alternative) -----------
  library(survminer)
  km_fit <- survival::survfit(survival::Surv(time_mo, event) ~ group, data = km_dat)
  table_theme <- theme_clinical() +
    theme(axis.line = element_blank(), axis.ticks = element_blank(), axis.text.x = element_blank(),
          axis.title.x = element_blank(), plot.title = element_text(size = 8, face = "plain"))
  sm <- ggsurvplot(km_fit, data = km_dat, risk.table = TRUE, risk.table.height = 0.2,
                   risk.table.title = "No. at risk", censor.shape = "|", censor.size = 2,
                   conf.int = FALSE, break.time.by = 6, xlab = "Time Since Enrollment, mo",
                   ylab = "Survival Probability", legend.title = "",
                   legend.labs = levels(km_dat$group), legend = c(0.15, 0.2),
                   palette = clinical_palette[1:2], ggtheme = theme_clinical(),
                   tables.theme = table_theme, fontsize = 8 / .pt)
  # ggsave() cannot draw a ggsurvplot; open the device and print() it instead
  cairo_pdf(file.path(fig_dir, "fig1-km-survminer.pdf"), width = 3.5, height = 3.6)
  print(sm)
  dev.off()

  # Forest plot (subgroup headings, n, HR (95% CI), P for interaction, diamond) --
  forest_dat <- data.frame(
    group = rep(c("Age", "Sex", "Diabetes", "eGFR"), each = 2),
    subgroup = c("<65 y", ">=65 y", "Male", "Female", "Yes", "No", "<60 mL/min", ">=60 mL/min"),
    n = c(180, 220, 230, 170, 120, 280, 90, 310),
    p_int = rep(c(0.42, 0.08, 0.61, 0.004), each = 2))
  forest_dat$hr <- exp(rnorm(nrow(forest_dat), mean = log(0.8), sd = 0.15))
  forest_dat$lower <- exp(log(forest_dat$hr) - 1.96 * 2 / sqrt(forest_dat$n))
  forest_dat$upper <- exp(log(forest_dat$hr) + 1.96 * 2 / sqrt(forest_dat$n))
  overall <- list(label = "Overall", estimate = 0.80, lower = 0.68, upper = 0.94, n = 400)
  fp <- forest_plot_clinical(forest_dat, estimate = "hr", lower = "lower", upper = "upper",
                             label = "subgroup", n = "n", group = "group", p_interaction = "p_int",
                             pooled = overall, favors = c("Favors intervention", "Favors control"))
  save_figure(fp, file.path(fig_dir, "fig2-forest.pdf"), width_in = 7, height_in = 4, also = "png")
  # Single column: drop the P column (or pass favors = NULL) so the panel keeps room
  fp_narrow <- forest_plot_clinical(forest_dat, estimate = "hr", lower = "lower", upper = "upper",
                                    label = "subgroup", n = "n", group = "group", pooled = overall,
                                    favors = c("Favors\nintervention", "Favors\ncontrol"))
  save_figure(fp_narrow, file.path(fig_dir, "fig2-forest-narrow.pdf"), width_in = 3.5, height_in = 4, also = "png")

  # Dot + 95% CI by analysis population (instead of dynamite bars) -----------
  est_dat <- data.frame(
    outcome = rep(c("Death at 28 d", "Reintubation", "ICU readmission"), each = 2),
    population = rep(c("Intention to treat", "Per protocol"), times = 3),
    estimate = round(rnorm(6, mean = -2, sd = 2), 1))
  est_dat$half_width <- round(runif(6, 1.5, 3.5), 1)
  est_dat$lower <- est_dat$estimate - est_dat$half_width
  est_dat$upper <- est_dat$estimate + est_dat$half_width
  est_dat$outcome <- factor(est_dat$outcome, levels = rev(unique(est_dat$outcome)))
  dp <- ggplot(est_dat, aes(x = estimate, y = outcome, colour = population)) +
    geom_vline(xintercept = 0, linewidth = 0.4) +
    geom_pointrange(aes(xmin = lower, xmax = upper), position = position_dodge(width = 0.5),
                    size = 0.3, linewidth = 0.5) +
    scale_color_clinical() +
    labs(x = "Risk Difference, % (95% CI)", y = NULL, colour = NULL) +
    theme_clinical() + theme(legend.position = "top")
  save_figure(dp, file.path(fig_dir, "fig3-dot-ci.pdf"), width_in = 3.5, height_in = 2.5, also = "png")

  # Box plot with individual points (small n) --------------------------------
  lab_dat <- data.frame(arm = rep(c("Control", "Intervention"), each = 30),
                        lactate = round(rlnorm(60, meanlog = log(2), sdlog = 0.4), 1))
  bp <- ggplot(lab_dat, aes(x = arm, y = lactate)) +
    geom_boxplot(outlier.shape = NA, width = 0.5, linewidth = 0.4) +
    geom_jitter(width = 0.12, height = 0, size = 0.8, alpha = 0.5) +
    scale_y_continuous(limits = c(0, NA)) +
    labs(x = NULL, y = "Lactate, mmol/L") +
    theme_clinical()
  save_figure(bp, file.path(fig_dir, "fig4-box.pdf"), width_in = 3.5, height_in = 3, also = "png")

  # ROC --------------------------------------------------------------------------
  library(pROC)
  risk_dat <- data.frame(risk = plogis(rnorm(500, mean = -1.2, sd = 1.1)))
  risk_dat$outcome <- rbinom(nrow(risk_dat), 1, risk_dat$risk)
  roc_fit <- roc(risk_dat$outcome, risk_dat$risk, quiet = TRUE)
  roc_df <- data.frame(fpr = 1 - roc_fit$specificities, tpr = roc_fit$sensitivities)
  auc_ci <- ci.auc(roc_fit)  # lower, AUC, upper
  rp <- ggplot(roc_df, aes(fpr, tpr)) +
    geom_abline(slope = 1, intercept = 0, linetype = "dashed", colour = "gray50", linewidth = 0.4) +
    geom_path(colour = clinical_palette[1]) +
    coord_equal() +
    labs(x = "1 - Specificity", y = "Sensitivity") +
    annotate("text", x = 0.98, y = 0.08, hjust = 1, size = 8 / .pt,
             label = sprintf("AUC, %.2f (95%% CI, %.2f-%.2f)", auc_ci[2], auc_ci[1], auc_ci[3])) +
    theme_clinical()
  save_figure(rp, file.path(fig_dir, "fig5-roc.pdf"), width_in = 3.5, height_in = 3.5, also = "png")

  # Calibration (binned observed vs predicted + histogram) -----------------------
  risk_dat$bin <- cut(risk_dat$risk, quantile(risk_dat$risk, 0:10 / 10),
                      include.lowest = TRUE, labels = FALSE)
  cal <- aggregate(cbind(pred = risk, obs = outcome) ~ bin, data = risk_dat, FUN = mean)
  cp <- ggplot(cal, aes(pred, obs)) +
    geom_abline(slope = 1, intercept = 0, linetype = "dashed", colour = "gray50", linewidth = 0.4) +
    geom_line(colour = clinical_palette[1]) + geom_point(colour = clinical_palette[1]) +
    coord_equal(xlim = c(0, 1), ylim = c(0, 1)) +
    labs(x = "Predicted Risk", y = "Observed Proportion") +
    theme_clinical()
  hp <- ggplot(risk_dat, aes(risk)) +
    geom_histogram(bins = 20, fill = "gray60", boundary = 0) +
    scale_x_continuous(limits = c(0, 1)) +
    labs(x = "Predicted Risk", y = "Patients, No.") + theme_clinical()

  # Multi-panel with patchwork (tags A, B outside upper-left) -------------------
  library(patchwork)
  panel <- (cp / hp) + plot_layout(heights = c(4, 1)) + plot_annotation(tag_levels = "A")
  save_figure(panel, file.path(fig_dir, "fig6-calibration.pdf"), width_in = 3.5, height_in = 4.5, also = "png")
  list.files(fig_dir)
}

"""clinical_style.py -- journal-neutral clinical publication figure style for matplotlib.

Implements the `clinical-standard` profile from references/figure-style-guide.md:
Arial/Helvetica (with fallbacks), 12 pt bold figure titles, 10 pt axis titles,
8 pt tick and legend text, open top/right spines, no gridlines, Okabe-Ito colors,
vector-friendly export at final column width.

Requirements: matplotlib >= 3.5, numpy, pandas. lifelines (km_with_risk_table)
and scikit-learn (roc_plot, calibration_plot) are imported lazily inside the
helpers, so this module imports without them.

Recommended use: copy this file into the project (for example
analysis/scripts/clinical_style.py) so the figure stays reproducible without
the plugin, then:

    from clinical_style import apply_clinical_style, save_figure
    apply_clinical_style()

Notebook notes
--------------
Jupyter: run `%config InlineBackend.figure_format = 'retina'` once so previews
are crisp; preview size is not export size, so always call save_figure().

Marimo: a cell that returns `fig` (or `ax`) as its last expression renders it;
`mo.mpl.interactive(fig)` gives a zoomable view. Do not rely on `plt.show()`.
Show an exported file with `mo.image(src="analysis/publication/figures/fig1.png")`.
"""

from __future__ import annotations

import os
import warnings
from pathlib import Path
from typing import Iterable, Sequence

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np

# Okabe-Ito, ordered for up to 6 categories on a white background; black and
# yellow are kept last because yellow reads poorly on white.
CLINICAL_PALETTE: list[str] = [
    "#0072B2",  # blue
    "#D55E00",  # vermilion
    "#009E73",  # bluish green
    "#E69F00",  # orange
    "#CC79A7",  # reddish purple
    "#56B4E9",  # sky blue
    "#000000",  # black
    "#F0E442",  # yellow
]

FONT_PREFERENCE: list[str] = ["Arial", "Helvetica", "Liberation Sans", "DejaVu Sans"]

COLUMN_WIDTHS_IN = {"single": 3.5, "one_and_half": 5.0, "double": 7.0}
MAX_HEIGHT_IN = 9.0

# Linestyles and markers cycle alongside color so curves stay distinct in grayscale.
LINESTYLES: list[str] = ["-", "--", "-.", ":", (0, (5, 1)), (0, (3, 1, 1, 1))]
MARKERS: list[str] = ["o", "s", "^", "D", "v", "P"]

# Symmetric breaks for ratio measures on a log axis.
LOG_BREAKS: list[float] = [0.1, 0.2, 0.25, 0.5, 1.0, 2.0, 4.0, 5.0, 10.0]


def available_font() -> str:
    """Return the first preferred font family installed, warning on fallback."""
    from matplotlib import font_manager

    installed = {f.name for f in font_manager.fontManager.ttflist}
    for name in FONT_PREFERENCE:
        if name in installed:
            if name not in ("Arial", "Helvetica"):
                warnings.warn(
                    f"Arial/Helvetica not installed; falling back to {name}. "
                    "Install Arial (or Liberation Sans) before final export.",
                    stacklevel=2,
                )
            return name
    warnings.warn("None of the preferred sans-serif fonts are installed; using matplotlib default.", stacklevel=2)
    return "sans-serif"


def apply_clinical_style(base_size: float = 9.0) -> dict:
    """Set matplotlib rcParams for the clinical-standard profile and return the font used."""
    font = available_font()
    rc = {
        "font.family": "sans-serif",
        "font.sans-serif": [font, *[f for f in FONT_PREFERENCE if f != font]],
        "font.size": base_size,
        "axes.titlesize": 10,
        "axes.titleweight": "bold",
        "axes.labelsize": 10,
        "xtick.labelsize": 8,
        "ytick.labelsize": 8,
        "legend.fontsize": 8,
        "legend.title_fontsize": 8,
        "figure.titlesize": 12,
        "figure.titleweight": "bold",
        "axes.spines.top": False,
        "axes.spines.right": False,
        "axes.linewidth": 0.75,
        "axes.edgecolor": "black",
        "axes.labelcolor": "black",
        "axes.grid": False,
        "axes.axisbelow": True,
        "axes.prop_cycle": mpl.cycler(color=CLINICAL_PALETTE[:6]),
        "xtick.direction": "out",
        "ytick.direction": "out",
        "xtick.major.width": 0.75,
        "ytick.major.width": 0.75,
        "xtick.major.size": 3,
        "ytick.major.size": 3,
        "xtick.minor.visible": False,
        "ytick.minor.visible": False,
        "xtick.color": "black",
        "ytick.color": "black",
        "lines.linewidth": 1.0,
        "lines.markersize": 4,
        "errorbar.capsize": 2,
        "patch.linewidth": 0.5,
        "legend.frameon": False,
        "figure.figsize": (COLUMN_WIDTHS_IN["double"], 4.5),
        "figure.facecolor": "white",
        "savefig.dpi": 300,
        "savefig.bbox": "tight",
        "savefig.pad_inches": 0.02,
        "savefig.facecolor": "white",
        "savefig.transparent": False,
        "pdf.fonttype": 42,  # TrueType; text stays editable and fonts embed
        "ps.fonttype": 42,
        "svg.fonttype": "none",  # keep text as text in SVG
    }
    mpl.rcParams.update(rc)
    return {"font": font}


def save_figure(
    fig: plt.Figure,
    path: str | os.PathLike,
    width_in: float = 7.0,
    height_in: float = 4.5,
    dpi: int = 300,
    also: Iterable[str] = (),
) -> list[Path]:
    """Resize to final print size and export. PDF/SVG/EPS are vector; PNG/TIFF use `dpi`.

    `also` lists extra suffixes (e.g. ("png",)) written next to `path` for review.
    Returns the list of written paths. Rejects transparency for EPS.
    """
    if height_in > MAX_HEIGHT_IN:
        warnings.warn(f"height_in={height_in} exceeds {MAX_HEIGHT_IN} in; most journals cap page height at 9 in.", stacklevel=2)
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.set_size_inches(width_in, height_in)
    written: list[Path] = []
    for target in [path, *[path.with_suffix("." + s.lstrip(".")) for s in also]]:
        suffix = target.suffix.lower()
        kwargs = {"dpi": dpi, "bbox_inches": "tight", "pad_inches": 0.02, "facecolor": "white", "transparent": False}
        if suffix in {".tif", ".tiff"}:
            kwargs["pil_kwargs"] = {"compression": "tiff_lzw"}
        fig.savefig(target, **kwargs)
        written.append(target)
    return written


def add_panel_labels(
    axes: Sequence[plt.Axes],
    labels: Sequence[str] | None = None,
    x: float = -0.12,
    y: float = 1.05,
    size: float = 12,
) -> None:
    """Write bold A, B, C ... outside the upper-left corner of each panel (axes coordinates)."""
    axes = list(np.ravel(axes))
    labels = labels or [chr(ord("A") + i) for i in range(len(axes))]
    for ax, label in zip(axes, labels):
        ax.text(x, y, label, transform=ax.transAxes, fontsize=size, fontweight="bold", ha="right", va="bottom")


def style_axis(
    ax: plt.Axes,
    xlabel: str | None = None,
    ylabel: str | None = None,
    zero_y: bool = False,
    log_x: bool = False,
    reference_x: float | None = None,
) -> plt.Axes:
    """Apply common axis rules: labels with units, optional y from 0, optional log x with reference line."""
    if xlabel is not None:
        ax.set_xlabel(xlabel)
    if ylabel is not None:
        ax.set_ylabel(ylabel)
    if zero_y:
        ax.set_ylim(bottom=0)
    if log_x:
        ax.set_xscale("log")
        lo, hi = ax.get_xlim()
        breaks = [b for b in LOG_BREAKS if lo <= b <= hi] or [1.0]
        ax.set_xticks(breaks)
        ax.xaxis.set_major_formatter(mpl.ticker.FuncFormatter(lambda v, _: f"{v:g}"))
        ax.xaxis.set_minor_locator(mpl.ticker.NullLocator())
    if reference_x is not None:
        ax.axvline(reference_x, color="black", linewidth=0.75, linestyle="-", zorder=0)
    return ax


# ---------------------------------------------------------------------------
# Figure-type helpers
# ---------------------------------------------------------------------------


def km_with_risk_table(
    df,
    time: str,
    event: str,
    group: str | None = None,
    ax: plt.Axes | None = None,
    xlabel: str = "Time Since Randomization, mo",
    ylabel: str = "Survival Probability",
    ci: bool = False,
    censor_marks: bool = True,
    xticks: Sequence[float] | None = None,
    labels: dict | None = None,
):
    """Kaplan-Meier curves with a number-at-risk table (lifelines).

    Uses KaplanMeierFitter.plot_survival_function and
    lifelines.plotting.add_at_risk_counts(*fitters, rows_to_show=["At risk"], ax=ax, xticks=xticks).
    Returns (fig, ax, fitters). Call fig.tight_layout() or save_figure() afterwards.
    """
    from lifelines import KaplanMeierFitter
    from lifelines.plotting import add_at_risk_counts

    if ax is None:
        _, ax = plt.subplots(figsize=(COLUMN_WIDTHS_IN["single"], 3.2))
    fig = ax.figure
    groups = [None] if group is None else list(dict.fromkeys(df[group]))
    fitters = []
    for i, level in enumerate(groups):
        sub = df if level is None else df[df[group] == level]
        label = (labels or {}).get(level, str(level) if level is not None else "All")
        kmf = KaplanMeierFitter(label=label)
        kmf.fit(sub[time], sub[event])
        kmf.plot_survival_function(
            ax=ax,
            ci_show=ci,
            ci_alpha=0.15,
            show_censors=censor_marks,
            censor_styles={"marker": "|", "ms": 4, "mew": 0.75},
            color=CLINICAL_PALETTE[i % len(CLINICAL_PALETTE)],
            linestyle=LINESTYLES[i % len(LINESTYLES)],
        )
        fitters.append(kmf)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.set_ylim(0, 1.0)
    if xticks is not None:
        xticks = list(xticks)
        ax.set_xticks(xticks)
        ax.set_xlim(min(xticks), max(xticks))
    else:
        ax.set_xlim(left=0)
    ax.legend(loc="lower left", frameon=False, title=None)
    add_at_risk_counts(*fitters, rows_to_show=["At risk"], ax=ax, xticks=xticks)
    fig.tight_layout()
    return fig, ax, fitters


def forest_plot(
    df,
    label: str = "label",
    estimate: str = "estimate",
    lower: str = "lower",
    upper: str = "upper",
    weight: str | None = None,
    heading: str | None = None,
    text_cols: Sequence[str] = (),
    text_col_labels: dict | None = None,
    pooled: dict | None = None,
    ax: plt.Axes | None = None,
    xlabel: str = "Hazard Ratio (95% CI)",
    reference: float = 1.0,
    log_scale: bool = True,
    favors: tuple[str, str] | None = None,
):
    """Forest plot: log-scaled x, reference line at 1, squares sized by weight, optional pooled diamond.

    `df` rows are drawn top to bottom in the order given. `heading` names a boolean
    column marking subgroup heading rows (drawn as bold text only). `text_cols` are
    columns rendered as right-hand text columns (e.g. "n" and "estimate_ci");
    `text_col_labels` maps column names to printed headers. `favors` writes
    "Favors X" / "Favors Y" above the plot on either side of the reference line.
    Returns (fig, ax).
    """
    n = len(df)
    if ax is None:
        _, ax = plt.subplots(figsize=(COLUMN_WIDTHS_IN["double"], 0.28 * n + 1.2))
    fig = ax.figure
    y = np.arange(n)[::-1]
    is_heading = df[heading].astype(bool).to_numpy() if heading else np.zeros(n, dtype=bool)
    w = df[weight].to_numpy(dtype=float) if weight else np.ones(n)
    w = np.where(np.isnan(w), np.nanmean(w), w)
    sizes = 20 + 80 * (w / np.nanmax(w))
    for i, (yy, row) in enumerate(zip(y, df.itertuples(index=False))):
        if is_heading[i]:
            continue
        est, lo, hi = getattr(row, estimate), getattr(row, lower), getattr(row, upper)
        ax.plot([lo, hi], [yy, yy], color="black", linewidth=0.75, zorder=2)
        ax.scatter([est], [yy], s=sizes[i], marker="s", color="black", zorder=3)
    if pooled:
        yy = -1
        ax.fill(
            [pooled["lower"], pooled["estimate"], pooled["upper"], pooled["estimate"]],
            [yy, yy + 0.35, yy, yy - 0.35],
            color="black",
            zorder=3,
        )
        ax.set_ylim(-2, n)
    style_axis(ax, xlabel=xlabel, log_x=log_scale, reference_x=reference)
    ax.set_yticks(y)
    ax.set_yticklabels([("" if is_heading[i] else "   ") + str(v) for i, v in enumerate(df[label])])
    for tick, is_h in zip(ax.get_yticklabels(), is_heading):
        if is_h:
            tick.set_fontweight("bold")
    ax.tick_params(axis="y", length=0)
    ax.spines["left"].set_visible(False)
    headers = text_col_labels or {}
    for k, col in enumerate(text_cols):
        xpos = 1.02 + 0.16 * k
        ax.text(xpos, 1.0, headers.get(col, col), transform=ax.transAxes, fontsize=8, fontweight="bold", ha="left", va="bottom")
        for yy, val, is_h in zip(y, df[col], is_heading):
            if not is_h:
                ax.text(xpos, yy, str(val), transform=ax.get_yaxis_transform(), fontsize=8, ha="left", va="center")
    if favors:
        for text, ha, dx in ((favors[0], "right", -4), (favors[1], "left", 4)):
            ax.annotate(text, (reference, 1.0), xycoords=ax.get_xaxis_transform(), xytext=(dx, 2),
                        textcoords="offset points", ha=ha, va="bottom", fontsize=8)
    return fig, ax


def dot_ci_plot(
    df,
    category: str,
    estimate: str,
    lower: str,
    upper: str,
    group: str | None = None,
    ax: plt.Axes | None = None,
    xlabel: str = "Estimate (95% CI)",
    reference: float | None = None,
    horizontal: bool = True,
):
    """Point estimate with 95% CI per category (preferred over bar-plus-error 'dynamite' plots)."""
    if ax is None:
        _, ax = plt.subplots(figsize=(COLUMN_WIDTHS_IN["single"], 0.3 * df[category].nunique() + 1.0))
    fig = ax.figure
    cats = list(dict.fromkeys(df[category]))
    pos = {c: i for i, c in enumerate(cats[::-1])}
    groups = [None] if group is None else list(dict.fromkeys(df[group]))
    offset = np.linspace(-0.2, 0.2, len(groups)) if len(groups) > 1 else [0.0]
    for gi, g in enumerate(groups):
        sub = df if g is None else df[df[group] == g]
        yv = np.array([pos[c] for c in sub[category]]) + offset[gi]
        est, lo, hi = (sub[estimate].to_numpy(), sub[lower].to_numpy(), sub[upper].to_numpy())
        err = np.vstack([est - lo, hi - est])
        kw = dict(fmt=MARKERS[gi % len(MARKERS)], color=CLINICAL_PALETTE[gi], ecolor=CLINICAL_PALETTE[gi], capsize=2, markersize=4, linewidth=0.75, label=None if g is None else str(g))
        if horizontal:
            ax.errorbar(est, yv, xerr=err, **kw)
        else:
            ax.errorbar(yv, est, yerr=err, **kw)
    if horizontal:
        ax.set_yticks(range(len(cats)))
        ax.set_yticklabels(cats[::-1])
        ax.set_xlabel(xlabel)
        if reference is not None:
            ax.axvline(reference, color="black", linewidth=0.75, zorder=0)
    else:
        ax.set_xticks(range(len(cats)))
        ax.set_xticklabels(cats[::-1])
        ax.set_ylabel(xlabel)
        if reference is not None:
            ax.axhline(reference, color="black", linewidth=0.75, zorder=0)
    if group is not None:
        ax.legend(frameon=False, loc="best")
    return fig, ax


def roc_plot(y_true, y_score, ax: plt.Axes | None = None, label: str = "Model", auc_ci: tuple[float, float] | None = None, color: str | None = None):
    """ROC curve with diagonal reference; AUC (and 95% CI if given) in the legend. Uses scikit-learn."""
    from sklearn.metrics import roc_auc_score, roc_curve

    if ax is None:
        _, ax = plt.subplots(figsize=(COLUMN_WIDTHS_IN["single"], COLUMN_WIDTHS_IN["single"]))
    fig = ax.figure
    fpr, tpr, _ = roc_curve(y_true, y_score)
    auc = roc_auc_score(y_true, y_score)
    text = f"{label} (AUC, {auc:.2f}"
    text += f" [95% CI, {auc_ci[0]:.2f}-{auc_ci[1]:.2f}])" if auc_ci else ")"
    ax.plot(fpr, tpr, color=color or CLINICAL_PALETTE[0], label=text)
    ax.plot([0, 1], [0, 1], color="gray", linewidth=0.75, linestyle="--", zorder=0)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_aspect("equal")
    ax.set_xlabel("1 - Specificity")
    ax.set_ylabel("Sensitivity")
    ax.legend(loc="lower right", frameon=False)
    return fig, ax


def calibration_plot(
    y_true,
    y_prob,
    n_bins: int = 10,
    ax: plt.Axes | None = None,
    label: str = "Model",
    strategy: str = "quantile",
    intercept_slope: tuple[float, float] | None = None,
    histogram: bool = True,
):
    """Calibration curve with diagonal reference and a histogram of predicted risk underneath.

    Uses sklearn.calibration.calibration_curve. Pass `intercept_slope` (from a
    logistic recalibration model) to print calibration intercept and slope.
    """
    from sklearn.calibration import calibration_curve

    if ax is None:
        fig, (ax, ax_h) = plt.subplots(
            2, 1, figsize=(COLUMN_WIDTHS_IN["single"], 4.2), sharex=True, gridspec_kw={"height_ratios": [4, 1], "hspace": 0.05}
        )
    else:
        fig, ax_h = ax.figure, None
    prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=n_bins, strategy=strategy)
    ax.plot([0, 1], [0, 1], color="gray", linewidth=0.75, linestyle="--", zorder=0)
    ax.plot(prob_pred, prob_true, marker="o", color=CLINICAL_PALETTE[0], label=label)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_ylabel("Observed Proportion")
    if intercept_slope is not None:
        ax.text(0.02, 0.96, f"Intercept, {intercept_slope[0]:.2f}; slope, {intercept_slope[1]:.2f}", transform=ax.transAxes, ha="left", va="top", fontsize=8)
    ax.legend(loc="lower right", frameon=False)
    if ax_h is not None and histogram:
        ax_h.hist(np.asarray(y_prob), bins=20, range=(0, 1), color="gray")
        ax_h.set_ylabel("Patients, No.")
        ax_h.set_xlabel("Predicted Risk")
    else:
        ax.set_xlabel("Predicted Risk")
    return fig, ax


__all__ = [
    "CLINICAL_PALETTE",
    "COLUMN_WIDTHS_IN",
    "LINESTYLES",
    "LOG_BREAKS",
    "MARKERS",
    "add_panel_labels",
    "apply_clinical_style",
    "available_font",
    "calibration_plot",
    "dot_ci_plot",
    "forest_plot",
    "km_with_risk_table",
    "roc_plot",
    "save_figure",
    "style_axis",
]

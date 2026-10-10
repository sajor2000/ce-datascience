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
        # TrueType (Type 42) so PDF/EPS fonts embed and stay editable; text stays text in SVG.
        with mpl.rc_context({"pdf.fonttype": 42, "ps.fonttype": 42, "svg.fonttype": "none"}):
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


def format_estimate_ci(estimate, lower, upper, digits: int = 2) -> str:
    """'estimate (lower-upper)' text for forest-plot and table columns; NaN -> ''."""
    if estimate is None or np.isnan(estimate):
        return ""
    return f"{estimate:.{digits}f} ({lower:.{digits}f}-{upper:.{digits}f})"


def format_p_value(p) -> str:
    """P in journal form: 2 decimals without the leading zero, 3 below .01, '<.001', '>.99'; NaN -> ''."""
    if p is None or np.isnan(p):
        return ""
    if p < 0.001:
        return "<.001"
    if p >= 0.995:
        return ">.99"
    text = f"{p:.3f}" if p < 0.01 else f"{p:.2f}"
    return text[1:] if text.startswith("0") else text


def _text_width_in(strings: Iterable[str], fontsize: float = 8, weight: str = "normal") -> float:
    """Widest string in inches at `fontsize` (TextPath needs no renderer; multi-line uses the widest line)."""
    from matplotlib.font_manager import FontProperties
    from matplotlib.textpath import TextPath

    prop = FontProperties(weight=weight)
    widest = 0.0
    for s in strings:
        for line in str(s).split("\n"):
            if line:
                widest = max(widest, TextPath((0, 0), line, size=fontsize, prop=prop).get_extents().width)
    return widest / 72.0


_MEASURE_ABBREV = {
    "Hazard Ratio": "HR", "Odds Ratio": "OR", "Risk Ratio": "RR", "Relative Risk": "RR",
    "Incidence Rate Ratio": "IRR", "Rate Ratio": "RR", "Risk Difference": "RD", "Mean Difference": "MD",
}


def forest_plot(
    df,
    estimate: str = "estimate",
    lower: str = "lower",
    upper: str = "upper",
    label: str = "label",
    n: str | None = None,
    group: str | None = None,
    pooled: dict | str | None = None,
    weight: str | None = None,
    p_interaction: str | None = None,
    x_title: str = "Hazard Ratio (95% CI)",
    favors: tuple[str, str] | None = ("Favors treatment", "Favors control"),
    log_scale: bool = True,
    breaks: Sequence[float] | None = None,
    digits: int = 2,
    width_in: float = COLUMN_WIDTHS_IN["double"],
    height_in: float | None = None,
):
    """Publication forest plot (clinical-standard), mirroring forest_plot_clinical() in theme_clinical.R.

    Layout: left text axes (label with bold subgroup headings and indented members,
    n), the estimate axes (log x by default, solid reference line at the null,
    squares sized by `weight` or 1/SE^2, diamond for the pooled estimate), right
    text axes ("estimate (95% CI)", optional P for interaction), and "Favors A /
    Favors B" labels under the axis above `x_title`. Column arguments are column
    names in `df`; rows are drawn top to bottom in the order given. `group` names a
    subgroup column: a bold heading row precedes each run of members and the P for
    interaction is printed once on it; rows with NaN/"" group get no heading.
    `pooled` is a dict(label, estimate, lower, upper, n) drawn as a diamond on a
    separate bottom row, or the name of a boolean column marking that row.
    `favors=None` drops the favors line. Text columns are sized in inches from the
    measured text, so pass the final `width_in` here and the same width to
    save_figure(). Returns (fig, ax) where ax is the estimate axes.
    """
    import pandas as pd

    def col(name, default=np.nan):
        if name is None:
            return [default] * len(df)
        if name not in df.columns:
            raise KeyError(f"Column '{name}' not found in df")
        return list(df[name])

    rows = pd.DataFrame({
        "label": [str(v) for v in col(label, "")],
        "est": pd.to_numeric(col(estimate), errors="coerce"),
        "lo": pd.to_numeric(col(lower), errors="coerce"),
        "hi": pd.to_numeric(col(upper), errors="coerce"),
        "n": pd.to_numeric(col(n), errors="coerce"),
        "w": pd.to_numeric(col(weight), errors="coerce"),
        "grp": ["" if (v is None or (isinstance(v, float) and np.isnan(v))) else str(v) for v in col(group, "")],
        "p": pd.to_numeric(col(p_interaction), errors="coerce"),
    })
    rows["type"] = "plain"
    pooled_row = None
    if isinstance(pooled, str):
        mask = df[pooled].fillna(False).astype(bool).to_numpy()
        pooled_row = rows[mask].iloc[:1].copy()
        rows = rows[~mask].reset_index(drop=True)
    elif pooled is not None:
        pooled_row = pd.DataFrame([{
            "label": pooled.get("label", "Overall"), "est": pooled["estimate"], "lo": pooled["lower"],
            "hi": pooled["upper"], "n": pooled.get("n", np.nan), "w": np.nan, "grp": "", "p": np.nan,
        }])
    # Weight: 1/SE^2 (log scale for ratios) unless a weight column is given.
    tr = np.log if log_scale else (lambda v: v)
    if rows["w"].isna().all():
        rows["w"] = (2 * 1.959964 / (tr(rows["hi"]) - tr(rows["lo"]))) ** 2
    rows.loc[rows["w"].isna() & rows["est"].notna(), "w"] = rows["w"].mean()
    # Subgroup headings: one bold row before each run of members.
    if group is not None:
        out = []
        i = 0
        while i < len(rows):
            g = rows.at[i, "grp"]
            if not g:
                out.append(rows.iloc[[i]])
                i += 1
                continue
            j = i
            while j < len(rows) and rows.at[j, "grp"] == g:
                j += 1
            members = rows.iloc[i:j].copy()
            head = members.iloc[[0]].copy()
            head[["est", "lo", "hi", "n", "w"]] = np.nan
            head["label"] = g
            pp = members["p"].dropna()
            head["p"] = pp.iloc[0] if len(pp) else np.nan
            head["type"] = "heading"
            members["type"] = "member"
            members["p"] = np.nan
            out.extend([head, members])
            i = j
        rows = pd.concat(out, ignore_index=True)
    n_main = len(rows)
    rows["y"] = np.arange(n_main, 0, -1, dtype=float)
    if pooled_row is not None:
        pooled_row = pooled_row.copy()
        pooled_row["type"] = "pooled"
        pooled_row["y"] = 0.0  # one empty row above the pooled diamond
        rows = pd.concat([rows, pooled_row], ignore_index=True)
    y_head = n_main + 1
    ylim = (rows["y"].min() - 0.6, y_head + 0.5)
    rows["est_txt"] = [format_estimate_ci(e, lo, hi, digits) for e, lo, hi in zip(rows["est"], rows["lo"], rows["hi"])]
    rows["n_txt"] = ["" if np.isnan(v) else f"{int(round(v)):,}" for v in rows["n"]]
    rows["p_txt"] = [format_p_value(v) for v in rows["p"]]
    rows["bold"] = rows["type"].isin(["heading", "pooled"])
    rows["x_lab"] = np.where(rows["type"] == "member", 0.12, 0.02)

    # x scale shared by the axes; symmetric log breaks unless given.
    ref = 1.0 if log_scale else 0.0
    finite = pd.concat([rows["lo"], rows["hi"]]).dropna()
    xr = (min(finite.min(), ref), max(finite.max(), ref))
    if breaks is None:
        if log_scale:
            m = max(1 / xr[0], xr[1], 1.01)
            if m <= 2:
                breaks = [0.5, 1, 2]
            elif m <= 4:
                breaks = [0.25, 0.5, 1, 2, 4]
            elif m <= 10:
                breaks = [0.1, 0.2, 0.5, 1, 2, 5, 10]
            else:
                k = int(np.ceil(np.log10(m)))
                breaks = [10.0 ** e for e in range(-k, k + 1)]
        else:
            breaks = list(mpl.ticker.MaxNLocator(nbins=6).tick_values(*xr))
    xlim = (min(min(breaks), xr[0]), max(max(breaks), xr[1]))
    if log_scale:
        pad = (xlim[1] / xlim[0]) ** 0.03
        xlim = (xlim[0] / pad, xlim[1] * pad)
    else:
        pad = (xlim[1] - xlim[0]) * 0.03
        xlim = (xlim[0] - pad, xlim[1] + pad)

    # Column widths in inches from the measured text.
    gap = 0.15
    label_header = "Subgroup" if group is not None else ""
    has_n = any(rows["n_txt"])
    left_w = max(max(x + _text_width_in([s]) for x, s in zip(rows["x_lab"], rows["label"])),
                 _text_width_in([label_header], weight="bold")) + 0.04
    if has_n:
        left_w += gap + max(_text_width_in(rows["n_txt"]), _text_width_in(["No."], weight="bold"))
    measure = x_title.split(" (")[0]
    est_header = f"{_MEASURE_ABBREV.get(measure, measure)} (95% CI)"
    est_w = 0.08 + max(_text_width_in(rows["est_txt"], weight="bold"), _text_width_in([est_header], weight="bold"))
    has_p = any(rows["p_txt"])
    right_w = est_w + (gap + max(_text_width_in(rows["p_txt"]), _text_width_in(["interaction"], weight="bold")) + 0.02 if has_p else 0.02)
    fav_lines = max(len(str(f).split("\n")) for f in favors) if favors else 0
    n_rows = y_head - ylim[0]
    bottom_in = 0.3 + 0.13 * fav_lines + 0.22  # tick labels + favors + axis title
    if height_in is None:
        height_in = round(0.27 * n_rows + bottom_in + 0.1, 2)
    plot_w = width_in - left_w - right_w - 0.1
    if plot_w < 0.8:
        warnings.warn(f"Estimate panel is only {plot_w:.2f} in wide at width_in={width_in}; drop the P column, shorten labels, or use a wider column.", stacklevel=2)

    fig = plt.figure(figsize=(width_in, height_in))
    gs = fig.add_gridspec(1, 3, width_ratios=[left_w, max(plot_w, 0.5), right_w], wspace=0,
                          left=0.02 / width_in, right=1 - 0.08 / width_in, top=1 - 0.05 / height_in,
                          bottom=bottom_in / height_in)
    ax_l, ax, ax_r = (fig.add_subplot(gs[0, k]) for k in range(3))
    for a, w in ((ax_l, left_w), (ax_r, right_w)):
        a.set_axis_off()
        a.set_xlim(0, w)
        a.set_ylim(*ylim)
    txt = dict(fontsize=8, va="center", color="black")

    # Left text axes: label (headings bold, members indented) and n.
    for r in rows.itertuples(index=False):
        ax_l.text(r.x_lab, r.y, r.label, ha="left", fontweight="bold" if r.bold else "normal", **txt)
        if has_n:
            ax_l.text(left_w - 0.02, r.y, r.n_txt, ha="right", **txt)
    ax_l.text(0.02, y_head, label_header, ha="left", fontweight="bold", **txt)
    if has_n:
        ax_l.text(left_w - 0.02, y_head, "No.", ha="right", fontweight="bold", **txt)

    # Estimate axes.
    marks = rows[rows["est"].notna() & (rows["type"] != "pooled")]
    ax.axvline(ref, color="black", linewidth=0.75, zorder=1)
    ax.hlines(marks["y"], marks["lo"].clip(*xlim), marks["hi"].clip(*xlim), color="black", linewidth=0.75, zorder=2)
    sizes = 4 + 32 * marks["w"] / marks["w"].max()
    ax.scatter(marks["est"], marks["y"], s=sizes, marker="s", color="black", linewidths=0, zorder=3)
    if pooled_row is not None:
        pr = rows[rows["type"] == "pooled"].iloc[0]
        ax.fill([pr.lo, pr.est, pr.hi, pr.est], [pr.y, pr.y + 0.32, pr.y, pr.y - 0.32], color="black", zorder=3)
    if log_scale:
        ax.set_xscale("log")
    ax.set_xlim(*xlim)
    ax.set_xticks(list(breaks))
    ax.xaxis.set_major_formatter(mpl.ticker.FuncFormatter(lambda v, _: f"{v:g}"))
    ax.xaxis.set_minor_locator(mpl.ticker.NullLocator())
    ax.set_ylim(*ylim)
    ax.set_yticks([])
    for side in ("left", "top", "right"):
        ax.spines[side].set_visible(False)
    ax.tick_params(axis="x", labelsize=8)
    if favors:
        for text, ha, dx in ((favors[0], "right", -4), (favors[1], "left", 4)):
            ax.annotate(text, (ref, 0), xycoords=ax.get_xaxis_transform(), xytext=(dx, -19),
                        textcoords="offset points", ha=ha, va="top", fontsize=8, linespacing=1.0)
        ax.set_xlabel(x_title, fontsize=10, labelpad=8 + 11 * fav_lines)
    else:
        ax.set_xlabel(x_title, fontsize=10)

    # Right text axes: "estimate (95% CI)" and optional P for interaction.
    for r in rows.itertuples(index=False):
        ax_r.text(0.08, r.y, r.est_txt, ha="left", fontweight="bold" if r.bold else "normal", **txt)
        if has_p:
            ax_r.text(est_w + gap, r.y, r.p_txt, ha="left", **txt)
    ax_r.text(0.08, y_head, est_header, ha="left", fontweight="bold", **txt)
    if has_p:
        ax_r.text(est_w + gap, y_head, "P for\ninteraction", ha="left", fontweight="bold", linespacing=1.0, **txt)
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
    "format_estimate_ci",
    "format_p_value",
    "km_with_risk_table",
    "roc_plot",
    "save_figure",
    "style_axis",
]

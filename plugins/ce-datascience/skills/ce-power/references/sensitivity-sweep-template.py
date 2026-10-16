"""Sensitivity sweep template -- two-sample t example.

Edit the params block; rest is fixed.
"""
from __future__ import annotations

from datetime import date
from pathlib import Path

try:
    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd
    from statsmodels.stats.power import TTestIndPower
except ImportError as exc:  # pragma: no cover - environment-dependent
    raise SystemExit(
        f"missing dependency ({exc.name}): install matplotlib numpy pandas statsmodels into the project environment "
        "(with the user's approval), then re-run"
    ) from exc

params = {
    "design": "two-sample-t",
    "effect_point": 0.40,            # example placeholder, not a literature value: replace with the ce-effect-size anchor or a PMID-cited study
    "effect_grid": np.arange(0.20, 0.65, 0.05),
    "alpha": 0.05,
    "power_target": 0.80,
    "alternative": "two-sided",      # or "larger"
    "dropout": 0.15,                 # assumption: replace with the observed loss-to-follow-up rate
}

analysis = TTestIndPower()

n_per_arm_point = int(np.ceil(analysis.solve_power(
    effect_size=params["effect_point"], alpha=params["alpha"],
    power=params["power_target"], alternative=params["alternative"])))
n_total_point = 2 * n_per_arm_point
n_with_dropout = int(np.ceil(n_total_point / (1 - params["dropout"])))

print(f"Point estimate: n per arm = {n_per_arm_point}, "
      f"total = {n_total_point}, "
      f"with {params['dropout']*100:.0f}% dropout = {n_with_dropout}")

rows = []
for d in params["effect_grid"]:
    n = int(np.ceil(analysis.solve_power(
        effect_size=d, alpha=params["alpha"],
        power=params["power_target"], alternative=params["alternative"])))
    rows.append({"effect_size": float(d), "n_per_arm": n, "n_total": 2 * n})

sweep = pd.DataFrame(rows)
out = Path("analysis/power")
out.mkdir(parents=True, exist_ok=True)
stem = f"{params['design']}-{date.today().isoformat()}"
sweep.to_csv(out / f"{stem}-sweep.csv", index=False)

fig, ax = plt.subplots(figsize=(7, 5))
ax.plot(sweep["effect_size"], sweep["n_total"], marker="o")
ax.set_xlabel("Effect size (Cohen's d)")
ax.set_ylabel("Total N")
ax.set_title("Required N as a function of effect size")
ax.grid(True, alpha=0.3)
fig.tight_layout()
fig.savefig(out / f"{stem}.png", dpi=144)

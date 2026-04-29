"""Sensitivity sweep template -- two-sample t example.

Edit the params block; rest is fixed.
"""
from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from statsmodels.stats.power import TTestIndPower

params = {
    "design": "two-sample-t",
    "effect_point": 0.40,            # Cohen's d -- supply from /ce-method-extract
    "effect_grid": np.arange(0.20, 0.65, 0.05),
    "alpha": 0.05,
    "power_target": 0.80,
    "alternative": "two-sided",      # or "larger"
    "dropout": 0.15,
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
sweep.to_csv(out / "sweep.csv", index=False)

fig, ax = plt.subplots(figsize=(7, 5))
ax.plot(sweep["effect_size"], sweep["n_total"], marker="o")
ax.set_xlabel("Effect size (Cohen's d)")
ax.set_ylabel("Total N")
ax.set_title("Required N as a function of effect size")
ax.grid(True, alpha=0.3)
fig.tight_layout()
fig.savefig(out / "sweep.png", dpi=144)

# Sensitivity sweep template -- two-sample t example
# Edit the params block; rest is fixed.

# Never install from a template: a silent install.packages() can break a locked renv.
for (pkg in c("pwr", "ggplot2")) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    stop(sprintf("R package '%s' is not installed; run install.packages('%s') with the user's approval, then re-run", pkg, pkg))
  }
}

library(pwr)
library(ggplot2)

params <- list(
  design        = "two-sample-t",
  effect_point  = 0.40,    # example placeholder, not a literature value: replace with the ce-effect-size anchor or a PMID-cited study
  effect_grid   = seq(0.20, 0.60, by = 0.05),
  alpha         = 0.05,
  power_target  = 0.80,
  sided         = "two",
  dropout       = 0.15     # assumption: replace with the observed loss-to-follow-up rate
)

point <- pwr.t.test(d = params$effect_point, sig.level = params$alpha,
                    power = params$power_target, type = "two.sample",
                    alternative = ifelse(params$sided == "two", "two.sided", "greater"))
n_per_arm_point <- ceiling(point$n)
n_total_point   <- 2 * n_per_arm_point
n_with_dropout  <- ceiling(n_total_point / (1 - params$dropout))

cat(sprintf("Point estimate: n per arm = %d, total = %d, with %.0f%% dropout = %d\n",
            n_per_arm_point, n_total_point, 100 * params$dropout, n_with_dropout))

sweep <- do.call(rbind, lapply(params$effect_grid, function(d) {
  res <- pwr.t.test(d = d, sig.level = params$alpha, power = params$power_target,
                    type = "two.sample",
                    alternative = ifelse(params$sided == "two", "two.sided", "greater"))
  data.frame(effect_size = d, n_per_arm = ceiling(res$n), n_total = 2 * ceiling(res$n))
}))

out_stem <- file.path("analysis/power", paste0(params$design, "-", format(Sys.Date(), "%Y-%m-%d")))
dir.create(dirname(out_stem), recursive = TRUE, showWarnings = FALSE)
write.csv(sweep, paste0(out_stem, "-sweep.csv"), row.names = FALSE)

p <- ggplot(sweep, aes(effect_size, n_total)) +
  geom_line() + geom_point() +
  labs(x = "Effect size (Cohen's d)", y = "Total N",
       title = "Required N as a function of effect size",
       subtitle = sprintf("alpha=%.2f, power=%.2f, %s-sided",
                          params$alpha, params$power_target, params$sided)) +
  theme_minimal()

ggsave(paste0(out_stem, ".png"), p, width = 7, height = 5)

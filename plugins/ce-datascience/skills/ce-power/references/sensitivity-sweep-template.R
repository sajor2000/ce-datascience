# Sensitivity sweep template -- two-sample t example
# Edit the params block; rest is fixed.

if (!requireNamespace("pwr", quietly = TRUE)) install.packages("pwr")
if (!requireNamespace("ggplot2", quietly = TRUE)) install.packages("ggplot2")

library(pwr)
library(ggplot2)

params <- list(
  design        = "two-sample-t",
  effect_point  = 0.40,    # Cohen's d -- supply from /ce-method-extract
  effect_grid   = seq(0.20, 0.60, by = 0.05),
  alpha         = 0.05,
  power_target  = 0.80,
  sided         = "two",
  dropout       = 0.15
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

write.csv(sweep, "analysis/power/sweep.csv", row.names = FALSE)

p <- ggplot(sweep, aes(effect_size, n_total)) +
  geom_line() + geom_point() +
  labs(x = "Effect size (Cohen's d)", y = "Total N",
       title = "Required N as a function of effect size",
       subtitle = sprintf("alpha=%.2f, power=%.2f, %s-sided",
                          params$alpha, params$power_target, params$sided)) +
  theme_minimal()

ggsave("analysis/power/sweep.png", p, width = 7, height = 5)

# Synthetic external-validation script for a 30-day readmission risk model.
# No real data: `val` is simulated below.
set.seed(20261015)
n <- 1500
val <- data.frame(lp = rnorm(n, -1.6, 1.1))
val$y <- rbinom(n, 1, plogis(0.3 + 0.7 * val$lp))
val$p <- plogis(val$lp)

library(pROC)
auc_val <- auc(val$y, val$p)

# Calibration
cal_fit <- glm(y ~ lp, data = val, family = binomial)
cal_intercept <- coef(cal_fit)[1]          # reported as calibration-in-the-large
cal_slope <- coef(cal_fit)[2]

library(ResourceSelection)
hl <- hoslem.test(val$y, val$p, g = 10)    # "p > 0.05, so the model is well calibrated"

results <- data.frame(
  metric = c("AUC", "calibration_in_the_large", "calibration_slope", "HL_p"),
  value = c(as.numeric(auc_val), cal_intercept, cal_slope, hl$p.value)
)
write.csv(results, "validation_metrics.csv", row.names = FALSE)

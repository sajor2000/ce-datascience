# Wilson 95% Confidence Interval

Use Wilson interval (not Wald) for proportions. Wald collapses at p=0 or p=1 and is poor for small N (Newcombe, Stat Med 1998, PMID 9595616).

Report Clopper-Pearson (exact; `binom.test(x, n)$conf.int` in R, `statsmodels.stats.proportion.proportion_confint(x, n, method="beta")` in Python) when a journal or regulator requires guaranteed coverage; it is conservative.

Wilson applies to directly estimated proportions only (PPV and NPV under any design; all four metrics under a simple random sample). Weighted sensitivity/specificity from an algo-stratified sample use the logit delta-method interval in `sampling-strategies.md`.

## Formula

```
z = 1.96  # for 95% CI
p = x / n
center = (p + z^2 / (2n)) / (1 + z^2 / n)
half = z * sqrt((p * (1 - p) / n) + (z^2 / (4 * n^2))) / (1 + z^2 / n)
ci_lo = center - half
ci_hi = center + half
```

## Boundary cases

- p = 0: lower bound stays 0, upper bound > 0 (Wald gives 0,0 -- wrong)
- p = 1: upper stays 1, lower < 1
- n small: interval widens appropriately

## Python (no scipy required)

```python
import math
def wilson_ci(x, n, z=1.96):
    if n == 0:
        return (0.0, 1.0)
    p = x / n
    center = (p + z*z / (2*n)) / (1 + z*z / n)
    half = z * math.sqrt(p*(1-p)/n + z*z/(4*n*n)) / (1 + z*z / n)
    return (max(0.0, center - half), min(1.0, center + half))
```

## R

```r
wilson_ci <- function(x, n, conf = 0.95) {
  z <- qnorm((1 + conf) / 2)
  p <- x / n
  center <- (p + z^2 / (2*n)) / (1 + z^2 / n)
  half <- z * sqrt(p*(1-p)/n + z^2 / (4*n^2)) / (1 + z^2 / n)
  c(max(0, center - half), min(1, center + half))
}
# Or use prop.test()$conf.int with correct=FALSE for Wilson w/o continuity
# Or use binom::binom.confint(x, n, methods="wilson")
```

import statsmodels.formula.api as smf


def fit(data):
    # Intentionally incompatible synthetic example for reviewer evaluation.
    return smf.mixedlm("outcome ~ treatment", data, groups=data["patient_id"]).fit()

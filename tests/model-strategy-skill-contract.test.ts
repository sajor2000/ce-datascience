import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"

const pluginRoot = path.join(process.cwd(), "plugins", "ce-datascience")
const skillRoot = path.join(pluginRoot, "skills", "ce-model-strategy")

async function read(relativePath: string): Promise<string> {
  return fs.readFile(path.join(skillRoot, relativePath), "utf8")
}

describe("ce-model-strategy contract", () => {
  test("gates recommendations and emits review-only artifacts", async () => {
    const skill = await read("SKILL.md")

    for (const required of [
      "Scientific aim",
      "Estimand and reporting scale",
      "Outcome type and support",
      "Unit of analysis, dataset grain",
      "Dependence:",
      "Missing-data strategy",
      "Usable observations, events, subjects, clusters",
    ]) expect(skill).toContain(required)

    expect(skill).toContain("`blocked` | Grain")
    expect(skill).toContain("`provisional` | A leading method")
    expect(skill).toContain("`ready_for_review` | Inputs")
    expect(skill).toContain("only a named human reviewer can approve it")
    expect(skill).toContain("analysis/model-strategy/")
    expect(skill).toContain("ready_for_review only")
    expect(skill).toContain("__CE_MODEL_STRATEGY__ memo=<path> code=<path|none> language=<r|python|none> status=<blocked|provisional|ready_for_review> primary=<model-id|none> evidence=<path|none>")
  })

  test("keeps local references and blocking questions portable", async () => {
    const skill = await read("SKILL.md")

    expect(skill).not.toMatch(/\[[^\]]+\]\((?:\.\/)?(?:references|assets)\//)
    for (const required of ["AskUserQuestion", "request_user_input", "ask_user", "pi-ask-user", "ToolSearch", "select:AskUserQuestion"]) {
      expect(skill).toContain(required)
    }
  })

  test("requires decision-linked PubMed provenance and guarded full text", async () => {
    const skill = await read("SKILL.md")

    expect(skill).toContain("`ce-evidence-map`")
    expect(skill).toContain("PubMed as the required biomedical metadata baseline")
    expect(skill).toContain("Paperclip as best-effort full-text deepening")
    expect(skill).toContain("3-10 relevant methods papers")
    expect(skill).toContain("PMID, PMCID when available, DOI, query/date provenance")
    expect(skill).toContain("Label support `abstract`")
    expect(skill).toContain("label it `full_text`")
    expect(skill).toContain("Paperclip failure does not block")
    expect(skill).toContain("load `ce-evidence-map` to acquire the evidence")
  })

  test("routes mixed models from estimand and design", async () => {
    const mixed = await read("references/mixed-effects.md")

    expect(mixed).toContain("Use GEE for a population-averaged contrast")
    expect(mixed).toContain("Do not reject a Gaussian identity-link LMM solely because the target is marginal")
    expect(mixed).toContain("Use an LMM/GLMM when the target is conditional")
    expect(mixed).toContain("Add a random intercept only when observations share a genuine")
    expect(mixed).toContain("The predictor varies within the grouping factor")
    expect(mixed).toContain("nested or crossed")
    expect(mixed).toContain("Check informative cluster size")
    expect(mixed).toContain("AR(1), continuous-time, spatial, heteroscedastic, or unstructured residual covariance")
    expect(mixed).toContain("When a fit is singular or nonconvergent")
    expect(mixed).toContain("small-cluster correction or limitation")
  })

  test("covers requested families without fabricating stack parity", async () => {
    const routing = await read("references/model-routing.md")
    const advanced = await read("references/advanced-models.md")
    const python = await read("references/python-implementation.md")
    const r = await read("references/r-implementation.md")

    for (const term of ["Binary", "Ordinal", "Nominal multinomial", "Count", "Hurdle/two-part", "Recurrent events", "Longitudinal/repeated"]) {
      expect(routing).toContain(term)
    }
    for (const term of ["joint longitudinal-survival", "Causal estimation", "Prediction and machine learning", "Bayesian hierarchical models", "fixed-effect model", "random-effects model"]) {
      expect(advanced).toContain(term)
    }
    expect(python).toContain("not a general frequentist GLMM implementation")
    expect(python).toContain("vetted R or Bayesian alternative")
    expect(python).toContain("Never emit `ready_for_review` without its required scaffold")
    expect(python).toContain("Do not install packages")
    expect(r).toContain("Do not install packages")
  })

  test("integrates strategy handoffs and reviewer dispatch", async () => {
    const [plan, sap, workflow, lifecycle, stateDetection, codeReview, methods, rReviewer, pyReviewer, readme] = await Promise.all([
      fs.readFile(path.join(pluginRoot, "skills", "ce-plan", "SKILL.md"), "utf8"),
      fs.readFile(path.join(pluginRoot, "skills", "ce-statistical-analysis-plan", "SKILL.md"), "utf8"),
      fs.readFile(path.join(pluginRoot, "skills", "ce-workflow", "SKILL.md"), "utf8"),
      fs.readFile(path.join(pluginRoot, "skills", "ce-workflow", "references", "lifecycle-paths.md"), "utf8"),
      fs.readFile(path.join(pluginRoot, "skills", "ce-workflow", "references", "state-detection.md"), "utf8"),
      fs.readFile(path.join(pluginRoot, "skills", "ce-code-review", "SKILL.md"), "utf8"),
      fs.readFile(path.join(pluginRoot, "agents", "ce-methods-reviewer.md"), "utf8"),
      fs.readFile(path.join(pluginRoot, "agents", "ce-r-pipeline-reviewer.md"), "utf8"),
      fs.readFile(path.join(pluginRoot, "agents", "ce-python-ds-reviewer.md"), "utf8"),
      fs.readFile(path.join(pluginRoot, "README.md"), "utf8"),
    ])

    for (const content of [plan, sap, workflow, readme]) expect(content).toContain("ce-model-strategy")
    for (const content of [workflow, lifecycle]) {
      expect(content.indexOf("ce-data-qa")).toBeLessThan(content.indexOf("ce-model-strategy"))
      expect(content.indexOf("ce-model-strategy")).toBeLessThan(content.indexOf("ce-plan"))
      expect(content.indexOf("ce-plan")).toBeLessThan(content.indexOf("ce-sap-tabular"))
    }
    expect(stateDetection).toContain("Status: ready_for_review")
    expect(stateDetection).toContain("every discovered memo")
    expect(await read("SKILL.md")).toContain("__CE_BIOINFO_QC_FAIL__")
    expect(codeReview).toContain("analysis/model-strategy/")
    expect(codeReview).toContain("`analysis/model-strategy/*-model-strategy.md`")
    expect(methods).toContain("population-average")
    expect(methods).toContain("strategy memo")
    expect(rReviewer).toContain("singular")
    expect(rReviewer).toContain("MMRM")
    expect(pyReviewer).toContain("MixedLM")
    expect(pyReviewer).toContain("GEE")
  })
})

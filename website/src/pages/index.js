import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import packageWorkflow from '../../../docs/methodsmith-package-workflow.png';
import skillMap from '../../../docs/workflow-diagram.png';

const AUDIENCES = [
  {
    title: 'Clinical statistics',
    lead: 'Observational studies, trials and registries, from question to Table 1.',
    commands: [
      ['/method-question', 'PICO, FINER and a hypothesis'],
      ['/method-power', 'sample size and power, with a script'],
      ['/method-sap', 'claims linked to ICH E9(R1) estimands'],
      ['/method-cohort', 'reproducible cohort and waterfall counts'],
      ['/method-table1', 'traceable baseline-characteristics table'],
      ['/method-numbers', 'every reported number traced to the analysis'],
    ],
  },
  {
    title: 'Python and ML papers',
    lead: 'Prediction models and notebooks that survive peer review.',
    commands: [
      ['/method-model-choice', 'justify the model after the estimand'],
      ['/method-ml-track', 'data hashes, splits and metrics'],
      ['/method-verify', 'leakage, effect direction and PHI gate'],
      ['/method-model-card', 'calibration, fairness and limits'],
      ['/method-marimo', 'reactive, reproducible Python notebooks'],
      ['/method-figure', 'calibration, ROC and forest plots'],
    ],
  },
  {
    title: 'Meta-analysis',
    lead: 'Systematic reviews and pooled effects with every source cited.',
    commands: [
      ['/method-lit-search', 'PubMed, full text or authoritative sources'],
      ['/method-evidence-map', 'a source-backed evidence map'],
      ['/method-prereg', 'PROSPERO, OSF or ClinicalTrials.gov'],
      ['/method-meta-analysis', 'random effects, REML with Hartung-Knapp'],
      ['/method-checklist', 'PRISMA 2020 and its extensions'],
      ['/method-write', 'evidence-bound manuscript drafts'],
    ],
  },
];

const TRUST = [
  ['39 EQUATOR checklists', 'CONSORT, STROBE, PRISMA, TRIPOD+AI, TARGET and more, encoded with their official item IDs. Only the newest version of each guideline can load; a test enforces it.'],
  ['PHI guard', 'A pre-tool hook keeps data values out of the model in schema-only projects and keeps identifiers out of MCP tools and uploads in every mode. Outputs are aggregate, with small cells suppressed.'],
  ['55 specialist reviewers', 'Methods, causal inference, multiplicity, leakage, calibration, fairness, reproducibility and PHI reviewers run in parallel; findings are deduplicated and confidence-gated.'],
  ['Numbers locked to raw data', '/method-numbers has manuscripts, tables and abstracts cite numbers from a registry written by the analysis code, and a fail-closed gate traces each one to its SAP output, script commit and source hash.'],
];

export default function Home() {
  const demo = useBaseUrl('/brand/demo.svg');
  return (
    <Layout
      title="Rigorous methods, from question to paper"
      description="Methodsmith is a plugin for Claude Code and Codex for rigorous research methods: clinical statistics, Python and ML papers, and meta-analysis.">
      <main>
        <header className="ms-hero container">
          <div className="ms-hero__text">
            <Heading as="h1">Rigorous methods, from question to paper.</Heading>
            <p className="ms-hero__lead">
              Methodsmith is a plugin for Claude Code and Codex. It gives your
              coding agent the habits of a careful methods team, so statistics,
              machine learning and meta-analysis are planned before they run and
              reviewed before anyone reads the results. The scientific decisions
              stay with you. <strong>Every study compounds.</strong>
            </p>
            <div className="ms-actions">
              <Link className="ms-button ms-button--primary" to="/docs/setup">
                Read the setup guide
              </Link>
              <Link className="ms-button ms-button--quiet" href="https://github.com/sajor2000/methodsmith">
                View on GitHub
              </Link>
            </div>
          </div>
          <figure className="ms-terminal" aria-label="Getting started in Claude Code">
            <figcaption>Start in your terminal</figcaption>
            <pre>
              <code>
                <span className="c"># install the plugin</span>
                {'\n'}claude plugin install methodsmith \{'\n'}  --marketplace sajor2000/methodsmith
                {'\n\n'}
                <span className="c"># in your project, inside Claude Code</span>
                {'\n'}<span className="p">&gt;</span> /methodsmith:method-setup
                {'\n'}<span className="p">&gt;</span> /method-workflow
                {'\n\n'}
                <span className="c"># then plan before any analysis runs</span>
                {'\n'}<span className="p">&gt;</span> /method-plan a cohort study of 30-day mortality
              </code>
            </pre>
            <p>
              Codex, Pi and locked-down laptops: see the <Link to="/docs/setup">setup guide</Link>.
            </p>
          </figure>
        </header>

        <section className="ms-section container" aria-labelledby="decide">
          <Heading as="h2" id="decide">
            You decide. Methodsmith does the legwork.
          </Heading>
          <p className="ms-section__lead">
            The plugin drafts, runs and checks; every scientific choice passes
            through you. Nothing is analysed until you approve the plan, and
            nothing is reported until you have judged the review. The loop of
            plan, work, review and compound comes from Every&apos;s Compound
            Engineering.
          </p>
          <figure className="ms-figure ms-figure--diagram ms-figure--scroll">
            <ThemedImage
              sources={{
                light: useBaseUrl('/brand/human-loop-light.svg'),
                dark: useBaseUrl('/brand/human-loop-dark.svg'),
              }}
              width="1200"
              height="560"
              alt="Swimlane. You, the scientist, frame the question, approve the plan, judge the findings and sign off the result. Methodsmith drafts the SAP with /method-plan, runs the approved analysis with /method-work, reviews every step with /method-review, and records the lessons with /method-compound, which feed the next study's plan."
            />
          </figure>
        </section>

        <section className="ms-section container" aria-labelledby="demo">
          <Heading as="h2" id="demo">
            See it on synthetic data
          </Heading>
          <p className="ms-section__lead">
            Find the next step, link a causal claim to its estimand, then review
            the analysis before anyone reads the results.
          </p>
          <figure className="ms-figure ms-figure--scroll">
            <img
              src={demo}
              width="1200"
              height="615"
              alt="Terminal replay on synthetic data. /method-workflow shows the lifecycle card and recommends method-sap. /method-sap links claim C1 to an ICH E9(R1) estimand and lists two decisions that block finalization. /method-review reports two P1, one P2 and one P3 finding and returns Not ready."
            />
            <figcaption>Scripted replay on synthetic data. Output abridged from the formats the skills define.</figcaption>
          </figure>
        </section>

        <section className="ms-section container" aria-labelledby="audiences">
          <Heading as="h2" id="audiences">
            Built for three kinds of study
          </Heading>
          <p className="ms-section__lead">
            67 skills in total. These are the ones each kind of study reaches for first.
          </p>
          <div className="ms-audiences">
            {AUDIENCES.map(({title, lead, commands}) => (
              <div key={title}>
                <Heading as="h3">{title}</Heading>
                <p>{lead}</p>
                <ul className="ms-commands">
                  {commands.map(([command, what]) => (
                    <li key={command}>
                      <code>{command}</code>
                      <span>{what}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="ms-section container" aria-labelledby="trust">
          <Heading as="h2" id="trust">
            Why you can check its work
          </Heading>
          <p className="ms-section__lead">
            Methodsmith drafts and checks. The researcher decides, and stays
            accountable for every result.
          </p>
          <dl className="ms-trust">
            {TRUST.map(([term, text, tag]) => (
              <div key={term}>
                <dt>
                  {term}
                  {tag && <span className="ms-tag">{tag}</span>}
                </dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="ms-section container" aria-labelledby="map">
          <Heading as="h2" id="map">
            The skill map
          </Heading>
          <p className="ms-section__lead">
            Thirty of the 67 skills, in the order a study meets them, with the
            guardrails that apply at every step.
          </p>
          <figure className="ms-figure">
            <img
              src={skillMap}
              alt="Skill map: key skills across six phases (Frame, Design, Data, Plan, Execute, Review), with guardrails for ICH E9(R1) estimands, 39 reporting checklists, 55 specialist reviewers and PHI-safe outputs"
            />
          </figure>
        </section>

        <section className="ms-section container" aria-labelledby="start">
          <Heading as="h2" id="start">
            Install once, set up each project
          </Heading>
          <p className="ms-section__lead">
            Claude Code, Codex and Pi are supported, with a locked-down route for
            managed laptops. The <Link to="/docs/setup">setup guide</Link> covers each one.
          </p>
          <figure className="ms-figure">
            <img
              src={packageWorkflow}
              alt="Methodsmith package workflow: choose a route, install, run method-setup once per project, let method-workflow recommend the next skill, and deliver reviewable artifacts"
            />
          </figure>
        </section>

        <section className="ms-section container" aria-labelledby="credits">
          <Heading as="h2" id="credits">
            Credits
          </Heading>
          <p className="ms-credit">
            Methodsmith is a fork of{' '}
            <Link href="https://github.com/EveryInc/compound-engineering-plugin">Compound Engineering</Link>{' '}
            by Kieran Klaassen and Every, which introduced the plan, work, review,
            compound loop for software. Methodsmith adapts it for research methods
            and is maintained by Juan Carlos Rojas. MIT licensed.
          </p>
        </section>
      </main>
    </Layout>
  );
}

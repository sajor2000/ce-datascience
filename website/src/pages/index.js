import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import workflowImage from '../../../docs/ce-datascience-package-workflow.png';

export default function Home() {
  return (
    <Layout
      title="Health data science workflows"
      description="CE DataScience adds careful, documented research workflows to AI coding assistants.">
      <header className="hero hero--primary">
        <div className="container">
          <Heading as="h1" className="hero__title">
            CE DataScience
          </Heading>
          <p className="hero__subtitle">
            A practical AI research partner for health and biomedical data.
          </p>
          <div className="hero-actions">
            <Link className="button button--secondary button--lg" to="/docs/setup">
              Get started
            </Link>
            <Link
              className="button button--outline button--secondary button--lg"
              href="https://github.com/sajor2000/ce-datascience">
              View on GitHub
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="home-section container">
          <Heading as="h2">Research work that stays reviewable</Heading>
          <p className="section-lead">
            Plan studies, inspect data, write analyses, and review reports while
            keeping scientific decisions with the researcher.
          </p>
          <div className="feature-grid">
            <article className="feature-card">
              <Heading as="h3">Plan before coding</Heading>
              <p>Turn a broad idea into explicit questions, endpoints, and assumptions.</p>
            </article>
            <article className="feature-card">
              <Heading as="h3">Check the evidence</Heading>
              <p>Trace data quality, statistical choices, and literature support.</p>
            </article>
            <article className="feature-card">
              <Heading as="h3">Leave an audit trail</Heading>
              <p>Produce reusable notes and artifacts for collaborators and reviewers.</p>
            </article>
          </div>
        </section>

        <section className="home-section home-section--muted">
          <div className="container">
            <Heading as="h2">How the package works</Heading>
            <img
              className="workflow-image"
              src={workflowImage}
              alt="CE DataScience workflow from installation through research artifacts"
            />
          </div>
        </section>
      </main>
    </Layout>
  );
}

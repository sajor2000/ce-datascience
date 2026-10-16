import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import workflowImage from '../../../docs/methodsmith-package-workflow.png';

export default function Home() {
  return (
    <Layout
      title="Rigorous research methods"
      description="Rigorous methods for statistics, machine learning, and meta-analysis, from question to paper. Every study compounds.">
      <header className="hero hero--primary">
        <div className="container">
          <Heading as="h1" className="hero__title">
            Methodsmith
          </Heading>
          <p className="hero__subtitle">
            Rigorous methods for statistics, machine learning, and meta-analysis, from question to paper. Every study compounds.
          </p>
          <div className="hero-actions">
            <Link className="button button--secondary button--lg" to="/docs/setup">
              Get started
            </Link>
            <Link
              className="button button--outline button--secondary button--lg"
              href="https://github.com/sajor2000/methodsmith">
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
              alt="Methodsmith workflow from installation through research artifacts"
            />
          </div>
        </section>

        <section className="home-section container">
          <Heading as="h2">A short workflow overview</Heading>
          <p className="section-lead">
            See how Methodsmith carries a research question through explicit
            design, analysis, review, and reusable documentation.
          </p>
          <video
            className="workflow-video"
            controls
            playsInline
            preload="metadata"
            aria-label="Methodsmith workflow overview animation">
            <source src="media/methodsmith-overview.mp4" type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        </section>
      </main>
    </Layout>
  );
}

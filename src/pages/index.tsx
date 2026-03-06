import { type ReactNode, useState, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import styles from './index.module.css';

interface FeatureCard {
  icon: string;
  title: string;
  desc: string;
  link: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: '📖',
    title: 'Community Thesaurus',
    desc: 'Structured vocabulary grounded in the Strobl et al. 2024 framework — base, core, controversial, and high-impact terms clearly distinguished.',
    link: '/terms/accuracy',
  },
  {
    icon: '🔗',
    title: 'Auto Cross-References',
    desc: 'Every term links to related terms automatically. Navigate the semantic graph of Earth Observation concepts with a single click.',
    link: '/dependency-graph',
  },
  {
    icon: '🏷️',
    title: 'Structured Tagging',
    desc: 'Terms are classified by type and discussion status so you always know how settled a definition is and where debate continues.',
    link: '/concepts',
  },
  {
    icon: '✍️',
    title: 'Open Contribution',
    desc: 'All terms are maintained on GitHub. Submit a PR, open an issue, or start a discussion — the thesaurus evolves with the community.',
    link: '/contribute',
  },
  {
    icon: '🛰️',
    title: 'CEOS Endorsed',
    desc: 'Aligned with the CEOS Interoperability Handbook 2.0 and recommended by the CEOS Interoperability Framework (SEM#1).',
    link: '/introduction',
  },
  {
    icon: '📊',
    title: 'Dependency Graph',
    desc: 'Explore the Sigma.js force-directed graph to visualise how terms depend on each other and which are truly foundational.',
    link: '/dependency-graph',
  },
];

const TAG_LEGEND = [
  {
    tag: 'base',
    color: '#1e40af',
    bg: '#dbeafe',
    darkColor: '#93c5fd',
    darkBg: '#1e3a5f',
    title: 'Base term',
    desc: 'Foundational concepts used in the definition of other terms. Require cross-community consensus.',
    examples: 'Data, Entity, Phenomenon, Property',
  },
  {
    tag: 'core',
    color: '#166534',
    bg: '#dcfce7',
    darkColor: '#86efac',
    darkBg: '#14532d',
    title: 'Core term',
    desc: 'Standard vocabulary for Earth Observation sciences with broadly agreed definitions.',
    examples: 'Accuracy, Calibration, Sensor, Collection',
  },
  {
    tag: 'controversial',
    color: '#9a3412',
    bg: '#ffedd5',
    darkColor: '#fdba74',
    darkBg: '#431407',
    title: 'Controversial term',
    desc: 'Terms used differently across communities. Multiple definitions provided with context.',
    examples: 'Observation, In-Situ, Model, Sample',
  },
  {
    tag: 'high-impact',
    color: '#6b21a8',
    bg: '#f3e8ff',
    darkColor: '#d8b4fe',
    darkBg: '#3b0764',
    title: 'High-impact term',
    desc: 'Complex concepts that require full framework documents, not just a sentence definition.',
    examples: 'Interoperability, Analysis Ready Data',
  },
];

interface Term {
  title: string;
  slug: string;
}

function TermSearch() {
  const [query, setQuery] = useState('');
  const [terms, setTerms] = useState<Term[]>([]);
  const [results, setResults] = useState<Term[]>([]);
  const [open, setOpen] = useState(false);
  const termsUrl = useBaseUrl('/terms.json');

  useEffect(() => {
    fetch(termsUrl)
      .then((r) => r.json())
      .then(setTerms)
      .catch(() => {});
  }, [termsUrl]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const filtered = terms
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 10);
    setResults(filtered);
    setOpen(filtered.length > 0);
  }, [query, terms]);

  return (
    <section className="term-search-section">
      <div className="container" style={{ maxWidth: '660px' }}>
        <p className="term-search-label">Search terms by name</p>
        <div className="term-search-wrapper">
          <input
            className="term-search-input"
            type="search"
            placeholder="e.g. Accuracy, Calibration, Sensor…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onFocus={() => results.length > 0 && setOpen(true)}
            autoComplete="off"
          />
          {open && (
            <ul className="term-search-results" role="listbox">
              {results.map((t) => (
                <li key={t.slug} role="option">
                  <Link to={`/terms/${t.slug}`} className="term-search-result">
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <div className="hero-wrapper">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" />
          CEOS Interoperability Handbook · SEM#1 Recommendation
          <span className="hero-eyebrow-dot" />
        </div>

        <h1 className="hero-title">
          The EO Community's<br />Definitive Thesaurus
        </h1>

        <p className="hero-subtitle">
          A living, community-governed vocabulary for Earth Observation sciences.
          Precise definitions. Traceable sources. Open to all.
        </p>

        <div className="hero-actions">
          <Link className="hero-btn hero-btn--primary" to="/terms/accuracy">
            Browse Terms →
          </Link>
          <Link className="hero-btn hero-btn--secondary" to="/introduction">
            Learn More
          </Link>
          <Link className="hero-btn hero-btn--secondary" to="/dependency-graph">
            View Graph
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-number">150+</span>
            <span className="hero-stat-label">Terms</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-number">4</span>
            <span className="hero-stat-label">Term classes</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-number">30+</span>
            <span className="hero-stat-label">Source vocabularies</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-number">Open</span>
            <span className="hero-stat-label">Source & access</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCards() {
  return (
    <section className="features-section">
      <div className="container">
        <h2 className="features-heading">Built for the EO Community</h2>
        <p className="features-subheading">
          Grounded in the Strobl et al. (2024) framework and the CEOS Interoperability Handbook 2.0
        </p>
        <div className="feature-cards">
          {FEATURES.map((f) => (
            <Link key={f.title} to={f.link} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feature-card">
                <span className="feature-card-icon">{f.icon}</span>
                <div className="feature-card-title">{f.title}</div>
                <p className="feature-card-desc">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TagsSection() {
  return (
    <section className="tags-section">
      <div className="container">
        <h2 className="features-heading" style={{ textAlign: 'center', marginBottom: '0.6rem' }}>
          Term Classification System
        </h2>
        <p className="features-subheading">
          Based on Strobl et al. (2024) — <em>Lost in Translation</em>, Surveys in Geophysics
        </p>
        <div className="tag-legend">
          {TAG_LEGEND.map((item) => (
            <div key={item.tag} className="tag-legend-item">
              <span
                className="tag-legend-badge"
                style={{
                  background: item.bg,
                  color: item.color,
                  border: `1px solid ${item.color}`,
                }}
              >
                {item.tag}
              </span>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>
                  {item.title}
                </strong>
                <p className="tag-legend-text">{item.desc}</p>
                <p className="tag-legend-text" style={{ marginTop: '4px', opacity: 0.7 }}>
                  <em>e.g. {item.examples}</em>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReferenceSection() {
  return (
    <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <h2 className="features-heading">Grounded in Peer-Reviewed Research</h2>
        <p style={{ color: 'var(--ifm-color-secondary-darkest)', lineHeight: '1.7', marginBottom: '2rem' }}>
          This glossary implements the recommendations of the authoritative paper on EO vocabulary
          harmonisation and the CEOS Interoperability Handbook 2.0.
        </p>
        <div style={{
          background: 'var(--glossary-card-bg)',
          border: '1px solid var(--glossary-card-border)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          textAlign: 'left',
          marginBottom: '1.5rem',
        }}>
          <p style={{ fontStyle: 'italic', lineHeight: '1.7', margin: '0 0 0.5rem' }}>
            "Strobl, P. A., Woolliams, E. R., &amp; Molch, K. (2024). Lost in Translation: The Need
            for Common Vocabularies and an Interoperable Thesaurus in Earth Observation Sciences."
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--ifm-color-secondary-darkest)', margin: 0 }}>
            <em>Surveys in Geophysics.</em>{' '}
            <a href="https://doi.org/10.1007/s10712-024-09854-8" target="_blank" rel="noreferrer">
              doi:10.1007/s10712-024-09854-8
            </a>
          </p>
        </div>
        <Link className="hero-btn hero-btn--primary" to="/contribute" style={{ display: 'inline-flex' }}>
          Contribute a Term →
        </Link>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A community thesaurus of terms and definitions for Earth Observation sciences. Maintained by CEOS and the JRC Knowledge Centre for Earth Observation (KCEO)."
    >
      <HeroSection />
      <TermSearch />
      <main>
        <FeatureCards />
        <TagsSection />
        <ReferenceSection />
      </main>
    </Layout>
  );
}

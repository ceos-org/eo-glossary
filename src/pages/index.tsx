import React, { type ReactNode, useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

// ── Lucide-style inline SVG icons ────────────────────────────────────────────
type IconProps = { size?: number };

function IconBookOpen({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 0 3-3h7z" />
    </svg>
  );
}

function IconLayers({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
      <path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
    </svg>
  );
}

function IconLink({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconBadgeCheck({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconNetwork({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="6" height="6" x="16" y="16" rx="1" />
      <rect width="6" height="6" x="2" y="16" rx="1" />
      <rect width="6" height="6" x="9" y="2" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}

function IconGitPullRequest({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  );
}

// ── Vocabulary design principles (Strobl et al. 2024) ─────────────────────────
const PRINCIPLES = [
  {
    Icon: IconBookOpen,
    title: 'Substitution-valid definitions',
    desc: 'Every definition must be substitutable for its term in any sentence without altering the meaning. Circular definitions, synonymy, and negation-based formulations are excluded.',
    link: '/concepts',
  },
  {
    Icon: IconLayers,
    title: 'Four-tier term classification',
    desc: 'Terms are assigned to one of four tiers — base, core, controversial, high-impact — reflecting both their ontological role in EO science and the degree of cross-community consensus they carry.',
    link: '/concepts',
  },
  {
    Icon: IconLink,
    title: 'Source traceability',
    desc: 'Each definition is attributed to one or more authoritative sources (ISO, CEOS, OGC, WMO, community standards). Adaptations and deliberate deviations are explicitly annotated.',
    link: '/terms/accuracy',
  },
  {
    Icon: IconBadgeCheck,
    title: 'Explicit consensus status',
    desc: 'Status tags (approved / under discussion / proposed) make the state of community agreement visible at the term level, enabling informed review and targeted debate.',
    link: '/concepts',
  },
  {
    Icon: IconNetwork,
    title: 'Dependency transparency',
    desc: 'Definitions preferentially employ other glossary terms. The resulting citation graph exposes foundational dependencies between concepts and reveals which terms carry the widest definitional load.',
    link: '/dependency-graph',
  },
  {
    Icon: IconGitPullRequest,
    title: 'Open governance',
    desc: 'Definitions are version-controlled on GitHub. Corrections, additions, and formal discussion proceed through pull requests and issues, ensuring a transparent record of how the vocabulary evolves.',
    link: '/contribute',
  },
];

// ── Term class taxonomy ────────────────────────────────────────────────────────
const TAG_LEGEND = [
  {
    tag: 'base',
    color: '#1e40af',
    bg: '#dbeafe',
    darkColor: '#93c5fd',
    darkBg: '#1e3a5f',
    title: 'Base term',
    desc: 'Ontological foundations used in the definitions of other terms. Require cross-community consensus before adoption.',
    examples: 'Data, Entity, Phenomenon, Property',
  },
  {
    tag: 'core',
    color: '#166534',
    bg: '#dcfce7',
    darkColor: '#86efac',
    darkBg: '#14532d',
    title: 'Core term',
    desc: 'Standard EO vocabulary with broadly agreed definitions across the principal user communities.',
    examples: 'Accuracy, Calibration, Sensor, Collection',
  },
  {
    tag: 'controversial',
    color: '#9a3412',
    bg: '#ffedd5',
    darkColor: '#fdba74',
    darkBg: '#431407',
    title: 'Controversial term',
    desc: 'Terms whose meaning differs materially across communities. Multiple definitions are provided with explicit context.',
    examples: 'Observation, In-Situ, Model, Sample',
  },
  {
    tag: 'high-impact',
    color: '#6b21a8',
    bg: '#f3e8ff',
    darkColor: '#d8b4fe',
    darkBg: '#3b0764',
    title: 'High-impact term',
    desc: 'Concepts whose complexity requires a full framework document rather than a single-sentence definition.',
    examples: 'Interoperability, Analysis Ready Data',
  },
];

// ── Term search ────────────────────────────────────────────────────────────────
interface Term { title: string; slug: string; }

function TermSearch({ terms }: { terms: Term[] }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<Term[]>([]);
  const [open, setOpen]       = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q        = query.toLowerCase();
    const filtered = terms.filter(t => t.title.toLowerCase().includes(q)).slice(0, 10);
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
            onChange={e => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onFocus={() => results.length > 0 && setOpen(true)}
            autoComplete="off"
          />
          {open && (
            <ul className="term-search-results" role="listbox">
              {results.map(t => (
                <li key={t.slug} role="option">
                  <Link to={`/terms/${t.slug}`} className="term-search-result">{t.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Page header ────────────────────────────────────────────────────────────────
function PageHeader({ termCount }: { termCount: number }) {
  return (
    <header className="page-header">
      <div className="container page-header-inner">
        <p className="page-header-meta">CEOS Interoperability Handbook 2.0 &middot; EC KCEO &middot; Strobl et al. (2024)</p>
        <h1 className="page-header-title">EO Glossary</h1>
        <p className="page-header-subtitle">
          The structured vocabulary companion to the CEOS Interoperability Handbook 2.0 —
          a community-maintained, source-traceable thesaurus for Earth Observation science.
          Term structure, classification, and governance follow the framework of
          Strobl, Woolliams &amp; Molch (2024).
        </p>
        <div className="page-header-actions">
          <Link className="page-btn page-btn--primary" to="/terms/accuracy">Browse Terms</Link>
          <Link className="page-btn page-btn--ghost" to="/introduction">Introduction</Link>
          <Link className="page-btn page-btn--ghost" to="/dependency-graph">Dependency Graph</Link>
        </div>
        <div className="page-header-stats">
          <span><strong>{termCount || '…'}</strong> terms</span>
          <span><strong>4</strong> term classes</span>
          <span><strong>30+</strong> source vocabularies</span>
          <span>CC BY 4.0</span>
        </div>
      </div>
    </header>
  );
}

// ── Principles section ─────────────────────────────────────────────────────────
function PrinciplesSection() {
  return (
    <section className="principles-section">
      <div className="container">
        <div className="principles-header">
          <h2 className="section-title">Vocabulary Design Principles</h2>
          <p className="section-subtitle">
            The CEOS Interoperability Handbook 2.0 identifies persistent vocabulary
            heterogeneity as a root cause of interoperability failures across EO
            communities. The glossary implements its recommendations through six
            structural principles, grounded in the academic framework of Strobl et al. (2024).
          </p>
        </div>
        <div className="principles-grid">
          {PRINCIPLES.map(({ Icon, title, desc, link }) => (
            <Link key={title} to={link} className="principle-item">
              <div className="principle-icon"><Icon size={20} /></div>
              <div>
                <div className="principle-title">{title}</div>
                <p className="principle-desc">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Term classification ────────────────────────────────────────────────────────
function ClassificationSection() {
  return (
    <section className="tags-section">
      <div className="container">
        <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
          Term Classification
        </h2>
        <p className="section-subtitle" style={{ maxWidth: 'none' }}>
          Strobl et al. (2024) &mdash; <em>Lost in Translation</em>, Surveys in Geophysics
        </p>
        <div className="tag-legend">
          {TAG_LEGEND.map(item => (
            <div key={item.tag} className="tag-legend-item">
              <span
                className="tag-legend-badge"
                style={{ background: item.bg, color: item.color, border: `1px solid ${item.color}` }}
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

// ── Reference ──────────────────────────────────────────────────────────────────
function ReferenceSection() {
  return (
    <section className="reference-section">
      <div className="container" style={{ maxWidth: '700px' }}>
        <h2 className="section-title">Reference</h2>
        <p className="reference-intro">
          The glossary is the vocabulary companion to the CEOS Interoperability
          Handbook 2.0. Its term structure, classification system, and governance
          model are grounded in the following publication.
        </p>
        <div className="reference-card">
          <p className="reference-citation">
            Strobl, P. A., Woolliams, E. R., &amp; Molch, K. (2024). Lost in Translation:
            The Need for Common Vocabularies and an Interoperable Thesaurus in Earth
            Observation Sciences. <em>Surveys in Geophysics.</em>
          </p>
          <a
            className="reference-doi"
            href="https://doi.org/10.1007/s10712-024-09854-8"
            target="_blank"
            rel="noreferrer"
          >
            doi:10.1007/s10712-024-09854-8
          </a>
        </div>
        <Link className="page-btn page-btn--primary" to="/contribute">
          Contribute a term
        </Link>
      </div>
    </section>
  );
}

// ── Page root ──────────────────────────────────────────────────────────────────
export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const [terms, setTerms] = useState<Term[]>([]);
  const termsUrl = useBaseUrl('/terms.json');

  useEffect(() => {
    fetch(termsUrl).then(r => r.json()).then(setTerms).catch(() => {});
  }, [termsUrl]);

  return (
    <Layout
      title={siteConfig.title}
      description="A community thesaurus of terms and definitions for Earth Observation sciences. Maintained by CEOS and the EC Knowledge Centre for Earth Observation (KCEO)."
    >
      <PageHeader termCount={terms.length} />
      <TermSearch terms={terms} />
      <main>
        <PrinciplesSection />
        <ClassificationSection />
        <ReferenceSection />
      </main>
    </Layout>
  );
}

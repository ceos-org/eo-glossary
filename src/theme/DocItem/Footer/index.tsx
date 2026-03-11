import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
// @ts-ignore – swizzle wrapper; type provided by @theme-original alias
import OriginalFooter from '@theme-original/DocItem/Footer';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

interface TermRef { id: string; label: string; }
interface Neighbourhood {
  parents:       TermRef[];
  grandparents:  TermRef[];
  children:      TermRef[];
  grandchildren: TermRef[];
}
type LayerKey = 'parents' | 'grandparents' | 'children' | 'grandchildren';

const LAYER_LABELS: Record<LayerKey, string> = {
  parents:       'Parents',
  grandparents:  'Grandparents',
  children:      'Children',
  grandchildren: 'Grandchildren',
};

const LAYER_TITLES: Record<LayerKey, string> = {
  parents:       'Terms referenced in this term\'s definition (direct dependencies)',
  grandparents:  'Terms referenced by parents (2 hops out)',
  children:      'Terms whose definitions reference this term (direct dependants)',
  grandchildren: 'Terms whose definitions reference children (2 hops in)',
};

const LAYER_ORDER: LayerKey[] = ['parents', 'grandparents', 'children', 'grandchildren'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DocItemFooter(props: any): React.JSX.Element {
  const { pathname } = useLocation();
  const graphBase    = useBaseUrl('/graph');
  const dataUrl      = useBaseUrl('/graph/data.json');
  const { siteConfig } = useDocusaurusContext();
  const { metadata: docMeta, frontMatter } = useDoc();

  const termMatch = pathname.match(/\/terms\/([^/]+?)\/?$/);
  const slug      = termMatch?.[1];

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    parents:       true,
    grandparents:  true,
    children:      true,
    grandchildren: true,
  });

  const [neighbourhood, setNeighbourhood] = useState<Neighbourhood | null>(null);

  // Fetch graph data and compute directed neighbourhood for current term
  useEffect(() => {
    if (!slug) return;
    setNeighbourhood(null);

    fetch(dataUrl)
      .then(r => r.json())
      .then((data: { nodes: { id: string; label: string }[]; edges: { source: string; target: string }[] }) => {
        const directParents  = new Set<string>();
        const directChildren = new Set<string>();
        for (const e of data.edges) {
          if (e.source === slug) directParents.add(e.target);
          if (e.target === slug) directChildren.add(e.source);
        }

        const grandParents  = new Set<string>();
        const grandChildren = new Set<string>();
        for (const e of data.edges) {
          if (directParents.has(e.source) && e.target !== slug && !directParents.has(e.target)) {
            grandParents.add(e.target);
          }
          if (directChildren.has(e.target) && e.source !== slug && !directChildren.has(e.source)) {
            grandChildren.add(e.source);
          }
        }

        // Deduplicate (priority: parent > child > grandparent > grandchild)
        for (const id of directParents)  { grandParents.delete(id);  grandChildren.delete(id); }
        for (const id of directChildren) { grandParents.delete(id);  grandChildren.delete(id); }
        for (const id of grandParents)   { grandChildren.delete(id); }

        const nodeMap = new Map(data.nodes.map(n => [n.id, n]));
        const toRefs = (ids: Set<string>): TermRef[] =>
          [...ids]
            .map(id => ({ id, label: nodeMap.get(id)?.label ?? id }))
            .sort((a, b) => a.label.localeCompare(b.label));

        setNeighbourhood({
          parents:       toRefs(directParents),
          grandparents:  toRefs(grandParents),
          children:      toRefs(directChildren),
          grandchildren: toRefs(grandChildren),
        });
      })
      .catch(() => {});
  }, [slug, dataUrl]);

  // Send updated layer state to the embedded iframe
  const postLayers = useCallback((next: Record<LayerKey, boolean>) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'setLayers', layers: next }, '*');
  }, []);

  const toggleLayer = useCallback((key: LayerKey) => {
    setLayers(prev => {
      const next = { ...prev, [key]: !prev[key] };
      postLayers(next);
      return next;
    });
  }, [postLayers]);

  // Re-send current layer state when iframe (re)loads
  const handleLoad = useCallback(() => {
    postLayers(layers);
  }, [layers, postLayers]);

  if (!slug) {
    return <OriginalFooter {...props} />;
  }

  const termUrl  = `${siteConfig.url}${siteConfig.baseUrl}terms/${slug}`;
  const termJsonLd = {
    '@context': 'https://schema.org',
    '@type':    'DefinedTerm',
    name:        docMeta.title,
    description: ((frontMatter as Record<string, unknown>).description as string | undefined) ?? '',
    termCode:    slug,
    url:         termUrl,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name:    'EO Glossary',
      url:     `${siteConfig.url}${siteConfig.baseUrl}`,
    },
  };

  const mdUrl   = useBaseUrl(`/terms/${slug}.md`);
  const jsonUrl = useBaseUrl(`/terms/${slug}.json`);

  // Portal the buttons into the <header> that wraps the <h1>, so they sit top-right of the title
  const [headerEl, setHeaderEl] = useState<Element | null>(null);
  useEffect(() => {
    setHeaderEl(document.querySelector('.theme-doc-markdown header'));
  }, [slug]);

  const hasAny = neighbourhood && LAYER_ORDER.some(k => neighbourhood[k].length > 0);

  const rawButtons = (
    <div className={styles.rawButtons}>
      <a href={mdUrl}   className={styles.rawButton} target="_blank" rel="noopener noreferrer">.md</a>
      <a href={jsonUrl} className={styles.rawButton} target="_blank" rel="noopener noreferrer">.json</a>
    </div>
  );

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(termJsonLd).replace(/<\/script>/gi, '<\\/script>')}
        </script>
      </Head>
      {headerEl && createPortal(rawButtons, headerEl)}
      <div className="term-neighborhood-graph">
        <p className="term-graph-label">Term Relationships</p>

        {/* Layer toggles */}
        <div className="term-graph-layers">
          {LAYER_ORDER.map(key => (
            <label key={key} className="term-graph-layer-toggle" title={LAYER_TITLES[key]}>
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={() => toggleLayer(key)}
              />
              {LAYER_LABELS[key]}
            </label>
          ))}
        </div>

        {/* Embedded graph */}
        <iframe
          ref={iframeRef}
          src={`${graphBase}?term=${encodeURIComponent(slug)}&embed=1`}
          width="100%"
          height="420"
          style={{ border: 'none', borderRadius: '8px', display: 'block', marginTop: '0.75rem' }}
          title={`Dependency graph — ${slug}`}
          loading="lazy"
          onLoad={handleLoad}
        />

        {/* Text listing of relationships */}
        {hasAny && (
          <div className="term-neighbourhood-list">
            {LAYER_ORDER.map(key => {
              const items = neighbourhood![key];
              if (!items.length) return null;
              return (
                <div key={key} className="term-neighbourhood-group">
                  <h4 className="term-neighbourhood-heading" title={LAYER_TITLES[key]}>{LAYER_LABELS[key]}</h4>
                  <ul className="term-neighbourhood-items">
                    {items.map(t => (
                      <li key={t.id}>
                        <Link to={`/terms/${t.id}`}>{t.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <OriginalFooter {...props} />
    </>
  );
}

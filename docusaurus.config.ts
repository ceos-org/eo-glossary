import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Remark plugin for build-time auto cross-referencing ──────────────────────
// @ts-ignore – ESM plugin, types not declared
import { remarkGlossaryLinks } from './plugins/remark-glossary-links.mjs';

// ── Generate terms list for homepage search ──────────────────────────────────
// Runs at config load time (both `npm start` and `npm run build`)
try {
  const termsDir = path.resolve(__dirname, 'docs/terms');
  const termFiles = fs
    .readdirSync(termsDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'));

  const terms = termFiles
    .map((f) => {
      const content = fs.readFileSync(path.join(termsDir, f), 'utf8');
      const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
      const slug = f.replace('.md', '');
      return { title: titleMatch?.[1]?.trim() ?? slug, slug };
    })
    .filter((t) => t.title)
    .sort((a, b) => a.title.localeCompare(b.title));

  const staticDir = path.resolve(__dirname, 'static');
  fs.mkdirSync(staticDir, { recursive: true });
  fs.writeFileSync(path.join(staticDir, 'terms.json'), JSON.stringify(terms));
} catch (e) {
  console.warn('[eo-glossary] Could not generate terms.json:', e);
}

// ── Generate dependency graph data ───────────────────────────────────────────
// Runs at config load time so `npm start` always has up-to-date graph data.
try {
  const graphTermsDir = path.resolve(__dirname, 'docs/terms');
  const graphFiles = fs
    .readdirSync(graphTermsDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'));

  const TAG_COLORS: Record<string, string> = {
    base: '#60a5fa',
    core: '#4ade80',
    controversial: '#fb923c',
    'high-impact': '#c084fc',
  };

  const graphTerms = graphFiles.map((f) => {
    const slug = f.replace('.md', '');
    const content = fs.readFileSync(path.join(graphTermsDir, f), 'utf8');
    const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const title = titleMatch?.[1]?.trim() ?? slug;

    const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    const tags: string[] = [];
    if (fmMatch) {
      let inTags = false;
      for (const line of fmMatch[1].split('\n')) {
        if (/^tags:/.test(line)) { inTags = true; continue; }
        if (inTags) {
          if (line.startsWith(' ') || line.startsWith('-')) {
            const tag = line.trim().replace(/^-\s*/, '');
            if (tag) tags.push(tag);
          } else { inTags = false; }
        }
      }
    }

    let definition = '';
    let inDef = false;
    for (const line of content.split('\n')) {
      if (/^## 1 Definition/.test(line.trim())) { inDef = true; continue; }
      if (inDef) {
        if (/^##/.test(line.trim())) break;
        definition += line + '\n';
      }
    }
    return { slug, title, tags, definition: definition.trim() };
  });

  const edgesSet = new Set<string>();
  for (const term of graphTerms) {
    if (!term.definition) continue;
    const textLower = term.definition.toLowerCase();
    for (const other of graphTerms) {
      if (other.slug === term.slug) continue;
      const escaped = other.title.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`(?<![a-z])${escaped}(?:es|s)?(?![a-z])`).test(textLower)) {
        edgesSet.add(`${term.slug}__${other.slug}`);
      }
    }
  }

  const inDeg: Record<string, number> = {};
  graphTerms.forEach((t) => { inDeg[t.slug] = 0; });
  for (const e of edgesSet) {
    const tgt = e.split('__')[1];
    inDeg[tgt] = (inDeg[tgt] ?? 0) + 1;
  }
  const maxDeg = Math.max(1, ...Object.values(inDeg));

  // Simple seeded LCG for reproducible node positions
  let seed = 42;
  const rand = () => {
    seed = ((seed * 1664525) + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const graphNodes = graphTerms.map((term) => {
    const colorKey = term.tags.find((t) => t in TAG_COLORS);
    return {
      id: term.slug,
      label: term.title,
      x: Math.round(rand() * 10000) / 100,
      y: Math.round(rand() * 10000) / 100,
      size: Math.round((8 + (inDeg[term.slug] / maxDeg) * 20) * 10) / 10,
      color: colorKey ? TAG_COLORS[colorKey] : '#94a3b8',
    };
  });

  const graphEdges = [...edgesSet].sort().map((e) => {
    const [src, tgt] = e.split('__');
    return { id: e, source: src, target: tgt, color: '#334155', size: 1 };
  });

  const graphDir = path.resolve(__dirname, 'static/graph');
  fs.mkdirSync(graphDir, { recursive: true });
  fs.writeFileSync(
    path.join(graphDir, 'data.json'),
    JSON.stringify({ nodes: graphNodes, edges: graphEdges }),
  );
} catch (e) {
  console.warn('[eo-glossary] Could not generate graph data:', e);
}

// ── Generate RSS feed ─────────────────────────────────────────────────────────
try {
  const rssTermsDir = path.resolve(__dirname, 'docs/terms');
  const escXml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const rssItems = fs
    .readdirSync(rssTermsDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => {
      const filePath = path.join(rssTermsDir, f);
      const content  = fs.readFileSync(filePath, 'utf8');
      const title    = content.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? f.replace('.md', '');
      const desc     = content.match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? '';
      const slug     = f.replace('.md', '');
      const mtime    = fs.statSync(filePath).mtime;
      return { title, desc, slug, mtime };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .map(t => {
      const url = `https://ceos-org.github.io/eo-glossary/terms/${t.slug}`;
      return [
        '    <item>',
        `      <title>${escXml(t.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${t.mtime.toUTCString()}</pubDate>`,
        t.desc ? `      <description>${escXml(t.desc)}</description>` : '',
        '    </item>',
      ].filter(Boolean).join('\n');
    })
    .join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>EO Glossary</title>
    <link>https://ceos-org.github.io/eo-glossary/</link>
    <description>Community thesaurus of terms and definitions for Earth Observation sciences, maintained by CEOS and the EC Knowledge Centre for Earth Observation (KCEO).</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://ceos-org.github.io/eo-glossary/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://ceos-org.github.io/eo-glossary/assets/og-banner.svg</url>
      <title>EO Glossary</title>
      <link>https://ceos-org.github.io/eo-glossary/</link>
    </image>
    <dc:creator>CEOS &amp; EC KCEO</dc:creator>
${rssItems}
  </channel>
</rss>`;

  const staticOut = path.resolve(__dirname, 'static');
  fs.mkdirSync(staticOut, { recursive: true });
  fs.writeFileSync(path.join(staticOut, 'rss.xml'), rssXml);
} catch (e) {
  console.warn('[eo-glossary] Could not generate rss.xml:', e);
}

// ── Generate llms-full.txt (plain-text for LLM ingestion) ─────────────────────
// terms-full.json is NOT generated here — use exports/json/terms.json instead,
// which is produced by scripts/export_glossary.py (run in prestart/prebuild).
try {
  const aiDir = path.resolve(__dirname, 'docs/terms');
  const BASE_URL = 'https://ceos-org.github.io/eo-glossary';
  const EXPORTS_JSON_URL = 'https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/json/terms.json';

  const termFiles = fs
    .readdirSync(aiDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => {
      const slug = f.replace('.md', '');
      const raw = fs.readFileSync(path.join(aiDir, f), 'utf8');
      const title = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? slug;
      const description = raw.match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? '';

      const tags: string[] = [];
      const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---/);
      if (fmMatch) {
        let inTags = false;
        for (const line of fmMatch[1].split('\n')) {
          if (/^tags:/.test(line)) { inTags = true; continue; }
          if (inTags) {
            if (line.startsWith(' ') || line.startsWith('-')) {
              const tag = line.trim().replace(/^-\s*/, '');
              if (tag) tags.push(tag);
            } else { inTags = false; }
          }
        }
      }

      const body = raw.replace(/^---[\s\S]*?---\n/, '').replace(/^# .+\n\n?/, '').trim();
      return { title, slug, description, tags, body };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const today = new Date().toISOString().slice(0, 10);
  const header = `# EO Glossary — Full Term Definitions
# Source: ${BASE_URL}/
# ${termFiles.length} terms with formal definitions, notes, examples, and sources
# Generated: ${today}
# Structured JSON export: ${EXPORTS_JSON_URL}

`;
  const blocks = termFiles.map(t => {
    const meta = [`URL: ${BASE_URL}/terms/${t.slug}`];
    if (t.tags.length) meta.push(`Tags: ${t.tags.join(', ')}`);
    if (t.description) meta.push(`Summary: ${t.description}`);
    return `# ${t.title}\n${meta.join('\n')}\n\n${t.body}`;
  }).join('\n\n---\n\n');

  fs.writeFileSync(path.join(path.resolve(__dirname, 'static'), 'llms-full.txt'), header + blocks);
} catch (e) {
  console.warn('[eo-glossary] Could not generate llms-full.txt:', e);
}

// ── Generate per-term .md and .json static files ───────────────────────────────
// Served at /terms/{slug}.md and /terms/{slug}.json — used by the raw-format buttons.
// Output goes to static/terms/ (gitignored); available in both dev and prod.
try {
  const rawSrc = path.resolve(__dirname, 'docs/terms');
  const rawDst = path.resolve(__dirname, 'static/terms');
  const BASE_URL = 'https://ceos-org.github.io/eo-glossary';

  fs.mkdirSync(rawDst, { recursive: true });

  for (const f of fs.readdirSync(rawSrc).filter(f => f.endsWith('.md') && !f.startsWith('_'))) {
    const slug = f.replace('.md', '');
    const raw  = fs.readFileSync(path.join(rawSrc, f), 'utf8');

    // .md — verbatim copy, served as plain text
    fs.copyFileSync(path.join(rawSrc, f), path.join(rawDst, f));

    // .json — parse frontmatter + multi-definition body
    const title       = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? slug;
    const description = raw.match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? '';
    const tags: string[] = [];
    const fm = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fm) {
      let inT = false;
      for (const line of fm[1].split('\n')) {
        if (/^tags:/.test(line)) { inT = true; continue; }
        if (inT) {
          if (line.startsWith(' ') || line.startsWith('-')) { const t = line.trim().replace(/^-\s*/, ''); if (t) tags.push(t); }
          else inT = false;
        }
      }
    }

    const body = raw.replace(/^---[\s\S]*?---\n/, '').replace(/^# .+\n\n?/, '');
    const definitions = body
      .split(/\n(?=## \d+ Definition)/)
      .map(sec => {
        const secs: Record<string, string[]> = {};
        let cur = '';
        for (const line of sec.split('\n')) {
          if (/^#{2,3} /.test(line)) { cur = line.trim(); secs[cur] = []; }
          else if (cur) secs[cur].push(line);
        }
        const defKey = Object.keys(secs).find(k => /^## \d+ Definition/.test(k));
        if (!defKey) return null;
        return {
          definition: (secs[defKey]      ?? []).join('\n').trim(),
          notes:      (secs['### Notes']    ?? []).join('\n').trim(),
          examples:   (secs['### Examples'] ?? []).join('\n').trim(),
          sources:    (secs['### Sources']  ?? []).join('\n').trim(),
        };
      })
      .filter(Boolean);

    fs.writeFileSync(
      path.join(rawDst, `${slug}.json`),
      JSON.stringify({ title, slug, url: `${BASE_URL}/terms/${slug}`, description, tags, definitions }, null, 2),
    );
  }
} catch (e) {
  console.warn('[eo-glossary] Could not generate per-term raw files:', e);
}

const config: Config = {
  title: 'EO Glossary',
  tagline: 'The Community Thesaurus for Earth Observation Sciences',
  favicon: 'assets/favicon.svg',

  url: 'https://ceos-org.github.io',
  baseUrl: '/eo-glossary/',

  organizationName: 'ceos-org',
  projectName: 'eo-glossary',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: '/',
        searchBarShortcutHint: false,
        explicitSearchResultPath: true,
      },
    ],
  ],

  clientModules: [
    './src/clientModules/announcementBarReset.js',
  ],

  plugins: [],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/ceos-org/eo-glossary/edit/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          remarkPlugins: [
            [remarkGlossaryLinks, { termsDir: path.resolve(__dirname, 'docs/terms') }],
          ],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: null,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    announcementBar: {
      id: 'wip_disclaimer',
      content:
        'This glossary is currently at an early stage and still work in progress. It is not 100% reviewed yet and some things might change over time. Stay tuned on <a href="https://github.com/ceos-org/eo-glossary" target="_blank" rel="noreferrer">GitHub</a> or reach out to us!',
      isCloseable: true,
    },
    metadata: [
      {
        name: 'keywords',
        content:
          'earth observation, EO, glossary, thesaurus, remote sensing, CEOS, KCEO, JRC, vocabulary, calibration, validation, uncertainty, satellite, geospatial, interoperability',
      },
      { name: 'author', content: 'CEOS & KCEO (EC)' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'EO Glossary' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    image: 'assets/og-banner.svg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'EO Glossary',
      logo: {
        alt: 'EO Glossary — CEOS & EC KCEO',
        src: 'assets/favicon.svg',
      },
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'glossary',
          position: 'left',
          label: 'Glossary',
        },
        { to: '/introduction', label: 'Introduction', position: 'left' },
        { to: '/concepts', label: 'Concepts', position: 'left' },
        { to: '/contribute', label: 'Contribute', position: 'left' },
        { to: '/dependency-graph', label: 'Graph', position: 'left' },
        { to: '/tags', label: 'Tags', position: 'left' },
        {
          href: 'https://github.com/ceos-org/eo-glossary',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Glossary',
          items: [
            { label: 'Introduction', to: '/introduction' },
            { label: 'All Terms (A–Z)', to: '/terms/accuracy' },
            { label: 'Concepts', to: '/concepts' },
            { label: 'Dependency Graph', to: '/dependency-graph' },
            { label: 'Tags', to: '/tags' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Contribute', to: '/contribute' },
            { label: 'GitHub', href: 'https://github.com/ceos-org/eo-glossary' },
            { label: 'CEOS', href: 'https://ceos.org' },
            { label: 'EC KCEO', href: 'https://knowledge4policy.ec.europa.eu/earth-observation' },
          ],
        },
        {
          title: 'Related',
          items: [
            { label: 'Interoperability Handbook', href: 'https://github.com/ceos-org/interoperability-handbook' },
            { label: 'CEOS-ARD', href: 'https://ceos.org/ard/' },
            { label: 'ISO Geolexica', href: 'https://isotc211.geolexica.org' },
            { label: 'BIPM VIM', href: 'https://jcgm.bipm.org/vim/en/' },
          ],
        },
        {
          title: 'About',
          items: [
            { label: 'Changelog', to: '/changelog' },
            { label: 'Contact / Impressum', to: '/impressum' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CEOS & KCEO (EC). Content licensed under CC BY 4.0. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'json', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'EO Glossary RSS Feed',
        href: 'https://ceos-org.github.io/eo-glossary/rss.xml',
      },
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'EO Glossary',
        alternateName: 'CEOS Earth Observation Thesaurus',
        description:
          'Community thesaurus of terms and definitions for Earth Observation sciences, maintained by CEOS and the JRC Knowledge Centre for Earth Observation.',
        url: 'https://ceos-org.github.io/eo-glossary/',
        publisher: {
          '@type': 'Organization',
          name: 'Committee on Earth Observation Satellites (CEOS)',
          url: 'https://ceos.org',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate:
              'https://ceos-org.github.io/eo-glossary/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }),
    },
  ],
};

export default config;

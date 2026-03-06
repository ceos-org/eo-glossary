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
    metadata: [
      {
        name: 'keywords',
        content:
          'earth observation, EO, glossary, thesaurus, remote sensing, CEOS, KCEO, JRC, vocabulary, calibration, validation, uncertainty, satellite, geospatial, interoperability',
      },
      { name: 'author', content: 'CEOS & KCEO (JRC)' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'EO Glossary' },
    ],
    image: 'assets/EC_logo.png',
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
        alt: 'EO Glossary — CEOS & KCEO',
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
            { label: 'JRC KCEO', href: 'https://joint-research-centre.ec.europa.eu/scientific-activities-z/copernicus_en' },
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
      copyright: `Copyright © ${new Date().getFullYear()} CEOS & KCEO (JRC). Content licensed under CC BY 4.0. Built with Docusaurus.`,
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

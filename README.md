# EO Glossary

**The Community Thesaurus for Earth Observation Sciences** — maintained by [CEOS](https://ceos.org) & [EC KCEO](https://knowledge4policy.ec.europa.eu/earth-observation).

Vocabulary companion to the [CEOS Interoperability Handbook 2.0](https://github.com/ceos-org/interoperability-handbook). Term structure, classification, and governance follow:

> Strobl, P. A., Woolliams, E. R., & Molch, K. (2024). *Lost in Translation: The Need for Common Vocabularies and an Interoperable Thesaurus in Earth Observation Sciences.* Surveys in Geophysics. DOI: [10.1007/s10712-024-09854-8](https://doi.org/10.1007/s10712-024-09854-8)

## Local Development

Built with [Docusaurus 3.9.2](https://docusaurus.io/). Requires **Node.js ≥ 18** and [**uv**](https://docs.astral.sh/uv/) (Python package manager, used for export scripts).

```shell
# Clone and install
git clone https://github.com/ceos-org/eo-glossary.git
cd eo-glossary
npm install

# Start dev server (hot reload)
# Also runs Python export scripts before starting (requires uv)
npm start

# Production build
# Also runs Python export scripts before building (requires uv)
npm run build

# Serve the production build locally
npm run serve
```

The dev server runs at `http://localhost:3000/eo-glossary/` by default.

> If `uv` is not installed, the Python export scripts are skipped gracefully and `npm start` / `npm run build` still work normally.

## Project Structure

```
eo-glossary/
├── docs/
│   ├── terms/              ← one .md file per term
│   ├── assets/             ← images and logos
│   ├── _template.md        ← term template (copy to add new terms)
│   ├── introduction.md
│   ├── concepts.md
│   ├── contribute.md
│   ├── dependency-graph.md
│   ├── changelog.md
│   └── impressum.md
├── plugins/
│   ├── remark-glossary-links.mjs           ← auto cross-referencing (build-time)
│   └── docusaurus-plugin-glossary-links.mjs
├── scripts/
│   ├── export_glossary.py                  ← exports to JSON/XLSX/Parquet
│   └── generate_sigma_graph_data.py        ← dependency graph data
├── src/
│   ├── css/custom.css      ← design system (dark-mode-first)
│   └── pages/index.tsx     ← custom homepage
├── static/                 ← static assets served at root
├── sidebars.ts             ← sidebar navigation config
└── docusaurus.config.ts    ← main Docusaurus config
```

## Contributing

See [`docs/contribute.md`](docs/contribute.md) for the full guide. Quick reference below.

### Editing an existing term

Click the **Edit this page** link at the bottom of any term page — it opens the file directly on GitHub.

### Adding a new term

1. Copy [`docs/_template.md`](docs/_template.md) to `docs/terms/your_term_name.md` (lowercase, underscores).
2. Fill in the frontmatter and definition following the template.
3. Open a PR — the sidebar and term count update automatically. CI will build, generate exports, and deploy.

### Term file format

```yaml
---
title: Your Term
description: "One-sentence substitutable definition (used for SEO and link previews)."
tags:
  - core            # term class: base | core | controversial | high-impact
  - to be discussed # status: to be defined | to be discussed | to be approved | approved
---

# Your Term

## 1 Definition

Substitutable definition — must NOT start with "Your Term is...".
Write it so it can directly replace the term in a sentence.

### Notes

- Additional context or clarifications.

### Examples

- Concrete example.

### Sources

- Author et al. Year — or [Source](https://example.com)
```

**Do not add cross-links manually.** The build system automatically links term mentions in the Definition and Notes sections to their glossary pages. Source files must remain plain Markdown.

### Tag system

| Tag | Meaning |
|-----|---------|
| `base` | Foundational ontology — usable across all sciences |
| `core` | Standard EO vocabulary with broadly agreed definitions |
| `controversial` | Contested definitions across communities; multiple definitions provided |
| `high-impact` | Concepts requiring full framework documents, not a single sentence |

| Status tag | Meaning |
|------------|---------|
| `to be defined` | Placeholder; definition not yet written |
| `to be discussed` | Draft exists; community discussion needed |
| `to be approved` | Definition ready; awaiting formal approval |
| `approved` | Definition approved by the community |

### Definition quality rule (THES#4 — substitution principle)

Every definition must be directly substitutable for the term in a sentence:

- **Wrong:** "Accuracy is the proximity of measurement results to the accepted value."
- **Correct:** "Proximity of measurement results to the accepted value."

## Cross-referencing

Term cross-references are resolved automatically at **build time** by a Remark plugin ([`plugins/remark-glossary-links.mjs`](plugins/remark-glossary-links.mjs)). It scans all term files, builds a term→URL map, and linkifies matching term mentions in the **Definition** and **Notes** sections only — without ever modifying source files. Examples and Sources sections are intentionally excluded.

Longest-match wins: "Earth Observation" is linked as a single term, not as "Earth" + "Observation" separately.

## Exports

Automated exports (JSON, XLSX, Parquet) are generated on every push and available in [`exports/`](exports/).

Query terms via DuckDB without downloading the full dataset:

```sql
INSTALL httpfs;
LOAD httpfs;

SELECT *
FROM read_parquet('https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/parquet/terms_definition_1.parquet')
WHERE term ILIKE 'climate projection';
```

Run with `duckdb -ui` or any DuckDB client.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main`:

1. Runs Python export scripts (`export_glossary.py`, `generate_sigma_graph_data.py`) via `uv`
2. Commits generated exports and graph data back to `main`
3. Installs Node dependencies and builds the Docusaurus site
4. Deploys to GitHub Pages (`gh-pages` branch)

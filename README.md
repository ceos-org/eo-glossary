# EO Glossary

**The Community Thesaurus for Earth Observation Sciences** — maintained by [CEOS](https://ceos.org) & [JRC KCEO](https://joint-research-centre.ec.europa.eu/scientific-activities-z/copernicus_en).

> Based on Strobl et al. 2024 — *"Lost in Translation: The Need for Common Vocabularies and an Interoperable Thesaurus in Earth Observation Sciences"*, DOI: [10.1007/s10712-024-09854-8](https://doi.org/10.1007/s10712-024-09854-8)

## Local Development

Built with [Docusaurus 3.9.2](https://docusaurus.io/). Requires **Node.js ≥ 18**.

```shell
# Clone and install
git clone https://github.com/ceos-org/eo-glossary.git
cd eo-glossary
npm install

# Start dev server (hot reload)
npm start

# Production build
npm run build

# Serve the production build locally
npm run serve

# Type-check the config
npm run typecheck
```

The dev server runs at `http://localhost:3000/eo-glossary/` by default.

## Project Structure

```
eo-glossary/
├── docs/
│   ├── terms/              ← 147 term files (one per term)
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
│   ├── css/custom.css      ← design system (dark-mode-first, space palette)
│   └── pages/index.tsx     ← custom homepage
├── static/                 ← static assets served at root
├── sidebars.ts             ← sidebar navigation config
└── docusaurus.config.ts    ← main Docusaurus config
```

## Contributing

### Editing an existing term

Click the **Edit this page** link at the bottom of any term page — it opens the file directly on GitHub.

### Adding a new term

1. Copy [`docs/_template.md`](docs/_template.md) to `docs/terms/your_term_name.md` (lowercase, underscores).
2. Fill in the frontmatter and definition following the template.
3. Add the term to [`sidebars.ts`](sidebars.ts) in alphabetical order.
4. Open a PR — CI will build and deploy automatically.

### Term file format

```yaml
---
title: Your Term
description: "One-sentence substitutable definition (used for SEO and previews)."
tags:
  - core       # or: base | controversial | high-impact
---

# Your Term

## 1 Definition

Substitutable definition — must NOT start with "Your Term is...".
Write it so it can directly replace the term in a sentence.

### Notes

- Additional context or clarifications.

### Examples

### Sources

- Author et al. Year
```

### Tag system (Strobl et al. 2024)

| Tag | Meaning | Examples |
|-----|---------|---------|
| `base` | Fundamental ontology — usable across all sciences | Data, Entity, Phenomenon, Property, Value, Quantity, Object, Trait, Characteristic, Feature, Information, Place, Process |
| `core` | Standard EO vocabulary | Calibration, Sensor, Granule, Metadata, Spatial Resolution, … |
| `controversial` | Contested definitions across communities | Observation, In-Situ Observation, Model, Sample, Position |
| `high-impact` | Policy-adjacent or socially significant | Earth Observation, Near Real Time Data, Policy cluster |

### Definition quality rule (THES#4 — substitution principle)

Every definition must be directly substitutable for the term in a sentence:

- **Wrong:** "Accuracy is the proximity of measurement results to the accepted value."
- **Correct:** "Proximity of measurement results to the accepted value."

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

## Cross-referencing

Term cross-references are resolved automatically at **build time** by a Remark plugin ([`plugins/remark-glossary-links.mjs`](plugins/remark-glossary-links.mjs)). It scans all term files, builds a term→URL map, and linkifies matching terms in every page's prose — without ever modifying source files.

No manual script runs needed.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main`:
1. Installs Node dependencies and builds the Docusaurus site
2. Runs Python export scripts (JSON, XLSX, Parquet)
3. Deploys to GitHub Pages (`gh-pages` branch)

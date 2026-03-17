---
title: Data Access
description: How to access the EO Glossary data programmatically — exports in JSON, Parquet, and XLSX, plain-text for LLM ingestion, MCP server for AI assistants, and structured data on every term page.
displayed_sidebar: null
---

# Data Access

The EO Glossary is designed from the ground up to be machine-readable and AI-friendly. Every term carries structured metadata, and the full dataset is available in multiple formats — ready for direct LLM ingestion, RAG pipelines, data analysis, or integration into AI assistants.

This page describes all access patterns in detail.

## At a Glance

| Resource | URL | Format | Best for |
|----------|-----|--------|----------|
| AI guidance | [`/llms.txt`](https://ceos-org.github.io/eo-glossary/llms.txt) | Markdown | LLM crawlers and agents ([llmstxt.org](https://llmstxt.org) standard) |
| All definitions (plain text) | [`/llms-full.txt`](https://ceos-org.github.io/eo-glossary/llms-full.txt) | Markdown | Direct LLM ingestion, RAG chunking |
| All definitions (structured) | [`exports/json/terms.json`](https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/json/terms.json) | JSON | RAG pipelines, programmatic access |
| All definitions (columnar) | [`exports/parquet/`](https://github.com/ceos-org/eo-glossary/tree/main/exports/parquet) | Parquet | DuckDB, data science, analytics |
| All definitions (spreadsheet) | [`exports/xlsx/`](https://github.com/ceos-org/eo-glossary/tree/main/exports/xlsx) | XLSX | Excel, Google Sheets, manual review |
| Per-term JSON | `/terms/{slug}.json` | JSON | Single-term lookups |
| Per-term Markdown | `/terms/{slug}.md` | Markdown | Raw source files |
| Sitemap | [`/sitemap.xml`](https://ceos-org.github.io/eo-glossary/sitemap.xml) | XML | Web crawlers |
| RSS feed | [`/rss.xml`](https://ceos-org.github.io/eo-glossary/rss.xml) | RSS 2.0 | Feed readers, change tracking |

All exports are regenerated automatically on every push to `main`.

---

## llms.txt — AI Crawler Guidance

Following the [llmstxt.org](https://llmstxt.org) standard, the glossary serves a [`/llms.txt`](https://ceos-org.github.io/eo-glossary/llms.txt) file at its root. This lightweight Markdown file tells LLM crawlers and agents what the glossary contains, how it is structured, and where to find the data they need.

If you are building an AI agent or crawler that discovers resources automatically, point it at `/llms.txt` first.

---

## llms-full.txt — Plain-Text Definitions for LLMs

The [`/llms-full.txt`](https://ceos-org.github.io/eo-glossary/llms-full.txt) file contains **all term definitions concatenated as plain Markdown** — one block per term, separated by horizontal rules. Each block includes:

- Term name and URL
- Tags (ontology class + approval status)
- One-sentence summary
- Full definition, notes, examples, and sources

This file is designed for **direct LLM ingestion**: paste it into a system prompt, use it as a context document, or chunk it for a RAG pipeline. It is generated at build time and always reflects the latest state of the glossary.

**Example block:**

```markdown
# Accuracy
URL: https://ceos-org.github.io/eo-glossary/terms/accuracy
Tags: core, approved
Summary: Proximity of Measurement results to the accepted Value...

## 1 Definition

Proximity of Measurement results to the accepted Value...

### Notes
- ...

### Sources
- VIM 2.13, modified
```

---

## JSON Export — Structured Data

The full glossary is exported as a single JSON file:

**[`exports/json/terms.json`](https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/json/terms.json)**

Each entry contains:

```json
{
  "term": "Accuracy",
  "tags": "core, approved",
  "synonyms": "",
  "definitions": [
    {
      "definition_no": 1,
      "definition": "Proximity of Measurement results to the accepted Value...",
      "notes": "...",
      "examples": "...",
      "sources": "- VIM 2.13, modified"
    }
  ]
}
```

Terms with multiple definitions (e.g. controversial terms) have multiple entries in the `definitions` array.

### Flattened JSON exports

For simpler consumption, flattened exports are also available where each file contains only a single definition per term:

- [`terms_definition_1.json`](https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/json/terms_definition_1.json) — first definition of each term
- [`terms_definition_2.json`](https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/json/terms_definition_2.json) — second definition (where available)
- ...up to `terms_definition_5.json`

---

## Parquet Export — Analytics & DuckDB

The same data is available as [Apache Parquet](https://parquet.apache.org/) files — a columnar format ideal for data science tooling, DuckDB, pandas, Polars, and other analytical frameworks.

### Query directly with DuckDB (no download needed)

```sql
INSTALL httpfs;
LOAD httpfs;

-- Browse all terms
SELECT * FROM read_parquet(
  'https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/parquet/terms_definition_1.parquet'
);

-- Search for a specific term
SELECT term, definition, sources
FROM read_parquet(
  'https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/parquet/terms_definition_1.parquet'
)
WHERE term ILIKE '%calibration%';
```

Run with `duckdb -ui` for an interactive browser-based UI, or use any DuckDB client.

### Query with Python (pandas / Polars)

```python
import pandas as pd

url = "https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/parquet/terms_definition_1.parquet"
df = pd.read_parquet(url)
print(df[df["term"].str.contains("Calibration", case=False)])
```

### Available Parquet files

| File | Contents |
|------|----------|
| `terms.parquet` | All terms with nested definitions |
| `terms_definition_1.parquet` | First definition of each term (flat) |
| `terms_definition_2.parquet` | Second definition where available |
| ...up to `terms_definition_5.parquet` | |

---

## XLSX Export — Spreadsheet Access

For users who prefer working in Excel or Google Sheets, the glossary is also exported as XLSX files:

- [`terms.xlsx`](https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/xlsx/terms.xlsx) — all terms
- [`terms_definition_1.xlsx`](https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/xlsx/terms_definition_1.xlsx) — first definition of each term (flat)
- ...up to `terms_definition_5.xlsx`

---

## Per-Term JSON & Markdown

Every term is available individually as both JSON and raw Markdown, served directly from the site:

- **JSON:** `https://ceos-org.github.io/eo-glossary/terms/{slug}.json`
- **Markdown:** `https://ceos-org.github.io/eo-glossary/terms/{slug}.md`

For example:
- [`/terms/accuracy.json`](https://ceos-org.github.io/eo-glossary/terms/accuracy.json) — structured JSON for the term "Accuracy"
- [`/terms/accuracy.md`](https://ceos-org.github.io/eo-glossary/terms/accuracy.md) — raw Markdown source

These are useful for single-term lookups in scripts or AI tool calls.

---

## Schema.org Structured Data (JSON-LD)

Every term page includes a [Schema.org `DefinedTerm`](https://schema.org/DefinedTerm) JSON-LD block in its HTML `<head>`. This enables semantic search engines and knowledge graphs to understand and index term definitions directly.

---

## MCP Server — AI Assistant Integration

The glossary ships with a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that lets AI assistants like Claude Desktop query the glossary interactively.

### Setup

```bash
cd mcp && npm install
```

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "eo-glossary": {
      "command": "node",
      "args": ["/path/to/eo-glossary/mcp/server.js"]
    }
  }
}
```

### Available tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_terms` | List all terms, optionally filtered by tag | `tag` (optional): `"core"`, `"approved"`, etc. |
| `get_term` | Get full definition(s) for a specific term | `term` (required): name or slug |
| `search_terms` | Search terms by keyword (name + definition text) | `query` (required): search string |

### Example interaction

Once configured, you can ask your AI assistant things like:

- *"What does the EO Glossary define as 'Calibration'?"*
- *"List all controversial terms in the EO Glossary"*
- *"Search the EO Glossary for terms related to uncertainty"*

The MCP server loads data from `exports/json/terms.json` locally, or falls back to fetching from GitHub if the local file is not available.

---

## RSS Feed

The [`/rss.xml`](https://ceos-org.github.io/eo-glossary/rss.xml) feed tracks term updates. Subscribe in any feed reader to stay informed when definitions are added or modified.

---

## Building Your Own Integration

The glossary's open data makes it straightforward to build custom integrations:

- **RAG pipeline**: Ingest `llms-full.txt` or `terms.json`, chunk by term, embed with your model of choice
- **Search index**: Parse `terms.json` and index into Elasticsearch, Meilisearch, Typesense, etc.
- **Knowledge graph**: Use the per-term JSON (which includes source attributions) to build ontology-aware graphs
- **CI/CD checks**: Fetch `terms.json` in your pipeline to validate that documentation uses consistent EO terminology
- **Chatbot / agent**: Connect the MCP server, or fetch `terms.json` at startup for in-memory lookups

All data is licensed under **CC BY 4.0** — free to use, share, and adapt with attribution.

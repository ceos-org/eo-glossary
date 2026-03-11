#!/usr/bin/env node
/**
 * EO Glossary MCP Server
 *
 * Exposes the CEOS EO Glossary to AI assistants via the Model Context Protocol.
 * Data is loaded from exports/json/terms.json (the canonical export produced by
 * scripts/export_glossary.py, committed to the repository).
 *
 * Tools:
 *   list_terms   — list all terms (optionally filtered by tag)
 *   get_term     — get full definition(s) for a specific term
 *   search_terms — search term names and definitions by keyword
 *
 * Usage (Claude Desktop — add to claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "eo-glossary": {
 *         "command": "node",
 *         "args": ["/path/to/eo-glossary/mcp/server.js"]
 *       }
 *     }
 *   }
 *
 * Install dependencies first: cd mcp && npm install
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load term data ─────────────────────────────────────────────────────────────
// Primary: local exports/json/terms.json (always present after running export_glossary.py)
// Fallback: fetch from GitHub raw URL

const DATA_PATH = path.resolve(__dirname, '../exports/json/terms.json');
const LIVE_URL = 'https://github.com/ceos-org/eo-glossary/raw/refs/heads/main/exports/json/terms.json';
const BASE_URL = 'https://ceos-org.github.io/eo-glossary';

/** Derive a URL slug from a term name: "Earth Observation" → "earth_observation" */
const toSlug = (term) => term.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

let terms = [];

async function loadTerms() {
  if (fs.existsSync(DATA_PATH)) {
    terms = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    return;
  }
  const res = await fetch(LIVE_URL);
  if (!res.ok) throw new Error(`Failed to fetch terms: ${res.status}`);
  terms = await res.json();
}

// ── Server setup ───────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'eo-glossary', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_terms',
      description:
        'List EO Glossary terms. Optionally filter by ontology tag (base, core, controversial, high-impact) or status tag (approved, to be approved, to be discussed, to be defined).',
      inputSchema: {
        type: 'object',
        properties: {
          tag: {
            type: 'string',
            description: 'Optional tag to filter by, e.g. "core", "approved", "controversial"',
          },
        },
      },
    },
    {
      name: 'get_term',
      description:
        'Get the full definition(s) of an EO Glossary term by name or slug (e.g. "accuracy" or "earth_observation"). Returns all definitions, notes, examples, and sources.',
      inputSchema: {
        type: 'object',
        properties: {
          term: {
            type: 'string',
            description: 'Term name or slug, e.g. "Accuracy" or "earth_observation"',
          },
        },
        required: ['term'],
      },
    },
    {
      name: 'search_terms',
      description:
        'Search EO Glossary terms by keyword. Matches against term name and definition text (case-insensitive).',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query string',
          },
        },
        required: ['query'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'list_terms') {
    const tag = args?.tag?.toLowerCase();
    const filtered = tag
      ? terms.filter((t) => t.tags?.toLowerCase().includes(tag))
      : terms;
    const result = filtered.map((t) => ({
      term: t.term,
      slug: toSlug(t.term),
      url: `${BASE_URL}/terms/${toSlug(t.term)}`,
      tags: t.tags,
      synonyms: t.synonyms || undefined,
      definition_count: t.definitions?.length ?? 0,
    }));
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  if (name === 'get_term') {
    const query = String(args?.term ?? '').trim();
    const queryLower = query.toLowerCase().replace(/\s+/g, '_');
    const found =
      terms.find((t) => t.term.toLowerCase() === query.toLowerCase()) ??
      terms.find((t) => toSlug(t.term) === queryLower);

    if (!found) {
      return {
        content: [{ type: 'text', text: `Term "${query}" not found. Use list_terms or search_terms to find available terms.` }],
        isError: true,
      };
    }

    const result = {
      term: found.term,
      slug: toSlug(found.term),
      url: `${BASE_URL}/terms/${toSlug(found.term)}`,
      tags: found.tags,
      synonyms: found.synonyms || undefined,
      definitions: found.definitions,
    };
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  if (name === 'search_terms') {
    const query = String(args?.query ?? '').toLowerCase().trim();
    if (!query) return { content: [{ type: 'text', text: '[]' }] };

    const matched = terms.filter((t) => {
      if (t.term.toLowerCase().includes(query)) return true;
      return t.definitions?.some(
        (d) =>
          d.definition?.toLowerCase().includes(query) ||
          d.notes?.toLowerCase().includes(query),
      );
    });

    const result = matched.map((t) => ({
      term: t.term,
      slug: toSlug(t.term),
      url: `${BASE_URL}/terms/${toSlug(t.term)}`,
      tags: t.tags,
      first_definition: t.definitions?.[0]?.definition ?? '',
    }));
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  return {
    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

// ── Start ──────────────────────────────────────────────────────────────────────

await loadTerms();
const transport = new StdioServerTransport();
await server.connect(transport);

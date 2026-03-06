/**
 * Remark plugin for automatic glossary cross-referencing.
 *
 * Replaces the manual Python scripts with a build-time Remark plugin that:
 * - Reads all term files to build a glossary map
 * - Auto-links term mentions in doc text (longest match, case-insensitive)
 * - Handles simple plurals (terms, termses → still links)
 * - Skips headings, code, existing links, and self-references
 * - Runs at build time – no source file modification needed
 */

import { visit } from 'unist-util-visit';
import fs from 'fs';
import path from 'path';

// Files to exclude from self-referencing check but NOT from linking targets
const META_FILES = new Set(['concepts.md', 'contribute.md', 'introduction.md', 'introduction.md']);

/**
 * Build a map: lowercase_term → { slug, title, url }
 * Reads frontmatter title and H1 headings from all term files.
 */
function buildTermMap(termsDir) {
  const map = new Map();
  let files;
  try {
    files = fs.readdirSync(termsDir);
  } catch {
    return map;
  }

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(termsDir, file);
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const slug = file.replace('.md', '');
    const url = `/terms/${slug}`;

    // Extract title from YAML frontmatter (title: ...)
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const titleMatch = frontmatterMatch[1].match(/^title:\s*(.+)$/m);
      if (titleMatch) {
        const title = titleMatch[1].trim().replace(/['"]/g, '');
        if (title && title.length > 2) {
          map.set(title.toLowerCase(), { slug, title, url });
        }
      }
    }

    // Also extract H1 headings (for files with multiple definitions / alternate names)
    const h1Matches = [...content.matchAll(/^# (.+)$/gm)];
    for (const match of h1Matches) {
      const term = match[1].trim().replace(/[*_`[\]]/g, '');
      if (term && term.length > 2 && !map.has(term.toLowerCase())) {
        map.set(term.toLowerCase(), { slug, title: term, url });
      }
    }
  }

  return map;
}

/** Sort terms longest-first so longer phrases match before shorter substrings */
function getSortedTermEntries(termMap) {
  return [...termMap.entries()].sort((a, b) => b[0].length - a[0].length);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Given a text string, find all non-overlapping glossary term matches
 * and return a list of remark AST nodes (text + link alternating).
 */
function linkifyText(text, sortedEntries, selfSlugs) {
  // Collect all matches across all terms
  const matches = [];

  for (const [termLower, termInfo] of sortedEntries) {
    if (selfSlugs.has(termInfo.slug)) continue;

    const pattern = new RegExp(
      `(?<![\\w/])${escapeRegex(termLower)}(?:es|s)?(?![\\w/])`,
      'gi'
    );

    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        matched: match[0],
        termInfo,
      });
    }
  }

  if (matches.length === 0) {
    return [{ type: 'text', value: text }];
  }

  // Sort by start position; remove overlaps (first match wins for same position)
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const nonOverlapping = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start >= cursor) {
      nonOverlapping.push(m);
      cursor = m.end;
    }
  }

  // Build node list
  const nodes = [];
  cursor = 0;
  for (const m of nonOverlapping) {
    if (m.start > cursor) {
      nodes.push({ type: 'text', value: text.slice(cursor, m.start) });
    }
    nodes.push({
      type: 'link',
      url: m.termInfo.url,
      title: m.termInfo.title,
      children: [{ type: 'text', value: m.matched }],
    });
    cursor = m.end;
  }
  if (cursor < text.length) {
    nodes.push({ type: 'text', value: text.slice(cursor) });
  }

  return nodes;
}

/**
 * Main remark plugin factory.
 * @param {{ termsDir: string }} options
 */
export function remarkGlossaryLinks(options = {}) {
  const { termsDir } = options;
  let sortedEntries = null;

  return function transformer(tree, file) {
    // Build term map lazily (once per process)
    if (!sortedEntries && termsDir) {
      const termMap = buildTermMap(termsDir);
      sortedEntries = getSortedTermEntries(termMap);
    }
    if (!sortedEntries || sortedEntries.length === 0) return;

    // Determine self slugs from the current file path
    const filePath = file.history?.[0] || '';
    const fileName = path.basename(filePath, '.md');
    const selfSlugs = new Set([fileName]);

    // Also add H1 headings of this file as self-slugs to avoid self-linking term variants
    visit(tree, 'heading', (node) => {
      if (node.depth === 1) {
        const headingText = node.children
          .filter((c) => c.type === 'text')
          .map((c) => c.value)
          .join('')
          .toLowerCase();
        // Find matching slug
        for (const [termLower, termInfo] of sortedEntries) {
          if (termLower === headingText) {
            selfSlugs.add(termInfo.slug);
          }
        }
      }
    });

    // Process paragraph text nodes only (not headings, code, links)
    visit(tree, 'paragraph', (paragraphNode) => {
      const newChildren = [];
      let modified = false;

      for (const child of paragraphNode.children) {
        if (child.type !== 'text') {
          newChildren.push(child);
          continue;
        }

        const linked = linkifyText(child.value, sortedEntries, selfSlugs);
        if (linked.length > 1 || (linked.length === 1 && linked[0].type !== 'text')) {
          modified = true;
        }
        newChildren.push(...linked);
      }

      if (modified) {
        paragraphNode.children = newChildren;
      }
    });

    // Also process list item text nodes
    visit(tree, 'listItem', (listItemNode) => {
      visit(listItemNode, 'paragraph', (paragraphNode) => {
        const newChildren = [];
        let modified = false;

        for (const child of paragraphNode.children) {
          if (child.type !== 'text') {
            newChildren.push(child);
            continue;
          }

          const linked = linkifyText(child.value, sortedEntries, selfSlugs);
          if (linked.length > 1 || (linked.length === 1 && linked[0].type !== 'text')) {
            modified = true;
          }
          newChildren.push(...linked);
        }

        if (modified) {
          paragraphNode.children = newChildren;
        }
      });
    });
  };
}

export default remarkGlossaryLinks;

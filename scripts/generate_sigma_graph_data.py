# /// script
# dependencies = []
# ///
"""
Generate Sigma.js graph data from EO Glossary term definitions.

Edges are created when a term B is mentioned in the definition of term A.
Nodes are coloured by tag class and sized by in-degree (how often referenced).

Output: static/graph/data.json
Run from repo root: uv run scripts/generate_sigma_graph_data.py
"""
import os
import re
import json

DOCS_DIRECTORY = './docs/terms'
OUTPUT_JSON_FILE = './static/graph/data.json'

# Tag → colour mapping matching the site design system
TAG_COLORS = {
    'base':        '#60a5fa',   # blue
    'core':        '#4ade80',   # green
    'controversial': '#fb923c', # orange
    'high-impact': '#c084fc',   # purple
}
DEFAULT_COLOR = '#94a3b8'

DEFAULT_NODE_SIZE = 8
DEFAULT_EDGE_COLOR = '#334155'


# ── Helpers ────────────────────────────────────────────────────────────────────

def read_term(file_path):
    """Parse a term .md file, return dict with title, slug, tags, definition."""
    slug = os.path.splitext(os.path.basename(file_path))[0]
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

    # Title from frontmatter
    title_match = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else slug.replace('_', ' ').title()

    # Tags from frontmatter YAML block
    fm_match = re.search(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    tags = []
    if fm_match:
        in_tags = False
        for line in fm_match.group(1).splitlines():
            if re.match(r'^tags:', line):
                in_tags = True
                continue
            if in_tags:
                if line.startswith(' ') or line.startswith('-'):
                    tag = line.strip().lstrip('- ').strip()
                    if tag:
                        tags.append(tag)
                else:
                    in_tags = False

    # Definition text (under ## 1 Definition, until next ## or ###)
    definition = ''
    in_def = False
    for line in content.splitlines():
        if re.match(r'^## 1 Definition', line.strip()):
            in_def = True
            continue
        if in_def:
            if line.strip().startswith('## ') or line.strip().startswith('### '):
                break
            definition += line + '\n'

    return {
        'slug': slug,
        'title': title,
        'tags': tags,
        'definition': definition.strip(),
    }


def get_color(tags):
    for tag in ['base', 'controversial', 'high-impact', 'core']:
        if tag in tags:
            return TAG_COLORS[tag]
    return DEFAULT_COLOR


def find_mentions(definition_text, all_terms, self_slug):
    """Find which term slugs are mentioned in the definition text."""
    mentioned = set()
    text_lower = definition_text.lower()
    for term in all_terms:
        if term['slug'] == self_slug:
            continue
        # Match the title (and simple plural)
        title_lower = term['title'].lower()
        pattern = r'(?<![a-z])' + re.escape(title_lower) + r'(?:es|s)?(?![a-z])'
        if re.search(pattern, text_lower):
            mentioned.add(term['slug'])
    return mentioned


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    if not os.path.isdir(DOCS_DIRECTORY):
        print(f"Error: '{DOCS_DIRECTORY}' not found. Run from the project root.")
        return

    os.makedirs(os.path.dirname(OUTPUT_JSON_FILE), exist_ok=True)

    md_files = sorted(
        f for f in os.listdir(DOCS_DIRECTORY)
        if f.endswith('.md') and not f.startswith('_')
    )

    print(f"Reading {len(md_files)} term files...")
    terms = []
    for fname in md_files:
        t = read_term(os.path.join(DOCS_DIRECTORY, fname))
        if t:
            terms.append(t)

    print("Building edges from definition mentions...")
    edges_set = set()
    for term in terms:
        if not term['definition']:
            continue
        mentioned = find_mentions(term['definition'], terms, term['slug'])
        for target_slug in mentioned:
            edges_set.add((term['slug'], target_slug))

    # Calculate in-degree for node sizing
    in_degree = {t['slug']: 0 for t in terms}
    for src, tgt in edges_set:
        in_degree[tgt] = in_degree.get(tgt, 0) + 1

    max_degree = max(in_degree.values()) if in_degree else 1

    # Build sigma.js node/edge format
    import random
    random.seed(42)  # reproducible layout

    nodes = []
    for term in terms:
        degree = in_degree.get(term['slug'], 0)
        size = DEFAULT_NODE_SIZE + (degree / max(max_degree, 1)) * 20
        nodes.append({
            'id': term['slug'],
            'label': term['title'],
            'x': round(random.uniform(0, 100), 2),
            'y': round(random.uniform(0, 100), 2),
            'size': round(size, 1),
            'color': get_color(term['tags']),
            'tags': term['tags'],
        })

    edges = [
        {
            'id': f'{s}__{t}',
            'source': s,
            'target': t,
            'color': DEFAULT_EDGE_COLOR,
            'size': 1,
            'type': 'arrow',
        }
        for s, t in sorted(edges_set)
    ]

    output = {'nodes': nodes, 'edges': edges}

    with open(OUTPUT_JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Wrote {OUTPUT_JSON_FILE}: {len(nodes)} nodes, {len(edges)} edges.")


if __name__ == '__main__':
    main()

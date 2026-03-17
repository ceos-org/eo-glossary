---
title: Term Dependency Graph
description: Interactive force-directed graph showing relationships and dependencies between EO Glossary terms, built with Sigma.js.
sidebar_label: Dependency Graph
displayed_sidebar: glossary
---

import useBaseUrl from '@docusaurus/useBaseUrl';

export const GraphIframe = () => (
  <iframe
    src={useBaseUrl('/graph')}
    width="100%"
    height="700px"
    style={{border: 'none', borderRadius: '8px'}}
    title="EO Glossary Dependency Graph"
  />
);

# Term Dependency Graph

The interactive graph below visualises how glossary terms relate to and depend on each other. Terms that appear in the definition of other terms are connected by directed edges — revealing which concepts are truly foundational.

**How to use:**
- **Hover** over a node to highlight its direct connections
- **Click** a node to navigate to the term's page
- **Scroll** to zoom in/out
- **Drag** to pan; drag nodes to rearrange
- Use the **filter controls** (top-right) to show only specific term classes

<GraphIframe />

## About the Graph

The graph is generated automatically from the term definitions using the `generate_sigma_graph_data.py` script. An edge from term **A** to term **B** exists when term B is referenced in the definition of term A — i.e., B is a dependency of A.

Nodes are coloured by term class:
- **Blue** — Base terms (foundational concepts)
- **Green** — Core terms (standard EO vocabulary)
- **Orange** — Controversial terms (multiple or disputed definitions)
- **Purple** — High-impact terms (require framework documents)

Nodes are sized by **in-degree** (how many other terms reference them), so the largest nodes are the most foundational.

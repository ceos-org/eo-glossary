import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface Term {
  title: string;
  slug: string;
}

interface TagInfo {
  tag: string;
  count: number;
  terms: Term[];
}

// Read tag data from term files at build time is not feasible in a component,
// so we use the Docusaurus-generated tags routes instead.
// This component links to the auto-generated /tags/<tag> pages.
const TAG_DESCRIPTIONS: Record<string, string> = {
  base: 'Ontological foundations used in the definitions of other terms',
  core: 'Standard EO vocabulary with broadly agreed definitions',
  controversial: 'Terms whose meaning differs materially across communities',
  'high-impact': 'Concepts requiring a full framework document',
  approved: 'Terms with community consensus',
  'to-be-defined': 'Terms awaiting a definition',
  'to-be-discussed': 'Terms under active discussion',
  'to-be-approved': 'Terms pending formal approval',
  'source-missing': 'Terms lacking source attribution',
  'calval-ingest': 'Terms ingested from the CEOS CalVal Portal glossary',
  wgcv: 'Assigned to the Working Group on Calibration & Validation',
  wgiss: 'Assigned to the Working Group on Information Systems & Services',
  'wg-climate': 'Assigned to the CEOS/CGMS Working Group on Climate',
};

const TAG_ORDER = [
  'base',
  'core',
  'controversial',
  'high-impact',
  'approved',
  'to-be-approved',
  'to-be-discussed',
  'to-be-defined',
  'source-missing',
  'calval-ingest',
  'wgcv',
  'wgiss',
  'wg-climate',
];

export default function TagsOverview() {
  return (
    <div className="tags-overview">
      <div className="tag-legend" style={{ marginTop: '1rem' }}>
        {TAG_ORDER.map((tag) => (
          <Link
            key={tag}
            to={`/tags/${tag}`}
            className="tag-legend-item"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <span
              className="tag-legend-badge"
              data-tag={tag}
              style={{ alignSelf: 'flex-start' }}
            >
              {tag}
            </span>
            <p className="tag-legend-text">
              {TAG_DESCRIPTIONS[tag] || tag}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

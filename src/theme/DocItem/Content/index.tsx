import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import Link from '@docusaurus/Link';
import type {Props} from '@theme/DocItem/Content';

function useSyntheticTitle(): string | null {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) {
    return null;
  }
  return metadata.title;
}

/** Slug for URL/CSS: "to be defined" → "to-be-defined" */
function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

function DocTagsBadges(): ReactNode {
  const {metadata} = useDoc();
  const tags = metadata.tags;
  if (!tags || tags.length === 0) {
    return null;
  }
  return (
    <div className="doc-tags-badges" style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: '1rem',
    }}>
      {tags.map((tag) => (
        <Link
          key={tag.permalink}
          to={tag.permalink}
          className={clsx('badge', `tag--${tagSlug(tag.label)}`)}
          data-tag={tagSlug(tag.label)}
        >
          {tag.label}
        </Link>
      ))}
    </div>
  );
}

export default function DocItemContent({children}: Props): ReactNode {
  const syntheticTitle = useSyntheticTitle();
  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      {syntheticTitle && (
        <header>
          <Heading as="h1">{syntheticTitle}</Heading>
        </header>
      )}
      <DocTagsBadges />
      <MDXContent>{children}</MDXContent>
    </div>
  );
}

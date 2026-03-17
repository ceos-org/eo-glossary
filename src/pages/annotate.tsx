import React, { type ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

// ── Types ────────────────────────────────────────────────────────────────────
interface ProcessedTerm {
  term: string;
  slug: string;
  definition: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const GLOSSARY_BASE = 'https://ceos-org.github.io/eo-glossary';
const ANNOTATE_TERMS_PATH = '/annotate-terms.json';

// ── Icons (Lucide-style) ────────────────────────────────────────────────────
function IconClipboard({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function IconDownload({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconAnnotate({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

// ── Annotation engine ────────────────────────────────────────────────────────
function annotateText(
  inputText: string,
  terms: ProcessedTerm[],
): { html: string; markdown: string; plain: string; matchCount: number } {
  if (!inputText.trim() || terms.length === 0) {
    return { html: '', markdown: '', plain: '', matchCount: 0 };
  }

  // Build a single regex alternating all terms, longest first (already sorted)
  const pattern = terms.map(t => escapeRegex(t.term)).join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  // Map lowercase term → ProcessedTerm for fast lookup
  const lookup = new Map<string, ProcessedTerm>();
  for (const t of terms) {
    lookup.set(t.term.toLowerCase(), t);
  }

  // Track which positions have already been replaced (avoid overlapping matches)
  const matches: { start: number; end: number; term: ProcessedTerm; original: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(inputText)) !== null) {
    const matched = m[1];
    const t = lookup.get(matched.toLowerCase());
    if (t) {
      matches.push({ start: m.index, end: m.index + matched.length, term: t, original: matched });
    }
  }

  if (matches.length === 0) {
    return { html: inputText, markdown: inputText, plain: inputText, matchCount: 0 };
  }

  let html = '';
  let markdown = '';
  let plain = '';
  let cursor = 0;

  for (const match of matches) {
    // Text before this match
    const before = inputText.slice(cursor, match.start);
    html += escapeHtml(before);
    markdown += before;
    plain += before;

    const url = `${GLOSSARY_BASE}/terms/${match.term.slug}`;
    const def = match.term.definition;

    // HTML output
    html +=
      `<span class="annotate-match" title="${escapeHtml(def)}">` +
      `<strong>${escapeHtml(def)}</strong> ` +
      `[<a href="${url}" target="_blank" rel="noreferrer">${escapeHtml(match.original)}</a>]` +
      `</span>`;

    // Markdown output
    markdown += `**${def}** ([${match.original}](${url}))`;

    // Plain text output
    plain += `${def} [${match.original}]`;

    cursor = match.end;
  }

  // Remaining text
  const tail = inputText.slice(cursor);
  html += escapeHtml(tail);
  markdown += tail;
  plain += tail;

  return { html, markdown, plain, matchCount: matches.length };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Split button ────────────────────────────────────────────────────────────
function SplitButton({
  label,
  content,
  filename,
  mimeType,
}: {
  label: string;
  content: string;
  filename: string;
  mimeType: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, filename, mimeType]);

  return (
    <div className="annotate-split-btn">
      <button
        className="annotate-split-btn__copy"
        onClick={handleCopy}
        title={`Copy as ${label}`}
      >
        {copied ? <IconCheck size={14} /> : <IconClipboard size={14} />}
        <span>{copied ? 'Copied' : label}</span>
      </button>
      <button
        className="annotate-split-btn__download"
        onClick={handleDownload}
        title={`Download as ${filename}`}
      >
        <IconDownload size={14} />
      </button>
    </div>
  );
}

// ── Word document export ────────────────────────────────────────────────────
function generateWordContent(html: string): string {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Annotated Text</title>
<style>
body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.6; }
a { color: #1d5fbe; }
strong { font-weight: bold; }
</style></head>
<body>${html}</body></html>`;
}

function WordSplitButton({ html }: { html: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      // Copy as rich text via ClipboardItem
      const blob = new Blob([html], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy plain HTML
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [html]);

  const handleDownload = useCallback(() => {
    const wordHtml = generateWordContent(html);
    const blob = new Blob([wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotated-text.doc';
    a.click();
    URL.revokeObjectURL(url);
  }, [html]);

  return (
    <div className="annotate-split-btn">
      <button
        className="annotate-split-btn__copy"
        onClick={handleCopy}
        title="Copy as rich text"
      >
        {copied ? <IconCheck size={14} /> : <IconClipboard size={14} />}
        <span>{copied ? 'Copied' : 'Word'}</span>
      </button>
      <button
        className="annotate-split-btn__download"
        onClick={handleDownload}
        title="Download as annotated-text.doc"
      >
        <IconDownload size={14} />
      </button>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function AnnotatePage(): ReactNode {
  const [terms, setTerms] = useState<ProcessedTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputText, setInputText] = useState(
    'The Accuracy of Sensor Calibration depends heavily on the quality of Auxiliary Data and proper Geometric Correction. ' +
    'During Validation, Reference Data collected through In-Situ measurements are compared against satellite-derived products to quantify Uncertainty. ' +
    'A well-defined Radiometric Resolution ensures that subtle differences in Surface Reflectance can be detected across the Spectral Band. ' +
    'Interoperability between data providers requires consistent Metadata standards and transparent Processing Levels.'
  );
  const [result, setResult] = useState<{
    html: string;
    markdown: string;
    plain: string;
    matchCount: number;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const termsUrl = useBaseUrl(ANNOTATE_TERMS_PATH);

  // Load pre-built terms from static JSON (generated at build time)
  useEffect(() => {
    fetch(termsUrl)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: ProcessedTerm[]) => {
        setTerms(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [termsUrl]);

  const handleAnnotate = useCallback(() => {
    if (!inputText.trim()) return;
    setResult(annotateText(inputText, terms));
  }, [inputText, terms]);

  const handleClear = useCallback(() => {
    setInputText('');
    setResult(null);
    textareaRef.current?.focus();
  }, []);

  return (
    <Layout
      title="Annotate Text"
      description="Paste any text and automatically annotate it with EO Glossary definitions."
    >
      <div className="annotate-page">
        <div className="container">
          {/* Header */}
          <header className="annotate-header">
            <div className="annotate-header-icon"><IconAnnotate size={24} /></div>
            <div>
              <h1 className="annotate-title">Text Annotator</h1>
              <p className="annotate-subtitle">
                Paste any text below and every recognised EO Glossary term will be
                replaced with its definition, linked back to the glossary.
              </p>
            </div>
          </header>

          {/* Status */}
          <div className="annotate-status">
            {loading && <span className="annotate-status-loading">Loading glossary terms...</span>}
            {error && <span className="annotate-status-error">Failed to load terms: {error}</span>}
            {!loading && !error && (
              <span className="annotate-status-ready">{terms.length} terms loaded (sorted longest-first)</span>
            )}
          </div>

          {/* Input */}
          <div className="annotate-input-section">
            <label htmlFor="annotate-input" className="annotate-label">Input text</label>
            <textarea
              id="annotate-input"
              ref={textareaRef}
              className="annotate-textarea"
              rows={10}
              placeholder="Paste your text here... e.g. &quot;The Accuracy of the Sensor Calibration depends on Auxiliary Data quality.&quot;"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            <div className="annotate-input-actions">
              <button
                className="page-btn page-btn--primary"
                onClick={handleAnnotate}
                disabled={loading || !inputText.trim()}
              >
                Annotate
              </button>
              <button
                className="page-btn page-btn--ghost"
                onClick={handleClear}
                disabled={!inputText && !result}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Output */}
          {result && result.matchCount > 0 && (
            <div className="annotate-output-section">
              <div className="annotate-output-header">
                <h2 className="annotate-output-title">Annotated text</h2>
                <span className="annotate-match-count">{result.matchCount} term{result.matchCount !== 1 ? 's' : ''} matched</span>
              </div>

              <div
                className="annotate-output-body"
                dangerouslySetInnerHTML={{ __html: result.html }}
              />

              <div className="annotate-export-bar">
                <SplitButton
                  label="Text"
                  content={result.plain}
                  filename="annotated-text.txt"
                  mimeType="text/plain"
                />
                <SplitButton
                  label="Markdown"
                  content={result.markdown}
                  filename="annotated-text.md"
                  mimeType="text/markdown"
                />
                <WordSplitButton html={result.html} />
              </div>
            </div>
          )}

          {result && result.matchCount === 0 && (
            <div className="annotate-output-section">
              <p className="annotate-no-match">No glossary terms found in the input text.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

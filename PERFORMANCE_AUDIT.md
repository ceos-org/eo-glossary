# Site performance audit — 29 October 2026

Audited commit: `62edc6225cee8219b217f5cbacda2830ab48dc98`.

The remembered **83 Best Practices score was not reproduced**. The unchanged
public homepage and the unchanged local homepage and Accuracy term page scored
**100** with Lighthouse 13.0.1. This change preserves that result while improving
homepage loading and fixing the accessibility failures found during the audit.
It does not claim an 83 → 100 improvement against an unavailable historical audit.

## Changes

- Replace the render-blocking Google Fonts stylesheet and its two preconnects
  with local Inter and JetBrains Mono variable WOFF2 fonts. Docusaurus's existing
  CSS asset pipeline fingerprints the files; `font-display: swap` keeps text
  visible while fonts load. Latin and Latin Extended subsets load on demand;
  other scripts retain system fallbacks. Four font files total 188,924 bytes of
  repository storage, with upstream SIL licenses and provenance included.
Term graphs remain visible by default, with their layer controls and the
existing native iframe `loading="lazy"` behavior. There is no disclosure or
extra click to display a graph. The dedicated graph page retains its behavior.

- Keep the footer's React hooks unconditional across term/non-term routes.
- Set the navbar logo's width and height through Docusaurus theme configuration.
- Correct announcement text, primary button, footer, search label, relationship
  label and raw-format link contrast, and underline links within prose.

No package or lockfile changes, new runtime dependencies, custom build plugins,
framework upgrades, CI changes, or hosting changes are required.

## Controlled mobile results

Lighthouse **13.0.1**, headless Chrome **156.0.0.0**, Node **24.22.1**;
Lighthouse's default mobile viewport, simulated network/CPU throttling and fresh
browser storage for each run. Scores below are the medians of **three** runs
per page and revision, run serially. These are lab measurements, not field data.

| Page | Performance before → after | Accessibility before → after | Best Practices before → after | SEO before → after |
| --- | --- | --- | --- | --- |
| Homepage | 88 → 97 | 96 → 100 | 100 → 100 | 100 → 100 |
| `/terms/accuracy` | 89 → 95 | 93 → 100 | 100 → 100 | 100 → 100 |

| Median metric | Homepage before → after | Accuracy before → after |
| --- | --- | --- |
| First Contentful Paint | 2.56 → 1.20 s | 1.64 → 1.50 s |
| Largest Contentful Paint | 3.43 → 2.46 s | 3.57 → 2.82 s |
| Total Blocking Time | 46 → 4 ms | 69 → 72 ms |
| Cumulative Layout Shift | 0.0105 → 0.0106 | 0.0503 → 0.0503 |
| Audited transfer size | 330.1 → 328.5 KiB | 554.2 → 561.4 KiB |

Performance runs were 84/88/95 → 97/96/97 on the homepage and
76/90/89 → 95/95/95 on Accuracy. All three updated Accuracy runs include the
default-visible graph. The graph's native lazy-loading threshold and external
CDN timing can affect individual runs. The term page retains its graph payload
and execution cost; no transfer-size or blocking-time reduction is claimed there.
The shared application bundle and Docusaurus route loading still limit mobile
term-page performance. Avoiding a larger search/theme rewrite keeps this change
small.

The homepage's final confirmation audit was **97/100/100/100**. Accuracy's three
final confirmation audits were each **95/100/100/100**
(Performance / Accessibility / Best Practices / SEO).

Additional final-page audits: Dependency Graph **93/100/100/100** and
Text Annotator **89/100/100/100**. All four audited pages score 100 for
Best Practices.

### Serving and interpretation

Both revisions were built with Docusaurus and served under `/eo-glossary/` with
identical temporary local static servers: gzip for compressible assets and
`Cache-Control: public, max-age=600` for assets. The unchanged build was preserved
before editing; the two revisions used separate local ports. The temporary audit
server and downloaded auditing packages are outside the repository.

`docusaurus serve` was also tested, but it does not compress responses and its
subpath redirect returns homepage HTML for a root `/robots.txt` request. Its first
local runs scored 71 and 43 for Performance and 92 for SEO. Those server artifacts
were excluded from the controlled comparison. The public homepage independently
scored **86/96/100/100** on the same auditing stack before changes.

Lighthouse still reports some unscored diagnostics, including missing production
source maps. A 100 Best Practices score does not mean every diagnostic or manual
security check is satisfied. Deployment behavior must be rechecked after a future
PR is merged; nothing was deployed during this work.

## Validation

- `npm ci` and a full `npm run build`, including both Python export scripts: pass.
- `npx tsc --noEmit` and `git diff --check`: pass.
- Browser checks: homepage term search and navbar local search, transitions
  between term/non-term pages, graph present by default, canvas rendering after
  scrolling without an expansion click, parent-layer toggles, full graph page,
  and text annotation with two recognized terms: pass, with no browser errors.
- Automated axe checks for WCAG 2 A/AA and WCAG 2.1 AA on homepage and Accuracy,
  in both light and dark mobile layouts: no violations found.
- Mobile light/dark and desktop page screenshots inspected; no external Google
  Fonts requests were made by the updated pages.

Existing build warnings remain: `/tags-overview` links to an absent
`/tags/approved` page; Browserslist data is old; a transitive dependency triggers a
webpack static-analysis warning. The initial sandboxed builds also logged a
webpack cache warning. These did not fail the build and are outside this change.
Generated exports, feeds and graph data were restored after building and are not
part of the staged diff.

## Reproduction

1. Run `npm ci`, `npm run build`, and `npm run serve -- --no-open` for the normal
   Docusaurus production preview. Python export scripts require `uv`.
2. For production-like timing, use a static server configured for the site's
   `/eo-glossary/` base path, extensionless HTML routes and gzip. Use identical
   settings for an unchanged build and the modified build, at different ports.
3. Run the following against each server, changing the route for Accuracy:

   ```sh
   lighthouse http://127.0.0.1:3002/eo-glossary/ \
     --chrome-flags='--headless=new --no-sandbox' \
     --output=json --output=html --output-path=home
   ```

   Use Lighthouse 13.0.1 and the same browser version for comparison; repeat
   serially three times with fresh profiles and report medians.
4. Open Accuracy, scroll to its graph and confirm it displays without an
   expansion click, then change a layer. Check homepage search, navbar search
   and the Annotate page.

Docusaurus references: [local fonts and styling](https://docusaurus.io/docs/3.9.2/styling-layout#fonts),
[static assets](https://docusaurus.io/docs/3.9.2/static-assets),
[navbar logo configuration](https://docusaurus.io/docs/3.9.2/api/themes/configuration#navbar-logo).

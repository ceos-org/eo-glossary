// Sidebar auto-collapse: closed on non-term pages, open on term pages.
//
// All high-level pages and term pages share a single DocRootLayout mount,
// so React sidebar state persists across client-side navigations.
// This module only needs to:
//  - Collapse on initial load if not a term page
//  - Toggle when crossing the term ↔ non-term boundary

function isTermPath(path) {
  return /\/terms\//.test(path);
}

export function onRouteDidUpdate({ location, previousLocation }) {
  if (typeof window === 'undefined') return;

  const onTermPage = isTermPath(location.pathname);
  const wasOnTermPage = previousLocation
    ? isTermPath(previousLocation.pathname)
    : null; // null = initial page load

  // Initial page load on a non-term page: collapse
  if (wasOnTermPage === null && !onTermPage) {
    requestAnimationFrame(() => {
      const btn = document.querySelector('button[class*="collapseSidebarButton"]');
      if (btn) btn.click();
    });
    return;
  }

  // Navigated from non-term → term: expand
  if (onTermPage && !wasOnTermPage) {
    requestAnimationFrame(() => {
      const container = document.querySelector('.theme-doc-sidebar-container');
      if (!container || container.offsetWidth > 80) return;
      const btn = container.querySelector('button');
      if (btn) btn.click();
    });
    return;
  }

  // Navigated from term → non-term: collapse
  if (!onTermPage && wasOnTermPage) {
    requestAnimationFrame(() => {
      const btn = document.querySelector('button[class*="collapseSidebarButton"]');
      if (btn) btn.click();
    });
  }

  // non-term → non-term or term → term: do nothing (state persists)
}

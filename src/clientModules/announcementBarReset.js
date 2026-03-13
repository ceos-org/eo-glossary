// Reset announcement bar dismiss state on every fresh page load.
// Docusaurus persists dismissal in localStorage, making it permanent.
// This clears it so the bar reappears whenever the user opens a new tab/window,
// while still allowing dismissal within the current session.
const DISMISS_KEY = 'docusaurus.announcement.dismiss';

if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {}
}

export function onRouteDidUpdate() {}

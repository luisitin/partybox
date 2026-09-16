// A page that outlives a rebuild: after `start-partybox.bat` (or any restart with a new build)
// the TV tab and every phone still run the previous bundle, and the next lazily loaded chunk — a
// game's Tv or Controller and its CSS — 404s ("Unable to preload CSS for …/Card-XXXX.css", the
// game error boundary). Two guards: Vite's `vite:preloadError` reloads on the spot, and every
// reconnect compares the hashed assets the server ships now with the ones this page loaded.
// Reloads are rate-limited so a broken deploy cannot spin the page.

const RELOAD_KEY = 'partybox:reloadedAt';
const RELOAD_COOLDOWN_MS = 30_000;

/** Every hashed asset a page references (entry script, stylesheets, module preloads). */
function assetsOf(html: string): string {
  return [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)]
    .map((m) => new URL(m[1] ?? '', location.href).href)
    .sort()
    .join('\n');
}

const loadedAssets: string = [
  ...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>(
    'script[src*="/assets/"], link[href*="/assets/"]',
  ),
]
  .map((el) => ('src' in el && el.src ? el.src : (el as HTMLLinkElement).href))
  .sort()
  .join('\n');

function reloadOnce(reason: string): void {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* private mode: still reload, just without the guard */
  }
  console.info(`[partybox] reloading: ${reason}`);
  location.reload();
}

/** Call once at start-up. */
export function installBuildGuards(): void {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnce('a chunk from an older build failed to load');
  });
}

/** Call on every reconnect: reloads when the server now ships a different bundle. */
export async function reloadIfNewBuild(): Promise<void> {
  if (!loadedAssets) return; // dev server: nothing hashed, Vite handles it
  try {
    const res = await fetch(location.pathname, {
      cache: 'no-store',
      headers: { accept: 'text/html' },
    });
    if (!res.ok) return;
    const current = assetsOf(await res.text());
    if (current && current !== loadedAssets) reloadOnce('the server has a new build');
  } catch {
    /* offline again; the next reconnect checks */
  }
}

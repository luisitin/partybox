// A page that outlives a rebuild is stale: the launcher rebuilds the client on every start, so a
// phone or TV tab left open holds an index.html whose lazy game chunks no longer exist. The first
// game start then fails to import its chunk ("This game hit a snag") until someone refreshes.
// Two guards, both ending in a plain reload (the phone's stored session resumes by token):
//   1. a dynamic import fails (Vite's `vite:preloadError`) → reload once;
//   2. the socket reconnects to a server with a different `startedAt` (it restarted, likely
//      rebuilt) → reload.
// A sessionStorage stamp keeps a broken deploy from reload-looping.

const STAMP_KEY = 'partybox:reloaded-at';
const MIN_GAP_MS = 15_000;

/** Reloads unless the page already reloaded for this reason within the last few seconds. */
export function reloadOnce(reason: string): void {
  try {
    const last = Number(sessionStorage.getItem(STAMP_KEY) ?? 0);
    if (Date.now() - last < MIN_GAP_MS) return;
    sessionStorage.setItem(STAMP_KEY, String(Date.now()));
  } catch {
    /* private mode: reload anyway, once is the best we can do */
  }
  console.warn(`[partybox] reloading: ${reason}`);
  location.reload();
}

/** Install the stale-chunk guard once per page. */
export function guardStaleChunks(): void {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnce('a game chunk from a previous build is gone');
  });
}

/**
 * Tracks the server's boot time across reconnects. Call on every socket `connect`; the first call
 * records the server this page was loaded against, later ones reload if it is a different one.
 */
export function createRestartWatch(): { onConnect: () => void } {
  let bootedAt: number | null = null;
  return {
    onConnect: () => {
      void fetch('/api/info')
        .then((res) => (res.ok ? (res.json() as Promise<{ startedAt?: number }>) : null))
        .then((info) => {
          const now = info?.startedAt;
          if (typeof now !== 'number') return;
          if (bootedAt === null) bootedAt = now;
          else if (now !== bootedAt) reloadOnce('the server restarted (new build?)');
        })
        .catch(() => undefined);
    },
  };
}

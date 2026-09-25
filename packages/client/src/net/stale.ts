// A page that outlives a rebuild is stale: the launcher rebuilds the client on every start, so a
// phone or TV tab left open holds an index.html whose lazy game chunks no longer exist. The first
// game start then fails to import its chunk ("This game hit a snag") until someone refreshes.
// Two guards, both ending in a plain reload (the phone's stored session resumes by token):
//   1. a chunk fails to load (Vite's `vite:preloadError`, or the game loader giving up) and the
//      server now has a different `startedAt` than the one this page was loaded against → reload
//      once; a chunk that failed on a flaky connection is retried instead (game-loader.ts);
//   2. the socket reconnects to a server with a different `startedAt` (it restarted, likely
//      rebuilt) → reload.
// A sessionStorage stamp keeps a broken deploy from reload-looping.

const STAMP_KEY = 'partybox:reloaded-at';
const MIN_GAP_MS = 15_000;

/** The server this page was loaded against (its boot time), once the first check has run. */
let bootedAt: number | null = null;

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

async function serverStartedAt(): Promise<number | null> {
  try {
    const res = await fetch('/api/info');
    const info = res.ok ? ((await res.json()) as { startedAt?: number }) : null;
    return typeof info?.startedAt === 'number' ? info.startedAt : null;
  } catch {
    return null;
  }
}

/** Reloads (once) when the server has restarted since this page loaded; true when it did. */
export async function reloadIfRestarted(reason: string): Promise<boolean> {
  const now = await serverStartedAt();
  if (now === null) return false;
  if (bootedAt === null) {
    bootedAt = now;
    return false;
  }
  if (now === bootedAt) return false;
  reloadOnce(reason);
  return true;
}

/** Install the stale-chunk guard once per page. */
export function guardStaleChunks(): void {
  window.addEventListener('vite:preloadError', () => {
    void reloadIfRestarted('a chunk from a previous build is gone');
  });
}

/**
 * Tracks the server's boot time across reconnects. Call on every socket `connect`; the first call
 * records the server this page was loaded against, later ones reload if it is a different one.
 */
export function createRestartWatch(): { onConnect: () => void } {
  return {
    onConnect: () => {
      void reloadIfRestarted('the server restarted (new build?)');
    },
  };
}

// I-387 B: the TV keeps its screen — and so, on most hosts, the PC running it — awake while anyone
// is in the room. The browser drops the lock whenever the tab is hidden; it is taken again when the
// tab comes back. No lock API (older browsers) → nothing happens.
import { useEffect } from 'react';

interface Sentinel {
  release: () => Promise<void>;
}
type WakeLockApi = { request: (type: 'screen') => Promise<Sentinel> };

export function useScreenWakeLock(on: boolean): void {
  useEffect(() => {
    if (!on || typeof navigator === 'undefined') return undefined;
    const api = (navigator as unknown as { wakeLock?: WakeLockApi }).wakeLock;
    if (!api) return undefined;
    let lock: Sentinel | null = null;
    let live = true;
    const take = (): void => {
      if (document.visibilityState !== 'visible') return;
      api
        .request('screen')
        .then((l) => {
          if (live) lock = l;
          else void l.release().catch(() => undefined);
        })
        .catch(() => undefined);
    };
    take();
    document.addEventListener('visibilitychange', take);
    return () => {
      live = false;
      document.removeEventListener('visibilitychange', take);
      void lock?.release().catch(() => undefined);
    };
  }, [on]);
}

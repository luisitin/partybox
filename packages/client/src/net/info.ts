// `/api/info`: what the TV shows in its frame (join URL, QR) and what the join form needs
// (how many rooms exist). Fetched once per page load and refreshed every minute.
import { useEffect, useState } from 'react';

export interface ServerInfo {
  version: string;
  /** Server boot time (ms); changes when it restarts. */
  startedAt: number;
  publicHost: string;
  port: number;
  tvUrl: string;
  joinUrl: string;
  qrSvg: string;
  rooms: { code: string; locked: boolean; players: number; names?: string[] }[];
  houseRoom: string;
  /** I-041: the join URL with the house room's code — what the TV's QR encodes. */
  qrUrl?: string;
  dev: boolean;
}

let cached: ServerInfo | null = null;

export async function fetchInfo(): Promise<ServerInfo> {
  // I-077 A: a phone says so (the funnel's "opened"); the TV and /preview stay uncounted.
  const from = document.querySelector('[data-surface="controller"]') ? '?from=phone' : '';
  const res = await fetch(`/api/info${from}`);
  if (!res.ok) throw new Error(`info ${res.status}`);
  cached = (await res.json()) as ServerInfo;
  return cached;
}

export function useServerInfo(refreshMs = 60_000): ServerInfo | null {
  const [info, setInfo] = useState<ServerInfo | null>(cached);
  useEffect(() => {
    let alive = true;
    const load = (): void => {
      fetchInfo()
        .then((i) => alive && setInfo(i))
        .catch(() => undefined);
    };
    load();
    const handle = setInterval(load, refreshMs);
    return () => {
      alive = false;
      clearInterval(handle);
    };
  }, [refreshMs]);
  return info;
}

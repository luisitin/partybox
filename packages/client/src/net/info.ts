// `/api/info`: what the TV shows in its frame (join URL, QR) and what the join form needs
// (how many rooms exist). Fetched once per page load and refreshed every minute.
//
// The GitHub Pages build has no server to ask (ADR-034), so the source is swappable:
// `setInfoProvider` lets `packages/web` answer from the browser instead. Everything downstream
// (TvFrame, TvLobby, Join) reads `useServerInfo` and never knows which one it got.
import { useEffect, useState } from 'react';

export interface ServerInfo {
  version: string;
  /** Server boot time (ms); changes when it restarts. */
  startedAt: number;
  publicHost: string;
  port: number;
  tvUrl: string;
  joinUrl: string;
  /** Empty when the build cannot draw one; every reader must tolerate that. */
  qrSvg: string;
  rooms: { code: string; locked: boolean; players: number }[];
  houseRoom: string;
  dev: boolean;
}

let cached: ServerInfo | null = null;

export type InfoProvider = () => Promise<ServerInfo>;

const fromServer: InfoProvider = async () => {
  const res = await fetch('/api/info');
  if (!res.ok) throw new Error(`info ${res.status}`);
  return (await res.json()) as ServerInfo;
};

let provider: InfoProvider = fromServer;

/** Replaces `/api/info` for a build that has no server behind it. Call it before rendering. */
export function setInfoProvider(next: InfoProvider): void {
  provider = next;
  cached = null;
}

export async function fetchInfo(): Promise<ServerInfo> {
  cached = await provider();
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

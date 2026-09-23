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
  rooms: {
    code: string;
    locked: boolean;
    players: number;
    names?: string[];
    /** I-083 A: the faces already in the room, so the join form can badge them. */
    avatars?: string[];
    /** The owner (2026-09-22): a private room is left out of the join page's room list. */
    listed?: boolean;
    status?: 'lobby' | 'selecting' | 'playing' | 'results';
  }[];
  /** I-034 B: the last finished recap, when the host keeps them. */
  lastRecap?: { gameId: string; code: string } | null;
  /** I-077 C: the house room's join funnel — phones that opened the join page vs. got in. */
  funnel?: { opened: number; attempted: number; joined: number };
  houseRoom: string;
  /** The host's public (tunnel) address while one is live — what Share hands out (the owner,
   *  2026-09-22: friends on another Wi-Fi need it). Null without a tunnel. */
  publicUrl?: string | null;
  /** I-041: the join URL with the house room's code — what the TV's QR encodes. */
  qrUrl?: string;
  dev: boolean;
}

let cached: ServerInfo | null = null;

/**
 * I-077 A: the join funnel's "opened" is one join page opened on one phone. Only the join page
 * asks to be counted, and only on its first fetch per page load — the minute refreshes, the VIP's
 * game picker (a phone already in the room) and every TV stay uncounted. (Until 2026-09-22 the
 * flag was read off the DOM, so any phone screen that fetched info counted, and "opened" kept
 * climbing through a whole game.)
 */
let countedThisPage = false;

export async function fetchInfo(opts: { countOpen?: boolean } = {}): Promise<ServerInfo> {
  const count = opts.countOpen === true && !countedThisPage;
  if (count) countedThisPage = true;
  const res = await fetch(`/api/info${count ? '?from=phone' : ''}`);
  if (!res.ok) throw new Error(`info ${res.status}`);
  cached = (await res.json()) as ServerInfo;
  return cached;
}

/** `countOpen`: this is the join page (see `fetchInfo`). */
export function useServerInfo(refreshMs = 60_000, countOpen = false): ServerInfo | null {
  const [info, setInfo] = useState<ServerInfo | null>(cached);
  useEffect(() => {
    let alive = true;
    const load = (): void => {
      fetchInfo({ countOpen })
        .then((i) => alive && setInfo(i))
        .catch(() => undefined);
    };
    load();
    const handle = setInterval(load, refreshMs);
    return () => {
      alive = false;
      clearInterval(handle);
    };
  }, [refreshMs, countOpen]);
  return info;
}

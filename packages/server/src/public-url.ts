// This host's public address — the Cloudflare quick tunnel — for Share (the owner, 2026-09-22:
// "when sharing with friends, it should be the link for non-same wifi"). The QR and the TV keep
// the LAN address (faster, and what a phone in the room should use); only Share hands out this one.
//
// Local signals only (ADR-012: the server never reaches the internet): PARTYBOX_PUBLIC_URL when
// set; otherwise the newest trycloudflare address in the tunnel's log (PARTYBOX_TUNNEL_LOG, default
// <repo>/cloudflared.log) — and only while a cloudflared process is actually running, so a dead
// tunnel's address is never shared. A quick tunnel gets a new address every start; the log is
// re-read when it changes.
import { execFile } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TUNNEL_URL = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/g;
const PROCESS_TTL_MS = 15_000;

export interface PublicUrl {
  /** The address to share, or null when there is no live tunnel. */
  get(): Promise<string | null>;
}

/** The last tunnel address a log mentions, or null. */
export function lastTunnelUrl(log: string): string | null {
  const all = log.match(TUNNEL_URL);
  return all && all.length > 0 ? (all[all.length - 1] ?? null) : null;
}

function cloudflaredRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const [cmd, argv] =
      process.platform === 'win32'
        ? ['tasklist', ['/FI', 'IMAGENAME eq cloudflared.exe', '/NH']]
        : ['pgrep', ['-x', 'cloudflared']];
    execFile(cmd, argv, { timeout: 3000, windowsHide: true }, (err, stdout) => {
      if (process.platform === 'win32') resolve(!err && /cloudflared\.exe/i.test(stdout));
      else resolve(!err && stdout.trim().length > 0);
    });
  });
}

export function createPublicUrl(options: {
  repoRoot: string;
  env?: NodeJS.ProcessEnv;
  /** Tests: stand-in for the process check. */
  running?: () => Promise<boolean>;
}): PublicUrl {
  const env = options.env ?? process.env;
  const fixed = env['PARTYBOX_PUBLIC_URL']?.trim().replace(/\/$/, '');
  const logPath = env['PARTYBOX_TUNNEL_LOG'] ?? join(options.repoRoot, 'cloudflared.log');
  const running = options.running ?? cloudflaredRunning;
  let logSeen = { mtimeMs: -1, url: null as string | null };
  let alive = { at: -Infinity, value: false };

  const fromLog = (): string | null => {
    try {
      const { mtimeMs } = statSync(logPath);
      if (mtimeMs !== logSeen.mtimeMs)
        logSeen = { mtimeMs, url: lastTunnelUrl(readFileSync(logPath, 'utf8')) };
      return logSeen.url;
    } catch {
      return null; // no log: no tunnel
    }
  };

  return {
    async get() {
      if (fixed) return fixed;
      const url = fromLog();
      if (!url) return null;
      const now = Date.now();
      if (now - alive.at > PROCESS_TTL_MS) alive = { at: now, value: await running() };
      return alive.value ? url : null;
    },
  };
}

// Spawns `pnpm dev --port <n>` from the repo root and waits for /healthz, so the capture can also
// kill and restart it (server-restart recovery screens). Windows needs `shell: true` for pnpm.
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const REPO_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..');

export interface DevServer {
  url: string;
  port: number;
  stop(): Promise<void>;
  /** Everything the server printed so far (stdout + stderr). */
  log(): string;
}

/** `env` overrides the harness defaults (e.g. `PARTYBOX_RECORDINGS: '<dir>'` for the recording proof). */
export async function startServer(
  port: number,
  env: Record<string, string> = {},
): Promise<DevServer> {
  // A server already answering on this port is someone else's (a stale `pnpm dev`, another
  // session): the capture would silently run against its code (loop 258 hit one a day old).
  const url = `http://localhost:${port}`;
  const taken = await fetch(`${url}/healthz`).then(
    (r) => r.ok,
    () => false,
  );
  if (taken) throw new Error(`port ${port} already has a server: stop it or pick another --port`);
  const child: ChildProcess = spawn('pnpm', ['dev', '--port', String(port)], {
    cwd: REPO_ROOT,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PARTYBOX_DESIGN_CAPTURE: '1', PARTYBOX_RECORDINGS: 'off', ...env },
  });
  const log: string[] = [];
  child.stdout?.on('data', (d: Buffer) => {
    log.push(d.toString());
    if (process.env.PROBE_LOG) process.stdout.write(d);
  });
  child.stderr?.on('data', (d: Buffer) => log.push(d.toString()));
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/healthz`);
      if (res.ok) break;
    } catch {
      /* not up yet */
    }
    if (child.exitCode !== null) throw new Error(`server exited early:\n${log.join('')}`);
    await new Promise((r) => setTimeout(r, 250));
  }
  return {
    url,
    port,
    log: () => log.join(''),
    stop: () =>
      new Promise<void>((resolve) => {
        if (child.exitCode !== null || child.pid === undefined) return resolve();
        // `shell: true` wraps pnpm → node in a cmd tree on Windows; taskkill takes the whole tree.
        if (process.platform === 'win32') {
          const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
            shell: true,
          });
          killer.on('exit', () => resolve());
        } else {
          child.kill('SIGTERM');
          child.on('exit', () => resolve());
        }
      }),
  };
}

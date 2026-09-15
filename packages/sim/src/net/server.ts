// Spawns the real server (`packages/server/src/main.ts`) on a given port for the net fuzzer and
// collects its stderr so crashes / unhandled rejections show up as findings.
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { REPO_ROOT } from '@partybox/game-sdk/testing';

export interface SpawnedServer {
  url: string;
  port: number;
  /** Everything the process wrote to stderr so far. */
  stderr: () => string;
  exited: () => number | null;
  stop: () => Promise<void>;
}

export async function spawnServer(options: {
  port: number;
  devApi: boolean;
  timeoutMs?: number;
}): Promise<SpawnedServer> {
  const args = [
    join(REPO_ROOT, 'packages', 'server', 'src', 'main.ts'),
    '--port',
    String(options.port),
    '--host',
    '127.0.0.1',
  ];
  if (options.devApi) args.push('--dev-api');
  const tsx = join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const child: ChildProcess = spawn(process.execPath, [tsx, ...args], {
    cwd: REPO_ROOT,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let err = '';
  let exit: number | null = null;
  child.stderr?.on('data', (d: Buffer) => {
    err += d.toString();
  });
  child.stdout?.on('data', () => {});
  child.on('exit', (code) => {
    exit = code;
  });
  const url = `http://127.0.0.1:${options.port}`;
  const deadline = Date.now() + (options.timeoutMs ?? 30_000);
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/healthz`);
      if (res.ok) break;
    } catch {
      /* not up yet */
    }
    if (exit !== null) throw new Error(`server exited early (${exit}): ${err}`);
    await new Promise((r) => setTimeout(r, 200));
  }
  return {
    url,
    port: options.port,
    stderr: () => err,
    exited: () => exit,
    stop: () =>
      new Promise((resolve) => {
        if (exit !== null) return resolve();
        child.once('exit', () => resolve());
        child.kill();
        setTimeout(resolve, 3000);
      }),
  };
}

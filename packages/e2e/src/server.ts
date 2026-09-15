// Boots `pnpm dev` on a free port for a harness run and stops it (whole process tree on Windows).
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)));

export interface RunningServer {
  port: number;
  url: string;
  stop(): Promise<void>;
  /** Lines the server printed (for failure reports). */
  output: string[];
}

export async function freePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      probe.close(() => resolvePort(port));
    });
  });
}

async function waitForHealth(url: string, timeoutMs: number, output: string[]): Promise<void> {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try {
      const res = await fetch(`${url}/healthz`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `server did not answer /healthz within ${timeoutMs} ms\n${output.slice(-20).join('\n')}`,
  );
}

export async function startServer(port?: number): Promise<RunningServer> {
  const chosen = port ?? (await freePort());
  const output: string[] = [];
  const child: ChildProcess = spawn(
    process.platform === 'win32' ? `pnpm dev --port ${chosen} --host 127.0.0.1` : 'pnpm',
    process.platform === 'win32' ? [] : ['dev', '--port', String(chosen), '--host', '127.0.0.1'],
    { cwd: REPO_ROOT, shell: process.platform === 'win32', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const collect = (chunk: Buffer): void => {
    for (const line of chunk.toString().split(/\r?\n/)) if (line.trim()) output.push(line);
  };
  child.stdout?.on('data', collect);
  child.stderr?.on('data', collect);
  const url = `http://127.0.0.1:${chosen}`;
  const stop = async (): Promise<void> => {
    if (child.pid === undefined || child.exitCode !== null) return;
    if (process.platform === 'win32') {
      await new Promise<void>((r) => {
        const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
          stdio: 'ignore',
        });
        killer.on('exit', () => r());
        killer.on('error', () => r());
      });
    } else {
      child.kill('SIGTERM');
    }
  };
  try {
    await waitForHealth(url, 40_000, output);
  } catch (err) {
    await stop();
    throw err;
  }
  return { port: chosen, url, stop, output };
}

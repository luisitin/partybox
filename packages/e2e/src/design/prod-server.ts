// The production build on a harness port (`pnpm start --port <n> --dev-api`): what phones really
// download — hashed chunks, cache headers, compression — which the Vite dev server (unbundled
// modules) cannot show. `build: true` runs `pnpm build` first (≈30 s); the dev API stays on so the
// capture can add bots and read state exactly as it does against `pnpm dev`.
import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import type { DevServer } from './server';
import { REPO_ROOT } from './server';

export async function startProdServer(
  port: number,
  options: { build?: boolean; env?: Record<string, string> } = {},
): Promise<DevServer> {
  const url = `http://localhost:${port}`;
  const taken = await fetch(`${url}/healthz`).then(
    (r) => r.ok,
    () => false,
  );
  if (taken) throw new Error(`port ${port} already has a server: stop it or pick another --port`);
  if (options.build) {
    const b = spawnSync('pnpm', ['build'], { cwd: REPO_ROOT, shell: true, encoding: 'utf8' });
    if (b.status !== 0) throw new Error(`pnpm build failed:\n${b.stdout}\n${b.stderr}`);
  }
  const child: ChildProcess = spawn('pnpm', ['start', '--port', String(port), '--dev-api'], {
    cwd: REPO_ROOT,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PARTYBOX_DESIGN_CAPTURE: '1',
      PARTYBOX_RECORDINGS: 'off',
      ...options.env,
    },
  });
  const log: string[] = [];
  child.stdout?.on('data', (d: Buffer) => log.push(d.toString()));
  child.stderr?.on('data', (d: Buffer) => log.push(d.toString()));
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const up = await fetch(`${url}/healthz`).then(
      (r) => r.ok,
      () => false,
    );
    if (up) break;
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
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { shell: true }).on(
            'exit',
            () => resolve(),
          );
        } else {
          child.kill('SIGTERM');
          child.on('exit', () => resolve());
        }
      }),
  };
}

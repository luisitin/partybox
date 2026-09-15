// Tiny cross-platform process runner for scripts (no dependency). Windows needs a shell so that
// `pnpm` (a .cmd shim) resolves; Node warns when a shell gets an args array, so we join a string
// there (arguments are our own literals, never user input).
import { spawnSync } from 'node:child_process';

export interface RunResult {
  ok: boolean;
  code: number;
  ms: number;
}

export function run(command: string, args: string[], cwd: string, quiet = false): RunResult {
  const started = Date.now();
  const options = {
    cwd,
    stdio: quiet ? ('pipe' as const) : ('inherit' as const),
    env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? '1' },
  };
  const result =
    process.platform === 'win32'
      ? spawnSync([command, ...args].join(' '), { ...options, shell: true })
      : spawnSync(command, args, options);
  const code = result.status ?? 1;
  return { ok: code === 0, code, ms: Date.now() - started };
}

export function fail(message: string): never {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

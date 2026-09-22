import { defineConfig } from 'vitest/config';

/**
 * One Vitest "project" per package plus one for all games. `pnpm test` runs everything;
 * `pnpm vitest --project engine` runs one. Names are the folder names under packages/.
 */
const unitProject = (
  name: string,
  dir: string,
): {
  extends: true;
  test: { name: string; include: string[]; exclude: string[] };
} => ({
  // Inline projects do NOT inherit the root `test` options unless they say so: without this every
  // test ran on Vitest's default 5 s, not the 20 s below, and the heaviest contract simulations
  // (Bingo's "terminates" runs, ~2-4 s alone) timed out whenever the machine was busy (2026-09-22).
  extends: true,
  test: {
    name,
    include: [`${dir}/**/*.test.{ts,tsx}`],
    exclude: ['**/node_modules/**', '**/dist/**', 'packages/game-sdk/src/contract-tests/**'],
  },
});

export default defineConfig({
  test: {
    // Projects inherit these root settings (each project sets `extends: true` — see unitProject).
    passWithNoTests: true,
    testTimeout: 20_000,
    hookTimeout: 20_000,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      include: ['packages/engine/src/**/*.ts', 'packages/shared/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.helper.ts', '**/index.ts'],
      thresholds: {
        // Section 5: engine >= 90 % line coverage.
        'packages/engine/src/**/*.ts': { lines: 90 },
      },
    },
    projects: [
      unitProject('shared', 'packages/shared/src'),
      unitProject('engine', 'packages/engine/src'),
      unitProject('server', 'packages/server/src'),
      unitProject('client', 'packages/client/src'),
      unitProject('game-sdk', 'packages/game-sdk/src'),
      unitProject('sim', 'packages/sim/src'),
      unitProject('e2e', 'packages/e2e/src'),
      unitProject('games', 'games/*/__tests__'),
      unitProject('scripts', 'scripts'),
      {
        // Runs the contract suite against every folder in games/ (docs/TESTING.md).
        extends: true,
        test: {
          name: 'contract',
          include: ['packages/game-sdk/src/contract-tests/**/*.test.ts'],
          exclude: ['**/node_modules/**'],
        },
      },
    ],
  },
});

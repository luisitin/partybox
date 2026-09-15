// `pnpm e2e`: 1 TV + N phones (alternating iPhone / Pixel) play one full game of each registered
// game. Phones join through the real UI; their moves come from the dev API (`/api/dev/act`, which
// uses each game's bot). Fails on any console error, page error, error boundary, or a phone that
// never reaches the results screen.
import { AVATAR_IDS } from '@partybox/shared';
import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { DevApi } from './dev-api';
import type { DevicePreset } from './devices';
import { startServer } from './server';
import { Session } from './session';

export interface RunOptions {
  games: string[];
  phones: number;
  port?: number;
  seed: number;
  /** Wall-clock cap per game. */
  gameTimeoutMs: number;
}

export interface GameReport {
  gameId: string;
  ok: boolean;
  phases: string[];
  seconds: number;
  notes: string[];
  failures: string[];
}

const PHONE_CYCLE: DevicePreset[] = ['iphone', 'pixel'];

export async function runFullGames(options: RunOptions): Promise<GameReport[]> {
  const server = await startServer(options.port);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const reports: GameReport[] = [];
  try {
    const registered = await api.games();
    const wanted =
      options.games.length > 0
        ? registered.filter((g) => options.games.includes(g.id))
        : registered;
    for (const id of options.games)
      if (!registered.some((g) => g.id === id))
        throw new Error(
          `unknown game "${id}" (registered: ${registered.map((g) => g.id).join(', ')})`,
        );
    if (wanted.length === 0)
      throw new Error('no registered games to play (add one with pnpm new-game)');
    for (const game of wanted) reports.push(await playOne(api, server.url, browser, game, options));
  } finally {
    await browser.close();
    await server.stop();
  }
  return reports;
}

async function playOne(
  api: DevApi,
  url: string,
  browser: Browser,
  game: { id: string; minPlayers: number; maxPlayers: number },
  options: RunOptions,
): Promise<GameReport> {
  const started = Date.now();
  const report: GameReport = {
    gameId: game.id,
    ok: false,
    phases: [],
    seconds: 0,
    notes: [],
    failures: [],
  };
  const session = new Session(browser, url);
  try {
    await api.reset();
    await api.clock(false);
    await session.openTv('tv');
    const humans = Math.min(options.phones, game.maxPlayers);
    for (let i = 0; i < humans; i++) {
      await session.joinPhone(
        PHONE_CYCLE[i % PHONE_CYCLE.length] as DevicePreset,
        `Player ${i + 1}`,
        AVATAR_IDS[i % AVATAR_IDS.length] as string,
      );
    }
    if (game.minPlayers > humans) {
      await api.bots(game.minPlayers - humans, 'fast');
      report.notes.push(`added ${game.minPlayers - humans} bots to reach minPlayers`);
    }
    await api.start(game.id, options.seed);

    let lastKey = '';
    let lastChange = Date.now();
    let idleRounds = 0;
    while (Date.now() - started < options.gameTimeoutMs) {
      const state = await api.state();
      if (!state.room) throw new Error('room vanished');
      if (state.room.status === 'results') break;
      if (state.room.status !== 'playing' || !state.room.game)
        throw new Error(`unexpected status ${state.room.status}`);
      const phase = state.room.game.state.phase;
      const key = `${phase.id}:${phase.startedAt}`;
      if (key !== lastKey) {
        lastKey = key;
        lastChange = Date.now();
        idleRounds = 0;
        if (report.phases.at(-1) !== phase.id) report.phases.push(phase.id);
      }
      const acted = await api.act(undefined, options.seed + report.phases.length);
      if (acted.acted.length === 0) idleRounds += 1;
      // Nobody can act and the phase is only waiting on its timer: skip so the run stays fast.
      if (idleRounds >= 2 && Date.now() - lastChange > 1500) {
        await api.skip();
        idleRounds = 0;
      }
      await new Promise((r) => setTimeout(r, 350));
    }
    const final = await api.state();
    if (final.room?.status !== 'results')
      report.failures.push(
        `game did not reach results within ${options.gameTimeoutMs} ms (status ${final.room?.status ?? 'none'}, phase ${final.room?.game?.state.phase.id ?? '-'})`,
      );

    for (const screen of session.screens) {
      if (screen.label === 'tv') {
        await screen.page
          .getByLabel('scoreboard')
          .waitFor({ timeout: 5000 })
          .catch(() => report.failures.push('tv: no scoreboard on results'));
        continue;
      }
      const ok = await screen.page
        .getByRole('heading', { name: 'Results' })
        .waitFor({ timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (!ok) report.failures.push(`${screen.label}: did not reach the results screen`);
    }
    await session.checkBoundaries();
  } catch (err) {
    report.failures.push(String(err));
  } finally {
    for (const f of session.failures) report.failures.push(`${f.page} ${f.kind}: ${f.text}`);
    await session.close();
  }
  report.seconds = Math.round((Date.now() - started) / 100) / 10;
  report.ok = report.failures.length === 0;
  return report;
}

export function formatReports(reports: GameReport[]): string {
  return reports
    .map((r) => {
      const lines = [`${r.ok ? '✔' : '✖'} ${r.gameId}: ${r.phases.join(' → ')} (${r.seconds} s)`];
      for (const n of r.notes) lines.push(`    note: ${n}`);
      for (const f of r.failures) lines.push(`    FAIL: ${f}`);
      return lines.join('\n');
    })
    .join('\n');
}

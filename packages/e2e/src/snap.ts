// `pnpm e2e:snap --game <id>`: frozen-clock screenshots of every phase — TV + one phone per device
// preset, in two states per phase (before anyone acts / after half the room acted), plus a
// spectator phone. Files: <out>/<nn>-<phase>[-after]/<device>-<role>.png
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AVATAR_IDS } from '@partybox/shared';
import { chromium } from 'playwright';
import { DevApi } from './dev-api';
import type { DevicePreset } from './devices';
import { REPO_ROOT, startServer } from './server';
import { Session } from './session';
import type { Screen } from './session';

export interface SnapOptions {
  game: string;
  out?: string;
  devices: DevicePreset[];
  port?: number;
  seed: number;
  /** Stop after this many phase instances (games loop; ~2 rounds is plenty). */
  maxPhases: number;
}

export interface SnapReport {
  out: string;
  shots: number;
  phases: string[];
  failures: string[];
}

export async function snapGame(options: SnapOptions): Promise<SnapReport> {
  const out = options.out ?? join(REPO_ROOT, 'reports', 'e2e', 'screenshots', options.game);
  mkdirSync(out, { recursive: true });
  const server = await startServer(options.port);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const report: SnapReport = { out, shots: 0, phases: [], failures: [] };
  const session = new Session(browser, server.url);
  try {
    const game = (await api.games()).find((g) => g.id === options.game);
    if (!game) throw new Error(`unknown game "${options.game}"`);
    await api.reset();
    const tv = await session.openTv('tv');
    const phones: Screen[] = [];
    let i = 0;
    for (const preset of options.devices) {
      phones.push(
        await session.joinPhone(
          preset,
          `Player ${i + 1}`,
          AVATAR_IDS[i % AVATAR_IDS.length] as string,
          preset,
        ),
      );
      i += 1;
    }
    const humans = phones.length;
    if (game.minPlayers > humans) await api.bots(game.minPlayers - humans, 'idle');
    // Freeze BEFORE starting so every deadline is far away and timers read the same everywhere.
    await api.clock(true);
    await api.start(game.id, options.seed);
    // A late joiner becomes the spectator phone.
    const spectator = await session.joinPhone(
      'pixel',
      'Late Lou',
      AVATAR_IDS[15] as string,
      'spectator',
    );

    const shoot = async (dir: string): Promise<void> => {
      mkdirSync(dir, { recursive: true });
      await new Promise((r) => setTimeout(r, 600)); // let transitions settle
      await tv.page.screenshot({ path: join(dir, 'tv.png') });
      report.shots += 1;
      const state = await api.state();
      const vipId = state.room?.vipId;
      for (const phone of phones) {
        const me = Object.values(state.room?.players ?? {}).find(
          (p) => p.name === phone.label || p.name === `Player ${phones.indexOf(phone) + 1}`,
        );
        const role = me && me.id === vipId ? 'vip' : 'player';
        await phone.page.screenshot({
          path: join(dir, `${phone.preset}-${role}.png`),
          fullPage: true,
        });
        report.shots += 1;
      }
      await spectator.page.screenshot({ path: join(dir, 'pixel-spectator.png'), fullPage: true });
      report.shots += 1;
    };

    let index = 0;
    let lastKey = '';
    while (index < options.maxPhases) {
      const state = await api.state();
      if (!state.room?.game || state.room.status !== 'playing') break;
      const phase = state.room.game.state.phase;
      const key = `${phase.id}:${phase.startedAt}`;
      if (key === lastKey) {
        await api.skip();
        continue;
      }
      lastKey = key;
      index += 1;
      report.phases.push(phase.id);
      const prefix = `${String(index).padStart(2, '0')}-${phase.id}`;
      await shoot(join(out, prefix));
      // Half the humans act, then the same phase "after" — shows submitted vs waiting states.
      const ids = Object.values(state.room.players)
        .filter((p) => !state.bots.includes(p.id))
        .map((p) => p.id);
      let actedAny = false;
      for (const id of ids.slice(0, Math.max(1, Math.floor(ids.length / 2)))) {
        const r = await api.act(id, options.seed + index);
        actedAny = actedAny || r.acted.length > 0;
      }
      const after = await api.state();
      const afterKey = after.room?.game
        ? `${after.room.game.state.phase.id}:${after.room.game.state.phase.startedAt}`
        : '';
      if (actedAny && afterKey === key) await shoot(join(out, `${prefix}-after`));
      if (afterKey === key) await api.skip();
    }
    const final = await api.state();
    if (final.room?.status === 'results') {
      report.phases.push('results');
      await shoot(join(out, `${String(index + 1).padStart(2, '0')}-results`));
    }
    await session.checkBoundaries();
  } catch (err) {
    report.failures.push(String(err));
  } finally {
    for (const f of session.failures) report.failures.push(`${f.page} ${f.kind}: ${f.text}`);
    await session.close();
    await browser.close();
    await server.stop();
  }
  return report;
}

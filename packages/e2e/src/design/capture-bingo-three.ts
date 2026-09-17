// Bingo, live, three more situations: a tablet holding four normal cards (no Focus, no gate), a
// phone that reloads while its BINGO! is armed (dibs must not stick to a ghost), and a real bingo
// on card 1 of 2 followed by "Keep going — same pattern" (card 1 locks, the up card moves to 2).
// Usage: tsx packages/e2e/src/design/capture-bingo-three.ts --out <dir> [--port]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  applyDeviceCss,
  joinViaForm,
  openPhone,
  openTv,
  passAudioGate,
  settle,
} from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42078' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const G = 'bingo';

interface BingoState {
  round: {
    deck: number[];
    drawn: number;
    cards: Record<string, number[][]>;
    arm: { playerId: string } | null;
    queue: { playerId: string }[];
  };
  phase: { id: string };
}
const LINES: number[][] = [
  ...Array.from({ length: 5 }, (_, r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c)),
  ...Array.from({ length: 5 }, (_, c) => [0, 1, 2, 3, 4].map((r) => r * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  const state = async (): Promise<BingoState> =>
    (await api.state()).room?.game?.state as unknown as BingoState;
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const vip = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(vip, api, { avatarIndex: 1 });
    const pad = await openPhone(browser, server.url, 'ipad', 'Noor');
    await joinViaForm(pad, api, { avatarIndex: 4 });
    await api.bots(1, 'idle');
    await api.post('/api/dev/start', {
      gameId: G,
      seed: 11,
      settings: { rounds: 1, round1: 'line', cards: 4, callSeconds: 60 },
    });
    await settle(600);
    await shots.shot(pad.page, { group: G, phase: 'intro-4', device: 'ipad', role: 'pad' });
    await api.skip();
    await api.skip();
    await api.skip();
    await settle(600);
    await shots.shot(pad.page, { group: G, phase: 'play-4', device: 'ipad', role: 'pad' });
    const style = pad.page.getByRole('button', { name: /style/i }).first();
    if ((await style.count()) > 0) {
      await style.click();
      await settle(400);
      await shots.shot(pad.page, { group: G, phase: 'sheet-4', device: 'ipad', role: 'pad' });
      await pad.page.getByRole('button', { name: /^Close$/ }).click();
      await settle(3600);
    }
    // Sam arms card 1 then the phone reloads mid-window: the server's arm lapses on its own.
    await vip.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await settle(300);
    console.log('armed before reload:', JSON.stringify((await state()).round.arm));
    await vip.page.reload();
    await vip.page.waitForSelector('[data-surface="controller"]');
    await applyDeviceCss(vip.page, vip.device);
    await settle(1200);
    await shots.shot(vip.page, {
      group: G,
      phase: 'reloaded-armed',
      device: 'iphone',
      role: 'vip',
    });
    await shots.shot(pad.page, { group: G, phase: 'ghost-arm', device: 'ipad', role: 'pad' });
    await settle(2500);
    console.log('arm 4 s after reload:', JSON.stringify((await state()).round.arm));
    await api.skip(); // the next call settles a stale arm
    await settle(500);
    console.log('arm after a call:', JSON.stringify((await state()).round.arm));
    await shots.shot(pad.page, { group: G, phase: 'arm-cleared', device: 'ipad', role: 'pad' });
    await shots.shot(vip.page, { group: G, phase: 'arm-cleared', device: 'iphone', role: 'vip' });
    await tv.close();
    await vip.page.close();
    await pad.page.close();
    // ── a real bingo on card 1 of 2, then keep going on the same pattern ──
    await api.reset();
    const tv2 = await openTv(browser, server.url);
    await passAudioGate(tv2);
    const p = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(p, api, { avatarIndex: 2 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: G,
      seed: 5,
      settings: { rounds: 1, round1: 'line', cards: 2, callSeconds: 60 },
    });
    await settle(500);
    await api.skip();
    const me = (await api.playerId('Sam')) ?? '';
    let line: number[] | null = null;
    for (let i = 0; i < 60 && !line; i += 1) {
      const s = await state();
      if (s.phase.id !== 'play') break;
      const card = s.round.cards[me]?.[0] ?? [];
      const called = new Set(s.round.deck.slice(0, s.round.drawn));
      line = LINES.find((l) => l.every((i) => i === 12 || called.has(card[i] ?? -1))) ?? null;
      if (!line) {
        await api.skip();
        await settle(120);
      }
    }
    if (!line) throw new Error('no line got called within 60 numbers');
    const card = (await state()).round.cards[me]?.[0] ?? [];
    for (const i of line) {
      if (i === 12) continue;
      const letter = 'BINGO'[i % 5];
      await p.page
        .getByRole('gridcell', { name: new RegExp(`^${letter} ${card[i]}$`) })
        .first()
        .click();
    }
    await settle(300);
    await p.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await p.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(5500);
    await shots.shot(tv2, { group: G, phase: 'bingo-1of2', device: 'tv', role: 'stage' });
    await shots.shot(p.page, { group: G, phase: 'bingo-1of2', device: 'iphone', role: 'winner' });
    await p.page.getByRole('button', { name: /keep going — same pattern/i }).click();
    await settle(900);
    await shots.shot(p.page, { group: G, phase: 'kept-going', device: 'iphone', role: 'winner' });
    await shots.shot(tv2, { group: G, phase: 'kept-going', device: 'tv', role: 'stage' });
    await api.skip();
    await settle(600);
    await shots.shot(p.page, {
      group: G,
      phase: 'kept-going-call',
      device: 'iphone',
      role: 'winner',
    });
    console.log(`captured ${shots.shots.length} stills → ${OUT}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

// Bingo's key moments, live: a new call landing on the TV (burst frames), a wrong claim (buzzer
// card cell by cell, NOT A BINGO, the claimant's phone during and after), and a real bingo (the
// script daubs a called line on the VIP's phone) with the confetti celebration.
// Usage: tsx packages/e2e/src/design/capture-bingo.ts --out reports/design/<stamp> [--port 42071]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42071' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const G = 'bingo';

interface BingoState {
  round: { deck: number[]; drawn: number; cards: Record<string, number[]> };
  phase: { id: string };
}
const LINES: number[][] = [
  ...Array.from({ length: 5 }, (_, r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c)),
  ...Array.from({ length: 5 }, (_, c) => [0, 1, 2, 3, 4].map((r) => r * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

async function burst(shots: Shooter, page: Page, phase: string, n: number, gap: number) {
  for (let i = 0; i < n; i += 1) {
    await shots.shot(page, { group: G, phase, device: 'tv', role: `t${i}` }, { settleMs: 0 });
    await settle(gap);
  }
}

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
    const p2 = await openPhone(browser, server.url, 'iphone-se', 'Maximiliano Vega');
    await joinViaForm(p2, api, { avatarIndex: 5 });
    await api.bots(2, 'idle');
    await api.clock(true);
    await api.start(G, 11);
    await settle(600);
    await shots.shot(tv, { group: G, phase: 'intro', device: 'tv', role: 'stage' });
    await shots.shot(vip.page, { group: G, phase: 'intro', device: 'iphone', role: 'vip' });
    // intro → play: the first call bounces in.
    await api.skip();
    await burst(shots, tv, 'call-lands', 5, 70);
    await settle(500);
    await shots.shot(vip.page, { group: G, phase: 'play', device: 'iphone', role: 'vip' });
    await shots.shot(p2.page, { group: G, phase: 'play', device: 'iphone-se', role: 'p2' });
    // FREE daubed on the phone (local), one wrong daub, then a wrong claim from p2.
    await p2.page.getByRole('gridcell', { name: /^N FREE/ }).click();
    await p2.page.getByRole('gridcell').nth(0).click();
    await p2.page.getByRole('gridcell').nth(1).click();
    await settle(300);
    await shots.shot(p2.page, { group: G, phase: 'play-daubed', device: 'iphone-se', role: 'p2' });
    await p2.page.getByRole('button', { name: /^bingo!$/i }).click();
    await burst(shots, tv, 'check-lands', 18, 300);
    await settle(1200);
    await shots.shot(tv, { group: G, phase: 'check', device: 'tv', role: 'stage' });
    await shots.shot(p2.page, { group: G, phase: 'check', device: 'iphone-se', role: 'claimant' });
    await shots.shot(vip.page, { group: G, phase: 'check', device: 'iphone', role: 'vip' });
    await api.skip(); // check → play (next number); the claimant's card is wiped
    await settle(700);
    await shots.shot(p2.page, { group: G, phase: 'wiped', device: 'iphone-se', role: 'claimant' });
    // A real bingo: skip numbers until a line of the VIP's card is fully called, daub it, claim.
    const vipId = (await api.playerId('Sam')) ?? '';
    let line: number[] | null = null;
    for (let i = 0; i < 60 && !line; i += 1) {
      const s = await state();
      if (s.phase.id !== 'play') break;
      const card = s.round.cards[vipId] ?? [];
      const called = new Set(s.round.deck.slice(0, s.round.drawn));
      line = LINES.find((l) => l.every((i) => i === 12 || called.has(card[i] ?? -1))) ?? null;
      if (!line) {
        await api.skip();
        await settle(120);
      }
    }
    if (!line) throw new Error('no line got called within 60 numbers');
    const s = await state();
    const card = s.round.cards[vipId] ?? [];
    for (const i of line) {
      if (i === 12) continue;
      const letter = 'BINGO'[i % 5];
      await vip.page.getByRole('gridcell', { name: new RegExp(`^${letter} ${card[i]}$`) }).click();
    }
    await settle(300);
    await shots.shot(vip.page, { group: G, phase: 'line-daubed', device: 'iphone', role: 'vip' });
    await vip.page.getByRole('button', { name: /^bingo!$/i }).click();
    await burst(shots, tv, 'bingo-lands', 18, 300);
    await settle(1500);
    await shots.shot(tv, { group: G, phase: 'bingo', device: 'tv', role: 'stage' });
    await shots.shot(vip.page, { group: G, phase: 'bingo', device: 'iphone', role: 'winner' });
    await shots.shot(p2.page, { group: G, phase: 'bingo', device: 'iphone-se', role: 'p2' });
    // The VIP (the winner here) keeps the round going on the same cards; the caller resumes and
    // the winner's BINGO! button says the pattern is already theirs.
    await settle(3500);
    await shots.shot(tv, { group: G, phase: 'bingo-decide', device: 'tv', role: 'stage' });
    await shots.shot(vip.page, { group: G, phase: 'bingo-decide', device: 'iphone', role: 'vip' });
    await vip.page.getByRole('button', { name: /keep going — same pattern/i }).click();
    await settle(1200);
    await shots.shot(tv, { group: G, phase: 'continued', device: 'tv', role: 'stage' });
    await shots.shot(vip.page, { group: G, phase: 'continued', device: 'iphone', role: 'winner' });
    await shots.shot(p2.page, { group: G, phase: 'continued', device: 'iphone-se', role: 'p2' });
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

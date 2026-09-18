// A tablet (iPad, four normal cards) recorded at 10 fps: the first call landing on its header, a
// wrong claim on card 2 (check + wipe among four cards), and a real bingo on card 1 with the
// keep-going footer under a 2 × 2 grid.
// Usage: tsx packages/e2e/src/design/capture-bingo-tablet.ts --out <dir> [--port 42101]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  cutStrips,
  joinViaForm,
  openPhoneRecorded,
  openTv,
  passAudioGate,
  settle,
} from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42101' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);

interface BingoState {
  round: { deck: number[]; drawn: number; cards: Record<string, number[][]> };
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
  const browser = await chromium.launch();
  const marks: { name: string; at: number; before?: number; seconds?: number }[] = [];
  const state = async (): Promise<BingoState> =>
    (await api.state()).room?.game?.state as unknown as BingoState;
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const pad = await openPhoneRecorded(browser, server.url, 'ipad', 'Noor', join(OUT, 'video'));
    await joinViaForm(pad, api, { avatarIndex: 4 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 13,
      settings: { rounds: 1, round1: 'line', cards: 4, callSeconds: 60 },
    });
    await settle(600);
    marks.push({ name: 'intro-to-play', at: Date.now(), before: 0.2, seconds: 2 });
    await api.skip();
    await settle(2000);
    // A wrong claim on card 2.
    marks.push({ name: 'wrong-claim-card2', at: Date.now(), before: 0.2, seconds: 8 });
    await pad.page.getByRole('button', { name: /^bingo! card 2$/i }).click();
    await pad.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(8000);
    await api.skip();
    await settle(1800);
    // A real bingo on card 1: skip calls until a line of card 1 is out, daub it, claim.
    const me = (await api.playerId('Noor')) ?? '';
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
      await pad.page
        .getByRole('gridcell', { name: new RegExp(`^${letter} ${card[i]}$`) })
        .first()
        .click();
    }
    await settle(300);
    marks.push({ name: 'bingo-card1', at: Date.now(), before: 0.2, seconds: 8 });
    await pad.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await pad.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(7500);
    const video = await cutStrips(pad, join(OUT, 'strips'), marks);
    console.log(`10 fps strips from ${video ?? '(no video)'} → ${join(OUT, 'strips')}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

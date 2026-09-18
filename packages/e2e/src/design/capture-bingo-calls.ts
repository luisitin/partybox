// Three consecutive calls at 10 fps, the TV and Sam's phone recorded together (loop 247/248): every
// ball must drop, and the phone's nickname must land on the same beat.
// With --board the hall board is on and a second strip is cropped to it (loop 250: the current cell
// must ignite on the landing, not before).
// Usage: tsx packages/e2e/src/design/capture-bingo-calls.ts --out <dir> [--port 42155] [--board]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  cutStrips,
  joinViaForm,
  openPhoneRecorded,
  openTvRecorded,
  passAudioGate,
  settle,
} from './session';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42155' },
    board: { type: 'boolean', default: false },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const rec = await openTvRecorded(browser, server.url, join(OUT, 'video'));
    await passAudioGate(rec.page);
    const sam = await openPhoneRecorded(
      browser,
      server.url,
      'iphone',
      'Sam',
      join(OUT, 'video-phone'),
    );
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 9,
      settings: { rounds: 1, round1: 'line', cards: 1, callSeconds: 60, showBoard: values.board },
    });
    await settle(500);
    await api.skip();
    await settle(1500);
    const marks: { name: string; at: number; before?: number; seconds?: number; crop?: string }[] =
      [{ name: 'three-calls', at: Date.now(), before: 0.1, seconds: 4 }];
    const boardMark = async (): Promise<void> => {
      if (!values.board) return;
      // The ball and the board together, source pixels, so a 60 px cell reads in a 640 px strip.
      const box = await rec.page.evaluate(() => {
        const el = document.querySelector('[aria-label$="numbers called"]');
        const r = el?.getBoundingClientRect();
        return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
      });
      if (box) {
        const x = Math.max(0, Math.round(box.x));
        const w = Math.round(box.w);
        marks.push({
          name: 'board',
          at: Date.now(),
          before: 0.1,
          seconds: 1.2,
          crop: `${w}:${Math.round(box.h)}:${x}:${Math.round(box.y)}`,
        });
      }
    };
    for (let i = 0; i < 3; i += 1) {
      // The board's crop is measured once the "Before that" row has settled the layout (call 2).
      if (i === 2) await boardMark();
      await api.skip();
      await settle(1200);
    }
    await cutStrips(sam, join(OUT, 'strips-phone'), marks);
    const video = await cutStrips(rec, join(OUT, 'strips'), marks);
    console.log(`10 fps strips from ${video ?? '(no video)'}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

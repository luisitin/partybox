// Three consecutive calls at 10 fps, the TV and Sam's phone recorded together (loop 247/248): every
// ball must drop, and the phone's nickname must land on the same beat.
// Usage: tsx packages/e2e/src/design/capture-bingo-calls.ts --out <dir> [--port 42155]
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
  options: { out: { type: 'string' }, port: { type: 'string', default: '42155' } },
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
      settings: { rounds: 1, round1: 'line', cards: 1, callSeconds: 60 },
    });
    await settle(500);
    await api.skip();
    await settle(1500);
    const marks = [{ name: 'three-calls', at: Date.now(), before: 0.1, seconds: 4 }];
    for (let i = 0; i < 3; i += 1) {
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

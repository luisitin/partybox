// A phone dropping and returning mid-round, recorded at 10 fps: the "Reconnecting…" pill arriving,
// two calls it never hears, the socket back → the missed-calls toast and the meta line, then a
// full reload → the rejoin lands straight on the card.
// Usage: tsx packages/e2e/src/design/capture-bingo-reconnect.ts --out <dir> [--port 42102]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  applyDeviceCss,
  cutStrips,
  joinViaForm,
  openPhoneRecorded,
  openTv,
  passAudioGate,
  settle,
} from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42102' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const marks: { name: string; at: number; before?: number; seconds?: number }[] = [];
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const sam = await openPhoneRecorded(browser, server.url, 'iphone', 'Sam', join(OUT, 'video'));
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 21,
      settings: { rounds: 1, round1: 'line', cards: 2, callSeconds: 60 },
    });
    await settle(500);
    await api.skip();
    await settle(1500);
    marks.push({ name: 'drop', at: Date.now(), before: 0.2, seconds: 3 });
    await sam.context.setOffline(true);
    await settle(2500);
    await api.skip();
    await settle(300);
    await api.skip();
    await settle(4500);
    marks.push({ name: 'back', at: Date.now(), before: 0.2, seconds: 8 });
    await sam.context.setOffline(false);
    await settle(8000);
    marks.push({ name: 'reload', at: Date.now(), before: 0.2, seconds: 3 });
    await sam.page.reload();
    await sam.page.waitForSelector('[data-surface="controller"]');
    await applyDeviceCss(sam.page, sam.device);
    await settle(2500);
    const video = await cutStrips(sam, join(OUT, 'strips'), marks);
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

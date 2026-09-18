// The claim tap at 10 fps (loop 240): Sam's iPhone recorded through the first tap (arm), the
// second tap (the slam, the "sent!" cue) and the switch to "Look at the TV".
// With --tv the TV is recorded instead (loop 252): the first tap alone, its "says BINGO?…" line and
// the 3 s window draining until dibs lapse.
// Usage: tsx packages/e2e/src/design/capture-bingo-claim.ts --out <dir> [--port 42131] [--tv]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { daubLine, skipToLine } from './bingo-lines';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  cutStrips,
  joinViaForm,
  openPhoneRecorded,
  openTv,
  openTvRecorded,
  passAudioGate,
  settle,
} from './session';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42131' },
    tv: { type: 'boolean', default: false },
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
    const rec = values.tv ? await openTvRecorded(browser, server.url, join(OUT, 'video-tv')) : null;
    const tv = rec ? rec.page : await openTv(browser, server.url);
    await passAudioGate(tv);
    const sam = await openPhoneRecorded(browser, server.url, 'iphone', 'Sam', join(OUT, 'video'));
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 9,
      settings: { rounds: 1, round1: 'line', cards: 1, callSeconds: 60 },
    });
    await settle(500);
    await api.skip();
    const me = (await api.playerId('Sam')) ?? '';
    const { line, card } = await skipToLine(api, me);
    await daubLine(sam.page, line, card);
    await settle(600);
    const marks = [{ name: 'claim', at: Date.now(), before: 0.1, seconds: 3 }];
    await sam.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    if (rec) {
      // Let the window lapse: the line pops, the bar drains over 3 s, the line goes.
      await settle(4200);
      const video = await cutStrips(rec, join(OUT, 'strips-tv'), [
        { name: 'dibs', at: marks[0]?.at ?? 0, before: 0.1, seconds: 4 },
      ]);
      console.log(`10 fps TV strips from ${video ?? '(no video)'}`);
      await sam.context.close();
      return;
    }
    await settle(900);
    await sam.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(2100);
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

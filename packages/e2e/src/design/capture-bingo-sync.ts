// Sync by the DOM, not the tape (loop 297): TV and Sam's phone polled every 25 ms through a wrong
// claim's return — the verdict, the 3 · 2 · 1, the next number — printing the moment each surface's
// text changes state. The recorded filmstrips are good to about one frame; under recording load
// the phone's tape can trail the TV's by three, which this measurement showed to be the recorder.
// Usage: tsx packages/e2e/src/design/capture-bingo-sync.ts [--port 42195]
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
const { values } = parseArgs({ options: { port: { type: 'string', default: '42195' } } });
import { startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';
async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const sam = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 9,
      settings: { rounds: 1, round1: 'line', cards: 2, callSeconds: 60 },
    });
    await settle(600);
    await api.skip();
    await settle(800);
    // a wrong claim on card 1 (bare)
    await sam.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await settle(300);
    await sam.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    const t0 = Date.now();
    // poll both pages every 25 ms for 14 s: TV ring present? phone curtain present? ball/card?
    const rows: string[] = [];
    let lastTv = '',
      lastPh = '';
    while (Date.now() - t0 < 14000) {
      const [a, b] = await Promise.all([
        tv.evaluate(() => {
          const t = document.body.innerText;
          return t.includes('CALLING RESUMES IN')
            ? 'ring'
            : t.includes('NOT A BINGO')
              ? 'verdict'
              : /BEFORE THAT|CALL \d+ OF 75/.test(t)
                ? 'play'
                : 'other';
        }),
        sam.page.evaluate(() => {
          const t = document.body.innerText;
          return t.includes('get your thumbs ready')
            ? 'ring'
            : t.includes('Not a bingo')
              ? 'verdict'
              : t.includes('Look at the TV') || t.includes('Checking')
                ? 'check'
                : t.includes('BINGO!')
                  ? 'play'
                  : 'other';
        }),
      ]);
      const ms = Date.now() - t0;
      if (a !== lastTv) {
        rows.push(`${ms} tv → ${a}`);
        lastTv = a;
      }
      if (b !== lastPh) {
        rows.push(`${ms} phone → ${b}`);
        lastPh = b;
      }
      await settle(25);
    }
    console.log(rows.join('\n'));
  } finally {
    await browser.close();
    await server.stop();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

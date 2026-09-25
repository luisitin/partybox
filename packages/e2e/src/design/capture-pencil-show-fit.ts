// The Broken Pencil show page at eight players: the two-row roster leaves the stage ~480 px and a
// fixed 560 px sheet ran over the kicker and into the host bar (and nudged the caption under the
// kicker even at six). Loads a drawing page at 8 and at 6
// players and measures the sheet against the kicker above and the host bar below.
// Usage: tsx packages/e2e/src/design/capture-pencil-show-fit.ts [--port 42131]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42131' } } });
const OUT = join(REPO_ROOT, 'reports', 'design', 'pencil-show-fit');
mkdirSync(OUT, { recursive: true });

let passed = 0;
let failed = 0;
function check(label: string, ok: boolean, detail: string): void {
  if (ok) passed += 1;
  else failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} — ${detail}`);
}

/** A room of `players` on a drawing page of the show (bots draw, the harness skips to the show). */
async function drawingPage(
  browser: Browser,
  url: string,
  api: DevApi,
  players: number,
): Promise<Page> {
  await api.reset();
  const tv = await openTv(browser, url);
  await passAudioGate(tv);
  const sam = await openPhone(browser, url, 'iphone', 'Sam');
  await joinViaForm(sam, api, { avatarIndex: 1 });
  const priya = await openPhone(browser, url, 'pixel', 'Priya');
  await joinViaForm(priya, api, { avatarIndex: 4 });
  await api.bots(players - 2, 'fast');
  await api.post('/api/dev/start', { gameId: 'broken-pencil', seed: 3, settings: { passes: 2 } });
  for (let i = 0; i < 40; i += 1) {
    const s = await api.state();
    const phase = s.room?.game?.state.phase.id;
    if (phase === 'show') break;
    await api.post('/api/dev/act', {}).catch(() => undefined);
    await api.skip();
    await settle(250);
  }
  // Page 1 is the word; page 2 is the first drawing.
  await settle(400);
  await api.skip();
  await settle(900);
  return tv;
}

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    const widths: Record<number, number> = {};
    for (const players of [8, 6]) {
      const tv = await drawingPage(browser, server.url, api, players);
      await tv.screenshot({ path: join(OUT, `${players}-drawing.png`) });
      const sheet = await tv
        .locator('[class*="current"] svg[aria-label$="drawing"]')
        .first()
        .boundingBox();
      const kicker = await tv
        .getByText(/^page \d+ of \d+$/i)
        .first()
        .boundingBox();
      const host = await tv
        .getByText(/^host$/i)
        .first()
        .boundingBox();
      const caption = await tv
        .getByText(/ drew$/)
        .first()
        .boundingBox();
      const text = (await tv.evaluate('document.body.innerText')) as string;
      check(
        `${players} players: on a drawing page`,
        / drew\n/.test(text) && sheet !== null,
        text.split('\n').find((l) => / drew$/.test(l)) ?? 'no caption',
      );
      check(
        `${players} players: the sheet clears the host bar`,
        sheet !== null && host !== null && sheet.y + sheet.height <= host.y - 8,
        `sheet bottom ${sheet ? (sheet.y + sheet.height).toFixed(0) : '?'}, host bar top ${host?.y.toFixed(0)}`,
      );
      check(
        `${players} players: the "X drew" tag sits on the sheet, the page count in the left column (I-211 B)`,
        caption !== null &&
          kicker !== null &&
          sheet !== null &&
          caption.x >= sheet.x &&
          caption.y >= sheet.y &&
          kicker.x + kicker.width <= sheet.x,
        `tag ${caption?.x.toFixed(0)},${caption?.y.toFixed(0)} in sheet ${sheet?.x.toFixed(0)},${sheet?.y.toFixed(0)}; page count right edge ${kicker ? (kicker.x + kicker.width).toFixed(0) : '?'}`,
      );
      widths[players] = sheet?.width ?? 0;
    }
    check(
      'the sheet takes the room it has: bigger at six (one roster row) than at eight (two)',
      widths[6]! > widths[8]! + 40 && widths[6]! >= 450,
      `six ${widths[6]?.toFixed(0)} px, eight ${widths[8]?.toFixed(0)} px`,
    );
    console.log(`${passed}/${passed + failed} checks passed → reports/design/pencil-show-fit/`);
    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

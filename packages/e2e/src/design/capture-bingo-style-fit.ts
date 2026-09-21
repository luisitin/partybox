// The Bingo card-style sheet's fit (I-013, the owner: "stress test for visual fit so it does not
// look wacky"): the sheet at 320 / 360 / 390 / 430 px widths × 1 / 2 / 3 / 4 cards — sixteen
// stills — each checked for no row taller than 56 px and no horizontal overflow.
// Usage: tsx packages/e2e/src/design/capture-bingo-style-fit.ts --out <dir> [--port 42250]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42250' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'bingo-style-fit');
const WIDTHS = [320, 360, 390, 430];
const CARDS = [1, 2, 3, 4];
const ROW_MAX = 56;

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  let passed = 0;
  let failed = 0;
  const ok = (name: string, cond: boolean, detail: string): void => {
    if (cond) passed += 1;
    else failed += 1;
    console.log(`${cond ? 'ok  ' : 'FAIL'} ${name} — ${detail}`);
  };
  try {
    mkdirSync(OUT, { recursive: true });
    for (const cards of CARDS) {
      await api.reset();
      const tv = await openTv(browser, server.url);
      await passAudioGate(tv);
      const phone = await openPhone(browser, server.url, 'iphone', 'Sam');
      await joinViaForm(phone, api, { avatarIndex: 1 });
      await api.bots(1, 'idle');
      await api.post('/api/dev/start', { gameId: 'bingo', seed: 3, settings: { cards } });
      // the deal + the 3 · 2 · 1 take longer with more cards: wait for play itself
      for (let i = 0; i < 60; i += 1) {
        if ((await api.state()).room?.game?.state.phase.id === 'play') break;
        await settle(500);
      }
      await settle(1500);
      for (const width of WIDTHS) {
        await phone.page.setViewportSize({ width, height: 800 });
        await settle(300);
        const open = phone.page.getByRole('button', { name: /style/i }).first();
        if ((await phone.page.getByRole('dialog', { name: /card style/i }).count()) === 0)
          await open.click();
        await settle(600);
        const m = await phone.page.evaluate(() => {
          const sheet = document.querySelector('[role="dialog"][aria-label="Card style"]');
          const rows = [...(sheet?.querySelectorAll('button[class*="row"]') ?? [])].map((r) => {
            const b = (r as HTMLElement).getBoundingClientRect();
            return { h: Math.round(b.height), text: (r.textContent ?? '').trim().slice(0, 18) };
          });
          return {
            rows,
            sheetH: Math.round(sheet?.getBoundingClientRect().height ?? 0),
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            sheetOverflow: sheet ? sheet.scrollWidth - sheet.clientWidth : 0,
          };
        });
        await phone.page.screenshot({ path: join(OUT, `${width}w-${cards}c.png`) });
        const tallest = Math.max(0, ...m.rows.map((r) => r.h));
        ok(
          `${width} px × ${cards} card(s): every row one line`,
          m.rows.length >= 6 && tallest <= ROW_MAX,
          `${m.rows.length} rows, tallest ${tallest} px, sheet ${m.sheetH} px`,
        );
        ok(
          `${width} px × ${cards} card(s): no horizontal overflow`,
          m.overflow <= 0 && m.sheetOverflow <= 0,
          `page +${m.overflow} px, sheet +${m.sheetOverflow} px`,
        );
        await phone.page.getByRole('button', { name: /^close$/i }).click();
        await settle(300);
      }
      await phone.context.close();
      await tv.context().close();
    }
    console.log(`${passed}/${passed + failed} checks passed → ${OUT}`);
    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Probe (F3, record-review §3b "hands on the phone"): a finger abuses the game picker on an iPhone
// SE and every check is written down. Long-press a row, double-tap ⓘ, triple-tap a row, pinch the
// list, overscroll both ends, drag the page sideways, drag the chips, drag the sheet up and past
// its handle, tap the backdrop while the sheet rises, rotate with the sheet open. After each: no
// zoom, no sideways page, no selected text, one sheet at most, the room state as intended, and a
// screenshot beside the at-rest one.
// Usage: tsx packages/e2e/src/design/probe-picker-touch.ts [--out <dir>] [--port 42300] [--demo]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { startProdServer } from './prod-server';
import { REPO_ROOT } from './server';
import { DevApi, joinViaForm, openPhone, settle } from './session';
import { Finger } from './touch';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42300' },
    demo: { type: 'boolean', default: false },
  },
});
const OUT =
  values.out ?? join(REPO_ROOT, 'reports', 'design', 'record-review', 'foundation', 'touch');

interface Check {
  step: string;
  ok: boolean;
  detail: string;
}

/** What must hold after any gesture on the list. */
async function sane(page: Page): Promise<{ ok: boolean; detail: string }> {
  const s = await page.evaluate(() => ({
    zoom: window.visualViewport?.scale ?? 1,
    scrollX: window.scrollX,
    wide: document.documentElement.scrollWidth - window.innerWidth,
    selected: window.getSelection()?.toString() ?? '',
    sheets: document.querySelectorAll('[role="dialog"]').length,
  }));
  const ok = s.zoom === 1 && s.scrollX === 0 && s.wide <= 0 && s.selected === '' && s.sheets <= 1;
  return { ok, detail: JSON.stringify(s) };
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startProdServer(Number(values.port), {
    env: values.demo ? { PARTYBOX_DEMO_CATALOG: '1' } : {},
  });
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const checks: Check[] = [];
  let shot = 0;
  try {
    await api.reset();
    const vip = await openPhone(browser, server.url, 'iphone-se', 'Sam');
    await joinViaForm(vip, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    const page = vip.page;
    const finger = await Finger.on(vip.context, page);
    const snap = async (name: string): Promise<void> => {
      shot += 1;
      await page.screenshot({ path: join(OUT, `${String(shot).padStart(2, '0')}-${name}.png`) });
    };
    const record = async (step: string, extra?: () => Promise<{ ok: boolean; detail: string }>): Promise<void> => {
      await settle(500);
      const base = await sane(page);
      const more = extra ? await extra() : { ok: true, detail: '' };
      checks.push({ step, ok: base.ok && more.ok, detail: `${base.detail} ${more.detail}`.trim() });
      await snap(step);
    }; // prettier-ignore
    type Room = { status?: string; selectedGameId?: string | null } | null | undefined;
    const room = async (): Promise<Room> => (await api.state()).room as Room;
    const selected = async (): Promise<string | null> => (await room())?.selectedGameId ?? null;
    const center = async (sel: string): Promise<{ x: number; y: number }> => {
      const box = await page.locator(sel).first().boundingBox();
      if (!box) throw new Error(`no ${sel}`);
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };

    await page.getByRole('button', { name: /pick a game/i }).click();
    await settle(900);
    await record('at-rest');

    // 1. Long-press a row: a peek — About opens, nothing is chosen, no text selected.
    const row = await center('li button[aria-label^="Choose"]');
    await finger.press(row.x, row.y, 900);
    await record('long-press-row', async () => {
      const sheets = await page.getByRole('dialog').count();
      return { ok: (await selected()) === null && sheets === 1, detail: `selected=${await selected()} sheets=${sheets}` };
    }); // prettier-ignore
    await page.getByRole('button', { name: /^close$/i }).click();
    await settle(500);

    // 2. Long-press the title text.
    const title = await center('h2');
    await finger.press(title.x, title.y, 900);
    await record('long-press-title');

    // 3. Pinch the list: the page must not zoom.
    await finger.pinch(160, 300, 40, 220, 300);
    await record('pinch');

    // 4. Drag the page sideways over the list: it must not move.
    await finger.drag(280, 320, 20, 330, 200);
    await record('drag-sideways');

    // 5. Drag the chips row: the chips scroll, the page does not.
    const chips = await center('[role="group"]');
    await finger.drag(chips.x + 100, chips.y, chips.x - 140, chips.y, 250);
    await record('drag-chips', async () => {
      const left = await page.locator('[role="group"]').evaluate((el) => el.scrollLeft);
      return { ok: left >= 0, detail: `chipsScrollLeft=${left}` };
    });

    // 6. Overscroll both ends of the list.
    await finger.drag(160, 250, 160, 520, 250);
    await record('overscroll-top');
    for (let i = 0; i < 4; i += 1) await finger.drag(160, 480, 160, 120, 180);
    await finger.drag(160, 480, 160, 60, 150);
    await record('overscroll-bottom');
    for (let i = 0; i < 5; i += 1) await finger.drag(160, 150, 160, 500, 180);
    await settle(400);

    // 7. Double-tap ⓘ: one sheet, not two; the TV highlight set once.
    const info = await center('button[aria-label^="About"]');
    await finger.taps(info.x, info.y, 2, 80);
    await record('double-tap-info', async () => {
      const n = await page.getByRole('dialog').count();
      return { ok: n === 1, detail: `sheets=${n}` };
    });

    // 8. Drag the sheet UP by its handle: it must not rise off its seat.
    const dialog = await page.getByRole('dialog').boundingBox();
    if (dialog) {
      await finger.drag(
        dialog.x + dialog.width / 2,
        dialog.y + 20,
        dialog.x + dialog.width / 2,
        dialog.y - 150,
        250,
      );
      await record('drag-sheet-up', async () => {
        const after = await page.getByRole('dialog').boundingBox();
        return { ok: Boolean(after) && Math.abs((after?.y ?? 0) - dialog.y) < 2, detail: `y ${dialog.y}→${after?.y}` };
      }); // prettier-ignore
      // 9. A short drag down that is released: the sheet settles back, still open.
      await finger.drag(
        dialog.x + dialog.width / 2,
        dialog.y + 20,
        dialog.x + dialog.width / 2,
        dialog.y + 50,
        200,
      );
      await record('short-drag-back', async () => ({ ok: (await page.getByRole('dialog').count()) === 1, detail: '' })); // prettier-ignore
      // 10. Rotate with the sheet open: nothing wider than the screen.
      await page.setViewportSize({ width: 568, height: 320 });
      await record('rotate-sheet-open');
      await page.setViewportSize({ width: 320, height: 568 });
      await settle(400);
      // 11. Close with the handle (swipe down).
      const d2 = await page.getByRole('dialog').boundingBox();
      if (d2)
        await finger.drag(d2.x + d2.width / 2, d2.y + 20, d2.x + d2.width / 2, d2.y + 320, 250);
      await record('swipe-close', async () => ({ ok: (await page.getByRole('dialog').count()) === 0, detail: '' })); // prettier-ignore
    }

    // 12. Tap the backdrop while the sheet is still rising: it closes cleanly, no ghost.
    const info2 = await center('button[aria-label^="About"]');
    await finger.taps(info2.x, info2.y, 1);
    // As soon as it is there (it rises over 300 ms): a person's next tap, never one before it.
    await page.getByRole('dialog').waitFor({ state: 'attached', timeout: 5000 });
    await settle(40);
    await finger.taps(160, 40, 1);
    await settle(700);
    await record('tap-backdrop-mid-rise', async () => ({ ok: (await page.getByRole('dialog').count()) === 0, detail: '' })); // prettier-ignore

    // 13. Triple-tap a row: the game is chosen once, and the taps landing on the next screen
    //     change nothing (no back, no options toggled open by accident, no Start).
    const row2 = await center('li button[aria-label^="Choose"]');
    await finger.taps(row2.x, row2.y, 3, 70);
    await record('triple-tap-row', async () => {
      const r = await room();
      const ok = r?.status === 'selecting' && Boolean(r.selectedGameId);
      return { ok, detail: `status=${r?.status} selected=${r?.selectedGameId}` };
    });

    // 14. Mash Start while the chosen screen rises: one game starts.
    const start = page.getByRole('button', { name: /^start/i });
    if ((await start.count()) > 0 && (await start.isEnabled())) {
      const box = await start.boundingBox();
      if (box) await finger.taps(box.x + box.width / 2, box.y + box.height / 2, 4, 60);
      await settle(1500);
      const s = await api.state();
      checks.push({ step: 'mash-start', ok: s.room?.status === 'playing', detail: `status=${s.room?.status}` }); // prettier-ignore
      await snap('mash-start');
    }
    await finger.detach();
  } finally {
    await browser.close();
    await server.stop();
  }
  writeFileSync(join(OUT, 'touch.json'), JSON.stringify(checks, null, 2) + '\n');
  for (const c of checks) console.log(`${c.ok ? 'ok  ' : 'FAIL'} ${c.step.padEnd(24)} ${c.detail}`);
  if (checks.some((c) => !c.ok)) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

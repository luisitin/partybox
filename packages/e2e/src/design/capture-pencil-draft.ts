// Broken Pencil drafts (README "Inputs"): Sam draws on the pad and never presses Done; the deadline
// closes the step and the next seat must receive the sheet as it stood, not a blank page. Records
// Sam's phone mid-drawing, the receiver's guess screen, and asserts on the server state.
// Usage: tsx packages/e2e/src/design/capture-pencil-draft.ts --out reports/design/pencil-draft [--port 42111]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42111' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'pencil-draft');
const PORT = Number(values.port);

interface PencilState {
  seats: string[];
  step: number;
  drafts?: Record<string, { strokes: unknown[] }>;
  books: { ownerId: string; pages: { kind: string; drawing?: { strokes: unknown[] } | null }[] }[];
}

/** Drags the pointer across the drawing sheet: `n` separate strokes, each a short zigzag. */
async function scribble(page: Page, n: number): Promise<void> {
  const sheet = page.getByLabel('drawing sheet');
  const box = await sheet.boundingBox();
  if (!box) throw new Error('no drawing sheet on the page');
  for (let s = 0; s < n; s += 1) {
    const x0 = box.x + box.width * (0.15 + 0.1 * s);
    const y0 = box.y + box.height * 0.2;
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (let k = 1; k <= 12; k += 1)
      await page.mouse.move(x0 + k * 6, y0 + (k % 2 ? 30 : 0) + k * 8, { steps: 2 });
    await page.mouse.up();
    await settle(120);
  }
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const lines: string[] = ['# Broken Pencil — the deadline keeps the draft', ''];
  const ok = (name: string, pass: boolean, detail: string): void => {
    lines.push(`- ${pass ? '✅' : '❌'} ${name} — ${detail}`);
    console.log(`${pass ? 'ok ' : 'FAIL'} ${name} — ${detail}`);
  };
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const sam = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(sam, api, { avatarIndex: 3 });
    const priya = await openPhone(browser, server.url, 'pixel', 'Priya');
    await joinViaForm(priya, api, { avatarIndex: 6 });
    const kenji = await openPhone(browser, server.url, 'iphone-se', 'Kenji');
    await joinViaForm(kenji, api, { avatarIndex: 9 });
    await api.clock(true);
    await api.post('/api/dev/start', {
      gameId: 'broken-pencil',
      seed: 7,
      settings: { drawSeconds: 30, guessSeconds: 15, passes: 15 },
    });
    await settle(800);
    // Everyone picks, so the draw step begins (Priya and Kenji through the dev API).
    for (const p of [sam, priya, kenji])
      if (p.playerId) await api.post('/api/dev/act', { playerId: p.playerId });
    await settle(900);
    const game = async (): Promise<PencilState> =>
      ((await api.state()).room?.game?.state ?? {}) as unknown as PencilState;
    let g = await game();
    const phase = (await api.state()).room?.game?.state.phase.id;
    ok('the draw step is on', phase === 'draw', `phase=${phase}`);
    // Priya and Kenji hand in their sheets; Sam draws and never presses Done.
    for (const p of [priya, kenji])
      if (p.playerId) await api.post('/api/dev/act', { playerId: p.playerId });
    await scribble(sam.page, 4);
    await settle(1800); // the trailing draft (1.5 s) has gone out by now
    await sam.page.screenshot({ path: join(OUT, 'sam-drawing.png') });
    g = await game();
    const draft = sam.playerId ? g.drafts?.[sam.playerId] : undefined;
    ok(
      'the server holds Sam’s draft while the pad is still open',
      (draft?.strokes.length ?? 0) >= 3,
      `strokes=${draft?.strokes.length ?? 0}`,
    );
    const tvText = JSON.stringify(await tv.evaluate('document.body.innerText'));
    ok('the TV shows nothing of the draft', !tvText.includes('draft'), 'body text has no "draft"');
    // One more stroke in the last seconds: the late window sends within 400 ms.
    await api.advance(26_000);
    await settle(300);
    await scribble(sam.page, 1);
    await settle(700);
    g = await game();
    const late = sam.playerId ? g.drafts?.[sam.playerId] : undefined;
    ok(
      'a stroke drawn in the last seconds reaches the server within a second',
      (late?.strokes.length ?? 0) >= 5,
      `strokes=${late?.strokes.length ?? 0}`,
    );
    // The deadline: the step closes with Sam's sheet as it stood.
    await api.advance(5_000);
    await settle(1200);
    g = await game();
    const phase2 = (await api.state()).room?.game?.state.phase.id;
    const samBook = g.books.find((b) => b.ownerId === sam.playerId);
    const page1 = samBook?.pages[1];
    ok(
      'the step closed on the timer and Sam’s page is the draft, not a blank sheet',
      phase2 === 'pass' &&
        page1?.kind === 'draw' &&
        (page1.drawing?.strokes.length ?? 0) === (late?.strokes.length ?? -1),
      `phase=${phase2} strokes=${page1?.drawing?.strokes.length ?? 'null'} draftHad=${late?.strokes.length ?? 0}`,
    );
    ok(
      'drafts are dropped once the step closes',
      g.drafts === undefined,
      `drafts=${JSON.stringify(g.drafts)}`,
    );
    // The next seat sees the drawing on the guess screen.
    const N = g.seats.length;
    const samSeat = g.seats.indexOf(sam.playerId ?? '');
    const nextId = g.seats[(samSeat + 1) % N];
    const receiver = [priya, kenji].find((p) => p.playerId === nextId);
    if (receiver) {
      await receiver.page.screenshot({ path: join(OUT, 'receiver-guess.png') });
      // DrawingView is an inline SVG: one <path> per stroke.
      const strokesOnScreen = await receiver.page.evaluate(
        `document.querySelectorAll('svg[aria-label="the drawing to guess"] path').length`,
      );
      ok(
        'the receiver’s phone shows the half-drawn sheet to guess',
        Number(strokesOnScreen) === (late?.strokes.length ?? -1),
        `paths=${strokesOnScreen} draft strokes=${late?.strokes.length ?? 0}`,
      );
    } else ok('the receiver is a real phone', false, `next seat ${nextId} is not Priya or Kenji`);
    await sam.page.screenshot({ path: join(OUT, 'sam-after-deadline.png') });
    await tv.screenshot({ path: join(OUT, 'tv-pass.png') });
  } finally {
    writeFileSync(join(OUT, 'RESULT.md'), `${lines.join('\n')}\n`);
    await browser.close();
    await server.stop();
  }
  if (lines.some((l) => l.startsWith('- ❌'))) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

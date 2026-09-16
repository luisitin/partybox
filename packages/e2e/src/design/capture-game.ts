// Live capture of one game: 4 phones (+ 2 random bots when the game welcomes them), frozen clock, every phase via VIP skip. At
// each phase: TV + every phone before anyone acts, then one phone acts generically (textarea →
// fill + submit; radios → first enabled) and TV + that phone again. Complements capture-preview
// (fixtures) with real transitions, chip states and the results screen.
// Usage: tsx packages/e2e/src/design/capture-game.ts --game wisecrack --out reports/design/<stamp> [--max 14]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import type { DeviceId } from './devices';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';
import type { Phone } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: {
    game: { type: 'string' },
    out: { type: 'string' },
    port: { type: 'string', default: '42071' },
    max: { type: 'string', default: '14' },
    seed: { type: 'string', default: '3' },
  },
});
if (!values.game) throw new Error('--game <id> is required');
const GAME = values.game;
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const MAX = Number(values.max);

const CAST: { device: DeviceId; name: string; role: string }[] = [
  { device: 'iphone', name: 'Sam', role: 'vip' },
  { device: 'iphone-se', name: 'Maximiliano Vega', role: 'p2' },
  { device: 'pixel', name: 'Priya', role: 'p3' },
  { device: 'font200', name: 'Kenji', role: 'p4' },
];

/** Do whatever the screen offers: type + submit, or tap the first enabled choice. */
async function actGenerically(page: Page): Promise<string | null> {
  const textarea = page.locator('textarea:not([disabled])');
  if (await textarea.count()) {
    await textarea.first().fill('Cheese on toast');
    const submit = page.getByRole('button', { name: /submit|next|send/i }).first();
    if (await submit.count()) await submit.click();
    return 'typed';
  }
  const radio = page.locator('[role="radio"]:not([disabled])');
  if (await radio.count()) {
    await radio.first().click();
    return 'picked';
  }
  return null;
}

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  const phones: Phone[] = [];
  const shot = (page: Page, phase: string, device: DeviceId, role: string, note?: string) =>
    shots.shot(page, { group: GAME, phase, device, role, note });
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    for (const [i, member] of CAST.entries()) {
      const phone = await openPhone(browser, server.url, member.device, member.name);
      await joinViaForm(phone, api, { avatarIndex: i * 3 + 1 });
      phones.push(phone);
    }
    // Bots are room players (ADR-028); a game without bot support refuses to start with them.
    const manifest = JSON.parse(
      readFileSync(join(REPO_ROOT, 'games', GAME, 'manifest.json'), 'utf8'),
    ) as { supportsBots?: boolean };
    if (manifest.supportsBots) await api.bots(2, 'random');
    await api.clock(true);
    await api.start(GAME, Number(values.seed));
    await settle(900);
    const seen = new Map<string, number>();
    for (let step = 0; step < MAX; step += 1) {
      const state = await api.state();
      if (!state.room || state.room.status !== 'playing') break;
      const phaseId = state.room.game?.state.phase.id ?? `phase${step}`;
      const n = (seen.get(phaseId) ?? 0) + 1;
      seen.set(phaseId, n);
      const phase = n === 1 ? phaseId : `${phaseId}-${n}`;
      await shot(tv, `live-${phase}`, 'tv', 'stage', `before anyone acts (step ${step})`);
      for (const [i, phone] of phones.entries())
        await shot(phone.page, `live-${phase}`, phone.device, CAST[i]!.role);
      // One human acts, then the TV shows the chip flip and the phone its locked state.
      const actor = phones[2]!;
      const did = await actGenerically(actor.page);
      if (did) {
        await settle(500);
        await shot(tv, `live-${phase}-acted`, 'tv', 'stage', `Priya ${did}`);
        await shot(actor.page, `live-${phase}-acted`, actor.device, 'p3', did);
      }
      await api.skip();
      await settle(1200);
    }
    const final = await api.state();
    if (final.room?.status === 'results') {
      await shot(tv, 'live-results', 'tv', 'stage');
      for (const [i, phone] of phones.entries())
        await shot(phone.page, 'live-results', phone.device, CAST[i]!.role);
    }
    console.log(`captured ${shots.shots.length} stills → ${OUT}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

// Blanks, a Pick 2 round by hand: the first seed whose opening black card takes two cards, one
// phone tapping its hand card by card (order badges, the live preview in the black card, the
// footer button), then the play and the first read-out with two whites in it.
// Usage: tsx packages/e2e/src/design/capture-pick2.ts --out reports/design/<stamp> [--port 42071]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { blackCard } from '../../../../games/blanks/server/content';
import { game } from '../../../../games/blanks/server/index';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42071' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);

/** The first seed whose round-1 black card is a Pick 2 (4 players, mild deck). */
function pick2Seed(): number {
  const players = [1, 2, 3, 4].map((i) => ({
    id: `p${i}`,
    name: `P${i}`,
    avatarId: 'fox',
    connected: true,
  }));
  for (let seed = 1; seed < 1000; seed += 1) {
    const s = game.init({ players, settings: { decks: 'mild', rounds: 3 }, seed, now: 1 });
    if (blackCard(s.blackId).pick === 2) return seed;
  }
  throw new Error('no Pick 2 opening card in 1000 seeds');
}

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const sam = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(sam, api, { avatarIndex: 1 });
    const priya = await openPhone(browser, server.url, 'pixel', 'Priya');
    await joinViaForm(priya, api, { avatarIndex: 4 });
    await api.bots(2, 'idle');
    // The seed is found for 4 ids in sorted order; the room's ids differ, but the deck shuffle
    // depends on the seed alone, so the opening black card is the same.
    await api.post('/api/dev/start', {
      gameId: 'blanks',
      seed: pick2Seed(),
      settings: { decks: 'mild', rounds: 3 },
    });
    await settle(6500); // intro
    const shot = (page: typeof tv, phase: string, device: 'tv' | 'iphone', note?: string) =>
      shots.shot(page, {
        group: 'blanks',
        phase,
        device,
        role: device === 'tv' ? 'stage' : 'vip',
        note,
      });
    await shot(sam.page, 'pick2-hand', 'iphone', 'nothing picked');
    const cards = sam.page.locator('ul[aria-label="your hand"] button');
    await cards.nth(0).click();
    await settle(400);
    await shot(
      sam.page,
      'pick2-one',
      'iphone',
      'first card picked: badge 1, preview fills blank 1',
    );
    await cards.nth(2).click();
    await settle(400);
    await shot(sam.page, 'pick2-two', 'iphone', 'second card picked: badge 2, button enabled');
    await cards.nth(0).click();
    await settle(400);
    await shot(sam.page, 'pick2-unpick', 'iphone', 'first card unpicked: the other becomes 1');
    await cards.nth(4).click();
    await settle(400);
    await sam.page.getByRole('button', { name: /play these 2/i }).click();
    await settle(700);
    await shot(sam.page, 'pick2-played', 'iphone', 'played: both cards in the black card');
    await shot(tv, 'pick2-answer', 'tv', 'one in');
    // Priya plays too, then the bots are idle: the deadline (75 s) is far — skip to the reading.
    const pcards = priya.page.locator('ul[aria-label="your hand"] button');
    await pcards.nth(1).click();
    await pcards.nth(3).click();
    await priya.page.getByRole('button', { name: /play these 2/i }).click();
    await settle(500);
    await api.skip();
    await settle(900);
    await shot(tv, 'pick2-reveal', 'tv', 'first read-out with two whites');
    await shot(sam.page, 'pick2-reveal', 'iphone');
    await api.skip();
    await settle(900);
    await shot(tv, 'pick2-judge', 'tv');
    await shot(sam.page, 'pick2-judge', 'iphone');
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

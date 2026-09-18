// The keep-going rules, live (owner, 2026-09-17): a choice made mid-celebration is held and lands
// when the reveal ends; the number that was up repeats; a won card still opens and daubs; the
// second bingo of a pattern reads "2nd bingo in round 1"; a two-player game with one side locked
// out offers only blackout or the end, and a blackout on every card only the end. Plus the deal.
// The TV and Sam's phone are recorded (10 fps strips); stills at every checkpoint; the state is
// asserted through the dev API, so a wrong outcome fails the run.
// Usage: tsx packages/e2e/src/design/capture-bingo-rules.ts --out <dir> [--port 42120]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { daubLine, skipToLine } from './bingo-lines';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  cutStrips,
  joinViaForm,
  openPhone,
  openPhoneRecorded,
  openTvRecorded,
  passAudioGate,
  settle,
} from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42120' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const G = 'bingo';

interface RoundState {
  drawn: number;
  bingos: number;
  pattern: string;
  won: Record<string, number[]>;
  daubs: Record<string, number[][]>;
  cards: Record<string, number[][]>;
  decision: unknown;
  patternBingos: number;
  deck: number[];
}
type Mark = { name: string; at: number; before?: number; seconds?: number };

function expect(cond: boolean, what: string): void {
  if (!cond) throw new Error(`FAILED: ${what}`);
  console.log(`ok · ${what}`);
}

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser: Browser = await chromium.launch();
  const state = async (): Promise<{
    phase: string;
    round: RoundState;
    wins: Record<string, number>;
  }> => {
    const s = (await api.state()).room?.game?.state as unknown as {
      phase: { id: string };
      round: RoundState;
      wins: Record<string, number>;
    };
    return { phase: s.phase.id, round: s.round, wins: s.wins };
  };
  const post = (playerId: string, input: unknown) =>
    api.post('/api/dev/event', { event: { type: 'input', now: Date.now(), playerId, input } });
  try {
    // ── room 1: three players, two cards ──
    await api.reset();
    const rec = await openTvRecorded(browser, server.url, join(OUT, 'video-tv'));
    const tv = rec.page;
    const tvMarks: Mark[] = [];
    await passAudioGate(tv);
    const sam = await openPhoneRecorded(
      browser,
      server.url,
      'iphone',
      'Sam',
      join(OUT, 'video-sam'),
    );
    const samMarks: Mark[] = [];
    await joinViaForm(sam, api, { avatarIndex: 1 });
    const priya = await openPhone(browser, server.url, 'iphone-se', 'Priya');
    await joinViaForm(priya, api, { avatarIndex: 5 });
    await api.bots(1, 'idle');
    samMarks.push({ name: 'deal', at: Date.now(), before: 0, seconds: 2.5 });
    await api.post('/api/dev/start', {
      gameId: G,
      seed: 5,
      settings: { rounds: 1, round1: 'line', cards: 2, callSeconds: 60 },
    });
    await settle(1800);
    await shots.shot(sam.page, { group: G, phase: 'dealt', device: 'iphone', role: 'sam' });
    await api.skip(); // intro → play
    const samId = (await api.playerId('Sam')) ?? '';
    const priyaId = (await api.playerId('Priya')) ?? '';
    const first = await skipToLine(api, samId, 0);
    await daubLine(sam.page, first.line, first.card);
    const drawnAtClaim = (await state()).round.drawn;
    await settle(300);
    tvMarks.push({ name: 'bingo-1-held-choice', at: Date.now(), before: 0.2, seconds: 12 });
    await sam.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await sam.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(600);
    expect((await state()).phase === 'bingo', 'a valid line is a bingo');
    expect((await state()).wins[samId] === 3, 'the first bingo of the pattern scores 3');
    // Priya's phone (a clock ahead, say) sends "keep going — same" 0.6 s into the celebration.
    await post(priyaId, { type: 'continue', pattern: 'same' });
    await settle(300);
    let s = await state();
    expect(s.phase === 'bingo' && s.round.decision !== null, 'an early choice is held');
    await settle(4000);
    await shots.shot(tv, { group: G, phase: 'held-choice', device: 'tv', role: 'stage' });
    await shots.shot(priya.page, {
      group: G,
      phase: 'held-choice',
      device: 'iphone-se',
      role: 'priya',
    });
    await settle(6000); // the reveal ends at ≈ 5.4–6.4 s, then 3 s to read it: the held choice lands
    s = await state();
    expect(s.phase === 'play', 'the held choice was applied when the celebration ended');
    expect(s.round.drawn === drawnAtClaim, 'the number that was up repeats');
    expect(s.round.decision === null, 'nothing left held');
    await shots.shot(tv, { group: G, phase: 'resumed-same-call', device: 'tv', role: 'stage' });
    await shots.shot(sam.page, { group: G, phase: 'resumed', device: 'iphone', role: 'sam' });
    // The won card still opens and daubs: bring card 1 back up and tap a square.
    samMarks.push({ name: 'won-card-daub', at: Date.now(), before: 0.2, seconds: 3 });
    await sam.page.getByRole('button', { name: /^Card 1, won$/i }).click();
    await settle(500);
    const target = first.card.findIndex((_, i) => i !== 12 && !first.line.includes(i));
    const letter = 'BINGO'[target % 5];
    await sam.page
      .getByRole('gridcell', { name: new RegExp(`^${letter} ${first.card[target]}$`) })
      .first()
      .click();
    await settle(500);
    s = await state();
    expect((s.round.daubs[samId]?.[0] ?? []).includes(target), 'a won card still takes a daub');
    await shots.shot(sam.page, {
      group: G,
      phase: 'won-card-daubed',
      device: 'iphone',
      role: 'sam',
    });
    // Second bingo of the pattern: Sam's card 2.
    const second = await skipToLine(api, samId, 1);
    await sam.page.getByRole('button', { name: /^Card 2/i }).click();
    await settle(400);
    await daubLine(sam.page, second.line, second.card);
    tvMarks.push({ name: 'bingo-2-headline', at: Date.now(), before: 0.2, seconds: 8 });
    await sam.page.getByRole('button', { name: /^bingo! card 2$/i }).click();
    await sam.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(8000);
    s = await state();
    expect(s.phase === 'bingo' && s.round.patternBingos === 2, 'the second bingo of the pattern');
    expect(s.wins[samId] === 5, 'the second scores 2 (5 in all)');
    expect((await tv.getByText(/[+]2 points/).count()) === 1, 'the TV says +2 points');
    await shots.shot(tv, { group: G, phase: 'second-bingo', device: 'tv', role: 'stage' });
    await shots.shot(sam.page, { group: G, phase: 'second-bingo', device: 'iphone', role: 'sam' });
    await shots.shot(priya.page, {
      group: G,
      phase: 'second-bingo',
      device: 'iphone-se',
      role: 'priya',
    });
    expect(
      (await tv.getByText(/Sam's 2nd bingo/).count()) === 1,
      'the TV headline counts the bingo',
    );
    // Priya picks blackout after the verdict: every card is back in, the kicker says so.
    await priya.page.getByRole('button', { name: /keep going — blackout/i }).click();
    await settle(1500);
    s = await state();
    expect(s.phase === 'play' && s.round.pattern === 'blackout', 'blackout on the same cards');
    expect((s.round.won[samId] ?? []).length === 0, 'the locks are off for a blackout');
    await shots.shot(sam.page, {
      group: G,
      phase: 'blackout-resumed',
      device: 'iphone',
      role: 'sam',
    });
    await cutStrips(sam, join(OUT, 'strips'), samMarks);
    await cutStrips(rec, join(OUT, 'strips'), tvMarks);
    await priya.context.close();
    // ── room 2: two players, one card each ──
    await api.reset();
    const tv2 = await openTvRecorded(browser, server.url, join(OUT, 'video-tv2'));
    const tv2Marks: Mark[] = [];
    await passAudioGate(tv2.page);
    const a = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(a, api, { avatarIndex: 1 });
    const b = await openPhone(browser, server.url, 'iphone-se', 'Priya');
    await joinViaForm(b, api, { avatarIndex: 5 });
    await api.post('/api/dev/start', {
      gameId: G,
      seed: 9,
      settings: { rounds: 1, round1: 'line', cards: 1, callSeconds: 60 },
    });
    await settle(500);
    await api.skip();
    const aId = (await api.playerId('Sam')) ?? '';
    const line2 = await skipToLine(api, aId, 0);
    await daubLine(a.page, line2.line, line2.card);
    await a.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await a.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(8000);
    s = await state();
    expect(s.phase === 'bingo', 'two players: a bingo');
    expect(
      (await b.page.getByRole('button', { name: /keep going — same pattern/i }).count()) === 0 &&
        (await b.page.getByRole('button', { name: /keep going — blackout/i }).count()) === 1,
      'two players, one locked out: only blackout or the end',
    );
    await shots.shot(b.page, {
      group: G,
      phase: 'two-player-choice',
      device: 'iphone-se',
      role: 'priya',
    });
    await b.page.getByRole('button', { name: /keep going — blackout/i }).click();
    await settle(1500);
    // Call until Sam's whole card is out, daub it all, claim the blackout.
    for (let i = 0; i < 80; i += 1) {
      s = await state();
      if (s.phase !== 'play') break;
      const called = new Set(s.round.deck.slice(0, s.round.drawn));
      const card = s.round.cards[aId]?.[0] ?? [];
      if (card.every((n, k) => k === 12 || called.has(n))) break;
      await api.skip();
      await settle(80);
    }
    const fullState = await state();
    const full = fullState.round.cards[aId]?.[0] ?? [];
    const already = new Set(fullState.round.daubs[aId]?.[0] ?? []); // the line stays daubed
    await daubLine(
      a.page,
      Array.from({ length: 25 }, (_, i) => i).filter((i) => !already.has(i)),
      full,
    );
    tv2Marks.push({ name: 'blackout-headline', at: Date.now(), before: 0.2, seconds: 8 });
    await a.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await a.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(8000);
    s = await state();
    expect(s.phase === 'bingo' && s.round.pattern === 'blackout', 'a blackout bingo');
    expect(
      (await tv2.page.getByText(/Sam's 1st blackout/).count()) === 1,
      'the TV headline says 1st blackout',
    );
    expect(
      (await b.page.getByRole('button', { name: /keep going/i }).count()) === 0 &&
        (await b.page.getByRole('button', { name: /finish the game/i }).count()) === 1,
      'a blackout on every card: only the end',
    );
    expect(s.wins[aId] === 6, 'a blackout after a line: 3 + 3');
    tv2Marks.push({ name: 'auto-end', at: Date.now(), before: 0.2, seconds: 8 });
    await settle(7000); // verdict at ≈ 9.4 s, read 3 s, then 2 s: the round ends by itself
    const room = (await api.state()).room;
    expect(
      room?.status === 'results' || room?.game?.state.phase.id === 'done',
      'a blackout on every card ends the round by itself',
    );
    await shots.shot(tv2.page, { group: G, phase: 'blackout-win', device: 'tv', role: 'stage' });
    await shots.shot(a.page, { group: G, phase: 'blackout-win', device: 'iphone', role: 'sam' });
    await shots.shot(b.page, {
      group: G,
      phase: 'blackout-win',
      device: 'iphone-se',
      role: 'priya',
    });
    await cutStrips(tv2, join(OUT, 'strips'), tv2Marks);
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

// Flow, edge cases, voice pacing, awards, recap and the 16-player state size (SPEC §8.4, §8.7,
// §8.10, §8.12, §8.13, §8.17, §8.19; P00 §8).
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { lotRequest, soldRequest } from '../server/speech';
import {
  FLIP_HOLD_MS,
  INTRO_MS,
  LOT_LEAD_MS,
  LOT_SILENT_MS,
  LOT_TAIL_MS,
  SOLD_HOLD_MS,
} from '../server/timing';
import type { State } from '../server/types';
import { bid, playThrough, send, setOutcome, skip, start, timer, walkTo } from './helpers';

describe('flow', () => {
  it('intro → (lot → bid → sold → flip) × lots → done, on deadlines alone', () => {
    let s = start(4, { lots: 5 });
    const seen: string[] = [s.phase.id];
    for (let i = 0; i < 200 && s.phase.id !== 'done'; i++) {
      s = timer(s);
      if (seen[seen.length - 1] !== s.phase.id) seen.push(s.phase.id);
    }
    expect(seen).toEqual([
      'intro',
      ...Array(5).fill(['lot', 'bid', 'sold', 'flip']).flat(),
      'done',
    ]);
    expect(game.results(s)?.ranking).toHaveLength(4);
  });

  it('the VIP skip moves every phase on, with the label the TV shows', () => {
    let s = start(3, { lots: 5 });
    const labels: string[] = [];
    while (s.phase.id !== 'done') {
      labels.push(game.tvView(s).vipSkipLabel ?? '');
      s = skip(s);
    }
    expect(labels.slice(0, 6)).toEqual([
      "Let's go",
      'Skip to bidding',
      'Close bidding',
      'Flip the card',
      'Next lot',
      'Skip to bidding',
    ]);
    expect(labels[labels.length - 1]).toBe('See results');
  });

  it('intro lasts 8 s; the lot without a voice 6 s; bidding `bidSeconds`', () => {
    let s = start(3, { reader: 'none', bidSeconds: 15 });
    expect(s.phase.deadline).toBe(s.phase.startedAt + INTRO_MS);
    s = timer(s);
    expect(s.phase.deadline).toBe(s.phase.startedAt + LOT_SILENT_MS);
    s = timer(s);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 15_000);
  });

  it('one connected player can still finish; a late joiner is a spectator; ties share the win', () => {
    let s = start(3, { lots: 5 });
    s = send(s, { type: 'player', now: s.phase.startedAt + 1, playerId: 'p2', connected: false });
    s = send(s, { type: 'player', now: s.phase.startedAt + 1, playerId: 'p3', connected: false });
    s = walkTo(s, 'bid');
    s = bid(s, 'p1', 10);
    expect(s.phase.id).toBe('sold'); // the only one connected has bid
    expect(game.controllerView(s, 'late').me.role).toBe('spectator');
    expect(bid(walkTo(start(3), 'bid'), 'late', 10).l.bids).toEqual({});
    const tied = walkTo(start(3, { lots: 5, reader: 'none' }), 'done');
    const results = game.results(tied);
    expect(results?.winnerIds.length).toBe(3); // nobody bid: everyone still has 100
    expect(results?.ranking.every((r) => r.rank === 1)).toBe(true);
  });

  it('a drop mid-phase never stalls: the deadline moves on, and they can come back', () => {
    let s = walkTo(start(3), 'bid');
    s = bid(s, 'p1', 20);
    s = send(s, { type: 'player', now: s.phase.startedAt + 5, playerId: 'p2', connected: false });
    expect(s.phase.id).toBe('bid');
    s = send(s, { type: 'player', now: s.phase.startedAt + 6, playerId: 'p2', connected: true });
    s = bid(bid(s, 'p2', 30), 'p3', 0);
    expect(s.l.winner).toBe('p2');
  });

  it('everyone idle: every lot goes unsold and the game ends in minutes', () => {
    let s = start(6, { lots: 12, bidSeconds: 40 });
    while (s.phase.id !== 'done') s = timer(s);
    expect(s.phase.startedAt - 1_000_000).toBeLessThan(12 * 60_000);
    expect(Object.values(s.coins).every((c) => c === 100)).toBe(true);
  });
});

describe('voice pacing', () => {
  it('a ready lot reading sets the card: lead + reading + 1 s', () => {
    let s = start(3);
    const key = lotRequest(s, 0)?.key ?? '';
    s = send(s, { type: 'speech', now: s.phase.startedAt + 100, key, ms: 3000 });
    s = timer(s);
    expect(s.phase.id).toBe('lot');
    expect(s.phase.deadline).toBe(s.phase.startedAt + LOT_LEAD_MS + 3000 + LOT_TAIL_MS);
    expect(game.tvView(s).voice).toEqual({
      url: `/api/speech/${key}.wav`,
      at: s.phase.startedAt + LOT_LEAD_MS,
    });
  });

  it('a late lot reading re-times the card; one later than 3 s is dropped', () => {
    const s = walkTo(start(3), 'lot');
    const key = lotRequest(s, 0)?.key ?? '';
    const t = s.phase.startedAt;
    const late = send(s, { type: 'speech', now: t + 1500, key, ms: 2000 });
    expect(late.phase.deadline).toBe(t + 1500 + 2000 + LOT_TAIL_MS);
    const tooLate = send(s, { type: 'speech', now: t + 3500, key, ms: 2000 });
    expect([tooLate.phase.deadline, game.tvView(tooLate).voice]).toEqual([t + LOT_SILENT_MS, null]);
  });

  it('the price reading plays on the stamp if it is ready, and the stamp waits for it', () => {
    let s = walkTo(start(2), 'bid');
    s = bid(bid(s, 'p1', 90), 'p2', 0);
    const key = soldRequest(s)?.key ?? '';
    expect(key).not.toBe('');
    s = send(s, { type: 'speech', now: s.phase.startedAt + 200, key, ms: 3000 });
    s = timer(s);
    expect([s.l.step, game.tvView(s).voice?.url]).toEqual([1, `/api/speech/${key}.wav`]);
    expect(s.phase.deadline! - (game.tvView(s).voice?.at ?? 0)).toBe(Math.max(SOLD_HOLD_MS, 3600));
  });

  it('the flip waits for its amount reading, and holds ~5 s without one', () => {
    let s = walkTo(start(2), 'bid');
    s = setOutcome(s, { type: 'gain', amount: 300, chance: 100 });
    s = walkTo(bid(bid(s, 'p1', 90), 'p2', 0), 'flip');
    const quiet = timer(s);
    expect(quiet.phase.deadline! - quiet.phase.startedAt).toBeGreaterThanOrEqual(FLIP_HOLD_MS);
    const key = (game.speech?.(s) ?? []).find((r) =>
      JSON.stringify(r.parts).includes('"Plus three hundred!"'),
    )?.key;
    expect(key).toBeDefined();
    const voiced = timer(
      send(s, { type: 'speech', now: s.phase.startedAt + 800, key: key ?? '', ms: 5000 }),
    );
    expect(voiced.l.voiceAt).not.toBeNull();
    expect(voiced.phase.deadline).toBeGreaterThanOrEqual((voiced.l.voiceAt ?? 0) + 5000);
  });

  it('no voice at all when the reader is none', () => {
    expect(game.speech?.(start(3, { reader: 'none' }))).toEqual([]);
  });
});

describe('results, awards, recap, size', () => {
  it('awards: high roller, bargain hunter, master thief, trap magnet, big spender; skipped when unearned', () => {
    let s = walkTo(start(3, { lots: 5 }), 'bid');
    s = setOutcome(s, { type: 'lose', amount: 40, chance: 100 });
    s = walkTo(bid(bid(bid(s, 'p1', 60), 'p2', 10), 'p3', 0), 'bid');
    s = setOutcome(s, { type: 'gain', amount: 200, chance: 100 });
    s = walkTo(bid(bid(bid(s, 'p1', 0), 'p2', 20), 'p3', 0), 'done');
    const awards = game
      .results(s)
      ?.awards.map((a) => `${a.id.split(':')[0]}=${a.playerId}`)
      .sort();
    expect(awards).toEqual([
      'bargain-hunter=p2',
      'big-spender=p1',
      'high-roller=p1',
      'trap-magnet=p1',
    ]);
    expect(game.results(s)?.scores).toEqual({ p1: 0, p2: 280, p3: 100 });
  });

  it('the recap lists every lot with its bids, winner, price, outcome and coins', () => {
    const states = playThrough(11, 4, { lots: 5 });
    const end = states[states.length - 1] as State;
    const history = states
      .filter((st, i) => i === 0 || st.phase.startedAt !== states[i - 1]?.phase.startedAt)
      .map((st) => ({ phase: st.phase.id, at: st.phase.startedAt, state: st }));
    const recap = game.recap?.(end, {
      players: Object.values(end.players),
      history,
      results: game.results(end),
    });
    expect(recap?.markdown).toMatch(/^# Blind Auction · \d{4}-\d{2}-\d{2}/);
    expect(recap?.markdown.match(/^## \d\./gm)).toHaveLength(5);
    expect(recap?.markdown).toContain('## Final coins');
  });

  it('16 players: state stays under 12 KB (and far under the 32 KB fail line); views under 4 KB', () => {
    let biggest = 0;
    let biggestView = 0;
    for (const s of playThrough(5, 16, { lots: 12, spicy: true, chaos: 'wild' })) {
      biggest = Math.max(biggest, JSON.stringify(s).length);
      biggestView = Math.max(
        biggestView,
        JSON.stringify(game.tvView(s)).length,
        JSON.stringify(game.controllerView(s, 'p1')).length,
      );
    }
    console.info(`blind-auction 16p: state ${biggest} B, largest view ${biggestView} B`);
    expect(biggest).toBeLessThan(12 * 1024);
    expect(biggestView).toBeLessThan(4 * 1024);
  });
});

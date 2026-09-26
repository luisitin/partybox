// Live events, continued (split from live.test.ts): keno, blackjack, every event word in Spanish,
// and the review fixes C3–C5.
import { describe, expect, it } from 'vitest';
import { drawEvent } from '../server/events';
import { tvView } from '../server/views';
import { LIVE_KINDS } from '../server/types';
import { seedRng } from '@partybox/game-sdk';
import { bet, send, start, walkTo } from './helpers';

describe('live events: keno', () => {
  const kenoAt = (): ReturnType<typeof start> => {
    let s = start(3, { rounds: 5 });
    const [round] = drawEvent('keno', seedRng(8), 1);
    s = {
      ...s,
      boxes: s.boxes.map((b, i) => (i === 1 ? { ...round, detail: [1, 2, 3, 4, 5] } : b)),
    };
    return walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
  };
  const spots = (s: ReturnType<typeof start>, id: string, n: number[]) =>
    send(s, {
      type: 'input',
      now: s.phase.startedAt + 50,
      playerId: id,
      input: { type: 'spots', spots: n },
    });

  it('no numbers, no stake; the stake pays by matches (0 / back / ×2.2 / ×30)', () => {
    let s = kenoAt();
    expect(bet(s, 'p1', 0, 10).notices['p1']?.code).toBe('spots');
    s = spots(spots(spots(s, 'p1', [1, 2, 3]), 'p2', [1, 9, 10]), 'p3', [11, 12, 13]);
    const before = { ...s.coins };
    s = bet(bet(bet(s, 'p1', 0, 10), 'p2', 0, 10), 'p3', 0, 10);
    s = walkTo(s, 'box');
    expect(s.coins['p1']).toBe((before['p1'] ?? 0) - 10 + 300);
    expect(s.coins['p2']).toBe(before['p2']);
    expect(s.coins['p3']).toBe((before['p3'] ?? 0) - 10);
  });
});

describe('live events: every word the server writes has its Spanish', () => {
  it('names, flavour lines and option labels of every event', async () => {
    const { STRINGS } = await import('../client/strings');
    const es = (STRINGS as { es: Record<string, string> }).es;
    const missing: string[] = [];
    for (const kind of LIVE_KINDS.filter((k) => k !== 'potato')) {
      let rng = seedRng(3);
      for (let i = 0; i < 6; i++) {
        const [round, next] = drawEvent(kind, rng, 1);
        rng = next;
        for (const text of [
          round.box.name,
          round.box.flavour,
          ...round.box.options.map((o) => o.label?.name ?? ''),
        ])
          if (text && !es[text]) missing.push(`${kind}: ${text}`);
      }
    }
    expect([...new Set(missing)]).toEqual([]);
  });
});

describe('live events: blackjack', () => {
  const bjAt = (): ReturnType<typeof start> => {
    let s = start(3, { rounds: 5 });
    const [round] = drawEvent('blackjack', seedRng(4), 1);
    s = { ...s, boxes: s.boxes.map((b, i) => (i === 1 ? round : b)) };
    return walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
  };
  const act = (s: ReturnType<typeof start>, id: string, type: 'hit' | 'stand') =>
    send(s, { type: 'input', now: s.phase.startedAt + 100, playerId: id, input: { type } });

  it('stakers are dealt two cards, the dealer one up; the hole card only shows at open', () => {
    let s = bjAt();
    s = bet(bet(bet(s, 'p1', 0, 10), 'p2', 0, 10), 'p3', 0, 0);
    expect(s.phase.id).toBe('hands');
    expect(s.r.hands?.['p1']).toHaveLength(2);
    expect(s.r.hands?.['p3']).toBeUndefined();
    expect(tvView(s).blackjack?.dealer).toHaveLength(1);
    s = act(act(s, 'p1', 'stand'), 'p2', 'stand');
    expect(s.phase.id).toBe('open');
    expect((tvView(s).blackjack?.dealer.length ?? 0) >= 2).toBe(true);
  });

  it('pays: bust 0, beat the dealer ×2, push back, natural ×2.5', async () => {
    const { blackjackReturn, total } = await import('../server/phases/hands');
    const base = bjAt();
    const at = (hand: number[], dealer: number[]) =>
      blackjackReturn({ ...base, r: { ...base.r, hands: { p1: hand }, dealer } }, 'p1', 10);
    // cards: rank = n % 13 (0 = A, 9 = 10, 12 = K)
    expect(total([0, 12])).toBe(21);
    expect(at([9, 12, 4], [9, 7])).toBe(0); // 25: bust
    expect(at([9, 8], [9, 6])).toBe(20); // 19 beats 17
    expect(at([9, 7], [9, 7])).toBe(10); // push
    expect(at([0, 12], [9, 8])).toBe(25); // natural
    expect(at([9, 6], [9, 5, 9])).toBe(20); // dealer busts
  });
});

describe('review C3–C5', () => {
  it('C3: a pause during hot potato does not make it pop on resume', async () => {
    const { potatoOptions } = await import('../server/events');
    let s = start(4, { rounds: 5 });
    const names = s.seats.map((id) => s.players[id]?.name ?? id);
    const [round] = drawEvent('potato', seedRng(2), 1);
    s = {
      ...s,
      boxes: s.boxes.map((b, i) =>
        i === 1 ? { ...round, box: { ...round.box, options: potatoOptions(names) } } : b,
      ),
    };
    s = walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
    s = walkTo(bet(s, 'p1', 1, 10), 'potato');
    const popAt = s.r.popAt ?? 0;
    const at = s.phase.startedAt;
    s = send(s, { type: 'vip', now: at + 100, action: 'pause' });
    s = send(s, { type: 'vip', now: at + 100 + 60_000, action: 'resume' });
    expect(s.phase.id).toBe('potato');
    expect(s.r.popAt).toBe(popAt + 60_000);
  });

  it('C5: keno stats count only paying calls', () => {
    let s = start(3, { rounds: 5 });
    const [round] = drawEvent('keno', seedRng(8), 1);
    s = {
      ...s,
      boxes: s.boxes.map((b, i) => (i === 1 ? { ...round, detail: [1, 2, 3, 4, 5] } : b)),
    };
    s = walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
    for (const [id, n] of [
      ['p1', [11, 12, 13]],
      ['p2', [1, 2, 13]],
      ['p3', [14, 15, 16]],
    ] as const)
      s = send(s, {
        type: 'input',
        now: s.phase.startedAt + 50,
        playerId: id,
        input: { type: 'spots', spots: [...n] },
      });
    s = bet(bet(bet(s, 'p1', 0, 10), 'p2', 0, 10), 'p3', 0, 10);
    s = walkTo(s, 'box');
    expect(s.stats['p1']?.calls).toBe(0);
    expect(s.stats['p2']?.calls).toBe(1);
    expect(s.stats['p3']?.lost).toBe(10);
  });
});

// Awards, results, recap and budgets (README "Scoring"; SPEC §6.6, §6.8, §6.16).
const jsonSize = (value: unknown): number => new TextEncoder().encode(JSON.stringify(value)).length;
import { createRng } from '@partybox/game-sdk';
import { describe, expect, it } from 'vitest';
import { awards } from '../server/scoring';
import { game } from '../server/index';
import { recap, isoDay } from '../server/recap';
import type { State } from '../server/types';
import { order, phone, players, start, throughHive, timer, toRank, tv } from './helpers';

/** Plays `rounds` rounds where a and b always send the pack order and c reverses it. */
function play(rounds = 3): {
  final: State;
  history: { phase: string; at: number; state: State }[];
} {
  let s = toRank(start({ rounds }));
  const history: { phase: string; at: number; state: State }[] = [];
  for (let r = 0; r < rounds; r++) {
    s = order(order(order(s, 'a'), 'b'), 'c', [4, 3, 2, 1, 0]);
    s = throughHive(s);
    history.push({ phase: 'score', at: s.phase.startedAt, state: s });
    s = timer(s);
  }
  return { final: s, history };
}

describe('awards', () => {
  it('Queen Bee, Hive Mind, Odd Bug and Twin Brains; ties share', () => {
    const { final } = play();
    const list = awards(final);
    const who = (prefix: string): string[] =>
      list
        .filter((a) => a.id.startsWith(prefix))
        .map((a) => a.playerId)
        .sort();
    // a and b match the hive (it is their order) every round; c is the odd one out.
    expect(who('queen')).toEqual(['a', 'b']);
    expect(who('mind')).toEqual(['a', 'b']);
    expect(who('odd')).toEqual(['c']);
    expect(who('twins')).toEqual(['a', 'b']);
    expect(list.find((a) => a.id === 'twins:a')?.description).toBe(
      '15 things in the same spot as Ben',
    );
    expect(list.find((a) => a.id === 'queen:a')?.description).toBe('Top scorer in 3 rounds');
  });

  it('an award nobody earned is skipped', () => {
    const s = vip(toRank(start()));
    expect(game.results(s)?.awards).toEqual([]);
  });

  it('results carry every player with a finite score', () => {
    const { final } = play();
    const res = game.results(final);
    expect(res?.ranking.map((r) => r.playerId).sort()).toEqual(['a', 'b', 'c']);
    expect(res?.scores).toEqual({ a: 36 + 0, b: 36, c: expect.any(Number) });
    expect(res?.winnerIds.sort()).toEqual(['a', 'b']);
  });
});

function vip(s: State): State {
  return game.reduce(s, { type: 'vip', now: s.phase.startedAt + 1, action: 'end' });
}

describe('the Queen Bee breakdown', () => {
  it('shows one line only when every queen scored the same way', () => {
    const { history } = play(3);
    const at = history[0]!.state;
    const tie = (a: [number, number], b: [number, number]): State => ({
      ...at,
      q: {
        ...at.q,
        queens: ['a', 'b'],
        delta: {
          a: { pts: a[0] * 2 + a[1], exact: a[0], near: a[1], perfect: false },
          b: { pts: b[0] * 2 + b[1], exact: b[0], near: b[1], perfect: false },
          c: { pts: 0, exact: 0, near: 0, perfect: false },
        },
      },
    });
    // 4 points two ways: 2 exact + 0 near vs 1 exact + 2 near — no single line fits both.
    expect(tv(tie([2, 0], [1, 2])).score?.queenDetail).toBeNull();
    expect(tv(tie([1, 2], [1, 2])).score?.queenDetail).toEqual({ exact: 1, near: 2 });
  });
});

describe('recap', () => {
  it('lists each question with the hive, every order and the queens', () => {
    const { final, history } = play(3);
    const res = game.results(final);
    const md =
      recap(final, {
        players: Object.values(final.players),
        history,
        results: res,
      })?.markdown ?? '';
    expect(md).toMatch(/^# Hive Rank · \d{4}-\d{2}-\d{2}/);
    expect(md).toContain(`## Round 1 · ${final.questions[0]?.prompt}`);
    expect(md).toContain('**The hive:** 1. ');
    expect(md).toContain('- Cleo: ');
    expect(md).toContain('👑 Queen Bee: Ana, Ben');
    expect(md).toContain('## Awards');
    expect(isoDay(0)).toBe('1970-01-01');
    expect(isoDay(1_790_000_000_000)).toBe('2026-09-21');
  });
});

describe('budgets at 16 players', () => {
  it('state under 20 KB (fails above 40 KB); views under 4 KB', () => {
    const roster = players(16);
    let s = toRank(start({ rounds: 10, reader: 'jessica' }, 1, roster));
    const rng = createRng(1);
    let maxState = 0;
    let maxView = 0;
    for (let r = 0; r < 10 && s.phase.id !== 'done'; r++) {
      for (const p of roster) {
        const input = game.bot.sampleInput(s, p.id, rng) ?? {
          type: 'order' as const,
          items: s.questions[s.q.n - 1]?.items.map((i) => i.id) ?? [],
        };
        s = game.reduce(s, { type: 'input', now: s.phase.startedAt + 500, playerId: p.id, input });
      }
      for (const req of game.speech?.(s) ?? [])
        s = game.reduce(s, { type: 'speech', now: s.phase.startedAt + 1, key: req.key, ms: 1200 });
      while (s.phase.id === 'hive' || s.phase.id === 'score') {
        maxState = Math.max(maxState, jsonSize(s));
        maxView = Math.max(maxView, jsonSize(tv(s)), jsonSize(phone(s, 'p01')));
        s = timer(s);
      }
    }
    console.log(`hive-rank @16 players: state ≤ ${maxState} B, view ≤ ${maxView} B`);
    expect(maxState).toBeLessThan(40_000);
    expect(maxState).toBeLessThan(20_000);
    expect(maxView).toBeLessThan(4096);
  });
});

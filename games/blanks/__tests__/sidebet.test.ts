// I-149 (preview branch): judge mode's side bet.
import { describe, expect, it } from 'vitest';
import { awardsFor } from '../server/scoring';
import { playAll, readAll, reduce, start, timer, toAnswer, vote } from './helpers';
import type { State } from '../server/types';

function guess(s: State, playerId: string, slot: number): State {
  return reduce(s, {
    type: 'input',
    now: s.phase.startedAt + 500,
    playerId,
    input: { type: 'guess', slot },
  });
}

describe('I-149 side bet', () => {
  it('a correct call earns half a point, a wrong call nothing, and the judge cannot bet', () => {
    let s = readAll(playAll(toAnswer(start({ judge: 'czar', players: 4 }))));
    expect(s.phase.id).toBe('judge');
    const czar = s.czarId as string;
    const [a, b, c] = Object.keys(s.players)
      .filter((id) => id !== czar)
      .sort() as [string, string, string];
    const cSlot = s.slots.indexOf(c);
    const aSlot = s.slots.indexOf(a);
    s = guess(s, a, cSlot); // right
    s = guess(s, b, aSlot); // wrong
    s = guess(s, czar, cSlot); // the judge cannot bet
    s = guess(s, c, cSlot); // nor on their own card
    expect(s.guesses).toEqual({ [a]: cSlot, [b]: aSlot });
    s = vote(s, czar, cSlot);
    if (s.phase.id === 'judge') s = timer(s); // the "that's the pick" beat, as voteAll plays it out
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual([c]);
    expect(s.scores[a]).toBe(0.5);
    expect(s.scores[b] ?? 0).toBe(0);
    // I-149 C: the call is counted, and the night's award finds it
    expect(s.calls).toEqual({ [a]: 1 });
    expect(awardsFor(s).find((w) => w.id === 'read-the-room')?.playerId).toBe(a);
  });

  it('closes the bets the moment the judge takes a card (a late bet does not pay)', () => {
    let s = readAll(playAll(toAnswer(start({ judge: 'czar', players: 4 }))));
    const czar = s.czarId as string;
    const [a] = Object.keys(s.players)
      .filter((id) => id !== czar)
      .sort() as [string];
    const pick = s.slots.findIndex((id) => id !== a);
    s = vote(s, czar, pick);
    expect(s.phase.id).toBe('judge'); // the beat before the result
    s = guess(s, a, pick);
    expect(s.guesses?.[a]).toBeUndefined();
    s = timer(s);
    expect(s.scores[a] ?? 0).toBe(0);
  });
});

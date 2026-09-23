// I-143 C (preview branch): "I'll read" works exactly when the phone offers it.
import { describe, expect, it } from 'vitest';
import { connect, cv, playAll, reduce, start, toAnswer } from './helpers';
import type { State } from '../server/types';

const take = (s: State, playerId: string): State =>
  reduce(s, {
    type: 'input',
    now: s.phase.startedAt + 300,
    playerId,
    input: { type: 'takeReading' },
  });

describe('I-143 C take the reading', () => {
  it('is closed while the named reader is here, and open to players when they drop', () => {
    let s = playAll(toAnswer(start({ players: 4 })));
    expect(s.phase.id).toBe('reveal');
    const named = s.readerId as string;
    const other = Object.keys(s.players).find((id) => id !== named) as string;
    expect(cv(s, other).readingOpen).toBe(false);
    expect(take(s, other).readerId).toBe(named); // refused: the reader is here
    s = connect(s, named, false, s.phase.startedAt + 100);
    expect(s.phase.id).toBe('reveal');
    expect(cv(s, other).readingOpen).toBe(true);
    expect(cv(s, 'lou').readingOpen).toBe(false); // a spectator is never offered it
    s = take(s, other);
    expect(s.readerId).toBe(other);
    const third = Object.keys(s.players).find((id) => id !== named && id !== other) as string;
    expect(cv(s, third).readingOpen).toBe(false);
    expect(take(s, third).readerId).toBe(other); // the first tap keeps it
  });
});

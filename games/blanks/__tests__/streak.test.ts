// The streak on the round card (README "Scoring"): one player winning outright, round after round.
import { describe, expect, it } from 'vitest';
import { awardsFor } from '../server/scoring';
import { RANDO } from '../server/types';
import type { State } from '../server/types';
import { playRound, start, timer, tv } from './helpers';

describe('streaks', () => {
  it('counts rounds won in a row, and the round card says so from the second', () => {
    // Everyone piles onto the first slot every round; the same seat wins it each time only if the
    // shuffle keeps them there, so follow the state rather than assuming.
    let s: State = start({ rounds: 6, players: 4 });
    s = timer(playRound(s, () => 0));
    expect(s.stats.streak?.runs).toBe(1);
    // One round is not worth saying out loud yet.
    expect(tv(s).streak).toBeNull();

    const first = s.stats.streak?.playerId ?? '';
    // The hand and the slots are reshuffled every round, so the first slot may belong to someone
    // else this time: assert the rule, not the shuffle.
    s = timer(playRound(s, () => 0));
    const again = s.stats.streak;
    expect(again).not.toBeNull();
    if (again?.playerId === first) {
      expect(again.runs).toBe(2);
      expect(tv(s).streak?.runs).toBe(2);
      expect(tv(s).streak?.name).toBe(s.players[first]?.name);
    } else {
      // Somebody else took it: a fresh run of one, and nothing on the card yet.
      expect(again?.runs).toBe(1);
      expect(tv(s).streak).toBeNull();
    }
  });

  it('a shared round ends it', () => {
    let s: State = start({ rounds: 6, players: 4 });
    s = timer(playRound(s, () => 0));
    expect(s.stats.streak?.runs).toBe(1);
    // Two cards take two votes each: the point is shared, so nobody is on a run.
    const ids = Object.keys(s.players).sort();
    s = timer(playRound(s, (voter) => (ids.indexOf(voter) % 2 === 0 ? 0 : 1)));
    if (s.winners.length > 1) expect(s.stats.streak).toBeNull();
  });

  it("Rando's round pays nobody and ends it", () => {
    let s: State = start({ rounds: 6, players: 4, rando: true });
    s = timer(playRound(s, () => 0));
    const before = s.stats.streak;
    expect(before?.runs).toBeGreaterThanOrEqual(1);
    // Everyone votes for the phantom player's card.
    s = timer(playRound(s, () => Math.max(0, s.slots.indexOf(RANDO))));
    if (s.winners.length === 1 && s.winners[0] === RANDO) expect(s.stats.streak).toBeNull();
  });
});

describe('the run award', () => {
  it('keeps the longest run of the night, even after it ends', () => {
    let s: State = start({ rounds: 6, players: 4 });
    for (let i = 0; i < 3; i += 1) s = timer(playRound(s, () => 0));
    const best = s.stats.bestRun;
    expect(best).not.toBeNull();
    expect(best?.runs).toBeGreaterThanOrEqual(s.stats.streak?.runs ?? 0);
    if ((best?.runs ?? 0) >= 2) {
      const award = awardsFor(s).find((a) => a.id === 'on-a-roll');
      expect(award?.playerId).toBe(best?.playerId);
      expect(award?.description).toBe(`${best?.runs} rounds in a row`);
    } else {
      expect(awardsFor(s).some((a) => a.id === 'on-a-roll')).toBe(false);
    }
  });
});

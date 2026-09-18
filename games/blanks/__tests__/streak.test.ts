// The streak on the round card (README "Scoring"): one player winning outright, round after round.
import { describe, expect, it } from 'vitest';
import { awardsFor } from '../server/scoring';
import { RANDO } from '../server/types';
import type { State } from '../server/types';
import { connect, playRound, start, timer, tv } from './helpers';

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

  it("Rando's round pays nobody and ends a run", () => {
    // Start from a state that already has a run going, so the round under test is the only
    // variable — which card the deal hands out must not decide whether this passes.
    const fresh = start({ rounds: 6, players: 4, rando: true });
    const hot: State = {
      ...fresh,
      stats: { ...fresh.stats, streak: { playerId: Object.keys(fresh.players)[0] ?? '', runs: 3 } },
    };
    const played = playRound(hot, (voter) => {
      void voter;
      return 0;
    });
    // Everyone votes for the phantom player's card if it is on the table this round.
    const randoSlot = played.slots.indexOf(RANDO);
    const s = randoSlot === -1 ? played : timer(playRound(hot, () => randoSlot));
    if (s.winners.length === 1 && s.winners[0] === RANDO) {
      expect(s.stats.streak).toBeNull();
      expect(s.scores[RANDO]).toBeUndefined();
    } else {
      // Whoever did win outright starts their own run of one; a shared round leaves none.
      expect(s.stats.streak?.runs ?? 0).toBeLessThanOrEqual(1);
    }
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

describe('the reader (vote mode)', () => {
  it('rotates by seat and is nobody in czar mode', () => {
    let s: State = start({ rounds: 6, players: 4 });
    const first = s.readerId;
    expect(first).not.toBeNull();
    // The reveal names them; the round card does not (it is not their moment yet).
    s = timer(playRound(s, () => 0));
    expect(s.readerId).not.toBeNull();
    expect(s.readerId).not.toBe(first);
    const czar = start({ rounds: 6, players: 4, judge: 'czar' });
    expect(czar.readerId).toBeNull();
  });

  it('skips a seat that has dropped', () => {
    const s: State = start({ rounds: 6, players: 4 });
    const seat = s.order[(s.round - 1) % s.order.length] ?? '';
    const gone = connect(s, seat, false);
    const after = timer(playRound(gone, () => 0));
    expect(after.readerId).not.toBe(seat);
  });
});

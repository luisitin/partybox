// Guessing by pointing (SPEC §9.7): majority thresholds, plurality and ties at the deadline, End
// turn only after a flip, the recount on a drop, and bots that never lead a team with people on it.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { game } from '../server/index';
import { needed } from '../server/pointing';
import { clue, drop, plainKey, rig, send, start, tick } from './kit';
import type { State } from '../server/types';

/** Sun = spymaster p1 + `g` guessers; moon = the rest. In `guess` after a clue of 2. */
function guessing(g: number, bots = 0): State {
  const n = 2 * (g + 1);
  let s = start(n, { teamPick: 'random' }, 1, bots);
  const ids = s.seats;
  const sun = ids.slice(0, g + 1);
  s = rig(s, plainKey(), sun, ids.slice(g + 1));
  return clue(s, 2);
}

describe('majority', () => {
  it.each([
    [1, 1],
    [2, 2],
    [3, 2],
    [4, 3],
  ])('%i guessers need %i pointers', (g, want) => {
    expect(needed(g)).toBe(want);
    let s = guessing(g);
    for (let i = 0; i < want; i++) {
      expect(s.phase.id).toBe('guess');
      s = send(s, `p${i + 2}`, { type: 'point', target: 0 });
    }
    expect(s.phase.id).toBe('flip');
    expect(s.turn.flip?.card).toBe(0);
  });

  it('two guessers must agree: split pointers flip nothing', () => {
    let s = guessing(2);
    s = send(s, 'p2', { type: 'point', target: 0 });
    s = send(s, 'p3', { type: 'point', target: 1 });
    expect(s.phase.id).toBe('guess');
  });

  it('the spymaster and the other team never count', () => {
    let s = guessing(2);
    s = send(s, 'p1', { type: 'point', target: 0 });
    s = send(s, 'p4', { type: 'point', target: 0 });
    expect(s.turn.pointers).toEqual({});
  });
});

describe('the step deadline', () => {
  it('the single most-pointed card flips', () => {
    let s = guessing(4);
    s = send(s, 'p2', { type: 'point', target: 3 });
    s = send(s, 'p3', { type: 'point', target: 3 });
    s = send(s, 'p4', { type: 'point', target: 5 });
    s = tick(s);
    expect(s.phase.id).toBe('flip');
    expect(s.turn.flip?.card).toBe(3);
  });

  it('a tie or silence ends the turn without a flip', () => {
    let s = guessing(4);
    s = send(s, 'p2', { type: 'point', target: 3 });
    s = send(s, 'p3', { type: 'point', target: 5 });
    s = tick(s);
    expect(s.phase.id).toBe('turn-end');
    expect(s.turn.ended).toBe('timeout');
    expect(s.flipped.every((f) => f === 0)).toBe(true);
    const quiet = tick(guessing(3));
    expect(quiet.phase.id).toBe('turn-end');
  });
});

describe('End turn', () => {
  it('is refused before the first flip and works after it', () => {
    let s = guessing(1);
    s = send(s, 'p2', { type: 'point', target: 'end' });
    expect(s.phase.id).toBe('guess');
    s = send(s, 'p2', { type: 'point', target: 0 });
    s = tick(tick(s));
    expect(s.phase.id).toBe('guess');
    expect(game.controllerView(s, 'p2').canEnd).toBe(true);
    s = send(s, 'p2', { type: 'point', target: 'end' });
    expect(s.phase.id).toBe('turn-end');
    expect(s.turn.ended).toBe('stop');
  });
});

describe('drops', () => {
  it("a dropped guesser's pointer goes and the majority is recounted at once", () => {
    let s = guessing(3);
    s = send(s, 'p2', { type: 'point', target: 0 });
    s = send(s, 'p3', { type: 'point', target: 1 });
    expect(s.phase.id).toBe('guess');
    // 3 guessers → 2 needed; p3 drops → 2 guessers, still 2 needed; p4 drops → 1 guesser, p2 alone flips.
    s = drop(s, 'p3');
    expect(s.turn.pointers).toEqual({ p2: 0 });
    expect(s.phase.id).toBe('guess');
    s = drop(s, 'p4');
    expect(s.phase.id).toBe('flip');
    expect(s.turn.flip?.card).toBe(0);
  });

  it('a drop during a pause is recounted on resume (reviewer [12ea6b])', () => {
    let s = guessing(3);
    s = send(s, 'p2', { type: 'point', target: 0 });
    s = send(s, 'p3', { type: 'point', target: 1 });
    const vip = (x: State, action: 'pause' | 'resume'): State =>
      game.reduce(x, { type: 'vip', now: x.phase.startedAt + 20, action });
    s = vip(s, 'pause');
    s = drop(s, 'p3');
    s = drop(s, 'p4');
    // Paused: p2 alone would carry it, but nothing flips until the room resumes.
    expect(s.phase.id).toBe('guess');
    s = vip(s, 'resume');
    expect(s.phase.id).toBe('flip');
    expect(s.turn.flip?.card).toBe(0);
  });

  it('a team with no connected guessers times out without a flip', () => {
    let s = guessing(1);
    s = drop(s, 'p2');
    s = tick(s);
    expect(s.phase.id).toBe('turn-end');
  });
});

describe('bots follow people', () => {
  it('never point first on a mixed team, then copy the people', () => {
    // 8 players, the last 2 bots: sun = p1 (spy) p2 p3 p4 with p4 a person; make p3/p4 bots by rigging.
    let s = guessing(3);
    s = {
      ...s,
      players: {
        ...s.players,
        p3: { ...s.players.p3!, bot: true },
        p4: { ...s.players.p4!, bot: true },
      },
    };
    const rng = createRng(5);
    expect(game.bot.sampleInput(s, 'p3', rng)).toBeNull();
    s = send(s, 'p2', { type: 'point', target: 7 });
    expect(game.bot.sampleInput(s, 'p3', rng)).toEqual({ type: 'point', target: 7 });
  });

  it('lead on an all-bot team', () => {
    let s = guessing(2, 0);
    s = {
      ...s,
      players: {
        ...s.players,
        p2: { ...s.players.p2!, bot: true },
        p3: { ...s.players.p3!, bot: true },
      },
    };
    // ZZYZX matches no theme and no hint, and End turn is not open yet: a first guess is owed, so
    // every seed points at a card (a person's off-pack clue used to stall the turn, session-c #2).
    for (let seed = 1; seed <= 20; seed++) {
      const input = game.bot.sampleInput(s, 'p2', createRng(seed));
      expect(input?.type).toBe('point');
      if (input?.type === 'point') expect(typeof input.target).toBe('number');
    }
  });
});

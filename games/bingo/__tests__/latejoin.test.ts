// I-134 B (preview branch): Bingo deals a mid-game joiner in at its next round.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { enterIntro } from '../server/phases/intro';
import type { State } from '../server/types';
import { start, timer } from './helpers';

const join = (s: State, connected = true): State =>
  game.reduce(s, {
    type: 'player',
    now: s.phase.startedAt + 100,
    playerId: 'lou',
    connected,
    joining: { name: 'Lou', avatarId: 'cat' },
  });

describe('I-134 B late join', () => {
  it('holds a joiner until the next deal, then deals them in like everyone else', () => {
    let s = timer(start({ rounds: 3 })); // round 1: intro → play
    expect(s.phase.id).toBe('play');
    s = join(s);
    expect(s.players['lou']).toBeUndefined();
    expect(s.joining?.['lou']?.name).toBe('Lou');
    expect(game.controllerView(s, 'lou').spectator?.joinAt).toBe("you're in at round 2 — the next deal");
    const next = enterIntro(s, 2, s.phase.startedAt + 1000);
    expect(next.players['lou']?.connected).toBe(true);
    expect(next.round.cards['lou']).toHaveLength(1);
    expect(next.wins['lou']).toBe(0);
    expect(next.joining).toEqual({});
  });

  it('a joiner who leaves before the deal is not dealt in', () => {
    let s = join(timer(start({ rounds: 3 })));
    s = join(s, false);
    expect(s.joining).toEqual({});
    expect(enterIntro(s, 2, s.phase.startedAt + 1000).players['lou']).toBeUndefined();
  });

  it('on the last round the line points at the next game', () => {
    const s = join(timer(start({ rounds: 1 })));
    expect(game.controllerView(s, 'lou').spectator?.joinAt).toBe("you're in when the next game starts");
  });
});

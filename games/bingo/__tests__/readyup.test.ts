// The card-pick step (loop 344 — the owner: more time to swap, or a ready-up): the intro waits up
// to INTRO_MS for everyone with cards to tap Ready; once they have, the first number is
// PICKED_HOLD_MS away (no count-in, ADR-053) and never sooner than the deal plus that hold. Bots and the disconnected
// count as ready; a swap after Ready is refused.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { INTRO_BREATH_MS, INTRO_MS, PICKED_HOLD_MS, introMinMs } from '../server/types';
import { PLAYERS, T0, input, start, timer } from './helpers';

const ready = (s: ReturnType<typeof start>, id: string, now: number) =>
  input(s, id, { type: 'ready' }, now);

describe('the card-pick step', () => {
  it('waits up to INTRO_MS; the first number comes on the deadline when nobody is ready', () => {
    const s = start();
    expect(s.phase.id).toBe('intro');
    expect(s.phase.deadline).toBe(T0 + INTRO_MS);
    expect(game.tvView(s).waitingOn).toEqual(['Ana', 'Ben', 'Cleo']);
    expect(timer(s).phase.id).toBe('play');
  });

  it('everyone picked early: the first number waits for the deal plus the hold, never sooner', () => {
    let s = ready(start(), 'a', T0 + 800);
    expect(game.tvView(s).waitingOn).toEqual(['Ben', 'Cleo']);
    expect(game.controllerView(s, 'a').ready).toBe(true);
    expect(game.controllerView(s, 'b').ready).toBe(false);
    expect(s.phase.deadline).toBe(T0 + INTRO_MS); // still waiting on two
    s = ready(s, 'b', T0 + 1000);
    s = ready(s, 'c', T0 + 1200);
    expect(game.tvView(s).waitingOn).toEqual([]);
    expect(s.phase.deadline).toBe(T0 + introMinMs(1)); // max(1.2 s + 1.4 s, the deal + 1.4 s)
    expect(introMinMs(1)).toBeGreaterThanOrEqual(2_900); // one card: ~3 s (ADR-053: no count-in)
    expect(introMinMs(4)).toBeGreaterThan(introMinMs(1) + 2_900); // ~1 s a card
    expect(timer(s).phase.id).toBe('play');
  });

  it('everyone ready late: the first number is PICKED_HOLD_MS away', () => {
    let s = ready(start(), 'a', T0 + 9000);
    s = ready(s, 'b', T0 + 9000);
    s = ready(s, 'c', T0 + 10_000);
    expect(s.phase.deadline).toBe(T0 + 10_000 + INTRO_BREATH_MS + PICKED_HOLD_MS);
  });

  it('a ready phone can no longer swap; a spectator or a stranger cannot be ready', () => {
    let s = ready(start(), 'a', T0 + 800);
    const cards = s.round.cards['a'];
    s = input(s, 'a', { type: 'swap', card: 0 });
    expect(s.round.cards['a']).toBe(cards);
    expect(ready(s, 'ghost', T0 + 900)).toBe(s);
    expect(ready(s, 'a', T0 + 900)).toBe(s); // once
  });

  it('bots count as ready; a straggler dropping out settles it for the rest', () => {
    const withBot = game.init({
      players: [
        ...PLAYERS,
        { id: 'z', name: 'Bot', avatarId: 'robot', connected: true, bot: true },
      ],
      settings: { rounds: 1, round1: 'line', callSeconds: 6 },
      seed: 1,
      now: T0,
    });
    expect(game.tvView(withBot).waitingOn).toEqual(['Ana', 'Ben', 'Cleo']);
    expect(game.tvView(withBot).players.find((p) => p.id === 'z')?.status).toBe('submitted');
    let s = ready(withBot, 'a', T0 + 6000);
    s = ready(s, 'b', T0 + 6000);
    expect(s.phase.deadline).toBe(T0 + INTRO_MS); // Cleo still picking
    const gone = game.reduce(s, {
      type: 'player',
      now: T0 + 7000,
      playerId: 'c',
      connected: false,
    });
    expect(game.tvView(gone).waitingOn).toEqual([]);
    expect(gone.phase.deadline).toBe(T0 + 7000 + INTRO_BREATH_MS + PICKED_HOLD_MS);
  });

  it('the last one picking is told so — never a lone player, never once ready', () => {
    let s = ready(start(), 'a', T0 + 800);
    expect(game.controllerView(s, 'c').lastOne).toBe(false); // two still picking
    s = ready(s, 'b', T0 + 900);
    expect(game.controllerView(s, 'c').lastOne).toBe(true);
    expect(game.controllerView(s, 'a').lastOne).toBe(false);
    expect(game.controllerView(ready(s, 'c', T0 + 1000), 'c').lastOne).toBe(false);
    const solo = game.init({
      players: [PLAYERS[0]!],
      settings: { rounds: 1, round1: 'line', callSeconds: 6 },
      seed: 1,
      now: T0,
    });
    expect(game.controllerView(solo, 'a').lastOne).toBe(false);
  });

  it('the roster: ready players carry the ✓, the rest are active', () => {
    const s = ready(start(), 'b', T0 + 800);
    const status = (id: string) => game.tvView(s).players.find((p) => p.id === id)?.status;
    expect(status('b')).toBe('submitted');
    expect(status('a')).toBe('active');
  });
});

// I-134 A: a phone with no card (joined mid-game) is watching the game, not locked out of it — its
// view carries the live call; a player's view carries none.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { callUntil, start } from './helpers';

describe('the spectator line', () => {
  it('shows the live call to a phone without a card, and nothing to a player', () => {
    const s = callUntil(start({ rounds: 1 }), 'a', [0]);
    const watcher = game.controllerView(s, 'late');
    expect(watcher.spectator?.line).toMatch(/^[BINGO] \d+ — .+/);
    expect(game.controllerView(s, 'a').spectator).toBeUndefined();
  });
});

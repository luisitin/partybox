// I-141 (the owner's note): "Cards dealt" — 7 / 10 / 12 / 15 white cards a hand. The deal, the
// refill after a round and a new hand all follow the room's size, and half of any hand is good.
import { describe, expect, it } from 'vitest';
import { reduce } from '../server/flow';
import { game } from '../server/index';
import { goodFloor } from '../server/deal';
import { blackCard, whiteTier } from '../server/content';
import type { State } from '../server/types';
import { PLAYERS, T0, playRound, timer, toAnswer } from './helpers';

function startWith(handSize: string): State {
  return game.init({
    players: PLAYERS.slice(0, 4),
    settings: { rounds: 3, answerSeconds: 60, judge: 'vote', decks: 'mild', timed: true, handSize },
    seed: 3,
    now: T0,
  });
}

describe('cards dealt', () => {
  it('reads the setting, and a missing or unknown one is ten', () => {
    expect(startWith('7').settings.handSize).toBe(7);
    expect(startWith('15').settings.handSize).toBe(15);
    expect(startWith('9').settings.handSize).toBe(10);
  });

  it.each([7, 12, 15])('deals, refills and redraws %i-card hands, half of them good', (size) => {
    let s = startWith(String(size));
    for (const id of Object.keys(s.players)) {
      expect(s.hands[id]).toHaveLength(size);
      const good = (s.hands[id] ?? []).filter((c) => whiteTier(c) >= 3).length;
      expect(good).toBeGreaterThanOrEqual(goodFloor(size));
    }
    s = toAnswer(s);
    const draw = blackCard(s.blackId).draw;
    const redrawn = reduce(s, {
      type: 'input',
      now: s.phase.startedAt + 500,
      playerId: 'ana',
      input: { type: 'redraw' },
    });
    expect(redrawn.hands['ana']).toHaveLength(size + draw);
    s = timer(playRound(s));
    for (const id of Object.keys(s.players)) expect(s.hands[id]).toHaveLength(size);
  });
});

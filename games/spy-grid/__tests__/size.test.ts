// Budgets (SPEC §9.14, Part 00 §2.6): state under 24 KB at 16 players (fails above 48 KB), views
// under 4 KB, logged; a full 16-player game with bots and three rounds.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { game } from '../server/index';
import { start } from './kit';
import type { State } from '../server/types';

function playOut(s0: State, seed: number): { max: number; maxView: number; state: State } {
  const rng = createRng(seed);
  let s = s0;
  let max = 0;
  let maxView = 0;
  for (let step = 0; step < 4000 && s.phase.id !== 'done'; step++) {
    let acted = false;
    for (const id of Object.keys(s.players)) {
      const input = game.bot.sampleInput(s, id, rng);
      if (input) {
        s = game.reduce(s, { type: 'input', now: s.phase.startedAt + 50, playerId: id, input });
        acted = true;
      }
    }
    if (!acted)
      s = game.reduce(s, {
        type: 'timer',
        now: s.phase.deadline ?? s.phase.startedAt,
        phaseId: s.phase.id,
        startedAt: s.phase.startedAt,
      });
    max = Math.max(max, JSON.stringify(s).length);
    for (const id of Object.keys(s.players))
      maxView = Math.max(maxView, JSON.stringify(game.controllerView(s, id)).length);
    maxView = Math.max(maxView, JSON.stringify(game.tvView(s)).length);
  }
  return { max, maxView, state: s };
}

describe('budgets at 16 players', () => {
  it('state stays under 24 KB and views under 4 KB through three rounds of bots', () => {
    const { max, maxView, state } = playOut(start(16, { teamPick: 'random', rounds: 3 }, 4, 16), 4);
    console.log(`spy-grid 16 players: state max ${max} B, view max ${maxView} B`);
    expect(state.phase.id).toBe('done');
    expect(max).toBeLessThan(24 * 1024);
    expect(maxView).toBeLessThan(4096);
  });
});

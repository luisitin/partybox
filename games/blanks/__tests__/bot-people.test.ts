// I-445 A: a bot's vote counts a person's card up by one fit step.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { botInput } from '../server/bot';
import { playAll, readAll, start, toAnswer } from './helpers';

describe('I-445: bots are not a jury that only likes itself', () => {
  it("a person's card never loses a bot's vote to being a person's, and wins some", () => {
    const base = readAll(playAll(toAnswer(start({ players: 4, seed: 3 }))));
    expect(base.phase.id).toBe('judge');
    const voter = 'dev';
    const asBot = (id: string) => ({ ...base.players[id]!, bot: true });
    const allBots = { ...base, players: Object.fromEntries(Object.keys(base.players).map((id) => [id, asBot(id)])) };
    let gained = 0;
    for (const [target, owner] of base.slots.entries()) {
      if (owner === voter) continue;
      const ownerHuman = { ...allBots, players: { ...allBots.players, [owner]: { ...base.players[owner]! } } };
      for (let seed = 1; seed <= 40; seed += 1) {
        // the same seed draws the same noise in both rooms: only the owner's being a person differs
        const a = botInput(allBots, voter, createRng(seed));
        const b = botInput(ownerHuman, voter, createRng(seed));
        const aHit = a?.type === 'vote' && a.slot === target;
        const bHit = b?.type === 'vote' && b.slot === target;
        if (aHit) expect(bHit).toBe(true);
        if (bHit && !aHit) gained += 1;
      }
    }
    expect(gained).toBeGreaterThan(0);
  });
});

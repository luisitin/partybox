// I-433 A: a bot's BINGO! is the claim; a person's first tap is still dibs.
import { describe, expect, it } from 'vitest';
import { tapBingo } from '../server/claims';
import { start } from './helpers';

describe('I-433: bots skip the dibs', () => {
  it('a bot claims at once; a person arms first', () => {
    const s = start();
    const ids = Object.keys(s.players);
    const bot = ids[0] as string;
    const person = ids[1] as string;
    const withBot = { ...s, players: { ...s.players, [bot]: { ...s.players[bot]!, bot: true } } };
    expect(tapBingo(withBot, bot, 0, 1000).claim).toBe(true);
    expect(tapBingo(withBot, person, 0, 1000).claim).toBe(false);
  });
  it('behind the dibs of a person, a bot still queues', () => {
    const s = start();
    const ids = Object.keys(s.players);
    const bot = ids[0] as string;
    const person = ids[1] as string;
    const withBot = { ...s, players: { ...s.players, [bot]: { ...s.players[bot]!, bot: true } } };
    const armed = tapBingo(withBot, person, 0, 1000).state;
    const queued = tapBingo(armed, bot, 0, 1100);
    expect(queued.claim).toBe(false);
    expect(queued.state.round.queue.map((q) => q.playerId)).toContain(bot);
  });
});

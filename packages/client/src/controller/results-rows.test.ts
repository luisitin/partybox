// The phone's first-person results copy is pure: pin it without rendering.
import { describe, expect, it } from 'vitest';
import type { RoomSnapshot } from '@partybox/shared';
import { ordinal } from '../i18n';
import { myRow, resultsCue, winnerLine, winnerLineFor } from './results-rows';

type Rank = { playerId: string; score: number; rank: number };

function room(scores: Record<string, number>, winnerIds: string[], ranking: Rank[]): RoomSnapshot {
  const players = Object.keys(scores).map((id) => ({
    id,
    name: id,
    avatarId: 'fox',
    bot: id.startsWith('Bot'),
  }));
  return {
    code: 'ABCD',
    status: 'results',
    locked: false,
    capacity: 16,
    players: [],
    vip: null,
    selectedGameId: null,
    settings: {},
    games: [],
    results: { gameId: 'g', results: { scores, ranking, winnerIds }, players },
    canStart: { ok: true },
  } as unknown as RoomSnapshot;
}

const three = room(
  { Sam: 30, Priya: 20, Kenji: 10 },
  ['Sam'],
  [
    { playerId: 'Sam', score: 30, rank: 1 },
    { playerId: 'Priya', score: 20, rank: 2 },
    { playerId: 'Kenji', score: 10, rank: 3 },
  ],
);

describe('winnerLineFor', () => {
  it('speaks to the single winner in the first person, names them for everyone else', () => {
    expect(winnerLineFor(three, 'Sam')).toBe('You win! 🏆');
    expect(winnerLineFor(three, 'Priya')).toBe('Sam wins!');
  });
  it('shares first place', () => {
    const shared = room(
      { Sam: 30, Priya: 30, Kenji: 10 },
      ['Sam', 'Priya'],
      [
        { playerId: 'Sam', score: 30, rank: 1 },
        { playerId: 'Priya', score: 30, rank: 1 },
        { playerId: 'Kenji', score: 10, rank: 3 },
      ],
    );
    expect(winnerLineFor(shared, 'Sam')).toBe('You tie for first! 🏆');
    expect(winnerLineFor(shared, 'Kenji')).toBe('Priya & Sam win!');
  });
  it('counts the rest of a three-way tie in the singular (review-loop #215)', () => {
    const tied = room(
      { Sam: 20, Priya: 20, Kenji: 20, Dev: 10 },
      ['Sam', 'Priya', 'Kenji'],
      [
        { playerId: 'Sam', score: 20, rank: 1 },
        { playerId: 'Priya', score: 20, rank: 1 },
        { playerId: 'Kenji', score: 20, rank: 1 },
        { playerId: 'Dev', score: 10, rank: 4 },
      ],
    );
    expect(winnerLineFor(tied, 'Dev')).toBe('Kenji, Priya & 1 other tie!');
    const four = room(
      { Sam: 20, Priya: 20, Kenji: 20, Dev: 20, Ana: 10 },
      ['Sam', 'Priya', 'Kenji', 'Dev'],
      [
        { playerId: 'Sam', score: 20, rank: 1 },
        { playerId: 'Priya', score: 20, rank: 1 },
        { playerId: 'Kenji', score: 20, rank: 1 },
        { playerId: 'Dev', score: 20, rank: 1 },
        { playerId: 'Ana', score: 10, rank: 5 },
      ],
    );
    expect(winnerLineFor(four, 'Ana')).toBe('Dev, Kenji & 2 others tie!');
  });

  it('calls an all-way tie a tie for everyone', () => {
    const all = room(
      { Sam: 10, Priya: 10 },
      ['Sam', 'Priya'],
      [
        { playerId: 'Sam', score: 10, rank: 1 },
        { playerId: 'Priya', score: 10, rank: 1 },
      ],
    );
    expect(winnerLineFor(all, 'Sam')).toBe("It's a tie!");
  });
  it('calls a zero-score game "Nobody scored" (I-128: an honest state, not a tie), whoever asks', () => {
    const none = room({ Sam: 0, Priya: 0 }, [], []);
    expect(winnerLineFor(none, 'Sam')).toBe('Nobody scored');
    expect(winnerLineFor(room({ Sam: 0 }, [], []), 'Sam')).toBe('Nobody scored');
  });
  it('falls back to the shared line for a spectator', () => {
    expect(winnerLineFor(three, 'Ghost')).toBe('Sam wins!');
  });
});

describe('myRow', () => {
  it('finds my ranking entry, or nothing for a spectator', () => {
    expect(myRow(three, 'Priya')).toMatchObject({ rank: 2, score: 20 });
    expect(myRow(three, 'Ghost')).toBeUndefined();
  });
});

describe('ordinal', () => {
  it('handles the teens and the twenties', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '23rd',
      '101st',
      '111th',
    ]);
  });
});

describe('winnerLine with bots in the tie (I-153)', () => {
  const tieOf = (ids: string[], losers: string[] = ['Ana']): RoomSnapshot =>
    room(Object.fromEntries([...ids.map((id) => [id, 2]), ...losers.map((id) => [id, 0])]), ids, [
      ...ids.map((playerId) => ({ playerId, score: 2, rank: 1 })),
      ...losers.map((playerId, i) => ({ playerId, score: 0, rank: ids.length + 1 + i })),
    ]);

  it('names the people and folds the bots into "the bots"', () => {
    expect(winnerLine(tieOf(['Bot 1', 'Bot 3', 'Sam', 'Priya']))).toBe(
      'Priya, Sam & the bots tie!',
    );
    expect(winnerLine(tieOf(['Bot 2', 'Sam']))).toBe('Sam & the bot tie!');
  });

  it('says so when only bots tie, and still names a lone bot winner', () => {
    expect(winnerLine(tieOf(['Bot 1', 'Bot 3'], ['Sam']))).toBe('The bots tie — nobody home?');
    expect(winnerLine(tieOf(['Bot 1'], ['Sam']))).toBe('Bot 1 wins!');
  });

  it('leaves a people-only tie as it was', () => {
    expect(winnerLine(tieOf(['Sam', 'Priya']))).toBe('Priya & Sam win!');
  });
});

describe('ADR-052: co-op and team games', () => {
  const withOutcome = (extra: Record<string, unknown>): RoomSnapshot => {
    const base = room({ Sam: 5, Priya: 5 }, ['Sam', 'Priya'], []);
    const r = base.results as NonNullable<RoomSnapshot['results']>;
    return { ...base, results: { ...r, results: { ...r.results, ...extra } } } as RoomSnapshot;
  };
  it('a co-op mission is complete or failed, never a tie', () => {
    expect(winnerLine(withOutcome({ outcome: { kind: 'coop', won: true } }))).toBe('Mission complete!'); // prettier-ignore
    const lost = withOutcome({ winnerIds: [], outcome: { kind: 'coop', won: false } });
    expect(winnerLine(lost)).toBe('Mission failed');
    expect(winnerLineFor(lost, 'Sam')).toBe('Mission failed');
  });
  it('a team wins with its mark, or it is a draw', () => {
    const teams = [
      { id: 'sun', name: 'Sun', mark: '▲', members: ['Sam'] },
      { id: 'moon', name: 'Moon', mark: '●', members: ['Priya'] },
    ];
    expect(winnerLine(withOutcome({ outcome: { kind: 'teams', winner: 'sun', teams } }))).toBe('▲ Sun wins!'); // prettier-ignore
    expect(winnerLine(withOutcome({ outcome: { kind: 'teams', winner: null, teams } }))).toBe('A draw!'); // prettier-ignore
  });
  it('one results cue for the TV and a phone-only room (foundation [8fce81])', () => {
    const teams = [
      { id: 'sun', name: 'Sun', mark: '▲', members: ['Sam'] },
      { id: 'moon', name: 'Moon', mark: '●', members: ['Priya'] },
    ];
    expect(resultsCue(withOutcome({ outcome: { kind: 'coop', won: true } }))).toBe('cheer');
    // A lost co-op has no winners: never the cheer.
    expect(resultsCue(withOutcome({ winnerIds: [], outcome: { kind: 'coop', won: false } }))).toBe('tie'); // prettier-ignore
    expect(resultsCue(withOutcome({ outcome: { kind: 'teams', winner: 'sun', teams } }))).toBe('cheer'); // prettier-ignore
    expect(resultsCue(withOutcome({ outcome: { kind: 'teams', winner: null, teams } }))).toBe('tie'); // prettier-ignore
    expect(resultsCue(room({ Sam: 5, Priya: 5 }, ['Sam', 'Priya'], []))).toBe('tie');
    expect(resultsCue(room({ Sam: 5, Priya: 2 }, ['Sam'], []))).toBe('cheer');
    expect(resultsCue(room({ Sam: 0, Priya: 0 }, [], []))).toBe('leave');
  });
  it("the game's own headline wins", () => {
    const r = withOutcome({ outcome: { kind: 'coop', won: true }, headline: '📡 Crystal clear!' });
    expect(winnerLine(r)).toBe('📡 Crystal clear!');
  });
});

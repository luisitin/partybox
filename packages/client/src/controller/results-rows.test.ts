// The phone's first-person results copy is pure: pin it without rendering.
import { describe, expect, it } from 'vitest';
import type { RoomSnapshot } from '@partybox/shared';
import { ordinal } from '../i18n';
import {
  groupAwards,
  joinNames,
  longestWord,
  myRow,
  outcomeLine,
  teamGroups,
  winnerColor,
  winnerLine,
  winnerLineFor,
  yourTeamLine,
} from './results-rows';

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
    // three tied: all named (tune-in's review: 'Abuela, Kenji & 1 other tie!' had room for Lucía)
    expect(winnerLineFor(tied, 'Dev')).toBe('Kenji, Priya & Sam tie!');
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

  it('names bots that tie over a person, and still names a lone bot winner', () => {
    // "nobody home?" is for a room with no person at all (imposter's play-test: it read as if Sam
    // had not played)
    expect(winnerLine(tieOf(['Bot 1', 'Bot 3'], ['Sam']))).toBe('Bot 1 & Bot 3 win!');
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
    expect(winnerLine(withOutcome({ outcome: { kind: 'teams', winner: 'sun', teams } }))).toBe('Sun wins! ▲'); // prettier-ignore
    expect(winnerLine(withOutcome({ outcome: { kind: 'teams', winner: null, teams } }))).toBe('A draw!'); // prettier-ignore
  });
  it("the game's own headline wins", () => {
    const r = withOutcome({ outcome: { kind: 'coop', won: true }, headline: '📡 Crystal clear!' });
    expect(winnerLine(r)).toBe('📡 Crystal clear!');
  });
});

describe('awards', () => {
  it('a tie gives one card per award, with everyone who won it', () => {
    const award = (id: string, playerId: string) => ({ id, title: id, description: 'd', playerId });
    const groups = groupAwards([award('sharp', 'A'), award('sharp', 'B'), award('clear', 'C'), award('sharp', 'B')]); // prettier-ignore
    expect(groups.map((g) => [g.id, g.playerIds])).toEqual([
      ['sharp', ['A', 'B']],
      ['clear', ['C']],
    ]);
    expect(groups[0]?.description).toBe('d');
  });
  it('a line that differs per winner stays with its winner', () => {
    const groups = groupAwards([
      { id: 'eye', title: 'Bullseye', description: 'Bullseyes: 1', playerId: 'A' },
      { id: 'eye', title: 'Bullseye', description: 'Bullseyes: 2', playerId: 'B' },
    ]);
    expect(groups[0]?.description).toBeNull();
    expect(groups[0]?.perPlayer.map((x) => x.description)).toEqual([
      'Bullseyes: 1',
      'Bullseyes: 2',
    ]);
  });
  it('names read like a sentence', () => {
    expect(joinNames(['Sam'])).toBe('Sam');
    expect(joinNames(['Sam', 'Maya'])).toBe('Sam & Maya');
    expect(joinNames(['Sam', 'Maya', 'Leo'])).toBe('Sam, Maya & Leo');
  });
});

describe('a tie among bots', () => {
  it('"nobody home?" only when no person played; with people below, the bots are named', () => {
    const botsTie = room(
      { 'Bot 1': 10, 'Bot 2': 10, 'Bot 3': 10, Lucia: 4 },
      ['Bot 1', 'Bot 2', 'Bot 3'],
      [
        { playerId: 'Bot 1', score: 10, rank: 1 },
        { playerId: 'Bot 2', score: 10, rank: 1 },
        { playerId: 'Bot 3', score: 10, rank: 1 },
        { playerId: 'Lucia', score: 4, rank: 4 },
      ],
    );
    expect(winnerLine(botsTie)).toBe('Bot 1, Bot 2 & Bot 3 tie!');
    const onlyBots = room(
      { 'Bot 1': 10, 'Bot 2': 10, 'Bot 3': 4 },
      ['Bot 1', 'Bot 2'],
      [
        { playerId: 'Bot 1', score: 10, rank: 1 },
        { playerId: 'Bot 2', score: 10, rank: 1 },
        { playerId: 'Bot 3', score: 4, rank: 3 },
      ],
    );
    expect(winnerLine(onlyBots)).toBe('The bots tie — nobody home?');
  });
});

describe('ADR-052: a team game grouped by team', () => {
  const teamsRoom = (winner: string | null): RoomSnapshot => {
    const base = room(
      { Sam: 3, Priya: 1, Kenji: 2, Ana: 0 },
      [],
      [
        { playerId: 'Sam', score: 3, rank: 1 },
        { playerId: 'Kenji', score: 2, rank: 2 },
        { playerId: 'Priya', score: 1, rank: 3 },
        { playerId: 'Ana', score: 0, rank: 4 },
      ],
    );
    const r = base.results as NonNullable<RoomSnapshot['results']>;
    const outcome = {
      kind: 'teams',
      winner,
      teams: [
        {
          id: 'sun',
          name: 'Sun',
          mark: '▲',
          color: 'var(--pb-accent-2)',
          members: ['Sam', 'Priya'],
        },
        { id: 'moon', name: 'Moon', mark: '●', color: 'var(--pb-info)', members: ['Kenji', 'Ana'] },
      ],
    };
    return { ...base, results: { ...r, results: { ...r.results, outcome } } } as RoomSnapshot;
  };
  it('puts the winning team first, each with its members', () => {
    const groups = teamGroups(teamsRoom('moon')) ?? [];
    expect(groups.map((g) => [g.id, g.won, g.rows.map((row) => row.playerId)])).toEqual([
      ['moon', true, ['Kenji', 'Ana']],
      ['sun', false, ['Sam', 'Priya']],
    ]);
    expect(winnerColor(teamsRoom('moon'))).toBe('var(--pb-info)');
  });
  it('tells each phone its team won or lost; a draw says neither', () => {
    expect(yourTeamLine(teamsRoom('moon'), 'Ana')).toBe('Your team won!');
    expect(yourTeamLine(teamsRoom('moon'), 'Sam')).toBe('Your team lost this one');
    expect(yourTeamLine(teamsRoom(null), 'Sam')).toBeNull();
    expect(teamGroups(room({ Sam: 1 }, ['Sam'], []))).toBeNull();
  });
  it('closes the headline with the winning mark, never mid-sentence', () => {
    expect(outcomeLine(teamsRoom('moon'))).toBe('Moon wins! ●');
  });
  it('keeps a player in no team on the board, in a last group of their own', () => {
    const r = teamsRoom('moon');
    const o = r.results?.results.outcome;
    if (o?.kind !== 'teams') throw new Error('teams outcome expected');
    const left = { ...o, teams: o.teams.map((tm) => ({ ...tm, members: tm.members.filter((id) => id !== 'Priya') })) }; // prettier-ignore
    const room2 = { ...r, results: { ...r.results, results: { ...r.results?.results, outcome: left } } } as RoomSnapshot; // prettier-ignore
    const groups = teamGroups(room2) ?? [];
    expect(groups.map((g) => [g.id, g.name, g.won, g.rows.map((row) => row.playerId)])).toEqual([
      ['moon', 'Moon', true, ['Kenji', 'Ana']],
      ['sun', 'Sun', false, ['Sam']],
      ['', 'No team', false, ['Priya']],
    ]);
  });
});

describe('longestWord', () => {
  it('counts the letters of the longest word, so a one-word name can shrink the headline', () => {
    expect(longestWord('Wolfeschlegelste wins!')).toBe(16);
    expect(longestWord('¡Gana Wolfeschlegelste!')).toBe(17);
    expect(longestWord('Ana, Ben & Cleo tie!')).toBe(4);
    expect(longestWord('')).toBe(1);
  });
});

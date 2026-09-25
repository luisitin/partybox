// Spec §5.7 and §5.18 "Scoring": band edges per target size, the psychic's integer rounding,
// perfect tune, the teams' call rules, catch-up, both teams at the target, co-op ratings.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { bandPoints, coopRating, psychicPoints, roundedAverage } from '../server/scoring';
import { dialAll, guessers, send, start, timer, toDial, vip } from './helpers';

describe('bands', () => {
  it.each([
    ['narrow', 4, 4],
    ['narrow', 5, 3],
    ['narrow', 8, 3],
    ['narrow', 9, 2],
    ['narrow', 12, 2],
    ['narrow', 13, 0],
    ['normal', 4, 4],
    ['normal', 5, 4],
    ['normal', 6, 3],
    ['normal', 9, 3],
    ['normal', 10, 3],
    ['normal', 11, 2],
    ['normal', 14, 2],
    ['normal', 15, 2],
    ['normal', 16, 0],
    ['wide', 6, 4],
    ['wide', 7, 3],
    ['wide', 12, 3],
    ['wide', 13, 2],
    ['wide', 20, 2],
    ['wide', 21, 0],
  ] as const)('%s: %i away scores %i', (size, away, pts) => {
    expect(bandPoints(away, size)).toBe(pts);
    expect(bandPoints(-away, size)).toBe(pts);
  });
});

describe('the psychic (solo)', () => {
  it('rounds the average half up with integers: 9 ÷ 4 = 2.25 → 2, 10 ÷ 4 = 2.5 → 3', () => {
    expect(roundedAverage([4, 3, 2, 0])).toBe(2);
    expect(roundedAverage([4, 4, 2, 0])).toBe(3);
    expect(roundedAverage([3, 2])).toBe(3);
    expect(roundedAverage([])).toBe(0);
  });
  it('perfect tune adds 2 only with 2+ guessers all on 4', () => {
    expect(psychicPoints([4, 4])).toBe(6);
    expect(psychicPoints([4])).toBe(4);
    expect(psychicPoints([4, 3])).toBe(4);
  });
  it('the spec example: Ben 85, Cy 70, Dee 60, Eli 95 on 80 → 4, 3, 0, 2 and Ana 2', () => {
    let s = toDial(start(5, { mode: 'solo' }), 80);
    const order = guessers(s);
    const dials = [85, 70, 60, 95];
    s = dialAll(s, dials);
    s = timer(s); // reveal step 0 → 1
    const pts = order.map((id) => s.turn.points[id]);
    expect(pts).toEqual([4, 3, 0, 2]);
    expect(s.turn.points[s.turn.psychic]).toBe(2);
    expect(s.scores[s.turn.psychic]).toBe(2);
  });
  it('nobody dialled: the psychic gets 0', () => {
    let s = toDial(start(4, { mode: 'solo' }), 30);
    s = timer(s);
    expect(s.phase.id).toBe('reveal');
    expect(s.turn.points[s.turn.psychic]).toBe(0);
  });
});

describe('teams', () => {
  const teamsGame = (): ReturnType<typeof start> => start(6, { mode: 'teams', targetScore: 10 });

  it('the needle is the rounded average of the active team, then the other team calls', () => {
    let s = toDial(teamsGame(), 40);
    s = dialAll(s, [45, 50]);
    expect(s.phase.id).toBe('call');
    expect(s.turn.needle).toBe(48);
  });

  it('a correct majority call scores 1 for the calling team; a bullseye blocks it', () => {
    let s = toDial(teamsGame(), 40);
    const active = s.turn.team as 'sun' | 'moon';
    const callers = s.teams?.[active === 'sun' ? 'moon' : 'sun'] ?? [];
    s = dialAll(s, [50, 50]); // needle 50, target 40 → 3 points, target is LEFT
    for (const id of callers) s = send(s, id, { type: 'call', side: 'left' });
    expect(s.phase.id).toBe('reveal');
    expect(s.turn.teamPoints[active]).toBe(3);
    expect(s.turn.teamPoints[active === 'sun' ? 'moon' : 'sun']).toBe(1);

    let b = toDial(teamsGame(), 50);
    const bActive = b.turn.team as 'sun' | 'moon';
    const bCallers = b.teams?.[bActive === 'sun' ? 'moon' : 'sun'] ?? [];
    b = dialAll(b, [48, 52]); // needle 50 = bullseye
    for (const id of bCallers) b = send(b, id, { type: 'call', side: 'left' });
    expect(b.turn.teamPoints[bActive]).toBe(4);
    expect(b.turn.teamPoints[bActive === 'sun' ? 'moon' : 'sun']).toBe(0);
  });

  it('a tied call, or no call at all, scores nothing', () => {
    let s = toDial(teamsGame(), 20);
    const active = s.turn.team as 'sun' | 'moon';
    const callers = s.teams?.[active === 'sun' ? 'moon' : 'sun'] ?? [];
    s = dialAll(s, [60, 60]);
    s = send(s, callers[0] as string, { type: 'call', side: 'left' });
    s = send(s, callers[1] as string, { type: 'call', side: 'right' });
    s = timer(s);
    expect(s.turn.teamPoints[active === 'sun' ? 'moon' : 'sun']).toBe(0);
  });

  it('catch-up: a bullseye while still behind plays again with the next psychic', () => {
    let s = teamsGame();
    const first = timer(s).turn.team as 'sun' | 'moon';
    const other = first === 'sun' ? 'moon' : 'sun';
    s = { ...timer(s), team: { sun: 0, moon: 0, [other]: 8 } as { sun: number; moon: number } };
    const psychic = s.turn.psychic;
    s = toDial(s, 50);
    s = dialAll(s, [50, 50]);
    s = timer(s); // call → reveal (nobody called)
    s = timer(timer(s)); // reveal step 0 → 1 → scores
    expect(s.phase.id).toBe('scores');
    s = timer(s);
    expect(s.turn.team).toBe(first);
    expect(s.turn.catchUp).toBe(true);
    expect(s.turn.psychic).not.toBe(psychic);
  });

  /** Plays one teams turn to its end from `sunMoon` totals, the active team hitting the bullseye. */
  function bullseyeFrom(activeStart: number, otherStart: number): ReturnType<typeof start> {
    let s = timer(teamsGame());
    const active = s.turn.team as 'sun' | 'moon';
    const other = active === 'sun' ? 'moon' : 'sun';
    s = {
      ...s,
      team: { [active]: activeStart, [other]: otherStart } as { sun: number; moon: number },
    };
    s = dialAll(toDial(s, 70), [70, 70]); // needle 70 = bullseye (+4)
    s = timer(s); // call ends → reveal
    s = timer(timer(s)); // points beat → scores
    return timer(s);
  }

  it('both teams over the target on the same turn: the higher score wins', () => {
    const s = bullseyeFrom(9, 10); // 13 vs 10
    expect(s.phase.id).toBe('done');
    const active = s.turn.team as 'sun' | 'moon';
    expect(s.team[active]).toBe(13);
    expect(game.results(s)?.winnerIds.sort()).toEqual([...(s.teams?.[active] ?? [])].sort());
  });

  it('both teams over the target with equal scores share the win', () => {
    const s = bullseyeFrom(6, 10); // 10 vs 10
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.winnerIds.length).toBe(6);
  });
});

describe('co-op', () => {
  it('rates the share of rounds × 4: <35 % static, 35–54 tuning, 55–74 clear, 75+ meld', () => {
    expect(coopRating(11, 8)).toBe('static'); // 34 %
    expect(coopRating(12, 8)).toBe('tuning'); // 37.5 %
    expect(coopRating(17, 8)).toBe('tuning'); // 53 %
    expect(coopRating(18, 8)).toBe('clear'); // 56 %
    expect(coopRating(23, 8)).toBe('clear'); // 72 %
    expect(coopRating(24, 8)).toBe('meld'); // 75 %
  });
  it('two players: the group needle is simply the other player', () => {
    let s = toDial(start(2), 70);
    expect(s.mode).toBe('coop');
    s = dialAll(s, [66]);
    s = timer(s);
    expect(s.turn.needle).toBe(66);
    expect(s.coopTotal).toBe(4);
    expect(Object.values(s.scores)).toEqual([4, 4]);
  });
  it('the VIP can end at any time and everyone carries the group total', () => {
    const s = vip(toDial(start(3, { mode: 'coop' }), 10), 'end');
    expect(s.phase.id).toBe('done');
  });
});

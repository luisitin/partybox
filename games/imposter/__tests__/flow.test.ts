// Phase order, presence, VIP skips, drops, late joiners, idle rooms and the input rules (SPEC
// §1.3, §1.7, §1.13, §1.15).
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { crewClue, input, roles, start, timer, until, vip } from './helpers';
import type { State } from '../server/types';

function phasesOf(s0: State, steps = 60): string[] {
  const out = [s0.phase.id];
  let s = s0;
  for (let i = 0; i < steps && s.phase.id !== 'done'; i++) {
    s = timer(s);
    if (out[out.length - 1] !== s.phase.id) out.push(s.phase.id);
  }
  return out;
}

describe('phase order', () => {
  it('together: one clue round, talk, vote; an idle room ends with the imposters escaping', () => {
    const order = phasesOf(start(6, { rounds: 1 }));
    expect(order).toEqual([
      'intro',
      'deal',
      'clue',
      'clueReveal',
      'talk',
      'vote',
      'voteReveal',
      'wordReveal',
      'scores',
      'done',
    ]);
  });

  it('remote-text: no talk, and auto gives two clue rounds', () => {
    const s = start(6, { rounds: 1 }, 3, { mode: 'remote-text', phoneOnly: false });
    expect(s.cfg.talk).toBe(false);
    expect(s.cfg.clueRounds).toBe(2);
    expect(phasesOf(s)).toEqual([
      'intro',
      'deal',
      'clue',
      'clueReveal',
      'clue',
      'clueReveal',
      'vote',
      'voteReveal',
      'wordReveal',
      'scores',
      'done',
    ]);
  });

  it('remote-voice keeps the talk; talk off gives two clue rounds', () => {
    expect(start(6, {}, 3, { mode: 'remote-voice', phoneOnly: true }).cfg.talk).toBe(true);
    const off = start(6, { talk: false });
    expect([off.cfg.talk, off.cfg.clueRounds]).toEqual([false, 2]);
  });

  it('imposters: auto is two at 10+, and two falls back to one under 7', () => {
    expect(until(start(9), 'deal').round.imposters).toHaveLength(1);
    expect(until(start(10), 'deal').round.imposters).toHaveLength(2);
    expect(until(start(6, { imposters: '2' }), 'deal').round.imposters).toHaveLength(1);
    expect(until(start(7, { imposters: '2' }), 'deal').round.imposters).toHaveLength(2);
  });

  it('never two words in a row from the same category; rounds + 2 drawn', () => {
    for (let seed = 1; seed < 30; seed++) {
      const s = start(6, { rounds: 8 }, seed);
      expect(s.words).toHaveLength(10);
      for (let i = 1; i < s.words.length; i++)
        expect(s.words[i]?.cat).not.toBe(s.words[i - 1]?.cat);
    }
  });

  it('a VIP skip leaves every phase', () => {
    let s = start(6, { rounds: 1, clueRounds: '1' });
    const seen = new Set<string>();
    for (let i = 0; i < 80 && s.phase.id !== 'done'; i++) {
      seen.add(s.phase.id);
      s = vip(s, 'skip');
    }
    expect(s.phase.id).toBe('done');
    expect(seen).toEqual(
      new Set([
        'intro',
        'deal',
        'clue',
        'clueReveal',
        'talk',
        'vote',
        'voteReveal',
        'wordReveal',
        'scores',
      ]),
    );
  });

  it('the imposter bag gives everyone a turn before anyone repeats', () => {
    let s = start(4, { rounds: 4 });
    const seen: string[] = [];
    for (let r = 0; r < 4; r++) {
      s = until(s, 'deal');
      seen.push(...s.round.imposters);
      s = until(s, 'scores');
      s = timer(s);
    }
    expect(new Set(seen).size).toBe(4);
  });
});

describe('inputs', () => {
  it('crew clues are checked against the word; the imposter is never checked', () => {
    let s = until(start(6), 'clue');
    const { imps, crew } = roles(s);
    const word = s.words[s.round.w]?.answer ?? '';
    const c = crew[0] as string;
    s = input(s, c, { type: 'clue', text: word });
    expect(s.round.rejects[c]).toEqual({ why: 'is-secret', n: 1 });
    s = input(s, c, { type: 'clue', text: 'two words' });
    expect(s.round.rejects[c]).toEqual({ why: 'not-one-word', n: 2 });
    s = input(s, c, { type: 'clue', text: crewClue(s) });
    expect(s.round.rejects[c]).toBeUndefined();
    s = input(s, imps[0] as string, { type: 'clue', text: word });
    expect(s.round.clues.find((x) => x.by === imps[0])?.text).toBe(word);
  });

  it('a resend replaces the clue; from clue round two a board clue is refused for everyone', () => {
    let s = until(start(6, { talk: false, clueRounds: '2' }), 'clue');
    const c = roles(s).crew[0] as string;
    s = input(s, c, { type: 'clue', text: crewClue(s, 0) });
    s = input(s, c, { type: 'clue', text: crewClue(s, 1) });
    expect(s.round.clues.filter((x) => x.by === c).map((x) => x.text)).toEqual([crewClue(s, 1)]);
    s = until(s, 'clueReveal');
    s = until(s, 'clue');
    expect(s.round.clueRound).toBe(2);
    const imp = roles(s).imps[0] as string;
    s = input(s, imp, { type: 'clue', text: `${crewClue(s, 1)}s` });
    expect(s.round.rejects[imp]?.why).toBe('repeat');
  });

  it('votes: never self, no repeats, only seated players, exactly the right count', () => {
    let s = until(start(6), 'vote');
    const before = s;
    for (const targets of [['p1'], ['zz'], ['p2', 'p3'], ['__proto__']])
      s = input(s, 'p1', { type: 'vote', targets });
    expect(s).toBe(before);
    s = input(s, 'p1', { type: 'vote', targets: ['p2'] });
    s = input(s, 'p1', { type: 'vote', targets: ['p3'] });
    expect(s.round.votes['p1']).toEqual(['p3']);
    expect(input(s, 'ghost', { type: 'vote', targets: ['p2'] })).toBe(s);
  });

  it('two imposters: each vote picks exactly two different players', () => {
    let s = until(start(10), 'vote');
    const before = s;
    s = input(s, 'p1', { type: 'vote', targets: ['p2'] });
    s = input(s, 'p1', { type: 'vote', targets: ['p2', 'p2'] });
    expect(s).toBe(before);
    s = input(s, 'p1', { type: 'vote', targets: ['p2', 'p3'] });
    expect(s.round.votes['p1']).toEqual(['p2', 'p3']);
  });

  it('a guess from anyone but an accused imposter, or a second guess, is ignored', () => {
    let s = until(start(6, { talk: false, clueRounds: '1' }), 'vote');
    const { imps, crew } = roles(s);
    const imp = imps[0] as string;
    for (const v of s.seats)
      s = input(s, v, { type: 'vote', targets: [v === imp ? (crew[0] as string) : imp] });
    s = until(s, 'lastChance');
    const opt = s.round.options?.[0] ?? '';
    expect(input(s, crew[0] as string, { type: 'guess', option: opt })).toBe(s);
    expect(input(s, imp, { type: 'guess', option: 'not an option' })).toBe(s);
  });
});

describe('edge cases', () => {
  it('everyone idle: deadlines carry the whole game', () => {
    let s = start(6);
    for (let i = 0; i < 300 && s.phase.id !== 'done'; i++) s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.ranking).toHaveLength(6);
  });

  it('one connected player: phases run on deadlines and the game ends normally', () => {
    let s = start(4, { rounds: 1 });
    for (const id of ['p2', 'p3', 'p4'])
      s = game.reduce(s, {
        type: 'player',
        now: s.phase.startedAt,
        playerId: id,
        connected: false,
      });
    s = until(s, 'clue');
    s = input(s, 'p1', { type: 'clue', text: 'hello' });
    expect(['clueReveal', 'clue']).toContain(s.phase.id);
    s = until(s, 'done');
    expect(game.results(s)?.scores).toHaveProperty('p4');
  });

  it('every imposter leaving before the vote voids the round: no points, next round', () => {
    let s = until(start(6), 'clue');
    const imp = roles(s).imps[0] as string;
    s = game.reduce(s, {
      type: 'player',
      now: s.phase.startedAt + 5,
      playerId: imp,
      connected: false,
      gone: 'left',
    });
    expect(s.phase.id).toBe('wordReveal');
    expect(s.round.void).toBe(true);
    s = until(s, 'deal');
    expect(Object.values(s.scores).every((v) => v === 0)).toBe(true);
    expect(s.round.imposters).not.toContain(imp);
  });

  it('a late joiner is a spectator: stage only, no role, no secrets', () => {
    const s = until(start(6), 'clue');
    const v = game.controllerView(s, 'late');
    expect([v.seated, v.role, v.word, v.ballot]).toEqual([false, null, null, null]);
    expect(game.bot.sampleInput(s, 'late', { float: () => 0.5 } as never)).toBeNull();
  });

  it('a pause freezes the reveal on its card; resume continues from the same card', () => {
    let s = until(start(6), 'clueReveal');
    s = timer(s);
    s = timer(s);
    const k = s.round.revealed;
    s = vip(s, 'pause');
    s = timer(s);
    expect(s.round.revealed).toBe(k);
    s = vip(s, 'resume');
    s = timer(s);
    expect(s.round.revealed).toBe(k + 1);
  });
});

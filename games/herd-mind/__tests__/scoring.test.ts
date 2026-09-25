// SPEC §2.6 and §2.17: the herd, ties, the Black Sheep, the win check and the ranking.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { celebrated } from '../server/views';
import type { State } from '../server/types';
import { atAnswer, input, nextQuestion, scoreWith, skip, timer } from './helpers';

describe('one question', () => {
  it('the single biggest group of 2+ is the herd: +1 each, nobody else scores', () => {
    const s = scoreWith(atAnswer(), [0, 0, 0, 1, 1, 2]);
    expect(s.phase.id).toBe('score');
    expect(s.q.outcome).toBe('herd');
    expect(s.q.scored).toEqual(['ana', 'ben', 'cy']);
    expect(s.scores).toEqual({ ana: 1, ben: 1, cy: 1, dee: 0, eli: 0, fay: 0 });
    expect(s.sheep).toBe('fay'); // alone on tile 2
  });

  it('a tie for biggest: no herd, nobody scores', () => {
    const s = scoreWith(atAnswer(), [0, 0, 1, 1, 2, 3]);
    expect(s.q.outcome).toBe('tie');
    expect(s.q.herd).toBeNull();
    expect(Object.values(s.scores).every((v) => v === 0)).toBe(true);
    expect(s.sheep).toBeNull(); // two players alone: the sheep stays in the pasture
  });

  it('everyone the same: all +1, the sheep does not move', () => {
    const s = scoreWith(atAnswer(), [4, 4, 4, 4, 4, 4]);
    expect(Object.values(s.scores)).toEqual([1, 1, 1, 1, 1, 1]);
    expect(s.sheep).toBeNull();
  });

  it('everyone different: no herd, 2+ alone, the sheep stays put', () => {
    const s = scoreWith(atAnswer(), [0, 1, 2, 3, 4, 5]);
    expect(s.q.outcome).toBe('scattered');
    expect(s.sheep).toBeNull();
    expect(Object.values(s.scores).every((v) => v === 0)).toBe(true);
  });

  it('nobody answering: empty, no score, no sheep', () => {
    const s = scoreWith(atAnswer(), [null, null, null, null, null, null]);
    expect(s.q.outcome).toBe('empty');
    expect(s.sheep).toBeNull();
  });

  it('players who did not answer are left out completely', () => {
    const s = scoreWith(atAnswer(), [0, 0, null, null, 1, null]);
    expect(s.q.scored).toEqual(['ana', 'ben']);
    expect(s.sheep).toBe('eli');
  });

  it('a resent pick replaces the earlier one', () => {
    let s = atAnswer();
    const [t0, t1] = (s.q.tiles ?? []).map((t) => t.id);
    s = input(s, 'ana', { type: 'pick', tile: t0 ?? '' });
    s = input(s, 'ana', { type: 'pick', tile: t1 ?? '' });
    expect(s.q.answers['ana']).toEqual({ tile: t1 });
  });
});

describe('the Black Sheep', () => {
  it('moves from its holder to the next lone player, and stays when 2+ are alone', () => {
    let s = scoreWith(atAnswer(), [0, 0, 0, 1, 1, 2]);
    expect(s.sheep).toBe('fay');
    s = scoreWith(nextQuestion(s), [0, 0, 0, 1, 2, 3]);
    expect(s.sheep).toBe('fay'); // eli and fay both alone → stays
    s = scoreWith(nextQuestion(s), [0, 0, 0, 0, 1, 0]);
    expect(s.sheep).toBe('eli');
    expect(s.q.sheepFrom).toBe('fay');
  });

  it('goes back to the pasture when its holder leaves for good', () => {
    let s = scoreWith(atAnswer(), [0, 0, 0, 1, 1, 2]);
    s = game.reduce(s, {
      type: 'player',
      now: s.phase.startedAt + 10,
      playerId: 'fay',
      connected: false,
      gone: 'left',
    });
    expect(s.sheep).toBeNull();
    expect(s.left).toEqual(['fay']);
  });

  it('blocks a win, and grants it the moment it is shed while at the target', () => {
    let s = atAnswer({ target: 3 });
    // Fay and Ana reach 2 together in the herd; then Fay is alone and takes the sheep.
    s = nextQuestion(scoreWith(s, [0, 0, 1, 1, 1, 2])); // herd: cy dee eli (tile 1); fay alone
    s = nextQuestion(scoreWith(s, [0, 1, 0, 0, 0, 0])); // herd tile 0: ana cy dee eli fay; ben alone
    s = scoreWith(s, [0, 1, 0, 0, 0, 2]); // herd: ana cy dee eli (+1 → cy dee eli at 3); fay alone
    expect(s.scores['cy']).toBe(3);
    expect(s.winners).toEqual(['cy', 'dee', 'eli']);
  });

  it('players reaching the target together share the win', () => {
    let s = atAnswer({ target: 3 }, 4);
    s = { ...s, scores: { ana: 2, ben: 2, cy: 0, dee: 0 } };
    s = scoreWith(s, [0, 0, 1, 2]); // ana ben → 3; cy and dee alone → the sheep stays out
    expect(s.winners).toEqual(['ana', 'ben']);
  });

  it('the holder at the target keeps playing, blocked, and wins the moment the sheep moves on', () => {
    let s = atAnswer({ target: 3, maxQuestions: 10 }, 4);
    s = nextQuestion(scoreWith(s, [0, 0, 0, 1])); // dee alone → the sheep
    const withDee = (st: State, pts: number): State => ({
      ...st,
      scores: { ...st.scores, dee: pts },
    });
    s = withDee(s, 2);
    s = scoreWith(s, [0, 1, 2, 2]); // cy + dee herd → dee 3, but holding; ana, ben alone → it stays
    expect(s.scores['dee']).toBe(3);
    expect(s.sheep).toBe('dee');
    expect(s.winners).toEqual([]);
    s = nextQuestion(s);
    s = scoreWith(s, [0, 1, 1, 1]); // ana alone → the sheep moves to ana; dee (4) sheds it
    expect(s.sheep).toBe('ana');
    expect(s.winners).toEqual(['cy', 'dee']); // cy reaches 3 in the same herd
  });
});

describe('the end', () => {
  it('after maxQuestions the top scorers without the sheep win', () => {
    let s = atAnswer({ maxQuestions: 5, target: 15 }, 3);
    for (let i = 0; i < 5; i++) {
      s = scoreWith(s, [0, 0, 1]); // ana ben +1 each time; cy alone holds the sheep
      if (i < 4) s = nextQuestion(s);
    }
    expect(s.winners).toEqual(['ana', 'ben']);
    s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.winnerIds).toEqual(['ana', 'ben']);
  });

  it('nobody scoring all game: a quiet shared draw, never a celebration', () => {
    let s = atAnswer({ maxQuestions: 5, target: 15, reader: 'jessica' }, 3);
    for (let i = 0; i < 5; i++) {
      s = scoreWith(s, [0, 1, 2]); // everyone different, every time
      if (i < 4) s = nextQuestion(s);
    }
    expect(s.winners).toEqual(['ana', 'ben', 'cy']);
    expect(celebrated(s)).toBe(false);
  });

  it('a sheep holder with the most points ranks right below the winners', () => {
    let s = atAnswer({ maxQuestions: 5, target: 15 }, 4);
    s = { ...s, scores: { ana: 0, ben: 0, cy: 0, dee: 9 } };
    s = scoreWith(s, [0, 0, 1, 2]); // ana ben +1; two alone → sheep stays in the pasture
    s = { ...s, sheep: 'dee' };
    s = timer(skip(s)); // → next answer → … end the game early
    const done = game.reduce(s, { type: 'vip', now: s.phase.startedAt + 1, action: 'end' });
    const r = game.results(done);
    expect(r?.winnerIds).toEqual(['ana', 'ben']);
    expect(r?.ranking.map((x) => [x.playerId, x.rank])).toEqual([
      ['ana', 1],
      ['ben', 1],
      ['dee', 3],
      ['cy', 4],
    ]);
  });

  it('awards: skipped when unearned, one winner on a tie (seat order)', () => {
    let s = atAnswer({ maxQuestions: 5, target: 15 }, 3);
    s = scoreWith(s, [0, 0, 1]);
    s = nextQuestion(s);
    s = scoreWith(s, [0, 0, 1]);
    const done = game.reduce(s, { type: 'vip', now: s.phase.startedAt + 1, action: 'end' });
    const ids = (game.results(done)?.awards ?? []).map((a) => `${a.id}:${a.playerId}`);
    expect(ids).toEqual([
      'head-of-herd:ana',
      'free-spirit:cy',
      'black-sheep:cy',
      'mind-meld:ana',
      'mind-meld:ben',
    ]);
  });

  it('awards: a tie goes to the higher score first', () => {
    let s = atAnswer({ maxQuestions: 5, target: 15 }, 3);
    s = scoreWith(s, [0, 0, 1]);
    s = { ...s, scores: { ...s.scores, ben: 5 } };
    const done = game.reduce(s, { type: 'vip', now: s.phase.startedAt + 1, action: 'end' });
    const heads = (game.results(done)?.awards ?? []).filter((a) => a.id === 'head-of-herd');
    expect(heads.map((a) => a.playerId)).toEqual(['ben']);
  });
});

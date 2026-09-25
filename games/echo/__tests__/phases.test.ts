// Phase exits (deadline, all done, VIP skip), swaps, drops, leavers, idle play, and the edge
// cases of §7.16.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import type { State } from '../server/types';
import { atClue, botRng, clue, input, skip, start, T0, timer, withClues } from './helpers';

describe('phase order and exits', () => {
  it('intro → clue on the clock or the VIP; a 1.5 s title beat (the shell stage has the rules)', () => {
    const s = start(5);
    expect(s.phase).toMatchObject({ id: 'intro', deadline: T0 + 1500 });
    expect(timer(s).phase.id).toBe('clue');
    expect(skip(s, T0 + 10).phase.id).toBe('clue');
  });

  it('clue ends when every connected clue-giver is in; the guesser never counts', () => {
    let s = atClue(5);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 35_000);
    s = withClues(s, ['stars', 'lens', 'Galileo']);
    expect(s.phase.id).toBe('clue');
    expect(clue(s, 'p1', 'moon')).toBe(s);
    s = clue(s, 'p5', 'zoom');
    expect(s.phase.id).toBe('check');
    expect(s.phase.deadline).toBe(s.phase.startedAt + 12_000);
    expect(game.tvView(s).timerMode).toBe('quiet');
  });

  it('check ends when every clue-giver taps Looks good, or by the clock or VIP', () => {
    let s = withClues(atClue(4), ['stars', 'lens', 'zoom']);
    for (const p of ['p2', 'p3']) s = input(s, p, { type: 'ok' });
    expect(s.phase.id).toBe('check');
    s = input(s, 'p4', { type: 'ok' });
    expect(s.phase.id).toBe('guess');
    const viaClock = timer(withClues(atClue(4), ['stars', 'lens', 'zoom']));
    expect(viaClock.phase.id).toBe('guess');
  });

  it('check is skipped when switched off or with fewer than two clues', () => {
    const off = withClues(atClue(4, { check: false }), ['stars', 'lens', 'zoom']);
    expect(off.phase.id).toBe('guess');
    const one = timer(clue(atClue(4), 'p2', 'stars'));
    expect(one.phase.id).toBe('guess');
    const none = timer(atClue(4));
    expect(none.phase.id).toBe('guess');
    expect(game.tvView(none)).toMatchObject({ survivors: [], echoCount: 0, clueCount: 0 });
  });

  it('every clue echoing shows a total echo (the guesser may still try)', () => {
    const s = skip(withClues(atClue(4), ['stars', 'star', 'Stars']));
    const tv = game.tvView(s);
    expect(tv).toMatchObject({ phaseId: 'guess', survivors: [], echoCount: 3 });
    expect(tv.say.map((x) => x.text)).toEqual(['Total echo!']);
    expect(input(s, 'p1', { type: 'guess', text: 'sky' }).phase.id).toBe('result');
  });

  it('a guess before the TV has shown every clue is held until the reveal ends', () => {
    const g = skip(withClues(atClue(4), ['stars', 'lens', 'zoom']));
    const held = input(g, 'p1', { type: 'guess', text: 'telescope' }, g.phase.startedAt + 900);
    expect(held.phase.id).toBe('guess');
    expect(held.phase.deadline).toBe(g.phase.startedAt + 1300 + 2 * 420 + 1400);
    expect(game.tvView(held).guessIn).toBe(true);
    expect(game.bot.sampleInput(held, 'p1', botRng())).toBeNull();
    expect(input(held, 'p1', { type: 'pass' }, g.phase.startedAt + 950)).toBe(held);
    expect(timer(held).w.guess).toMatchObject({ text: 'telescope', result: 'right' });
    expect(skip(held).w.guess?.result).toBe('right');
  });

  it('only the guesser guesses; the VIP skip in guess is a pass', () => {
    const g = skip(withClues(atClue(4), ['stars', 'lens', 'zoom']));
    expect(input(g, 'p2', { type: 'guess', text: 'telescope' })).toBe(g);
    expect(skip(g).w.guess?.result).toBe('pass');
  });

  it('result lasts about 6 s (longer when a word burns), then the next word', () => {
    const g = skip(withClues(atClue(4), ['stars', 'lens', 'zoom']));
    const right = input(g, 'p1', { type: 'guess', text: 'telescope' });
    expect(right.phase.deadline).toBe(right.phase.startedAt + 6_500);
    const wrong = input(g, 'p1', { type: 'guess', text: 'microscope' });
    expect(wrong.phase.deadline).toBe(wrong.phase.startedAt + 8_300);
    expect(skip(right).phase.id).toBe('clue');
  });

  it('pause stops the check clock; resume shifts it', () => {
    const c = withClues(atClue(4), ['stars', 'lens', 'zoom']);
    const paused = game.reduce(c, { type: 'vip', now: c.phase.startedAt + 2000, action: 'pause' });
    expect(input(paused, 'p2', { type: 'ok' })).toBe(paused);
    const resumed = game.reduce(paused, {
      type: 'vip',
      now: c.phase.startedAt + 7000,
      action: 'resume',
    });
    expect(resumed.phase.deadline).toBe((c.phase.deadline as number) + 5000);
  });
});

describe("Don't know it", () => {
  it('half the connected clue-givers (rounded up) within 15 s swap the word', () => {
    let s = atClue(5);
    const before = s.w.word.id;
    s = input(s, 'p2', { type: 'dontKnow' });
    expect(s.w.word.id).toBe(before);
    s = clue(s, 'p4', 'stars');
    s = input(s, 'p3', { type: 'dontKnow' });
    expect(s.w.word.id).not.toBe(before);
    expect(s.w).toMatchObject({ swaps: 1, clues: {}, dontKnow: [], guesser: 'p1' });
    expect(s.deck[0]?.id).toBe(s.w.word.id);
    expect(s.spares).toHaveLength(5);
    expect(game.tvView(s).swapped).toBe(true);
  });

  it('taps after 15 s do nothing', () => {
    const s = atClue(5);
    const late = input(s, 'p2', { type: 'dontKnow' }, s.phase.startedAt + 15_001);
    expect(late).toBe(s);
  });

  it('at most two swaps per word, and none once the spares run out', () => {
    let s = atClue(3);
    for (let i = 0; i < 3; i++) {
      s = input(s, 'p2', { type: 'dontKnow' });
      s = input(s, 'p3', { type: 'dontKnow' });
    }
    expect(s.w.swaps).toBe(2);
    expect(game.controllerView(s, 'p2').dontKnow?.open).toBe(false);
    const dry: State = { ...atClue(3), spares: [] };
    expect(input(input(dry, 'p2', { type: 'dontKnow' }), 'p3', { type: 'dontKnow' }).w.swaps).toBe(
      0,
    );
    expect(game.controllerView(dry, 'p2').dontKnow?.open).toBe(false);
  });

  it('the guesser cannot vote, and never sees the count', () => {
    let s = atClue(5);
    expect(input(s, 'p1', { type: 'dontKnow' })).toBe(s);
    s = input(s, 'p2', { type: 'dontKnow' });
    const g = game.controllerView(s, 'p1');
    expect(g.dontKnow).toBeNull();
    expect(JSON.stringify(g)).not.toContain('dontKnow":{');
  });
});

describe('drops, leavers, idle', () => {
  it('a dropped clue-giver does not hold the clue phase', () => {
    let s = withClues(atClue(5), ['stars', 'lens', 'Galileo']);
    s = game.reduce(s, {
      type: 'player',
      now: s.phase.startedAt + 5,
      playerId: 'p5',
      connected: false,
    });
    expect(s.phase.id).toBe('check');
  });

  it('a dropped guesser still gets a turn that times out as a pass', () => {
    let s = atClue(4);
    s = game.reduce(s, { type: 'player', now: T0 + 5, playerId: 'p1', connected: false });
    s = skip(withClues(s, ['stars', 'lens', 'zoom']));
    expect(timer(s).w.guess?.result).toBe('pass');
  });

  it('a drop during a pause is re-checked on resume (no waiting out the clock)', () => {
    let s = withClues(atClue(5), ['stars', 'lens', 'Galileo']);
    const at = s.phase.startedAt;
    s = game.reduce(s, { type: 'vip', now: at + 2000, action: 'pause' });
    s = game.reduce(s, { type: 'player', now: at + 3000, playerId: 'p5', connected: false });
    expect(s.phase.id).toBe('clue');
    s = game.reduce(s, { type: 'vip', now: at + 4000, action: 'resume' });
    expect(s.phase.id).toBe('check');
  });

  it('a guesser who leaves for good during guess passes at once', () => {
    const g = skip(withClues(atClue(4), ['stars', 'lens', 'zoom']));
    const s = game.reduce(g, {
      type: 'player',
      now: g.phase.startedAt + 3000,
      playerId: 'p1',
      connected: false,
      gone: 'left',
    });
    expect(s.phase.id).toBe('result');
    expect(s.w.guess?.result).toBe('pass');
  });

  it('a player who left is skipped in the rotation', () => {
    let s = atClue(4);
    s = game.reduce(s, {
      type: 'player',
      now: T0 + 5,
      playerId: 'p2',
      connected: false,
      gone: 'left',
    });
    expect(s.left).toEqual(['p2']);
    s = skip(skip(s));
    expect(s.phase.id).toBe('result');
    expect(skip(s).w.guesser).toBe('p3');
  });

  it('only one clue-giver connected: their clue cannot echo; play on', () => {
    let s = atClue(4);
    for (const p of ['p3', 'p4'])
      s = game.reduce(s, { type: 'player', now: T0 + 5, playerId: p, connected: false });
    s = clue(s, 'p2', 'stars');
    expect(s.phase.id).toBe('guess');
    expect(game.tvView(s).survivors).toEqual(['stars']);
  });

  it('everyone idle: every word times out and the game ends', () => {
    let s = start(4);
    let steps = 0;
    while (s.phase.id !== 'done' && steps++ < 200) s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.scores['p1']).toBe(0);
    expect(s.turns).toHaveLength(10);
  });

  it('a spectator is ignored and gets TV-level views', () => {
    const s = atClue(4);
    expect(clue(s, 'late', 'stars')).toBe(s);
    const v = game.controllerView(s, 'late');
    expect(v).toMatchObject({ role: 'watcher', secret: null, me: { role: 'spectator' } });
  });
});

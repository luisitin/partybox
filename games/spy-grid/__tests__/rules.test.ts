// Clue rules (§9.8), co-op (§9.11), bots (§9.15), awards (§9.10) and the teams phase (§9.6).
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { spymasterClue } from '../server/bot';
import { clueProblem } from '../server/clue-rules';
import { FAMILY_THEMES } from '../server/content';
import { game } from '../server/index';
import { allPoint, clue, finishFlip, rigged, send, skip, start, tick } from './kit';
import type { State } from '../server/types';

const card = (s: State, i: number): string => s.board[i]?.itemId ?? '';

describe('clue rules', () => {
  it('rejects a face-down board word and its forms, with the reason on the phone', () => {
    let s = rigged();
    const word = card(s, 3);
    for (const w of [word, `${word}s`, word.toUpperCase()]) {
      s = send(s, 'p1', { type: 'clue', word: w, number: 2 });
      expect(s.phase.id).toBe('clue');
      expect(game.controllerView(s, 'p1').clueError).toEqual({ word: w, reason: 'board' });
    }
    expect(game.controllerView(s, 'p2').clueError).toBeNull();
  });

  it('allows a flipped word', () => {
    let s = rigged();
    s = { ...s, flipped: s.flipped.map((f, i) => (i === 3 ? 2 : f)) };
    s = send(s, 'p1', { type: 'clue', word: card(s, 3), number: 1 });
    expect(s.phase.id).toBe('guess');
  });

  it('rejects digits, two words and long words', () => {
    expect(clueProblem('B3', [])).toBe('digits');
    expect(clueProblem('ice cream', [])).toBe('one-word');
    expect(clueProblem('   ', [])).toBe('one-word');
    expect(clueProblem('abcdefghijklmnopqrstu', [])).toBe('too-long');
    expect(clueProblem('ocean', [{ answer: 'shark', family: ['shark'] }])).toBeNull();
    expect(
      clueProblem('sunny', [{ answer: 'sunflower', family: ['sunflower', 'sun', 'flower'] }]),
    ).toBe('board');
  });

  it('only the active spymaster can clue', () => {
    const s = rigged();
    expect(send(s, 'p4', { type: 'clue', word: 'zzyzx', number: 2 }).phase.id).toBe('clue');
    expect(send(s, 'p2', { type: 'clue', word: 'zzyzx', number: 2 }).phase.id).toBe('clue');
  });
});

describe('co-op', () => {
  it('2–3 players play one team with 9 agents, 15 bystanders and a clue budget', () => {
    const s = start(3, { teamPick: 'random', coopTurns: 5 });
    expect(s.mode).toBe('coop');
    expect(s.teams.moon).toEqual([]);
    expect(s.key.filter((k) => k === 'bystander')).toHaveLength(15);
    expect(s.coop?.cluesLeft).toBe(5);
  });

  it('running out of clues is a loss (everyone still ties: the platform needs a winner)', () => {
    let s = start(2, { teamPick: 'random', coopTurns: 5 });
    for (let i = 0; i < 5; i++) s = tick(tick(clue(s, 1)));
    expect(s.phase.id).toBe('win');
    expect(s.reason).toBe('clues');
    expect(s.winner).toBeNull();
    s = tick(s);
    expect(game.results(s)?.scores).toEqual({ p1: 0, p2: 0 });
  });

  it('finding all nine agents is a win that crowns everyone', () => {
    let s = start(2, { teamPick: 'random' });
    const agents = s.key.map((k, i) => (k === 'sun' ? i : -1)).filter((i) => i >= 0);
    s = { ...s, flipped: s.flipped.map((_, i) => (agents.slice(0, 8).includes(i) ? 2 : 0)) };
    s = finishFlip(allPoint(clue(s, 1), agents[8] ?? 0));
    expect(s.winner).toBe('sun');
    s = tick(s);
    expect(game.results(s)?.winnerIds.sort()).toEqual(['p1', 'p2']);
    expect(game.results(s)?.scores['p1']).toBe(1);
  });
});

describe('bots', () => {
  it('the spymaster never clues a theme that holds the face-down assassin', () => {
    let themed = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const s = start(4, { teamPick: 'random' }, seed, 4);
      const spy = s.turn.spymaster ?? '';
      const v = game.controllerView(s, spy);
      const input = spymasterClue(v, createRng(seed));
      expect(input?.type).toBe('clue');
      if (input?.type !== 'clue') continue;
      const assassin = s.board[s.key.indexOf('assassin')]?.itemId ?? '';
      const theme = FAMILY_THEMES.find((t) => [t.clue, ...t.alts].includes(input.word));
      if (theme) expect(theme.members, `${seed}: ${input.word}`).not.toContain(assassin);
      else expect(input.number).toBe(1); // the one-agent hint fallback
      themed += theme ? 1 : 0;
    }
    expect(themed).toBeGreaterThan(20);
  });

  it('bot guessers on an all-bot team follow a theme clue in theme order', () => {
    let s = start(4, { teamPick: 'random' }, 11, 4);
    const spy = s.turn.spymaster ?? '';
    const input = spymasterClue(game.controllerView(s, spy), createRng(1));
    if (input?.type !== 'clue') throw new Error('no clue');
    s = send(s, spy, input);
    const guesser = s.teams[s.turn.team].find((id) => id !== spy) ?? '';
    const point = game.bot.sampleInput(s, guesser, createRng(2));
    expect(point?.type).toBe('point');
  });

  it('play varies across games', () => {
    const clues = new Set<string>();
    for (let seed = 1; seed <= 10; seed++) {
      const s = start(4, { teamPick: 'random' }, seed, 4);
      const i = spymasterClue(game.controllerView(s, s.turn.spymaster ?? ''), createRng(seed));
      if (i?.type === 'clue') clues.add(i.word);
    }
    expect(clues.size).toBeGreaterThan(5);
  });
});

describe('teams phase', () => {
  it('join, volunteer and shuffle (VIP only); the result is balanced with a spymaster each', () => {
    let s = start(6);
    expect(s.phase.id).toBe('teams');
    for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) s = send(s, id, { type: 'join', team: 'sun' });
    s = send(s, 'p3', { type: 'volunteer', on: true });
    const before = s.teams;
    expect(send(s, 'p1', { type: 'shuffle' }).teams).toEqual(before);
    s = skip(s);
    expect(s.phase.id).toBe('clue');
    expect(Math.abs(s.teams.sun.length - s.teams.moon.length)).toBeLessThanOrEqual(1);
    expect(s.spymaster.sun).toBe('p3');
    expect(s.spymaster.moon).not.toBeNull();
  });

  it('balancing moves bots across first: two people who both tap Sun stay on Sun', () => {
    // 2 people + 4 bots; the bots were seated on Sun last (session-c #4: a person got moved).
    let s = start(6, {}, 1, 4);
    s = send(s, 'p1', { type: 'join', team: 'sun' });
    s = send(s, 'p2', { type: 'join', team: 'sun' });
    for (const id of ['p3', 'p4', 'p5', 'p6']) s = send(s, id, { type: 'join', team: 'sun' });
    s = skip(s);
    expect(s.teams.sun).toEqual(expect.arrayContaining(['p1', 'p2']));
    expect(s.teams.sun.length - s.teams.moon.length).toBeLessThanOrEqual(1);
  });

  it('teams has no fixed clock: an untouched room starts at the net, a touched one re-arms (10 min cap)', () => {
    const idle = tick(start(6));
    expect(idle.phase.id).toBe('clue');
    let s = send(start(6), 'p1', { type: 'join', team: 'sun' });
    s = tick(s);
    expect(s.phase.id).toBe('teams');
    for (let i = 0; i < 12 && s.phase.id === 'teams'; i++) s = tick(s);
    expect(s.phase.id).toBe('clue');
    expect(s.phase.startedAt - start(6).phase.startedAt).toBeLessThanOrEqual(600_000 + 60_000);
  });

  it('awards: Trap Door goes to the first pointer at a flipped assassin', () => {
    let s = rigged();
    s = send(clue(s, 2), 'p2', { type: 'point', target: 24 });
    s = finishFlip(send(s, 'p3', { type: 'point', target: 24 }));
    s = tick(s);
    const trap = game.results(s)?.awards.find((a) => a.id === 'trap-door');
    expect(trap?.playerId).toBe('p2');
  });
});

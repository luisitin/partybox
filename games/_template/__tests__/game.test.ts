// Unit tests for Quick Poll. The contract suite covers totality/determinism/termination; these
// pin the rules written in README.md (scoring, phase exits) with hand-built events.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import type { Input, State } from '../server/types';

const T0 = 1_000_000;
const players = [
  { id: 'a', name: 'Ana', avatarId: 'fox', connected: true },
  { id: 'b', name: 'Ben', avatarId: 'owl', connected: true },
];

function start(): State {
  return game.init({ players, settings: { answerSeconds: 30 }, seed: 1, now: T0 });
}

function answer(state: State, playerId: string, text: string, now = T0 + 1000): State {
  const input: Input = { type: 'answer', text };
  return game.reduce(state, { type: 'input', now, playerId, input });
}

describe('Quick Poll', () => {
  it('starts in answer with a 30 s deadline', () => {
    const s = start();
    expect(s.phase).toEqual({ id: 'answer', startedAt: T0, deadline: T0 + 30_000 });
    expect(game.results(s)).toBeNull();
  });

  it('moves to reveal once every connected player answered, scoring 1 per answer', () => {
    let s = answer(start(), 'a', 'pizza');
    expect(s.phase.id).toBe('answer');
    s = answer(s, 'b', 'tacos');
    expect(s.phase.id).toBe('reveal');
    expect(s.scores).toEqual({ a: 1, b: 1 });
  });

  it('a second answer from the same player is ignored', () => {
    const s = answer(answer(start(), 'a', 'first'), 'a', 'second');
    expect(s.answers['a']).toBe('first');
  });

  it('the deadline reveals whatever was answered; non-answerers score 0', () => {
    let s = answer(start(), 'a', 'pizza');
    s = game.reduce(s, { type: 'timer', now: T0 + 30_000, phaseId: 'answer', startedAt: T0 });
    expect(s.phase.id).toBe('reveal');
    expect(s.scores).toEqual({ a: 1, b: 0 });
    s = game.reduce(s, {
      type: 'timer',
      now: s.phase.deadline as number,
      phaseId: 'reveal',
      startedAt: s.phase.startedAt,
    });
    expect(game.results(s)?.winnerIds).toEqual(['a']);
  });

  it('a disconnected player does not block the "all answered" exit', () => {
    let s = game.reduce(start(), { type: 'player', now: T0 + 5, playerId: 'b', connected: false });
    s = answer(s, 'a', 'solo');
    expect(s.phase.id).toBe('reveal');
  });

  it('F-001: VIP end during answer keeps the answers submitted so far', () => {
    let s = answer(start(), 'a', 'early');
    s = game.reduce(s, { type: 'vip', now: T0 + 2000, action: 'end' });
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.scores).toEqual({ a: 1, b: 0 });
    expect(game.results(s)?.winnerIds).toEqual(['a']);
  });

  it('F-006: prototype keys are not players', () => {
    const initial = start();
    const s = answer(initial, 'constructor', 'sneaky');
    expect(s).toBe(initial);
    expect(s.answers).toEqual({});
    expect(game.bot.sampleInput(start(), 'toString', { pick: () => 'x' } as never)).toBeNull();
  });

  it('hides answers from the TV until reveal and from other phones always', () => {
    const s = answer(start(), 'a', 'secretword');
    expect(JSON.stringify(game.tvView(s))).not.toContain('secretword');
    expect(JSON.stringify(game.controllerView(s, 'b'))).not.toContain('secretword');
    expect(game.controllerView(s, 'a')).toMatchObject({ submitted: true, myAnswer: 'secretword' });
  });
});

// I-105 (preview branch): the pick after a bingo is a vote.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { VOTE_MS } from '../server/types';
import type { Input, State } from '../server/types';
import { after, callUntil, claim, daubAll, input, start, timer } from './helpers';

const LINE = [0, 1, 2, 3, 4];

function won(): State {
  let s = callUntil(start(), 'a', LINE);
  s = daubAll(s, 'a', LINE);
  return claim(s, 'a');
}

const vipVote = (s: State, playerId: string, value: Input, now: number): State =>
  game.reduce(s, { type: 'input', now, playerId, input: value, vip: true });

describe('I-105 the vote after a bingo', () => {
  it('keeps every phone voting until it closes, then the majority wins', () => {
    const s0 = won();
    const t = after(s0);
    let s = input(s0, 'b', { type: 'continue', pattern: 'blackout' }, t);
    expect(s.phase.id).toBe('bingo'); // a single tap no longer decides for the room
    expect(game.controllerView(s, 'c').decide).not.toBeNull(); // c can still vote
    expect(game.controllerView(s, 'c').pendingDecision).toBeNull();
    s = input(s, 'c', { type: 'next' }, t + 500);
    s = input(s, 'b', { type: 'next' }, t + 900); // b changes their mind
    expect(s.phase.deadline).toBe(t + VOTE_MS);
    expect(timer(s).phase.id).toBe('scoreboard'); // next round: 2 votes to 0
  });

  it('closes early once every connected person with cards has voted', () => {
    const s0 = won();
    const t = after(s0);
    let s = input(s0, 'a', { type: 'next' }, t);
    s = input(s, 'b', { type: 'next' }, t + 200);
    expect(s.phase.id).toBe('bingo');
    s = input(s, 'c', { type: 'continue', pattern: 'same' }, t + 400);
    expect(s.phase.id).toBe('scoreboard'); // all three in: decided at once, 2 to 1
  });

  it('a tie goes to the VIP, else to the first vote cast', () => {
    const s0 = won();
    const t = after(s0);
    const first = input(s0, 'b', { type: 'next' }, t);
    const tiedVip = vipVote(first, 'a', { type: 'continue', pattern: 'same' }, t + 300);
    expect(timer(tiedVip).phase.id).toBe('play'); // 1-1: the VIP's 'same pattern'
    const tiedPlain = input(first, 'c', { type: 'continue', pattern: 'same' }, t + 300);
    expect(timer(tiedPlain).phase.id).toBe('scoreboard'); // 1-1: b voted first
  });
});

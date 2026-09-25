// Turn rules and round ends (SPEC §9.9): the number + 1 limit, each identity's outcome, flipping
// the enemy's last agent, no clue, the cap, the idle draw, forfeit, and several rounds.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { allPoint, clue, drop, finishFlip, rigged, send, skip, tick } from './kit';
import type { State } from '../server/types';

/** Points sun's guessers at `card` and plays the flip out. */
function flip(s: State, card: number): State {
  return finishFlip(allPoint(s, card));
}

describe('a turn', () => {
  it('allows the number + 1 flips, then "Out of guesses"', () => {
    let s = clue(rigged(), 1);
    expect(s.turn.left).toBe(2);
    s = flip(s, 0);
    expect(s.phase.id).toBe('guess');
    s = flip(s, 1);
    expect(s.phase.id).toBe('turn-end');
    expect(s.turn.ended).toBe('outOfGuesses');
    s = tick(s);
    expect(s.phase.id).toBe('clue');
    expect(s.turn.team).toBe('moon');
  });

  it('a bystander ends the turn', () => {
    const s = flip(clue(rigged(), 3), 17);
    expect(s.phase.id).toBe('turn-end');
    expect(s.turn.ended).toBe('flip');
  });

  it('an enemy agent ends the turn and counts for them', () => {
    const s = flip(clue(rigged(), 3), 9);
    expect(s.phase.id).toBe('turn-end');
    expect(game.tvView(s).left).toEqual({ sun: 9, moon: 7 });
  });

  it('the assassin ends the round: the other team wins at once', () => {
    const s = flip(clue(rigged(), 3), 24);
    expect(s.phase.id).toBe('win');
    expect(s.winner).toBe('moon');
    expect(s.reason).toBe('assassin');
    expect(s.flipped.every((f) => f === 2)).toBe(true);
  });

  it("flipping the enemy's last agent makes the enemy win", () => {
    let s = rigged();
    s = { ...s, flipped: s.flipped.map((_, i) => (i >= 9 && i <= 15 ? 2 : 0)) };
    s = flip(clue(s, 2), 16);
    expect(s.phase.id).toBe('win');
    expect(s.winner).toBe('moon');
    expect(s.reason).toBe('agents');
  });

  it('finding every own agent wins', () => {
    let s = rigged();
    s = { ...s, flipped: s.flipped.map((_, i) => (i < 8 ? 2 : 0)) };
    s = flip(clue(s, 1), 8);
    expect(s.winner).toBe('sun');
  });
});

describe('no clue', () => {
  it('passes the turn with "No clue!"', () => {
    let s = tick(rigged());
    expect(s.phase.id).toBe('turn-end');
    expect(s.turn.ended).toBe('noClue');
    s = tick(s);
    expect(s.turn.team).toBe('moon');
    expect(s.phase.id).toBe('clue');
  });

  it('four clueless turns in a row are a draw ("Nobody\'s talking!")', () => {
    let s = rigged();
    for (let i = 0; i < 4; i++) s = tick(tick(s));
    expect(s.phase.id).toBe('win');
    expect(s.winner).toBe('draw');
    expect(s.reason).toBe('idle');
  });

  it('a VIP skip in clue passes the turn too', () => {
    const s = skip(rigged());
    expect(s.phase.id).toBe('turn-end');
    expect(s.turn.ended).toBe('noClue');
  });
});

describe('the turn cap', () => {
  it('after maxTurns the team with fewer agents left wins; equal is a draw', () => {
    let s = rigged(6, { maxTurns: 16 });
    s = { ...s, flipped: s.flipped.map((_, i) => (i < 3 ? 2 : 0)) };
    for (let turn = 0; turn < 16; turn++) {
      s = clue(s, 1, turn % 2 === 0 ? 'zzyzx' : 'qwxz');
      s = tick(tick(s));
    }
    expect(s.phase.id).toBe('win');
    expect(s.reason).toBe('cap');
    expect(s.winner).toBe('sun');
  });
});

describe('forfeit', () => {
  it('a team whose members all left but the spymaster loses the round', () => {
    let s = clue(rigged(), 2);
    s = drop(s, 'p5', 'left');
    expect(s.phase.id).toBe('guess');
    s = drop(s, 'p6', 'left');
    expect(s.phase.id).toBe('win');
    expect(s.winner).toBe('sun');
    expect(s.reason).toBe('forfeit');
  });

  it('merely dropping is not leaving', () => {
    let s = clue(rigged(), 2);
    s = drop(drop(s, 'p5'), 'p6');
    expect(s.phase.id).toBe('guess');
  });
});

describe('rounds', () => {
  it('keeps the teams, rotates spymasters, draws a new board, counts round wins', () => {
    let s = rigged(6, { rounds: 2 });
    const board = s.board.map((c) => c.itemId).join();
    s = finishFlip(allPoint(clue(s, 3), 24));
    expect(s.roundWins).toEqual({ sun: 0, moon: 1 });
    s = tick(s);
    expect(s.round).toBe(2);
    expect(s.teams.sun).toEqual(['p1', 'p2', 'p3']);
    expect(s.spymaster).toEqual({ sun: 'p2', moon: 'p5' });
    expect(s.board.map((c) => c.itemId).join()).not.toBe(board);
    expect(s.phase.id).toBe('clue');
  });

  it('the last round ends in done with every player in the results', () => {
    let s = finishFlip(allPoint(clue(rigged(), 3), 24));
    s = tick(s);
    expect(s.phase.id).toBe('done');
    const r = game.results(s);
    expect(Object.keys(r?.scores ?? {}).sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
    expect(r?.winnerIds.sort()).toEqual(['p4', 'p5', 'p6']);
  });

  it('a spymaster who left is replaced by rule at their next clue', () => {
    let s = clue(rigged(), 1);
    s = drop(s, 'p4', 'left');
    s = tick(finishFlip(allPoint(s, 17)));
    expect(s.turn.team).toBe('moon');
    expect(s.turn.spymaster).toBe('p5');
    expect(s.turn.newSpymaster).toBe('p5');
  });

  it('VIP skip in guess ends the turn; in flip it completes the flip', () => {
    let s = clue(rigged(), 2);
    s = skip(s);
    expect(s.phase.id).toBe('turn-end');
    s = clue(tick(s), 2);
    expect(s.turn.team).toBe('moon');
    s = send(s, 'p5', { type: 'point', target: 9 });
    s = send(s, 'p6', { type: 'point', target: 9 });
    expect(s.phase.id).toBe('flip');
    expect(s.flipped[9]).toBe(1);
    s = skip(s);
    expect(s.flipped[9]).toBe(2);
    expect(s.phase.id).toBe('guess');
  });
});

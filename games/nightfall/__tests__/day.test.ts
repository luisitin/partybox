// SPEC §10.6 / §10.20 "Day": plurality, No one, runoffs and ties, a Ready majority ends the day
// early, the 3-post limit; the day's clock survives pause and bots' beats.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { EIGHT, finish, input, night, phone, start, timer, toNight, vip, votes } from './helpers';
import type { State } from '../server/types';

/** Day 1 after a quiet night. */
function dayOne(settings = {}, bots: string[] = []): State {
  const s = night(toNight(start({ roles: EIGHT, settings, bots })), {});
  return finish(s);
}

function toVote(state: State): State {
  return vip(state, 'skip');
}

describe('day and vote', () => {
  it('day follows a quiet night; the vote follows the day', () => {
    const s = dayOne();
    expect(s.phase.id).toBe('day');
    expect(toVote(s).phase.id).toBe('vote');
  });

  it('a Ready majority of the living ends the day early (a toggle)', () => {
    let s = dayOne();
    for (const id of ['ana', 'ben', 'cy', 'dee']) s = input(s, id, { type: 'ready' });
    expect(s.phase.id).toBe('day'); // 4 of 8 is not more than half
    s = input(s, 'dee', { type: 'ready' }); // untap
    expect(game.tvView(s).readyCount).toBe(3);
    s = input(s, 'dee', { type: 'ready' });
    s = input(s, 'eli', { type: 'ready' });
    expect(s.phase.id).toBe('vote');
  });

  it('the plurality goes out when ahead of No one and everyone else', () => {
    const s = votes(toVote(dayOne()), {
      ana: 'ben',
      dee: 'ben',
      eli: 'ben',
      ben: 'dee',
      cy: 'dee',
    });
    expect(s.phase.id).toBe('verdict');
    expect(s.verdict?.out).toBe('ben');
    expect(s.alive).not.toContain('ben');
  });

  it('No one level with the top player: nobody goes', () => {
    const s = votes(toVote(dayOne()), { ana: 'ben', dee: 'ben', eli: 'none', fay: 'none' });
    expect(s.verdict).toMatchObject({ out: null, reason: 'noone' });
    expect(s.alive).toHaveLength(8);
  });

  it('a tie at the top gets one runoff among the tied; still tied = nobody', () => {
    const s = votes(toVote(dayOne()), { ana: 'ben', dee: 'ben', eli: 'cy', fay: 'cy' });
    expect(s.phase.id).toBe('runoff');
    expect(s.runoff).toEqual(['ben', 'cy']);
    expect(game.tvView(s).runoff).toEqual(['ben', 'cy']);
    expect(phone(s, 'ana').vote?.candidates).toEqual(['ben', 'cy']);
    expect(input(s, 'ana', { type: 'vote', target: 'dee' }).votes).toEqual({});
    const tied = votes(s, { ana: 'ben', dee: 'cy' });
    expect(tied.verdict).toMatchObject({ out: null, reason: 'tie', runoff: true });
    const decided = votes(s, { ana: 'ben', dee: 'ben', eli: 'cy' });
    expect(decided.verdict?.out).toBe('ben');
  });

  it('votes for self, the dead or unknown ids are ignored; resending changes the vote', () => {
    let s = toVote(dayOne());
    s = input(s, 'ana', { type: 'vote', target: 'ana' });
    s = input(s, 'ana', { type: 'vote', target: 'zed' });
    expect(s.votes).toEqual({});
    s = input(s, 'ana', { type: 'vote', target: 'ben' });
    s = input(s, 'ana', { type: 'vote', target: 'none' });
    expect(s.votes).toEqual({ ana: 'none' });
  });

  it('the verdict reveals face by face: ballots, then who, then the role', () => {
    let s = votes(toVote(dayOne()), { ana: 'ben', dee: 'ben', eli: 'ben' });
    let v = game.tvView(s).stage.verdict;
    expect(v?.ballots).toHaveLength(3);
    expect(v?.out).toBeNull();
    expect(v?.role).toBeNull();
    s = timer(s);
    v = game.tvView(s).stage.verdict;
    expect(v?.out).toBe('ben');
    expect(v?.role).toBeNull();
    expect(game.tvView(s).stage.lines).toEqual(['Ben was…']);
    s = timer(s);
    expect(game.tvView(s).stage.verdict?.role).toBe('wolf');
    expect(game.tvView(s).graveyard).toEqual([{ id: 'ben', how: 'vote', day: 1, role: 'wolf' }]);
  });

  it('with revealRoles off the graveyard shows "?" until the end', () => {
    let s = votes(toVote(dayOne({ revealRoles: false })), { ana: 'ben', dee: 'ben' });
    s = finish(s);
    expect(game.tvView(s).graveyard[0]?.role).toBeNull();
  });

  it('town board: 3 posts per day, 80 characters kept, empty posts refused, off = ignored', () => {
    let s = dayOne({ townBoard: 'on' });
    for (let i = 0; i < 4; i++)
      s = input(s, 'ana', { type: 'post', text: `post ${i} ${'x'.repeat(90)}` });
    expect(s.board).toHaveLength(3);
    expect(s.board[0]?.text.length).toBe(80);
    expect(phone(s, 'ana').postsLeft).toBe(0);
    expect(input(s, 'dee', { type: 'post', text: '  !!! ' }).board).toHaveLength(3);
    const off = dayOne();
    expect(input(off, 'ana', { type: 'post', text: 'hello' }).board).toEqual([]);
    expect(phone(off, 'ana').postsLeft).toBeNull();
  });

  it('the day clock is the view deadline; pause shifts it and the bots’ beats', () => {
    const s = dayOne({}, ['dee', 'fay']);
    const end = s.dayEndsAt as number;
    expect(game.tvView(s).deadline).toBe(end);
    expect(s.beats.map((b) => b.bot).sort()).toEqual(['dee', 'fay']);
    const paused = vip(s, 'pause', s.phase.startedAt + 1000);
    const resumed = vip(paused, 'resume', s.phase.startedAt + 11_000);
    expect(resumed.dayEndsAt).toBe(end + 10_000);
    expect(resumed.beats[0]?.at).toBe((s.beats[0]?.at ?? 0) + 10_000);
  });

  it('bot beats tap Ready 20–60 s in and can end the day by majority', () => {
    let s = dayOne({}, ['dee', 'fay', 'gus', 'hal', 'eli']);
    for (const b of s.beats) {
      expect(b.at - s.phase.startedAt).toBeGreaterThanOrEqual(20_000);
      expect(b.at - s.phase.startedAt).toBeLessThanOrEqual(60_000);
    }
    s = finish(s);
    expect(s.phase.id).toBe('vote');
  });

  it('bots post on the town board from their own view', () => {
    let s = dayOne({ townBoard: 'on' }, ['dee', 'fay', 'gus']);
    for (let i = 0; i < 20 && s.phase.id === 'day'; i++) s = timer(s);
    const posts = s.days.at(-1)?.board ?? s.board;
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) expect(p.text.length).toBeLessThanOrEqual(80);
  });
});

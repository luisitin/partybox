// Scoring rules from README "Scoring": 100 per vote, sweep bonus, double last round, ties, awards.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import {
  answerAll,
  current,
  playRound,
  playVotes,
  start,
  timer,
  toAnswer,
  vip,
  vote,
  voteAll,
  voters,
  tv,
} from './helpers';

/** Round 1 of a 3-round game, first prompt on stage, everyone answered. */
function firstVote(options: Parameters<typeof start>[0] = {}) {
  const s = answerAll(toAnswer(start(options)));
  expect(s.phase.id).toBe('vote');
  const prompt = current(s);
  if (!prompt) throw new Error('no prompt on stage');
  return { s, prompt };
}

describe('scoring', () => {
  it('awards 100 per vote received; a split vote pays both authors', () => {
    const { s, prompt } = firstVote();
    const [v1, v2] = voters(s);
    let t = vote(s, v1 as string, 0);
    expect(t.scores[prompt.authors[0]]).toBe(0); // nothing until the reveal
    t = vote(t, v2 as string, 1);
    expect(t.phase.id).toBe('reveal');
    expect(t.scores[prompt.authors[0]]).toBe(100);
    expect(t.scores[prompt.authors[1]]).toBe(100);
  });

  it('adds a 50 sweep bonus for a unanimous win with at least two votes cast', () => {
    const { s, prompt } = firstVote();
    const t = voteAll(s, () => 1);
    expect(t.phase.id).toBe('reveal');
    expect(t.scores[prompt.authors[1]]).toBe(250);
    expect(t.scores[prompt.authors[0]]).toBe(0);
    expect(t.stats.sweeps[prompt.authors[1]]).toBe(1);
    expect(t.stats.votesReceived[prompt.authors[1]]).toBe(2);
  });

  it('with 3 players a prompt has exactly one voter and a lone vote is never a sweep', () => {
    const { s, prompt } = firstVote({ players: 3 });
    expect(voters(s)).toHaveLength(1);
    const t = voteAll(s, () => 0);
    expect(t.phase.id).toBe('reveal');
    expect(t.scores[prompt.authors[0]]).toBe(100);
    expect(t.stats.sweeps).toEqual({});
  });

  it('a one-round game never doubles (there is no "last" round to build up to)', () => {
    const { s, prompt } = firstVote({ rounds: 1 });
    expect(tv(s)).toMatchObject({ multiplier: 1, round: 1, rounds: 1 });
    expect(voteAll(s, () => 0).scores[prompt.authors[0]]).toBe(250);
  });

  it('doubles every vote and the sweep bonus in the last round', () => {
    // Round 2 of 2, first prompt on stage, everyone answered.
    const s = answerAll(toAnswer(timer(playRound(start({ rounds: 2 })))));
    expect(s.phase.id).toBe('vote');
    const prompt = current(s);
    if (!prompt) throw new Error('no prompt on stage');
    expect(tv(s)).toMatchObject({ multiplier: 2, round: 2, rounds: 2 });
    const t = voteAll(s, () => 0);
    const before = s.scores[prompt.authors[0]] ?? 0;
    expect(t.scores[prompt.authors[0]]).toBe(before + 500); // 2 × 200 + 100 sweep
    const second = timer(t); // reveal → next vote
    const [v1, v2] = voters(second);
    const u = vote(vote(second, v1 as string, 0), v2 as string, 1); // split → 200 each
    for (const author of current(second)?.authors ?? [])
      expect((u.scores[author] ?? 0) - (second.scores[author] ?? 0)).toBe(200);
  });

  it('does not double before the last round of a multi-round game', () => {
    const { s, prompt } = firstVote({ rounds: 2 });
    expect(tv(s).multiplier).toBe(1);
    expect(voteAll(s, () => 0).scores[prompt.authors[0]]).toBe(250);
  });

  it('a VIP skip during vote scores the votes cast so far, once', () => {
    const { s, prompt } = firstVote();
    const [v1] = voters(s);
    let t = vote(s, v1 as string, 0);
    t = vip(t, 'skip');
    expect(t.phase.id).toBe('reveal');
    expect(t.scores[prompt.authors[0]]).toBe(100);
    // Fuzz-style repeats of the reveal entry are impossible: the reveal timer moves on.
    const after = timer(t);
    expect(after.phase.id).toBe('vote');
    expect(after.scores[prompt.authors[0]]).toBe(100);
  });

  it('results() lists every player, shares ranks on ties and names every winner', () => {
    let s = start({ rounds: 1 });
    s = toAnswer(s);
    s = answerAll(s);
    s = playVotes(s, (_id, i) => i % 2); // split every vote → many ties
    expect(s.phase.id).toBe('scores');
    expect(game.results(s)).toBeNull();
    s = timer(s);
    expect(s.phase.id).toBe('done');
    const results = game.results(s);
    expect(results).not.toBeNull();
    expect(Object.keys(results?.scores ?? {}).sort()).toEqual(['ana', 'ben', 'cleo', 'dev']);
    const top = results?.ranking.filter((r) => r.rank === 1).map((r) => r.playerId) ?? [];
    expect(results?.winnerIds).toEqual(top);
    expect(top.length).toBeGreaterThanOrEqual(1);
  });

  it('hands out Crowd favourite, Sweep master and Speed writer to real players', () => {
    let s = start({ rounds: 1, answerSeconds: 60 });
    s = toAnswer(s);
    // Ana answers fast, everyone else late (after half time = 30 s).
    s = answerAll(s, (id, p) => (id === 'ana' ? `fast ${p.id}` : null), s.phase.startedAt + 5_000);
    s = answerAll(s, (id, p) => (id === 'ana' ? null : `slow ${p.id}`), s.phase.startedAt + 45_000);
    expect(s.phase.id).toBe('vote');
    // Every voter votes for slot 0 → every prompt is a sweep for its slot-0 author.
    s = playVotes(s, () => 0);
    s = timer(s);
    const awards = game.results(s)?.awards ?? [];
    expect(awards.map((a) => a.id)).toEqual(['crowd-favourite', 'sweep-master', 'speed-writer']);
    expect(awards.find((a) => a.id === 'speed-writer')?.playerId).toBe('ana');
    const votes = s.stats.votesReceived;
    const crowd = awards.find((a) => a.id === 'crowd-favourite')?.playerId ?? '';
    expect(votes[crowd]).toBe(Math.max(...Object.values(votes)));
    for (const a of awards) expect(Object.keys(s.players)).toContain(a.playerId);
  });

  it('skips Sweep master when nobody swept, and every award when nobody scored', () => {
    let s = start({ rounds: 1 });
    s = playVotes(answerAll(toAnswer(s)), (_id, i) => i % 2);
    s = timer(s);
    expect(game.results(s)?.awards.map((a) => a.id)).not.toContain('sweep-master');
    let idle = start({ rounds: 1 });
    idle = timer(timer(idle)); // intro → answer → (all blank) scores
    expect(idle.phase.id).toBe('scores');
    idle = timer(idle);
    expect(game.results(idle)?.awards).toEqual([]);
    expect(game.results(idle)?.winnerIds).toHaveLength(4);
  });

  it('round scoreboard deltas are the points gained this round', () => {
    let s = playRound(start({ rounds: 2 }));
    expect(s.phase.id).toBe('scores');
    const view = tv(s);
    for (const row of view.standings) expect(row.delta).toBe(row.score);
    s = timer(s); // intro of round 2
    expect(s.roundStartScores).toEqual(s.scores);
    s = playRound(s);
    for (const row of tv(s).standings)
      expect(row.delta).toBe(row.score - (s.roundStartScores[row.playerId] ?? 0));
  });
});

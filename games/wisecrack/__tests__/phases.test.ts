// Phase transitions and edge cases from README "Phases" + "Edge cases": timers, all-submitted,
// blank answers, vote eligibility, reconnects, VIP skip/end/pause, hidden information.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import type { State } from '../server/types';
import { revealMs } from '../server/phases/reveal';
import { currentPrompt } from '../server/round';
import { FIRST_INTRO_MS, INTRO_MS, REVEAL_MIN_MS, SCORES_MS, VOTE_MS } from '../server/types';
import {
  answer,
  answerAll,
  connect,
  current,
  playRound,
  promptsOf,
  start,
  timer,
  toAnswer,
  vip,
  vote,
  voteAll,
  voters,
  tv,
  cv,
} from './helpers';

describe('phase flow', () => {
  it('intro (2 s title beat in round 1, ADR-053) → answer (answerSeconds) → vote (20 s) → reveal (time to read) → … → scores (Next, 45 s fallback)', () => {
    let s = start({ answerSeconds: 90 });
    expect(s.phase).toMatchObject({ id: 'intro', deadline: s.phase.startedAt + FIRST_INTRO_MS });
    expect(FIRST_INTRO_MS).toBeLessThan(INTRO_MS);
    s = timer(s);
    expect(s.phase).toMatchObject({ id: 'answer', deadline: s.phase.startedAt + 90_000 });
    s = answerAll(s);
    expect(s.phase).toMatchObject({ id: 'vote', deadline: s.phase.startedAt + VOTE_MS });
    expect(s.promptIndex).toBe(0);
    s = timer(s);
    // Pacing rule: two blank answers, no voters — the beats + readMs(10) ≈ 8.1 s, never under 8 s.
    const prompt = currentPrompt(s);
    expect(prompt).not.toBeNull();
    const ms = revealMs(s, prompt!);
    expect(ms).toBeGreaterThanOrEqual(REVEAL_MIN_MS);
    expect(s.phase).toMatchObject({ id: 'reveal', deadline: s.phase.startedAt + ms });
    // More to read, more time: long answers and a full room of voters.
    const answers = Object.fromEntries(prompt!.authors.map((a) => [a, 'word '.repeat(12).trim()]));
    const votes = Object.fromEntries(
      ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'].map((v) => [v, prompt!.authors[0]]),
    );
    const busy = {
      ...s,
      answers: { ...s.answers, [prompt!.id]: answers },
      votes: { ...s.votes, [prompt!.id]: votes },
    };
    expect(revealMs(busy, prompt!)).toBeGreaterThan(ms + 5_000);
    for (let i = 1; i < 4; i++) {
      s = timer(s); // reveal → next vote
      expect(s.phase.id).toBe('vote');
      expect(s.promptIndex).toBe(i);
      s = timer(s); // vote → reveal
      expect(s.phase.id).toBe('reveal');
    }
    s = timer(s);
    expect(s.phase).toMatchObject({ id: 'scores', deadline: s.phase.startedAt + SCORES_MS });
  });

  it('after scores: next round intro, or done after the last round', () => {
    let s = playRound(start({ rounds: 2 }));
    s = timer(s);
    expect(s.phase.id).toBe('intro');
    expect(s.round).toBe(2);
    expect(game.results(s)).toBeNull();
    s = timer(playRound(s));
    expect(s.phase).toEqual({ id: 'done', startedAt: s.phase.startedAt, deadline: null });
    expect(game.results(s)).not.toBeNull();
  });

  it('answer exits early only when every connected player answered both prompts', () => {
    let s = toAnswer(start());
    const [p1, p2] = promptsOf(s, 'ana');
    s = answer(s, 'ana', (p1 as { id: string }).id, 'one');
    expect(s.phase.id).toBe('answer');
    expect(cv(s, 'ana').myPrompts.map((p) => p.answer)).toEqual(['one', null]);
    s = answer(s, 'ana', (p2 as { id: string }).id, 'two');
    expect(s.phase.id).toBe('answer');
    s = answerAll(s, (id) => (id === 'ana' ? null : 'x'));
    expect(s.phase.id).toBe('vote');
  });

  it('ignores answers from spectators, for prompts not yours, repeats and whitespace', () => {
    const s = toAnswer(start());
    const mine = promptsOf(s, 'ana')[0] as { id: string; authors: string[] };
    const notMine = s.prompts.find((p) => !p.authors.includes('ana')) as { id: string };
    expect(answer(s, 'ghost', mine.id, 'boo')).toBe(s);
    expect(answer(s, 'ana', notMine.id, 'nope')).toBe(s);
    expect(answer(s, 'ana', 'unknown-prompt', 'nope')).toBe(s);
    expect(answer(s, 'ana', mine.id, '   ')).toBe(s);
    const once = answer(s, 'ana', mine.id, '  first  ');
    expect(once.answers[mine.id]?.['ana']).toBe('first');
    expect(answer(once, 'ana', mine.id, 'second')).toBe(once);
  });

  it('counts an answer as fast only before half the answer time', () => {
    const s = toAnswer(start({ answerSeconds: 60 }));
    const p = promptsOf(s, 'ana')[0] as { id: string };
    const early = answer(s, 'ana', p.id, 'quick', s.phase.startedAt + 29_000);
    const late = answer(s, 'ana', p.id, 'slow', s.phase.startedAt + 31_000);
    expect(early.stats.fastAnswers['ana']).toBe(1);
    expect(late.stats.fastAnswers['ana']).toBe(0);
  });
});

describe('blank answers', () => {
  it('a prompt with one blank answer skips its vote: the real answer wins by default', () => {
    let s = toAnswer(start());
    const blank = promptsOf(s, 'ana')[0];
    if (!blank) throw new Error('no prompt');
    s = answerAll(s, (id, p) => (id === 'ana' && p.id === blank.id ? null : 'text'));
    s = timer(s); // deadline: Ana's first prompt stays blank
    const voted: string[] = [];
    let reveal: State | null = null;
    let guard = 0;
    while (s.phase.id !== 'scores') {
      if (s.phase.id === 'vote') voted.push(current(s)?.id ?? '');
      if (s.phase.id === 'reveal' && current(s)?.id === blank.id) reveal = s;
      s = timer(s);
      if (guard++ > 20) throw new Error('round did not end');
    }
    expect(voted).not.toContain(blank.id);
    if (!reveal) throw new Error('blank prompt never revealed');
    const other = blank.authors.find((id) => id !== 'ana') ?? '';
    const revealed = tv(reveal).revealed;
    expect(revealed.find((r) => r.playerId === other)).toMatchObject({
      walkover: true,
      votes: 0,
      points: 100,
    });
    expect(revealed.find((r) => r.playerId === 'ana')).toMatchObject({
      text: '(no answer)',
      walkover: false,
      points: 0,
    });
    expect(reveal.votes[blank.id]).toBeUndefined();
  });

  it('skips vote and reveal for a prompt where both answers are blank', () => {
    let s = toAnswer(start());
    const skipped = s.prompts[1] as { id: string };
    s = answerAll(s, (_id, p) => (p.id === skipped.id ? null : 'text'));
    s = timer(s);
    const visited: number[] = [];
    while (s.phase.id !== 'scores') {
      if (s.phase.id === 'vote') visited.push(s.promptIndex);
      s = timer(s);
    }
    expect(visited).toEqual([0, 2, 3]);
    expect(s.votes[skipped.id]).toBeUndefined();
  });

  it('goes straight to scores when nobody answered anything', () => {
    let s = timer(toAnswer(start()));
    expect(s.phase.id).toBe('scores');
    s = timer(s);
    expect(s.phase.id).toBe('intro');
    expect(s.round).toBe(2);
  });
});

describe('vote eligibility', () => {
  it('authors cannot vote on their own prompt; spectators and unknown ids are ignored', () => {
    const s = answerAll(toAnswer(start()));
    const prompt = current(s);
    if (!prompt) throw new Error('no prompt');
    expect(vote(s, prompt.authors[0], 1)).toBe(s);
    expect(vote(s, 'ghost', 0)).toBe(s);
    expect(vote(s, '', 0)).toBe(s);
    expect(vote(s, voters(s)[0] as string, 0, undefined, 'other-prompt')).toBe(s);
  });

  it('a second vote from the same voter is ignored', () => {
    const s = answerAll(toAnswer(start()));
    const [v1] = voters(s);
    const once = vote(s, v1 as string, 0);
    expect(once).not.toBe(s);
    expect(vote(once, v1 as string, 1)).toBe(once);
    const prompt = current(once);
    expect(once.votes[prompt?.id ?? '']?.[v1 as string]).toBe(prompt?.authors[0]);
  });

  it('exits when every connected eligible voter has voted', () => {
    const s = answerAll(toAnswer(start()));
    const [v1, v2] = voters(s);
    const one = vote(s, v1 as string, 0);
    expect(one.phase.id).toBe('vote');
    expect(tv(one)).toMatchObject({ votedCount: 1, votersExpected: 2 });
    expect(vote(one, v2 as string, 1).phase.id).toBe('reveal');
  });
});

describe('connectivity', () => {
  it('a disconnected player blocks neither all-answered nor all-voted', () => {
    let s = connect(toAnswer(start()), 'dev', false);
    s = answerAll(s, (id) => (id === 'dev' ? null : 'x'));
    expect(s.phase.id).toBe('vote');
    let guard = 0;
    while (!voters(s).includes('dev') && guard++ < 10) s = timer(timer(s));
    const others = voters(s).filter((id) => id !== 'dev');
    let t = s;
    for (const id of others) t = vote(t, id, 0);
    expect(t.phase.id).toBe('reveal');
  });

  it('a player who reconnects before the deadline can still act', () => {
    let s = connect(toAnswer(start()), 'dev', false);
    s = connect(s, 'dev', true, s.phase.startedAt + 10_000);
    const p = promptsOf(s, 'dev')[0] as { id: string };
    const t = answer(s, 'dev', p.id, 'back!', s.phase.startedAt + 11_000);
    expect(t.answers[p.id]?.['dev']).toBe('back!');
    expect(cv(t, 'dev').players.find((x) => x.id === 'dev')?.connected).toBe(true);
  });
});

describe('VIP', () => {
  it('skip: intro → answer → first vote → reveal → next vote … → scores → intro / done', () => {
    let s = start({ rounds: 1 });
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('answer');
    // Everyone answers both (a lone blank would make the first prompt a walkover, not a vote), so
    // the answer phase ends on its own; the skip-from-answer path is covered by the blank tests.
    s = answerAll(s, () => 'text');
    expect(s.phase.id).toBe('vote');
    expect(Object.values(s.answers).flatMap((a) => Object.keys(a))).toHaveLength(8);
    const [v1] = voters(s);
    s = vote(s, v1 as string, 0);
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('reveal');
    const prompt = current(s);
    expect(s.scores[prompt?.authors[0] ?? '']).toBe(100); // votes so far (one round: no doubling)
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('vote');
    expect(s.promptIndex).toBe(1);
    while (s.phase.id !== 'scores') s = vip(s, 'skip');
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('done');
    const multi = vip(playRound(start({ rounds: 2 })), 'skip');
    expect(multi.phase.id).toBe('intro');
    expect(multi.round).toBe(2);
  });

  it('end: done from any phase with the scores so far', () => {
    for (const phase of ['intro', 'answer', 'vote', 'reveal', 'scores']) {
      let s = start();
      while (s.phase.id !== phase) s = s.phase.id === 'answer' ? answerAll(s) : timer(s);
      const ended = vip(s, 'end');
      expect(ended.phase.id).toBe('done');
      expect(game.results(ended)?.scores).toEqual(
        Object.fromEntries(Object.keys(s.players).map((id) => [id, s.scores[id] ?? 0])),
      );
    }
  });

  it('pause holds the deadline and blocks inputs and timers; resume shifts the deadline', () => {
    const s = toAnswer(start());
    const paused = vip(s, 'pause', s.phase.startedAt + 5_000);
    expect(paused.phase.paused).toEqual({ at: s.phase.startedAt + 5_000 });
    const p = promptsOf(s, 'ana')[0] as { id: string };
    expect(answer(paused, 'ana', p.id, 'nope')).toBe(paused);
    expect(timer(paused)).toBe(paused);
    const resumed = vip(paused, 'resume', s.phase.startedAt + 25_000);
    expect(resumed.phase.paused).toBeUndefined();
    expect(resumed.phase.deadline).toBe((s.phase.deadline ?? 0) + 20_000);
  });
});

describe('hidden information', () => {
  it('keeps answers off the TV and other phones during answer', () => {
    let s = toAnswer(start());
    const p = promptsOf(s, 'ana')[0] as { id: string };
    s = answer(s, 'ana', p.id, 'secretword');
    expect(JSON.stringify(tv(s))).not.toContain('secretword');
    expect(JSON.stringify(cv(s, 'ben'))).not.toContain('secretword');
    expect(cv(s, 'ana').myPrompts[0]?.answer).toBe('secretword');
  });

  it('hides authors and votes during vote, shows them in reveal', () => {
    const s = answerAll(toAnswer(start()));
    const prompt = current(s);
    if (!prompt) throw new Error('no prompt');
    const stage = JSON.stringify({ ...tv(s), players: [] });
    for (const id of prompt.authors) expect(stage).not.toContain(id);
    expect(tv(s).revealed).toEqual([]);
    const author = cv(s, prompt.authors[0]);
    expect(author.vote?.role).toBe('author');
    // an author reads both answers too (anonymous, as the TV shows them — 2026-09-21)
    expect(author.vote?.options).toHaveLength(2);
    expect(JSON.stringify(author.vote)).not.toContain(prompt.authors[1]);
    const voter = cv(s, voters(s)[0] as string);
    expect(voter.vote?.role).toBe('voter');
    expect(voter.vote?.options).toHaveLength(2);
    expect(JSON.stringify(voter.vote)).not.toContain(prompt.authors[0]);
    const revealed = tv(voteAll(s, () => 0)).revealed;
    expect(revealed.map((r) => r.playerId).sort()).toEqual([...prompt.authors].sort());
    expect(revealed.find((r) => r.slot === 0)?.votes).toBe(2);
  });

  it('never throws for spectators, unknown ids or odd fixtures', () => {
    const s = answerAll(toAnswer(start()));
    for (const id of ['ghost', '', '__proto__', 'ana']) expect(() => cv(s, id)).not.toThrow();
    const broken = { ...s, promptIndex: 99 };
    expect(() => tv(broken)).not.toThrow();
    expect(game.reduce(broken, { type: 'timer', now: 0, phaseId: 'vote', startedAt: 1 })).toBe(
      broken,
    );
  });
});

describe('disconnects', () => {
  it('the drop of the last outstanding player ends the phase like their answer would have', () => {
    let s = toAnswer(start());
    s = answerAll(s, (id) => (id === 'dev' ? null : 'text'));
    expect(s.phase.id).toBe('answer'); // Dev still owes two answers
    s = connect(s, 'dev', false, s.phase.startedAt + 1000);
    expect(s.phase.id).not.toBe('answer'); // nobody connected is outstanding → the vote starts
  });
});

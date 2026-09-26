// Bots (SPEC §4.10): honest (their phone's view only), distinct answers per prompt, random guesses,
// and they sit out their own card. Voice (§4.12): what is asked for when, the pending cap, pacing.
import { createRng } from '@partybox/game-sdk';
import { describe, expect, it } from 'vitest';
import { decide } from '../server/bot';
import { game } from '../server/index';
import { pendingCap } from '@partybox/game-sdk/speech';
import { cardReading, nameLine, promptReading, speech } from '../server/speech';
import type { State } from '../server/types';
import { PROMPT_MAX_MS } from '../server/types';
import { authorsNow, phone, reduce, start, timer, until, written } from './helpers';

function botsAnswer(s0: State): State {
  let s = s0;
  for (const id of s.seats) {
    for (let k = 0; k < 2; k += 1) {
      const inp = game.bot.sampleInput(s, id, createRng(k));
      if (inp) s = reduce(s, { type: 'input', now: s.phase.startedAt + 10, playerId: id, input: inp }); // prettier-ignore
    }
  }
  return s;
}

describe('bots', () => {
  it('answer with distinct canned answers for every prompt (up to the bank size)', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const s = botsAnswer(until(start({ players: 12, bots: 12, seed }), 'write'));
      const texts = Object.values(s.p.answers);
      expect(texts).toHaveLength(12);
      expect(new Set(texts).size).toBe(12);
    }
  });

  it('a seat not flagged as a bot taps 💡 first, like a person, then answers', () => {
    const s = until(start({ players: 4 }), 'write');
    expect(game.bot.sampleInput(s, 'ana', createRng(1))).toEqual({ type: 'idea' });
  });

  it('guess uniformly among their candidates; an author bot sits out', () => {
    let s = until(botsAnswer(until(start({ players: 6, bots: 6 }), 'write')), 'guess');
    const author = authorsNow(s)[0] as string;
    const guesser = s.seats.find((id) => id !== author) as string;
    expect(decide(phone(s, author), createRng(1))).toBeNull(); // the author bot sits out
    const picks = new Map<string, number>();
    for (let seed = 0; seed < 600; seed += 1) {
      const inp = decide(phone(s, guesser), createRng(seed));
      if (inp?.type === 'guess') picks.set(inp.target, (picks.get(inp.target) ?? 0) + 1);
    }
    expect(picks.has(guesser)).toBe(false);
    expect(picks.size).toBe(5);
    for (const n of picks.values()) expect(n).toBeGreaterThan(70);
    s = timer(s);
    expect(game.bot.sampleInput(s, guesser, createRng(1))).toBeNull();
  });
});

describe('voice', () => {
  const voiced = (): State => start({ players: 4, settings: { reader: 'sky' } });

  it('asks for nothing with no reader', () => {
    expect(speech(start({ players: 4, settings: { reader: 'none' } }))).toEqual([]);
  });

  it('on the first prompt: its reading and the fixed lines, capped', () => {
    const asked = speech(voiced());
    expect(asked[0]?.key).toBe(promptReading(voiced(), 0)?.key);
    expect(asked.length).toBeLessThanOrEqual(pendingCap(4));
  });

  it('never asks for an answer before write ends; then every card and every name', () => {
    let s = written(voiced(), { ana: 'avocado', ben: 'bacon', cy: 'sushi', dee: 'tacos' });
    const whileWriting = JSON.stringify(speech(s));
    for (const t of ['avocado', 'bacon']) expect(whileWriting).not.toContain(t);
    s = timer(s);
    const keys = new Set(speech(s).map((r) => r.key));
    for (const c of s.p.cards) expect(keys.has(cardReading(s, c)?.key ?? '')).toBe(true);
    const later = s.seats.map((id) => nameLine(s, id)?.key);
    expect(later.every((k) => typeof k === 'string')).toBe(true);
  });

  it('the prompt lasts its reading + lead + 1 s, re-timed when the reading arrives', () => {
    let s = voiced();
    expect(s.phase.id).toBe('prompt');
    expect(s.phase.deadline).toBe(s.phase.startedAt + PROMPT_MAX_MS);
    const key = promptReading(s, 0)?.key as string;
    s = reduce(s, { type: 'speech', now: s.phase.startedAt + 200, key, ms: 3000 });
    expect(s.phase.deadline).toBe(s.phase.startedAt + 600 + 3000 + 1000);
    expect(game.tvView(s).say.map((x) => x.key)).toEqual([key]);
  });

  it('a failed voice falls back to reading time and says nothing', () => {
    let s = voiced();
    const key = promptReading(s, 0)?.key as string;
    s = reduce(s, { type: 'speech', now: s.phase.startedAt + 200, key, ms: -1 });
    expect(s.phase.deadline).toBeLessThan(s.phase.startedAt + PROMPT_MAX_MS);
    expect(game.tvView(s).say).toEqual([]);
  });

  it('the flip says the name line when it was made in time, and holds for it', () => {
    let s = until(written(voiced(), { ana: 'avocado', ben: 'bacon', cy: 'sushi', dee: 'tacos' }), 'guess'); // prettier-ignore
    const author = authorsNow(s)[0] as string;
    const line = nameLine(s, author)?.key as string;
    s = reduce(s, { type: 'speech', now: s.phase.startedAt + 1, key: line, ms: 1400 });
    s = timer(until(s, 'reveal'));
    expect(s.p.flip?.key).toBe(line);
    expect(game.tvView(s).say[0]?.key).toBe(line);
    expect((s.phase.deadline ?? 0) - s.phase.startedAt).toBeGreaterThan(0);
  });
});

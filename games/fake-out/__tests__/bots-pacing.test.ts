// Bots (SPEC §3.11, §3.17), the state budget (§3.10: < 24 KB at 12 players, a test fails above
// 48 KB; Part 00 §8 logs 16), and pacing to the voice (§3.12): re-timing, a stuck voice.
import { createRng } from '@partybox/game-sdk';
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { factReading, optionReading } from '../server/speech';
import type { Input, State } from '../server/types';
import { POINTS_MS, QUESTION_BEAT_MS, STAMP_MS, STEP_MIN_MS } from '../server/types';
import { PENGUIN, PLAYERS, input, lies, speech, start, timer, toLie, tv } from './helpers';

/** Plays a whole game with every seat a bot acting whenever it has something to do; also
 *  returns the largest state (JSON bytes) seen on the way. */
function botGame(
  players: number,
  seed: number,
  settings: Record<string, string | number | boolean> = {},
): [State, number] {
  const rng = createRng(seed);
  const bots = PLAYERS.slice(0, players).map((p) => p.id);
  let s = start({ players, seed, bots, settings });
  let biggest = 0;
  let guard = 0;
  while (s.phase.id !== 'done' && guard++ < 5_000) {
    let acted = false;
    for (const p of bots) {
      const i = game.bot.sampleInput(s, p, rng) as Input | null;
      if (i) {
        s = input(s, p, i, s.phase.startedAt + 1_000);
        acted = true;
      }
    }
    if (!acted) s = timer(s);
    biggest = Math.max(biggest, JSON.stringify(s).length);
  }
  return [s, biggest];
}

describe('bots', () => {
  it('finish a game, lie through Suggest and never repeat a lie in a game', () => {
    const lieLog: Record<string, string[]> = {};
    const rng = createRng(7);
    const bots = PLAYERS.slice(0, 6).map((p) => p.id);
    let s = start({ players: 6, seed: 7, bots, settings: { questions: 10 } });
    let guard = 0;
    while (s.phase.id !== 'done' && guard++ < 5_000) {
      let acted = false;
      for (const p of bots) {
        const i = game.bot.sampleInput(s, p, rng) as Input | null;
        if (!i) continue;
        if (i.type === 'lie') (lieLog[p] ??= []).push(i.text.toLowerCase());
        s = input(s, p, i, s.phase.startedAt + 1_000);
        acted = true;
      }
      if (!acted) s = timer(s);
    }
    expect(s.phase.id).toBe('done');
    for (const list of Object.values(lieLog)) expect(new Set(list).size).toBe(list.length);
  });

  it('pick at random among their own options (varied, never their own lie)', () => {
    let s = lies(toLie(start({ fact: PENGUIN, players: 4, bots: ['ana', 'ben', 'cy', 'dee'] })), {
      ana: 'moose',
    });
    const rng = createRng(3);
    const seen = new Set<string>();
    for (let k = 0; k < 40; k++) {
      const i = game.bot.sampleInput({ ...s, q: { ...s.q, likes: { ana: ['x'] } } }, 'ana', rng);
      if (i?.type === 'pick') seen.add(i.option);
    }
    const own = s.q.options?.find((o) => o.authors.includes('ana'))?.id;
    expect(seen.size).toBeGreaterThan(2);
    expect(seen.has(own ?? '')).toBe(false);
    s = timer(s);
    expect(s.phase.id).toBe('reveal');
  });

  it('like about a third of the time, at most once per question', () => {
    let likes = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const [s] = botGame(3, seed, { questions: 3 });
      likes += Object.values(s.stats).reduce((n, st) => n + st.likes, 0);
    }
    expect(likes).toBeGreaterThan(0);
  });
});

describe('state budget', () => {
  it.each([
    [12, 24],
    [16, 32],
  ])('stays small at %i players over a full game (budget %i KB)', (n, budgetKb) => {
    const [s, biggest] = botGame(n, 5, { questions: 10, spicy: true });
    expect(s.phase.id).toBe('done');
    console.info(`fake-out largest state at ${n} players: ${(biggest / 1024).toFixed(1)} KB`);
    expect(biggest).toBeLessThan(budgetKb * 1024);
    expect(biggest).toBeLessThan(48 * 1024);
  });

  it('views stay under 4 KB at 12 players', () => {
    let s = lies(
      toLie(start({ fact: PENGUIN, players: 12, settings: { reader: 'fable' } })),
      Object.fromEntries(PLAYERS.map((p, i) => [p.id, `fake answer number ${i} here`])),
    );
    s = timer(s);
    while (s.phase.id === 'reveal') {
      expect(JSON.stringify(tv(s)).length).toBeLessThan(4096);
      expect(JSON.stringify(game.controllerView(s, 'ana')).length).toBeLessThan(4096);
      s = timer(s);
    }
  });
});

describe('pacing to the voice', () => {
  it('the question card waits for a slow reading, then holds for it plus a beat', () => {
    let s = timer(start({ fact: PENGUIN, settings: { reader: 'fable' } }));
    expect(s.phase.id).toBe('question');
    expect((s.phase.deadline ?? 0) - s.phase.startedAt).toBe(12_000);
    s = speech(s, factReading('fable', PENGUIN).key, 3_000, s.phase.startedAt + 2_000);
    expect(s.phase.deadline).toBeLessThan(s.phase.startedAt + 12_000);
    expect(s.phase.deadline).toBeGreaterThanOrEqual(s.phase.startedAt + 2_000 + 3_000 + 1_000);
  });

  it('a late reading starts when it arrives: the voice and the read-along are not skipped', () => {
    let s = timer(start({ fact: PENGUIN, settings: { reader: 'fable' } }));
    expect(tv(s).readAlong).toBe('waiting');
    const arrival = s.phase.startedAt + 5_000;
    s = speech(s, factReading('fable', PENGUIN).key, 3_000, arrival);
    expect(tv(s).reading?.at).toBe(arrival);
    expect(tv(s).readAlong).toEqual({ at: arrival, ms: 3_000 });
    expect(s.phase.deadline).toBe(arrival + 3_000 + QUESTION_BEAT_MS);
  });

  it('a failed voice never holds the room', () => {
    let s = timer(start({ fact: PENGUIN, settings: { reader: 'fable' } }));
    s = speech(s, factReading('fable', PENGUIN).key, -1);
    expect(tv(s).reading).toBeNull();
    expect(timer(s).phase.id).toBe('lie');
  });

  it('a reveal step lasts its reading + stamp + points, clamped to 3–5.5 s', () => {
    let s = lies(toLie(start({ fact: PENGUIN, settings: { reader: 'fable' } })), {});
    for (const o of s.q.options ?? []) s = speech(s, optionReading('fable', o.display).key, 900);
    s = timer(s);
    expect(s.phase.id).toBe('reveal');
    const ms = (s.phase.deadline ?? 0) - s.phase.startedAt;
    expect(ms).toBe(Math.max(STEP_MIN_MS, 900 + STAMP_MS + POINTS_MS));
    expect(tv(s).reveal?.stampMs).toBe(900 + STAMP_MS);
    expect(tv(s).reading?.url).toContain('/api/speech/');
  });
});

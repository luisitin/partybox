// SPEC §10.15 and §10.10 "Speech": the narrator's lines, live readings requested only once their
// secret has resolved, keys in a view only on the step that plays them, pacing to the voice.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { readableName, readingNow, speakable, speech } from '../server/speech';
import { HOLD_NEXT_MS } from '../server/steps';
import type { State } from '../server/types';
import { EIGHT, input, night, start, timer, toNight } from './helpers';

function voiced(): State {
  return start({ roles: EIGHT, settings: { reader: 'fable' } });
}

function keysIn(view: unknown): string[] {
  return [...JSON.stringify(view).matchAll(/"key":"(nf[a-z0-9]+)"/g)].map((m) => m[1] as string);
}

describe('speech', () => {
  it('reader none asks for nothing', () => {
    expect(speech(start({ roles: EIGHT }))).toEqual([]);
  });

  it('the night asks only for secret-free lines', () => {
    let s = toNight(voiced());
    s = input(s, 'ben', { type: 'night', target: 'dee' });
    const texts = speech(s).map((r) => JSON.stringify(r.parts));
    expect(texts.join(' ')).not.toMatch(/Dee|survive the night\./);
    expect(texts.join(' ')).toContain('Night falls');
  });

  it('a death line is asked for at dawn, and its key reaches a view only on its step', () => {
    let s = night(toNight(voiced()), { ben: 'dee', cy: 'dee' });
    const asked = speech(s);
    const died = asked.find((r) => JSON.stringify(r.parts).includes('Dee did not survive'));
    expect(died).toBeDefined();
    const key = died?.key as string;
    s = game.reduce(s, { type: 'speech', now: s.phase.startedAt + 100, key, ms: 1800 });
    expect(keysIn(game.tvView(s))).not.toContain(key);
    s = timer(s); // step 1
    expect(keysIn(game.tvView(s))).toContain(key);
  });

  it("a step holds for the next step's reading (9 s at most), so words and voice land together", () => {
    let s = night(toNight(voiced()), { ben: 'dee', cy: 'dee' }); // dawn, step 0
    expect(s.phase.deadline).toBe(s.stepAt + HOLD_NEXT_MS);
    const died = readingNow({ ...s, step: 1 });
    s = game.reduce(s, { type: 'speech', now: s.stepAt + 500, key: died?.key as string, ms: 1800 });
    expect(s.phase.deadline).toBe(s.stepAt + 2_600); // the sunrise's own minimum
    s = timer(s); // step 1: the news, its voice ready on its first frame
    expect(keysIn(game.tvView(s))).toContain(died?.key);
    // A reading that fails never holds the room.
    const own = readingNow(s);
    const failed = game.reduce(s, {
      type: 'speech',
      now: s.stepAt + 100,
      key: own?.key as string,
      ms: -1,
    });
    expect(failed.phase.deadline).toBeLessThanOrEqual(s.stepAt + HOLD_NEXT_MS);
  });

  it("the hunter's shot waits for its line, then lands; the TV never sees the target early", () => {
    const roles = { ben: 'wolf', cy: 'wolf', fay: 'hunter' } as const;
    let s = night(toNight(start({ roles, settings: { reader: 'fable', roles: 'hunter' } })), {
      ben: 'fay',
      cy: 'fay',
    });
    while (s.phase.id === 'dawn') s = timer(s);
    expect(s.phase.id).toBe('hunter');
    s = input(s, 'fay', { type: 'shoot', target: 'ben' });
    expect(s.step).toBe(0);
    expect(game.tvView(s).stage.hunter?.shot).toBeNull();
    expect(JSON.stringify(game.tvView(s).stage)).not.toContain('"wolf"');
    const line = readingNow({ ...s, step: 1 });
    s = game.reduce(s, {
      type: 'speech',
      now: s.phase.startedAt + 900,
      key: line?.key as string,
      ms: 2400,
    });
    s = timer(s);
    expect(s.step).toBe(1);
    expect(game.tvView(s).stage.hunter).toMatchObject({ shot: 'ben', role: 'wolf' });
  });

  it('at most 10 pending keys, never a key already known', () => {
    const s = voiced();
    for (const phaseState of [s, toNight(s)])
      expect(speech(phaseState).length).toBeLessThanOrEqual(10);
  });

  it('speakable: straight quotes, ellipses as pauses, no emoji', () => {
    expect(speakable('The hunter takes aim…')).toBe('The hunter takes aim.');
    expect(speakable('Ben’s last words 🐺')).toBe("Ben's last words");
  });

  it('unreadable names are not read; the role clip stands in', () => {
    expect(readableName('xX_99_Xx')).toBe(false);
    expect(readableName('Brr')).toBe(false);
    expect(readableName('Maya')).toBe(true);
  });
});

// Phases (SPEC §3.3, §3.7, §3.9, §3.12, §3.16): the order, every exit (deadline, all done, VIP
// skip), the lie rules, Suggest, likes, pause, drops, a late joiner, one player, everyone idle.
import { describe, expect, it } from 'vitest';
import {
  PENGUIN,
  connect,
  cv,
  input,
  lie,
  lies,
  like,
  optionId,
  pick,
  start,
  suggest,
  throughReveal,
  timer,
  toLie,
  tv,
  vip,
} from './helpers';

describe('phase order and exits', () => {
  it('runs intro → question → lie → pick → reveal → scores → question … → done', () => {
    let s = start({ settings: { questions: 3 } });
    const seen: string[] = [s.phase.id];
    let guard = 0;
    while (s.phase.id !== 'done' && guard++ < 200) {
      s = timer(s);
      if (seen[seen.length - 1] !== s.phase.id) seen.push(s.phase.id);
    }
    const loop = ['question', 'lie', 'pick', 'reveal', 'scores'];
    expect(seen).toEqual(['intro', ...loop, ...loop, ...loop, 'done']);
  });

  it('a VIP skip leaves every phase (the reveal one page at a time)', () => {
    let s = start({ fact: PENGUIN });
    s = vip(s, 'skip'); // Start now: the 3 · 2 · 1
    expect([s.phase.id, s.goAt !== null]).toEqual(['intro', true]);
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('question');
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('lie');
    s = vip(lie(s, 'ana', 'moose'), 'skip');
    expect(s.phase.id).toBe('pick');
    s = vip(pick(s, 'ben', optionId(s, 'moose')), 'skip');
    expect(s.phase.id).toBe('reveal');
    expect(s.q.step).toBe(0);
    s = vip(s, 'skip');
    expect([s.phase.id, s.q.step]).toEqual(['reveal', 1]);
    while (s.phase.id === 'reveal') s = vip(s, 'skip');
    expect(s.phase.id).toBe('scores');
    s = vip(s, 'skip');
    expect([s.phase.id, s.q.n]).toEqual(['question', 2]);
  });

  it('ends the lie phase once every connected player has a lie in', () => {
    let s = toLie(start({ fact: PENGUIN, players: 3 }));
    s = lie(lie(s, 'ana', 'moose'), 'ben', 'wolf');
    expect(s.phase.id).toBe('lie');
    s = lie(s, 'cy', 'otter');
    expect(s.phase.id).toBe('pick');
  });

  it('closes the phase when the last missing player drops', () => {
    let s = lies(toLie(start({ fact: PENGUIN, players: 3 })), { ana: 'moose' });
    s = pick(pick(s, 'ana', optionId(s, 'penguin')), 'ben', optionId(s, 'moose'));
    expect(s.phase.id).toBe('pick');
    s = connect(s, 'cy', false);
    expect(s.phase.id).toBe('reveal');
  });

  it('pause freezes the reveal step; resume carries on', () => {
    let s = lies(toLie(start({ fact: PENGUIN })), {});
    s = timer(s);
    const deadline = s.phase.deadline ?? 0;
    s = vip(s, 'pause', s.phase.startedAt + 100);
    expect(timer(s)).toBe(s);
    s = vip(s, 'resume', s.phase.startedAt + 5_100);
    expect(s.phase.deadline).toBe(deadline + 5_000);
    expect(s.q.step).toBe(0);
  });

  it('an idle room still shows the truth and moves on', () => {
    let s = toLie(start({ fact: PENGUIN }));
    s = timer(timer(s));
    expect(s.phase.id).toBe('reveal');
    expect(tv(s).reveal?.shown.map((o) => o.stamp)).toEqual(['truth']);
    s = throughReveal(s);
    expect(s.phase.id).toBe('scores');
    expect(Object.values(s.scores).every((v) => v === 0)).toBe(true);
  });

  it('one connected player plays against the padding on deadlines', () => {
    let s = start({ fact: PENGUIN, players: 2 });
    s = connect(s, 'ben', false);
    s = toLie(s);
    s = lie(s, 'ana', 'walrus');
    expect(s.phase.id).toBe('pick');
    expect(cv(s, 'ana').options).toHaveLength(4);
  });

  it('ignores a late joiner (spectator) and unknown senders', () => {
    const s = toLie(start({ fact: PENGUIN }));
    expect(lie(s, 'zed', 'moose')).toBe(s);
    expect(lie(s, '__proto__', 'moose')).toBe(s);
    expect(cv(s, 'zed').me.role).toBe('spectator');
  });
});

describe('the rules for lies (SPEC §3.7)', () => {
  const s = toLie(start({ fact: PENGUIN }));

  it.each([
    ['penguin', 'exact'],
    ['Penguins!', 'stem'],
    ['pengwin', 'fuzzy'],
    ['penguin chick', 'containment'],
    ['  THE PENGUIN ', 'article + case'],
  ])('refuses the truth typed as a lie: %s (%s)', (text) => {
    const after = lie(s, 'ana', text);
    expect(after.q.lies['ana']).toBeUndefined();
    expect(cv(after, 'ana').rejected?.why).toBe('truth');
    expect(after.q.truthTyped).toEqual(['ana']);
  });

  it('refuses empty and over-long lies without recording a lucky guess', () => {
    expect(cv(lie(s, 'ana', '  !!  '), 'ana').rejected?.why).toBe('empty');
    expect(cv(lie(s, 'ana', 'x'.repeat(41)), 'ana').rejected?.why).toBe('too-long');
    expect(lie(s, 'ana', 'x'.repeat(41)).q.truthTyped).toEqual([]);
  });

  it('a short truth never blocks longer words that contain it', () => {
    const ant = {
      ...PENGUIN,
      truth: {
        answer: 'ant',
        accept: ['ants', 'an ant', 'antz', 'aunt', 'emmet', 'formicid'],
        reject: [],
      },
    };
    const t = toLie(start({ fact: ant }));
    expect(lie(t, 'ana', 'elephant').q.lies['ana']).toBe('elephant');
  });

  it('a resent lie replaces the earlier one; a later valid lie clears the refusal', () => {
    let t = lie(s, 'ana', 'moose');
    t = lie(t, 'ana', 'penguin');
    expect(t.q.lies['ana']).toBe('moose');
    t = lie(t, 'ana', 'walrus');
    expect(t.q.lies['ana']).toBe('walrus');
    expect(cv(t, 'ana').rejected).toBeNull();
  });
});

describe('Suggest and likes', () => {
  it('offers two unclaimed house lies once per question, never the same to two players', () => {
    let s = toLie(start({ fact: PENGUIN }));
    s = suggest(s, 'ana');
    const a = cv(s, 'ana').suggestions;
    expect(a).toHaveLength(2);
    expect(suggest(s, 'ana')).toBe(s);
    s = suggest(s, 'ben');
    const b = cv(s, 'ben').suggestions;
    expect(b.filter((x) => a.includes(x))).toEqual([]);
    expect([...a, ...b].every((x) => PENGUIN.houseLies.includes(x))).toBe(true);
  });

  it('draws fillers once the house lies run dry, and never pads with a claimed fake', () => {
    let s = toLie(start({ fact: PENGUIN, players: 6 }));
    for (const p of ['ana', 'ben', 'cy', 'dee', 'eli', 'fay']) s = suggest(s, p);
    const all = Object.values(s.q.suggestions).flat();
    expect(new Set(all).size).toBe(12);
    s = timer(s);
    const house = (s.q.options ?? []).filter((o) => o.house).map((o) => o.display.toLowerCase());
    expect(house.every((h) => !all.includes(h))).toBe(true);
  });

  it('people cannot Suggest when it is off; bots still lie through it', () => {
    let s = toLie(start({ fact: PENGUIN, settings: { suggestions: false }, bots: ['ben'] }));
    expect(suggest(s, 'ana')).toBe(s);
    s = suggest(s, 'ben');
    expect(cv(s, 'ben').suggestions).toHaveLength(2);
  });

  it('allows two likes, never on your own answer, and none when likes are off', () => {
    let s = lies(toLie(start({ fact: PENGUIN })), { ana: 'moose', ben: 'wolf', cy: 'otter' });
    const own = optionId(s, 'moose');
    expect(like(s, 'ana', own)).toBe(s);
    const others = cv(s, 'ana').options.map((o) => o.id);
    s = like(like(like(s, 'ana', others[0] ?? ''), 'ana', others[1] ?? ''), 'ana', others[2] ?? '');
    expect(s.q.likes['ana']).toHaveLength(2);
    s = like(s, 'ana', others[0] ?? '', false);
    expect(s.q.likes['ana']).toEqual([others[1]]);
    const off = lies(toLie(start({ fact: PENGUIN, settings: { likes: false } })), { ana: 'moose' });
    expect(like(off, 'ben', optionId(off, 'moose'))).toBe(off);
  });

  it('a pick on your own (or an unknown) option is ignored; a resent pick changes it', () => {
    let s = lies(toLie(start({ fact: PENGUIN })), { ana: 'moose', dee: 'moose' });
    expect(pick(s, 'dee', optionId(s, 'moose'))).toBe(s);
    expect(pick(s, 'ana', 'o999')).toBe(s);
    s = pick(s, 'ana', optionId(s, 'penguin'));
    s = input(s, 'ana', { type: 'pick', option: s.q.options?.find((o) => o.house)?.id ?? '' });
    expect(s.q.options?.find((o) => o.id === s.q.picks['ana'])?.house).toBe(true);
  });
});

// Phase order and exits (deadline, all-in, VIP skip), pause, drops, late joiners, idle rooms,
// and what each view may show when (SPEC §2.4, §2.9, §2.16; foundation §7.3).
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { herdMs } from '../server/timing';
import { controllerView, tvView } from '../server/views';
import { atAnswer, input, pickAll, skip, start, T0, timer, tileIds } from './helpers';

const ID = 'herd-mind';

describe('phase order and exits', () => {
  it('intro (ready-up, up to 60 s) → 3 · 2 · 1 → answer → herd → score → the next answer', () => {
    let s = start();
    expect(s.phase).toEqual({ id: 'intro', startedAt: T0, deadline: T0 + 60_000 });
    s = timer(s); // nobody tapped Ready: the count starts anyway
    expect([s.phase.id, s.startAt]).toEqual(['intro', T0 + 60_000 + 3_400]);
    s = timer(s);
    expect(s.phase.id).toBe('answer');
    expect(s.q.tiles).toHaveLength(8);
    s = timer(s);
    expect(s.phase.id).toBe('herd');
    s = timer(s);
    expect(s.phase.id).toBe('score');
    expect(s.phase.deadline).toBe(s.phase.startedAt + 5_000);
    s = timer(s);
    expect([s.phase.id, s.q.n]).toEqual(['answer', 1]);
  });

  it('answer time follows the pace and mode (§2.13)', () => {
    const at = (pace: string, mode: string): number => {
      const s = atAnswer({ pace, mode });
      return (s.phase.deadline ?? 0) - s.phase.startedAt;
    };
    expect([at('relaxed', 'tiles'), at('normal', 'tiles'), at('fast', 'tiles')]).toEqual([
      25_000, 15_000, 10_000,
    ]);
    expect([at('relaxed', 'typed'), at('normal', 'typed'), at('fast', 'typed')]).toEqual([
      35_000, 25_000, 20_000,
    ]);
  });

  it('when every connected player has answered, the phase closes after a short beat', () => {
    let s = atAnswer({}, 3);
    const [t] = tileIds(s);
    s = input(s, 'ana', { type: 'pick', tile: t ?? '' }, T0 + 2_000);
    s = input(s, 'ben', { type: 'pick', tile: t ?? '' }, T0 + 2_500);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 15_000);
    s = input(s, 'cy', { type: 'pick', tile: t ?? '' }, T0 + 3_000);
    expect(s.phase.deadline).toBe(T0 + 3_000 + 1_200);
  });

  it('a VIP skip leaves every phase; end jumps to done', () => {
    let s = skip(start()); // the intro's skip starts the 3 · 2 · 1
    expect([s.phase.id, s.startAt !== null]).toEqual(['intro', true]);
    for (const id of ['answer', 'herd', 'score', 'answer']) {
      s = skip(s);
      expect(s.phase.id).toBe(id);
    }
    s = game.reduce(s, { type: 'vip', now: s.phase.startedAt + 1, action: 'end' });
    expect(s.phase.id).toBe('done');
    expect(game.results(s)).not.toBeNull();
  });

  it('the tiles herd lasts its choreography, and re-times when the verdict voice arrives', () => {
    let s = atAnswer({ reader: 'jessica' }, 6);
    s = pickAll(s, [0, 0, 0, 1, 1, 2]);
    expect(s.phase.deadline).toBe(s.phase.startedAt + herdMs(6, null));
    const said = (r: { parts: readonly { text?: string }[] }): string =>
      r.parts.map((p) => p.text ?? '').join('');
    const herdLine = game
      .speech?.(s)
      .find((r) => said(r).endsWith('!') && said(r) !== 'Black sheep!');
    expect(herdLine).toBeDefined();
    const retimed = game.reduce(s, {
      type: 'speech',
      now: s.phase.startedAt + 200,
      key: herdLine?.key ?? '',
      ms: 4_000,
    });
    expect(retimed.phase.deadline).toBeGreaterThanOrEqual(s.phase.deadline ?? 0);
  });

  it('pause freezes the herd; resume continues it with the deadline shifted', () => {
    let s = pickAll(atAnswer(), [0, 0, 0, 1, 1, 2]);
    const deadline = s.phase.deadline ?? 0;
    s = game.reduce(s, { type: 'vip', now: s.phase.startedAt + 1_000, action: 'pause' });
    expect(timer(s)).toBe(s);
    s = game.reduce(s, { type: 'vip', now: s.phase.startedAt + 4_000, action: 'resume' });
    expect(s.phase.deadline).toBe(deadline + 3_000);
  });
});

describe('players coming and going', () => {
  it('one connected player: no herd, they take the sheep, the game runs on deadlines', () => {
    let s = atAnswer({}, 3);
    for (const id of ['ben', 'cy'])
      s = game.reduce(s, { type: 'player', now: T0 + 10, playerId: id, connected: false });
    s = input(s, 'ana', { type: 'pick', tile: tileIds(s)[0] ?? '' }, T0 + 500);
    expect(s.phase.id).toBe('answer'); // all-in beat
    s = timer(timer(s));
    expect(s.phase.id).toBe('score');
    expect(s.q.outcome).toBe('scattered');
    expect(s.sheep).toBe('ana');
  });

  it('a drop mid-answer: the rest being in closes the phase', () => {
    let s = atAnswer({}, 3);
    const [t] = tileIds(s);
    s = input(s, 'ana', { type: 'pick', tile: t ?? '' });
    s = input(s, 'ben', { type: 'pick', tile: t ?? '' });
    s = game.reduce(s, { type: 'player', now: T0 + 4_000, playerId: 'cy', connected: false });
    expect(s.phase.deadline).toBe(T0 + 4_000 + 1_200);
  });

  it('a late joiner is a spectator: ignored inputs, a spectator view', () => {
    const s = atAnswer({}, 3);
    expect(input(s, 'zed', { type: 'pick', tile: tileIds(s)[0] ?? '' })).toBe(s);
    expect(controllerView(s, 'zed', ID).me.role).toBe('spectator');
  });

  it('a player gone for good stops counting and cannot win', () => {
    let s = atAnswer({ maxQuestions: 5 }, 3);
    s = input(s, 'cy', { type: 'pick', tile: tileIds(s)[0] ?? '' });
    s = game.reduce(s, {
      type: 'player',
      now: T0 + 3_000,
      playerId: 'cy',
      connected: false,
      gone: 'left',
    });
    s = timer(pickAll(s, [0, 0, null]));
    expect(s.q.groups?.[0]?.members).toEqual(['ana', 'ben']);
  });

  it('everyone idle: every phase still ends on its deadline, to done', () => {
    let s = start({ maxQuestions: 5 });
    for (let i = 0; i < 40 && s.phase.id !== 'done'; i++) s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.ranking).toHaveLength(6);
  });
});

describe('views', () => {
  it('answers stay private until herd: no picks on the TV or on other phones', () => {
    let s = atAnswer({ mode: 'typed' }, 3);
    s = input(s, 'ana', { type: 'type', text: 'zebra stripes' });
    expect(JSON.stringify(tvView(s, ID))).not.toContain('zebra');
    expect(JSON.stringify(controllerView(s, 'ben', ID))).not.toContain('zebra');
    expect(controllerView(s, 'ana', ID).mine).toEqual({ tile: null, text: 'zebra stripes' });
  });

  it('the phone gets its own result only at score, after the TV showed the verdict', () => {
    const herd = pickAll(atAnswer(), [0, 0, 0, 1, 1, 2]);
    expect(controllerView(herd, 'ana', ID).result).toBeNull();
    expect(tvView(herd, ID).groups).not.toBeNull();
    const score = timer(herd);
    expect(controllerView(score, 'ana', ID).result).toMatchObject({
      kind: 'herd',
      count: 3,
      delta: 1,
    });
    expect(controllerView(score, 'dee', ID).result).toMatchObject({ kind: 'group', count: 2 });
    expect(controllerView(score, 'fay', ID).result).toMatchObject({ kind: 'sheep', count: 1 });
  });

  it('a tie and two lonely players read as such', () => {
    const score = timer(pickAll(atAnswer(), [0, 0, 1, 1, 2, 3]));
    expect(controllerView(score, 'ana', ID).result?.kind).toBe('tie');
    expect(controllerView(score, 'eli', ID).result?.kind).toBe('alone');
  });

  it('the TV clock shows only while people answer', () => {
    const s = atAnswer();
    expect(tvView(s, ID).timerMode).toBe('normal');
    expect(tvView(timer(s), ID).timerMode).toBe('hidden');
  });

  it('views stay under 4 KB at 16 players (typed herd, the biggest)', () => {
    let s = atAnswer({ mode: 'typed' }, 16);
    s.seats.forEach((id, i) => {
      s = input(s, id, { type: 'type', text: `answer number ${i} long-ish text` });
    });
    s = timer(s);
    expect(JSON.stringify(tvView(s, ID)).length).toBeLessThan(4096);
    expect(JSON.stringify(controllerView(s, 'ana', ID)).length).toBeLessThan(4096);
  });
});

describe('the voice', () => {
  it('asks for the next question during score, never more than 10 at once, none when off', () => {
    const on = timer(pickAll(atAnswer({ reader: 'jessica' }), [0, 0, 0, 1, 1, 2]));
    const wanted = game.speech?.(on) ?? [];
    expect(wanted.length).toBeLessThanOrEqual(10);
    const next = on.questions[on.q.n + 1];
    expect(
      wanted.some(
        (r) =>
          r.parts.some((p) => 'text' in p && p.text === next?.say) ||
          r.parts.some((p) => 'text' in p && p.text === next?.prompt),
      ),
    ).toBe(true);
    expect(game.speech?.(timer(pickAll(atAnswer({ reader: 'none' }), [0, 0, 0, 1, 1, 2])))).toEqual(
      [],
    );
  });

  it('a reading reaches a view only once it is made', () => {
    let s = atAnswer({ reader: 'jessica' });
    expect(tvView(s, ID).lines).toEqual([]);
    const q = (game.speech?.(s) ?? [])[0];
    s = game.reduce(s, { type: 'speech', now: T0 + 100, key: q?.key ?? '', ms: 2_000 });
    expect(tvView(s, ID).lines).toEqual([
      { cue: 'question', key: q?.key, url: `/api/speech/${q?.key}.wav`, ms: 2_000 },
    ]);
  });
});

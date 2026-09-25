// Digital adaptations D1–D6 and D9–D11 (SPEC §3). D7 and D8 live in exile.test.ts.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { stepMs } from '../server/rules';
import { controllerView, tvView } from '../server/views';
import { COUNTDOWN_MS, SEATING_SAFETY_MS } from '../server/types';
import type { Party } from '../server/types';
import {
  T0,
  elect,
  govern,
  makePlayers,
  reduce,
  rig,
  seated,
  send,
  timeout,
  until,
  vip,
  voteAll,
} from './helpers';

const FF: Party[] = Array<Party>(17).fill('F');
const vetoTable = (): ReturnType<typeof rig> =>
  seated(rig(5, { deck: FF, patch: { board: { L: 0, F: 5 }, vetoUnlocked: true } }));

describe('D1 · deadlines and timeouts', () => {
  it('D1 seating (owner pacing rule): no clock; every connected seat readies, then 3 · 2 · 1', () => {
    let s = rig(5);
    expect(s.phase.id).toBe('seating');
    expect(tvView(s).timerMode).toBe('hidden'); // no clock to rush anyone
    for (const id of ['p1', 'p2', 'p3', 'p4']) s = send(s, id, { type: 'ready' });
    expect(s.startAt).toBeNull();
    expect(tvView(s).seats[0]?.tags).toContain('ready');
    s = send(s, 'p5', { type: 'ready' }, T0 + 1_000);
    expect(s.phase).toMatchObject({ id: 'seating', deadline: T0 + 1_000 + COUNTDOWN_MS });
    expect(tvView(s).startAt).toBe(T0 + 1_000 + COUNTDOWN_MS);
    expect(timeout(s).phase.id).toBe('nominate');
  });

  it('D1 seating: a phone that never taps gets 3 minutes, then the count starts anyway', () => {
    const s = timeout(rig(5));
    expect(s.phase.id).toBe('seating');
    expect(s.startAt).toBe(s.phase.deadline);
    expect(timeout(s).phase.id).toBe('nominate');
  });

  it('D1 seating: a dropped phone never holds up the start; bots are ready from the start', () => {
    let s = rig(5);
    for (const id of ['p1', 'p2', 'p3', 'p4']) s = send(s, id, { type: 'ready' });
    s = reduce(s, { type: 'player', now: T0 + 500, playerId: 'p5', connected: false });
    expect(s.startAt).toBe(T0 + 500 + COUNTDOWN_MS);
    const bots = game.init({
      players: makePlayers(5).map((p, i) => ({ ...p, bot: i > 0 })),
      settings: {},
      seed: 1,
      now: T0,
    });
    expect(bots.ready).toEqual(['p2', 'p3', 'p4', 'p5']);
  });

  it("D1 seating: the VIP's Start now begins the count at once; a second does nothing", () => {
    let s = vip(rig(5), 'skip', T0 + 2_000);
    expect(s.startAt).toBe(T0 + 2_000 + COUNTDOWN_MS);
    expect(tvView(s).vipSkipHidden).toBe(true);
    s = vip(s, 'skip', T0 + 3_000);
    expect(s.startAt).toBe(T0 + 2_000 + COUNTDOWN_MS);
  });

  it('D1 nominate: a random eligible nominee', () => {
    const last = { president: 'p3', chancellor: 'p4' };
    const s = timeout(seated(rig(7, { patch: { lastElected: last } })));
    expect(s.phase.id).toBe('vote');
    expect(['p2', 'p5', 'p6', 'p7']).toContain(s.round.nominee);
  });

  it('D1 vote: missing votes count as Nein', () => {
    let s = send(seated(rig(5)), 'p1', { type: 'nominate', target: 'p2' });
    for (const id of ['p1', 'p2']) s = send(s, id, { type: 'vote', ja: true });
    s = timeout(s);
    expect(s.round.elected).toBe(false); // 2 Ja, 3 missing = Nein
  });

  it('D1 presDraw and chanEnact: a random discard, then a random enactment with no veto', () => {
    let s = until(elect(vetoTable(), 'p2'), 'presDraw');
    s = timeout(s);
    expect(s.phase.id).toBe('chanEnact');
    expect(s.round.passed).toHaveLength(2);
    s = timeout(s);
    expect(s.phase.id).toBe('enactReveal');
    expect(s.round.vetoRequested).toBe(false);
    expect(s.round.enacted).toBe('F');
  });

  it('D1 vetoAsk: no answer means the veto is refused', () => {
    let s = until(elect(vetoTable(), 'p2'), 'presDraw');
    s = send(send(s, 'p1', { type: 'discard', index: 0 }), 'p2', { type: 'vetoRequest' });
    expect(s.phase.deadline).toBe(s.phase.startedAt + 20_000);
    s = timeout(s);
    expect(s.phase.id).toBe('chanEnact');
    expect(s.round.vetoAgreed).toBe(false);
  });

  it('D1 claims: the game moves on', () => {
    const s = govern(seated(rig(5)), 'p2');
    expect(s.phase).toMatchObject({ id: 'claims', deadline: s.phase.startedAt + 60_000 });
    expect(timeout(s).phase.id).toBe('nominate');
  });

  it('D1 power: a random valid target; a peek closes after 15 s', () => {
    let s = timeout(govern(seated(rig(5, { deck: FF, patch: { board: { L: 0, F: 3 } } })), 'p2'));
    expect(s.round.power?.kind).toBe('execute');
    s = timeout(s);
    expect(s.phase.id).toBe('powerReveal');
    expect(['p2', 'p3', 'p4', 'p5']).toContain(s.round.power?.target);
    let p = timeout(govern(seated(rig(5, { deck: FF, patch: { board: { L: 0, F: 2 } } })), 'p2'));
    expect(p.phase.deadline).toBe(p.phase.startedAt + 15_000);
    p = timeout(p);
    expect(p.phase.id).toBe('powerReveal');
  });

  it('D1 pace scales every timed step, rounded to 5 s; reveals keep their length', () => {
    expect(stepMs('relaxed', 'nominate')).toBe(135_000);
    expect(stepMs('relaxed', 'vote')).toBe(70_000);
    expect(stepMs('fast', 'nominate')).toBe(60_000);
    expect(stepMs('fast', 'vetoAsk')).toBe(15_000);
    expect(stepMs('fast', 'peek')).toBe(10_000);
    const init = game.init({
      players: makePlayers(5),
      settings: { pace: 'relaxed' },
      seed: 1,
      now: T0,
    });
    expect(init.phase.deadline).toBe(T0 + SEATING_SAFETY_MS);
    let s = seated(rig(5, { patch: { cfg: { pace: 'relaxed' } } }));
    expect(s.phase.deadline).toBe(s.phase.startedAt + 135_000);
    s = elect(s, 'p2', false);
    expect(s.phase).toMatchObject({ id: 'voteReveal', deadline: s.phase.startedAt + 6_000 });
  });
});

describe('D2–D6 · votes, announcements, Last call, badges, silence', () => {
  it('D2 votes can change until the phase ends; it ends early once every living player voted', () => {
    let s = send(seated(rig(5)), 'p1', { type: 'nominate', target: 'p2' });
    s = send(s, 'p3', { type: 'vote', ja: true });
    s = send(s, 'p3', { type: 'vote', ja: false });
    expect(s.round.votes['p3']).toBe(false);
    for (const id of ['p1', 'p2', 'p4']) s = send(s, id, { type: 'vote', ja: true });
    expect(s.phase.id).toBe('vote');
    s = send(s, 'p5', { type: 'vote', ja: true });
    expect(s.phase.id).toBe('voteReveal');
    expect(s.round.elected).toBe(true); // 4 Ja, 1 Nein
  });

  it('D3 a timed-out nomination is named, then the notice clears', () => {
    let s = timeout(seated(rig(5)));
    expect(tvView(s).announce).toEqual({ who: s.round.nominee });
    s = voteAll(s, false);
    expect(tvView(s).announce).toBeNull();
  });

  it('D3 a timed-out discard or enactment is announced without the card', () => {
    let s = timeout(until(elect(seated(rig(5)), 'p2'), 'presDraw'));
    expect(tvView(s).announce).toEqual({ who: null });
    s = timeout(s);
    expect(tvView(s).announce).toEqual({ who: null });
    expect(JSON.stringify(tvView(s).announce)).not.toMatch(/"[LF]"/);
  });

  it('D4 the VIP Skip is Last call in a choosing phase: 10 s, then the timeout result', () => {
    let s = seated(rig(5));
    const at = s.phase.startedAt + 5_000;
    s = vip(s, 'skip', at);
    expect(s.phase.id).toBe('nominate');
    expect(s.phase.deadline).toBe(at + 10_000);
    expect(controllerView(s, 'p1').lastCall).toBe(true);
    expect(controllerView(s, 'p2').lastCall).toBe(false);
    expect(tvView(s).vipSkipHidden).toBe(true);
    expect(vip(s, 'skip', at + 1_000)).toBe(s); // a second Skip changes nothing
    expect(s.round.nominee).toBeNull(); // the VIP never chooses for anyone
    expect(timeout(s).phase.id).toBe('vote');
  });

  it('D4 outside the choosing phases Skip moves on; Last call never pushes a deadline later', () => {
    expect(vip(govern(seated(rig(5)), 'p2'), 'skip').phase.id).toBe('nominate');
    const s = seated(rig(5));
    const late = (s.phase.deadline as number) - 2_000;
    expect(vip(s, 'skip', late).phase.deadline).toBe(s.phase.deadline);
  });

  it('D5 ✓ Not Hitler stays on the seat for the rest of the game, on the TV and the phones', () => {
    let s = until(elect(seated(rig(5, { patch: { board: { L: 0, F: 3 } } })), 'p4'), 'presDraw');
    s = send(send(s, 'p1', { type: 'discard', index: 0 }), 'p4', { type: 'enact', index: 0 });
    s = until(s, 'nominate');
    s = until(elect(s, 'p3', false), 'nominate');
    expect(tvView(s).seats.find((x) => x.id === 'p4')?.tags).toContain('notHitler');
    expect(controllerView(s, 'p2').seats.find((x) => x.id === 'p4')?.tags).toContain('notHitler');
  });

  it('D6 the session is flagged for the silence banner from the draw to its outcome', () => {
    let s = elect(seated(rig(5)), 'p2');
    expect(tvView(s).silence).toBe(false);
    s = until(s, 'presDraw');
    expect(tvView(s).silence).toBe(true);
    s = send(s, 'p1', { type: 'discard', index: 0 });
    expect(tvView(s).silence).toBe(true);
    s = send(s, 'p2', { type: 'enact', index: 0 });
    expect(tvView(s).silence).toBe(false);
  });
});

describe('D9–D11 · seat order, pause, nothing carries over', () => {
  it('D9 the next President is marked on the seat row, including after a special election', () => {
    expect(
      tvView(seated(rig(7)))
        .seats.filter((x) => x.tags.includes('next'))
        .map((x) => x.id),
    ).toEqual(['p2']);
    let s = timeout(govern(seated(rig(7, { deck: FF, patch: { board: { L: 0, F: 2 } } })), 'p2'));
    s = send(s, 'p1', { type: 'target', target: 'p6' });
    expect(
      tvView(s)
        .seats.filter((x) => x.tags.includes('next'))
        .map((x) => x.id),
    ).toEqual(['p6']);
  });

  it('D10 pause freezes the deadline and every input; resume shifts the deadline', () => {
    let s = seated(rig(5));
    const deadline = s.phase.deadline as number;
    s = vip(s, 'pause', s.phase.startedAt + 1_000);
    expect(send(s, 'p1', { type: 'nominate', target: 'p2' }).phase.id).toBe('nominate');
    s = vip(s, 'resume', s.phase.startedAt + 31_000);
    expect(s.phase.deadline).toBe(deadline + 30_000);
  });

  it('D11 nothing carries over: the same players, settings and seed give the same game', () => {
    const ctx = { players: makePlayers(8), settings: {}, seed: 42, now: T0 };
    expect(game.init(ctx)).toEqual(game.init(ctx));
    expect(game.init({ ...ctx, seed: 43 })).not.toEqual(game.init(ctx));
  });
});

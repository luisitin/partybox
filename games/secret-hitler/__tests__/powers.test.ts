// The rules of record R12–R22 (SPEC §2): silence, reshuffles, powers, veto, the tracker reset,
// honesty and the end.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { powerForSlot } from '../server/rules';
import { controllerView, tvView } from '../server/views';
import type { Party } from '../server/types';
import { elect, govern, rig, seated, send, timeout, until } from './helpers';

const FF: Party[] = Array<Party>(17).fill('F');

/** A table where the next government enacts a Fascist policy onto slot `board.F + 1`. */
function fascistSession(n: number, boardF: number, deck: Party[] = FF): ReturnType<typeof rig> {
  return seated(rig(n, { deck, patch: { board: { L: 0, F: boardF }, vetoUnlocked: boardF >= 5 } }));
}

/** Elect p1 + `chancellor`, enact an F, then leave claims: lands in `power` (or the next round). */
function toPower(n: number, boardF: number, chancellor = 'p2'): ReturnType<typeof rig> {
  return timeout(govern(fascistSession(n, boardF), chancellor));
}

describe('R12–R14 · silence, reshuffle, the power table', () => {
  it('R12 nobody but the government sees the session cards; the TV flags the silence', () => {
    const s = until(elect(seated(rig(5)), 'p2'), 'presDraw');
    const tv = JSON.stringify(tvView(s));
    expect(tvView(s).silence).toBe(true);
    expect(tv).not.toContain('"cards"');
    for (const id of ['p2', 'p3', 'p4', 'p5']) expect(controllerView(s, id).act).toBeNull();
    const c = send(s, 'p1', { type: 'discard', index: 0 });
    expect(controllerView(c, 'p1').act).toBeNull();
    expect(controllerView(c, 'p3').act).toBeNull();
  });

  it('R13 a session that leaves fewer than 3 cards reshuffles the discards back in', () => {
    const deck: Party[] = ['L', 'L', 'F', 'L', 'F'];
    const discards: Party[] = [...Array<Party>(3).fill('L'), ...Array<Party>(9).fill('F')];
    let s = seated(rig(5, { deck, patch: { discards } }));
    s = govern(s, 'p2');
    expect(s.phase.id).toBe('claims');
    expect(s.deck.length + s.discards.length + s.board.L + s.board.F).toBe(17);
    expect(s.deck).toHaveLength(16);
    expect(s.discards).toEqual([]);
  });

  it('R13 chaos that leaves fewer than 3 cards reshuffles too', () => {
    const deck: Party[] = ['L', 'F', 'F'];
    const discards: Party[] = Array<Party>(14).fill('F');
    let s = seated(rig(5, { deck, patch: { discards, tracker: 2 } }));
    s = timeout(elect(s, 'p2', false));
    expect(s.phase.id).toBe('chaos');
    expect(s.deck).toHaveLength(16);
  });

  it('R14 the power table for 5–6, 7–8 and 9–10 players', () => {
    const row = (n: number): (string | null)[] => [1, 2, 3, 4, 5, 6].map((k) => powerForSlot(n, k));
    for (const n of [5, 6])
      expect(row(n)).toEqual([null, null, 'peek', 'execute', 'execute', null]);
    for (const n of [7, 8])
      expect(row(n)).toEqual([null, 'investigate', 'special', 'execute', 'execute', null]);
    for (const n of [9, 10])
      expect(row(n)).toEqual(['investigate', 'investigate', 'special', 'execute', 'execute', null]);
  });

  it('R14 a Fascist policy on a power slot gives the President the power before the next round', () => {
    const s = toPower(5, 2);
    expect(s.phase.id).toBe('power');
    expect(s.round.power?.kind).toBe('peek');
    expect(s.round.president).toBe('p1');
  });

  it('R14 Liberal policies and slots without a power give nothing', () => {
    expect(timeout(govern(fascistSession(5, 0), 'p2')).phase.id).toBe('nominate');
    const lib: Party[] = Array<Party>(17).fill('L');
    expect(timeout(govern(fascistSession(9, 3, lib), 'p2')).phase.id).toBe('nominate');
  });

  it('R14 slot 5 unlocks the veto for the rest of the game', () => {
    const s = toPower(5, 4);
    expect(s.board.F).toBe(5);
    expect(s.vetoUnlocked).toBe(true);
  });
});

describe('R15–R18 · investigate, special election, peek, execution', () => {
  it('R15 an investigation reaches only the President: no other phone, not the TV', () => {
    let s = send(toPower(7, 1), 'p1', { type: 'target', target: 'p7' });
    s = timeout(s); // the file opens
    expect(controllerView(s, 'p1').dossier?.intel).toHaveLength(1);
    for (const id of ['p2', 'p3', 'p4', 'p5', 'p6', 'p7'])
      expect(controllerView(s, id).dossier?.intel).toEqual([]);
    expect(JSON.stringify(tvView(s))).not.toContain('"intel"');
    expect(tvView(s).seats[6]?.role).toBeUndefined();
  });

  it('R17 the peek reaches only the President: no other phone, not the TV', () => {
    let s = toPower(5, 2);
    expect(controllerView(s, 'p1').act?.cards).toHaveLength(3);
    for (const id of ['p2', 'p3', 'p4', 'p5']) {
      expect(controllerView(s, id).act).toBeNull();
      expect(JSON.stringify(controllerView(s, id))).not.toContain('"cards":["');
    }
    expect(JSON.stringify(tvView(s))).not.toContain('"cards":["');
    s = send(s, 'p1', { type: 'peekDone' });
    for (const id of ['p2', 'p3', 'p4', 'p5'])
      expect(controllerView(s, id).dossier?.intel).toEqual([]);
  });

  it('R15 the President sees the target’s party, never the role, after the pause', () => {
    let s = toPower(7, 1); // slot 2 at 7 players
    expect(s.round.power?.kind).toBe('investigate');
    s = send(s, 'p1', { type: 'target', target: 'p7' }); // p7 is Hitler
    expect(s.phase.id).toBe('powerReveal');
    expect(controllerView(s, 'p1').dossier?.intel).toEqual([]); // "Checking the files…"
    s = timeout(s);
    expect(s.phase.id).toBe('powerReveal');
    expect(controllerView(s, 'p1').dossier?.intel).toEqual([
      { n: 1, k: 'investigate', who: 'p7', party: 'F' },
    ]);
    expect(JSON.stringify(tvView(s))).not.toContain('"party"');
  });

  it('R15 no repeat investigations, and never the President', () => {
    let s = toPower(9, 0); // slot 1 at 9 players
    const act = controllerView(s, 'p1').act;
    expect([...(act?.options ?? []), ...(act?.blocked ?? []).map((b) => b.seat)]).not.toContain(0);
    s = { ...s, investigated: ['p3'] };
    expect(send(s, 'p1', { type: 'target', target: 'p3' }).phase.id).toBe('power');
    expect(send(s, 'p1', { type: 'target', target: 'p1' }).phase.id).toBe('power');
    expect(send(s, 'p1', { type: 'target', target: 'p4' }).phase.id).toBe('powerReveal');
  });

  it('R16 a special election, then the candidacy returns to the seat after the caller', () => {
    let s = send(toPower(7, 2), 'p1', { type: 'target', target: 'p5' });
    s = until(s, 'nominate');
    expect(s.round.president).toBe('p5');
    s = until(elect(s, 'p3', false), 'nominate');
    expect(s.round.president).toBe('p2');
  });

  it('R16 choosing the next seat makes that player President twice in a row', () => {
    let s = until(send(toPower(7, 2), 'p1', { type: 'target', target: 'p2' }), 'nominate');
    expect(s.round.president).toBe('p2');
    s = until(elect(s, 'p3', false), 'nominate');
    expect(s.round.president).toBe('p2');
  });

  it('R17 the peek shows the top three and puts them back in the same order', () => {
    let s = toPower(5, 2, 'p2');
    s = { ...s, deck: ['L', 'F', 'L', ...s.deck.slice(3)] };
    const before = [...s.deck];
    expect(controllerView(s, 'p1').act?.cards).toEqual(before.slice(0, 3));
    s = until(send(s, 'p1', { type: 'peekDone' }), 'nominate');
    expect(s.deck).toEqual(before);
  });

  it('R18 executing Hitler wins for the Liberals', () => {
    let s = toPower(5, 3); // slot 4
    expect(s.round.power?.kind).toBe('execute');
    s = send(s, 'p1', { type: 'target', target: 'p5' });
    expect(s.winner).toBe('liberals');
    expect(s.winReason).toBe('hitlerExecuted');
    expect(timeout(s).phase.id).toBe('gameOver');
  });

  it('R18 anyone else becomes a ghost: no vote, never nominated, role still hidden', () => {
    let s = send(toPower(6, 3), 'p1', { type: 'target', target: 'p3' });
    expect(tvView(s).seats.find((x) => x.id === 'p3')).toEqual({ id: 'p3', tags: ['executed'] });
    s = until(s, 'nominate'); // p2 President
    expect(send(s, 'p2', { type: 'nominate', target: 'p3' }).phase.id).toBe('nominate');
    s = send(s, 'p2', { type: 'nominate', target: 'p4' });
    expect(send(s, 'p3', { type: 'vote', ja: true }).round.votes).toEqual({});
    expect(controllerView(s, 'p3').act).toBeNull();
  });
});

describe('R19–R22 · veto, tracker reset, honesty, the end', () => {
  it('R19 the veto: one request per session; refused → the Chancellor must enact', () => {
    let s = until(elect(fascistSession(5, 5), 'p2'), 'presDraw');
    s = send(s, 'p1', { type: 'discard', index: 0 });
    expect(controllerView(s, 'p2').act?.canVeto).toBe(true);
    s = send(s, 'p2', { type: 'vetoRequest' });
    expect(s.phase.id).toBe('vetoAsk');
    s = send(s, 'p1', { type: 'vetoAnswer', agree: false });
    expect(s.phase.id).toBe('chanEnact');
    expect(controllerView(s, 'p2').act?.canVeto).toBe(false);
    expect(send(s, 'p2', { type: 'vetoRequest' }).phase.id).toBe('chanEnact');
  });

  it('R19 an agreed veto discards both, moves the tracker and passes the candidacy on', () => {
    let s = until(elect(fascistSession(5, 5), 'p2'), 'presDraw');
    s = send(send(s, 'p1', { type: 'discard', index: 0 }), 'p2', { type: 'vetoRequest' });
    s = send(s, 'p1', { type: 'vetoAnswer', agree: true });
    expect(s.phase.id).toBe('claims');
    expect(s.tracker).toBe(1);
    expect(s.board.F).toBe(5);
    expect(s.discards).toHaveLength(3);
    s = timeout(s);
    expect(s.phase.id).toBe('nominate');
    expect(s.round.president).toBe('p2');
  });

  it('R19 no veto before 5 Fascist policies', () => {
    let s = until(elect(fascistSession(5, 4), 'p2'), 'presDraw');
    s = send(s, 'p1', { type: 'discard', index: 0 });
    expect(send(s, 'p2', { type: 'vetoRequest' }).phase.id).toBe('chanEnact');
  });

  it('R19 an agreed veto at tracker 2 causes chaos, then claims', () => {
    let s = fascistSession(5, 5, ['F', 'F', 'F', 'L', ...Array<Party>(13).fill('F')]);
    s = until(elect({ ...s, tracker: 2 }, 'p2'), 'presDraw');
    s = send(send(s, 'p1', { type: 'discard', index: 0 }), 'p2', { type: 'vetoRequest' });
    s = send(s, 'p1', { type: 'vetoAnswer', agree: true });
    expect(s.phase.id).toBe('chaos');
    expect(s.board.L).toBe(1);
    expect(timeout(s).phase.id).toBe('claims');
  });

  it('R20 any enactment resets the tracker', () => {
    const s = govern(seated(rig(5, { patch: { tracker: 2 } })), 'p2');
    expect(s.tracker).toBe(0);
  });

  it('R21 the game never lies: an investigation shows the true party', () => {
    let s = send(toPower(7, 1), 'p1', { type: 'target', target: 'p3' }); // p3 Liberal
    s = timeout(s);
    expect(controllerView(s, 'p1').dossier?.intel[0]).toMatchObject({ who: 'p3', party: 'L' });
  });

  it('R22 every role is revealed at the end, and not before', () => {
    let s = toPower(5, 3);
    expect(tvView(s).seats.every((x) => x.role === undefined)).toBe(true);
    s = timeout(send(s, 'p1', { type: 'target', target: 'p5' }));
    expect(s.phase.id).toBe('gameOver');
    expect(tvView(s).seats.map((x) => x.role)).toEqual([
      'liberal',
      'liberal',
      'liberal',
      'fascist',
      'hitler',
    ]);
    s = timeout(s);
    expect(game.results(s)?.winnerIds).toEqual(['p1', 'p2', 'p3']);
  });

  it('ADR-052 the results name the winning side, its members and why', () => {
    const s = timeout(timeout(send(toPower(5, 3), 'p1', { type: 'target', target: 'p5' })));
    const r = game.results(s);
    expect(r?.outcome).toEqual({
      kind: 'teams',
      winner: 'liberals',
      teams: [
        { id: 'liberals', name: 'Liberals', mark: '▲', members: ['p1', 'p2', 'p3'] },
        { id: 'fascists', name: 'Fascists', mark: '●', members: ['p4', 'p5'] },
      ],
    });
    expect(r?.headline).toBe('Hitler is dead: the Liberals win!');
  });
});

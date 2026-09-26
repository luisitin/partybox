// The rules of record R1–R11 (docs/game-pack/secret-hitler/SPEC.md §2), one named test or more
// per rule, against the real reducer.
import { describe, expect, it } from 'vitest';
import { controllerView } from '../server/views';
import { partyOf } from '../server/rules';
import type { Party } from '../server/types';
import { elect, govern, rig, seated, send, start, timeout, until, voteAll } from './helpers';

const COUNTS: Record<number, [number, number]> = {
  5: [3, 1],
  6: [4, 1],
  7: [4, 2],
  8: [5, 2],
  9: [5, 3],
  10: [6, 3],
};

describe('R1–R3 · roles, knowledge, deck', () => {
  it('R1 role counts for 5–10 players, exactly one Hitler', () => {
    for (let n = 5; n <= 10; n++) {
      for (const seed of [1, 2, 3]) {
        const roles = Object.values(start(n, seed).role);
        const [lib, fas] = COUNTS[n] as [number, number];
        expect(roles.filter((r) => r === 'liberal')).toHaveLength(lib);
        expect(roles.filter((r) => r === 'fascist')).toHaveLength(fas);
        expect(roles.filter((r) => r === 'hitler')).toHaveLength(1);
      }
    }
  });

  it("R1 a player has a party and a role; Hitler's party is Fascist", () => {
    expect(partyOf('liberal')).toBe('L');
    expect(partyOf('fascist')).toBe('F');
    expect(partyOf('hitler')).toBe('F');
    const s = rig(5);
    expect(controllerView(s, 'p5').dossier).toMatchObject({ party: 'F', role: 'hitler' });
  });

  it('R2 Fascists know every Fascist and Hitler; Liberals know nothing', () => {
    const s = rig(7); // p5, p6 Fascists, p7 Hitler
    const fascists = s.seats.filter((id) => s.role[id] === 'fascist');
    const hitler = s.seats.find((id) => s.role[id] === 'hitler') as string;
    for (const f of fascists) {
      const team = controllerView(s, f)
        .dossier?.team.map((t) => t.id)
        .sort();
      expect(team).toEqual([...fascists.filter((x) => x !== f), hitler].sort());
    }
    for (const id of s.seats.filter((x) => s.role[x] === 'liberal'))
      expect(controllerView(s, id).dossier?.team).toEqual([]);
  });

  it('R2 Hitler knows the Fascist at 5–6 players and nobody at 7–10', () => {
    for (let n = 5; n <= 10; n++) {
      const s = rig(n);
      const hitler = s.seats.find((id) => s.role[id] === 'hitler') as string;
      const team = controllerView(s, hitler).dossier?.team ?? [];
      if (n <= 6)
        expect(team).toEqual([
          { id: s.seats.find((id) => s.role[id] === 'fascist'), role: 'fascist' },
        ]);
      else expect(team).toEqual([]);
    }
  });

  it('R3 the deck is 6 Liberal and 11 Fascist policies, shuffled with the rng', () => {
    const a = start(5, 1).deck;
    expect(a.filter((c) => c === 'L')).toHaveLength(6);
    expect(a.filter((c) => c === 'F')).toHaveLength(11);
    expect(start(5, 1).deck).toEqual(a);
    expect(start(5, 2).deck).not.toEqual(a);
  });
});

describe('R4–R7 · winning, seats, nomination, the vote', () => {
  it('R4 the 5th Liberal policy wins for the Liberals', () => {
    let s = seated(
      rig(5, {
        deck: ['L', 'L', 'L', ...Array<Party>(14).fill('F')],
        patch: { board: { L: 4, F: 0 } },
      }),
    );
    s = govern(s, 'p2');
    expect(s.phase.id).toBe('gameOver');
    expect(s.winner).toBe('liberals');
    expect(s.winReason).toBe('liberalPolicies');
  });

  it('R4 the 6th Fascist policy wins for the Fascists', () => {
    const deck: Party[] = Array<Party>(17).fill('F');
    let s = seated(rig(5, { deck, patch: { board: { L: 0, F: 5 }, vetoUnlocked: true } }));
    s = govern(s, 'p2');
    expect(s.phase.id).toBe('gameOver');
    expect(s.winner).toBe('fascists');
  });

  it('R5 seat order is shuffled with the rng and the first President is a random seat', () => {
    const orders = new Set<string>();
    const firsts = new Set<string>();
    for (let seed = 1; seed <= 12; seed++) {
      const s = start(8, seed);
      orders.add(s.seats.join());
      firsts.add(s.round.president);
      expect(s.round.president).toBe(s.seats[s.presPointer]);
    }
    expect(orders.size).toBeGreaterThan(6);
    expect(firsts.size).toBeGreaterThan(3);
  });

  it('R5 the candidacy passes to the next living seat, skipping the executed', () => {
    let s = seated(rig(6, { patch: { alive: ['p1', 'p3', 'p4', 'p5', 'p6'], executed: ['p2'] } }));
    s = until(elect(s, 'p3', false), 'nominate');
    expect(s.round.president).toBe('p3');
  });

  it('R6 the last elected President and Chancellor are term-limited', () => {
    let s = seated(rig(7));
    s = govern(s, 'p3'); // p1 President, p3 Chancellor
    s = until(s, 'nominate');
    expect(s.round.president).toBe('p2');
    const reasons = Object.fromEntries(
      (controllerView(s, 'p2').act?.blocked ?? []).map((b) => [s.seats[b.seat], b.reason]),
    );
    expect(reasons['p1']).toBe('lastPresident');
    expect(reasons['p3']).toBe('lastChancellor');
    expect(send(s, 'p2', { type: 'nominate', target: 'p3' }).phase.id).toBe('nominate');
  });

  it('R6 with five or fewer alive only the last Chancellor is term-limited', () => {
    let s = seated(rig(5));
    s = until(govern(s, 'p3'), 'nominate');
    s = send(s, 'p2', { type: 'nominate', target: 'p1' });
    expect(s.phase.id).toBe('vote');
  });

  it('R6 a failed vote does not change term limits; term limits never bar the presidency', () => {
    let s = seated(rig(7));
    s = until(govern(s, 'p2'), 'nominate'); // p2 was Chancellor and is now the President
    expect(s.round.president).toBe('p2');
    s = until(elect(s, 'p4', false), 'nominate');
    expect(s.lastElected).toEqual({ president: 'p1', chancellor: 'p2' });
  });

  it('R7 elected when Ja votes are more than half; a tie fails', () => {
    let s = elect(seated(rig(6)), 'p2', false);
    expect(s.phase.id).toBe('voteReveal'); // everyone voted: the phase ends early (D2)
    s = seated(rig(6));
    s = send(s, 'p1', { type: 'nominate', target: 'p2' });
    for (const [i, id] of s.alive.entries()) s = send(s, id, { type: 'vote', ja: i < 3 });
    expect(s.round.elected).toBe(false); // 3–3
    s = seated(rig(6));
    s = send(s, 'p1', { type: 'nominate', target: 'p2' });
    for (const [i, id] of s.alive.entries()) s = send(s, id, { type: 'vote', ja: i < 4 });
    expect(s.round.elected).toBe(true); // 4–2
  });

  it('R7 an elected pair becomes the next term-limited pair', () => {
    const s = voteAll(send(seated(rig(7)), 'p1', { type: 'nominate', target: 'p5' }), true);
    expect(s.lastElected).toEqual({ president: 'p1', chancellor: 'p5' });
    expect(s.tracker).toBe(0);
  });
});

describe('R8–R11 · the Hitler check, failed governments, chaos, the session', () => {
  it('R8 electing Hitler Chancellor with 3+ Fascist policies wins for the Fascists', () => {
    let s = elect(seated(rig(5, { patch: { board: { L: 0, F: 3 } } })), 'p5');
    s = timeout(s);
    expect(s.phase.id).toBe('hitlerCheck');
    expect(s.winner).toBe('fascists');
    expect(s.winReason).toBe('hitlerElected');
    expect(timeout(s).phase.id).toBe('gameOver');
  });

  it('R8 a Chancellor who is not Hitler is marked Not Hitler, and the session goes on', () => {
    let s = timeout(elect(seated(rig(5, { patch: { board: { L: 0, F: 3 } } })), 'p4'));
    expect(s.phase.id).toBe('hitlerCheck');
    expect(s.notHitler).toEqual(['p4']);
    s = timeout(s);
    expect(s.phase.id).toBe('presDraw');
  });

  it('R8 below 3 Fascist policies there is no check', () => {
    const s = timeout(elect(seated(rig(5, { patch: { board: { L: 0, F: 2 } } })), 'p5'));
    expect(s.phase.id).toBe('presDraw');
  });

  it('R9 a failed vote moves the tracker up one and passes the candidacy on', () => {
    let s = elect(seated(rig(5)), 'p2', false);
    expect(s.tracker).toBe(1);
    s = timeout(s);
    expect(s.phase.id).toBe('nominate');
    expect(s.round.president).toBe('p2');
  });

  it('R10 chaos enacts the top card, ignores its power, resets the tracker and clears term limits', () => {
    const deck: Party[] = ['F', ...Array<Party>(16).fill('L')];
    let s = seated(
      rig(5, {
        deck,
        patch: {
          tracker: 2,
          board: { L: 0, F: 2 },
          lastElected: { president: 'p4', chancellor: 'p3' },
        },
      }),
    );
    s = timeout(elect(s, 'p2', false));
    expect(s.phase.id).toBe('chaos');
    expect(s.board).toEqual({ L: 0, F: 3 }); // slot 3 = Policy peek at 5 players: ignored
    expect(s.tracker).toBe(0);
    expect(s.lastElected).toEqual({ president: null, chancellor: null });
    s = timeout(s);
    expect(s.phase.id).toBe('nominate');
    expect(s.round.power).toBeNull();
  });

  it('R10 a chaos policy can win the game', () => {
    const deck: Party[] = ['L', ...Array<Party>(16).fill('F')];
    let s = seated(rig(5, { deck, patch: { tracker: 2, board: { L: 4, F: 0 } } }));
    s = timeout(elect(s, 'p2', false));
    expect(s.winner).toBe('liberals');
    expect(timeout(s).phase.id).toBe('gameOver');
  });

  it('R11 the President draws three, discards one, and the Chancellor enacts one of the other two', () => {
    const deck: Party[] = ['F', 'L', 'F', ...Array<Party>(14).fill('L')];
    let s = until(elect(seated(rig(5, { deck })), 'p2'), 'presDraw');
    expect(controllerView(s, 'p1').act?.cards).toEqual(['F', 'L', 'F']);
    expect(s.deck).toHaveLength(14);
    s = send(s, 'p1', { type: 'discard', index: 0 });
    expect(s.phase.id).toBe('chanEnact');
    expect(controllerView(s, 'p2').act?.cards).toEqual(['L', 'F']);
    s = send(s, 'p2', { type: 'enact', index: 0 });
    expect(s.phase.id).toBe('enactReveal');
    expect(s.board).toEqual({ L: 1, F: 0 });
    expect(s.discards).toEqual(['F', 'F']);
  });

  it('R11 only the President discards and only the Chancellor enacts', () => {
    let s = until(elect(seated(rig(5)), 'p2'), 'presDraw');
    expect(send(s, 'p2', { type: 'discard', index: 0 }).phase.id).toBe('presDraw');
    s = send(s, 'p1', { type: 'discard', index: 0 });
    expect(send(s, 'p1', { type: 'enact', index: 0 }).phase.id).toBe('chanEnact');
  });
});

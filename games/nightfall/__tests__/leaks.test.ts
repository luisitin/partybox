// SPEC §10.10 / §10.20 "Leaks", as non-interference: re-dealing every role a viewer may not know
// must leave that viewer's view byte-identical, on every visited state of random games. Plus: the
// night screen is the same for every role outside hold-to-see, and spectators get the TV view.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { isAlive, roleOf } from '../server/rules';
import type { Role, State } from '../server/types';
import { playRandom } from './helpers';

/** Rotates the roles of `ids` one seat along (a derangement when 2+ differ). */
function rotate(state: State, ids: readonly string[]): State {
  if (ids.length < 2) return state;
  const roles = { ...state.roles };
  ids.forEach((id, i) => {
    roles[id] = state.roles[ids[(i + 1) % ids.length] as string] as Role;
  });
  return { ...state, roles };
}

function strip(view: object): string {
  const v = JSON.parse(JSON.stringify(view)) as Record<string, unknown>;
  delete v['tally'];
  const stage = v['stage'] as Record<string, unknown> | null | undefined;
  if (stage) delete stage['tally'];
  return JSON.stringify(v);
}

function over(state: State): boolean {
  return state.phase.id === 'end' || state.phase.id === 'done';
}

/** Roles anyone may know: told deaths with roles revealed, and the hunter taking aim. */
function publicIds(state: State): Set<string> {
  const out = new Set<string>();
  if (state.cfg.revealRoles) for (const d of state.dead) if (d.told) out.add(d.id);
  if (state.hunterPending) out.add(state.hunterPending);
  return out;
}

const VARIANTS = [
  {},
  { revealRoles: false },
  { roles: 'seer,doctor,hunter,jester', townBoard: 'on' },
  { flavour: 'mafia', ghostsSeeAll: true },
];

describe('no leaks (non-interference)', () => {
  it('the TV never depends on a hidden role', () => {
    for (const settings of VARIANTS)
      for (const seed of [1, 2, 3]) {
        for (const s of playRandom(8 + seed, seed, settings)) {
          if (over(s)) continue;
          const pub = publicIds(s);
          const hidden = s.seats.filter((id) => !pub.has(id));
          expect(strip(game.tvView(rotate(s, hidden))), `${s.phase.id}`).toBe(
            strip(game.tvView(s)),
          );
        }
      }
  });

  it('a phone never depends on a role its player may not know', () => {
    for (const settings of VARIANTS)
      for (const seed of [4, 5]) {
        const states = playRandom(9, seed, settings);
        for (let i = 0; i < states.length; i += 3) {
          const s = states[i] as State;
          if (over(s)) continue;
          const pub = publicIds(s);
          for (const viewer of s.seats) {
            const ghost = !isAlive(s, viewer) && s.dead.some((d) => d.id === viewer && d.told);
            if (ghost && s.cfg.ghostsSeeAll) continue;
            const mine = roleOf(s, viewer);
            const known = new Set([viewer, ...pub]);
            if (mine === 'wolf')
              for (const id of s.seats) if (roleOf(s, id) === 'wolf') known.add(id);
            if (mine === 'seer') for (const l of s.seerLog) known.add(l.target);
            const hidden = s.seats.filter((id) => !known.has(id));
            const a = strip(game.controllerView(s, viewer));
            const b = strip(game.controllerView(rotate(s, hidden), viewer));
            expect(b, `${viewer} (${mine}) in ${s.phase.id}`).toBe(a);
          }
        }
      }
  });

  it('the night screen is identical for every role outside hold-to-see', () => {
    const HOLD = [
      'me',
      'role',
      'pack',
      'packBots',
      'packPicks',
      'myPick',
      'lastProtected',
      'seerLog',
    ];
    for (const s of playRandom(10, 7, { roles: 'seer,doctor,hunter,jester' })) {
      if (s.phase.id !== 'night' && s.phase.id !== 'dawn') continue;
      const views = s.alive.map((id) => {
        const v = JSON.parse(JSON.stringify(game.controllerView(s, id))) as Record<string, unknown>;
        for (const k of HOLD) delete v[k];
        v['report'] = v['report'] === null ? null : 'strip';
        return JSON.stringify(v);
      });
      expect(new Set(views).size, s.phase.id).toBe(1);
    }
  });

  it('spectators get exactly the TV view', () => {
    for (const s of playRandom(8, 11)) {
      const spec = game.controllerView(s, 'late-joiner') as unknown as Record<string, unknown>;
      const tv = game.tvView(s) as unknown as Record<string, unknown>;
      for (const [k, v] of Object.entries(tv)) expect(spec[k], k).toEqual(v);
      expect(spec['role']).toBeNull();
      expect(spec['roles'] === null || over(s)).toBe(true);
    }
  });

  it('no living player’s role on the TV; the dead only once flipped', () => {
    for (const s of playRandom(12, 13, { roles: 'seer,doctor,hunter' })) {
      if (over(s)) continue;
      const tv = game.tvView(s);
      for (const g of tv.graveyard) expect(isAlive(s, g.id)).toBe(false);
      for (const n of tv.stage.news ?? []) if (n.role) expect(s.step).toBe(2);
    }
  });
});

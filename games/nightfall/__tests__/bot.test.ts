// SPEC §10.13 / §10.20 "Bots": wolf bots follow human packmates, and no bot acts on information
// outside its own view (re-dealing roles it cannot know never changes what it sends).
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { game } from '../server/index';
import { roleOf } from '../server/rules';
import type { Role, State } from '../server/types';
import { EIGHT, finish, input, night, phone, playRandom, start, toNight, vip } from './helpers';

function sample(state: State, id: string, seed = 3): ReturnType<typeof game.bot.sampleInput> {
  return game.bot.sampleInput(state, id, createRng(seed));
}

describe('bots', () => {
  it('a wolf bot waits for its connected human packmate, then follows the pick', () => {
    let s = toNight(start({ roles: EIGHT, bots: ['cy'] }));
    expect(sample(s, 'cy')).toBeNull();
    s = input(s, 'ben', { type: 'night', target: 'fay' });
    expect(sample(s, 'cy')).toEqual({ type: 'night', target: 'fay' });
    s = input(s, 'cy', { type: 'night', target: 'fay' });
    s = input(s, 'ben', { type: 'night', target: 'gus' });
    expect(sample(s, 'cy')).toEqual({ type: 'night', target: 'gus' });
  });

  it('a wolf bot with only bot packmates hunts a non-wolf on its own', () => {
    const s = toNight(start({ roles: EIGHT, bots: ['ben', 'cy'] }));
    for (let seed = 1; seed < 20; seed++) {
      const inp = sample(s, 'ben', seed);
      expect(inp?.type).toBe('night');
      if (inp?.type === 'night') expect(['ben', 'cy']).not.toContain(inp.target);
    }
  });

  it('night picks are always valid for the role', () => {
    const s = toNight(start({ roles: EIGHT }));
    for (let seed = 1; seed < 30; seed++) {
      expect((sample(s, 'ana', seed) as { target: string }).target).not.toBe('ana');
      expect((sample(s, 'dee', seed) as { target: string }).target).not.toBe('dee');
    }
  });

  it('the seer bot votes for a wolf it found', () => {
    let s = night(toNight(start({ roles: EIGHT })), { ana: 'ben' });
    s = vip(finish(s), 'skip');
    expect(sample(s, 'ana')).toEqual({ type: 'vote', target: 'ben' });
  });

  it('the hunter bot shoots; last words are canned', () => {
    let s = night(toNight(start({ roles: { ...EIGHT, fay: 'hunter' } })), {
      ben: 'fay',
      cy: 'fay',
    });
    s = finish(s);
    expect(sample(s, 'fay')?.type).toBe('shoot');
    expect(sample(s, 'ana')).toBeNull();
  });

  it('no bot decision depends on a role its view does not show', () => {
    for (const s of playRandom(10, 21, { roles: 'seer,doctor,hunter,jester', townBoard: 'on' })) {
      if (s.phase.id === 'end' || s.phase.id === 'done') continue;
      for (const bot of s.alive) {
        const mine = roleOf(s, bot);
        const known = new Set([bot]);
        if (mine === 'wolf') for (const id of s.seats) if (roleOf(s, id) === 'wolf') known.add(id);
        if (mine === 'seer') for (const l of s.seerLog) known.add(l.target);
        for (const d of s.dead) if (d.told && s.cfg.revealRoles) known.add(d.id);
        const hidden = s.seats.filter((id) => !known.has(id));
        const roles = { ...s.roles };
        hidden.forEach((id, i) => {
          roles[id] = s.roles[hidden[(i + 1) % hidden.length] as string] as Role;
        });
        const other: State = { ...s, roles };
        // The hunch tally is public but role-derived; bots read it only after dawn made it public.
        if (JSON.stringify(phone(other, bot).tally) !== JSON.stringify(phone(s, bot).tally))
          continue;
        expect(sample(other, bot, 5), `${bot} (${mine}) in ${s.phase.id}`).toEqual(
          sample(s, bot, 5),
        );
      }
    }
  });
});

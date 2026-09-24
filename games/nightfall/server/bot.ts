// Bots (SPEC §10.13). Every decision is made from the bot's own phone view — `phoneView(state,
// botId)` — and nothing else (P00 §7 rule 9): a wolf bot knows its pack, a villager bot knows
// nothing. Night and vote choices come through `sampleInput`; day posts and "Ready" are paced by
// the game on beats (NOTES decision 3) and call `botPost` here with the same view.
import { BOTLINES, botLine } from './content';
import type { BotLine } from '../content/schema';
import type { NightfallControllerView } from './views-phone';
import type { Input } from './types';

type View = NightfallControllerView;
type Roll = () => number;

function one<T>(items: readonly T[], r: Roll): T | null {
  if (items.length === 0) return null;
  return items[Math.min(items.length - 1, Math.floor(r() * items.length))] ?? null;
}

function nameOf(v: View, id: string): string {
  return v.players.find((p) => p.id === id)?.name ?? '';
}

function connected(v: View, id: string): boolean {
  return v.players.find((p) => p.id === id)?.connected ?? false;
}

/** How often each living player was named on today's board, plus the hunch tally. */
function accusations(v: View, exclude: readonly string[]): { id: string; n: number }[] {
  const scores = v.living
    .filter((id) => !exclude.includes(id))
    .map((id) => {
      const name = nameOf(v, id).toLowerCase();
      const posts = name
        ? v.board.filter((p) => p.by !== id && p.text.toLowerCase().includes(name))
        : [];
      const hunch = v.tally.find((t) => t.id === id)?.n ?? 0;
      return { id, n: posts.length * 2 + hunch };
    });
  return scores.filter((s) => s.n > 0).sort((a, b) => b.n - a.n);
}

/** Whoever claimed the seer's role on the board today. */
function seerClaimer(v: View): string | null {
  const seer = v.cast.find((c) => c.role === 'seer')?.name.toLowerCase();
  if (!seer) return null;
  const post = v.board.find((p) => p.text.toLowerCase().includes(seer) && p.by !== v.me.id);
  return post ? post.by : null;
}

/** A living player someone named as a wolf on the board today. */
function namedWolf(v: View, among: readonly string[]): string | null {
  for (const p of v.board)
    for (const id of among) {
      const name = nameOf(v, id).toLowerCase();
      if (name && p.by !== id && p.text.toLowerCase().includes(name)) return id;
    }
  return null;
}

function night(v: View, r: Roll, selfBot: boolean): Input | null {
  const role = v.role?.id;
  const me = v.me.id;
  if (!role || !v.alive) return null;
  // A wolf may re-pick to follow a human packmate; everyone else picks once.
  if (role !== 'wolf' && v.myPick !== null) return null;
  const others = v.living.filter((id) => id !== me);
  if (role === 'wolf') {
    const prey = others.filter((id) => !v.pack.includes(id));
    // SPEC §10.13: bots follow humans — a bot never picks before a connected human packmate.
    const humans = v.pack.filter(
      (id) => v.living.includes(id) && !v.packBots.includes(id) && connected(v, id),
    );
    if (selfBot && humans.length > 0) {
      const lead = v.packPicks.find((p) => humans.includes(p.by));
      if (!lead || lead.target === v.myPick) return null;
      return { type: 'night', target: lead.target };
    }
    if (v.myPick !== null) return null;
    const pack = [...v.pack, me];
    const voters = v.lastVotes
      .filter((b) => pack.includes(b.target) && prey.includes(b.by))
      .map((b) => b.by);
    const target = voters.length > 0 && r() < 0.5 ? one(voters, r) : one(prey, r);
    return target ? { type: 'night', target } : null;
  }
  if (role === 'seer') {
    const checked = new Set(v.seerLog.map((l) => l.target));
    const fresh = others.filter((id) => !checked.has(id));
    const target = one(fresh.length > 0 ? fresh : others, r);
    return target ? { type: 'night', target } : null;
  }
  if (role === 'doctor') {
    const allowed = v.living.filter((id) => id !== v.lastProtected);
    const self = allowed.includes(me) && r() < 0.3;
    const target = self
      ? me
      : one(
          allowed.filter((id) => id !== me),
          r,
        );
    return target ? { type: 'night', target } : null;
  }
  const target = one(others, r);
  return target ? { type: 'night', target } : null;
}

function vote(v: View, r: Roll): Input | null {
  if (!v.vote || v.vote.mine !== null) return null;
  const pool = v.vote.candidates;
  const role = v.role?.id;
  const pick = (ids: readonly (string | null)[]): Input | null => {
    const id = ids.find((x): x is string => x !== null && pool.includes(x));
    return id ? { type: 'vote', target: id } : null;
  };
  const fallback = (): Input => ({ type: 'vote', target: one(pool, r) ?? 'none' });
  if (role === 'wolf') {
    const safe = accusations(v, [...v.pack, v.me.id]).map((a) => a.id);
    const claimer = seerClaimer(v);
    const target = claimer && !v.pack.includes(claimer) ? claimer : null;
    return pick([target, ...safe]) ?? pick(pool.filter((id) => !v.pack.includes(id))) ?? fallback();
  }
  if (role === 'jester') return fallback();
  if (role === 'seer') {
    const found = pick(v.seerLog.filter((l) => l.wolf).map((l) => l.target));
    if (found) return found;
  }
  if (r() < 0.1) return { type: 'vote', target: 'none' };
  return pick(accusations(v, [v.me.id]).map((a) => a.id)) ?? fallback();
}

function say(v: View, bank: readonly BotLine[], r: Roll, about: string | null): string | null {
  const line = one(bank, r);
  return line ? botLine(line.text, v.flavour, about ? nameOf(v, about) : '') : null;
}

/** A town-board post for this bot today, or null. */
export function botPost(v: View, r: Roll): string | null {
  if (!v.alive || v.postsLeft === null || v.postsLeft <= 0 || !v.role) return null;
  const me = v.me.id;
  const others = v.living.filter((id) => id !== me);
  const role = v.role.id;
  const accused = v.board.some(
    (p) => p.by !== me && p.text.toLowerCase().includes(nameOf(v, me).toLowerCase()),
  );
  if (role === 'wolf')
    return say(
      v,
      BOTLINES.accusations,
      r,
      one(
        others.filter((id) => !v.pack.includes(id)),
        r,
      ),
    );
  if (role === 'seer') {
    const wolf = v.seerLog.find((l) => l.wolf && v.living.includes(l.target));
    if (wolf && r() < 0.5) return say(v, BOTLINES.seerClaims, r, wolf.target);
    return say(v, BOTLINES.generic, r, null);
  }
  if (role === 'doctor') return say(v, BOTLINES.generic, r, null);
  if (role === 'jester')
    return r() < 0.5
      ? say(v, BOTLINES.defences, r, null)
      : say(v, BOTLINES.accusations, r, one(others, r));
  if (accused) return say(v, BOTLINES.defences, r, null);
  const top = v.tally.find((t) => t.id !== me)?.id ?? one(others, r);
  return say(v, BOTLINES.accusations, r, top);
}

/** What a bot sends right now, decided only from its own phone view. */
export function botInput(v: View, r: Roll, selfBot = true): Input | null {
  if (v.me.role !== 'player') return null;
  switch (v.phaseId) {
    case 'roles':
      return v.ready ? null : { type: 'ready' };
    case 'night':
      return night(v, r, selfBot);
    case 'vote':
    case 'runoff':
      return vote(v, r);
    case 'hunter': {
      if (!v.shoot) return null;
      const target = namedWolf(v, v.shoot.targets) ?? one(v.shoot.targets, r);
      return target ? { type: 'shoot', target } : null;
    }
    case 'lastWords': {
      if (!v.speak) return null;
      const text = say(v, BOTLINES.lastWords, r, null);
      return text ? { type: 'lastWords', text } : null;
    }
    default:
      return null;
  }
}

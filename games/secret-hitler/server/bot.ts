// Bots (SPEC §16, simplified for M1): a bot decides from its own controller view only — the
// owner's ruling 20 (`decide(controllerView)`), so it can never read a secret its phone lacks.
// Suspicion comes from the public Record; roles steer the choices as §16.2 describes.
import type { Rng } from '@partybox/game-sdk';
import { hasTag } from './views';
import type { ShControllerView } from './views';
import type { Input, Party } from './types';

type View = ShControllerView;

/** §16.1 from the Record rows the phone can see: Fascist governments +2, Liberal ones −1. */
function suspicion(view: View): Map<string, number> {
  const score = new Map<string, number>(view.seats.map((s) => [s.id, 0]));
  const add = (id: string, d: number): void => {
    score.set(id, (score.get(id) ?? 0) + d);
  };
  for (const row of view.history) {
    if (row.enacted === null) continue;
    const d = row.enacted === 'F' ? 2 : -1;
    add(view.seats[row.pres]?.id ?? '', d);
    add(view.seats[row.chan]?.id ?? '', d);
  }
  return score;
}

function byScore(
  ids: string[],
  score: Map<string, number>,
  rng: Rng,
  high: boolean,
): string | null {
  if (ids.length === 0) return null;
  const sign = high ? -1 : 1;
  const shuffled = rng.shuffle(ids); // ties go to the rng
  return (
    [...shuffled].sort((a, b) => sign * ((score.get(a) ?? 0) - (score.get(b) ?? 0)))[0] ?? null
  );
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function indexOf(cards: Party[], card: Party): number {
  return cards.indexOf(card);
}

export function decide(view: View, rng: Rng): Input | null {
  const act = view.act;
  const me = view.dossier;
  if (!act || !me) return null;
  const team = new Set(me.team.map((t) => t.id));
  const hitler = me.team.find((t) => t.role === 'hitler')?.id ?? null;
  const fascist = me.role === 'fascist';
  const zone = view.board.F >= 3;
  const score = suspicion(view);
  const open = act.options.map((i) => view.seats[i]?.id ?? '').filter((id) => id !== '');
  switch (act.kind) {
    case 'ready':
      return act.done ? null : { type: 'ready' };
    case 'nominate': {
      let target: string | null = null;
      if (fascist && hitler && zone && open.includes(hitler)) target = hitler;
      else if (fascist && rng.float() < 0.4)
        target = rng.shuffle(open.filter((id) => team.has(id) && id !== hitler))[0] ?? null;
      target ??= byScore(fascist ? open.filter((id) => !team.has(id)) : open, score, rng, false);
      target ??= open[0] ?? null;
      return target === null ? null : { type: 'nominate', target };
    }
    case 'vote': {
      if (act.myVote !== null && rng.float() < 0.85) return null; // mostly one vote, sometimes a change
      const gov = [view.round.president, view.round.nominee ?? ''];
      if (fascist) {
        const friendly = gov.some((id) => team.has(id));
        return { type: 'vote', ja: friendly || (zone && gov[1] === hitler) || rng.float() < 0.5 };
      }
      if (me.role === 'hitler' && gov.includes(view.me.id)) return { type: 'vote', ja: true };
      const others = view.seats.filter((s) => s.id !== view.me.id).map((s) => score.get(s.id) ?? 0);
      const mid = median(others);
      const nominee = view.seats.find((s) => s.id === gov[1]);
      const risky = zone && (score.get(gov[1] ?? '') ?? 0) > mid && !hasTag(nominee, 'notHitler');
      const trusted = gov.every((id) => (score.get(id) ?? 0) <= mid);
      return { type: 'vote', ja: !risky && (trusted || view.tracker >= 2 || rng.float() < 0.3) };
    }
    case 'discard': {
      const f = indexOf(act.cards, 'F');
      const l = indexOf(act.cards, 'L');
      const early = view.board.L + view.board.F < 2;
      const likeLiberal = !fascist || (early && rng.float() < 0.5);
      if (likeLiberal)
        return { type: 'discard', index: f >= 0 ? f : rng.int(0, act.cards.length - 1) };
      return { type: 'discard', index: l >= 0 && rng.float() < 0.7 ? l : Math.max(0, f) };
    }
    case 'enact': {
      if (act.canVeto && !fascist && act.cards.every((c) => c === 'F'))
        return { type: 'vetoRequest' };
      const f = indexOf(act.cards, 'F');
      const l = indexOf(act.cards, 'L');
      const wantF = fascist ? rng.float() < 0.75 : me.role === 'hitler' && zone;
      const index = wantF ? (f >= 0 ? f : l) : l >= 0 ? l : f;
      return { type: 'enact', index: Math.max(0, index) };
    }
    case 'vetoAnswer':
      return { type: 'vetoAnswer', agree: !fascist && act.cards.every((c) => c === 'F') };
    case 'peek':
      return { type: 'peekDone' };
    case 'target': {
      if (act.done) return null;
      const pool = fascist ? open.filter((id) => !team.has(id)) : open;
      const choices = pool.length > 0 ? pool : open;
      const high = act.power === 'execute' ? !fascist : act.power === 'investigate';
      const target = byScore(choices, score, rng, high);
      return target === null ? null : { type: 'target', target };
    }
  }
}

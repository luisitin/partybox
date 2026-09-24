// What the TV shows, built once so the phone's stage (phone-only rooms, remote phones) shows the
// same moment (SPEC §10.9, P00 §3.6). Everything here is public at the moment it is built: a role
// appears only once its card has flipped, a death only once it was announced (§10.10).
import { fillIn, flavourOf } from './content';
import { knownAlive, knownDead, nameOf, roleOf } from './rules';
import { readingNow, spokenNow, tonightsDeaths } from './speech';
import { ROLES } from '../content/schema';
import type { Ballot, DeathHow, FlavourId, Role, Side, State } from './types';

export interface CastEntry {
  role: Role;
  name: string;
  plural: string;
  icon: string;
  count: number;
}
export interface GraveEntry {
  id: string;
  how: DeathHow;
  day: number;
  role: Role | null;
}
export interface TimelineEntry {
  kind: 'night' | 'day';
  n: number;
  id: string | null;
  role: Role | null;
  saved: boolean;
}
export interface StageView {
  /** The narrator's words for this moment (also read aloud when a reader is on). */
  lines: string[];
  say: { key: string; url: string } | null;
  news: { id: string; how: DeathHow; role: Role | null }[] | null;
  tally: { id: string; n: number | null }[];
  verdict: {
    ballots: Ballot[];
    counts: { id: string; n: number }[];
    out: string | null;
    reason: 'tie' | 'noone' | null;
    role: Role | null;
    runoff: boolean;
    leavers: string[];
  } | null;
  hunter: { id: string; shot: string | null; role: Role | null } | null;
  lastWords: { by: string; text: string | null } | null;
  end: {
    winner: Side | null;
    reason: State['reason'];
    headline: string;
    roles: { id: string; role: Role }[];
    timeline: TimelineEntry[];
  } | null;
}

export function over(state: State): boolean {
  return state.phase.id === 'end' || state.phase.id === 'done';
}

/** The public role list: "2 Wolves · Seer · Doctor · 4 Villagers". */
export function castOf(state: State): CastEntry[] {
  const f = flavourOf(state.cfg.flavour);
  const counts = new Map<Role, number>();
  for (const id of state.seats) {
    const role = roleOf(state, id);
    if (role) counts.set(role, (counts.get(role) ?? 0) + 1);
  }
  return ROLES.filter((r) => counts.has(r)).map((role) => ({
    role,
    name: f.roles[role].name,
    plural: f.roles[role].plural,
    icon: f.roles[role].icon,
    count: counts.get(role) ?? 0,
  }));
}

/** Told deaths; the role only when it has been shown (revealRoles, the game over, or `seeAll`). */
export function graveyardOf(state: State, seeAll = false): GraveEntry[] {
  const shown = seeAll || state.cfg.revealRoles || over(state);
  return knownDead(state).map((d) => ({
    id: d.id,
    how: d.how,
    day: d.day,
    role: shown ? (roleOf(state, d.id) ?? null) : null,
  }));
}

export function livingOf(state: State): string[] {
  return knownAlive(state);
}

function flipped(state: State, phase: string, step: number): boolean {
  return state.cfg.revealRoles && state.phase.id === phase && state.step >= step;
}

/** The winning side's banner: the narrator's own line ("The wolves win."). */
export function sideText(flavour: FlavourId, side: Side | null): string {
  const n = flavourOf(flavour).narrator;
  if (side === 'jester') return n.jesterWin;
  if (side === 'wolves') return n.wolvesWin;
  return side === 'village' ? n.villageWin : '';
}

function timeline(state: State): TimelineEntry[] {
  const out: TimelineEntry[] = [];
  for (const n of state.nights) {
    const died = n.victim !== null && !n.saved ? n.victim : null;
    out.push({
      kind: 'night',
      n: n.night,
      id: died,
      role: died ? (roleOf(state, died) ?? null) : null,
      saved: n.saved,
    });
    const d = state.days.find((x) => x.day === n.night);
    if (d)
      out.push({
        kind: 'day',
        n: d.day,
        id: d.out,
        role: d.out ? (roleOf(state, d.out) ?? null) : null,
        saved: false,
      });
  }
  return out;
}

function stageLines(state: State): string[] {
  const f = flavourOf(state.cfg.flavour);
  const phase = state.phase.id;
  if (phase === 'dawn' && state.step >= 1) {
    const deaths = tonightsDeaths(state);
    if (deaths.length === 0) return [f.narrator.survived];
    return deaths.map((d) =>
      fillIn(d.how === 'left' ? f.live.left : f.live.died, { name: nameOf(state, d.id) }),
    );
  }
  if (phase === 'verdict' && state.step >= 1 && state.verdict) {
    const out = state.verdict.out;
    const role = out && state.step >= 2 && state.cfg.revealRoles ? roleOf(state, out) : undefined;
    const lines = out ? [fillIn(f.live.was, { name: nameOf(state, out) })] : [f.narrator.noAgree];
    if (role) lines.push(f.roles[role].reveal);
    const left = state.dead.filter((d) => d.day === state.day && d.how === 'left' && d.told);
    return [...lines, ...left.map((d) => fillIn(f.live.left, { name: nameOf(state, d.id) }))];
  }
  if (phase === 'hunter' && state.step === 1 && state.shot)
    return [fillIn(f.live.shot, { name: nameOf(state, state.shot) })];
  if (phase === 'last-words' && state.verdict?.out)
    return [fillIn(f.live.lastWords, { name: nameOf(state, state.verdict.out) })];
  const text = spokenNow(state);
  return text ? [text] : [];
}

/** The say-this-now reading, only once the host has made it (the key never shows early). */
export function sayNow(state: State): StageView['say'] {
  const r = readingNow(state);
  if (!r) return null;
  const ms = state.speechMs[r.key];
  return ms !== undefined && ms >= 0 ? { key: r.key, url: `/api/speech/${r.key}.wav` } : null;
}

export function tallyOf(state: State): StageView['tally'] {
  const phase = state.phase.id;
  const shown = (phase === 'dawn' && state.step >= 1) || phase === 'day';
  if (!shown || !state.cfg.hunches) return [];
  const living = new Set(livingOf(state));
  return state.tally
    .filter((t) => living.has(t.id))
    .map((t) => ({ id: t.id, n: state.cfg.revealRoles ? t.n : null }));
}

export function stageOf(state: State): StageView {
  const phase = state.phase.id;
  const v = state.verdict;
  const news =
    phase === 'dawn' && state.step >= 1
      ? tonightsDeaths(state).map((d) => ({
          id: d.id,
          how: d.how,
          role: flipped(state, 'dawn', 2) ? (roleOf(state, d.id) ?? null) : null,
        }))
      : null;
  const counts = v
    ? [...new Set(v.ballots.map((b) => b.target))].map((id) => ({
        id,
        n: v.ballots.filter((b) => b.target === id).length,
      }))
    : [];
  return {
    lines: stageLines(state),
    say: sayNow(state),
    news,
    tally: tallyOf(state),
    verdict:
      phase === 'verdict' && v
        ? {
            ballots: v.ballots,
            counts,
            out: state.step >= 1 ? v.out : null,
            reason: state.step >= 1 ? v.reason : null,
            role: v.out && flipped(state, 'verdict', 2) ? (roleOf(state, v.out) ?? null) : null,
            runoff: v.runoff,
            leavers:
              state.step >= 1
                ? state.dead.filter((d) => d.day === state.day && d.how === 'left').map((d) => d.id)
                : [],
          }
        : null,
    hunter:
      phase === 'hunter' && state.hunterPending
        ? {
            id: state.hunterPending,
            // The shot is public only once it lands (step 1); while the line is made it is not.
            shot: state.step >= 1 ? state.shot : null,
            role:
              state.step >= 1 && state.shot && state.cfg.revealRoles
                ? (roleOf(state, state.shot) ?? null)
                : null,
          }
        : null,
    lastWords:
      phase === 'last-words' && v?.out
        ? { by: v.out, text: state.step >= 1 ? state.lastWords : null }
        : null,
    end: over(state)
      ? {
          winner: state.winner,
          reason: state.reason,
          headline: sideText(state.cfg.flavour, state.winner),
          roles: state.seats.flatMap((id) => {
            const role = roleOf(state, id);
            return role ? [{ id, role }] : [];
          }),
          timeline: timeline(state),
        }
      : null,
  };
}

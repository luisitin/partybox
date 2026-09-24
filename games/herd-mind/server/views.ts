// TV and phone views (SPEC §2.9). Answers stay private until `herd`; a player's own result reaches
// their phone only at `score`, after the TV has shown the verdict.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, SpeechRequest, TvView } from '@partybox/game-sdk';
import { fixedReading, herdReading, questionReading, readyMs } from './speech';
import type { Group, Mode, Outcome, State, Tile } from './types';

export type LineCue = 'question' | 'spoken' | 'herd' | 'tie' | 'baa' | 'sheep' | 'winner';
export interface Line {
  cue: LineCue;
  key: string;
  url: string;
  /** The clip's length: the stage times the next beat after it. */
  ms: number;
}
export interface GroupView {
  key: string;
  label: string;
  members: string[];
  /** Typed mode only: what each member actually typed. */
  raw: Record<string, string> | null;
  merged: string[];
}
export type ResultKind = 'herd' | 'sheep' | 'alone' | 'tie' | 'group' | 'none';
export interface MyResult {
  kind: ResultKind;
  label: string;
  count: number;
  delta: number;
}

interface Shared {
  mode: Mode;
  n: number;
  total: number;
  target: number;
  prompt: string;
  tiles: Tile[] | null;
  groups: GroupView[] | null;
  merges: [string, string][];
  outcome: Outcome | null;
  herd: string | null;
  lone: string | null;
  scored: string[];
  sheep: string | null;
  sheepFrom: string | null;
  winners: string[];
  lines: Line[];
  /** intro: who has tapped Ready, and when the 3 · 2 · 1 to question 1 ends (null: not yet). */
  ready: string[];
  startAt: number | null;
  /** Who has their settings open (the room holds while this is not empty). */
  holdBy: string[];
  /** The last menu closed: the 3 · 2 · 1 back into the game ends at this time. */
  resumeAt: number | null;
}
export type HerdTvView = TvView & Shared;
export type HerdControllerView = ControllerView &
  Shared & {
    mine: { tile: string | null; text: string | null } | null;
    result: MyResult | null;
    points: number;
    /** This phone's settings menu is open (the server's word, so a reload reopens it). */
    menuOpen: boolean;
  };

function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    if (state.left.includes(id)) return 'waiting';
    if (state.phase.id !== 'answer') return 'waiting';
    return Object.hasOwn(state.q.answers, id) ? 'submitted' : 'active';
  };
}

function line(cue: LineCue, req: SpeechRequest | null, state: State): Line[] {
  const ms = readyMs(state, req);
  if (!req || ms === null) return [];
  return [{ cue, key: req.key, url: `/api/speech/${req.key}.wav`, ms }];
}

/** A real win to cheer: somebody won with points (a 0–0 room just ends). */
export function celebrated(state: State): boolean {
  return state.winners.some((id) => (state.scores[id] ?? 0) > 0);
}

/** The readings the stage plays in this phase (only ones already made; the stage never waits). */
function lines(state: State): Line[] {
  const phase = state.phase.id;
  if (phase === 'answer') return line('question', questionReading(state, state.q.n), state);
  if (phase === 'herd') {
    const herd = state.q.groups?.find((g) => g.key === state.q.herd);
    const verdict =
      state.q.outcome === 'herd' && herd
        ? line('herd', herdReading(state, herd.label), state)
        : state.q.outcome === 'tie'
          ? line('tie', fixedReading(state, 'tie'), state)
          : state.q.outcome === 'scattered'
            ? line('baa', fixedReading(state, 'baa'), state)
            : [];
    return [...line('spoken', fixedReading(state, 'spoken'), state), ...verdict];
  }
  if (phase === 'score') {
    const moved = state.q.lone !== null && state.q.lone !== state.q.sheepFrom;
    return [
      ...(moved ? line('sheep', fixedReading(state, 'sheep'), state) : []),
      ...(celebrated(state) ? line('winner', fixedReading(state, 'winner'), state) : []),
    ];
  }
  return [];
}

function groupView(g: Group, typed: boolean): GroupView {
  return {
    key: g.key,
    label: g.label,
    members: g.members,
    raw: typed ? g.raw : null,
    merged: g.merged,
  };
}

function shared(state: State): Shared {
  const item = state.questions[state.q.n];
  const revealed = state.phase.id !== 'answer' && state.phase.id !== 'intro';
  const scoring = state.phase.id === 'score' || state.phase.id === 'done';
  const typed = state.cfg.mode === 'typed';
  return {
    mode: state.cfg.mode,
    n: state.q.n + 1,
    total: state.questions.length,
    target: state.cfg.target,
    prompt: state.phase.id === 'intro' ? '' : (item?.prompt ?? ''),
    tiles: state.phase.id === 'intro' ? null : state.q.tiles,
    groups: revealed && state.q.groups ? state.q.groups.map((g) => groupView(g, typed)) : null,
    merges: revealed && typed ? state.q.merges : [],
    outcome: revealed ? state.q.outcome : null,
    herd: revealed ? state.q.herd : null,
    lone: revealed ? state.q.lone : null,
    scored: scoring ? state.q.scored : [],
    sheep: state.sheep,
    sheepFrom: scoring ? state.q.sheepFrom : null,
    winners: state.winners,
    lines: lines(state),
    ready: state.phase.id === 'intro' ? state.ready : [],
    startAt: state.phase.id === 'intro' ? state.startAt : null,
    holdBy: state.menus,
    resumeAt: state.resumeAt,
  };
}

export function tvView(state: State, gameId: string): HerdTvView {
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: state.scores }),
    timerMode: state.phase.id === 'answer' ? 'normal' : 'hidden',
    ...shared(state),
  };
}

function resultFor(state: State, id: string): MyResult {
  const groups = state.q.groups ?? [];
  const mine = groups.find((g) => g.members.includes(id));
  if (!mine) return { kind: 'none', label: '', count: 0, delta: 0 };
  const count = mine.members.length;
  const base = { label: mine.label, count, delta: 0 };
  if (mine.key === state.q.herd) return { ...base, kind: 'herd', delta: 1 };
  if (count === 1) return { ...base, kind: state.q.lone === id ? 'sheep' : 'alone' };
  const top = Math.max(...groups.map((g) => g.members.length));
  return { ...base, kind: state.q.outcome === 'tie' && count === top ? 'tie' : 'group' };
}

export function controllerView(state: State, playerId: string, gameId: string): HerdControllerView {
  const own = Object.hasOwn(state.q.answers, playerId) ? state.q.answers[playerId] : undefined;
  const scoring = state.phase.id === 'score' || state.phase.id === 'done';
  return {
    ...controllerEnvelope(state, gameId, playerId, {
      statusOf: statusOf(state),
      scores: state.scores,
    }),
    timerMode: state.phase.id === 'answer' ? 'normal' : 'hidden',
    ...shared(state),
    mine: own ? { tile: own.tile ?? null, text: own.text ?? null } : null,
    result: scoring && state.phase.id === 'score' ? resultFor(state, playerId) : null,
    points: Object.hasOwn(state.scores, playerId) ? (state.scores[playerId] ?? 0) : 0,
    menuOpen: state.menus.includes(playerId),
  };
}

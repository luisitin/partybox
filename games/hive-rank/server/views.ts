// What the TV and each phone see. Orders are secret until `hive` (only their owner's phone has
// one); the hive's order exists only from `hive` on and goes out spot by spot. Bots also get the
// writer's `expected` order as a hint — a bot's view is never on a person's screen.
import { controllerEnvelope, envelope, hasPlayer } from '@partybox/game-sdk';
import type { ControllerView, SpeechRequest, TvView } from '@partybox/game-sdk';
import { question } from './round';
import { lineRequest, msOf, sayRequest, spotRequest, spotText } from './speech';
import type { LineId } from './speech';
import type { State } from './types';

export interface ItemView {
  id: string;
  label: string;
}

export interface QuestionView {
  prompt: string;
  top: string;
  bottom: string;
  items: ItemView[];
}

/** A spot of the hive's ladder, once it has landed. */
export interface SpotView {
  place: number;
  id: string;
  label: string;
  /** The average spot the room gave this thing (1.0–5.0). */
  avg: number;
  /** Players who put it exactly here. */
  faces: string[];
  unanimous: boolean;
}

export interface RowView {
  id: string;
  pts: number;
  perfect: boolean;
}

export interface ScoreView {
  rows: RowView[];
  queens: string[];
  perfect: boolean;
}

export interface Reading {
  key: string;
  url: string;
}

interface Common {
  round: number;
  rounds: number;
  question: QuestionView | null;
  step: number;
  short: boolean;
  spots: SpotView[];
  score: ScoreView | null;
  /** The reading to play now (null: none), and the spoken words as text. */
  speech: Reading | null;
  line: string | null;
  /** What the game's own Next button does in `intro` / `score`. */
  next: 'start' | 'round' | 'results' | null;
}

export interface HiveTvView extends TvView, Common {
  locked: number;
  expecting: number;
}

export interface MarkRow {
  id: string;
  label: string;
  /** 1–5: where I put it, where the hive did. */
  mine: number;
  hive: number;
  mark: 'exact' | 'near' | 'miss';
}

export interface MyResult {
  rows: MarkRow[];
  pts: number;
  queen: boolean;
  perfect: boolean;
}

export interface HiveControllerView extends ControllerView, Common {
  mine: string[] | null;
  locked: boolean;
  hint: string[] | null;
  result: MyResult | null;
}

const PHASE_LABEL: Record<string, string> = { rank: 'Close ranking', hive: 'Next spot' };

function reading(state: State): { speech: Reading | null; line: string | null } {
  const q = state.q;
  const phase = state.phase.id;
  const ready = (req: SpeechRequest | null): Reading | null => {
    const ms = msOf(state, req);
    return req && ms !== undefined && ms >= 0
      ? { key: req.key, url: `/api/speech/${req.key}.wav` }
      : null;
  };
  const line = (id: LineId, text: string): { speech: Reading | null; line: string } => ({
    speech: ready(lineRequest(state, id)),
    line: text,
  });
  if (phase === 'rank')
    return {
      speech: q.sayOk ? ready(sayRequest(state, q.n)) : ready(lineRequest(state, 'rankThem')),
      line: null,
    };
  if (phase === 'hive') {
    if (q.short) return line('short', 'Not enough bees!');
    if (q.step === 0) return line('decided', 'The hive has decided…');
    const text = spotText(state, q.step);
    return {
      speech: q.voiced.includes(q.step) ? ready(spotRequest(state, q.step)) : null,
      line: text,
    };
  }
  if (phase === 'score' && q.hive) {
    if (Object.values(q.delta).some((d) => d.perfect)) return line('perfect', 'Perfect hive!');
    if (q.queens.length > 0) return line('queen', 'Queen bee!');
  }
  return { speech: null, line: null };
}

function spots(state: State): SpotView[] {
  const q = state.q;
  const item = question(state);
  if (state.phase.id !== 'hive' && state.phase.id !== 'score') return [];
  if (!q.hive || !item) return [];
  const orders = Object.entries(q.orders);
  const shown = state.phase.id === 'score' ? 5 : q.step;
  const out: SpotView[] = [];
  for (let s = 1; s <= shown; s++) {
    const place = 6 - s;
    const id = q.hive[place - 1] ?? '';
    const exact = orders.filter(([, o]) => o[place - 1] === id).map(([pid]) => pid);
    out.push({
      place,
      id,
      label: item.items.find((i) => i.id === id)?.label ?? '',
      avg: Math.round(((q.totals[id] ?? 0) / Math.max(1, orders.length)) * 10) / 10,
      // The faces belong to the ladder filling (`hive`); `score` has its own rows (4 KB views).
      faces: state.phase.id === 'hive' ? exact.sort() : [],
      unanimous: orders.length >= 2 && exact.length === orders.length,
    });
  }
  return out;
}

function scoreView(state: State): ScoreView | null {
  const q = state.q;
  if (state.phase.id !== 'score' || !q.hive) return null;
  const rows = Object.entries(q.delta)
    .map(([id, d]) => ({ id, pts: d.pts, perfect: d.perfect }))
    .sort((a, b) => b.pts - a.pts || (a.id < b.id ? -1 : 1));
  return { rows, queens: q.queens, perfect: rows.some((r) => r.perfect) };
}

function common(state: State): Common {
  const item = question(state);
  const phase = state.phase.id;
  const last = state.q.n >= state.settings.rounds;
  return {
    round: state.q.n,
    rounds: state.settings.rounds,
    question: item
      ? {
          prompt: item.prompt,
          top: item.top,
          bottom: item.bottom,
          items: item.items.map((i) => ({ id: i.id, label: i.label })),
        }
      : null,
    step: state.q.step,
    short: state.q.short,
    spots: spots(state),
    score: scoreView(state),
    ...reading(state),
    next: phase === 'intro' ? 'start' : phase === 'score' ? (last ? 'results' : 'round') : null,
  };
}

function statusOf(state: State): (id: string) => 'active' | 'submitted' | 'waiting' {
  return (id) =>
    state.phase.id !== 'rank'
      ? 'waiting'
      : Object.hasOwn(state.q.orders, id)
        ? 'submitted'
        : 'active';
}

function extras(state: State): Partial<TvView> {
  const phase = state.phase.id;
  const item = question(state);
  return {
    timerMode: phase === 'rank' ? 'normal' : phase === 'hive' ? 'hidden' : 'quiet',
    ...(phase === 'intro' || phase === 'score' ? { vipSkipHidden: true } : {}),
    ...(PHASE_LABEL[phase] && !(phase === 'hive' && state.q.short)
      ? { vipSkipLabel: PHASE_LABEL[phase] }
      : {}),
    ...(item && phase !== 'done' ? { spectator: { line: item.prompt } } : {}),
  };
}

export function tvView(state: State, gameId: string): HiveTvView {
  const players = Object.values(state.players);
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: state.scores }),
    ...extras(state),
    ...common(state),
    locked: Object.keys(state.q.orders).length,
    expecting: players.filter((p) => p.connected).length,
  };
}

function myResult(state: State, playerId: string): MyResult | null {
  const q = state.q;
  const order = q.orders[playerId];
  const item = question(state);
  if (state.phase.id !== 'score' || !q.hive || !order || !item) return null;
  const hive = q.hive;
  const rows = order.map((id, i): MarkRow => {
    const at = hive.indexOf(id);
    const mark = at === i ? 'exact' : Math.abs(at - i) === 1 ? 'near' : 'miss';
    return {
      id,
      label: item.items.find((x) => x.id === id)?.label ?? '',
      mine: i + 1,
      hive: at + 1,
      mark,
    };
  });
  const d = q.delta[playerId];
  return {
    rows,
    pts: d?.pts ?? 0,
    queen: q.queens.includes(playerId),
    perfect: d?.perfect ?? false,
  };
}

export function controllerView(state: State, gameId: string, playerId: string): HiveControllerView {
  const playing = hasPlayer(state, playerId);
  const mine = playing ? (state.q.orders[playerId] ?? null) : null;
  const bot = playing && state.players[playerId]?.bot === true;
  const item = question(state);
  return {
    ...controllerEnvelope(state, gameId, playerId, {
      statusOf: statusOf(state),
      scores: state.scores,
    }),
    ...extras(state),
    ...common(state),
    mine: mine ? [...mine] : null,
    locked: mine !== null,
    hint: bot && item && state.phase.id === 'rank' ? [...item.expected] : null,
    result: myResult(state, playerId),
  };
}

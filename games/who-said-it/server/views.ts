// tvView / controllerView (SPEC §4.9). Secrets: an answer's author reaches a view only at that
// card's flip; upcoming cards never; guesses at the reveal. A phone's view during a card is the same
// for the author and for everyone else (§4.5 camouflage): no "this one is yours" field exists.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, TvView } from '@partybox/game-sdk';
import { guessDone } from './phases/guess';
import { writeDone } from './phases/write';
import { answeredIds, isLastPrompt } from './round';
import { standings } from './scoring';
import { cardOf, revealOf, sayNow, statusOf, vipSkipLabel } from './view-common';
import type { RevealView, SayItem } from './view-common';
import type { State } from './types';

export type { RevealView, SayItem } from './view-common';

export interface BoardRow {
  playerId: string;
  score: number;
  rank: number;
  delta: number;
}

interface Shared {
  /** When this phase instance began (server time): the client's beats count from here. */
  startedAt: number;
  /** 1-based prompt number, and how many this game plays. */
  n: number;
  total: number;
  /** The prompt, from its own phase on. */
  prompt: string | null;
  card: { text: string; number: number; count: number } | null;
  /** guess + reveal: every candidate of this prompt, in seat order (the TV's face row). */
  seated: string[];
  reveal: RevealView | null;
  /** scores + done: the board with this prompt's deltas. */
  board: BoardRow[];
  /** scores: no card was made this prompt ("Nobody answered!"). */
  empty: boolean;
  last: boolean;
  say: SayItem[];
}

export interface WsTvView extends TvView, Shared {
  answered: number;
  /** Answers that can still arrive: connected seated players. */
  expected: number;
}

export interface WsPhoneView extends ControllerView, Shared {
  /** write: my answer as the server holds it; null until one is accepted. */
  myAnswer: string | null;
  /** write: my two idea chips once I tapped 💡 (a bot: always). */
  ideas: string[];
  canIdea: boolean;
  /** guess: everyone seated except me, in seat order; my current tap. */
  candidates: string[];
  myGuess: string | null;
  /** reveal, from the flip: my own line — right, wrong, mine, or no tap. */
  result: {
    kind: 'right' | 'wrong' | 'mine' | 'idle';
    picked: string | null;
    authors: string[];
    points: number;
    fooled: number;
  } | null;
  standing: { score: number; rank: number; delta: number };
}

function shared(state: State): Shared {
  const phase = state.phase.id;
  const onBoard = phase === 'scores' || phase === 'done';
  return {
    startedAt: state.phase.startedAt,
    n: state.p.n + 1,
    total: state.cfg.prompts,
    prompt: phase === 'intro' ? null : (state.prompts[state.p.n]?.prompt ?? null),
    card: cardOf(state),
    seated: phase === 'guess' || phase === 'reveal' ? state.p.seated : [],
    reveal: revealOf(state),
    board: onBoard ? standings(state) : [],
    empty: phase === 'scores' && state.p.cards.length === 0,
    last: isLastPrompt(state),
    say: sayNow(state),
  };
}

/** Once everyone is done the phase only waits out its short grace: no clock at all then, so the
 *  room never sees a "1" and "Last chance!" at the very moment it finished (record-review p01). */
function timerModeOf(state: State): 'normal' | 'quiet' | 'hidden' {
  const id = state.phase.id;
  if ((id === 'write' && writeDone(state)) || (id === 'guess' && guessDone(state))) return 'hidden';
  return id === 'write' ? 'normal' : 'quiet';
}

function base(state: State): { timerMode: 'normal' | 'quiet' | 'hidden'; vipSkipLabel: string } {
  return {
    timerMode: timerModeOf(state),
    vipSkipLabel: vipSkipLabel(state, isLastPrompt(state)),
  };
}

export function tvView(state: State, gameId: string): WsTvView {
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: state.scores }),
    ...base(state),
    ...shared(state),
    answered: answeredIds(state).length,
    expected: state.p.seated.filter((id) => state.players[id]?.connected).length,
  };
}

function resultOf(state: State, me: string): WsPhoneView['result'] {
  const r = revealOf(state);
  if (!r || r.step !== 'shown' || !state.p.seated.includes(me)) return null;
  const picked = state.p.guesses[me] ?? null;
  const mine = r.authors.includes(me);
  const kind = mine ? 'mine' : picked === null ? 'idle' : r.right.includes(me) ? 'right' : 'wrong';
  const fooled = mine ? Object.keys(r.guesses).filter((g) => !r.authors.includes(g) && !r.authors.includes(r.guesses[g] as string)).length : 0; // prettier-ignore
  return { kind, picked, authors: r.authors, points: r.points[me] ?? 0, fooled };
}

export function controllerView(state: State, gameId: string, me: string): WsPhoneView {
  const phase = state.phase.id;
  const seated = state.p.seated.includes(me);
  const bot = state.players[me]?.bot === true;
  const writing = phase === 'write' && seated;
  const row = standings(state).find((r) => r.playerId === me);
  return {
    ...controllerEnvelope(state, gameId, me, { statusOf: statusOf(state), scores: state.scores }),
    ...base(state),
    ...shared(state),
    myAnswer: writing ? (state.p.answers[me] ?? null) : null,
    ideas: writing && (bot || state.p.ideaUsed.includes(me)) ? (state.p.ideas[me] ?? []) : [],
    canIdea: writing && state.cfg.ideas && !state.p.ideaUsed.includes(me),
    candidates: phase === 'guess' && seated ? state.p.seated.filter((id) => id !== me) : [],
    myGuess: phase === 'guess' ? (state.p.guesses[me] ?? null) : null,
    result: resultOf(state, me),
    standing: { score: row?.score ?? 0, rank: row?.rank ?? 0, delta: row?.delta ?? 0 },
  };
}

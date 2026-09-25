// Echo's views (§7.10, hidden information §7.5). The word reaches clue-givers' phones only until
// `result`; clues reach clue-givers at `check`, everyone's survivors at `guess`, authors at
// `result`. Spectators get the TV's view. "Don't know it" never reaches the guesser.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { piles, ratingOf } from './deck';
import type { RatingId } from './deck';
import { canSwap } from './phases/clue';
import { autoGroups, clueRefs, textOf } from './echoes';
import { DONT_KNOW_WINDOW_MS } from './types';
import type { ClueReject, Outcome, State } from './types';
import { sayNow } from './speech';
import type { Say } from './speech';
import { isGiver } from './roles';

const GAME_ID = 'echo';

export interface ResultClue {
  text: string;
  by: string;
  echo: boolean;
}

export interface EchoResult {
  word: string;
  guess: string;
  outcome: Outcome;
  byVip: boolean;
  clues: ResultClue[];
  /** The wrong guess burned the next word / cost a won word. */
  burned: boolean;
  unwon: boolean;
}

export interface EchoTvFields {
  /** When this phase began (server clock): the stage times its beats from here. */
  phaseAt: number;
  wordNo: number;
  deckSize: number;
  counts: { left: number; won: number; lost: number };
  guesser: string | null;
  givers: string[];
  /** Who is in: clue written (`clue`) or Looks good (`check`). */
  ready: string[];
  /** Clue-givers with a clue on the table (`clue` and `check`). */
  wrote: string[];
  twoClues: boolean;
  swapped: boolean;
  /** `guess` on: the surviving clues (sorted, so seat order never hints at authors). */
  survivors: string[];
  echoCount: number;
  clueCount: number;
  /** The guesser has answered; it lands when the TV has shown every clue. */
  guessIn: boolean;
  result: EchoResult | null;
  final: { won: string[]; lost: number; rating: RatingId } | null;
  say: Say[];
}

export type EchoTvView = TvView & EchoTvFields;

export interface CheckRow {
  id: string;
  texts: string[];
  echo: boolean;
}

export interface EchoControllerView extends ControllerView {
  role: 'guesser' | 'giver' | 'watcher';
  /** The stage's fields (no second copy of the envelope). */
  tv: EchoTvFields;
  /** Clue-givers only, until `result` (then everyone has it on `tv.result`). */
  secret: { id: string; answer: string; accept: string[]; family: string[] } | null;
  myClues: string[];
  reject: ClueReject | null;
  /** `closesAt`: the phone hides the button after this server time (§7.6's 15 s window). */
  dontKnow: { open: boolean; closesAt: number; mine: boolean } | null;
  check: { rows: CheckRow[]; ok: boolean } | null;
  /** The VIP may count this wrong guess (the phone shows it on the VIP's phone only). */
  canCount: boolean;
  /** For the guesser bot's ranking: which packs are in play. */
  spicy: boolean;
}

const byText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

function statusOf(state: State): (id: string) => PlayerStatus {
  const phase = state.phase.id;
  return (id) => {
    if (!isGiver(state, id))
      return id === state.w.guesser && phase === 'guess' ? 'active' : 'waiting';
    if (phase === 'clue') return Object.hasOwn(state.w.clues, id) ? 'submitted' : 'active';
    if (phase === 'check') return state.w.checkOk.includes(id) ? 'submitted' : 'active';
    return 'waiting';
  };
}

function groupsNow(state: State) {
  return state.w.groups ?? autoGroups(state);
}

function tvFields(state: State): EchoTvFields {
  const phase = state.phase.id;
  const p = piles(state);
  const shown = phase === 'guess' || phase === 'result';
  const groups = shown ? groupsNow(state) : [];
  const survivors = groups
    .filter((g) => !g.echo)
    .flatMap((g) => g.refs.map((r) => textOf(state, r)))
    .sort(byText);
  const echoCount = groups.filter((g) => g.echo).reduce((n, g) => n + g.refs.length, 0);
  const g = state.w.guess;
  const last = state.turns[state.turns.length - 1];
  const result: EchoResult | null =
    phase === 'result' && g
      ? {
          word: state.w.word.answer,
          guess: g.text,
          outcome: g.result,
          byVip: g.byVip,
          clues: groupsNow(state)
            .flatMap((grp) =>
              grp.refs.map((r) => ({ text: textOf(state, r), by: r.by, echo: grp.echo })),
            )
            .sort((a, b) => Number(a.echo) - Number(b.echo) || byText(a.text, b.text)),
          burned: last?.burned != null,
          unwon: last?.unwon != null,
        }
      : null;
  const ready =
    phase === 'clue' ? Object.keys(state.w.clues) : phase === 'check' ? [...state.w.checkOk] : [];
  const deckEmpty = p.left === 0 && phase !== 'intro';
  return {
    phaseAt: state.phase.startedAt,
    wordNo: Math.min(state.w.idx + 1, state.deck.length),
    deckSize: state.deck.length,
    counts: { left: p.left, won: p.won.length, lost: p.lost.length },
    guesser: phase === 'intro' || phase === 'done' ? null : state.w.guesser,
    givers: state.seats.filter((id) => isGiver(state, id)),
    ready: ready.filter((id) => state.seats.includes(id)).sort(byText),
    wrote:
      phase === 'clue' || phase === 'check'
        ? Object.keys(state.w.clues)
            .filter((id) => state.seats.includes(id))
            .sort(byText)
        : [],
    twoClues: state.twoClues,
    swapped: phase === 'clue' && state.w.swaps > 0,
    survivors,
    echoCount,
    clueCount: shown ? clueRefs(state).length : 0,
    guessIn: phase === 'guess' && state.w.early !== null,
    result,
    final:
      phase === 'done' || (phase === 'result' && deckEmpty)
        ? {
            won: p.won.map((id) => state.deck.find((w) => w.id === id)?.answer ?? id),
            lost: p.lost.length,
            rating: ratingOf(p.won.length, state.deck.length),
          }
        : null,
    say: sayNow(state),
  };
}

function skipLabel(state: State): string | undefined {
  switch (state.phase.id) {
    case 'clue':
      return 'Close the clues';
    case 'check':
      return 'Looks good for everyone';
    case 'guess':
      return 'Count it as a pass';
    case 'result':
      return piles(state).left === 0 ? 'See results' : 'Next word';
    default:
      return undefined;
  }
}

function timerModeOf(state: State): TvView['timerMode'] {
  const phase = state.phase.id;
  // Paced stage moments get the draining bar: a rhythm (and "the next word is coming"), not a
  // countdown.
  if (phase === 'check' || phase === 'intro' || phase === 'result') return 'quiet';
  return 'normal';
}

export function tvView(state: State): EchoTvView {
  const label = skipLabel(state);
  return {
    ...envelope(state, GAME_ID, { statusOf: statusOf(state) }),
    timerMode: timerModeOf(state),
    ...(label ? { vipSkipLabel: label } : {}),
    ...tvFields(state),
  };
}

export function controllerView(state: State, playerId: string): EchoControllerView {
  const phase = state.phase.id;
  const tv = tvFields(state);
  const label = skipLabel(state);
  const seated = state.seats.includes(playerId) && !state.left.includes(playerId);
  const giver = seated && isGiver(state, playerId);
  const role =
    !seated || phase === 'intro' || phase === 'done' ? 'watcher' : giver ? 'giver' : 'guesser';
  const knows = role === 'giver' && (phase === 'clue' || phase === 'check' || phase === 'guess');
  const word = state.w.word;
  const inClue = phase === 'clue' && role === 'giver';
  const check =
    phase === 'check' && role === 'giver'
      ? {
          rows: groupsNow(state)
            .map((g) => ({
              id: g.id,
              texts: g.refs.map((r) => textOf(state, r)).sort(byText),
              echo: g.echo,
            }))
            .sort((a, b) => byText(a.texts[0] ?? '', b.texts[0] ?? '')),
          ok: state.w.checkOk.includes(playerId),
        }
      : null;
  return {
    ...controllerEnvelope(state, GAME_ID, playerId, { statusOf: statusOf(state) }),
    timerMode: timerModeOf(state),
    ...(label ? { vipSkipLabel: label } : {}),
    role,
    tv,
    secret: knows
      ? { id: word.id, answer: word.answer, accept: [...word.accept], family: [...word.family] }
      : null,
    myClues: role === 'giver' && phase !== 'result' ? (state.w.clues[playerId] ?? []) : [],
    reject: inClue ? (state.w.rejects[playerId] ?? null) : null,
    dontKnow: inClue
      ? {
          open: canSwap(state),
          closesAt: state.phase.startedAt + DONT_KNOW_WINDOW_MS,
          mine: state.w.dontKnow.includes(playerId),
        }
      : null,
    check,
    canCount: phase === 'result' && state.w.guess?.result === 'wrong' && !state.w.guess.byVip,
    spicy: role === 'guesser' ? state.cfg.spicy : false,
  };
}

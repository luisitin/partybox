// Views (SPEC §9.14). The TV sees a card's identity from stage 1 (the moment it turns), phones only
// from stage 2; the key goes to spymasters' phones and nowhere else. Nothing a guesser's, the other
// team's or the TV's view holds before a flip depends on what the card is (§9.12).
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { wordEntry } from './content';
import { roleOf, teamOf } from './teams';
import { clueRequest, firstLine, flipLine, lineRequest, turnLine, winLine } from './speech';
import type { Role } from './teams';
import type { SpeechRequest } from '@partybox/game-sdk';
import type { Kind, Mode, Pointer, Reason, State, Team, Turn } from './types';

export interface Voice {
  key: string;
  url: string;
}

interface Shared {
  mode: Mode;
  round: number;
  rounds: number;
  roundWins: Record<Team, number>;
  teams: Record<Team, string[]>;
  spymaster: Record<Team, string | null>;
  bots: string[];
  volunteers: string[];
  starter: Team;
  turnTeam: Team;
  turnN: number;
  maxTurns: number;
  words: string[];
  /** Identity per card where this screen may know it, else null. */
  kinds: (Kind | null)[];
  /** The card being turned right now and whether this screen may know what it is. */
  flipping: { card: number; shown: boolean } | null;
  left: Record<Team, number>;
  clue: { word: string; number: number } | null;
  guessesLeft: number;
  canEnd: boolean;
  pointers: Record<string, Pointer>;
  reactions: { id: string; card: number; emoji: string; until: number }[];
  history: { team: Team; word: string; number: number; found: number }[];
  ended: Turn['ended'];
  newSpymaster: string | null;
  winner: Team | 'draw' | null;
  reason: Reason | null;
  cluesLeft: number | null;
  voice: Voice | null;
  /** At `win`: the cards the round's end turns over (the rest were flipped in play) — the ripple. */
  ripple: number[];
}

export interface SpyTvView extends TvView, Shared {}

export interface SpyControllerView extends ControllerView, Shared {
  role: Role;
  team: Team | null;
  myPointer: Pointer | null;
  /** Spymasters only: the whole key. */
  key: Kind[] | null;
  /** The active spymaster during `clue`: extra roots of face-down words (the phone's live check). */
  roots: Record<string, string[]> | null;
  clueError: Turn['clueError'];
}

const voiceOf = (r: SpeechRequest | null, state: State): Voice | null =>
  r && (state.speechMs[r.key] ?? -1) >= 0 ? { key: r.key, url: `/api/speech/${r.key}.wav` } : null;

/** The line that belongs to this moment (only once it plays; never earlier). */
function voiceNow(state: State, tv: boolean): Voice | null {
  const t = state.turn;
  switch (state.phase.id) {
    case 'clue':
      return t.n === 1 ? voiceOf(lineRequest(state, firstLine(state.starter)), state) : null;
    case 'guess':
      return t.made === 0 ? voiceOf(clueRequest(state), state) : null;
    case 'flip': {
      const card = t.flip?.card ?? -1;
      return tv || state.flipped[card] === 2 ? voiceOf(flipLine(state), state) : null;
    }
    case 'turn-end': {
      if (t.ended === 'noClue' || t.ended === 'outOfGuesses')
        return voiceOf(lineRequest(state, t.ended), state);
      if (state.mode === 'coop') return null;
      return voiceOf(lineRequest(state, turnLine(t.team === 'sun' ? 'moon' : 'sun')), state);
    }
    case 'win':
      return voiceOf(lineRequest(state, winLine(state)), state);
    default:
      return null;
  }
}

function shared(state: State, tv: boolean): Shared {
  const t = state.turn;
  const knows = (i: number): boolean =>
    tv ? (state.flipped[i] ?? 0) >= 1 : state.flipped[i] === 2;
  const kinds = state.key.map((k, i) => (knows(i) ? k : null));
  const left = { sun: 0, moon: 0 };
  state.key.forEach((k, i) => {
    if ((k === 'sun' || k === 'moon') && !knows(i)) left[k] += 1;
  });
  const flipCard = state.phase.id === 'flip' && t.flip ? t.flip.card : null;
  const history = state.history
    .filter((h) => h.round === state.round)
    .slice(-12)
    .map((h) => ({
      team: h.team,
      word: h.word,
      number: h.number,
      found: h.flips.filter((f) => f.kind === h.team && knows(f.card)).length,
    }));
  return {
    mode: state.mode,
    round: state.round,
    rounds: state.settings.rounds,
    roundWins: state.roundWins,
    teams: state.teams,
    spymaster: state.spymaster,
    bots: Object.values(state.players)
      .filter((p) => p.bot === true)
      .map((p) => p.id),
    volunteers: state.volunteers,
    starter: state.starter,
    turnTeam: t.team,
    turnN: t.n,
    maxTurns: state.settings.maxTurns,
    words: state.board.map((c) => c.word),
    kinds,
    flipping: flipCard === null ? null : { card: flipCard, shown: knows(flipCard) },
    left,
    clue: t.clue,
    guessesLeft: Math.max(0, t.left),
    canEnd: t.made > 0,
    pointers: state.phase.id === 'guess' ? t.pointers : {},
    reactions: Object.entries(t.reactions).map(([id, r]) => ({ id, ...r })),
    history,
    ended: state.phase.id === 'turn-end' ? t.ended : null,
    newSpymaster: t.newSpymaster,
    winner: state.phase.id === 'win' || state.phase.id === 'done' ? state.winner : null,
    reason: state.phase.id === 'win' || state.phase.id === 'done' ? state.reason : null,
    cluesLeft: state.coop ? state.coop.cluesLeft : null,
    voice: voiceNow(state, tv),
    ripple: state.phase.id === 'win' ? rippleCards(state) : [],
  };
}

function rippleCards(state: State): number[] {
  const played = new Set(
    state.history.filter((h) => h.round === state.round).flatMap((h) => h.flips.map((f) => f.card)),
  );
  return state.board.map((_, i) => i).filter((i) => !played.has(i));
}

function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    const phase = state.phase.id;
    if (phase === 'teams') return state.volunteers.includes(id) ? 'submitted' : 'active';
    const role = roleOf(state, id);
    if (phase === 'clue')
      return role === 'spymaster' && teamOf(state, id) === state.turn.team ? 'active' : 'waiting';
    if (phase === 'guess' && role === 'guesser')
      return Object.hasOwn(state.turn.pointers, id) ? 'submitted' : 'active';
    return 'waiting';
  };
}

const TIMER: Record<string, 'normal' | 'quiet' | 'hidden'> = {
  teams: 'normal',
  // The board phases keep one shell height (a normal timer's digits row would push the whole
  // board down as guessing opens and back up at the next clue); the guess clock's digits live in
  // the clue bar instead (client/TvParts.tsx).
  clue: 'quiet',
  guess: 'quiet',
  flip: 'quiet',
  'turn-end': 'quiet',
  win: 'quiet',
  done: 'hidden',
};

function skipLabel(state: State): string | undefined {
  switch (state.phase.id) {
    case 'teams':
      return 'Start';
    case 'clue':
      return 'Skip the clue';
    case 'guess':
      return 'End the turn';
    case 'win':
      return state.round < state.settings.rounds ? 'Next round' : 'See results';
    default:
      return undefined;
  }
}

function base(state: State): { timerMode: 'normal' | 'quiet' | 'hidden'; vipSkipLabel?: string } {
  const label = skipLabel(state);
  const timerMode = TIMER[state.phase.id] ?? 'normal';
  return label ? { timerMode, vipSkipLabel: label } : { timerMode };
}

export function tvView(state: State, gameId: string): SpyTvView {
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state) }),
    ...base(state),
    ...shared(state, true),
  };
}

function roots(state: State): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  state.board.forEach((card, i) => {
    const extra = wordEntry(card.itemId).family.filter((r) => r !== card.itemId);
    if (state.flipped[i] === 0 && extra.length > 0) out[String(i)] = extra;
  });
  return out;
}

export function controllerView(state: State, gameId: string, playerId: string): SpyControllerView {
  const role = roleOf(state, playerId);
  // Spectators get exactly what the TV shows (§9.14).
  const tv = role === 'spectator';
  const spy = role === 'spymaster';
  const activeSpy = spy && state.turn.spymaster === playerId && state.phase.id === 'clue';
  return {
    ...controllerEnvelope(state, gameId, playerId, { statusOf: statusOf(state) }),
    ...base(state),
    ...shared(state, tv),
    role,
    team: teamOf(state, playerId),
    myPointer: state.phase.id === 'guess' ? (state.turn.pointers[playerId] ?? null) : null,
    key: spy ? state.key : null,
    roots: activeSpy ? roots(state) : null,
    clueError: activeSpy ? state.turn.clueError : null,
  };
}

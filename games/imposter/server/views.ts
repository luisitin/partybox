// Views (SPEC §1.8). The stage part is public and the same for the TV and every phone (PhoneStage
// renders it for remote and phone-only players). Secrets travel only in `controllerView`, for the
// phone allowed to see them, and each reveal enters the views on its own server beat, so a phone
// never shows what the TV has not shown yet.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { activeSeats, boardClues, isImposter, wordOf } from './round';
import { sayOf } from './speech';
import { counts } from './tally';
import { guessers } from './phases/lastChance';
import { countable } from './phases/wordReveal';
import { ballot, eligibleVoters } from './votes';
import type { Guess, RejectReason, State, Why } from './types';

export interface BoardCard {
  by: string;
  /** This clue round's clue once its card is dealt; '' = dealt with no clue ("—"); null = not yet. */
  now: string | null;
  /** Earlier clue rounds' clues, oldest first. */
  before: string[];
  /** 1-based deal order of this clue round's card (0 = not dealt). */
  dealt: number;
}

export interface ImposterStage {
  round: number;
  rounds: number;
  clueRound: number;
  clueRounds: number;
  /** The category label when the imposter is hinted (else null). */
  category: string | null;
  imposterCount: number;
  board: BoardCard[];
  tally: {
    votes: Record<string, string[]>;
    counts: Record<string, number>;
    runoff: boolean;
  } | null;
  runoff: { candidates: string[]; slots: number } | null;
  accuse: {
    accused: string[];
    spot: number;
    flipped: boolean;
    roles: Record<string, 'imposter' | 'crew'>;
  } | null;
  last: { guessers: string[]; options: string[] | null; typed: boolean; guessed: string[] } | null;
  reveal: {
    word: string;
    category: string;
    imposters: string[];
    guesses: Record<string, Guess>;
    step: number;
    void: boolean;
    countable: boolean;
  } | null;
  /** Reason chips per player who scored this round (points: read 1, caught 2, escaped 4, stole 3). */
  delta: Record<string, Why[]> | null;
  say: { key: string; url: string; text: string } | null;
}

export interface ImposterTvView extends TvView {
  stage: ImposterStage;
}

export interface ImposterControllerView extends ControllerView {
  stage: ImposterStage;
  /** False for a spectator (a late joiner): stage only, no role. */
  seated: boolean;
  role: 'crew' | 'imposter' | null;
  /** Crew only: the word with its forms, so the phone can check a clue as it is typed. */
  word: { answer: string; accept: string[]; reject: string[]; family: string[] } | null;
  catId: string | null;
  catLabel: string | null;
  mine: {
    ready: boolean;
    clue: string | null;
    vote: string[] | null;
    reject: { why: RejectReason; n: number } | null;
    guess: string | null;
    said: string[];
  };
  ballot: { candidates: string[]; picks: number } | null;
  guessing: boolean;
  /** Own points this round — only once the TV has shown the result. */
  result: { pts: number; why: Why[] } | null;
}

const REVEALS = new Set(['clueReveal', 'voteReveal', 'accuse', 'wordReveal']);
const NO_SCORES = new Set([
  'clueReveal',
  'talk',
  'vote',
  'voteReveal',
  'runoff',
  'accuse',
  'lastChance',
  'wordReveal',
]);

function board(state: State): BoardCard[] {
  const r = state.round;
  const shown = new Set(boardClues(state).map((c) => `${c.by}|${c.r}`));
  const p = state.phase.id;
  return activeSeats(state).map((by) => {
    const mine = r.clues.filter((c) => c.by === by && shown.has(`${by}|${c.r}`));
    const at = r.revealOrder.indexOf(by) + 1;
    // deal/clue: this clue round's cards are face down; clueReveal: dealt up to `revealed`;
    // afterwards every card of the last clue round is on the table.
    let dealt = 0;
    if (p === 'clueReveal') dealt = at > 0 && at <= r.revealed ? at : 0;
    else if (p !== 'deal' && p !== 'clue') dealt = at;
    const now = mine.find((c) => c.r === r.clueRound)?.text ?? (dealt > 0 ? '' : null);
    return { by, now, before: mine.filter((c) => c.r < r.clueRound).map((c) => c.text), dealt };
  });
}

function chips(state: State): Record<string, Why[]> {
  const out: Record<string, Why[]> = {};
  for (const [id, d] of Object.entries(state.round.delta)) if (d.why.length > 0) out[id] = d.why;
  return out;
}

export function stageOf(state: State): ImposterStage {
  const r = state.round;
  const p = state.phase.id;
  const word = wordOf(state);
  const tally =
    p === 'voteReveal'
      ? r.showing === 'runoff' && r.runoff
        ? {
            votes: r.runoff.votes,
            counts: counts(r.runoff.votes, r.runoff.candidates),
            runoff: true,
          }
        : { votes: r.votes, counts: counts(r.votes), runoff: false }
      : null;
  const roles: Record<string, 'imposter' | 'crew'> = {};
  r.accused.forEach((id, i) => {
    if (i < r.spot || (i === r.spot && r.flipped) || p !== 'accuse')
      roles[id] = isImposter(state, id) ? 'imposter' : 'crew';
  });
  const afterAccuse = p === 'lastChance' || p === 'wordReveal' || p === 'scores';
  return {
    round: r.n,
    rounds: state.cfg.rounds,
    clueRound: r.clueRound,
    clueRounds: state.cfg.clueRounds,
    category: state.cfg.hint === 'category' ? r.category.label : null,
    imposterCount: r.imposters.length,
    board: p === 'intro' || p === 'scores' ? [] : board(state),
    tally,
    runoff:
      (p === 'runoff' || (p === 'voteReveal' && r.runoff)) && r.runoff
        ? { candidates: r.runoff.candidates, slots: r.runoff.slots }
        : null,
    accuse:
      p === 'accuse' || afterAccuse
        ? { accused: r.accused, spot: r.spot, flipped: r.flipped, roles }
        : null,
    last:
      p === 'lastChance'
        ? {
            guessers: guessers(state),
            options: r.options,
            typed: state.cfg.lastChance === 'typed',
            guessed: Object.keys(r.guesses),
          }
        : null,
    reveal:
      (p === 'wordReveal' || p === 'scores') && word
        ? {
            word: word.answer,
            category: word.label,
            imposters: r.imposters,
            guesses: r.guesses,
            step: p === 'scores' ? 1 : r.step,
            void: r.void,
            countable: p === 'wordReveal' && countable(state),
          }
        : null,
    delta: p === 'scores' || (p === 'wordReveal' && r.step > 0) ? chips(state) : null,
    say: sayOf(state),
  };
}

function statusOf(state: State): (id: string) => PlayerStatus {
  const r = state.round;
  const p = state.phase.id;
  return (id) => {
    if (!state.seats.includes(id) || state.left.includes(id)) return 'waiting';
    if (p === 'deal') return r.ready.includes(id) ? 'submitted' : 'active';
    if (p === 'clue')
      return r.clues.some((c) => c.by === id && c.r === r.clueRound) ? 'submitted' : 'active';
    if (p === 'vote') return Object.hasOwn(r.votes, id) ? 'submitted' : 'active';
    if (p === 'runoff') {
      if (!eligibleVoters(state).includes(id)) return 'waiting';
      return r.runoff && Object.hasOwn(r.runoff.votes, id) ? 'submitted' : 'active';
    }
    if (p === 'lastChance')
      return guessers(state).includes(id)
        ? Object.hasOwn(r.guesses, id)
          ? 'submitted'
          : 'active'
        : 'waiting';
    return 'waiting';
  };
}

function extras(state: State): Pick<TvView, 'timerMode' | 'vipSkipLabel'> {
  const p = state.phase.id;
  const out: Pick<TvView, 'timerMode' | 'vipSkipLabel'> = {};
  if (p === 'deal' || p === 'scores') out.timerMode = 'quiet';
  if (REVEALS.has(p) || p === 'intro') out.timerMode = 'hidden';
  if (p === 'intro') out.vipSkipLabel = "Let's go";
  if (p === 'talk') out.vipSkipLabel = 'Start the vote';
  if (p === 'wordReveal') out.vipSkipLabel = 'Scores';
  if (p === 'scores')
    out.vipSkipLabel = state.round.n < state.cfg.rounds ? 'Next round' : 'See results';
  return out;
}

function envOptions(state: State): {
  statusOf: (id: string) => PlayerStatus;
  scores?: Record<string, number>;
} {
  return NO_SCORES.has(state.phase.id)
    ? { statusOf: statusOf(state) }
    : { statusOf: statusOf(state), scores: state.scores };
}

export function tvView(state: State): ImposterTvView {
  return {
    ...envelope(state, 'imposter', envOptions(state)),
    ...extras(state),
    stage: stageOf(state),
  };
}

export function controllerView(state: State, playerId: string): ImposterControllerView {
  const r = state.round;
  const p = state.phase.id;
  const seated = state.seats.includes(playerId) && Object.hasOwn(state.players, playerId);
  const imp = seated && isImposter(state, playerId);
  const w = wordOf(state);
  const inRound = seated && p !== 'intro' && p !== 'done';
  const crew = inRound && !imp;
  const hinted = state.cfg.hint === 'category';
  const clue = r.clues.find((c) => c.by === playerId && c.r === r.clueRound);
  const voteOpen = p === 'vote' || p === 'runoff' || p === 'talk';
  const myVote = p === 'runoff' ? (r.runoff?.votes[playerId] ?? null) : (r.votes[playerId] ?? null);
  const showResult = p === 'scores' || (p === 'wordReveal' && r.step > 0);
  return {
    ...controllerEnvelope(state, 'imposter', playerId, envOptions(state)),
    ...extras(state),
    stage: stageOf(state),
    seated,
    role: inRound ? (imp ? 'imposter' : 'crew') : null,
    word:
      crew && w ? { answer: w.answer, accept: w.accept, reject: w.reject, family: w.family } : null,
    catId: crew || (inRound && hinted) ? r.category.id : null,
    catLabel: crew || (inRound && hinted) ? r.category.label : null,
    mine: {
      ready: r.ready.includes(playerId),
      clue: clue?.text ?? null,
      vote: seated && (p === 'vote' || p === 'runoff') ? myVote : null,
      reject: r.rejects[playerId] ?? null,
      guess: r.guesses[playerId]?.said ?? null,
      said: state.said[playerId] ?? [],
    },
    ballot:
      seated && voteOpen && activeSeats(state).includes(playerId) ? ballot(state, playerId) : null,
    guessing:
      p === 'lastChance' &&
      guessers(state).includes(playerId) &&
      !Object.hasOwn(r.guesses, playerId),
    result: showResult && seated ? (r.delta[playerId] ?? null) : null,
  };
}

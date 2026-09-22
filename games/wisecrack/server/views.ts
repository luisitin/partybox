// tvView / controllerView for Wisecrack. The TV never shows answers before "vote" nor authors and
// vote counts before "reveal"; a phone shows only its owner's answers until the reveal.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, GameAward, PlayerStatus, TvView } from '@partybox/game-sdk';
import { answeredCount, answersExpected, playersDone } from './phases/answer';
import { answerOf, bothBlank, currentPrompt, eligibleVoters, hasVoted, isLastRound } from './round';
import { awardsFor, multiplierFor, standings, tallyPrompt } from './scoring';
import { NO_ANSWER } from './types';
import type { RoundPrompt, State } from './types';

export interface AnonymousOption {
  slot: number;
  text: string;
}

export interface RevealedAuthor extends AnonymousOption {
  playerId: string;
  name: string;
  avatarId: string;
  votes: number;
  voterIds: string[];
  points: number;
  sweep: boolean;
  /** Won without a vote: the other answer was blank. */
  walkover: boolean;
}

export interface StandingsRow {
  playerId: string;
  name: string;
  avatarId: string;
  connected: boolean;
  score: number;
  rank: number;
  delta: number;
}

export interface WisecrackTvView extends TvView {
  round: number;
  rounds: number;
  multiplier: number;
  /** answer: progress. */
  answeredCount: number;
  answersExpected: number;
  /** Prompts of this round that were (or will be) contested: both-blank ones do not count. */
  promptsPlayed: number;
  /** vote + reveal: the prompt on stage and its position in the round. */
  prompt: { text: string; number: number; count: number } | null;
  /** vote only: the two answers, anonymous, in slot order. */
  options: AnonymousOption[];
  votedCount: number;
  votersExpected: number;
  /** reveal only. */
  revealed: RevealedAuthor[];
  /** scores + done. */
  standings: StandingsRow[];
  /** done only. */
  awards: GameAward[];
}

export interface WisecrackControllerView extends ControllerView {
  round: number;
  rounds: number;
  multiplier: number;
  /** answer: my two prompts; `answer` is null until the server accepted one. */
  myPrompts: { id: string; text: string; answer: string | null }[];
  /** vote: what this phone may do for the prompt on stage. */
  vote: {
    promptId: string;
    promptText: string;
    role: 'voter' | 'author';
    options: AnonymousOption[];
    votedSlot: number | null;
    myAnswer: string | null;
  } | null;
  /** reveal: my result when I wrote for the prompt on stage; `last` = no prompt follows;
   *  `walkover` = won without a vote because the other answer was blank. */
  myReveal: {
    text: string;
    votes: number;
    points: number;
    sweep: boolean;
    walkover: boolean;
    last: boolean;
  } | null;
  myScore: number;
  myRank: number;
  myDelta: number;
  /** scores + done: the same rows the TV shows, for the compact phone scoreboard. */
  standings: StandingsRow[];
  /** reveal: the prompt on stage and both authors as the TV shows them — a "phone only" room
   *  reads the reveal on the phone (the owner, 2026-09-21). */
  reveal: { promptText: string; revealed: RevealedAuthor[] } | null;
}

function optionsOf(state: State, prompt: RoundPrompt): AnonymousOption[] {
  return prompt.authors.map((id, slot) => ({
    slot,
    text: answerOf(state, prompt.id, id) ?? NO_ANSWER,
  }));
}

function statusOf(state: State): (id: string) => PlayerStatus {
  const prompt = currentPrompt(state);
  const done = new Set(playersDone(state));
  return (id) => {
    if (state.phase.id === 'answer') return done.has(id) ? 'submitted' : 'active';
    if (state.phase.id === 'vote' && prompt) {
      if (prompt.authors.includes(id)) return 'waiting';
      return hasVoted(state, prompt.id, id) ? 'submitted' : 'active';
    }
    return 'active'; // nothing to do in intro / reveal / scores / done: plain chips
  };
}

function standingsRows(state: State): StandingsRow[] {
  return standings(state).map((row) => {
    const p = state.players[row.playerId];
    return {
      ...row,
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? 'ghost',
      connected: !!p?.connected,
    };
  });
}

function revealedAuthors(state: State, prompt: RoundPrompt): RevealedAuthor[] {
  return tallyPrompt(state, prompt).map((t) => {
    const p = state.players[t.playerId];
    return {
      slot: t.slot,
      text: t.text ?? NO_ANSWER,
      playerId: t.playerId,
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? 'ghost',
      votes: t.votes,
      voterIds: t.voterIds,
      points: t.points,
      sweep: t.sweep,
      walkover: t.walkover,
    };
  });
}

export function tvView(state: State, gameId: string): WisecrackTvView {
  const phase = state.phase.id;
  const prompt = phase === 'vote' || phase === 'reveal' ? currentPrompt(state) : null;
  const onStage = phase === 'scores' || phase === 'done';
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: state.scores }),
    // Passive phases (nobody can act): a quiet bar instead of red digits and countdown ticks
    // (ADR-030) — the reveal has its own beats, intro and scores are title cards.
    timerMode: phase === 'answer' || phase === 'vote' ? 'normal' : 'quiet',
    round: state.round,
    rounds: state.settings.rounds,
    multiplier: multiplierFor(state),
    answeredCount: answeredCount(state),
    answersExpected: answersExpected(state),
    promptsPlayed: state.prompts.filter((p) => !bothBlank(state, p)).length,
    prompt: prompt
      ? { text: prompt.text, number: state.promptIndex + 1, count: state.prompts.length }
      : null,
    options: prompt && phase === 'vote' ? optionsOf(state, prompt) : [],
    votedCount: prompt ? Object.keys(state.votes[prompt.id] ?? {}).length : 0,
    votersExpected: prompt ? eligibleVoters(state, prompt).length : 0,
    revealed: prompt && phase === 'reveal' ? revealedAuthors(state, prompt) : [],
    standings: onStage ? standingsRows(state) : [],
    awards: phase === 'done' ? awardsFor(state) : [],
  };
}

function voteFor(state: State, playerId: string): WisecrackControllerView['vote'] {
  const prompt = currentPrompt(state);
  if (state.phase.id !== 'vote' || !prompt || !state.players[playerId]) return null;
  const author = prompt.authors.includes(playerId);
  const votedFor = state.votes[prompt.id]?.[playerId];
  return {
    promptId: prompt.id,
    promptText: prompt.text,
    role: author ? 'author' : 'voter',
    // Both answers, as the TV shows them anonymously — an author reads the one they are up
    // against too (the owner, 2026-09-21: the phone-only author should see the other card).
    options: optionsOf(state, prompt),
    votedSlot: votedFor === undefined ? null : prompt.authors.indexOf(votedFor),
    myAnswer: author ? (answerOf(state, prompt.id, playerId) ?? NO_ANSWER) : null,
  };
}

function myRevealFor(state: State, playerId: string): WisecrackControllerView['myReveal'] {
  const prompt = currentPrompt(state);
  if (state.phase.id !== 'reveal' || !prompt || !prompt.authors.includes(playerId)) return null;
  const mine = tallyPrompt(state, prompt).find((t) => t.playerId === playerId);
  if (!mine) return null;
  return {
    text: mine.text ?? NO_ANSWER,
    votes: mine.votes,
    points: mine.points,
    sweep: mine.sweep,
    walkover: mine.walkover,
    last: isLastRound(state) && state.promptIndex >= state.prompts.length - 1,
  };
}

export function controllerView(
  state: State,
  gameId: string,
  playerId: string,
): WisecrackControllerView {
  const phase = state.phase.id;
  const me = standings(state).find((row) => row.playerId === playerId);
  const mine = phase === 'answer' && state.players[playerId] ? state.prompts : [];
  const staged = phase === 'reveal' ? currentPrompt(state) : null;
  return {
    ...controllerEnvelope(state, gameId, playerId, {
      statusOf: statusOf(state),
      scores: state.scores,
    }),
    round: state.round,
    rounds: state.settings.rounds,
    multiplier: multiplierFor(state),
    myPrompts: mine
      .filter((p) => p.authors.includes(playerId))
      .map((p) => ({ id: p.id, text: p.text, answer: answerOf(state, p.id, playerId) })),
    vote: voteFor(state, playerId),
    myReveal: myRevealFor(state, playerId),
    myScore: me?.score ?? 0,
    myRank: me?.rank ?? 0,
    myDelta: me?.delta ?? 0,
    standings: phase === 'scores' || phase === 'done' ? standingsRows(state) : [],
    reveal: staged ? { promptText: staged.text, revealed: revealedAuthors(state, staged) } : null,
  };
}

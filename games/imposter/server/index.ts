// Imposter — "One of you doesn't know the word." (docs/game-pack/imposter/SPEC.md). This file wires
// init / the phase order / reduce / views / bot together; one file per phase under ./phases.
import { applyVip, gameManifestSchema, hasPlayer, seedRng, setConnected } from '@partybox/game-sdk';
import type { GameDefinition, GameEvent, InitContext } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { decide } from './bot';
import { categoriesFor, drawWords } from './content';
import { enterAccuse, reduceAccuse, stepAccuse } from './phases/accuse';
import { enterClue, reduceClue } from './phases/clue';
import { enterClueReveal, reduceClueReveal, retimeClueReveal } from './phases/clueReveal';
import { enterDeal, reduceDeal } from './phases/deal';
import { enterLastChance, reduceLastChance, wantsLastChance } from './phases/lastChance';
import { enterDone, enterScores, reduceScores } from './phases/scores';
import { reduceTalk, enterTalk } from './phases/talk';
import { enterRunoff, enterVote, reduceVote } from './phases/vote';
import { enterVoteReveal, reduceVoteReveal, runoffPending } from './phases/voteReveal';
import { enterWordReveal, reduceWordReveal, retimeWordReveal } from './phases/wordReveal';
import { blankRound, impostersAllLeft, presenceOf, resolveCfg } from './round';
import { recap } from './recap';
import { results } from './scoring';
import { speech, wordLine } from './speech';
import { controllerView, tvView } from './views';
import type { ImposterControllerView, ImposterTvView } from './views';
export type { ImposterControllerView, ImposterTvView, ImposterStage, BoardCard } from './views';
import { PHASES, inputSchema } from './types';
import type { Input, State } from './types';

const manifest = gameManifestSchema.parse(manifestJson);

function init(ctx: InitContext): State {
  const presence = presenceOf(ctx);
  const cfg = resolveCfg(ctx.settings, presence);
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const [words, rng] = drawWords(seedRng(ctx.seed), categoriesFor(cfg), cfg.rounds + 2);
  const seats = ctx.players.map((p) => p.id);
  const first = words[0];
  const base: State = {
    phase: { id: 'deal', startedAt: ctx.now, deadline: null },
    rng,
    players,
    cfg,
    presence,
    seats,
    left: [],
    imposterBag: [],
    words,
    round: blankRound(0, 0, { id: first?.cat ?? '', label: first?.label ?? '' }),
    scores: Object.fromEntries(seats.map((id) => [id, 0])),
    said: {},
    stats: {},
    speechMs: {},
  };
  // ADR-053: the shell's stage already showed the rules and waited for everyone's READY + 3·2·1.
  return enterDeal(base, ctx.now, 1);
}

/** The phase order: what a deadline does, and what the VIP's skip does (docs/GAME_CONTRACT.md). */
export function advance(state: State, now: number): State {
  const r = state.round;
  switch (state.phase.id) {
    case 'deal':
      return enterClue(state, now, 1);
    case 'clue':
      return enterClueReveal(state, now);
    case 'clueReveal': {
      const shown: State = { ...state, round: { ...r, revealed: r.revealOrder.length } };
      if (r.clueRound < state.cfg.clueRounds) return enterClue(shown, now, r.clueRound + 1);
      return state.cfg.talk ? enterTalk(shown, now) : enterVote(shown, now);
    }
    case 'talk':
      return enterVote(state, now);
    case 'vote':
      return enterVoteReveal(state, now, 'main');
    case 'runoff':
      return enterVoteReveal(state, now, 'runoff');
    case 'voteReveal':
      if (runoffPending(state)) return enterRunoff(state, now);
      return r.accused.length > 0 ? enterAccuse(state, now) : enterWordReveal(state, now);
    case 'accuse':
      return wantsLastChance(state) ? enterLastChance(state, now) : enterWordReveal(state, now);
    case 'lastChance':
      return enterWordReveal(state, now);
    case 'wordReveal':
      return enterScores(state, now);
    case 'scores':
      return r.n < state.cfg.rounds ? enterDeal(state, now, r.n + 1) : enterDone(state, now);
    default:
      return state;
  }
}

/** The VIP's skip: the next card / the next accusation beat inside a paced reveal, else advance. */
function skip(state: State, now: number): State {
  const r = state.round;
  if (state.phase.id === 'clueReveal' && r.revealed < r.revealOrder.length)
    return reduceClueReveal(
      state,
      { type: 'timer', now, phaseId: 'clueReveal', startedAt: state.phase.startedAt },
      advance,
    );
  if (state.phase.id === 'accuse') return stepAccuse(state, now) ?? advance(state, now);
  return advance(state, now);
}

const BEFORE_VOTE = new Set(['deal', 'clue', 'clueReveal', 'talk']);

/** Connection changes; a player gone for good leaves the seats (SPEC §1.15). */
function onPlayer(state: State, event: Extract<GameEvent<Input>, { type: 'player' }>): State {
  let next = setConnected(state, event);
  if (!event.gone || !hasPlayer(next, event.playerId) || next.left.includes(event.playerId))
    return next;
  next = { ...next, left: [...next.left, event.playerId] };
  // Every imposter left before the vote: the round is void — straight to the word reveal.
  if (BEFORE_VOTE.has(next.phase.id) && impostersAllLeft(next))
    return enterWordReveal({ ...next, round: { ...next.round, void: true } }, event.now);
  return next;
}

function onSpeech(state: State, key: string, ms: number, now: number): State {
  const next: State = { ...state, speechMs: { ...state.speechMs, [key]: ms } };
  if (next.phase.id === 'clueReveal') return retimeClueReveal(next, key, now);
  if (next.phase.id === 'wordReveal' && wordLine(next)?.req.key === key)
    return retimeWordReveal(next, ms, now);
  return next;
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  if (event.type === 'speech') return onSpeech(state, event.key, event.ms, event.now);
  const vip = applyVip(state, event, { skip, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'deal':
      return reduceDeal(state, event, advance);
    case 'clue':
      return reduceClue(state, event, advance);
    case 'clueReveal':
      return reduceClueReveal(state, event, advance);
    case 'talk':
      return reduceTalk(state, event, advance);
    case 'vote':
    case 'runoff':
      return reduceVote(state, event, advance);
    case 'voteReveal':
      return reduceVoteReveal(state, event, advance);
    case 'accuse':
      return reduceAccuse(state, event, advance);
    case 'lastChance':
      return reduceLastChance(state, event, advance);
    case 'wordReveal':
      return reduceWordReveal(state, event, advance);
    case 'scores':
      return reduceScores(state, event, advance);
    default:
      return state;
  }
}

export const game: GameDefinition<State, Input, ImposterTvView, ImposterControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView,
  controllerView,
  results,
  recap,
  speech,
  bot: {
    sampleInput(state, playerId, rng) {
      if (!hasPlayer(state, playerId)) return null;
      return decide(controllerView(state, playerId), rng);
    },
  },
};

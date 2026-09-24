// The phase graph: intro → (clue → dial → [call] → reveal → [scores])* → done. Phase files know
// only their own entry and exit; this file wires the loop, so no phase imports another. A VIP skip
// runs the same transitions a deadline does.
import { applyVip, setConnected } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { callDone, enterCall, reduceCall } from './phases/call';
import { enterClue, psychicLink, reduceClue } from './phases/clue';
import { dialDone, enterDial, reduceDial } from './phases/dial';
import { reduceIntro } from './phases/intro';
import { enterReveal, reduceReveal, stepReveal } from './phases/reveal';
import { enterDone, enterScores, reduceScores } from './phases/scores';
import { needleOf } from './scoring';
import { callersOf, connectedGuessers, earnsCatchUp, isOver, otherTeam, planTurn } from './turn';
import type { Input, State } from './types';

/** A turn begins: with no psychic to be had (a team with nobody left) it is void at once. */
export function startTurn(state: State, now: number): State {
  if (!state.turn.psychic)
    return enterReveal({ ...state, turn: { ...state.turn, void: true } }, now);
  return enterClue(state, now);
}

function nextTurnOrDone(state: State, now: number): State {
  if (isOver(state)) return enterDone(state, now);
  const catchUp = earnsCatchUp(state);
  const team = state.turn.team;
  const nextTeam = team ? (catchUp ? team : otherTeam(team)) : state.nextTeam;
  return startTurn(planTurn({ ...state, nextTeam }, catchUp), now);
}

export function afterIntro(state: State, now: number): State {
  return startTurn(state, now);
}

export function afterClue(state: State, now: number): State {
  if (state.turn.clue === null)
    return enterReveal({ ...state, turn: { ...state.turn, void: true } }, now);
  // Nobody left to dial: straight to the reveal (the clue and the target still show).
  if (connectedGuessers(state).length === 0) return enterReveal(state, now);
  return enterDial(state, now);
}

export function afterDial(state: State, now: number): State {
  const needle = state.mode === 'solo' ? null : needleOf(state);
  const set = { ...state, turn: { ...state.turn, needle } };
  const callers = callersOf(set).filter((id) => set.players[id]?.connected === true);
  if (state.mode === 'teams' && needle !== null && callers.length > 0) return enterCall(set, now);
  return enterReveal(set, now);
}

export function afterCall(state: State, now: number): State {
  return enterReveal(state, now);
}

export function afterReveal(state: State, now: number): State {
  return state.turn.void ? nextTurnOrDone(state, now) : enterScores(state, now);
}

export function afterScores(state: State, now: number): State {
  return nextTurnOrDone(state, now);
}

/** "Skip" = what the phase's deadline would do (reveal: the points beat first). */
function skip(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return afterIntro(state, now);
    case 'clue':
      return afterClue(state, now);
    case 'dial':
      return afterDial(state, now);
    case 'call':
      return afterCall(state, now);
    case 'reveal':
      return stepReveal(state, now, afterReveal);
    case 'scores':
      return afterScores(state, now);
    default:
      return state;
  }
}

/** Someone left for good: out of every future psychic draw (spec §5.17). */
function markGone(state: State, id: string): State {
  if (!state.seats.includes(id) || state.left.includes(id)) return state;
  return { ...state, left: [...state.left, id] };
}

/** A drop or a return mid-phase: the psychic's clue window, or the last outstanding player gone. */
function onLink(state: State, event: Extract<GameEvent<Input>, { type: 'player' }>): State {
  let after = setConnected(state, event);
  if (event.gone) after = markGone(after, event.playerId);
  if (after.phase.paused) return after;
  const now = event.now;
  const phase = after.phase.id;
  if (phase === 'clue' && event.playerId === after.turn.psychic)
    return event.gone ? afterClue(after, now) : psychicLink(after, event.connected, now);
  if (event.connected) return after;
  if (phase === 'dial' && dialDone(after)) return afterDial(after, now);
  if (phase === 'call' && callDone(after)) return afterCall(after, now);
  return after;
}

export function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onLink(state, event);
  if (event.type === 'speech') {
    if (typeof event.key !== 'string' || !Number.isFinite(event.ms)) return state;
    return { ...state, speechMs: { ...state.speechMs, [event.key]: event.ms } };
  }
  const vip = applyVip(state, event, { skip, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, afterIntro);
    case 'clue':
      return reduceClue(state, event, afterClue);
    case 'dial':
      return reduceDial(state, event, afterDial);
    case 'call':
      return reduceCall(state, event, afterCall);
    case 'reveal':
      return reduceReveal(state, event, afterReveal);
    case 'scores':
      return reduceScores(state, event, afterScores);
    default:
      return state;
  }
}

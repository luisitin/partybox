// The phase graph: intro → (question → lie → pick → reveal → scores)× → done. Phase files only
// know their own entry and exit; this file wires the loop so no phase imports another. A VIP skip
// runs the same transition a deadline does — except in the reveal, where it turns one page.
import { allConnectedDone, applyVip, setConnected } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { checkReady, enterIntro, reduceIntro, startCountdown } from './phases/intro';
import { enterLie, liesIn, reduceLie } from './phases/lie';
import { enterPick, picksIn, reducePick } from './phases/pick';
import { enterQuestion, newQuestion, reduceQuestion, retimeQuestion } from './phases/question';
import { enterReveal, reduceReveal, retimeReveal, skipStep } from './phases/reveal';
import { enterDone, enterScores, isLastQuestion, reduceScores } from './phases/scores';
import type { Input, State } from './types';

export { enterIntro };

/** What a deadline does in each phase. */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return enterQuestion(state, now);
    case 'question':
      return enterLie(state, now);
    case 'lie':
      return enterPick(state, now);
    case 'pick':
      return enterReveal(state, now);
    case 'reveal':
      return enterScores(state, now);
    case 'scores':
      if (isLastQuestion(state)) return enterDone(state, now);
      return enterQuestion({ ...state, q: newQuestion(state, state.q.n + 1) }, now);
    default:
      return state;
  }
}

function skip(state: State, now: number): State {
  // The VIP's Start now on the rules runs the 3 · 2 · 1 first; a second skip cuts it.
  if (state.phase.id === 'intro' && !state.counting) return startCountdown(state, now);
  return state.phase.id === 'reveal' ? skipStep(state, now, advance) : advance(state, now);
}

/** The drop of the last outstanding player ends an input phase like their input would have. */
function closeIfDone(state: State, now: number): State {
  if (state.phase.id === 'intro') return checkReady(state, now);
  if (state.phase.id === 'lie' && allConnectedDone(state, liesIn(state)))
    return advance(state, now);
  if (state.phase.id === 'pick' && allConnectedDone(state, picksIn(state)))
    return advance(state, now);
  return state;
}

function onPlayer(state: State, event: Extract<GameEvent<Input>, { type: 'player' }>): State {
  let after = setConnected(state, event);
  if (
    event.gone &&
    Object.hasOwn(state.players, event.playerId) &&
    !after.left.includes(event.playerId)
  )
    after = { ...after, left: [...after.left, event.playerId] };
  return event.connected || after.phase.paused ? after : closeIfDone(after, event.now);
}

/** A reading is ready (or failed): record its length; the moment on stage re-times to it. */
function onSpeech(state: State, key: string, ms: number, now: number): State {
  if (!Number.isFinite(ms) || state.speechMs[key] === ms) return state;
  const recorded: State = {
    ...state,
    speechMs: { ...state.speechMs, [key]: Math.max(-1, Math.round(ms)) },
  };
  if (recorded.phase.paused) return recorded;
  return retimeReveal(retimeQuestion(recorded, key, now), key, now);
}

export function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  if (event.type === 'speech') return onSpeech(state, event.key, event.ms, event.now);
  const vip = applyVip(state, event, { skip, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, advance);
    case 'question':
      return reduceQuestion(state, event, advance);
    case 'lie':
      return reduceLie(state, event, advance);
    case 'pick':
      return reducePick(state, event, advance);
    case 'reveal':
      return reduceReveal(state, event, advance);
    case 'scores':
      return reduceScores(state, event, advance);
    default:
      return state;
  }
}

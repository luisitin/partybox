// The phase graph: intro → (prompt → write → (guess → reveal)* → scores)* → done. Phase files only
// know their own entry and exit; this file wires the loops so no phase imports another. A VIP skip
// runs the same `advance` a deadline does.
import { applyVip, hasPlayer, setConnected } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { buildCards } from './cards';
import { enterGuess, guessDone, closeGuess, reduceGuess } from './phases/guess';
import { reduceIntro } from './phases/intro';
import { enterPrompt, reducePrompt, retimePrompt } from './phases/prompt';
import { enterReveal, flip, reduceReveal } from './phases/reveal';
import { enterDone, enterScores, reduceScores } from './phases/scores';
import { enterWrite, reduceWrite, writeDone } from './phases/write';
import { closeSoon, isLastPrompt } from './round';
import type { Input, State } from './types';

/** `write` is over: the answers become cards in a seeded order; none → straight to the scores. */
function afterWrite(state: State, now: number): State {
  const [cards, rng] = buildCards(state.p.answers, state.seats, state.p.n, state.rng);
  const next: State = { ...state, rng, p: { ...state.p, cards } };
  return cards.length === 0 ? enterScores(next, now) : enterGuess(next, now, 0);
}

function afterReveal(state: State, now: number): State {
  const idx = state.p.idx + 1;
  return idx < state.p.cards.length ? enterGuess(state, now, idx) : enterScores(state, now);
}

/** What a deadline — or a VIP skip — does in each phase. */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return enterPrompt(state, now, 0);
    case 'prompt':
      return enterWrite(state, now);
    case 'write':
      return afterWrite(state, now);
    case 'guess':
      return enterReveal(state, now);
    case 'reveal':
      // A skip during the landing still scores the card before moving on.
      return afterReveal(state.p.step === 'land' ? flip(state, now) : state, now);
    case 'scores':
      return isLastPrompt(state) ? enterDone(state, now) : enterPrompt(state, now, state.p.n + 1);
    default:
      return state;
  }
}

/** A drop or a leave can make "everyone is done" true: the phase closes as if they had acted. */
function closeIfDone(state: State, now: number): State {
  if (state.phase.paused) return state;
  if (state.phase.id === 'write' && writeDone(state)) return closeSoon(state, now);
  if (state.phase.id === 'guess' && guessDone(state)) return closeGuess(state, now);
  return state;
}

function onPlayer(state: State, event: Extract<GameEvent<Input>, { type: 'player' }>): State {
  let after = setConnected(state, event);
  if (event.gone && hasPlayer(state, event.playerId) && !after.left.includes(event.playerId))
    after = { ...after, left: [...after.left, event.playerId] };
  return event.connected ? after : closeIfDone(after, event.now);
}

/** ADR-045: a reading is ready (or failed): remember its length; a prompt on stage re-times. */
function onSpeech(state: State, key: string, ms: number, now: number): State {
  if (state.speechMs[key] === ms) return state;
  const next: State = { ...state, speechMs: { ...state.speechMs, [key]: ms } };
  return next.phase.paused ? next : retimePrompt(next, now);
}

export function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  if (event.type === 'speech') return onSpeech(state, event.key, event.ms, event.now);
  const vip = applyVip(state, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, advance);
    case 'prompt':
      return reducePrompt(state, event, advance);
    case 'write':
      return reduceWrite(state, event, advance);
    case 'guess':
      return reduceGuess(state, event, advance);
    case 'reveal':
      return reduceReveal(state, event, advance);
    case 'scores':
      return reduceScores(state, event, advance);
    default:
      return state;
  }
}

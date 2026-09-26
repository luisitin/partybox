// The phase graph (the shell's start stage — rules, READY, 3·2·1 — opens the game):
// (prompt → write → guess* → reveal* → scores)* → done. Phase files only
// know their own entry and exit; this file wires the loops so no phase imports another. A VIP skip
// runs the same `advance` a deadline does.
import { applyVip, hasPlayer, setConnected } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { buildCards } from './cards';
import { enterGuess, guessDone, closeGuess, reduceGuess } from './phases/guess';
import { enterPrompt, reducePrompt, retimePrompt } from './phases/prompt';
import { enterReveal, flip, reduceReveal } from './phases/reveal';
import { enterDone, enterScores, reduceScores } from './phases/scores';
import { enterWrite, reduceWrite, writeDone } from './phases/write';
import { closeSoon, everyoneAnswered, isLastPrompt } from './round';
import type { Input, State } from './types';

/** `write` is over: the answers become cards in a seeded order; none → straight to the scores. */
function afterWrite(state: State, now: number): State {
  const [cards, rng] = buildCards(state.p.answers, state.seats, state.p.n, state.rng);
  const next: State = { ...state, rng, p: { ...state.p, cards } };
  if (cards.length === 0) return enterScores(next, now);
  // The final card has no meaningful guess: after every other author is revealed, its author is
  // the only one left. With one card, it is final from the start. Reveal it without scoring.
  if (cards.length === 1 && everyoneAnswered(next)) {
    return enterReveal({ ...next, p: { ...next.p, guessesByCard: [{}], guesses: {} } }, now);
  }
  return enterGuess(next, now, 0);
}

/** Keep every answer's picks private until the full guessing run is over. */
function afterGuess(state: State, now: number): State {
  const guessesByCard = [...state.p.guessesByCard];
  guessesByCard[state.p.idx] = { ...state.p.guesses };
  const next = { ...state, p: { ...state.p, guessesByCard } };
  const idx = state.p.idx + 1;
  if (idx < state.p.cards.length) {
    if (idx === state.p.cards.length - 1 && everyoneAnswered(next)) {
      // Everyone wrote, so the final author is deductable. Reveal that card without voting/scoring.
      guessesByCard[idx] = {};
      return enterReveal(
        { ...next, p: { ...next.p, idx: 0, guesses: guessesByCard[0] ?? {} } },
        now,
      );
    }
    return enterGuess(next, now, idx);
  }
  return enterReveal({ ...next, p: { ...next.p, idx: 0, guesses: guessesByCard[0] ?? {} } }, now);
}

function afterReveal(state: State, now: number): State {
  const idx = state.p.idx + 1;
  return idx < state.p.cards.length
    ? enterReveal(
        { ...state, p: { ...state.p, idx, guesses: state.p.guessesByCard[idx] ?? {} } },
        now,
      )
    : enterScores(state, now);
}

/** What a deadline — or a VIP skip — does in each phase. */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'prompt':
      return enterWrite(state, now);
    case 'write':
      return afterWrite(state, now);
    case 'guess':
      return afterGuess(state, now);
    case 'reveal':
      // A skip during the landing flips the card now (the room always sees who wrote it); a skip
      // once it has flipped moves on (record-review s5: skipping straight past lost the author).
      return state.p.step === 'land' ? flip(state, now) : afterReveal(state, now);
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

// Phase "lastChance": a caught imposter names the word — one of six options (choices mode) or typed
// (fuzzy or better, Part 00 §4.5). One guess each; ends when every guesser has guessed, after 20 s
// (no guess = wrong; a guesser who dropped simply times out), or on the VIP's skip.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { atLeast, matchAnswer } from '../../match';
import { PACK_LANG, drawOptions } from '../content';
import { wordOf } from '../round';
import { LAST_CHANCE_MS } from '../types';
import type { Input, State, Transition } from '../types';

/** Caught imposters still in the game: the players who get a last chance. */
export function guessers(state: State): string[] {
  const r = state.round;
  return r.accused.filter((id) => r.imposters.includes(id) && !state.left.includes(id));
}

export function wantsLastChance(state: State): boolean {
  return state.cfg.lastChance !== 'off' && !state.round.void && guessers(state).length > 0;
}

export function enterLastChance(state: State, now: number): State {
  const word = wordOf(state);
  let { rng } = state;
  let options: string[] | null = null;
  if (state.cfg.lastChance === 'choices' && word) [options, rng] = drawOptions(rng, word);
  const round = { ...state.round, options };
  return enterPhase({ ...state, rng, round }, 'lastChance', now, LAST_CHANCE_MS);
}

export function reduceLastChance(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'guess') return state;
  const id = event.playerId;
  const r = state.round;
  const word = wordOf(state);
  if (
    !word ||
    !hasPlayer(state, id) ||
    !guessers(state).includes(id) ||
    Object.hasOwn(r.guesses, id)
  )
    return state;
  let said: string;
  let ok: boolean;
  if (state.cfg.lastChance === 'choices') {
    const option = event.input.option;
    if (option === undefined || !(r.options ?? []).includes(option)) return state;
    said = option;
    ok = option === word.answer;
  } else {
    const text = (event.input.text ?? '').trim();
    if (text.length === 0) return state;
    said = text;
    ok = atLeast(matchAnswer(text, word, PACK_LANG), 'fuzzy');
  }
  const guesses = { ...r.guesses, [id]: { said, ok, byVip: false } };
  const after: State = { ...state, round: { ...r, guesses } };
  return guessers(after).every((g) => Object.hasOwn(guesses, g)) ? next(after, event.now) : after;
}

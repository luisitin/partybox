// Hints for the shared contract suite (packages/game-sdk/src/contract-tests): strings each view
// must never contain. TV: every card in a hand and every submission before "reveal"; the cards
// not yet read during "reveal"; hands always. Phones: other players' hands always; other players'
// submissions before "reveal"; unread cards during "reveal".
import type { GameStateBase } from '@partybox/game-sdk';
import { revealSpan } from '../server/cards';
import { whiteText } from '../server/content';
import type { State } from '../server/types';

function handTexts(state: State, except: string): string[] {
  return Object.entries(state.hands)
    .filter(([id]) => id !== except)
    .flatMap(([, hand]) => hand.map(whiteText));
}

function submissionTexts(state: State, except: string): string[] {
  return Object.entries(state.submissions)
    .filter(([id]) => id !== except)
    .flatMap(([, cards]) => cards.map(whiteText));
}

/** Submissions in slots after the flight on stage (not read yet) — I-157: a flight of two or
 *  three cards is read in one beat. */
function unreadTexts(state: State, except: string): string[] {
  return state.slots
    .slice(state.revealIndex + revealSpan(state.slots.length))
    .filter((id) => id !== except)
    .flatMap((id) => (state.submissions[id] ?? []).map(whiteText));
}

export const contractConfig = {
  hiddenFromTv: (base: GameStateBase): string[] => {
    const state = base as State;
    const phase = state.phase.id;
    const hidden = handTexts(state, '');
    if (phase === 'intro' || phase === 'answer') hidden.push(...submissionTexts(state, ''));
    if (phase === 'reveal') hidden.push(...unreadTexts(state, ''));
    return hidden;
  },
  hiddenFromController: (base: GameStateBase, playerId: string): string[] => {
    const state = base as State;
    const phase = state.phase.id;
    const hidden = handTexts(state, playerId);
    if (phase === 'intro' || phase === 'answer') hidden.push(...submissionTexts(state, playerId));
    if (phase === 'reveal') hidden.push(...unreadTexts(state, playerId));
    return hidden;
  },
  settingsVariants: [
    { judge: 'czar', rounds: 3, decks: 'mild', rando: true },
    { judge: 'vote', rounds: 3, decks: 'wild-only', rando: true },
  ],
};

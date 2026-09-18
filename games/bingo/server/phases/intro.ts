// Phase "intro" (5 s): the TV announces the round and its pattern; phones show their new cards.
// Entering it deals the round: one deck shuffle, then `settings.cards` cards per player in
// sorted-id order so the same seed always deals the same cards. Exits on the deadline (or VIP
// skip) via `next`.
import { enterPhase, hasPlayer, isTimerFor, shuffle } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { dealCard, dealCards, range } from '../cards';
import { setMenu } from '../claims';
import { DECK, INTRO_MS } from '../types';
import type { Input, Pattern, RoundState, State, Transition } from '../types';

export function enterIntro(state: State, number: number, now: number): State {
  let rng = state.rng;
  const [deck, afterDeck] = shuffle(rng, range(1, DECK));
  rng = afterDeck;
  const cards: Record<string, number[][]> = {};
  const daubs: Record<string, number[][]> = {};
  for (const id of Object.keys(state.players).sort()) {
    const [dealt, next] = dealCards(rng, state.settings.cards);
    cards[id] = dealt;
    daubs[id] = dealt.map(() => []);
    rng = next;
  }
  const pattern: Pattern =
    state.settings.patterns[number - 1] ?? state.settings.patterns[0] ?? 'line';
  const round: RoundState = {
    number,
    pattern,
    deck,
    drawn: 0,
    cards,
    daubs,
    claim: null,
    waitForCall: {},
    winnerId: null,
    won: {},
    patternBingos: 0,
    decision: null,
    judged: false,
    judgedAt: null,
    calledAt: null,
    bingos: 0,
    arm: null,
    queue: [],
    menus: state.round.menus,
    resumeAt: null,
    resumeAgain: false,
    resumeBy: null,
    swapped: {},
  };
  return enterPhase(
    { ...state, rng, round, winsAtRoundStart: { ...state.wins } },
    'intro',
    now,
    INTRO_MS,
  );
}

/** "Deal me another": one fresh card per slot, during the intro only; the old one is gone. */
function swapCard(state: State, playerId: string, card: number): State {
  const round = state.round;
  const cards = round.cards[playerId];
  if (!hasPlayer(state, playerId) || !cards || card < 0 || card >= cards.length) return state;
  const done = round.swapped[playerId] ?? [];
  if (done.includes(card)) return state;
  const [fresh, rng] = dealCard(state.rng);
  return {
    ...state,
    rng,
    round: {
      ...round,
      cards: { ...round.cards, [playerId]: cards.map((c, i) => (i === card ? fresh : c)) },
      swapped: { ...round.swapped, [playerId]: [...done, card] },
    },
  };
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type === 'swap') return swapCard(state, event.playerId, event.input.card);
    if (event.input.type === 'menu') return setMenu(state, event.playerId, event.input.open);
    return state;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

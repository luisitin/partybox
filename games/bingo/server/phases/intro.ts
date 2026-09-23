// Phase "intro" (up to 15 s): the TV announces the round and its pattern; phones show their new
// cards, swap them, and tap Ready — when every person with cards has (loop 344, the owner), the
// first number is 3 s away, and never sooner than the deal plus the 3 · 2 · 1 (`introMinMs`). Entering it deals the
// round: one deck shuffle, then `settings.cards` cards per player in sorted-id order so the same
// seed always deals the same cards. Exits on the deadline (or VIP skip) via `next`.
import { enterPhase, hasPlayer, isTimerFor, shuffle } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { dealCard, dealCards, range } from '../cards';
import { setMenu } from '../claims';
import { DECK, INTRO_BREATH_MS, INTRO_MS, INTRO_READY_MS, introMinMs } from '../types';
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
    offer: {},
    ready: [],
  };
  return enterPhase(
    { ...state, rng, round, winsAtRoundStart: { ...state.wins } },
    'intro',
    now,
    INTRO_MS,
  );
}

/**
 * "Deal me another": one fresh card per slot, during the intro only; the old one is gone. Not
 * after Ready — the cards are picked.
 */
function swapCard(state: State, playerId: string, card: number, now: number): State {
  const round = state.round;
  const cards = round.cards[playerId];
  if (!hasPlayer(state, playerId) || !cards || card < 0 || card >= cards.length) return state;
  if (round.ready.includes(playerId)) return state;
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
      // I-139 A: the old card waits beside the new one until the player picks a side.
      offer: { ...round.offer, [playerId]: { card, old: cards[card] ?? [], at: now } },
    },
  };
}

/** I-139 A: put the old card back; the offer is over. */
function keepOld(state: State, playerId: string): State {
  const round = state.round;
  const offer = round.offer?.[playerId];
  const cards = round.cards[playerId];
  if (!offer || !cards || round.ready.includes(playerId)) return state;
  const { [playerId]: _gone, ...rest } = round.offer ?? {};
  return {
    ...state,
    round: {
      ...round,
      cards: { ...round.cards, [playerId]: cards.map((c, i) => (i === offer.card ? offer.old : c)) },
      // I-139 C: looking is free — the swap is only spent on a card actually taken.
      swapped: {
        ...round.swapped,
        [playerId]: (round.swapped[playerId] ?? []).filter((c) => c !== offer.card),
      },
      offer: rest,
    },
  };
}

/** I-139 A: the new card stays; the offer is over (also what Ready does to an open offer). */
function takeNew(state: State, playerId: string): State {
  if (!state.round.offer?.[playerId]) return state;
  const { [playerId]: _gone, ...rest } = state.round.offer ?? {};
  return { ...state, round: { ...state.round, offer: rest } };
}

/** People with cards still to hear from: connected, not a bot, not ready. */
export function waitingOn(state: State): string[] {
  return Object.keys(state.round.cards).filter((id) => {
    const p = state.players[id];
    return p !== undefined && p.connected && !p.bot && !state.round.ready.includes(id);
  });
}

/**
 * Everyone ready (or a straggler gone): the first number comes INTRO_READY_MS from now — the
 * 3 · 2 · 1 on every screen — unless the deal itself still needs the time (`introMinMs`), and
 * never later than the deadline already set. Safe to call from any intro event.
 */
export function settleIntro(state: State, now: number): State {
  if (state.phase.id !== 'intro' || waitingOn(state).length > 0) return state;
  const at = Math.max(
    now + INTRO_BREATH_MS + INTRO_READY_MS,
    state.phase.startedAt + introMinMs(state.settings.cards),
  );
  if (state.phase.deadline !== null && at >= state.phase.deadline) return state;
  return { ...state, phase: { ...state.phase, deadline: at } };
}

function markReady(state: State, playerId: string, now: number): State {
  const round = state.round;
  if (!hasPlayer(state, playerId) || !Object.hasOwn(round.cards, playerId)) return state;
  if (round.ready.includes(playerId)) return state;
  const settled = takeNew(state, playerId).round; // I-139 A: an open offer ends on the new card
  return settleIntro({ ...state, round: { ...settled, ready: [...round.ready, playerId] } }, now);
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type === 'swap')
      return swapCard(state, event.playerId, event.input.card, event.now);
    // I-139 A: the answer to an offer.
    if (event.input.type === 'keepOld') return keepOld(state, event.playerId);
    if (event.input.type === 'takeNew') return takeNew(state, event.playerId);
    if (event.input.type === 'menu') return setMenu(state, event.playerId, event.input.open);
    if (event.input.type === 'ready') return markReady(state, event.playerId, event.now);
    return state;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

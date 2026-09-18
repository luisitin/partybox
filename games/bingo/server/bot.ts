// The bot every harness uses — and, since the manifest says `supportsBots`, a real opponent in
// the lobby (ADR-028). It daubs what it hears on its own cards, mis-taps about 1 in 20, and presses
// BINGO! when a card looks complete — so it wins rounds and sometimes gets checked in public.
// It only reads what its phone would show: its cards, its daubs, the called numbers, the pattern.
import { hasPlayer } from '@partybox/game-sdk';
import type { Rng } from '@partybox/game-sdk';
import { calledNumbers } from './cards';
import { looksComplete } from './patterns';
import { liveCards } from './phases/bingo';
import { canClaim } from './phases/play';
import { FREE } from './types';
import type { Input, State } from './types';

export const BOT_DAUB_PROBABILITY = 0.7;
export const BOT_MISTAP_PROBABILITY = 0.05;

export function sampleInput(state: State, playerId: string, rng: Rng): Input | null {
  // The card-pick step: a bot (or a harness phone acting through the dev API) is ready at once.
  if (state.phase.id === 'intro')
    return Object.hasOwn(state.round.cards, playerId) && !state.round.ready.includes(playerId)
      ? { type: 'ready' }
      : null;
  if (state.phase.id !== 'play' && state.phase.id !== 'check') return null;
  const round = state.round;
  const cards = round.cards[playerId];
  if (!hasPlayer(state, playerId) || !cards || cards.length === 0) return null;
  const daubsOf = (i: number): number[] => round.daubs[playerId]?.[i] ?? [];
  // A card that already won is done for the round: nothing to daub or claim there.
  const live = liveCards(state, playerId);
  if (live.length === 0) return null;
  // Two taps: the same input twice arms, then claims, the first card that looks complete.
  const ready = live.find((i) => looksComplete(round.pattern, daubsOf(i)));
  const done = ready !== undefined;
  if (ready !== undefined && canClaim(state, playerId, ready))
    return { type: 'bingo', card: ready };
  const called = new Set(calledNumbers(state));
  // Every called, un-daubed square across the live cards; the bot works them one tap at a time.
  const todo: { card: number; index: number }[] = [];
  for (const c of live) {
    const daubs = daubsOf(c);
    (cards[c] ?? []).forEach((n, i) => {
      if (i !== FREE && called.has(n) && !daubs.includes(i)) todo.push({ card: c, index: i });
    });
  }
  if (todo.length > 0 && rng.chance(BOT_DAUB_PROBABILITY))
    return { type: 'daub', ...rng.pick(todo) };
  // A stray tap now and then → red squares when it claims. Never while it already looks done.
  if (!done && rng.chance(BOT_MISTAP_PROBABILITY))
    return { type: 'daub', card: rng.pick(live), index: rng.int(0, 24) };
  return null;
}

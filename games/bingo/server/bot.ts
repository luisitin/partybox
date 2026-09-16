// The bot every harness uses — and, since the manifest says `supportsBots`, a real opponent in
// the lobby (ADR-028). It daubs what it hears on its own card, mis-taps about 1 in 20, and presses
// BINGO! when its card looks complete — so it wins rounds and sometimes gets checked in public.
// It only reads what its phone would show: its card, its daubs, the called numbers, the pattern.
import { hasPlayer } from '@partybox/game-sdk';
import type { Rng } from '@partybox/game-sdk';
import { calledNumbers } from './cards';
import { looksComplete } from './patterns';
import { canClaim } from './phases/play';
import { FREE } from './types';
import type { Input, State } from './types';

export const BOT_DAUB_PROBABILITY = 0.7;
export const BOT_MISTAP_PROBABILITY = 0.05;

export function sampleInput(state: State, playerId: string, rng: Rng): Input | null {
  if (state.phase.id !== 'play' && state.phase.id !== 'check') return null;
  const round = state.round;
  const card = round.cards[playerId];
  if (!hasPlayer(state, playerId) || !card) return null;
  const daubs = round.daubs[playerId] ?? [];
  const done = looksComplete(round.pattern, daubs);
  if (done && canClaim(state, playerId)) return { type: 'bingo' };
  const called = new Set(calledNumbers(state));
  const todo = card
    .map((_, i) => i)
    .filter((i) => i !== FREE && called.has(card[i] as number) && !daubs.includes(i));
  if (todo.length > 0 && rng.chance(BOT_DAUB_PROBABILITY))
    return { type: 'daub', index: rng.pick(todo) };
  // A stray tap now and then → red squares when it claims. Never while it already looks done.
  if (!done && rng.chance(BOT_MISTAP_PROBABILITY)) return { type: 'daub', index: rng.int(0, 24) };
  return null;
}

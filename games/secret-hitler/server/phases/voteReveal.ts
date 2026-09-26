// Phase "voteReveal" (R7, R9, D2): every vote shows at once. A living player who didn't vote
// counts as Nein. Elected: the pair becomes the term-limited pair. Rejected: the tracker moves up.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go, headlined, patchHistory, withRound } from '../phase';
import { isElected } from '../rules';
import { REVEAL_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function tally(state: State): { ja: number; nein: number } {
  const ja = state.alive.filter((id) => state.round.votes[id] === true).length;
  return { ja, nein: state.alive.length - ja };
}

export function enterVoteReveal(state: State, now: number): State {
  const { ja, nein } = tally(state);
  const elected = isElected(ja, ja + nein) && state.round.nominee !== null;
  let s = withRound(state, { elected });
  s = patchHistory(s, { chancellor: s.round.nominee ?? '', ja, nein, elected });
  s = elected
    ? { ...s, lastElected: { president: s.round.president, chancellor: s.round.nominee } }
    : { ...s, tracker: s.tracker + 1 };
  s = headlined(s, elected ? 'elected' : s.tracker === 2 ? 'tracker2' : 'rejected');
  return go(s, 'voteReveal', now, REVEAL_MS.voteReveal);
}

export function reduceVoteReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

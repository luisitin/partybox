// The bot (SPEC §3.11), honest by construction: it decides from its own controllerView only
// (Part 00 §7 rule 9). It lies through Suggest, which draws the question's house lies (and then
// the fillers) and never offers anyone the same fake twice in a game; it picks uniformly at
// random, because it cannot know the truth; and about a third of the time it likes one option.
import { hashString } from '@partybox/game-sdk';
import type { Rng } from '@partybox/game-sdk';
import type { Category } from '../content/schema';
import { FILLERS } from './content';
import type { Input, State } from './types';
import { controllerView } from './views-phone';

/** A stable per-question coin for the like (asked again every few hundred ms, it must not
 *  re-roll), from what the phone knows: its own id and the question number. */
function likesThisQuestion(me: string, n: number): boolean {
  return hashString(`${me}|${n}|like`) % 10 < 3;
}

export function sampleInput(
  state: State,
  playerId: string,
  rng: Rng,
  gameId: string,
): Input | null {
  const view = controllerView(state, gameId, playerId);
  if (view.me.role !== 'player') return null;
  if (view.phaseId === 'lie') {
    if (view.myLie !== null) return null;
    if (view.suggestions.length > 0) return { type: 'lie', text: rng.pick(view.suggestions) };
    if (view.canSuggest) return { type: 'suggest' };
    // No Suggest on this phone: a generic fake for the category (public content, not a secret).
    const fillers = FILLERS.byCategory[view.fact.category as Category] ?? [];
    return fillers.length > 0 ? { type: 'lie', text: rng.pick(fillers) } : null;
  }
  if (view.phaseId === 'pick' && view.options.length > 0) {
    if (view.likesOn && view.myLikes.length === 0 && likesThisQuestion(playerId, view.n))
      return { type: 'like', option: rng.pick(view.options).id, on: true };
    if (view.myPick === null) return { type: 'pick', option: rng.pick(view.options).id };
  }
  return null;
}

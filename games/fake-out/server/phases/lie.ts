// Phase "lie": everyone types a fake answer (resend to change); 💡 Suggest offers two ready-made
// fakes once per question. The §3.7 checks run here; typing the truth is refused with its own
// message (the one deliberate exception to Part 00 §7 rule 13). Exits when every connected player
// has a lie in, on the deadline, or on VIP skip.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { checkLie } from '../lies';
import { drawSuggestions } from '../options';
import type { Input, LieInput, State, Transition } from '../types';

export function enterLie(state: State, now: number): State {
  return enterPhase(state, 'lie', now, state.cfg.lieSeconds * 1000);
}

/** Players with a lie locked in. */
export function liesIn(state: State): string[] {
  return Object.keys(state.q.lies);
}

function applyLie(state: State, playerId: string, input: LieInput): State {
  const { q } = state;
  const text = input.text.trim().replace(/\s+/g, ' ');
  const why = checkLie(text, q.item);
  if (why) {
    const n = (q.rejected[playerId]?.n ?? 0) + 1;
    const truthTyped =
      why === 'truth' && !q.truthTyped.includes(playerId)
        ? [...q.truthTyped, playerId]
        : q.truthTyped;
    return {
      ...state,
      q: { ...q, truthTyped, rejected: { ...q.rejected, [playerId]: { why, n } } },
    };
  }
  if (q.lies[playerId] === text && !q.rejected[playerId]) return state;
  const rejected = { ...q.rejected };
  delete rejected[playerId];
  return { ...state, q: { ...q, lies: { ...q.lies, [playerId]: text }, rejected } };
}

/** Suggest: once per question; bots always may (they lie through it, SPEC §3.11), people only
 *  when the setting is on. */
function applySuggest(state: State, playerId: string): State {
  const { q } = state;
  const bot = state.players[playerId]?.bot === true;
  if (Object.hasOwn(q.suggestions, playerId) || (!state.cfg.suggestions && !bot)) return state;
  const [two, rng] = drawSuggestions(state, playerId);
  return {
    ...state,
    rng,
    q: {
      ...q,
      suggestions: { ...q.suggestions, [playerId]: two },
      claimed: [...q.claimed, ...two],
    },
    offered: { ...state.offered, [playerId]: [...(state.offered[playerId] ?? []), ...two] },
  };
}

export function reduceLie(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (!hasPlayer(state, event.playerId)) return state;
    const { input } = event;
    if (input.type === 'suggest') return applySuggest(state, event.playerId);
    if (input.type !== 'lie') return state;
    const after = applyLie(state, event.playerId, input);
    return after !== state && allConnectedDone(after, liesIn(after))
      ? next(after, event.now)
      : after;
  }
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

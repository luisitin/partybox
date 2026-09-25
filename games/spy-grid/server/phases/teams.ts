// Phase "teams" (SPEC §9.6): phones join Sun or Moon and volunteer as spymaster; the VIP can
// shuffle. The game is valid without a single tap (init already placed everyone). Exits on the VIP's
// Start (a skip) or after 45 s; `next` settles the teams and deals the first board.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { initialTeams, join } from '../teams';
import { TEAMS_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterTeams(state: State, now: number): State {
  return enterPhase(state, 'teams', now, TEAMS_MS);
}

export function reduceTeams(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || !hasPlayer(state, event.playerId)) return state;
  if (state.left.includes(event.playerId)) return state;
  const input = event.input;
  switch (input.type) {
    case 'join':
      return state.mode === 'teams' ? join(state, event.playerId, input.team) : state;
    case 'volunteer': {
      const others = state.volunteers.filter((id) => id !== event.playerId);
      return { ...state, volunteers: input.on ? [...others, event.playerId] : others };
    }
    case 'shuffle': {
      if (event.vip !== true || state.mode !== 'teams') return state;
      const [teams, rng] = initialTeams(state, state.rng);
      return { ...state, teams, rng };
    }
    default:
      return state;
  }
}

// Hints for the shared contract suite (packages/game-sdk/src/contract-tests). Tune In's secrets
// are numbers, so the views carry them under keys nothing else shares and we list the KEY names:
// `bullseyeAt` (the target: the psychic's phone only, until the reveal), `huddleMarks` (live
// dials: the active side and the TV, never in solo), `revealDials` / `revealCalls` (every dial
// and call: public from the reveal on).
import type { GameStateBase } from '@partybox/game-sdk';
import { guessersOf } from '../server/turn';
import type { State } from '../server/types';

function revealed(state: State): boolean {
  return ['reveal', 'scores', 'done'].includes(state.phase.id);
}

export const contractConfig = {
  hiddenFromTv: (raw: GameStateBase): string[] => {
    const state = raw as State;
    const hidden = revealed(state) ? [] : ['bullseyeAt', 'revealDials', 'revealCalls'];
    return state.mode === 'solo' || !state.cfg.huddle ? [...hidden, 'huddleMarks'] : hidden;
  },
  hiddenFromController: (raw: GameStateBase, viewer: string): string[] => {
    const state = raw as State;
    const hidden: string[] = [];
    if (!revealed(state)) {
      hidden.push('revealDials', 'revealCalls');
      if (viewer !== state.turn.psychic) hidden.push('bullseyeAt');
    }
    const active = viewer === state.turn.psychic || guessersOf(state).includes(viewer);
    if (state.mode === 'solo' || !state.cfg.huddle || !active) hidden.push('huddleMarks');
    return hidden;
  },
  settingsVariants: [
    { mode: 'teams' },
    { mode: 'coop', targetSize: 'wide' },
    { mode: 'teams', huddle: false, targetSize: 'narrow' },
    { spicy: true, reader: 'none', rounds: '3' },
  ],
};

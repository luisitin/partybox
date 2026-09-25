// Who does what on the current word: the guesser (rotation, skipping players who left) and the
// clue-givers (every other seat still in the game).
import type { State } from './types';

/** The guesser for turn number `turn`: rotation order, skipping players who have left. */
export function guesserFor(state: Pick<State, 'rotation' | 'left'>, turn: number): string {
  const n = state.rotation.length;
  for (let k = 0; k < n; k++) {
    const id = state.rotation[(turn + k) % n] as string;
    if (!state.left.includes(id)) return id;
  }
  return state.rotation[turn % Math.max(1, n)] ?? '';
}

export function isGiver(state: State, playerId: string): boolean {
  return (
    state.seats.includes(playerId) && playerId !== state.w.guesser && !state.left.includes(playerId)
  );
}

export function givers(state: State): string[] {
  return state.seats.filter((id) => isGiver(state, id));
}

export function connectedGivers(state: State): string[] {
  return givers(state).filter((id) => state.players[id]?.connected === true);
}

/** Every connected clue-giver is in `done` — and at least one is connected (else the clock). */
export function giversDone(state: State, done: readonly string[]): boolean {
  const live = connectedGivers(state);
  return live.length > 0 && live.every((id) => done.includes(id));
}

export function cluesPerGiver(state: State): number {
  return state.twoClues ? 2 : 1;
}

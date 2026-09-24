// The rules of record as pure functions: role counts (R1), knowledge (R2), the deck (R3, R13),
// seat rotation (R5, R16), term limits (R6), the majority (R7) and the power table (R14).
// No state changes here beyond returning new values; phases compose these.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { BASE_SECONDS } from './types';
import type { Pace, Party, PowerKind, Role, State, TimedStep } from './types';

/** R1: Fascists other than Hitler, by player count (5–6: 1, 7–8: 2, 9–10: 3). */
export function fascistCount(players: number): number {
  return players <= 6 ? 1 : players <= 8 ? 2 : 3;
}

/** R1: deals Liberal / Fascist / Hitler over the seats with the rng. */
export function dealRoles(rng: RngState, ids: readonly string[]): [Record<string, Role>, RngState] {
  const [order, next] = shuffle(rng, ids);
  const role: Record<string, Role> = {};
  const fascists = Math.min(fascistCount(ids.length), Math.max(0, ids.length - 1));
  order.forEach((id, i) => {
    role[id] = i === 0 ? 'hitler' : i <= fascists ? 'fascist' : 'liberal';
  });
  return [role, next];
}

export function partyOf(role: Role | undefined): Party {
  return role === 'liberal' || role === undefined ? 'L' : 'F';
}

/** R2: whom this player knows to be on the Fascist team (never themself). */
export function knownTeam(state: State, viewer: string): string[] {
  const mine = state.role[viewer];
  const seesTeam = mine === 'fascist' || (mine === 'hitler' && state.seats.length <= 6);
  if (!seesTeam) return [];
  return state.seats.filter((id) => id !== viewer && partyOf(state.role[id]) === 'F');
}

/** R3: 6 Liberal and 11 Fascist policies, shuffled. */
export function newDeck(rng: RngState): [Party[], RngState] {
  const cards: Party[] = [...Array<Party>(6).fill('L'), ...Array<Party>(11).fill('F')];
  return shuffle(rng, cards);
}

/** R13: fewer than 3 in the deck → the discards and the rest of the deck are shuffled together. */
export function reshuffleIfLow(state: State): State {
  if (state.deck.length >= 3) return state;
  const [deck, rng] = shuffle(state.rng, [...state.deck, ...state.discards]);
  return { ...state, deck, discards: [], rng };
}

/** R14: the power on Fascist slot 1–6 for a player count (slot 6 wins, so it has none). */
export function powerForSlot(players: number, slot: number): PowerKind | null {
  if (slot === 4 || slot === 5) return 'execute';
  if (slot === 3) return players <= 6 ? 'peek' : 'special';
  if (slot === 2) return players >= 7 ? 'investigate' : null;
  if (slot === 1) return players >= 9 ? 'investigate' : null;
  return null;
}

/** D1: a timed step in ms at this pace, rounded to 5 s. */
export function stepMs(pace: Pace, step: TimedStep): number {
  const factor = pace === 'relaxed' ? 1.5 : pace === 'fast' ? 2 / 3 : 1;
  return Math.round((BASE_SECONDS[step] * factor) / 5) * 5 * 1000;
}

export function isAlive(state: State, id: string): boolean {
  return state.alive.includes(id);
}

export type Ineligible = 'president' | 'executed' | 'exiled' | 'lastChancellor' | 'lastPresident';

/** R6: why a player can't be nominated Chancellor right now (null = eligible). */
export function ineligibleReason(state: State, id: string): Ineligible | null {
  if (id === state.round.president) return 'president';
  if (state.exiled.includes(id)) return 'exiled';
  if (!isAlive(state, id)) return 'executed';
  if (id === state.lastElected.chancellor) return 'lastChancellor';
  if (id === state.lastElected.president && state.alive.length > 5) return 'lastPresident';
  return null;
}

export function eligibleNominees(state: State): string[] {
  return state.alive.filter((id) => ineligibleReason(state, id) === null);
}

/** R7: elected when Ja votes are more than half of the votes; a tie fails. */
export function isElected(ja: number, total: number): boolean {
  return ja * 2 > total;
}

/** R5: the next living seat after `index` in seat order (wrapping), or -1 when nobody lives. */
export function nextAliveIndex(state: State, index: number): number {
  const n = state.seats.length;
  for (let step = 1; step <= n; step++) {
    const i = (index + step) % n;
    if (isAlive(state, state.seats[i] as string)) return i;
  }
  return -1;
}

/** R5 / R16: who the next Presidential candidate will be (D9's "Next" marker). */
export function nextPresident(state: State): { id: string | null; pointer: number } {
  if (state.special !== null && isAlive(state, state.special))
    return { id: state.special, pointer: state.presPointer };
  const i = nextAliveIndex(state, state.presPointer);
  return { id: i < 0 ? null : (state.seats[i] as string), pointer: i < 0 ? state.presPointer : i };
}

/** Valid targets for a power (R15, R16, R18); peek has none. */
export function powerTargets(state: State, kind: PowerKind): string[] {
  const others = state.alive.filter((id) => id !== state.round.president);
  if (kind === 'investigate') return others.filter((id) => !state.investigated.includes(id));
  if (kind === 'peek') return [];
  return others;
}

/** R4 / D8: the side a policy count has already won for, if any. */
export function policyWinner(board: { L: number; F: number }): 'liberals' | 'fascists' | null {
  if (board.L >= 5) return 'liberals';
  if (board.F >= 6) return 'fascists';
  return null;
}

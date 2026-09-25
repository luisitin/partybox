// Teams, roles and spymasters (SPEC §9.6, §9.21). Team arrays keep join order, so "the most recent
// joiners" are the tail; seat order (`state.seats`) decides rotation and replacements.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { teamsFromSeed } from '@partybox/game-sdk';
import type { State, Team } from './types';
import { TEAMS } from './types';

export type Role = 'spymaster' | 'guesser' | 'other' | 'spectator';

export const otherTeam = (t: Team): Team => (t === 'sun' ? 'moon' : 'sun');

export function teamOf(state: State, id: string): Team | null {
  if (state.teams.sun.includes(id)) return 'sun';
  if (state.teams.moon.includes(id)) return 'moon';
  return null;
}

/** The player's role right now: the active team guesses, the other team watches. */
export function roleOf(state: State, id: string): Role {
  const team = teamOf(state, id);
  if (!team || !Object.hasOwn(state.players, id)) return 'spectator';
  if (state.spymaster[team] === id) return 'spymaster';
  return team === state.turn.team ? 'guesser' : 'other';
}

const isBot = (state: State, id: string): boolean => state.players[id]?.bot === true;
const isIn = (state: State, id: string): boolean => !state.left.includes(id);

/** Guessers who count toward a majority: on the team, not its spymaster, connected, not gone. */
export function activeGuessers(state: State, team: Team): string[] {
  return state.teams[team].filter(
    (id) =>
      id !== state.spymaster[team] && state.players[id]?.connected === true && isIn(state, id),
  );
}

/** Seat order inside a team, people first (rotation and replacements). */
function seatOrder(state: State, team: Team): string[] {
  const members = state.seats.filter((id) => state.teams[team].includes(id) && isIn(state, id));
  return [
    ...members.filter((id) => !isBot(state, id)),
    ...members.filter((id) => isBot(state, id)),
  ];
}

export function initialTeams(state: State, rng: RngState): [Record<Team, string[]>, RngState] {
  const players = state.seats.map((id) => state.players[id]).filter((p) => p !== undefined);
  if (state.mode === 'coop') return [{ sun: [...state.seats], moon: [] }, rng];
  const [dealt, next] = teamsFromSeed(players, rng);
  return [{ sun: dealt.sun, moon: dealt.moon }, next];
}

export function join(state: State, id: string, team: Team): State {
  if (state.teams[team].includes(id)) return state;
  const from = otherTeam(team);
  return {
    ...state,
    teams: {
      ...state.teams,
      [from]: state.teams[from].filter((x) => x !== id),
      [team]: [...state.teams[team], id],
    } as Record<Team, string[]>,
  };
}

/** Rule 1: sizes within one — the bigger team's latest BOTS cross over first, so a person keeps the
 *  team they tapped; only a team of people alone gives up its latest joiner. */
function balance(state: State): Record<Team, string[]> {
  const out = { sun: [...state.teams.sun], moon: [...state.teams.moon] };
  for (;;) {
    const [big, small]: [Team, Team] =
      out.sun.length > out.moon.length ? ['sun', 'moon'] : ['moon', 'sun'];
    if (out[big].length - out[small].length <= 1) return out;
    const bots = out[big].filter((id) => isBot(state, id));
    const moved = bots.length > 0 ? bots[bots.length - 1] : out[big][out[big].length - 1];
    if (moved === undefined) return out;
    out[big] = out[big].filter((id) => id !== moved);
    out[small].push(moved);
  }
}

/** Rule 3: a volunteer (rng among several), else a random person, else a bot. */
function chooseSpymaster(state: State, team: Team, rng: RngState): [string | null, RngState] {
  const members = state.teams[team].filter((id) => isIn(state, id));
  const volunteers = members.filter((id) => state.volunteers.includes(id));
  const people = members.filter((id) => !isBot(state, id));
  const from = volunteers.length > 0 ? volunteers : people.length > 0 ? people : members;
  if (from.length === 0) return [null, rng];
  const [order, next] = shuffle(rng, from);
  return [order[0] ?? null, next];
}

/** When `teams` ends (or is skipped): balance, then a spymaster per team. */
export function settleTeams(state: State): State {
  const teams = state.mode === 'coop' ? state.teams : balance(state);
  let rng = state.rng;
  const spymaster: Record<Team, string | null> = { sun: null, moon: null };
  const settled: State = { ...state, teams };
  for (const team of TEAMS) {
    if (settled.teams[team].length === 0) continue;
    const [id, next] = chooseSpymaster(settled, team, rng);
    spymaster[team] = id;
    rng = next;
  }
  return { ...settled, spymaster, rng };
}

/** Later rounds: each team's spymaster passes to the next member in seat order, people first. */
export function rotateSpymasters(state: State): State {
  const spymaster = { ...state.spymaster };
  for (const team of TEAMS) {
    const order = seatOrder(state, team);
    if (order.length === 0) continue;
    const at = order.indexOf(state.spymaster[team] ?? '');
    spymaster[team] = order[(at + 1) % order.length] ?? null;
  }
  return { ...state, spymaster };
}

/** §9.21: a spymaster who left is replaced at their team's next clue, by rule, never by a player. */
export function replaceIfGone(state: State, team: Team): [State, string | null] {
  const current = state.spymaster[team];
  if (current !== null && isIn(state, current)) return [state, null];
  const next = seatOrder(state, team)[0] ?? null;
  if (next === null) return [state, null];
  return [{ ...state, spymaster: { ...state.spymaster, [team]: next } }, next];
}

/** Forfeit (§9.9): everyone on the team but its spymaster has LEFT (not merely dropped). */
export function forfeited(state: State, team: Team): boolean {
  const rest = state.teams[team].filter((id) => id !== state.spymaster[team]);
  return rest.length > 0 && rest.every((id) => !isIn(state, id));
}

// Who plays each turn: the psychic draw (a bag per side, so everyone gets a turn before anyone
// goes twice), the guessers and callers, and when the game is over. Pure.
import { nextInt, shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import type { State, TeamId, Turn } from './types';

export function otherTeam(team: TeamId): TeamId {
  return team === 'sun' ? 'moon' : 'sun';
}

export function teamOf(state: State, playerId: string): TeamId | null {
  if (!state.teams) return null;
  if (state.teams.sun.includes(playerId)) return 'sun';
  if (state.teams.moon.includes(playerId)) return 'moon';
  return null;
}

/** Seats still in the game (a player who left for good is out of every draw). */
function present(state: State, ids: readonly string[]): string[] {
  return ids.filter((id) => !state.left.includes(id) && Object.hasOwn(state.players, id));
}

function connected(state: State, id: string): boolean {
  return state.players[id]?.connected === true;
}

/** Everyone who dials this turn: the other players (solo, co-op) or the psychic's teammates. */
export function guessersOf(state: State): string[] {
  const { turn } = state;
  const pool = turn.team && state.teams ? state.teams[turn.team] : state.seats;
  return present(state, pool).filter((id) => id !== turn.psychic);
}

/** Teams: the side that calls LEFT / RIGHT on the needle. */
export function callersOf(state: State): string[] {
  const { turn } = state;
  if (!turn.team || !state.teams) return [];
  return present(state, state.teams[otherTeam(turn.team)]);
}

export function connectedGuessers(state: State): string[] {
  return guessersOf(state).filter((id) => connected(state, id));
}

/** Draws the next psychic from `bag` (connected players first, never the last psychic twice in a
 *  row when anyone else can go); refills from `members` when the bag runs dry. */
function drawPsychic(
  state: State,
  bag: readonly string[],
  members: readonly string[],
  rng: RngState,
): [string, string[], RngState] {
  let queue = present(state, bag);
  let next = rng;
  if (queue.length === 0 || !queue.some((id) => connected(state, id))) {
    const refill = present(state, members);
    const [shuffled, after] = shuffle(next, refill);
    next = after;
    const last = state.turn.psychic;
    if (shuffled.length > 1 && shuffled[0] === last) shuffled.push(shuffled.shift() as string);
    queue = [...queue.filter((id) => !shuffled.includes(id)), ...shuffled];
  }
  const index = Math.max(
    0,
    queue.findIndex((id) => connected(state, id)),
  );
  const psychic = queue[index] ?? '';
  return [psychic, queue.filter((_, i) => i !== index), next];
}

function blankTurn(n: number, psychic: string, team: TeamId | null, target: number): Turn {
  return {
    n,
    psychic,
    team,
    catchUp: false,
    spectrum: n - 1,
    target,
    clue: null,
    clueAt: null,
    clueDeadline: null,
    rejected: null,
    dials: {},
    locked: [],
    needle: null,
    calls: {},
    points: {},
    teamPoints: { sun: 0, moon: 0 },
    void: false,
    step: 0,
  };
}

/** The next turn: psychic, spectrum and the secret target. `catchUp` keeps the same team. */
export function planTurn(state: State, catchUp: boolean): State {
  const n = state.turn.n + 1;
  const team: TeamId | null = state.mode === 'teams' ? state.nextTeam : null;
  const bagKey = team ?? 'all';
  const members = team && state.teams ? state.teams[team] : state.seats;
  const [psychic, bag, afterDraw] = drawPsychic(
    state,
    state.psychicBag[bagKey],
    members,
    state.rng,
  );
  const [target, rng] = nextInt(afterDraw, 0, 100);
  const turn = { ...blankTurn(n, psychic, team, target), catchUp };
  const scores = { ...state.scores };
  return {
    ...state,
    rng,
    turn,
    psychicBag: { ...state.psychicBag, [bagKey]: bag },
    turnStartScores: scores,
  };
}

/** The first turn's placeholder (turn 0) that `planTurn` counts on from. */
export function turnZero(): Turn {
  return blankTurn(0, '', null, 50);
}

/** How many turns the game can run: solo and co-op rounds, or teams' cap. */
export function plannedTurns(state: Pick<State, 'mode' | 'cfg'>): number {
  return state.mode === 'teams' ? state.cfg.maxTurns : state.cfg.rounds;
}

/** True once the finished turn was the last: rounds run out, or (teams) a team reached the
 *  target at the end of a turn, or the turn cap is hit. */
export function isOver(state: State): boolean {
  if (state.turn.n >= plannedTurns(state)) return true;
  if (state.mode !== 'teams') return false;
  return Math.max(state.team.sun, state.team.moon) >= state.cfg.targetScore;
}

/** Spec §5.7 catch-up: the team hit the bullseye (4) and is still behind after the scores. */
export function earnsCatchUp(state: State): boolean {
  const { turn } = state;
  if (state.mode !== 'teams' || !turn.team || turn.void) return false;
  return (
    turn.teamPoints[turn.team] === 4 && state.team[turn.team] < state.team[otherTeam(turn.team)]
  );
}

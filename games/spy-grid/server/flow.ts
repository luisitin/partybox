// The phase order (SPEC §9.4): teams → clue → guess ⇄ flip → turnEnd → clue … → win → next round
// or done. `advance` is what a deadline does and what a VIP skip does; the phase files leave their
// decision on `state.turn` and this file routes it.
import { dealKey, drawBoard } from './board';
import { enterClue } from './phases/clue';
import { enterDone, enterTurnEnd, enterWin } from './phases/end';
import { enterFlip, showFlip } from './phases/flip';
import { enterGuess } from './phases/guess';
import { capWinner, freshTurn, outcome } from './round';
import { forfeited, otherTeam, replaceIfGone, rotateSpymasters, settleTeams } from './teams';
import { nextFloat } from '@partybox/game-sdk';
import { IDLE_DRAW_TURNS, TEAMS } from './types';
import type { State, Team } from './types';

/** A new board, a new key, the starting team's first clue. */
export function startRound(state: State, now: number): State {
  let rng = state.rng;
  let starter: Team = 'sun';
  if (state.mode === 'teams') {
    const [f, r] = nextFloat(rng);
    starter = f < 0.5 ? 'sun' : 'moon';
    rng = r;
  }
  const drawn = drawBoard(rng, state.settings.spicy, state.usedThemes);
  const [key, r2] = dealKey(drawn.rng, state.mode, starter, state.settings.assassins);
  const fresh: State = {
    ...state,
    rng: r2,
    round: state.round + 1,
    starter,
    board: drawn.board,
    key,
    flipped: key.map(() => 0 as const),
    usedThemes: [...state.usedThemes, ...drawn.themes],
    idleTurns: 0,
    winner: null,
    reason: null,
    coop: state.mode === 'coop' ? { cluesLeft: state.settings.coopTurns } : null,
    turn: freshTurn(starter, 0, null),
  };
  return beginTurn(fresh, starter, now);
}

const IN_ROUND = new Set(['clue', 'guess', 'flip', 'turn-end']);

/** §9.9 forfeit: a team whose members have all left but its spymaster loses the round at once. */
export function checkForfeit(state: State, now: number): State | null {
  if (state.mode !== 'teams' || !IN_ROUND.has(state.phase.id)) return null;
  for (const t of TEAMS)
    if (forfeited(state, t)) return enterWin(state, now, otherTeam(t), 'forfeit');
  return null;
}

/** A turn starts — unless the round has already ended by forfeit, cap, idleness or clues. */
export function beginTurn(state: State, team: Team, now: number): State {
  for (const t of TEAMS)
    if (state.mode === 'teams' && forfeited(state, t))
      return enterWin(state, now, otherTeam(t), 'forfeit');
  if (state.idleTurns >= IDLE_DRAW_TURNS)
    return enterWin(state, now, state.mode === 'coop' ? null : 'draw', 'idle');
  if (state.coop && state.coop.cluesLeft <= 0) return enterWin(state, now, null, 'clues');
  if (state.mode === 'teams' && state.turn.n >= state.settings.maxTurns)
    return enterWin(state, now, capWinner(state), 'cap');
  const [replaced, newSpymaster] = replaceIfGone(state, team);
  const turn = { ...freshTurn(team, state.turn.n + 1, replaced.spymaster[team]), newSpymaster };
  return enterClue({ ...replaced, turn }, now);
}

function afterFlip(state: State, now: number): State {
  const shown = showFlip(state);
  const flip = shown.turn.flip;
  if (!flip) return enterTurnEnd(shown, now);
  const result = outcome(shown, flip.kind);
  if (result) return enterWin(shown, now, result.winner, result.reason);
  if (flip.kind === shown.turn.team)
    return shown.turn.left > 0
      ? enterGuess(shown, now)
      : enterTurnEnd({ ...shown, turn: { ...shown.turn, ended: 'outOfGuesses' } }, now);
  return enterTurnEnd({ ...shown, turn: { ...shown.turn, ended: 'flip' } }, now);
}

export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'teams':
      return startRound(settleTeams(state), now);
    case 'clue':
      if (state.turn.clue) return enterGuess(state, now);
      return enterTurnEnd(
        {
          ...state,
          idleTurns: state.idleTurns + 1,
          coop: state.coop ? { cluesLeft: Math.max(0, state.coop.cluesLeft - 1) } : null,
          turn: { ...state.turn, ended: 'noClue' },
        },
        now,
      );
    case 'guess':
      if (state.turn.flip) return enterFlip(state, now);
      return enterTurnEnd(
        { ...state, turn: { ...state.turn, ended: state.turn.ended ?? 'stop' } },
        now,
      );
    case 'flip':
      return afterFlip(state, now);
    case 'turn-end': {
      const team = state.mode === 'coop' ? state.turn.team : otherTeam(state.turn.team);
      return beginTurn(state, team, now);
    }
    case 'win':
      return state.round < state.settings.rounds
        ? startRound(rotateSpymasters(state), now)
        : enterDone(state, now);
    default:
      return state;
  }
}

/** VIP end: straight to done (results stay honest: rounds already won count). */
export function end(state: State, now: number): State {
  return enterDone(state, now);
}

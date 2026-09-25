// GameRunner: the bridge between a room and a pure GameDefinition. Starts games, feeds them events
// (catching anything a buggy reducer throws), detects the end, and turns deadlines into ticks.
import { avatarIdOf } from './avatar';
import type { GameEvent, GameStateBase, PlayerInfo, Settings } from '@partybox/shared';
import { LIMITS } from '@partybox/shared';
import type { GameResults } from '@partybox/shared';
import { canSeeTv, gamePresence } from './presence';
import type { ApplyResult, Effect, EngineDeps, RoomState, RunningGame, TonightGame } from './types';

export function playerInfos(room: RoomState): PlayerInfo[] {
  return Object.values(room.players)
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatarId: avatarIdOf(p),
      connected: p.connected,
      ...(p.bot ? { bot: true } : {}),
      canSeeTv: canSeeTv(p), // ADR-047: fixed for the game (bots always can)
    }));
}

/** Everyone in the room plays the next game; spectators are promoted. */
export function startGame(
  room: RoomState,
  gameId: string,
  settings: Settings,
  seed: number,
  now: number,
  deps: EngineDeps,
): ApplyResult {
  const game = deps.games[gameId];
  if (!game)
    return { room, effects: [{ type: 'log', level: 'error', text: `unknown game ${gameId}` }] };
  const players: Record<string, RoomState['players'][string]> = {};
  for (const p of Object.values(room.players)) players[p.id] = { ...p, spectator: false };
  const base = { ...room, players };
  let state: GameStateBase;
  try {
    state = game.init({ players: playerInfos(base), settings, seed, now, presence: gamePresence(base) }); // prettier-ignore
  } catch (err) {
    return {
      room,
      effects: [{ type: 'log', level: 'error', text: `init(${gameId}) threw: ${String(err)}` }],
    };
  }
  const running: RunningGame = { gameId, seed, settings, state, startedAt: now, firedTimer: null };
  return {
    room: {
      ...base,
      status: 'playing',
      selectedGameId: gameId,
      settings,
      game: running,
      results: null,
      lastGame: { gameId, settings },
      votes: {}, // I-650: a new game, a new vote
    },
    effects: [{ type: 'push' }],
  };
}

/** Applies one game event; a throwing reducer leaves state unchanged and logs (contract rule 1). */
export function applyGameEvent(
  room: RoomState,
  event: GameEvent<unknown>,
  deps: EngineDeps,
): ApplyResult {
  const running = room.game;
  if (!running || room.status !== 'playing') return { room, effects: [] };
  const game = deps.games[running.gameId];
  if (!game) return { room, effects: [] };
  const effects: Effect[] = [];
  let state = running.state;
  try {
    state = game.reduce(running.state, event);
  } catch (err) {
    effects.push({
      type: 'log',
      level: 'error',
      text: `reduce(${running.gameId}, ${event.type}) threw: ${String(err)}`,
    });
    return { room, effects };
  }
  const next: RoomState = { ...room, game: { ...running, state } };
  return finishIfOver(next, deps, effects, event.now);
}

/** Moves the room to `results` when the game reports it is over. */
export function finishIfOver(
  room: RoomState,
  deps: EngineDeps,
  effects: Effect[],
  now = 0,
): ApplyResult {
  const running = room.game;
  const game = running ? deps.games[running.gameId] : undefined;
  if (!running || !game) return { room, effects };
  let results = null;
  try {
    results = game.results(running.state);
  } catch (err) {
    effects.push({ type: 'log', level: 'error', text: `results() threw: ${String(err)}` });
  }
  if (!results) return { room, effects: [...effects, { type: 'push' }] };
  return {
    room: {
      ...room,
      status: 'results',
      game: null,
      results: {
        gameId: running.gameId,
        results,
        players: Object.values(running.state.players),
      },
      // I-652 B: the night's list (a gap over 3 hours starts a new night; the last 6 kept)
      tonight: [
        ...(room.tonight ?? []).filter((g) => now - g.endedAt < NIGHT_GAP_MS),
        tonightEntry(running.gameId, results, running.state.players, now),
      ].slice(-6),
    },
    effects: [...effects, { type: 'push' }],
  };
}

/** Ends a game the VIP abandoned; no scoreboard when the game produced no results. */
export function abortGame(room: RoomState): ApplyResult {
  if (!room.game) return { room, effects: [] };
  return {
    room: { ...room, status: 'lobby', game: null, results: null },
    effects: [
      { type: 'push' },
      { type: 'toast', to: 'all', kind: 'info', text: 'The game was ended.' },
    ],
  };
}

function deadlineDue(running: RunningGame, now: number): boolean {
  const { phase } = running.state;
  if (phase.deadline === null || phase.paused) return false;
  if (running.firedTimer?.phaseId === phase.id && running.firedTimer.startedAt === phase.startedAt)
    return false;
  return now >= phase.deadline;
}

/**
 * Fires the phase timer when its deadline has passed — once per phase instance, with one
 * exception (ADR-033): a reducer that answers the timer by staying in the phase and moving its
 * deadline later has armed a new one, and that fires too. Ignoring the timer, or a pause that
 * shifts the deadline, does not re-arm.
 */
export function fireDueTimer(room: RoomState, now: number, deps: EngineDeps): ApplyResult {
  const running = room.game;
  if (!running || room.status !== 'playing' || !deadlineDue(running, now))
    return { room, effects: [] };
  const { phase } = running.state;
  const armed: RoomState = {
    ...room,
    game: { ...running, firedTimer: { phaseId: phase.id, startedAt: phase.startedAt } },
  };
  const result = applyGameEvent(
    armed,
    { type: 'timer', now, phaseId: phase.id, startedAt: phase.startedAt },
    deps,
  );
  const after = result.room.game;
  const rearmed =
    after !== null &&
    after.state.phase.id === phase.id &&
    after.state.phase.startedAt === phase.startedAt &&
    after.state.phase.deadline !== null &&
    phase.deadline !== null &&
    after.state.phase.deadline > phase.deadline;
  return rearmed
    ? { ...result, room: { ...result.room, game: { ...after, firedTimer: null } } }
    : result;
}

/** When the host should next send a `tick`, or null when nothing is pending. */
/** ADR-053: the start stage's 3·2·1, a second each (start-stage.ts; here for nextWakeAt). */
export const STAGE_COUNT_MS = 3000;

export function nextWakeAt(room: RoomState): number | null {
  const candidates: number[] = [];
  const running = room.game;
  if (running && room.status === 'playing') {
    const { phase } = running.state;
    const fired =
      running.firedTimer?.phaseId === phase.id && running.firedTimer.startedAt === phase.startedAt;
    if (phase.deadline !== null && !phase.paused && !fired) candidates.push(phase.deadline);
  }
  for (const p of Object.values(room.players)) {
    if (p.disconnectedAt === null) continue;
    candidates.push(p.disconnectedAt + LIMITS.disconnectGraceMs);
    // I-746 A: the handover deadline only while someone could take over — with nobody connected it
    // stayed in the past and the host's timer re-fired at once, over and over (a busy loop).
    // I-347 B: and the handover happens only during a game, so it is only scheduled then.
    const canHandOver = Object.values(room.players).some(
      (o) => o.connected && o.id !== p.id && !o.bot,
    );
    if (p.isVip && canHandOver && room.status === 'playing')
      candidates.push(p.disconnectedAt + LIMITS.vipHandoverMs);
  }
  // ADR-053: the start stage's 3·2·1 ends
  const staged = room.starting?.countdownAt;
  if (staged !== null && staged !== undefined) candidates.push(staged + STAGE_COUNT_MS);
  // I-746 C: an empty room ends 5 minutes after the last phone dropped
  if (room.asleepSince !== undefined && room.status === 'playing')
    candidates.push(room.asleepSince + ASLEEP_END_MS);
  return candidates.length === 0 ? null : Math.min(...candidates);
}

/** I-746 C: how long a room with every phone asleep waits before it ends the game. */
export const ASLEEP_END_MS = 5 * 60_000;
/** I-652 B: games more than this far apart belong to different nights. */
export const NIGHT_GAP_MS = 3 * 60 * 60_000;

/** I-652 B: one finished game for tonight's list — its human winners, or that bots won it. */
function tonightEntry(
  gameId: string,
  results: GameResults,
  players: Readonly<Record<string, PlayerInfo>>,
  now: number,
): TonightGame {
  // a game where nobody scored has no winner (the Last-up line's rule), not a tie of everyone
  const won = results.winnerIds
    .filter((id) => (results.scores[id] ?? 0) > 0)
    .map((id) => players[id])
    .filter((p): p is PlayerInfo => p !== undefined);
  const people = won.filter((p) => !p.bot);
  return {
    gameId,
    endedAt: now,
    winners: people.map((p) => ({ name: p.name, avatarId: p.avatarId })),
    botsWon: won.length > 0 && people.length === 0,
  };
}

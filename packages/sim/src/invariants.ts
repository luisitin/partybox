// Invariants checked after EVERY event of a simulated game. Each returns a list of violations
// (empty = fine). Keep them cheap: they run thousands of times per `pnpm sim`.
import type { AnyGameDefinition, GameEvent, GameStateBase } from '@partybox/shared';
import { STATE_SIZE_LIMIT_BYTES } from '@partybox/shared';
import { jsonSize } from '@partybox/game-sdk/testing';

const VIEW_SIZE_LIMIT = 64 * 1024;

export interface InvariantContext {
  game: AnyGameDefinition;
  initIds: string[];
  event: GameEvent<unknown>;
  before: GameStateBase;
  after: GameStateBase;
  /** Simulated wall clock when the event was applied. */
  now: number;
}

export function checkState(ctx: InvariantContext): string[] {
  const { game, after, initIds, event, before } = ctx;
  const out: string[] = [];
  if (!after || typeof after !== 'object') return ['reduce returned a non-object'];
  if (!game.phases.includes(after.phase.id)) out.push(`undeclared phase "${after.phase.id}"`);
  if (after.phase.deadline !== null && after.phase.deadline < after.phase.startedAt)
    out.push(
      `deadline ${after.phase.deadline} before startedAt ${after.phase.startedAt} in ${after.phase.id}`,
    );
  if (after.phase.startedAt > event.now)
    out.push(
      `phase ${after.phase.id} startedAt ${after.phase.startedAt} is in the future (now ${event.now})`,
    );
  if (typeof after.rng?.seed !== 'number' || typeof after.rng?.step !== 'number')
    out.push('rng state lost');
  if (after.rng.step < before.rng.step && after.rng.seed === before.rng.seed)
    out.push('rng step went backwards');
  const ids = Object.keys(after.players).sort();
  if (ids.join(',') !== [...initIds].sort().join(','))
    out.push(`players changed: ${ids.join(',')} vs init ${initIds.join(',')}`);
  const size = jsonSize(after);
  if (size > STATE_SIZE_LIMIT_BYTES)
    out.push(`state is ${size} bytes (limit ${STATE_SIZE_LIMIT_BYTES})`);
  try {
    JSON.parse(JSON.stringify(after));
  } catch (err) {
    out.push(`state is not JSON: ${String(err)}`);
  }
  return out;
}

export function checkViews(game: AnyGameDefinition, state: GameStateBase): string[] {
  const out: string[] = [];
  try {
    const tv = game.tvView(state);
    if (tv.phaseId !== state.phase.id)
      out.push(`tvView phaseId "${tv.phaseId}" != state "${state.phase.id}"`);
    if (jsonSize(tv) > VIEW_SIZE_LIMIT) out.push('tvView over 64 KB');
  } catch (err) {
    out.push(`tvView threw: ${String(err)}`);
  }
  for (const id of [...Object.keys(state.players), 'spectator-x']) {
    try {
      const cv = game.controllerView(state, id);
      if (cv.me?.id !== id) out.push(`controllerView(${id}).me.id is ${String(cv.me?.id)}`);
      if (jsonSize(cv) > VIEW_SIZE_LIMIT) out.push(`controllerView(${id}) over 64 KB`);
    } catch (err) {
      out.push(`controllerView(${id}) threw: ${String(err)}`);
    }
  }
  return out;
}

export function checkResults(
  game: AnyGameDefinition,
  state: GameStateBase,
  initIds: string[],
): string[] {
  const out: string[] = [];
  let results;
  try {
    results = game.results(state);
  } catch (err) {
    return [`results() threw: ${String(err)}`];
  }
  if (!results) return ['results() is null at the end of the game'];
  for (const id of initIds) {
    const score = results.scores[id];
    if (typeof score !== 'number' || !Number.isFinite(score))
      out.push(`score for ${id} is ${String(score)}`);
  }
  const ranked = results.ranking
    .map((r) => r.playerId)
    .sort()
    .join(',');
  if (ranked !== [...initIds].sort().join(','))
    out.push(`ranking ids ${ranked} != init ${initIds.join(',')}`);
  for (const row of results.ranking)
    if (row.score !== results.scores[row.playerId])
      out.push(`ranking score for ${row.playerId} disagrees with scores`);
  // ADR-052: only a co-op game the players lost may crown nobody.
  const lostCoop = results.outcome?.kind === 'coop' && !results.outcome.won;
  if (results.winnerIds.length === 0 && !lostCoop) out.push('no winner');
  for (const id of results.winnerIds)
    if (results.ranking.find((r) => r.playerId === id)?.rank !== 1)
      out.push(`winner ${id} is not rank 1`);
  for (const award of results.awards)
    if (!initIds.includes(award.playerId))
      out.push(`award ${award.id} references unknown player ${award.playerId}`);
  return out;
}

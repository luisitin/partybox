// What must hold after ANY event, hostile or not: reduce returns a state and never throws, is pure
// (input state untouched, same output twice), keeps the contract invariants, and both views render
// for every id without leaking what the game's contract.config declares hidden.
import type { AnyGameDefinition, GameEvent, GameStateBase } from '@partybox/shared';
import { STATE_SIZE_LIMIT_BYTES } from '@partybox/shared';
import { hashState, jsonSize } from '@partybox/game-sdk/testing';
import type { ContractConfig } from '@partybox/game-sdk/testing';
import { hostileIds } from './values';

const VIEW_SIZE_LIMIT = 64 * 1024;

export interface CheckResult {
  after: GameStateBase;
  failures: string[];
}

/**
 * A hidden string leaks when it appears as a JSON string value in the game-specific part of a view
 * (the envelope is public by definition), or anywhere inside a longer value when it is long enough
 * not to collide with ordinary words.
 */
function leaks(view: unknown, hidden: string[]): string[] {
  const {
    players: _p,
    phaseId: _ph,
    gameId: _g,
    me: _me,
    ...rest
  } = view as Record<string, unknown>;
  const text = JSON.stringify(rest) ?? '';
  return hidden.filter((s) => {
    if (typeof s !== 'string' || s.length < 3) return false;
    const quoted = JSON.stringify(s);
    return text.includes(quoted) || (s.length >= 8 && text.includes(quoted.slice(1, -1)));
  });
}

export function checkViews(
  game: AnyGameDefinition,
  config: ContractConfig,
  state: GameStateBase,
): string[] {
  const out: string[] = [];
  try {
    const tv = game.tvView(state);
    if (tv.phaseId !== state.phase.id)
      out.push(`tvView phaseId ${tv.phaseId} != ${state.phase.id}`);
    if (jsonSize(tv) > VIEW_SIZE_LIMIT) out.push('tvView over 64 KB');
    if (config.hiddenFromTv)
      for (const s of leaks(tv, config.hiddenFromTv(state)))
        out.push(`tvView leaks ${JSON.stringify(s)}`);
  } catch (err) {
    out.push(`tvView threw: ${String(err)}`);
  }
  for (const id of hostileIds(Object.keys(state.players))) {
    try {
      const cv = game.controllerView(state, id);
      if (cv.me?.id !== id) out.push(`controllerView(${JSON.stringify(id)}).me.id is ${cv.me?.id}`);
      const role = Object.hasOwn(state.players, id) ? 'player' : 'spectator';
      if (cv.me?.role !== role) out.push(`controllerView(${id}).me.role is ${cv.me?.role}`);
      if (jsonSize(cv) > VIEW_SIZE_LIMIT) out.push(`controllerView(${id}) over 64 KB`);
      if (config.hiddenFromController)
        for (const s of leaks(cv, config.hiddenFromController(state, id)))
          out.push(`controllerView(${id}) leaks ${JSON.stringify(s)}`);
    } catch (err) {
      out.push(`controllerView(${JSON.stringify(id)}) threw: ${String(err)}`);
    }
  }
  return out;
}

/** Applies one event with every check. `failures` is empty when the game behaved. */
export function checkEvent(
  game: AnyGameDefinition,
  config: ContractConfig,
  before: GameStateBase,
  event: GameEvent<unknown>,
): CheckResult {
  const failures: string[] = [];
  const beforeHash = hashState(before);
  let after: GameStateBase;
  try {
    after = game.reduce(before, event);
  } catch (err) {
    return { after: before, failures: [`reduce threw: ${String(err)}`] };
  }
  if (!after || typeof after !== 'object' || typeof after.phase?.id !== 'string')
    return { after: before, failures: ['reduce returned a non-state'] };
  if (hashState(before) !== beforeHash) failures.push('reduce MUTATED its input state');
  try {
    if (hashState(game.reduce(before, event)) !== hashState(after))
      failures.push('reduce is not pure: same state + event gave a different result');
  } catch (err) {
    failures.push(`reduce threw on the second call: ${String(err)}`);
  }
  if (!game.phases.includes(after.phase.id)) failures.push(`undeclared phase ${after.phase.id}`);
  if (after.phase.deadline !== null && after.phase.deadline < after.phase.startedAt)
    failures.push(`deadline ${after.phase.deadline} before startedAt ${after.phase.startedAt}`);
  if (
    after.phase.deadline !== null &&
    (!Number.isFinite(after.phase.deadline) || !Number.isFinite(after.phase.startedAt))
  )
    failures.push('non-finite deadline/startedAt');
  if (typeof after.rng?.seed !== 'number' || typeof after.rng?.step !== 'number')
    failures.push('rng state lost');
  const ids = Object.keys(after.players).sort().join(',');
  if (ids !== Object.keys(before.players).sort().join(','))
    failures.push(`players changed: ${ids}`);
  try {
    const text = JSON.stringify(after);
    if (text.length > STATE_SIZE_LIMIT_BYTES) failures.push(`state ${text.length} bytes`);
    if (hashState(JSON.parse(text)) !== hashState(after))
      failures.push('state does not survive a JSON round trip (undefined/NaN/Infinity/Date?)');
  } catch (err) {
    failures.push(`state is not JSON: ${String(err)}`);
  }
  failures.push(...checkViews(game, config, after));
  if (after.phase.id !== before.phase.id || after.phase.startedAt !== before.phase.startedAt) {
    // Phase changed: results must still be consistent when the game says it is over.
    try {
      const results = game.results(after);
      if (results)
        for (const id of Object.keys(after.players))
          if (!Number.isFinite(results.scores[id])) failures.push(`score for ${id} not finite`);
    } catch (err) {
      failures.push(`results() threw: ${String(err)}`);
    }
  }
  return { after, failures };
}

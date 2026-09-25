// Runs one whole game headlessly with a simulated clock: per-player reaction times from the
// strategy, exactly one timer per phase instance, chaos events, invariants after every event,
// and a determinism replay at the end. Everything is a pure function of (game, options).
import type {
  AnyGameDefinition,
  GameEvent,
  GamePresence,
  GameStateBase,
  PlayerInfo,
  Settings,
} from '@partybox/shared';
import { PRESENCE_MODES, createRng } from '@partybox/shared';
import { T0, defaultSettingsOf, hashState, makePlayers, replay } from '@partybox/game-sdk/testing';
import { checkResults, checkState, checkViews } from './invariants';
import { assignStrategies, chaosAction, reactionDelay } from './strategies';
import type { PlayerStrategy, Strategy } from './strategies';

export interface RunOptions {
  seed: number;
  players: number;
  strategy: Strategy;
  settings?: Settings;
  maxSimMs?: number;
  maxEvents?: number;
  /** Check views every N events (always on phase changes). */
  viewsEvery?: number;
}

export interface Violation {
  at: number;
  rule: string;
  detail: string;
}

export interface RunInit {
  players: PlayerInfo[];
  settings: Settings;
  seed: number;
  now: number;
  presence?: GamePresence;
}

/**
 * ADR-047: every run plays in a presence of its own, picked by the seed — the three modes × phone
 * only, the last seat remote whenever the room says some are. A game may switch features on it;
 * it must never stall or diverge.
 */
export function presenceForSeed(seed: number): GamePresence {
  return {
    mode: PRESENCE_MODES[seed % PRESENCE_MODES.length] ?? 'together',
    phoneOnly: Math.floor(seed / PRESENCE_MODES.length) % 2 === 1,
  };
}

export interface RunResult {
  gameId: string;
  seed: number;
  players: number;
  strategy: Strategy;
  settings: Settings;
  init: RunInit;
  events: GameEvent<unknown>[];
  violations: Violation[];
  phaseVisits: Record<string, number>;
  simMs: number;
  stuck: boolean;
  finalState: GameStateBase;
  hash: string;
}

interface Agent {
  id: string;
  strategy: PlayerStrategy;
  nextAt: number | null;
  connected: boolean;
  reconnectAt: number | null;
  /** Phase instance the agent last decided about. */
  phaseKey: string | null;
}

const keyOf = (s: GameStateBase): string => `${s.phase.id}:${s.phase.startedAt}`;

export function runGame(game: AnyGameDefinition, options: RunOptions): RunResult {
  const rng = createRng(options.seed);
  const presence = presenceForSeed(options.seed);
  const players = makePlayers(options.players).map((p, i) => ({
    ...p,
    canSeeTv: presence.mode === 'together' || i < options.players - 1,
  }));
  const settings = defaultSettingsOf(game, options.settings);
  const init: RunInit = { players, settings, seed: options.seed, now: T0, presence };
  const initIds = players.map((p) => p.id);
  // A stuck-guard, not a length check: 4× the estimate (an untimed Blanks with a slow seat and a
  // sudden-death round ran 2707 s against the old 3× — 2700 s — without being stuck, 2026-09-23).
  const maxSimMs = options.maxSimMs ?? game.manifest.estimatedMinutes * 4 * 60_000;
  const maxEvents = options.maxEvents ?? 20_000;
  const viewsEvery = options.viewsEvery ?? 25;
  const strategies = assignStrategies(options.strategy, options.players, rng);
  const agents: Agent[] = players.map((p, i) => ({
    id: p.id,
    strategy: strategies[i] as PlayerStrategy,
    nextAt: null,
    connected: true,
    reconnectAt: null,
    phaseKey: null,
  }));
  const events: GameEvent<unknown>[] = [];
  const violations: Violation[] = [];
  const phaseVisits: Record<string, number> = {};
  let state: GameStateBase;
  try {
    state = game.init(init);
  } catch (err) {
    throw new Error(`init threw: ${String(err)}`);
  }
  let now = T0;
  let firedFor: string | null = null;
  let stuck = false;
  const asked = new Set<string>();
  phaseVisits[state.phase.id] = 1;

  const apply = (event: GameEvent<unknown>): void => {
    const before = state;
    let after: GameStateBase;
    try {
      after = game.reduce(before, event);
    } catch (err) {
      violations.push({
        at: events.length,
        rule: 'reduce-throws',
        detail: `${event.type}: ${String(err)}`,
      });
      events.push(event);
      return;
    }
    events.push(event);
    const changedPhase = keyOf(after) !== keyOf(before);
    if (changedPhase) phaseVisits[after.phase.id] = (phaseVisits[after.phase.id] ?? 0) + 1;
    for (const detail of checkState({ game, initIds, event, before, after, now }))
      violations.push({ at: events.length - 1, rule: 'state', detail });
    if (changedPhase || events.length % viewsEvery === 0)
      for (const detail of checkViews(game, after))
        violations.push({ at: events.length - 1, rule: 'views', detail });
    state = after;
    // READER-VOICES (ADR-045): the host answers every reading the game asks for. The sim is a host
    // with no voice installed (as in CI): -1 at once, so the game keeps its own timing — the voiced
    // timing is games' own tests (a voiced 11-player Blanks runs past this budget, as it should).
    for (const req of game.speech?.(state) ?? []) {
      if (asked.has(req.key)) continue;
      asked.add(req.key);
      apply({ type: 'speech', now, key: req.key, ms: -1 });
    }
  };

  const schedule = (agent: Agent): void => {
    agent.phaseKey = keyOf(state);
    if (!agent.connected) {
      agent.nextAt = null;
      return;
    }
    const remaining =
      state.phase.deadline === null
        ? Number.POSITIVE_INFINITY
        : Math.max(0, state.phase.deadline - now);
    const delay = reactionDelay(agent.strategy, rng, remaining);
    agent.nextAt = delay === null ? null : now + delay;
  };

  const actAsPlayer = (agent: Agent): void => {
    if (agent.strategy === 'chaos') {
      const action = chaosAction(rng);
      if (action === 'disconnect' && agent.connected) {
        agent.connected = false;
        agent.reconnectAt = now + rng.int(1000, 12_000);
        apply({ type: 'player', now, playerId: agent.id, connected: false });
        agent.nextAt = null;
        return;
      }
      if (action === 'vip-skip') apply({ type: 'vip', now, action: 'skip' });
      else if (action === 'vip-pause') apply({ type: 'vip', now, action: 'pause' });
      else if (action === 'vip-resume') apply({ type: 'vip', now, action: 'resume' });
      else if (action === 'ghost-input') {
        const sample = game.bot.sampleInput(state, agent.id, rng);
        if (sample !== null)
          apply({ type: 'input', now, playerId: 'ghost-' + agent.id, input: sample });
      } else if (action === 'stale-timer')
        apply({
          type: 'timer',
          now,
          phaseId: state.phase.id,
          startedAt: state.phase.startedAt - 1,
        });
      if (game.results(state) !== null) return;
    }
    let input: unknown = null;
    try {
      input = game.bot.sampleInput(state, agent.id, rng);
    } catch (err) {
      violations.push({ at: events.length, rule: 'bot-throws', detail: String(err) });
    }
    if (input === null) {
      agent.nextAt = null; // nothing to do in this phase instance
      return;
    }
    const parsed = game.inputSchema.safeParse(input);
    if (!parsed.success) {
      violations.push({
        at: events.length,
        rule: 'bot-invalid-input',
        detail: JSON.stringify(input).slice(0, 200),
      });
      agent.nextAt = null;
      return;
    }
    const beforeInput = state;
    apply({ type: 'input', now, playerId: agent.id, input: parsed.data });
    if (agent.strategy === 'chaos' && chaosAction(rng) === 'duplicate-input')
      apply({ type: 'input', now, playerId: agent.id, input: parsed.data });
    // An ignored input (state unchanged) means there is nothing for this player to do now; a
    // phone would not resend it either. Otherwise decide again shortly (multi-input phases).
    if (state === beforeInput) {
      agent.nextAt = null;
      return;
    }
    if (keyOf(state) === agent.phaseKey) {
      const delay = reactionDelay(
        agent.strategy,
        rng,
        state.phase.deadline === null
          ? Number.POSITIVE_INFINITY
          : Math.max(0, state.phase.deadline - now),
      );
      agent.nextAt = delay === null ? null : now + delay;
    }
  };

  while (game.results(state) === null) {
    if (events.length >= maxEvents || now - T0 > maxSimMs) {
      stuck = true;
      violations.push({
        at: events.length,
        rule: 'budget',
        detail: `stopped in ${state.phase.id} after ${events.length} events / ${Math.round((now - T0) / 1000)} s simulated`,
      });
      break;
    }
    const key = keyOf(state);
    for (const agent of agents) if (agent.phaseKey !== key) schedule(agent);

    // Next thing to happen: a reconnect, a player turn, or the deadline.
    let nextAt = Number.POSITIVE_INFINITY;
    for (const agent of agents) {
      if (agent.nextAt !== null) nextAt = Math.min(nextAt, agent.nextAt);
      if (agent.reconnectAt !== null) nextAt = Math.min(nextAt, agent.reconnectAt);
    }
    const { deadline, paused } = state.phase;
    if (paused) {
      // A paused game waits for the VIP; phones cannot do anything useful. Resume shortly.
      now += rng.int(500, 4000);
      apply({ type: 'vip', now, action: 'resume' });
      continue;
    }
    const timerAt = deadline !== null && firedFor !== key ? deadline : Number.POSITIVE_INFINITY;

    if (!Number.isFinite(nextAt) && !Number.isFinite(timerAt)) {
      stuck = true;
      violations.push({
        at: events.length,
        rule: 'stuck',
        detail: `phase ${state.phase.id} has no deadline and nobody can act`,
      });
      break;
    }

    if (timerAt <= nextAt) {
      now = Math.max(now, timerAt);
      firedFor = key;
      apply({ type: 'timer', now, phaseId: state.phase.id, startedAt: state.phase.startedAt });
      // ADR-033: a reducer that stays in the phase with a later deadline has armed a second beat.
      if (
        keyOf(state) === key &&
        state.phase.deadline !== null &&
        deadline !== null &&
        state.phase.deadline > deadline
      )
        firedFor = null;
      continue;
    }

    now = Math.max(now, nextAt);
    for (const agent of agents) {
      if (agent.reconnectAt !== null && agent.reconnectAt <= now) {
        agent.reconnectAt = null;
        agent.connected = true;
        apply({ type: 'player', now, playerId: agent.id, connected: true });
        schedule(agent);
      }
    }
    for (const agent of agents) {
      if (agent.nextAt !== null && agent.nextAt <= now && game.results(state) === null) {
        agent.nextAt = null;
        if (keyOf(state) !== agent.phaseKey) continue; // phase moved on; rescheduled next loop
        actAsPlayer(agent);
      }
    }
  }

  if (!stuck)
    for (const detail of checkResults(game, state, initIds))
      violations.push({ at: events.length, rule: 'results', detail });
  // Determinism: replaying the recorded events must reproduce every intermediate state. Skipped
  // when the reducer already threw (the replay would throw at the same event).
  if (!violations.some((v) => v.rule === 'reduce-throws')) {
    const hashes = replay(game, init, events).map(hashState);
    const again = replay(game, init, events).map(hashState);
    for (let i = 0; i < hashes.length; i++) {
      if (hashes[i] !== again[i]) {
        violations.push({
          at: i,
          rule: 'determinism',
          detail: `state hash differs between two replays at event ${i}`,
        });
        break;
      }
    }
    if (hashes.at(-1) !== hashState(state))
      violations.push({
        at: events.length,
        rule: 'determinism',
        detail: 'live run and replay disagree on the final state',
      });
  }

  return {
    gameId: game.manifest.id,
    seed: options.seed,
    players: options.players,
    strategy: options.strategy,
    settings,
    init,
    events,
    violations,
    phaseVisits,
    simMs: now - T0,
    stuck,
    finalState: state,
    hash: hashState(state),
  };
}

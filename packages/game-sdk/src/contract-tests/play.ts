// A minimal headless runner that drives a GameDefinition the way the engine does: inputs from
// bots, one timer per phase instance, optional VIP skips. Used by the contract suite; the sim
// package builds its richer strategies on top of it.
import type {
  AnyGameDefinition,
  GameEvent,
  GameResults,
  GameStateBase,
  PlayerInfo,
  Settings,
} from '@partybox/shared';
import { AVATAR_IDS, createRng } from '@partybox/shared';

export type PlayStrategy = 'random' | 'fast' | 'idle' | 'skipper';

export interface PlayOptions {
  players: number;
  seed: number;
  strategy: PlayStrategy;
  settings?: Settings;
  /** Simulated wall-clock budget; the run stops (stuck=true) when exceeded. */
  maxSimMs: number;
  /** Hard cap on events, independent of simulated time. */
  maxEvents?: number;
  onEvent?: (event: GameEvent<unknown>, state: GameStateBase) => void;
}

export interface PlayResult {
  init: { players: PlayerInfo[]; settings: Settings; seed: number; now: number };
  events: GameEvent<unknown>[];
  finalState: GameStateBase;
  results: GameResults | null;
  simMs: number;
  stuck: boolean;
  invalidInputs: string[];
}

export const T0 = 1_700_000_000_000;

export function makePlayers(n: number): PlayerInfo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    avatarId: AVATAR_IDS[i % AVATAR_IDS.length] as string,
    connected: true,
  }));
}

export function defaultSettingsOf(game: AnyGameDefinition, overrides: Settings = {}): Settings {
  const out: Settings = {};
  for (const spec of game.manifest.settings) out[spec.key] = spec.default;
  return { ...out, ...overrides };
}

function phaseKey(state: GameStateBase): string {
  return `${state.phase.id}:${state.phase.startedAt}`;
}

export function playGame(game: AnyGameDefinition, options: PlayOptions): PlayResult {
  const rng = createRng(options.seed);
  const players = makePlayers(options.players);
  const settings = defaultSettingsOf(game, options.settings);
  const init = { players, settings, seed: options.seed, now: T0 };
  let state: GameStateBase = game.init(init);
  let now = T0;
  const events: GameEvent<unknown>[] = [];
  const invalidInputs: string[] = [];
  const maxEvents = options.maxEvents ?? 5000;
  let firedFor: string | null = null;
  let stuck = false;

  const apply = (event: GameEvent<unknown>): void => {
    state = game.reduce(state, event);
    events.push(event);
    options.onEvent?.(event, state);
  };

  const fireTimerIfDue = (): boolean => {
    const { deadline } = state.phase;
    if (deadline === null || state.phase.paused || firedFor === phaseKey(state)) return false;
    if (now < deadline) return false;
    firedFor = phaseKey(state);
    apply({ type: 'timer', now, phaseId: state.phase.id, startedAt: state.phase.startedAt });
    return true;
  };

  while (game.results(state) === null) {
    if (events.length >= maxEvents || now - T0 > options.maxSimMs) {
      stuck = true;
      break;
    }
    let acted = false;
    if (options.strategy !== 'idle') {
      for (const player of rng.shuffle(players)) {
        if (game.results(state) !== null) break;
        const before = phaseKey(state);
        const input = game.bot.sampleInput(state, player.id, rng);
        if (input === null) continue;
        const parsed = game.inputSchema.safeParse(input);
        if (!parsed.success) {
          invalidInputs.push(`${state.phase.id}/${player.id}: ${JSON.stringify(input)}`);
          continue;
        }
        const delta = options.strategy === 'fast' ? 100 : rng.int(200, 2500);
        const deadline = state.phase.deadline;
        // Don't step past the deadline with an input; the timer must fire first.
        now =
          deadline !== null && now + delta >= deadline ? Math.max(now, deadline - 1) : now + delta;
        apply({ type: 'input', now, playerId: player.id, input: parsed.data });
        acted = true;
        if (phaseKey(state) !== before) break; // phase moved on; re-sample everyone
      }
    }
    if (game.results(state) !== null) break;
    if (acted) continue;
    // Nobody can act: advance time to the deadline or skip.
    const { deadline } = state.phase;
    if (deadline !== null && !state.phase.paused && firedFor !== phaseKey(state)) {
      now = Math.max(now, deadline);
      fireTimerIfDue();
      continue;
    }
    if (options.strategy === 'skipper') {
      now += 1000;
      apply({ type: 'vip', now, action: 'skip' });
      continue;
    }
    stuck = true;
    break;
  }

  return {
    init,
    events,
    finalState: state,
    results: game.results(state),
    simMs: now - T0,
    stuck,
    invalidInputs,
  };
}

/** Re-applies a recorded event list from the same init; returns every intermediate state. */
export function replay(
  game: AnyGameDefinition,
  init: PlayResult['init'],
  events: GameEvent<unknown>[],
): GameStateBase[] {
  let state: GameStateBase = game.init(init);
  const states: GameStateBase[] = [state];
  for (const event of events) {
    state = game.reduce(state, event);
    states.push(state);
  }
  return states;
}

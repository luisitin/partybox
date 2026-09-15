// A corpus of reachable states: every state the bot runner visits, bucketed by phase, each with
// the (init, events) prefix that reproduces it. Attacks are applied to corpus states so every
// failure is replayable as init + prefix + attack events.
import type { AnyGameDefinition, GameEvent, GameStateBase } from '@partybox/shared';
import { replay } from '@partybox/game-sdk/testing';
import { runGame } from '../runner';
import type { RunInit } from '../runner';
import { STRATEGIES } from '../strategies';

export interface CorpusState {
  state: GameStateBase;
  init: RunInit;
  prefix: GameEvent<unknown>[];
  /** Where the state came from, for failure messages. */
  label: string;
}

export interface CorpusOptions {
  seed: number;
  /** Runs per strategy; player counts walk min..max. */
  runsPerStrategy?: number;
  /** Cap per phase; states are spread evenly over what was collected. */
  perPhase?: number;
}

function spread<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(items[Math.floor((i * items.length) / n)] as T);
  return out;
}

export function buildCorpus(game: AnyGameDefinition, options: CorpusOptions): CorpusState[] {
  const runs = options.runsPerStrategy ?? 3;
  const perPhase = options.perPhase ?? 8;
  const { minPlayers, maxPlayers } = game.manifest;
  const buckets = new Map<string, CorpusState[]>();
  let seed = options.seed;
  for (const strategy of STRATEGIES) {
    for (let r = 0; r < runs; r++) {
      seed += 1;
      const players = minPlayers + ((r + seed) % (maxPlayers - minPlayers + 1));
      const run = runGame(game, { seed, players, strategy });
      if (run.violations.some((v) => v.rule === 'reduce-throws')) continue;
      const states = replay(game, run.init, run.events);
      states.forEach((state, i) => {
        const list = buckets.get(state.phase.id) ?? [];
        list.push({
          state,
          init: run.init,
          prefix: run.events.slice(0, i),
          label: `${strategy} seed ${seed} n=${players} event ${i} (${state.phase.id})`,
        });
        buckets.set(state.phase.id, list);
      });
    }
  }
  const out: CorpusState[] = [];
  for (const phase of game.phases) out.push(...spread(buckets.get(phase) ?? [], perPhase));
  return out;
}

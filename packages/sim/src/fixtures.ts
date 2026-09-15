// `pnpm sim --game <id> --dump-fixtures`: plays one game with random bots and writes the FIRST
// state seen in each phase to games/<id>/fixtures/<phase>.json (overwriting). The idle strategy
// is used as a fallback for phases the bots skipped (e.g. deadline-only phases).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { GameStateBase } from '@partybox/shared';
import type { LoadedGame } from '@partybox/game-sdk/testing';
import { runGame } from './runner';

export function dumpFixtures(loaded: LoadedGame, players: number, seed: number): string[] {
  const seen = new Map<string, GameStateBase>();
  const capture = (strategy: 'random' | 'idle'): void => {
    const run = runGame(loaded.game, { seed, players, strategy, viewsEvery: 1_000_000 });
    let state = loaded.game.init(run.init);
    if (!seen.has(state.phase.id)) seen.set(state.phase.id, state);
    for (const event of run.events) {
      state = loaded.game.reduce(state, event);
      if (!seen.has(state.phase.id)) seen.set(state.phase.id, state);
    }
  };
  capture('random');
  if (loaded.game.phases.some((p) => !seen.has(p))) capture('idle');
  const dir = join(loaded.dir, 'fixtures');
  mkdirSync(dir, { recursive: true });
  const written: string[] = [];
  for (const phase of loaded.game.phases) {
    const state = seen.get(phase);
    if (!state) continue;
    const file = join(dir, `${phase}.json`);
    writeFileSync(file, JSON.stringify(state, null, 2) + '\n');
    written.push(file);
  }
  return written;
}

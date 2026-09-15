// The game contract suite (docs/GAME_CONTRACT.md "Rules"), run against EVERY folder in games/.
// Game-agnostic on purpose: it only knows GameDefinition, the fixture convention, content/schema.ts
// `packs` and the optional __tests__/contract.config.ts.
import { describe, expect, it } from 'vitest';
import type { GameStateBase } from '@partybox/shared';
import { STATE_SIZE_LIMIT_BYTES, gameManifestSchema } from '@partybox/shared';
import { fuzzOnce } from './fuzz';
import { hashState, jsonSize } from './hash';
import { loadAllGames } from './load';
import type { LoadedGame } from './load';
import { defaultSettingsOf, makePlayers, playGame, replay, T0 } from './play';
import type { PlayStrategy } from './play';

const games = await loadAllGames();
const VIEW_SIZE_LIMIT = 64 * 1024;
const FORBIDDEN_SOURCE = [
  /\bDate\.now\s*\(/,
  /\bnew\s+Date\s*\(/,
  /\bMath\.random\s*\(/,
  /\bset(Timeout|Interval|Immediate)\s*\(/,
  /\bfetch\s*\(/,
  /\brequire\s*\(/,
  /from\s+['"](node:|fs|path|os|crypto|child_process)/,
  /\bawait\b/,
];

function playerCounts(game: LoadedGame): number[] {
  const { minPlayers, maxPlayers } = game.game.manifest;
  const mid = Math.floor((minPlayers + maxPlayers) / 2);
  return [...new Set([minPlayers, mid, maxPlayers])];
}

function expectEnvelope(view: unknown, gameId: string, state: GameStateBase): void {
  expect(view).toBeTypeOf('object');
  const v = view as Record<string, unknown>;
  expect(v['gameId']).toBe(gameId);
  expect(v['phaseId']).toBe(state.phase.id);
  expect(v['deadline'] === null || typeof v['deadline'] === 'number').toBe(true);
  expect(typeof v['paused']).toBe('boolean');
  expect(Array.isArray(v['players'])).toBe(true);
  for (const p of v['players'] as Record<string, unknown>[]) {
    expect(typeof p['id']).toBe('string');
    expect(typeof p['name']).toBe('string');
    expect(['active', 'submitted', 'waiting', 'spectator']).toContain(p['status']);
  }
  expect(jsonSize(view)).toBeLessThanOrEqual(VIEW_SIZE_LIMIT);
  expect(JSON.parse(JSON.stringify(view))).toEqual(view);
}

function expectNoLeak(view: unknown, hidden: string[], where: string): void {
  // The envelope's players[] (names, avatar ids) is public by definition and may coincide with
  // a secret ("penguin" is an avatar AND a word) — only the game-specific part is inspected.
  const { players: _players, ...rest } = view as { players?: unknown };
  const text = JSON.stringify(rest);
  for (const secret of hidden) {
    if (typeof secret !== 'string' || secret.length < 3) continue;
    expect(text, `${where} leaks "${secret}"`).not.toContain(JSON.stringify(secret).slice(1, -1));
  }
}

function checkViews(loaded: LoadedGame, state: GameStateBase, where: string): void {
  const { game, config } = loaded;
  const ids = [...Object.keys(state.players), 'spectator-x', 'ghost', ''];
  const tv = game.tvView(state);
  expectEnvelope(tv, game.manifest.id, state);
  if (config.hiddenFromTv) expectNoLeak(tv, config.hiddenFromTv(state), `${where} tvView`);
  for (const id of ids) {
    const cv = game.controllerView(state, id);
    expectEnvelope(cv, game.manifest.id, state);
    expect(cv.me.id).toBe(id);
    expect(cv.me.role).toBe(state.players[id] ? 'player' : 'spectator');
    if (config.hiddenFromController)
      expectNoLeak(cv, config.hiddenFromController(state, id), `${where} controllerView(${id})`);
  }
}

function checkResults(loaded: LoadedGame, state: GameStateBase, initIds: string[]): void {
  const results = loaded.game.results(state);
  expect(results).not.toBeNull();
  if (!results) return;
  for (const id of initIds) {
    expect(results.scores, `score for ${id}`).toHaveProperty(id);
    expect(Number.isFinite(results.scores[id])).toBe(true);
  }
  expect(results.ranking.map((r) => r.playerId).sort()).toEqual(Object.keys(results.scores).sort());
  for (const row of results.ranking) expect(row.score).toBe(results.scores[row.playerId]);
  expect(results.winnerIds.length).toBeGreaterThan(0);
  for (const id of results.winnerIds)
    expect(results.ranking.find((r) => r.playerId === id)?.rank).toBe(1);
  for (const award of results.awards) expect(initIds).toContain(award.playerId);
}

for (const loaded of games) {
  const { game, id } = loaded;
  const budgetMs = game.manifest.estimatedMinutes * 3 * 60_000;

  describe(`contract: games/${id}`, () => {
    it('manifest is valid, matches manifest.json, phases are declared', () => {
      expect(gameManifestSchema.safeParse(game.manifest).success).toBe(true);
      expect(game.manifest).toEqual(loaded.manifestJson);
      // Folders starting with _ (the template) carry the id without the underscore.
      expect(game.manifest.id).toBe(id.replace(/^_/, ''));
      expect(game.phases.length).toBeGreaterThan(0);
      expect(new Set(game.phases).size).toBe(game.phases.length);
      expect(typeof game.bot?.sampleInput).toBe('function');
    });

    it('server code is pure (no clocks, randomness, timers, I/O, await)', () => {
      for (const { file, text } of loaded.serverSources) {
        const code = text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        for (const pattern of FORBIDDEN_SOURCE)
          expect(code, `${file} matches ${pattern}`).not.toMatch(pattern);
        expect(code, `${file} has module-level let/var`).not.toMatch(/^(let|var)\s/m);
      }
    });

    it('content packs validate against content/schema.ts packs', () => {
      const names = Object.keys(loaded.content);
      for (const name of names) {
        const schema = loaded.packs[name];
        expect(
          schema,
          `content/${name}.json has no entry in content/schema.ts packs`,
        ).toBeDefined();
        const parsed = schema?.safeParse(loaded.content[name]);
        expect(
          parsed?.success,
          `content/${name}.json: ${parsed?.success ? '' : parsed?.error.message}`,
        ).toBe(true);
      }
      for (const name of Object.keys(loaded.packs))
        expect(names, `packs lists ${name} but content/${name}.json is missing`).toContain(name);
    });

    it('has a fixture for every phase that renders both views safely', () => {
      for (const phase of game.phases) {
        const fixture = loaded.fixtures[phase];
        expect(fixture, `fixtures/${phase}.json`).toBeDefined();
        if (!fixture) continue;
        expect(fixture.phase.id).toBe(phase);
        expect(jsonSize(fixture)).toBeLessThanOrEqual(STATE_SIZE_LIMIT_BYTES);
        checkViews(loaded, fixture, `fixtures/${phase}.json`);
        expect(fuzzOnce(game, fixture, 7)).toEqual([]);
      }
    });

    it('init produces a declared phase for min, mid and max players', () => {
      for (const n of playerCounts(loaded)) {
        const state = game.init({
          players: makePlayers(n),
          settings: defaultSettingsOf(game),
          seed: n,
          now: T0,
        });
        expect(game.phases).toContain(state.phase.id);
        expect(Object.keys(state.players)).toHaveLength(n);
        expect(state.rng).toEqual({ seed: expect.any(Number), step: expect.any(Number) });
        expect(JSON.parse(JSON.stringify(state))).toEqual(state);
        expect(game.results(state)).toBeNull();
      }
    });

    const variants = [{}, ...(loaded.config.settingsVariants ?? [])];
    const strategies: PlayStrategy[] = ['random', 'fast', 'idle', 'skipper'];
    for (const strategy of strategies) {
      it(`terminates with ${strategy} bots within ${game.manifest.estimatedMinutes * 3} simulated minutes, results complete`, () => {
        for (const settings of variants) {
          for (const n of playerCounts(loaded)) {
            const seed = n * 31 + strategy.length;
            const visited: GameStateBase[] = [];
            const run = playGame(game, {
              players: n,
              seed,
              strategy,
              settings,
              maxSimMs: budgetMs,
              onEvent: (_e, s) => visited.push(s),
            });
            const label = `${strategy} n=${n} settings=${JSON.stringify(settings)}`;
            expect(run.invalidInputs, `${label}: bot produced schema-invalid input`).toEqual([]);
            expect(
              run.stuck,
              `${label}: stuck in phase ${run.finalState.phase.id} after ${run.events.length} events / ${Math.round(run.simMs / 1000)} s`,
            ).toBe(false);
            expect(run.results, label).not.toBeNull();
            checkResults(
              loaded,
              run.finalState,
              run.init.players.map((p) => p.id),
            );
            for (const s of visited) {
              expect(game.phases, `${label}: undeclared phase ${s.phase.id}`).toContain(s.phase.id);
              expect(jsonSize(s)).toBeLessThanOrEqual(STATE_SIZE_LIMIT_BYTES);
            }
            const step = Math.max(1, Math.floor(visited.length / 12));
            for (let i = 0; i < visited.length; i += step)
              checkViews(loaded, visited[i] as GameStateBase, `${label} event ${i}`);
          }
        }
      });
    }

    it('is deterministic: same seed + same events ⇒ identical state after every event', () => {
      const run = playGame(game, {
        players: playerCounts(loaded)[0] as number,
        seed: 99,
        strategy: 'random',
        maxSimMs: budgetMs,
      });
      const a = replay(game, run.init, run.events).map(hashState);
      const b = replay(game, run.init, run.events).map(hashState);
      expect(a).toEqual(b);
      expect(a.at(-1)).toBe(hashState(run.finalState));
    });

    it('ignores stale timers and survives fuzzed events mid-game', () => {
      const visited: GameStateBase[] = [];
      playGame(game, {
        players: playerCounts(loaded).at(-1) as number,
        seed: 5,
        strategy: 'random',
        maxSimMs: budgetMs,
        onEvent: (_e, s) => visited.push(s),
      });
      const step = Math.max(1, Math.floor(visited.length / 8));
      for (let i = 0; i < visited.length; i += step) {
        const state = visited[i] as GameStateBase;
        const stale = game.reduce(state, {
          type: 'timer',
          now: state.phase.startedAt + 1,
          phaseId: state.phase.id,
          startedAt: state.phase.startedAt - 1,
        });
        expect(stale.phase, `stale timer changed the phase at event ${i}`).toEqual(state.phase);
        expect(fuzzOnce(game, state, i)).toEqual([]);
      }
    });
  });
}

describe('contract suite', () => {
  it('found at least one game folder', () => {
    expect(games.length).toBeGreaterThan(0);
  });
});

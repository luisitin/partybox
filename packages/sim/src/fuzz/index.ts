// `pnpm sim --fuzz` runner: corpus × categories × attacks, every step checked, every failure written
// as a repro (init + prefix + attack events) that `pnpm sim --replay` reproduces.
import type { GameEvent, GameStateBase } from '@partybox/shared';
import { createRng } from '@partybox/shared';
import { hashState } from '@partybox/game-sdk/testing';
import type { LoadedGame } from '@partybox/game-sdk/testing';
import { writeRepro } from '../repro';
import type { RunResult } from '../runner';
import type { Strategy } from '../strategies';
import { attacksFor, CATEGORIES } from './attacks';
import type { Attack, Category } from './attacks';
import { checkEvent } from './checks';
import { buildCorpus } from './corpus';
import type { CorpusState } from './corpus';
import { getAt, paths } from './mutate';
import { HOSTILE_STRINGS } from './values';

const HOSTILE = new Set(HOSTILE_STRINGS);

function leafStrings(value: unknown): string[] {
  return paths(value)
    .map((p) => getAt(value, p))
    .filter((v): v is string => typeof v === 'string');
}

export interface FuzzOptions {
  categories?: Category[];
  seed: number;
  /** Corpus size knobs (see corpus.ts). */
  runsPerStrategy?: number;
  perPhase?: number;
  writeRepros?: boolean;
  reproDir?: string;
}

export interface FuzzFailure {
  category: Category;
  name: string;
  label: string;
  /** Index into the attack's events where the check failed. */
  at: number;
  detail: string;
  repro: string | null;
}

export interface FuzzSummary {
  gameId: string;
  corpus: number;
  /** Attacks applied per category. */
  cases: Record<Category, number>;
  /** Mutated inputs the schema accepted vs rejected (hostile-content + adversarial + schema-shape). */
  schema: { accepted: number; rejected: number; threw: number };
  /** Hostile strings that were accepted AND changed state (informs SPEC findings). */
  acceptedHostile: string[];
  failures: FuzzFailure[];
  /** Slowest attack in ms (perf smell when > 1000). */
  slowest: { name: string; ms: number };
  ms: number;
}

function renamed(state: GameStateBase, name: string): GameStateBase {
  const players: GameStateBase['players'] = {};
  for (const [id, p] of Object.entries(state.players)) players[id] = { ...p, name };
  return { ...state, players };
}

function reproFor(
  loaded: LoadedGame,
  corpus: CorpusState,
  events: GameEvent<unknown>[],
  attack: Attack,
  detail: string,
  finalState: GameStateBase,
  dir: string | undefined,
): string {
  const run: RunResult = {
    gameId: loaded.game.manifest.id,
    seed: corpus.init.seed,
    players: corpus.init.players.length,
    strategy: `fuzz:${attack.category}:${attack.name}` as Strategy,
    settings: corpus.init.settings,
    init: corpus.init,
    events,
    violations: [
      { at: events.length - 1, rule: attack.category, detail: `${attack.name}: ${detail}` },
    ],
    phaseVisits: {},
    simMs: 0,
    stuck: false,
    finalState,
    hash: hashState(finalState),
  };
  return writeRepro(run, dir);
}

export function runFuzz(loaded: LoadedGame, options: FuzzOptions): FuzzSummary {
  const started = Date.now();
  const { game, config } = loaded;
  const categories = options.categories ?? [...CATEGORIES];
  const corpus = buildCorpus(game, {
    seed: options.seed,
    runsPerStrategy: options.runsPerStrategy,
    perPhase: options.perPhase,
  });
  const summary: FuzzSummary = {
    gameId: game.manifest.id,
    corpus: corpus.length,
    cases: { adversarial: 0, 'hostile-content': 0, 'schema-shape': 0, 'chaos-timing': 0 },
    schema: { accepted: 0, rejected: 0, threw: 0 },
    acceptedHostile: [],
    failures: [],
    slowest: { name: '', ms: 0 },
    ms: 0,
  };
  const accepted = new Set<string>();
  let n = 0;
  for (const entry of corpus) {
    for (const category of categories) {
      const rng = createRng(options.seed * 7919 + n);
      n += 1;
      for (const attack of attacksFor(category, game, entry.state, rng)) {
        summary.cases[category] += 1;
        const base =
          attack.rename !== undefined ? renamed(entry.state, attack.rename) : entry.state;
        // Materialise the event list: raw values go through the schema first.
        let events = attack.events;
        if (attack.raw) {
          let parsed: { success: boolean; data?: unknown };
          try {
            parsed = game.inputSchema.safeParse(attack.raw.value);
          } catch (err) {
            summary.schema.threw += 1;
            summary.failures.push({
              category,
              name: attack.name,
              label: entry.label,
              at: 0,
              detail: `inputSchema.safeParse THREW: ${String(err).slice(0, 200)}`,
              repro: null,
            });
            continue;
          }
          if (!parsed.success) {
            summary.schema.rejected += 1;
            continue;
          }
          summary.schema.accepted += 1;
          events = [
            {
              type: 'input',
              now: base.phase.startedAt + 1000,
              playerId: attack.raw.playerId,
              input: parsed.data,
            },
          ];
        } else if (attack.validate) {
          const kept: GameEvent<unknown>[] = [];
          for (const e of events) {
            if (e.type !== 'input') {
              kept.push(e);
              continue;
            }
            const parsed = game.inputSchema.safeParse(e.input);
            if (parsed.success) {
              summary.schema.accepted += 1;
              kept.push({ ...e, input: parsed.data });
            } else summary.schema.rejected += 1;
          }
          events = kept;
          if (events.length === 0) continue;
        }
        if (attack.rename !== undefined && events.length === 0)
          events = [
            {
              type: 'timer',
              now: base.phase.startedAt + 1000,
              phaseId: base.phase.id,
              startedAt: base.phase.startedAt,
            },
          ];
        const t0 = Date.now();
        let state = base;
        const applied: GameEvent<unknown>[] = [];
        for (let i = 0; i < events.length; i++) {
          const event = events[i] as GameEvent<unknown>;
          const before = state;
          const result = checkEvent(game, config, before, event);
          applied.push(event);
          state = result.after;
          if (category === 'hostile-content' && event.type === 'input' && result.after !== before)
            for (const s of leafStrings(event.input)) if (HOSTILE.has(s)) accepted.add(s);
          if (result.failures.length === 0) continue;
          const detail = result.failures.join('; ');
          const repro =
            options.writeRepros === false || attack.rename !== undefined
              ? null
              : reproFor(
                  loaded,
                  entry,
                  [...entry.prefix, ...applied],
                  attack,
                  detail,
                  state,
                  options.reproDir,
                );
          summary.failures.push({
            category,
            name: attack.name,
            label: entry.label,
            at: i,
            detail,
            repro,
          });
          break;
        }
        const ms = Date.now() - t0;
        if (ms > summary.slowest.ms)
          summary.slowest = { name: `${attack.name} @ ${entry.label}`, ms };
      }
    }
  }
  summary.acceptedHostile = [...accepted].slice(0, 40);
  summary.ms = Date.now() - started;
  return summary;
}

export function formatFuzz(s: FuzzSummary): string {
  const total = Object.values(s.cases).reduce((a, b) => a + b, 0);
  const lines = [
    `${s.gameId}: fuzz ${total} attacks on ${s.corpus} states, ${s.failures.length} failures, ${s.ms} ms`,
    `  cases: ${Object.entries(s.cases)
      .map(([c, k]) => `${c}×${k}`)
      .join('  ')}`,
    `  schema: accepted ${s.schema.accepted}, rejected ${s.schema.rejected}, threw ${s.schema.threw}`,
    `  slowest attack: ${s.slowest.ms} ms (${s.slowest.name})`,
  ];
  if (s.acceptedHostile.length > 0)
    lines.push(
      `  hostile strings accepted + applied: ${s.acceptedHostile.map((x) => JSON.stringify(x)).join(' ')}`,
    );
  const seen = new Set<string>();
  for (const f of s.failures) {
    const key = `${f.category}:${f.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`  [${f.category}] ${f.name} @ ${f.label} event ${f.at}: ${f.detail}`);
    if (f.repro) lines.push(`    repro: ${f.repro}`);
    if (seen.size >= 12) {
      lines.push(`  … ${s.failures.length} failures total`);
      break;
    }
  }
  return lines.join('\n');
}

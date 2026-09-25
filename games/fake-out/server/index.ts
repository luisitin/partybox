// Fake-Out — write a fake answer, find the real one. `game` is what the registry imports. Phases
// live under ./phases and are wired by ./flow; views by ./views-*; this file assembles the
// definition: settings, init (draw the questions), the bot and the speech hook.
import { gameManifestSchema, multiselectPicks, seedRng, shuffle } from '@partybox/game-sdk';
import type { GameDefinition, InitContext, Settings as RawSettings } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { sampleInput } from './bot';
import { factPool } from './content';
import { enterIntro, reduce } from './flow';
import { newQuestion } from './phases/question';
import { recap } from './recap';
import { results, ZERO_STATS } from './scoring';
import { speech } from './speech';
import { PHASES, READERS, inputSchema } from './types';
import type { Input, Reader, Settings, State } from './types';
import { tvView } from './views-tv';
import type { FakeOutTvView } from './views-tv';
import { controllerView } from './views-phone';
import type { FakeOutControllerView } from './views-phone';

export type { FakeOutTvView } from './views-tv';
export type { FakeOutControllerView, Moment } from './views-phone';
export type { RevealView, RevealedOption, StandingView } from './views-common';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

/** Clamps a numeric setting to its manifest spec (the engine validates too; init stays total). */
function numberSetting(raw: RawSettings, key: string): number {
  const spec = manifest.settings.find((s) => s.key === key);
  if (!spec || spec.type !== 'number') return 0;
  const value = Number(raw[key] ?? spec.default);
  if (!Number.isFinite(value)) return spec.default;
  return Math.min(spec.max, Math.max(spec.min, Math.round(value)));
}

function boolSetting(raw: RawSettings, key: string, fallback: boolean): boolean {
  const value = raw[key];
  return typeof value === 'boolean' ? value : fallback;
}

export function readSettings(raw: RawSettings): Settings {
  const reader = raw['reader'];
  const categorySpec = manifest.settings.find(
    (s): s is Extract<typeof s, { type: 'multiselect' }> => s.type === 'multiselect',
  );
  return {
    questions: numberSetting(raw, 'questions'),
    lieSeconds: numberSetting(raw, 'lieSeconds'),
    pickSeconds: numberSetting(raw, 'pickSeconds'),
    finalDouble: boolSetting(raw, 'finalDouble', true),
    suggestions: boolSetting(raw, 'suggestions', true),
    likes: boolSetting(raw, 'likes', true),
    categories: multiselectPicks(String(raw['categories'] ?? ''), categorySpec),
    spicy: raw['spicy'] === true,
    reader: READERS.includes(reader as Reader)
      ? (reader as Reader)
      : reader === 'none'
        ? 'none'
        : 'fable',
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const cfg = readSettings(ctx.settings);
  const need = cfg.questions + 2;
  const [drawn, rng] = shuffle(seedRng(ctx.seed), factPool(cfg.spicy, cfg.categories, need));
  const seats = ctx.players.map((p) => p.id);
  const scores: Record<string, number> = {};
  const stats: State['stats'] = {};
  for (const id of seats) {
    scores[id] = 0;
    stats[id] = { ...ZERO_STATS };
  }
  const questions = drawn.slice(0, need);
  const state: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng,
    players,
    cfg,
    seats,
    left: [],
    questions,
    q: newQuestion({ questions, cfg }, 1),
    scores,
    stats,
    offered: {},
    speechMs: {},
    ready: [],
    counting: false,
  };
  return enterIntro(state, ctx.now);
}

export const game: GameDefinition<State, Input, FakeOutTvView, FakeOutControllerView> = {
  recap,
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, manifest.id, playerId),
  results,
  speech,
  bot: { sampleInput: (state, playerId, rng) => sampleInput(state, playerId, rng, manifest.id) },
};

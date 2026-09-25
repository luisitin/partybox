// Wisecrack — prompt → answer → vote. `game` is what the registry imports. Phases live under
// ./phases and are wired by ./flow; views by ./views; this file only assembles the definition.
import { gameManifestSchema, seedRng, shuffle } from '@partybox/game-sdk';
import type { GameDefinition, InitContext, Settings as RawSettings } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { recap } from './recap';
import { FAMILY, promptPool } from './content';
import { reduce } from './flow';
import { enterIntro } from './phases/intro';
import { currentPrompt, hasVoted, promptsFor, answerOf } from './round';
import { results } from './scoring';
import { PHASES, inputSchema } from './types';
import type { Input, Settings, State } from './types';
import { controllerView, tvView } from './views';

export type { WisecrackControllerView, WisecrackTvView } from './views';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

/** Clamps a numeric setting to its manifest spec; the engine already validates, this keeps init total. */
function numberSetting(raw: RawSettings, key: string): number {
  const spec = manifest.settings.find((s) => s.key === key);
  if (!spec || spec.type !== 'number') return 0;
  const value = Number(raw[key] ?? spec.default);
  if (!Number.isFinite(value)) return spec.default;
  return Math.min(spec.max, Math.max(spec.min, Math.round(value)));
}

export function readSettings(raw: RawSettings): Settings {
  return {
    rounds: numberSetting(raw, 'rounds'),
    answerSeconds: numberSetting(raw, 'answerSeconds'),
    spicy: raw['spicy'] === true,
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const settings = readSettings(ctx.settings);
  const [deck, rng] = shuffle(seedRng(ctx.seed), promptPool(settings.spicy));
  const zero: Record<string, number> = {};
  for (const id of Object.keys(players)) zero[id] = 0;
  const base: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng,
    players,
    settings,
    deck,
    round: 0,
    prompts: [],
    promptIndex: 0,
    answers: {},
    votes: {},
    scores: zero,
    roundStartScores: zero,
    stats: { votesReceived: {}, sweeps: {}, fastAnswers: {} },
  };
  return enterIntro(base, ctx.now);
}

export const game: GameDefinition<State, Input> = {
  recap,
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, manifest.id, playerId),
  results,
  // I-546 B: where the game is, for an early end's results
  progress: (state) => ({ at: state.round, total: state.settings.rounds, unit: 'round' }),
  bot: {
    sampleInput(state, playerId, rng) {
      if (!state.players[playerId]) return null;
      if (state.phase.id === 'answer') {
        const pending = promptsFor(state, playerId).filter(
          (p) => answerOf(state, p.id, playerId) === null,
        );
        if (pending.length === 0) return null;
        return {
          type: 'answer',
          promptId: rng.pick(pending).id,
          text: rng.pick(FAMILY.botAnswers),
        };
      }
      if (state.phase.id === 'vote') {
        const prompt = currentPrompt(state);
        if (!prompt || prompt.authors.includes(playerId) || hasVoted(state, prompt.id, playerId))
          return null;
        return { type: 'vote', promptId: prompt.id, slot: rng.int(0, 1) };
      }
      return null;
    },
  },
};

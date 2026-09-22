// Blanks — black card → play white cards → read them out → vote / judge → point. `game` is what
// the registry imports. Phases live under ./phases and are wired by ./flow; views by ./views; this
// file only assembles the definition.
import { gameManifestSchema, seedRng, shuffle } from '@partybox/game-sdk';
import type { GameDefinition, InitContext, Settings as RawSettings } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { botInput } from './bot';
import { orderBlackDeck } from './cards';
import { refillHands } from './deal';
import { blackPool, whitePool } from './content';
import { reduce } from './flow';
import { enterIntro } from './phases/intro';
import { results } from './scoring';
import { DECK_PRESETS, JUDGE_MODES, PHASES, inputSchema } from './types';
import type { DeckPreset, Input, JudgeMode, Settings, State } from './types';
import { controllerView, tvView } from './views';

export type { BlanksControllerView, BlanksTvView, CardView, RevealedCard } from './views';

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

function oneOf<T extends string>(raw: RawSettings, key: string, values: readonly T[]): T {
  const spec = manifest.settings.find((s) => s.key === key);
  const fallback = (spec?.type === 'select' ? spec.default : values[0]) as T;
  const value = raw[key];
  return typeof value === 'string' && (values as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function readSettings(raw: RawSettings): Settings {
  return {
    decks: oneOf<DeckPreset>(raw, 'decks', DECK_PRESETS),
    judge: oneOf<JudgeMode>(raw, 'judge', JUDGE_MODES),
    rounds: numberSetting(raw, 'rounds'),
    answerSeconds: numberSetting(raw, 'answerSeconds'),
    rando: raw['rando'] === true,
    timed: raw['timed'] === true,
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const settings = readSettings(ctx.settings);
  const [blackShuffled, r1] = shuffle(seedRng(ctx.seed), blackPool(settings.decks));
  const blackDeck = orderBlackDeck(blackShuffled);
  const [whiteDeck, rng] = shuffle(r1, whitePool(settings.decks));
  const zero: Record<string, number> = {};
  for (const id of Object.keys(players)) zero[id] = 0;
  const base: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng,
    players,
    settings,
    order: Object.keys(players).sort(),
    blackDeck,
    whiteDeck,
    discard: [],
    hands: {},
    round: 0,
    blackId: null,
    blackChoices: [],
    czarId: null,
    readerId: null,
    submissions: {},
    slots: [],
    revealIndex: 0,
    votes: {},
    winners: [],
    scores: zero,
    stats: { votesReceived: {}, roundVotes: {}, fastPlays: {}, best: null, streak: null, bestRun: null },
    redraws: {},
  };
  return enterIntro(refillHands(base), ctx.now);
}

export const game: GameDefinition<State, Input> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, manifest.id, playerId),
  results,
  bot: { sampleInput: botInput },
};

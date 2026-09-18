// Blanks — black card → play white cards → read them out → vote / judge → point. `game` is what
// the registry imports. Phases live under ./phases and are wired by ./flow; views by ./views; this
// file only assembles the definition.
import { gameManifestSchema, seedRng, shuffle } from '@partybox/game-sdk';
import type { GameDefinition, InitContext, Settings as RawSettings } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { refillHands } from './cards';
import { blackCard, blackPool, whitePool } from './content';
import { reduce } from './flow';
import { enterIntro } from './phases/intro';
import { canVote, hasPlayed, isCzar } from './round';
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
  const [blackDeck, r1] = shuffle(seedRng(ctx.seed), blackPool(settings.decks));
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
    submissions: {},
    slots: [],
    revealIndex: 0,
    votes: {},
    winners: [],
    scores: zero,
    stats: { votesReceived: {}, fastPlays: {}, best: null, streak: null },
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
  bot: {
    sampleInput(state, playerId, rng) {
      if (!Object.hasOwn(state.players, playerId)) return null;
      if (state.phase.id === 'pick') {
        if (!isCzar(state, playerId) || state.blackChoices.length < 2) return null;
        if (state.blackId !== null) return null; // already chosen; the beat is running
        return { type: 'choose', index: rng.int(0, state.blackChoices.length - 1) };
      }
      if (state.phase.id === 'answer') {
        if (isCzar(state, playerId) || hasPlayed(state, playerId)) return null;
        const { pick } = blackCard(state.blackId);
        const hand = state.hands[playerId] ?? [];
        if (hand.length < pick) return null;
        return { type: 'play', cards: rng.shuffle(hand).slice(0, pick) };
      }
      // Bots never tap Next: an untimed result stays up for the humans (the hidden fallback ends it).
      if (state.phase.id === 'judge') {
        if (Object.hasOwn(state.votes, playerId)) return null;
        const slots = state.slots.map((_, slot) => slot).filter((s) => canVote(state, playerId, s));
        if (slots.length === 0) return null;
        return { type: 'vote', slot: rng.pick(slots) };
      }
      return null;
    },
  },
};

// Who Said It — everyone answers, everyone guesses who wrote what (docs/game-pack/who-said-it/
// SPEC.md). `game` is what the registry imports; this file only assembles the definition.
import { createRng, gameManifestSchema, seedRng, shuffle } from '@partybox/game-sdk';
import type { GameDefinition, InitContext } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { decide } from './bot';
import { promptPool } from './content';
import { reduce } from './flow';
import { enterPrompt } from './phases/prompt';
import { recap } from './recap';
import { startPrompt } from './round';
import { results } from './scoring';
import { readSettings } from './settings';
import { speech } from './speech';
import { PHASES, inputSchema } from './types';
import type { Input, PromptItem, State } from './types';
import { controllerView, tvView } from './views';
import type { WsPhoneView, WsTvView } from './views';

export type { WsPhoneView, WsTvView } from './views';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const seats = ctx.players.map((p) => p.id);
  const cfg = readSettings(manifest, ctx.settings, seats.length);
  // State holds only what's drawn (foundation §2.5): this game's prompts, nothing else.
  const [deck, rng] = shuffle(seedRng(ctx.seed), [...promptPool(cfg.spicy)]);
  const prompts: PromptItem[] = deck
    .slice(0, cfg.prompts)
    .map((p) => ({ id: p.id, prompt: p.prompt, botAnswers: p.botAnswers }));
  const zero: Record<string, number> = {};
  for (const id of seats) zero[id] = 0;
  const base = {
    phase: { id: 'prompt', startedAt: ctx.now, deadline: null },
    rng,
    players,
    cfg: { ...cfg, prompts: prompts.length },
    seats,
    left: [],
    prompts,
    scores: zero,
    stats: {},
    pairs: {},
    speechMs: {},
    log: [],
  } as unknown as State;
  // The shell's start stage (rules → READY → 3·2·1) has already run: open on the first question.
  return enterPrompt(startPrompt(base, 0), ctx.now, 0);
}

export const game: GameDefinition<State, Input, WsTvView, WsPhoneView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, manifest.id, playerId),
  results,
  recap,
  speech,
  bot: {
    // Ruling 20: the bot sees exactly what its phone would, then decides.
    sampleInput(state, playerId, rng) {
      return decide(controllerView(state, manifest.id, playerId), rng);
    },
  },
};

/** For tests: a bot decision with a seeded bot RNG. */
export function botDecision(state: State, playerId: string, seed: number): Input | null {
  return decide(controllerView(state, manifest.id, playerId), createRng(seed));
}

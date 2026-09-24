// Tune In — a clue on a dial between two opposites (docs/game-pack/tune-in/SPEC.md). `game` is
// what the registry imports; phases live under ./phases, wired by ./flow; views, bot and speech in
// their own files. This one only assembles the definition.
import { gameManifestSchema, seedRng, shuffle } from '@partybox/game-sdk';
import type { GameDefinition, InitContext } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { decide } from './bot';
import { drawSpectra } from './content';
import { controllerView } from './controller-view';
import type { TuneControllerView } from './controller-view';
import { reduce } from './flow';
import { enterIntro } from './phases/intro';
import { recap } from './recap';
import { results } from './scoring';
import { readPresence, readSettings } from './settings';
import { speech } from './speech';
import { coin, teamsFromSeed } from './teams';
import { plannedTurns, planTurn, turnZero } from './turn';
import { tvView } from './tv-view';
import type { TuneTvView } from './tv-view';
import { PHASES, inputSchema } from './types';
import type { Input, State } from './types';

export type { TuneControllerView, TuneTvView };

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const presence = readPresence(ctx);
  const cfg = readSettings(manifest.settings, ctx.settings, ctx.players.length, presence.mode);
  const seats = ctx.players.map((p) => p.id);
  let rng = seedRng(ctx.seed);
  let teams: State['teams'] = null;
  if (cfg.mode === 'teams') [teams, rng] = teamsFromSeed(ctx.players, rng);
  const [spectra, afterSpectra] = drawSpectra(
    rng,
    plannedTurns({ mode: cfg.mode, cfg }),
    cfg.spicy,
  );
  const [all, afterAll] = shuffle(afterSpectra, seats);
  const [sun, afterSun] = shuffle(afterAll, teams?.sun ?? []);
  const [moon, afterMoon] = shuffle(afterSun, teams?.moon ?? []);
  const [sunFirst, afterCoin] = coin(afterMoon);
  const zero: Record<string, number> = {};
  for (const id of seats) zero[id] = 0;
  const base: State = {
    phase: { id: 'intro', startedAt: ctx.now, deadline: null },
    rng: afterCoin,
    players,
    cfg,
    presence,
    seats,
    left: [],
    mode: cfg.mode,
    teams,
    psychicBag: { all, sun, moon },
    spectra,
    turn: turnZero(),
    nextTeam: sunFirst ? 'sun' : 'moon',
    scores: zero,
    turnStartScores: zero,
    team: { sun: 0, moon: 0 },
    coopTotal: 0,
    played: 0,
    stats: {},
    speechMs: {},
  };
  // The first turn is planned now, so the intro can read its psychic ahead (P00 §5.7).
  return enterIntro(planTurn(base, false), ctx.now);
}

export const game: GameDefinition<State, Input, TuneTvView, TuneControllerView> = {
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
    // P00 §7.9: the bot sees exactly what its phone would, and chooses only from that.
    sampleInput: (state, playerId, rng) =>
      Object.hasOwn(state.players, playerId)
        ? decide(controllerView(state, manifest.id, playerId), rng)
        : null,
  },
};

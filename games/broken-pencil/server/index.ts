// Broken Pencil — word → drawing → guess books, then a show. `game` is what the registry imports.
// One file per phase under ./phases; this file wires init / reduce / views / results / bot
// together and owns the phase ORDER (docs/GAME_CONTRACT.md).
import {
  allConnectedDone,
  applyVip,
  gameManifestSchema,
  seedRng,
  setConnected,
  shuffle,
} from '@partybox/game-sdk';
import type {
  GameDefinition,
  GameEvent,
  InitContext,
  Settings as RawSettings,
} from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { recap } from './recap';
import { sampleInput } from './bot';
import { dealOffers } from './content';
import { enterDraw, reduceDraw } from './phases/draw';
import { enterGuess, reduceGuess } from './phases/guess';
import { enterPass, reducePass } from './phases/pass';
import { closePick, enterPick, hasPicked, reducePick } from './phases/pick';
import {
  enterDone,
  enterShow,
  enterSummary,
  reduceShow,
  reduceSummary,
  turnPage,
} from './phases/show';
import { results } from './scoring';
import { closeStep, phaseOfStep, submittedIds } from './step';
import { EVERYONE, PHASES, inputSchema } from './types';
import type { Book, Input, Settings, State } from './types';
import { controllerView, tvView } from './views';
import type { PencilControllerView, PencilTvView } from './views';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

export function readSettings(raw: RawSettings): Settings {
  return {
    passes: Math.min(EVERYONE, Math.max(1, Math.round(Number(raw['passes'] ?? EVERYONE)))),
    drawSeconds: Math.min(120, Math.max(30, Number(raw['drawSeconds'] ?? 60))),
    guessSeconds: Math.min(60, Math.max(15, Number(raw['guessSeconds'] ?? 30))),
    customWords: raw['customWords'] !== false,
    spicy: raw['spicy'] === true,
  };
}

function init(ctx: InitContext): State {
  const settings = readSettings(ctx.settings);
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const N = ctx.players.length;
  // Others per book: "everyone" is the whole circle (the book comes home after the last guess);
  // a smaller number shortens the game.
  const passes = Math.max(1, Math.min(settings.passes, N - 1));
  let rng = seedRng(ctx.seed);
  const [seats, afterSeats] = shuffle(rng, Object.keys(players).sort());
  rng = afterSeats;
  const [offers, afterOffers] = dealOffers(rng, seats, settings.spicy);
  rng = afterOffers;
  const books: Book[] = seats.map((ownerId) => ({ ownerId, pages: [] }));
  const base: State = {
    phase: { id: 'pick', startedAt: ctx.now, deadline: null },
    rng,
    players,
    settings,
    seats,
    passes,
    pageCount: 2 * passes + 1,
    step: 0,
    books,
    offers,
    showing: null,
    intactBooks: 0,
  };
  return enterPick(base, ctx.now);
}

/** After a step closes: the next step (draw → pass… → guess) or the show after the last one. */
function afterStep(state: State, now: number): State {
  if (state.step > state.passes + 1) return enterShow(state, now);
  switch (phaseOfStep(state, state.step)) {
    case 'draw':
      return enterDraw(state, now);
    case 'pass':
      return enterPass(state, now);
    default:
      return enterGuess(state, now);
  }
}

/** The phase order. What a deadline does — and what a VIP skip does (docs/GAME_CONTRACT.md). */
export function advance(state: State, now: number): State {
  switch (state.phase.id) {
    case 'pick':
      return closePick(state, now, afterStep);
    case 'draw':
    case 'pass':
    case 'guess':
      return closeStep(state, now, afterStep);
    case 'show': // skip = "Next page"
      return turnPage(state, now, enterSummary);
    case 'summary':
      return enterDone(state, now);
    default:
      return state;
  }
}

/** The drop of the last outstanding player closes the phase like their input would have
 *  (review-loop #48): the room never sits out a full timer for someone who has gone. */
function closeIfDone(state: State, now: number): State {
  switch (state.phase.id) {
    case 'pick':
      return allConnectedDone(
        state,
        state.seats.filter((id) => hasPicked(state, id)),
      )
        ? closePick(state, now, afterStep)
        : state;
    case 'draw':
    case 'pass':
    case 'guess':
      return allConnectedDone(state, submittedIds(state))
        ? closeStep(state, now, afterStep)
        : state;
    default:
      return state;
  }
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') {
    const after = setConnected(state, event);
    return event.connected || after.phase.paused ? after : closeIfDone(after, event.now);
  }
  // VIP skip = the phase's normal exit (a page turn during the show); VIP end → done.
  const vip = applyVip(state, event, { skip: advance, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'pick':
      return reducePick(state, event, afterStep);
    case 'draw':
      return reduceDraw(state, event, afterStep);
    case 'pass':
      return reducePass(state, event, afterStep);
    case 'guess':
      return reduceGuess(state, event, afterStep);
    case 'show':
      return reduceShow(state, event, enterSummary);
    case 'summary':
      return reduceSummary(state, event, enterDone);
    default:
      return state;
  }
}

export const game: GameDefinition<State, Input, PencilTvView, PencilControllerView> = {
  recap,
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, manifest.id, playerId),
  results,
  bot: { sampleInput },
};

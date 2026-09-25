// Secret Hitler: `game` is what the registry imports. One file per phase under ./phases; the
// phase order lives in ./flow.ts, leaving the game (D7) in ./exile.ts, the views in ./views.ts.
// Rules of record and their ids: docs/game-pack/secret-hitler/SPEC.md (§2 R*, §3 D*).
import { applyVip, gameManifestSchema, nextInt, seedRng, shuffle } from '@partybox/game-sdk';
import type { GameDefinition, GameEvent, InitContext } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { decide } from './bot';
import { expireDrops, onPlayer, recheckOnResume } from './exile';
import { advance, vipSkip } from './flow';
import { emptyRound } from './phase';
import { reduceChanEnact } from './phases/chanEnact';
import { reduceChaos } from './phases/chaos';
import { reduceClaims } from './phases/claims';
import { enterDone, reduceGameOver } from './phases/gameOver';
import { reduceHitlerCheck } from './phases/hitlerCheck';
import { reduceNominate } from './phases/nominate';
import { reducePower } from './phases/power';
import { reducePowerReveal } from './phases/powerReveal';
import { reducePresDraw } from './phases/presDraw';
import { enterSeating, reduceSeating } from './phases/seating';
import { reduceEnactReveal } from './phases/enactReveal';
import { reduceVetoAsk } from './phases/vetoAsk';
import { reduceVote } from './phases/vote';
import { reduceVoteReveal } from './phases/voteReveal';
import { dealRoles, newDeck } from './rules';
import { results } from './scoring';
import { PHASES, SEATING_SAFETY_MS, inputSchema } from './types';
import type { Input, Pace, State } from './types';
import { controllerView, tvView } from './views';
import type { ShControllerView, ShTvView } from './views';

// Parsed once: a typo in manifest.json fails at import time instead of deep inside the engine.
const manifest = gameManifestSchema.parse(manifestJson);

const PACES: readonly Pace[] = ['relaxed', 'normal', 'fast'];

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const ids = ctx.players.map((p) => p.id);
  let rng = seedRng(ctx.seed);
  const [seats, r1] = shuffle(rng, ids); // R5: seat order
  const [role, r2] = dealRoles(r1, ids); // R1
  const [deck, r3] = newDeck(r2); // R3
  const [first, r4] = nextInt(r3, 0, Math.max(0, seats.length - 1)); // R5: a random first President
  rng = r4;
  const paceSetting = String(ctx.settings['pace'] ?? 'normal');
  const pace = PACES.find((p) => p === paceSetting) ?? 'normal';
  const state: State = {
    phase: { id: 'seating', startedAt: ctx.now, deadline: ctx.now + SEATING_SAFETY_MS },
    rng,
    players,
    cfg: { pace },
    seats,
    role,
    alive: [...seats],
    executed: [],
    exiled: [],
    droppedAt: {},
    ready: ctx.players.filter((p) => p.bot).map((p) => p.id),
    deck,
    discards: [],
    board: { L: 0, F: 0 },
    tracker: 0,
    chaosCount: 0,
    vetoUnlocked: false,
    presPointer: first,
    special: null,
    lastElected: { president: null, chancellor: null },
    investigated: [],
    notHitler: [],
    intel: {},
    round: emptyRound(1, seats[first] ?? ''),
    history: [],
    chat: [],
    lastChatAt: {},
    announce: null,
    headline: null,
    winner: null,
    winReason: null,
  };
  return enterSeating(state, ctx.now);
}

function reducePhase(state: State, event: GameEvent<Input>): State {
  switch (state.phase.id) {
    case 'seating':
      return reduceSeating(state, event, advance);
    case 'nominate':
      return reduceNominate(state, event, advance);
    case 'vote':
      return reduceVote(state, event, advance);
    case 'voteReveal':
      return reduceVoteReveal(state, event, advance);
    case 'hitlerCheck':
      return reduceHitlerCheck(state, event, advance);
    case 'presDraw':
      return reducePresDraw(state, event, advance);
    case 'chanEnact':
      return reduceChanEnact(state, event, advance);
    case 'vetoAsk':
      return reduceVetoAsk(state, event, advance);
    case 'enactReveal':
      return reduceEnactReveal(state, event, advance);
    case 'claims':
      return reduceClaims(state, event, advance);
    case 'power':
      return reducePower(state, event, advance);
    case 'powerReveal':
      return reducePowerReveal(state, event, advance);
    case 'chaos':
      return reduceChaos(state, event, advance);
    case 'gameOver':
      return reduceGameOver(state, event, advance);
    default:
      return state;
  }
}

function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  // D7: a seat dropped for the whole hold is exiled before anything else happens.
  const s = expireDrops(state, event.now);
  // D4 / D10: Skip is Last call in a choosing phase; pause freezes every deadline; End → done.
  const vip = applyVip(s, event, { skip: vipSkip, end: enterDone });
  if (vip)
    return event.type === 'vip' && event.action === 'resume'
      ? recheckOnResume(vip, event.now)
      : vip;
  if (s.phase.paused) return s;
  // Exiled players and ghosts send nothing that counts (§14): phases accept only the living.
  if (event.type === 'input' && !s.alive.includes(event.playerId)) return s;
  return reducePhase(s, event);
}

export const game: GameDefinition<State, Input, ShTvView, ShControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView,
  controllerView,
  results,
  bot: {
    sampleInput(state, playerId, rng) {
      return decide(controllerView(state, playerId), rng);
    },
  },
};

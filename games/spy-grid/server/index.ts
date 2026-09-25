// Spy Grid — Codenames-style teams (docs/game-pack/spy-grid/SPEC.md). `game` is what the registry
// imports; phases live one per file under ./phases, the order in ./flow.ts.
import { applyVip, gameManifestSchema, seedRng, setConnected } from '@partybox/game-sdk';
import type { GameDefinition, GameEvent, InitContext } from '@partybox/game-sdk';
import manifestJson from '../manifest.json' with { type: 'json' };
import { sampleInput } from './bot';
import { advance, checkForfeit, end, startRound } from './flow';
import { reduceClue } from './phases/clue';
import { reduceTimed } from './phases/end';
import { reduceFlip } from './phases/flip';
import { recount, reduceGuess } from './phases/guess';
import { enterTeams, reduceTeams } from './phases/teams';
import { recap } from './recap';
import { emptyStats, freshTurn } from './round';
import { results } from './scoring';
import { speech } from './speech';
import { initialTeams, settleTeams } from './teams';
import { PHASES, inputSchema } from './types';
import type { Input, Mode, Settings, State } from './types';
import { controllerView, tvView } from './views';
import type { SpyControllerView, SpyTvView } from './views';

const manifest = gameManifestSchema.parse(manifestJson);

function settingsOf(ctx: InitContext): Settings {
  const s = ctx.settings;
  const num = (k: string, d: number): number => (typeof s[k] === 'number' ? (s[k] as number) : d);
  const str = (k: string, d: string): string => (typeof s[k] === 'string' ? (s[k] as string) : d);
  const bool = (k: string, d: boolean): boolean =>
    typeof s[k] === 'boolean' ? (s[k] as boolean) : d;
  const requested = str('mode', 'auto');
  // Teams need two sides of two (§9.6 rule 2): fewer than four players always play co-op.
  const mode: Mode = ctx.players.length < 4 || requested === 'coop' ? 'coop' : 'teams';
  return {
    mode,
    teamPick: str('teamPick', 'choose') === 'random' ? 'random' : 'choose',
    rounds: num('rounds', 1),
    clueSeconds: num('clueSeconds', 75),
    guessSeconds: num('guessSeconds', 60),
    maxTurns: num('maxTurns', 24),
    coopTurns: num('coopTurns', 8),
    assassins: str('assassins', '1') === '2' ? 2 : 1,
    reactions: bool('reactions', true),
    spicy: bool('spicy', false),
    reader: str('reader', 'fable'),
  };
}

function init(ctx: InitContext): State {
  const players: State['players'] = {};
  for (const p of ctx.players) players[p.id] = p;
  const settings = settingsOf(ctx);
  const base: State = {
    phase: { id: 'teams', startedAt: ctx.now, deadline: null },
    rng: seedRng(ctx.seed),
    players,
    settings,
    seats: ctx.players.map((p) => p.id),
    left: [],
    mode: settings.mode,
    teams: { sun: [], moon: [] },
    spymaster: { sun: null, moon: null },
    volunteers: [],
    round: 0,
    roundWins: { sun: 0, moon: 0 },
    board: [],
    key: [],
    flipped: [],
    starter: 'sun',
    turn: freshTurn('sun', 0, null),
    idleTurns: 0,
    winner: null,
    reason: null,
    coop: null,
    history: [],
    stats: Object.fromEntries(ctx.players.map((p) => [p.id, emptyStats()])),
    speechMs: {},
    usedThemes: [],
  };
  const [teams, rng] = initialTeams(base, base.rng);
  const placed: State = { ...base, teams, rng };
  return settings.teamPick === 'choose'
    ? enterTeams(placed, ctx.now)
    : startRound(settleTeams(placed), ctx.now);
}

function onPlayer(state: State, event: Extract<GameEvent<Input>, { type: 'player' }>): State {
  let s = setConnected(state, event);
  if (event.gone && Object.hasOwn(s.players, event.playerId) && !s.left.includes(event.playerId)) {
    s = {
      ...s,
      left: [...s.left, event.playerId],
      volunteers: s.volunteers.filter((id) => id !== event.playerId),
    };
    const forfeit = checkForfeit(s, event.now);
    if (forfeit) return forfeit;
  }
  return recount(s, event.now, advance);
}
function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') return onPlayer(state, event);
  if (event.type === 'speech') {
    if (state.speechMs[event.key] === event.ms) return state;
    return { ...state, speechMs: { ...state.speechMs, [event.key]: event.ms } };
  }
  const vip = applyVip(state, event, { skip: advance, end });
  // A resume re-counts: a drop or a leave during the pause may have left a majority standing, and
  // nothing else would look again until the next tap or the timer (reviewer [12ea6b]).
  if (vip) return state.phase.paused && !vip.phase.paused ? recount(vip, event.now, advance) : vip;
  if (state.phase.paused) return state;
  switch (state.phase.id) {
    case 'teams':
      return reduceTeams(state, event, advance);
    case 'clue':
      return reduceClue(state, event, advance);
    case 'guess':
      return reduceGuess(state, event, advance);
    case 'flip':
      return reduceFlip(state, event, advance);
    case 'turn-end':
    case 'win':
      return reduceTimed(state, event, advance);
    default:
      return state;
  }
}

export const game: GameDefinition<State, Input, SpyTvView, SpyControllerView> = {
  manifest,
  phases: PHASES,
  inputSchema,
  init,
  reduce,
  tvView: (state) => tvView(state, manifest.id),
  controllerView: (state, playerId) => controllerView(state, manifest.id, playerId),
  results,
  bot: { sampleInput },
  recap,
  speech,
};

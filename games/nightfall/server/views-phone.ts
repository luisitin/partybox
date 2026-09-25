// controllerView (SPEC §10.12): the player's own secrets and nothing else. Every role gets the same
// shape at night and dawn — the role's meaning, the pack's picks and the night report differ only
// in what hides under hold-to-see (§10.10). Spectators get exactly the TV view.
import { controllerEnvelope, hasPlayer } from '@partybox/game-sdk';
import type { ControllerView } from '@partybox/game-sdk';
import { fillIn, flavourOf } from './content';
import { candidatesFor, isAlive, knownAlive, nameOf, roleOf, sideOf } from './rules';
import { postsToday } from './text';
import { POSTS_PER_DAY } from './types';
import { castOf, graveyardOf, over, sideText, stageOf } from './views-common';
import type { CastEntry, GraveEntry, StageView } from './views-common';
import { boardToday, countEndOf, nightfallEnvelope, tvView, GAME_ID } from './views-tv';
import type { NightfallTvView } from './views-tv';
import type { Ballot, FlavourId, Role, Side, State } from './types';

export interface MyRole {
  id: Role;
  name: string;
  icon: string;
  desc: string;
  /** Tonight's job, under hold-to-see: "Choose tonight's victim". */
  job: string;
}

export interface NightfallControllerView extends ControllerView {
  flavour: FlavourId;
  day: number;
  step: number;
  /** The end of the 3 · 2 · 1 before night 1 (roles step 1), else null. */
  countEnd: number | null;
  question: string;
  cast: CastEntry[];
  living: string[];
  graveyard: GraveEntry[];
  /** Alive as far as this phone has been told (a death shows only after the TV announced it). */
  alive: boolean;
  ghost: boolean;
  role: MyRole | null;
  /** Flavoured words the screens drop in ("Your pack", "That's your packmate!"). */
  words: { pack: string; packPicks: string; packmate: string };
  /** Wolves: the other wolves, and which of them are bots (robot faces: public anyway). */
  pack: string[];
  packBots: string[];
  /** Wolves at night: the pack's picks, live. */
  packPicks: Ballot[];
  myPick: string | null;
  /** Doctor: who they protected last night (they may not repeat it). */
  lastProtected: string | null;
  /** Dawn: this player's night report (every phone that played the night gets one). */
  report: string | null;
  /** Seer: every result so far. */
  seerLog: { night: number; target: string; wolf: boolean }[];
  tally: StageView['tally'];
  ready: boolean;
  readyCount: number;
  livingCount: number;
  board: { by: string; text: string }[];
  /** Posts left today; null when the town board is off. */
  postsLeft: number | null;
  /** The last verdict's ballots (public since that verdict). */
  lastVotes: Ballot[];
  vote: { candidates: string[]; mine: string | null; runoff: boolean } | null;
  /** The dying hunter's choice. */
  shoot: { targets: string[] } | null;
  /** The eliminated player may type their last words. */
  speak: boolean;
  /** Every role: ghosts with ghostsSeeAll, and everyone at the end. */
  roles: { id: string; role: Role }[] | null;
  /** Own side's result, once the TV showed it. */
  result: { winner: Side | null; won: boolean; headline: string; side: Side } | null;
  /** What the TV shows in this moment (for phones that cannot see it). */
  stage: StageView | null;
}

const STAGE_PHASES = new Set(['dawn', 'verdict', 'hunter', 'last-words', 'end', 'done']);

function jobOf(state: State, role: Role): string {
  const f = flavourOf(state.cfg.flavour);
  if (role === 'wolf') return f.words.victim;
  if (role === 'seer') return 'Choose someone to check';
  if (role === 'doctor') return 'Choose someone to protect';
  return 'Who do you suspect?';
}

/** SPEC §10.9 dawn: the same strip on every phone; only what it hides differs. */
function reportOf(state: State, id: string): string | null {
  if (state.phase.id !== 'dawn') return null;
  const night = state.nights[state.nights.length - 1];
  const diedTonight = state.dead.some((d) => d.id === id && d.day === state.day);
  if (!night || (!isAlive(state, id) && !diedTonight)) return null;
  const f = flavourOf(state.cfg.flavour);
  const role = roleOf(state, id);
  if (role === 'wolf') {
    if (!night.victim) return 'Nobody was chosen last night';
    return fillIn(f.words.packChose, { name: nameOf(state, night.victim) });
  }
  const pick = night.picks[id];
  if (pick === undefined) return "You didn't choose anyone last night";
  if (role === 'seer') {
    const wolf = roleOf(state, pick) === 'wolf';
    return `🔮 ${fillIn(wolf ? f.words.isWolf : f.words.notWolf, { name: nameOf(state, pick) })}`;
  }
  if (role === 'doctor') return fillIn('You protected {name}', { name: nameOf(state, pick) });
  return fillIn('Your hunch: {name}', { name: nameOf(state, pick) });
}

function rolesFor(state: State, ghost: boolean): NightfallControllerView['roles'] {
  const all = over(state) || (ghost && state.cfg.ghostsSeeAll);
  if (!all) return null;
  return state.seats.flatMap((s) => {
    const role = roleOf(state, s);
    return role ? [{ id: s, role }] : [];
  });
}

function spectatorView(state: State, playerId: string): NightfallControllerView {
  const tv: NightfallTvView = tvView(state);
  return {
    ...tv,
    ...controllerEnvelope(state, GAME_ID, playerId),
    ...nightfallEnvelope(state),
    countEnd: countEndOf(state),
    me: { id: playerId, role: 'spectator' },
    alive: false,
    ghost: false,
    role: null,
    words: { pack: '', packPicks: '', packmate: '' },
    pack: [],
    packBots: [],
    packPicks: [],
    myPick: null,
    lastProtected: null,
    report: null,
    seerLog: [],
    tally: tv.stage.tally,
    ready: false,
    postsLeft: null,
    lastVotes: [],
    vote: null,
    shoot: null,
    speak: false,
    roles: over(state) ? rolesFor(state, false) : null,
    result: null,
    stage: tv.stage,
  };
}

export function phoneView(state: State, playerId: string): NightfallControllerView {
  if (!hasPlayer(state, playerId) || !roleOf(state, playerId))
    return spectatorView(state, playerId);
  const f = flavourOf(state.cfg.flavour);
  const phase = state.phase.id;
  const role = roleOf(state, playerId) as Role;
  const living = knownAlive(state);
  const alive = living.includes(playerId);
  const reallyAlive = isAlive(state, playerId);
  const ghost = !alive;
  const wolf = role === 'wolf';
  const stage = stageOf(state);
  const lastDay = state.days[state.days.length - 1];
  const voting = (phase === 'vote' || phase === 'runoff') && reallyAlive;
  const side = sideOf(role);
  const pack = wolf
    ? state.seats.filter((id) => id !== playerId && roleOf(state, id) === 'wolf')
    : [];
  return {
    ...controllerEnvelope(state, GAME_ID, playerId),
    ...nightfallEnvelope(state),
    countEnd: countEndOf(state),
    me: { id: playerId, role: 'player' },
    flavour: state.cfg.flavour,
    day: state.day,
    step: state.step,
    question: f.words.question,
    cast: castOf(state),
    living,
    graveyard: graveyardOf(state, ghost && state.cfg.ghostsSeeAll),
    alive,
    ghost,
    role: { id: role, ...pickRoleText(state, role), job: jobOf(state, role) },
    words: { pack: f.words.pack, packPicks: f.words.packPicks, packmate: f.words.packmate },
    pack,
    packBots: pack.filter((id) => state.players[id]?.bot === true),
    packPicks:
      wolf && phase === 'night'
        ? state.alive
            .filter((id) => roleOf(state, id) === 'wolf' && Object.hasOwn(state.picks, id))
            .map((by) => ({ by, target: state.picks[by] as string }))
        : [],
    myPick: phase === 'night' ? (state.picks[playerId] ?? null) : null,
    lastProtected: role === 'doctor' ? state.lastProtected : null,
    report: reportOf(state, playerId),
    seerLog: role === 'seer' ? state.seerLog : [],
    tally: stage.tally,
    ready: state.ready.includes(playerId),
    readyCount: state.ready.filter((id) => isAlive(state, id)).length,
    livingCount: living.length,
    board: state.cfg.townBoard ? boardToday(state, 20) : [],
    postsLeft:
      state.cfg.townBoard && reallyAlive ? POSTS_PER_DAY - postsToday(state, playerId) : null,
    lastVotes: lastDay && (phase === 'night' || phase === 'day') ? lastDay.ballots : [],
    vote: voting
      ? {
          candidates: candidatesFor(state, playerId),
          mine: state.votes[playerId] ?? null,
          runoff: phase === 'runoff',
        }
      : null,
    shoot:
      phase === 'hunter' && state.step === 0 && state.hunterPending === playerId
        ? { targets: state.alive.filter((id) => id !== playerId) }
        : null,
    speak: phase === 'last-words' && state.step === 0 && state.verdict?.out === playerId,
    roles: rolesFor(state, ghost),
    result:
      over(state) && state.winner
        ? {
            winner: state.winner,
            won: state.winner === side,
            headline: sideText(state.cfg.flavour, state.winner),
            side,
          }
        : null,
    stage: STAGE_PHASES.has(phase) ? stage : null,
  };
}

function pickRoleText(state: State, role: Role): Omit<MyRole, 'id' | 'job'> {
  const t = flavourOf(state.cfg.flavour).roles[role];
  return { name: t.name, icon: t.icon, desc: t.desc };
}

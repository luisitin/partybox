// The TV view and the phone views (SPEC §11, §15). Secrets live only in a controller view of a
// player allowed to see them: roles (own dossier; the Fascist team as R2 says), the President's
// draw, the Chancellor's two cards, peeks and investigation results. The TV gets none of them;
// votes appear at voteReveal, an enacted card at its reveal, every role at gameOver.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { CHOOSING, chooserOf } from './flow';
import { canRequestVeto } from './phases/chanEnact';
import { eligibleNominees, ineligibleReason, knownTeam, nextPresident } from './rules';
import { partyOf, powerForSlot, powerTargets } from './rules';
import type { Ineligible } from './rules';
import type { HistoryRow, Intel, Party, PowerKind, Role, State, WinReason, Winner } from './types';

export const GAME_ID = 'secret-hitler';
const SECRET_CARD_PHASES = new Set(['presDraw', 'chanEnact', 'vetoAsk']);
const VOTES_SHOWN = new Set(['voteReveal', 'hitlerCheck']);
const OVER = new Set(['gameOver', 'done']);
const HIDDEN_TIMER = new Set([
  'seating',
  'voteReveal',
  'hitlerCheck',
  'chaos',
  'enactReveal',
  'powerReveal',
  'gameOver',
  'done',
]);

/**
 * A seat's public status tags (§8.1): executed (👻), exiled ("Left"), ✓ Not Hitler (D5),
 * investigated, R6's term limit right now, D9's "Next", and `voted` during a vote (the vote
 * itself stays hidden). Tags keep the view inside the 4 KB budget (owner ruling 20).
 */
export type SeatTag =
  | 'executed'
  | 'exiled'
  | 'notHitler'
  | 'investigated'
  | 'lastChancellor'
  | 'lastPresident'
  | 'next'
  | 'ready'
  | 'voted';

/** Absent fields are left out rather than null, to keep ten seats inside the view budget. */
export interface SeatView {
  id: string;
  tags: SeatTag[];
  plate?: 'president' | 'nominee' | 'chancellor';
  /** voteReveal / hitlerCheck: the vote, public. */
  vote?: 'ja' | 'nein';
  /** gameOver: the role, public. */
  role?: Role;
}

/** A Record row with the government as indexes into `seats` (ids are long UUIDs). */
export type HistoryView = Omit<HistoryRow, 'president' | 'chancellor'> & {
  pres: number;
  chan: number;
};

export function hasTag(seat: SeatView | undefined, tag: SeatTag): boolean {
  return seat?.tags.includes(tag) ?? false;
}

export interface PublicView {
  seats: SeatView[];
  board: { L: number; F: number };
  /** The power on each of the six Fascist slots at this player count (R14). */
  slots: (PowerKind | null)[];
  tracker: number;
  vetoUnlocked: boolean;
  deckCount: number;
  discardCount: number;
  /** The setup line: players, Liberals, and Fascists besides Hitler (keys stay role-word free). */
  setup: { players: number; L: number; F: number };
  round: {
    n: number;
    president: string;
    nominee: string | null;
    elected: boolean | null;
    tally: { ja: number; nein: number } | null;
    enacted: Party | null;
    chaosCard: Party | null;
    vetoRequested: boolean;
    vetoAgreed: boolean | null;
    power: { kind: PowerKind; target: string | null; shown: boolean } | null;
  };
  announce: { who: string | null } | null;
  lastCall: boolean;
  /** Seating: when the 3 · 2 · 1 ends (absent until everyone is ready; the view budget). */
  startAt?: number;
  /** D6: a legislative session is running; the President and Chancellor may not speak. */
  silence: boolean;
  /** The newspaper's latest headline (§19), public. */
  headline: string | null;
  history: HistoryView[];
  winner: Winner | null;
  winReason: WinReason | null;
}

export type ShTvView = TvView & PublicView;

export interface ActView {
  kind: 'ready' | 'nominate' | 'vote' | 'discard' | 'enact' | 'vetoAnswer' | 'target' | 'peek';
  /** nominate / target: the seats (indexes into `seats`) that can be picked… */
  options: number[];
  /** …and every other seat but mine, with why it can't be (indexes keep the view under 4 KB). */
  blocked: { seat: number; reason: Ineligible | 'investigated' }[];
  /** discard / enact / peek: the cards, in order. */
  cards: Party[];
  canVeto: boolean;
  power: PowerKind | null;
  done: boolean;
  myVote: boolean | null;
}

export interface Dossier {
  party: Party;
  role: Role;
  team: { id: string; role: Role }[];
  intel: Intel[];
}

export type ShControllerView = ControllerView &
  PublicView & {
    dossier: Dossier | null;
    status: 'alive' | 'executed' | 'exiled' | 'spectator';
    act: ActView | null;
  };

function seatView(state: State, id: string, nextId: string | null): SeatView {
  const r = state.round;
  const phase = state.phase.id;
  const limit = ineligibleReason(state, id);
  const plate =
    id === r.president
      ? 'president'
      : id === r.nominee
        ? r.elected
          ? 'chancellor'
          : 'nominee'
        : null;
  const tags: SeatTag[] = [];
  if (state.executed.includes(id)) tags.push('executed');
  if (state.exiled.includes(id)) tags.push('exiled');
  if (state.notHitler.includes(id)) tags.push('notHitler');
  if (state.investigated.includes(id)) tags.push('investigated');
  if (limit === 'lastChancellor' || limit === 'lastPresident') tags.push(limit);
  if (id === nextId) tags.push('next');
  if (phase === 'vote' && Object.hasOwn(r.votes, id)) tags.push('voted');
  if (phase === 'seating' && state.ready.includes(id)) tags.push('ready');
  const seat: SeatView = { id, tags };
  if (plate) seat.plate = plate;
  if (VOTES_SHOWN.has(phase) && state.alive.includes(id))
    seat.vote = r.votes[id] === true ? 'ja' : 'nein';
  const role = state.role[id];
  if (OVER.has(phase) && role) seat.role = role;
  return seat;
}

export function publicView(state: State): PublicView {
  const r = state.round;
  const phase = state.phase.id;
  const n = state.seats.length;
  const fascists = state.seats.filter((id) => state.role[id] === 'fascist').length;
  const nextId = nextPresident(state).id;
  const row = r.elected === null ? undefined : state.history.find((h) => h.n === r.n);
  return {
    seats: state.seats.map((id) => seatView(state, id, nextId)),
    board: state.board,
    slots: [1, 2, 3, 4, 5, 6].map((slot) => powerForSlot(n, slot)),
    tracker: state.tracker,
    vetoUnlocked: state.vetoUnlocked,
    deckCount: state.deck.length,
    discardCount: state.discards.length,
    setup: { players: n, L: n - fascists - 1, F: fascists },
    round: {
      n: r.n,
      president: r.president,
      nominee: r.nominee,
      elected: r.elected,
      tally: row ? { ja: row.ja, nein: row.nein } : null,
      enacted: SECRET_CARD_PHASES.has(phase) ? null : r.enacted,
      chaosCard: r.chaosCard,
      vetoRequested: r.vetoRequested,
      vetoAgreed: r.vetoAgreed,
      power: r.power,
    },
    announce: state.announce ? { who: state.announce.who } : null,
    lastCall: r.lastCall,
    ...(state.startAt !== null && phase === 'seating' ? { startAt: state.startAt } : {}),
    silence: SECRET_CARD_PHASES.has(phase),
    headline: state.headline,
    history: state.history.slice(-7).map(({ president, chancellor, ...row }) => ({
      ...row,
      pres: state.seats.indexOf(president),
      chan: state.seats.indexOf(chancellor),
    })),
    winner: state.winner,
    winReason: state.winReason,
  };
}

function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    if (!state.alive.includes(id)) return 'waiting';
    if (state.phase.id === 'seating') return state.ready.includes(id) ? 'submitted' : 'active';
    if (state.phase.id === 'vote')
      return Object.hasOwn(state.round.votes, id) ? 'submitted' : 'active';
    return chooserOf(state) === id ? 'active' : 'waiting';
  };
}

/** The TV draws its own clock in the banner, so its shell timer is the quiet bar only. */
function timing(
  state: State,
  tv = false,
): Pick<TvView, 'timerMode' | 'vipSkipLabel' | 'vipSkipHidden'> {
  const phase = state.phase.id;
  const quiet = tv || phase === 'presDraw' || phase === 'chanEnact';
  const out: Pick<TvView, 'timerMode' | 'vipSkipLabel' | 'vipSkipHidden'> = {
    timerMode: HIDDEN_TIMER.has(phase) ? 'hidden' : quiet ? 'quiet' : 'normal',
  };
  if (phase === 'seating') {
    if (state.startAt !== null) out.vipSkipHidden = true;
    else out.vipSkipLabel = 'Start now';
  } else if (CHOOSING.includes(phase)) {
    if (state.round.lastCall) out.vipSkipHidden = true;
    else out.vipSkipLabel = 'Last call';
  }
  return out;
}

export function tvView(state: State): ShTvView {
  return {
    ...envelope(state, GAME_ID, { statusOf: statusOf(state) }),
    ...timing(state, true),
    ...publicView(state),
  };
}

function actFor(state: State, id: string): ActView | null {
  const r = state.round;
  const base: ActView = {
    kind: 'ready',
    options: [],
    blocked: [],
    cards: [],
    canVeto: false,
    power: null,
    done: false,
    myVote: null,
  };
  const pickable = (valid: string[], why: (o: string) => Ineligible | 'investigated' | null) => {
    const ok = new Set(valid);
    const options: number[] = [];
    const blocked: ActView['blocked'] = [];
    state.seats.forEach((o, seat) => {
      if (o === id) return;
      if (ok.has(o)) options.push(seat);
      else blocked.push({ seat, reason: why(o) ?? 'executed' });
    });
    return { options, blocked };
  };
  switch (state.phase.id) {
    case 'seating':
      return state.alive.includes(id) ? { ...base, done: state.ready.includes(id) } : null;
    case 'vote':
      if (!state.alive.includes(id)) return null;
      return {
        ...base,
        kind: 'vote',
        myVote: Object.hasOwn(r.votes, id) ? (r.votes[id] ?? null) : null,
      };
    case 'nominate': {
      if (id !== r.president) return null;
      const picks = pickable(eligibleNominees(state), (o) => ineligibleReason(state, o));
      return { ...base, kind: 'nominate', ...picks };
    }
    case 'presDraw':
      return id === r.president && r.passed === null
        ? { ...base, kind: 'discard', cards: r.draw ?? [] }
        : null;
    case 'chanEnact':
      return id === r.nominee
        ? { ...base, kind: 'enact', cards: r.passed ?? [], canVeto: canRequestVeto(state) }
        : null;
    case 'vetoAsk':
      return id === r.president ? { ...base, kind: 'vetoAnswer', cards: r.passed ?? [] } : null;
    case 'power': {
      const p = r.power;
      if (id !== r.president || !p) return null;
      if (p.kind === 'peek')
        return { ...base, kind: 'peek', power: 'peek', cards: state.deck.slice(0, 3) };
      const picks = pickable(powerTargets(state, p.kind), (o) =>
        state.exiled.includes(o) ? 'exiled' : state.alive.includes(o) ? 'investigated' : 'executed',
      );
      return { ...base, kind: 'target', power: p.kind, ...picks, done: p.target !== null };
    }
    default:
      return null;
  }
}

export function dossierOf(state: State, id: string): Dossier | null {
  const role = state.role[id];
  if (!state.seats.includes(id) || role === undefined) return null;
  const team = knownTeam(state, id).map((t) => ({ id: t, role: state.role[t] ?? 'fascist' }));
  return { party: partyOf(role), role, team, intel: state.intel[id] ?? [] };
}

export function controllerView(state: State, playerId: string): ShControllerView {
  const seated = state.seats.includes(playerId);
  const status = !seated
    ? 'spectator'
    : state.exiled.includes(playerId)
      ? 'exiled'
      : state.executed.includes(playerId)
        ? 'executed'
        : 'alive';
  const pub = publicView(state);
  const mine = chooserOf(state) === playerId || (state.phase.id === 'vote' && status === 'alive');
  return {
    ...controllerEnvelope(state, GAME_ID, playerId, { statusOf: statusOf(state) }),
    ...timing(state),
    ...pub,
    lastCall: pub.lastCall && mine,
    dossier: dossierOf(state, playerId),
    status,
    act: status === 'alive' ? actFor(state, playerId) : null,
  };
}

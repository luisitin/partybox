// Room chaos: drives the pure engine (`applyRoomEvent`) with a random but seeded stream of joins,
// leaves, kicks, VIP powers from VIPs and non-VIPs, resumes with right and wrong tokens, inputs from
// players/spectators/strangers, clock jumps past the grace and handover limits, and enough ticks
// and bot inputs for every started game to finish. Room invariants run after every event; the
// whole event log replays to prove the engine is deterministic.
import type { EngineDeps, RoomEvent, RoomState } from '@partybox/engine';
import { applyRoomEvent, createRoom, nextWakeAt } from '@partybox/engine';
import type { AnyGameDefinition, Rng } from '@partybox/shared';
import { AVATAR_IDS, LIMITS, createRng } from '@partybox/shared';
import { T0, hashState } from '@partybox/game-sdk/testing';
import { checkRoom } from './invariants';

export interface RoomChaosOptions {
  seed: number;
  steps: number;
  games: Record<string, AnyGameDefinition>;
  capacity?: number;
}

export interface RoomViolation {
  at: number;
  detail: string;
}

export interface RoomChaosResult {
  seed: number;
  events: RoomEvent[];
  violations: RoomViolation[];
  gamesStarted: number;
  gamesFinished: number;
  finalRoom: RoomState;
  hash: string;
  /** Interesting non-failures (name collisions accepted, etc.) for SPEC findings. */
  notes: string[];
}

const NAMES = [
  'Ana',
  'ana',
  'ANA',
  'Ben',
  'Аna', // Cyrillic A
  'éva',
  'éva',
  '\u{1F600}',
  'a b',
  'a  b',
  ' Ben ',
  'x'.repeat(16),
  'x'.repeat(17),
  '',
  '   ',
  '<b>Cy</b>',
  '__proto__',
  'constructor',
  'Dee',
  'Eve',
  'Fay',
  'Gus',
  'Hal',
  'Ivy',
  'Jo',
  'Kim',
  'Lou',
  'Max',
  'Ned',
  'Oz',
];

interface Identity {
  id: string;
  token: string;
  name: string;
}

export function runRoomChaos(options: RoomChaosOptions): RoomChaosResult {
  const rng = createRng(options.seed);
  const deps: EngineDeps = { games: options.games };
  const gameIds = Object.keys(options.games);
  let room = createRoom({ code: 'ZZZZ', now: T0, capacity: options.capacity });
  let now = T0;
  const events: RoomEvent[] = [];
  const violations: RoomViolation[] = [];
  const notes = new Set<string>();
  const identities: Identity[] = [];
  let minted = 0;
  let gamesStarted = 0;
  let gamesFinished = 0;
  let playingSince: number | null = null;

  const apply = (event: RoomEvent): void => {
    const before = room;
    let result;
    try {
      result = applyRoomEvent(before, event, deps);
    } catch (err) {
      violations.push({
        at: events.length,
        detail: `applyRoomEvent threw on ${event.type}: ${String(err)}`,
      });
      events.push(event);
      return;
    }
    events.push(event);
    for (const detail of checkRoom(before, result, deps))
      violations.push({ at: events.length - 1, detail });
    room = result.room;
    if (before.status !== 'playing' && room.status === 'playing') {
      gamesStarted += 1;
      playingSince = now;
    }
    if (before.status === 'playing' && room.status !== 'playing') {
      if (room.status === 'results') gamesFinished += 1;
      playingSince = null;
    }
    if (before.game?.state.phase.paused && room.game && !room.game.state.phase.paused)
      playingSince = now; // paused time does not count against the liveness budget
    if (event.type === 'join' && !event.existingToken && room.players[event.playerId]) {
      const mine = room.players[event.playerId]?.name ?? '';
      for (const p of Object.values(before.players))
        if (
          p.name !== mine &&
          p.name.normalize('NFKC').toLowerCase() === mine.normalize('NFKC').toLowerCase()
        )
          notes.add(`join accepted "${mine}" next to look-alike "${p.name}"`);
    }
  };

  /** The host ticks at every wake time (ADR-022); crossing one without a tick is unrealistic. */
  const advanceTo = (target: number): void => {
    for (let guard = 0; guard < 50; guard++) {
      const at = nextWakeAt(room);
      if (at === null || at > target) break;
      now = Math.max(now, at);
      apply({ type: 'tick', now });
    }
    now = Math.max(now, target);
  };

  const ids = (): string[] => Object.keys(room.players);
  const someone = (): string | undefined => rng.pick(ids().length ? ids() : ['nobody']);
  const vipOrAnyone = (): string => room.vipId ?? someone() ?? 'nobody';
  const nonVip = (): string | undefined => {
    const others = ids().filter((id) => id !== room.vipId);
    return others.length ? rng.pick(others) : undefined;
  };

  const join = (resume: boolean): void => {
    minted += 1;
    const fresh = { id: `u${minted}`, token: `tok-${minted}` };
    if (resume && identities.length > 0) {
      const who = rng.pick(identities);
      const token = rng.chance(0.1) ? `bogus-${minted}` : who.token;
      apply({
        type: 'join',
        now,
        playerId: fresh.id,
        token: fresh.token,
        name: who.name,
        avatarId: 'fox',
        existingToken: token,
      });
      return;
    }
    const name = rng.pick(NAMES);
    const avatarId = rng.chance(0.05) ? 'dragon' : rng.pick([...AVATAR_IDS]);
    apply({ type: 'join', now, playerId: fresh.id, token: fresh.token, name, avatarId });
    if (room.players[fresh.id])
      identities.push({ ...fresh, name: room.players[fresh.id]?.name ?? name });
  };

  const botInput = (playerId: string): void => {
    const running = room.game;
    if (!running) {
      apply({ type: 'input', now, playerId, input: { type: 'answer', text: 'lobby' } });
      return;
    }
    const game = options.games[running.gameId];
    if (!game) return;
    let input: unknown = null;
    try {
      input = game.bot.sampleInput(running.state, playerId, rng);
    } catch {
      /* the bot-throws invariant belongs to the game runner */
    }
    if (input === null) input = { nope: true };
    apply({ type: 'input', now, playerId, input });
  };

  const vipAction = (playerId: string): void => {
    const roll = rng.float();
    const target = someone() ?? 'nobody';
    const action: Extract<RoomEvent, { type: 'vip' }>['action'] =
      roll < 0.15
        ? { action: 'selectGame', gameId: rng.chance(0.1) ? 'nope' : rng.pick(gameIds) }
        : roll < 0.25
          ? {
              action: 'updateSettings',
              settings: { answerSeconds: rng.pick([10, 5, 1000, 12.5, -1]), bogus: 'x' },
            }
          : roll < 0.45
            ? { action: 'start' }
            : roll < 0.55
              ? { action: rng.pick(['skip', 'pause', 'resume', 'end'] as const) }
              : roll < 0.65
                ? { action: 'kick', playerId: rng.chance(0.1) ? playerId : target }
                : roll < 0.75
                  ? { action: 'transferVip', playerId: rng.chance(0.1) ? playerId : target }
                  : roll < 0.85
                    ? { action: rng.pick(['lock', 'unlock'] as const) }
                    : roll < 0.93
                      ? { action: 'playAgain' }
                      : { action: 'toLobby' };
    apply({ type: 'vip', now, playerId, action, seed: rng.int(1, 1_000_000) });
  };

  for (let step = 0; step < options.steps; step++) {
    // Time moves; sometimes far enough for the grace/handover rules to bite.
    const jump = rng.float();
    advanceTo(
      now +
        (jump < 0.03
          ? LIMITS.disconnectGraceMs + 1
          : jump < 0.08
            ? LIMITS.vipHandoverMs + 1
            : rng.int(0, 2500)),
    );
    const roll = rng.float();
    if (roll < 0.12) join(rng.chance(0.4));
    else if (roll < 0.18) apply({ type: 'disconnect', now, playerId: someone() ?? 'nobody' });
    else if (roll < 0.21) apply({ type: 'leave', now, playerId: someone() ?? 'nobody' });
    else if (roll < 0.36) vipAction(vipOrAnyone());
    else if (roll < 0.4) {
      const other = nonVip();
      if (other) vipAction(other);
    } else if (roll < 0.62) botInput(someone() ?? 'nobody');
    else if (roll < 0.65) botInput(rng.pick(['ghost', '', '__proto__']));
    else if (roll < 0.8) {
      const at = nextWakeAt(room);
      if (at !== null && at > now && rng.chance(0.7)) now = at;
      apply({ type: 'tick', now });
    } else if (room.status === 'playing') {
      // Let every player answer so phases can end on "all submitted" too.
      for (const id of rng.shuffle(ids())) if (room.status === 'playing') botInput(id);
    } else if (room.status === 'lobby' || room.status === 'results') {
      if (room.vipId && gameIds.length) {
        apply({
          type: 'vip',
          now,
          playerId: room.vipId,
          action: { action: 'selectGame', gameId: rng.pick(gameIds) },
        });
        apply({
          type: 'vip',
          now,
          playerId: room.vipId,
          action: { action: 'start' },
          seed: rng.int(1, 1_000_000),
        });
      }
    }
    if (playingSince !== null && room.game && !room.game.state.phase.paused) {
      const game = options.games[room.game.gameId];
      const budget = (game?.manifest.estimatedMinutes ?? 5) * 3 * 60_000;
      if (now - playingSince > budget) {
        violations.push({
          at: events.length,
          detail: `game ${room.game.gameId} stuck in ${room.game.state.phase.id} for ${Math.round((now - playingSince) / 1000)} s`,
        });
        break;
      }
    }
  }

  // Determinism: the log must rebuild the same room.
  const hash = hashState(room);
  let again = createRoom({ code: 'ZZZZ', now: T0, capacity: options.capacity });
  try {
    for (const e of events) again = applyRoomEvent(again, e, deps).room;
    if (hashState(again) !== hash)
      violations.push({
        at: events.length,
        detail: 'room replay hash differs (engine non-determinism)',
      });
  } catch (err) {
    violations.push({ at: events.length, detail: `replay threw: ${String(err)}` });
  }
  return {
    seed: options.seed,
    events,
    violations,
    gamesStarted,
    gamesFinished,
    finalRoom: room,
    hash,
    notes: [...notes],
  };
}

export function roomRng(seed: number): Rng {
  return createRng(seed);
}

// Drives bot players (ADR-028). Bots are ordinary room players whose `bot` field is set — added
// by a person from the lobby or by the dev API. This manager watches every room and, for each
// bot, answers through the game's own `bot.sampleInput` on a strategy-driven delay.
import type { EngineDeps, RoomState } from '@partybox/engine';
import { createRng, hashString } from '@partybox/shared';
import type { BotStrategy, Rng } from '@partybox/shared';
import type { Clock } from './clock';
import type { Host } from './host';

export { BOT_STRATEGIES } from '@partybox/shared';
export type { BotStrategy } from '@partybox/shared';

interface Driver {
  id: string;
  code: string;
  strategy: BotStrategy;
  rng: Rng;
  pending: NodeJS.Timeout | null;
  /** Fixed reaction time (dev API), else strategy-based. */
  reactionMs: number | null;
  /** `phase.startedAt` of the last input it sent: a follow-up tap in the same phase comes quicker. */
  actedIn: number | null;
}

export interface BotManager {
  /** Adds `count` ownerless bots through the engine; returns their player ids. */
  add(code: string, count: number, strategy: BotStrategy, reactionMs?: number): string[];
  /** Removes every bot (dev API reset), or only a room's. */
  removeAll(code?: string): void;
  ids(code: string): string[];
  close(): void;
}

function delayFor(driver: Driver, room: RoomState, now: number): number | null {
  if (driver.reactionMs !== null) return driver.reactionMs;
  const deadline = room.game?.state.phase.deadline ?? null;
  switch (driver.strategy) {
    case 'idle':
      return null;
    case 'fast':
      return 300;
    case 'slow':
      return deadline === null ? 3000 : Math.max(200, deadline - now - 700);
    case 'chaos':
      return driver.rng.int(100, 2500);
    case 'random':
      // A thumb already on the screen taps again sooner than it first reacted: a bot with four
      // Bingo cards under 3 s calls otherwise fell behind and never completed a line (loop 221).
      return room.game?.state.phase.startedAt === driver.actedIn
        ? driver.rng.int(300, 1200)
        : driver.rng.int(800, 4500);
  }
}

export function createBotManager(host: Host, deps: EngineDeps, clock: Clock): BotManager {
  const drivers = new Map<string, Driver>();
  const reactionOverride = new Map<string, number>();

  /** Keeps the driver set equal to the bots currently in the rooms. */
  function sync(room: RoomState): void {
    const present = new Set<string>();
    for (const p of Object.values(room.players)) {
      if (!p.bot) continue;
      present.add(p.id);
      if (!drivers.has(p.id))
        drivers.set(p.id, {
          id: p.id,
          code: room.code,
          strategy: p.bot.strategy,
          rng: createRng(hashString(p.id)),
          pending: null,
          reactionMs: reactionOverride.get(p.id) ?? null,
          actedIn: null,
        });
    }
    for (const [id, driver] of drivers) {
      if (driver.code !== room.code || present.has(id)) continue;
      if (driver.pending) clearTimeout(driver.pending);
      drivers.delete(id);
    }
  }

  function act(driver: Driver): void {
    driver.pending = null;
    const room = host.get(driver.code);
    if (!room || room.status !== 'playing' || !room.game || clock.isFrozen()) return;
    const game = deps.games[room.game.gameId];
    if (!game || !Object.hasOwn(room.game.state.players, driver.id)) return;
    if (driver.strategy === 'chaos' && driver.rng.chance(0.1)) {
      host.dispatch(driver.code, { type: 'input', playerId: driver.id, input: { nope: true } });
      return;
    }
    let input: unknown = null;
    try {
      input = game.bot.sampleInput(room.game.state, driver.id, driver.rng);
    } catch (err) {
      console.warn(`[bots] sampleInput threw for ${driver.id}: ${String(err)}`);
      return;
    }
    if (input === null) return;
    driver.actedIn = room.game.state.phase.startedAt;
    host.dispatch(driver.code, { type: 'input', playerId: driver.id, input });
  }

  function consider(room: RoomState): void {
    sync(room);
    if (room.status !== 'playing' || !room.game || clock.isFrozen()) return;
    const game = deps.games[room.game.gameId];
    if (!game) return;
    for (const driver of drivers.values()) {
      if (driver.code !== room.code || driver.pending) continue;
      if (!Object.hasOwn(room.game.state.players, driver.id)) continue;
      let wants: unknown = null;
      try {
        // Peek with a throwaway rng so the real one only advances when the bot actually acts.
        // Seeded by the clock too: a seed that only changes when the bot acts gave a probabilistic
        // sampler (Bingo daubs 70 % of the time) the same "no" on every peek — the bot never played.
        wants = game.bot.sampleInput(
          room.game.state,
          driver.id,
          createRng(driver.rng.state().step + clock.now()),
        );
      } catch (err) {
        console.warn(`[bots] peek threw for ${driver.id}: ${String(err)}`);
        continue;
      }
      if (wants === null) continue;
      let delay = delayFor(driver, room, clock.now());
      if (delay === null) continue;
      // I-109 A: the card-pick step — a bot reads its cards like a person: 3–5.5 s after the deal,
      // jittered per bot.
      if (room.game?.state.phase.id === 'intro') {
        delay = Math.max(delay, 3000 + driver.rng.int(0, 2500));
      }
      driver.pending = setTimeout(() => act(driver), delay);
    }
  }

  host.subscribe(consider);
  clock.onChange(() => {
    for (const room of host.rooms()) consider(room);
  });

  return {
    add(code, count, strategy, reactionMs) {
      const ids: string[] = [];
      for (let i = 0; i < count; i++) {
        const { playerId, token } = host.mintPlayer();
        if (reactionMs !== undefined) reactionOverride.set(playerId, reactionMs);
        const result = host.dispatch(code, {
          type: 'bot-add',
          ownerId: null,
          playerId,
          token,
          strategy,
        });
        if (result?.room.players[playerId]) ids.push(playerId);
        else reactionOverride.delete(playerId);
      }
      return ids;
    },
    removeAll(code) {
      for (const room of host.rooms()) {
        if (code && room.code !== code) continue;
        for (const p of Object.values(room.players))
          if (p.bot) host.dispatch(room.code, { type: 'bot-remove', ownerId: null, botId: p.id });
      }
    },
    ids: (code) =>
      Object.values(host.get(code)?.players ?? {})
        .filter((p) => p.bot)
        .map((p) => p.id),
    close() {
      for (const driver of drivers.values()) if (driver.pending) clearTimeout(driver.pending);
      drivers.clear();
    },
  };
}

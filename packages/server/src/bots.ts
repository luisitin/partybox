// Server-played bots for the dev API and e2e: virtual players (no socket) that answer through each
// game's `bot.sampleInput`. Strategies decide *when* (and, for chaos, whether to misbehave).
import type { EngineDeps, RoomState } from '@partybox/engine';
import { AVATAR_IDS, createRng } from '@partybox/shared';
import type { Rng } from '@partybox/shared';
import type { Clock } from './clock';
import type { Host } from './host';

export type BotStrategy = 'random' | 'fast' | 'slow' | 'idle' | 'chaos';
export const BOT_STRATEGIES: readonly BotStrategy[] = ['random', 'fast', 'slow', 'idle', 'chaos'];

interface Bot {
  id: string;
  token: string;
  code: string;
  strategy: BotStrategy;
  reactionMs: number | null;
  rng: Rng;
  pending: NodeJS.Timeout | null;
}

export interface BotManager {
  add(code: string, count: number, strategy: BotStrategy, reactionMs?: number): string[];
  removeAll(code?: string): void;
  ids(code: string): string[];
  close(): void;
}

function delayFor(bot: Bot, room: RoomState, now: number): number | null {
  if (bot.reactionMs !== null) return bot.reactionMs;
  const deadline = room.game?.state.phase.deadline ?? null;
  switch (bot.strategy) {
    case 'idle':
      return null;
    case 'fast':
      return 300;
    case 'slow':
      return deadline === null ? 3000 : Math.max(200, deadline - now - 700);
    case 'chaos':
      return bot.rng.int(100, 2500);
    case 'random':
      return bot.rng.int(500, 4000);
  }
}

export function createBotManager(host: Host, deps: EngineDeps, clock: Clock): BotManager {
  const bots = new Map<string, Bot>();
  let counter = 0;

  function act(bot: Bot): void {
    bot.pending = null;
    const room = host.get(bot.code);
    if (!room || room.status !== 'playing' || !room.game || clock.isFrozen()) return;
    const game = deps.games[room.game.gameId];
    if (!game || !room.game.state.players[bot.id]) return;
    if (bot.strategy === 'chaos' && bot.rng.chance(0.1)) {
      host.dispatch(bot.code, { type: 'input', playerId: bot.id, input: { nope: true } });
      return;
    }
    if (bot.strategy === 'chaos' && bot.rng.chance(0.05)) {
      host.dispatch(bot.code, { type: 'disconnect', playerId: bot.id });
      setTimeout(() => {
        host.dispatch(bot.code, {
          type: 'join',
          playerId: bot.id,
          token: bot.token,
          name: '',
          avatarId: '',
          existingToken: bot.token,
        });
      }, 1500);
      return;
    }
    const input = game.bot.sampleInput(room.game.state, bot.id, bot.rng);
    if (input === null) return;
    host.dispatch(bot.code, { type: 'input', playerId: bot.id, input });
  }

  function consider(room: RoomState): void {
    for (const bot of bots.values()) {
      if (bot.code !== room.code || bot.pending || room.status !== 'playing' || !room.game)
        continue;
      if (clock.isFrozen()) continue;
      const game = deps.games[room.game.gameId];
      if (!game || !room.game.state.players[bot.id]) continue;
      let wants: unknown = null;
      try {
        wants = game.bot.sampleInput(
          room.game.state,
          bot.id,
          createRng(bot.rng.state().seed + bot.rng.state().step),
        );
      } catch {
        continue;
      }
      if (wants === null) continue;
      const delay = delayFor(bot, room, clock.now());
      if (delay === null) continue;
      bot.pending = setTimeout(() => act(bot), delay);
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
        counter += 1;
        const { playerId, token } = host.mintPlayer();
        const bot: Bot = {
          id: playerId,
          token,
          code,
          strategy,
          reactionMs: reactionMs ?? null,
          rng: createRng(counter * 7919),
          pending: null,
        };
        const result = host.dispatch(code, {
          type: 'join',
          playerId,
          token,
          name: `Bot ${counter}`,
          avatarId: AVATAR_IDS[counter % AVATAR_IDS.length] as string,
        });
        if (result?.effects.some((e) => e.type === 'welcome')) {
          bots.set(playerId, bot);
          ids.push(playerId);
        }
      }
      const room = host.get(code);
      if (room) consider(room);
      return ids;
    },
    removeAll(code) {
      for (const bot of [...bots.values()]) {
        if (code && bot.code !== code) continue;
        if (bot.pending) clearTimeout(bot.pending);
        bots.delete(bot.id);
        if (host.get(bot.code)?.players[bot.id])
          host.dispatch(bot.code, { type: 'leave', playerId: bot.id });
      }
    },
    ids: (code) => [...bots.values()].filter((b) => b.code === code).map((b) => b.id),
    close() {
      for (const bot of bots.values()) if (bot.pending) clearTimeout(bot.pending);
      bots.clear();
    },
  };
}

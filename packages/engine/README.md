# @partybox/engine

The PURE room state machine. No I/O, no sockets, no real timers — the host passes `now` in and interprets
the effects the engine returns (ADR-010). Everything here is unit-tested to ≥ 90 % lines.

## Key files (Phase 1)

- `src/room.ts` — `RoomState` + `applyRoomEvent(room, event, now) → { room, effects }`; lifecycle lobby → selecting → playing → results.
- `src/players.ts` — join (name rules, capacity), reconnect by token, spectators, 120 s leave grace, kick.
- `src/vip.ts` — VIP powers, validation, 30 s handover to the longest-connected player.
- `src/runner.ts` — GameRunner: `init`, `reduce`, deadline → `scheduleTimer` effect, view computation, results.
- `src/effects.ts` — effect types. `src/rev.ts` — per-room revision counter.
- `src/index.ts` — the only barrel.

## Test

`pnpm vitest --project engine` · coverage: `pnpm test:coverage`

## Must NOT go here

Sockets, timers, `Date.now`, file or network access, React, game-specific logic, imports of game-sdk/server/client.

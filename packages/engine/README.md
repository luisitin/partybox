# @partybox/engine

The PURE room state machine. No I/O, no sockets, no real timers — the host passes `now` in and interprets
the effects the engine returns (ADR-010). Everything here is unit-tested to ≥ 90 % lines.

## Key files

- `src/room.ts` — `createRoom`, `applyRoomEvent(room, event, deps) → { room, effects }`; dispatch + push collapsing + `rev`.
- `src/players.ts` — join (name rules, capacity, lock), resume by token, disconnect, removal, spectators, 120 s expiry, 30 s VIP handover.
- `src/vip.ts` — VIP powers, validation, 30 s handover to the longest-connected player.
- `src/runner.ts` — GameRunner: `startGame`, `applyGameEvent` (catches throwing reducers), `fireDueTimer` (once per phase instance), `nextWakeAt`.
- `src/settings.ts` — defaults + coercion against a manifest `settings` spec.
- `src/views.ts` — `snapshot`, `tvView`, `controllerView` (adds `vip`; degrades to a bare envelope if a game view throws).
- `src/types.ts` — `RoomState`, `RoomEvent`, `Effect`, `EngineDeps`. `rev` lives on the room and bumps once per push.
- `src/index.ts` — the only barrel.

## Test

`pnpm vitest --project engine` · coverage: `pnpm test:coverage`

## Must NOT go here

Sockets, timers, `Date.now`, file or network access, React, game-specific logic, imports of game-sdk/server/client.

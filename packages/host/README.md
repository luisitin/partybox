# @partybox/host

The room host: owns the rooms, feeds events to the pure engine, and turns the engine's effects into
pushes, toasts, kicks and timers. It is the **only** stateful loop in PartyBox, and it is
platform-neutral (ADR-034) — the same code runs in the Node server on your LAN and inside the VIP's
browser tab on the GitHub Pages build. Everything that differs lives behind two interfaces:

| Interface   | LAN (`packages/server`)             | Web (`packages/web`)                    |
| ----------- | ----------------------------------- | --------------------------------------- |
| `Transport` | Socket.IO rooms                     | WebRTC data channels + a local loopback |
| `Clock`     | real time, freezable by the dev API | real time                               |

## Key files

- `src/host.ts` — `createHost({ deps, clock, transport })`: `dispatch`, `resend`, `reset`,
  `mintPlayer`, `subscribe`. Interprets `welcome` / `push` / `toast` / `kicked` / `error` / `log`,
  pushes `room` and `view` with a monotonic `rev`, and keeps exactly one timer per room
  (re-derived from `nextWakeAt` after every event, ADR-004/ADR-022). Skips the TV push when the
  TV view is byte-identical to the last one.
- `src/clock.ts` — the injectable clock. Freezing it stops every room timer until `set()` moves
  time forward, which is what makes screenshots and replays reproducible (docs/DEV_API.md).
- `src/ids.ts` — player ids, tokens and the room-code seed, from Web Crypto so the file bundles
  for the browser as well as Node.
- `src/tiny-game.helper.ts` — the smallest legal game + a recording transport, shared with the
  server's bot tests.

## Test

`pnpm vitest --project host`

## Must NOT go here

`node:*` imports, Socket.IO, Fastify, React, game logic, view computation. If it needs a specific
runtime it belongs in `packages/server` (Node) or `packages/web` (browser); if it needs no I/O at
all it belongs in `packages/engine`.

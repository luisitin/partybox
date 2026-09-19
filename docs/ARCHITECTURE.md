# Architecture

## Runtime topology

Two deployments, one codebase (ADR-034). **LAN:** one Node process (`packages/server`) on one port
(default **42069**, `--port` / `PORT`), bound to `0.0.0.0`. **Web (GitHub Pages, `packages/web`):**
no process at all — the first player's browser tab runs `@partybox/host` and every other player
opens a WebRTC data channel to it; there is no `/tv`, `/preview` or `/api`, and each device renders
the stage and the controller on one page. `WEB_DEPLOY.md` is the guide. The table below is the LAN app.

| Route                                                       | Who                                     | What                                                    |
| ----------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------- |
| `/tv`                                                       | any TV / monitor browser (many at once) | read-only stage: join URL + QR, room code, lobby, game  |
| `/`                                                         | phones                                  | controller: join → lobby → per-game controls            |
| `/preview/:gameId/:fixture?view=tv\|controller&player=<id>` | tools, dev                              | renders a fixture with no live state (dev only)         |
| `/api/dev/*`                                                | tools, AI sessions                      | deterministic control API (`docs/DEV_API.md`), dev only |
| `/healthz`                                                  | anyone                                  | `{ ok, version, rooms, uptime }`                        |

Dev mode (`pnpm dev`) mounts Vite in middleware mode inside Fastify (ADR-006) so phones still use one URL.
Prod (`pnpm start`) serves `packages/client/dist`. Nothing touches the internet at runtime (ADR-012).
The web build is the documented exception: it needs a signalling broker to introduce two browsers.

## Data flow

```
phone (controller)                    server (packages/server)                         TVs
──────────────────                    ────────────────────────                         ───
join/input/vip ──socket.io──▶ zod-validate payload (shared/protocol)
                              │  invalid → `error` event, ignored
                              ▼
                        engine.applyRoomEvent(room, event, now)      ← pure (packages/engine)
                              (driven by packages/host — the same loop in the web build)
                              │   ├─ room lifecycle: lobby / selecting / playing / results
                              │   ├─ VIP rules, reconnect, spectators
                              │   └─ GameRunner: game.reduce(state, gameEvent)   ← pure (games/<id>/server)
                              ▼
                        { room', effects[] }
                              │   effects: push · toast · kicked · error · log
                              ▼
                        host interprets effects (the ONLY place with I/O)
                              ├─ game.controllerView(state, playerId) ──`view {rev}`──▶ each phone
                              ├─ game.tvView(state) ──────────────────`view {rev}`──▶ every TV
                              └─ engine.nextWakeAt(room') → ONE setTimeout per room → later: `tick` event → same path
```

- The server is authoritative. Clients render what they are pushed; they never compute game state.
- Every push carries a monotonically increasing `rev`; clients drop out-of-order pushes.
- **Timers are data** (ADR-004, ADR-022): games set `state.phase.deadline`; after every event the host asks
  `nextWakeAt(room)` (earliest of: game deadline, VIP handover, disconnect expiry) and keeps exactly one
  `setTimeout` per room that sends a `tick`. On a tick the engine fires the `timer` event once per
  `phase.id + startedAt`, hands the VIP over, and expires long-disconnected players. Ticks are idempotent.
  A frozen dev clock never reaches a deadline until `/api/dev/clock` advances it.
- `now` is injected everywhere (server `clock.ts`); engine and games never read the wall clock.

## Packages and dependency direction

```
games/<id> ──▶ game-sdk ──▶ shared ◀── engine ◀── host ◀── server ──▶ games/<id>/server (registry)
                  ▲                                            client ──▶ games/<id>/client (registry)
                  └────────────── client                       web ──▶ client, host, engine, games/*
                                                               sim, e2e ──▶ anything
                                        nothing ──▶ sim, e2e, web
```

`packages/host` is the room loop with the platform taken out of it: `Transport` and `Clock` are the
only ways it touches the world. `packages/server` gives it Socket.IO and a freezable clock;
`packages/web` gives it WebRTC data channels plus a loopback for the host's own phone (ADR-034).

Enforced by `eslint.config.js` (package-name bans) and `.dependency-cruiser.cjs` (path rules), both in `pnpm verify`.

## Game discovery

Explicit and generated (ADR-003): `scripts/gen-registry.ts` scans `games/*/manifest.json` and writes
`packages/server/src/games.generated.ts` and `packages/web/src/games.generated.ts` (server
definitions, for the Node host and the browser host) and `packages/client/src/games.generated.ts`
(lazy client modules). A new game therefore reaches both builds with no extra step. Folders starting with `_` (the template) are tested but not registered.
`pnpm verify` fails when the generated files are stale or a game folder lacks a required file.

## Where state lives

| State                       | Owner                          | Notes                                            |
| --------------------------- | ------------------------------ | ------------------------------------------------ |
| Rooms, players, tokens, VIP | engine `RoomState` (in memory) | lost on restart by design (no DB, ADR-005)       |
| Game state                  | `RoomState.game.state`         | JSON, ≤ 256 KB, deterministic                    |
| Pending timer               | server host                    | derived from state; re-derived after every event |
| Controller token            | phone `localStorage`           | reconnect resumes identical controller state     |
| TV mute                     | TV `localStorage`              | several TVs may run at once                      |

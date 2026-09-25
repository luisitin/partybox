# Architecture

## Runtime topology

One Node process (`packages/server`) on one port (default **42069**, `--port` / `PORT`), bound to `0.0.0.0`.

| Route                                                       | Who                                     | What                                                                                                 |
| ----------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/tv`                                                       | any TV / monitor browser (many at once) | read-only stage: join URL + QR, room code, lobby, game                                               |
| `/`                                                         | phones                                  | controller: join → lobby → per-game controls                                                         |
| `/preview/:gameId/:fixture?view=tv\|controller&player=<id>` | tools, dev                              | renders a fixture with no live state (dev only)                                                      |
| `/api/dev/*`                                                | tools, AI sessions                      | deterministic control API (`docs/DEV_API.md`), dev only                                              |
| `/healthz`                                                  | anyone                                  | `{ ok, version, rooms, uptime }`                                                                     |
| `/api/funnel`                                               | the host, tools                         | per-room join counts (I-077): opened / attempted / joined / failed; private rooms left out (I-785 B) |
| `POST /api/rooms`                                           | phones                                  | opens a room (ADR-043), a chosen 4-letter code or a fresh one; 3 per address, then 1 per 20 s        |

`/api/info` also carries `publicUrl`: the Cloudflare quick tunnel's address while one is live
(`PARTYBOX_PUBLIC_URL`, else the newest address in `cloudflared.log` while a `cloudflared` process
runs — `packages/server/src/public-url.ts`). Share hands it out; the TV's main QR stays on the LAN
address, and while a tunnel is live `publicQrUrl` / `publicQrSvg` (the tunnel's join link with the
house room, and its QR) put a second, smaller code on the TV's card for friends elsewhere (I-646).

Dev mode (`pnpm dev`) mounts Vite in middleware mode inside Fastify (ADR-006) so phones still use one URL.
Prod (`pnpm start`) serves `packages/client/dist`. Nothing touches the internet at runtime (ADR-012).
Its cache rules (`packages/server/src/static-cache.ts`, Part 00 §2.4): Vite's hashed `/assets/*` are
`immutable` for a year and go out as the `.br`/`.gz` siblings the build writes next to every text
asset over 1 KB; HTML (index and the SPA fallback) is `no-cache`, because the launcher rebuilds on
every start; `/music` and `/sfx` keep their names across builds, so a week, never immutable.

## Data flow

```
phone (controller)                    server (packages/server)                         TVs
──────────────────                    ────────────────────────                         ───
join/input/vip ──socket.io──▶ zod-validate payload (shared/protocol)
                              │  invalid → `error` event, ignored
                              ▼
                        engine.applyRoomEvent(room, event, now)      ← pure (packages/engine)
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
games/<id> ──▶ game-sdk ──▶ shared ◀── engine ◀── server ──▶ games/<id>/server (generated registry)
                  ▲                                 client ──▶ games/<id>/client (generated registry)
                  └────────────── client            sim, e2e ──▶ anything;  nothing ──▶ sim, e2e
```

Enforced by `eslint.config.js` (package-name bans) and `.dependency-cruiser.cjs` (path rules), both in `pnpm verify`.

## Game discovery

Explicit and generated (ADR-003): `scripts/gen-registry.ts` scans `games/*/manifest.json` and writes
`packages/server/src/games.generated.ts` (server definitions) and `packages/client/src/games.generated.ts`
(lazy client modules). Folders starting with `_` (the template) are tested but not registered.
`pnpm verify` fails when the generated files are stale or a game folder lacks a required file.

## Where state lives

| State                       | Owner                          | Notes                                            |
| --------------------------- | ------------------------------ | ------------------------------------------------ |
| Rooms, players, tokens, VIP | engine `RoomState` (in memory) | lost on restart by design (no DB, ADR-005)       |
| Game state                  | `RoomState.game.state`         | JSON, ≤ 256 KB, deterministic                    |
| Pending timer               | server host                    | derived from state; re-derived after every event |
| Controller token            | phone `localStorage`           | reconnect resumes identical controller state     |
| TV mute                     | TV `localStorage`              | several TVs may run at once                      |

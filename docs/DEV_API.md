# Dev API

HTTP endpoints so tools and AI sessions can drive the app deterministically. All JSON. On in `pnpm dev`;
off in `pnpm start` unless `--dev-api` is passed (then every endpoint answers `403 { error: 'dev api off' }`
when disabled). Implemented in `packages/server/src/dev-api.ts`. All endpoints act on the house room
unless `?room=CODE` is given.

| Method + path                                  | Body                                | Effect                                                                                                                                                                                                             |
| ---------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/dev/reset`                          | —                                   | Drop every room, recreate the house room, unfreeze the clock.                                                                                                                                                      |
| `POST /api/dev/bots`                           | `{ count, strategy?, reactionMs? }` | Add server-played bots (names `Bot 1…`) that answer via `bot.sampleInput`. Strategies: `random` (default), `fast`, `slow`, `idle`, `chaos`.                                                                        |
| `POST /api/dev/start`                          | `{ gameId, settings?, seed? }`      | Select and start a game as if the VIP did it. `seed` makes the run reproducible.                                                                                                                                   |
| `POST /api/dev/event`                          | `{ event }`                         | Inject a raw `GameEvent` into the running game (after schema validation).                                                                                                                                          |
| `POST /api/dev/skip`                           | —                                   | VIP skip of the current phase.                                                                                                                                                                                     |
| `POST /api/dev/load-state`                     | `{ gameId, state }`                 | Replace the running game's state (e.g. with a fixture). Starts the game if needed.                                                                                                                                 |
| `GET /api/dev/state`                           | —                                   | `{ room: RoomState                                                                                                                                                                                                 | null, nextWakeAt, clock: { now, frozen }, bots: string[], rooms: string[] }`. Game state lives at `room.game.state` (`room.game.state.phase.id`= current phase);`room.players` is keyed by id. |
| `POST /api/dev/clock`                          | `{ freeze, now? }`                  | Freeze/unfreeze the injectable clock; optionally set `now`. Frozen ⇒ timers never fire until `now` is advanced.                                                                                                    |
| `POST /api/dev/disconnect`                     | `{ playerId, seconds }`             | Simulate a phone dropping for `seconds` (server-side; the socket is not touched).                                                                                                                                  |
| `POST /api/dev/act`                            | `{ playerId?, seed? }`              | Make real (non-bot) players move: for the given player or every human in the game, dispatch `bot.sampleInput` as their input. Returns `{ acted[], status, phase }`. What `pnpm e2e` uses to play through browsers. |
| `GET /api/dev/preview/:gameId/:fixture?view=tv | controller&player=<id>`             | —                                                                                                                                                                                                                  | Render a fixture's view without touching live state (used by `/preview`). The fixture's deadline is rebased to "now + phase length" so timers look real.                                       |     | controller&player=<id>` | —   | Render a fixture's view without touching live state (used by `/preview`). |

## Typical flows

```bash
# Screenshot every phase of a game with a frozen clock
curl -X POST :42069/api/dev/reset
curl -X POST :42069/api/dev/bots -d '{"count":4}' -H 'content-type: application/json'
curl -X POST :42069/api/dev/clock -d '{"freeze":true}' -H 'content-type: application/json'
curl -X POST :42069/api/dev/start -d '{"gameId":"wisecrack","seed":1}' -H 'content-type: application/json'
# … screenshot, then:
curl -X POST :42069/api/dev/skip
```

Also public (not dev-only): `GET /api/games` → registered game summaries (id, name, player bounds, settings spec); `GET /api/info` → `{ version, publicHost, port, tvUrl, joinUrl, qrSvg, rooms[], houseRoom, dev }` — what the TV frame and the join form read.

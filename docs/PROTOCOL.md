# Protocol (Socket.IO)

Source of truth: `packages/shared/src/protocol.ts` (zod schemas for every payload). The server validates
every incoming payload; invalid → `error { code, message }` back to the sender and the payload is ignored.
The server never crashes on client input. The server is authoritative; clients render pushed views.

## Controller (phone) → server

| Event   | Payload                                             | Notes                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `join`  | `{ roomCode?, name, avatarId, token? }`             | `token` re-authenticates a previous player (reconnect). Without a token, a name that belongs to a currently DISCONNECTED player resumes that player (ADR-029). Without a code and with exactly one open room, joins that room.                                                                                                                                                                  |
| `input` | `{ seq, input }`                                    | `input` is validated against the current game's `inputSchema`; `seq` is a per-client counter used to ack/dedupe.                                                                                                                                                                                                                                                                                |
| `vip`   | `{ action, ... }`                                   | `selectGame { gameId }`, `updateSettings { settings }`, `start`, `skip`, `pause`, `resume`, `end`, `kick { playerId }`, `transferVip { playerId }`, `lock`, `unlock`, `playAgain`, `toLobby`, `setRecording { on }` (ADR-035; any time but mid-game), `setMusicOnPhones { on }` (ADR-040), `setPhoneOnly { on }` (ADR-041). Ignored (and counted for rate limiting) when the sender is not VIP. |
| `bot`   | `{ action: 'add' }` / `{ action: 'remove', botId }` | Any player adds a bot they own (max 4, ADR-028); owners and the VIP remove them. Costs 5 rate-limit tokens.                                                                                                                                                                                                                                                                                     |
| `nudge` | `{}`                                                | I-070: a non-VIP in the lobby nudges the VIP — one toast to the room naming the sender. Costs 10 rate-limit tokens; the engine ignores it outside the lobby and from the VIP.                                                                                                                                                                                                                   |
| `leave` | `{}`                                                | Explicit leave: player removed immediately (no 120 s grace).                                                                                                                                                                                                                                                                                                                                    |

## Server → controller

| Event     | Payload                                   | When                                                         |
| --------- | ----------------------------------------- | ------------------------------------------------------------ |
| `welcome` | `{ playerId, token, room: RoomSnapshot }` | after a successful `join`                                    |
| `room`    | `{ rev, room: RoomSnapshot }`             | lobby / selecting / results changes                          |
| `view`    | `{ rev, view: ControllerView & { vip } }` | during play, whenever the player's view changes              |
| `toast`   | `{ kind, text }`                          | VIP transfer, kicked players, etc.                           |
| `error`   | `{ code, message }`                       | invalid payload, name taken, room full, locked, rate limited |
| `kicked`  | `{ reason }`                              | then the socket is closed                                    |

## TV → server / server → TV

`tv:join { roomCode? }` → server pushes `room`, `view { rev, view: TvView & { vip }, at }`, `toast`. `roomCode` defaults to the house room.
TVs never send _player_ events (`join`, `input`, `leave`, `vip`, `bot` from a TV socket are ignored). The TV
is the host's screen (ADR-031): `tv:vip { action, … }` (same payload as `vip`) runs any VIP action with the
engine's `host` flag — no VIP check, every other rule intact — and `tv:bot { action: 'add' }` /
`{ action: 'remove', botId }` adds ownerless bots or removes any bot. Refusals come back as `error`.

## `rev` ordering

Every `room` and `view` push carries a per-room, monotonically increasing `rev`. Clients keep the last
`rev` they applied and drop anything lower or equal. Views are pushed in full (they are small).

## Limits

| Limit             | Value                                                           | Where                                           |
| ----------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| inputs per socket | 20 / s (token bucket)                                           | `packages/server/src/sockets.ts`                |
| max payload       | 16 KB (game may raise via `manifest.maxInputBytes`, cap 256 KB) | Socket.IO `maxHttpBufferSize` + per-event check |
| heartbeat         | Socket.IO ping 10 s / timeout 20 s                              | server options                                  |
| disconnect grace  | 120 s, then the player is marked left (still in results)        | engine                                          |
| VIP handover      | VIP disconnected > 30 s → longest-connected player              | engine                                          |

## RoomSnapshot

```ts
{ code, status: 'lobby' | 'selecting' | 'playing' | 'results', locked, players: PlayerPublic[], vip: string | null,
  selectedGameId: string | null, settings: Settings, results: GameResults | null, capacity: number, games: GameSummary[],
  recording: boolean }
```

`canStart` is computed by the engine (`docs/GLOSSARY.md`). Exact shapes: `packages/shared/src/protocol.ts`.

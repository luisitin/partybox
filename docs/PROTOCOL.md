# Protocol (Socket.IO)

Source of truth: `packages/shared/src/protocol.ts` (zod schemas for every payload). The server validates
every incoming payload; invalid → `error { code, message }` back to the sender and the payload is ignored.
The server never crashes on client input. The server is authoritative; clients render pushed views.

## Controller (phone) → server

| Event   | Payload                                             | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `join`  | `{ roomCode?, name, avatarId, token? }`             | `token` re-authenticates a previous player (reconnect). Without a token, a name that belongs to a currently DISCONNECTED player resumes that player (ADR-029). Without a code and with exactly one open room, joins that room.                                                                                                                                                                                                                                                                                                     |
| `input` | `{ seq, input }`                                    | `input` is validated against the current game's `inputSchema`; `seq` is a per-client counter used to ack/dedupe.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `vip`   | `{ action, ... }`                                   | `selectGame { gameId }`, `updateSettings { settings }`, `start`, `skip`, `pause`, `resume`, `end`, `kick { playerId }`, `transferVip { playerId }`, `lock`, `unlock`, `playAgain`, `toLobby`, `setRecording { on }` (ADR-035; any time but mid-game), `setMusicOnPhones { on }` (ADR-040), `setPhoneOnly { on }` (ADR-041), `reclaimVip` (I-347: only from the `formerVip` whose role passed on mid-game; until the next game starts or the role moves again). Ignored (and counted for rate limiting) when the sender is not VIP. |
| `bot`   | `{ action: 'add' }` / `{ action: 'remove', botId }` | Any player adds a bot they own (max 4, ADR-028); owners and the VIP remove them. Costs 5 rate-limit tokens.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `nudge` | `{}`                                                | I-070: a non-VIP in the lobby nudges the VIP — one toast to the room naming the sender. Costs 10 rate-limit tokens; the engine ignores it outside the lobby and from the VIP.                                                                                                                                                                                                                                                                                                                                                      |
| `vote`  | `{ gameId: string \| null }`                        | I-650: a person (never a bot) votes for the next game between games — one vote, changeable, `null` takes it back. Costs 2 rate-limit tokens; ignored mid-game and for an unknown game. The snapshot's `votes` (player id → game id) keeps only people still in the room and clears when a game starts.                                                                                                                                                                                                                             |
| `leave` | `{}`                                                | Explicit leave: player removed immediately (no 120 s grace).                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## Server → controller

| Event     | Payload                                   | When                                                         |
| --------- | ----------------------------------------- | ------------------------------------------------------------ |
| `catalog` | `Catalog { rev, games: CatalogEntry[] }`  | once per connection, before anything else (ADR-049)          |
| `welcome` | `{ playerId, token, room: RoomSnapshot }` | after a successful `join`                                    |
| `room`    | `{ rev, room: RoomSnapshot }`             | lobby / selecting / results changes                          |
| `view`    | `{ rev, view: ControllerView & { vip } }` | during play, whenever the player's view changes              |
| `toast`   | `{ kind, text }`                          | VIP transfer, kicked players, etc.                           |
| `error`   | `{ code, message }`                       | invalid payload, name taken, room full, locked, rate limited |
| `kicked`  | `{ reason }`                              | then the socket is closed                                    |

## TV → server / server → TV

`tv:join { roomCode? }` → server pushes `room`, `view { rev, view: TvView & { vip }, at }`, `toast`. `roomCode` defaults to the house room. A TV socket gets the `catalog` on connect, like a phone.
TVs never send _player_ events (`join`, `input`, `leave`, `vip`, `bot` from a TV socket are ignored). The TV
is the host's screen (ADR-031): `tv:vip { action, … }` (same payload as `vip`) runs any VIP action with the
engine's `host` flag — no VIP check, every other rule intact — and `tv:bot { action: 'add' }` /
`{ action: 'remove', botId }` adds ownerless bots or removes any bot. Refusals come back as `error`.

## `rev` ordering

Every `room` and `view` push carries a per-room, monotonically increasing `rev`. Clients keep the last
`rev` they applied and drop anything lower or equal. Views are pushed in full (they are small).

I-750 (`host.ts`, `sockets.ts`): the host remembers the room snapshot and view it last sent to each phone
and the snapshot it last sent a room's TVs, and skips an identical one (`rev`/`at` are left out of the
compare), so a Bingo daub by someone else no longer re-sends ~16 KB to every phone; a welcome or a
`resend` clears a phone's entries, so a (re)joined phone always gets both in full (A). While a phone's
connection is busy (not writable, or over 16 KB buffered) its `room`/`view` pushes wait and the newest
of each replaces the waiting one — a slow phone renders the present, not a backlog (B). Messages over
1 KB are deflated (`perMessageDeflate`, 3.6× on a room snapshot, C).

## Everyone asleep (I-746)

During a game a quiet phone keeps its seat: the grace restarts instead of removing it, so a phone that
wakes comes back to its own cards and score (A; after the game the 120 s grace applies). When the last
person's phone drops mid-game the engine pauses the game (the game's own pause) and the snapshot
carries `asleep: true` — the TV shows "Everyone's phone is asleep — wake one to carry on" and the
paused card says it carries on when a phone is back; the first phone back resumes it with the usual
3 · 2 · 1 (B; a pause the VIP had made stays theirs). Nobody back in 5 minutes (`ASLEEP_END_MS`) ends
the game to the lobby with "Nobody came back — the game ended." (C). The VIP-handover deadline is
only scheduled while someone could take over — with nobody connected it sat in the past and re-fired
the host timer back-to-back.

## Limits

| Limit             | Value                                                                                                          | Where                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| inputs per socket | 20 / s (token bucket)                                                                                          | `packages/server/src/sockets.ts`                |
| max payload       | 16 KB (game may raise via `manifest.maxInputBytes`, cap 256 KB)                                                | Socket.IO `maxHttpBufferSize` + per-event check |
| heartbeat         | Socket.IO ping 10 s / timeout 20 s                                                                             | server options                                  |
| disconnect grace  | 120 s, then the player is marked left (still in results); during a game the seat is kept (I-746 A)             | engine                                          |
| VIP handover      | VIP disconnected > 30 s during a game → longest-connected player; none in the lobby, picker or results (I-347) | engine                                          |

## RoomSnapshot

```ts
{ code, status: 'lobby' | 'selecting' | 'playing' | 'results', locked, players: PlayerPublic[], vip: string | null,
  selectedGameId: string | null, selectedGame?: { id, settings: SettingSpec[] }, settings: Settings,
  results: GameResults | null, capacity: number,
  recording: boolean, tonight?: TonightGame[] /* I-652 */, formerVip?: string /* I-347 */ }
```

`tuned?: Record<gameId, Settings>` (I-763, 2026-09-24) is what the VIP tuned per game tonight —
seeded from `<recordings>/tuned-settings.json` on the host PC, so the next party opens at the same
numbers; picking a game reads it, a settings change writes it. Absent until something was tuned.

The game list is not in the snapshot (ADR-049): it is the `catalog`, sent once per connection. A game's
long words come over HTTP when needed: `GET /api/games/:id/about?lang=` (the About sheet: tagline,
description, the three how-to-play steps, one line per setting, ≤ 2 KB) and `GET /api/games/:id/text?lang=`
(the manifest's sentences in that language, keyed by the English: the settings form). `GET /api/catalog`
returns the catalog for tools.

A game's spoken readings (ADR-045) reach the room as the game event `{ type: 'speech', key, ms }` and the
audio as `GET /api/speech/<key>.wav`. A key matches `SPEECH_KEY_PATTERN` (`/^[a-z0-9][a-z0-9-]{5,63}$/`,
so `fake-out-3f9a1c0b2d4e5f60` but never a path); anything else is a 404. The WAV is served
`Cache-Control: public, max-age=31536000, immutable`: a key hashes the engine version, the voice and the
parts, so its audio never changes.

`canStart` is computed by the engine (`docs/GLOSSARY.md`). Exact shapes: `packages/shared/src/protocol.ts`.

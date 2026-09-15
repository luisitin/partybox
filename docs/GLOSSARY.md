# Glossary

| Term             | Meaning                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Room**         | One party. Has a 4-letter code, players, a VIP, a status (`lobby`, `selecting`, `playing`, `results`) and at most one running game. The server boots with one "house" room.   |
| **House room**   | The room created at boot; phones auto-join it when it is the only open room.                                                                                                  |
| **Player**       | `{ id, name, avatarId, token, isVip, connected, joinedAt }`. Name 1–16 chars, unique per room (case-insensitive).                                                             |
| **VIP**          | The admin: first player to join. Picks games, edits settings, starts, skips, pauses, kicks, locks, transfers. Passes to the longest-connected player after 30 s disconnected. |
| **Spectator**    | A player who joined during a game. Sees "waiting for next game"; listed dimly on the TV; auto-included in the next game.                                                      |
| **Token**        | Secret per player stored in the phone's `localStorage`; re-sent on `join` to resume the same player.                                                                          |
| **TV / stage**   | The `/tv` page: read-only observer of a room. Many may be open at once.                                                                                                       |
| **Controller**   | The `/` page on a phone: join form → lobby → per-game controls.                                                                                                               |
| **Game**         | A plugin in `games/<id>/`: a pure `GameDefinition` plus React views, content, fixtures and tests.                                                                             |
| **Manifest**     | `games/<id>/manifest.json`: id, name, player bounds, duration, tags, settings spec.                                                                                           |
| **Phase**        | A stage of a game (`answer`, `vote`, `reveal`…). `state.phase = { id, startedAt, deadline, paused }`. One file per phase under `server/phases/`.                              |
| **Event**        | Input to `reduce`: `input`, `timer`, `player`, `vip`. Always carries `now`.                                                                                                   |
| **Reduce**       | `(state, event) → state`, pure and total. Never throws.                                                                                                                       |
| **Deadline**     | `state.phase.deadline` (ms timestamp) — the engine turns it into exactly one `timer` event. "Timers are data."                                                                |
| **View**         | JSON the game computes from state: `tvView(state)` for every TV, `controllerView(state, playerId)` per phone. Shells render the envelope, game components the rest.           |
| **Envelope**     | The common part of every view: `{ gameId, phaseId, deadline, paused, players[] }` + `vip` added by the engine.                                                                |
| **rev**          | Per-room monotonically increasing revision on every push; clients drop out-of-order pushes.                                                                                   |
| **Seed**         | Number that fixes the game's randomness. `state.rng = { seed, step }`. Same seed + same events ⇒ identical state.                                                             |
| **Fixture**      | `games/<id>/fixtures/<phaseId>.json`: one full state per phase for previews and contract tests.                                                                               |
| **Effect**       | Output of the engine besides the new room state: `push`, `toast`, `kicked`, `scheduleTimer`, `vipChanged`. Only the server interprets effects.                                |
| **Bot**          | A server- or sim-played player that answers with `game.bot.sampleInput`. Strategies: `random`, `fast`, `slow`, `idle`, `chaos`.                                               |
| **Repro**        | `reports/stress/repros/<hash>.json`: seed + event log that `pnpm sim --replay` reproduces exactly.                                                                            |
| **Registry**     | Generated `games.generated.ts` files listing every game (ADR-003).                                                                                                            |
| **Content pack** | `games/<id>/content/*.json` validated by `content/schema.ts`; `spicy` packs are opt-in.                                                                                       |
| **Dev API**      | `/api/dev/*` endpoints for deterministic control (bots, clock freeze, skip, load state).                                                                                      |
| **Preview**      | `/preview/:gameId/:fixture?view=tv                                                                                                                                            | controller&player=<id>` renders a fixture with no live state. |

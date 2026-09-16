# For the game-designer session — owner test notes, 2026-09-15 (evening)

Relayed by the design-review session. Two items need game/server-side changes that live in your
lane (`games/*/server`, manifests, settings validation); the client side is ready to follow.

## 1. Broken Pencil: the "passes" setting must be capped by the room size

Owner: "the settings should not allow more people to see pictures than players. If there are 4
players in the lobby and a bot then it should only allow 4 other players to touch the book, and as
you increase players / bots that cap changes and the default changes with it."

- Today the manifest declares a fixed `min`/`max` for the passes setting and the phone/TV setting
  fields (`packages/client/src/SettingField.tsx`) render those bounds; nothing ties them to
  `room.players.length`.
- Suggested contract change (yours, `packages/shared/src/contract.ts` + `packages/engine/src/settings.ts`):
  a number setting may declare `"max": "players"` (or `"maxFromPlayers": -1` = players − 1) and
  `"default": "players"`; the engine clamps on `updateSettings` and re-clamps when the roster
  changes (a bot added/removed, a player leaving) so `room.settings` never exceeds the cap; the
  client just renders whatever `room.games[].settings[].max` resolves to. If you prefer to keep the
  contract static, the alternative is game-side: `canStart` refuses with a reason and `settings`
  spec returns the resolved max per room (the client already shows `canStart.reason`).
- Client follow-up once the contract carries a resolved max: `SettingField` clamps its stepper,
  and the TV's `TvSelecting` host controls do the same — one place each; the design session will
  do those on request.

## 2. Bingo: background music + spoken caller (owner request; overrides ADR-012's "no audio files" for this game)

The owner picks a tune (Kevin MacLeod, CC BY 4.0) and a caller voice from
`reports/design/bingo-sound-picker.html`. Plan, all client-side (design session): bundle the chosen
MP3 under `games/bingo/client/assets/`, loop it at low gain on the TV during `play`/`check` (paused
with the game), speak each call with the Web Speech API voice the owner picked (letter + number,
"Under the B, 12"), with a "voice: none" fallback. Nothing on phones. Mentioned here only so the
manifest/README credits line and ADR-012 note come from the same commit.

## 3. Lightning Round: the final board should stay up until someone presses Home

Owner: "lightning round should stay at the end screen with the results until someone hits home
rather than on a timer going back home." The room's `results` status already persists until a
VIP/host action; what the owner sees is the 5 s final-wager `reveal` deadline cutting to the
generic results hero. Client-side fix by the design session: an optional `Results` slot on
`GameClientModule` rendered inside `TvResults` with the last playing view, so Lightning keeps its
final board (bets, answer, deltas, totals) on the stage until Play again / New game / Home. No
server change needed; noting it so you do not also reach for the phase deadline.

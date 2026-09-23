# @partybox/game-sdk

Everything a game may import. Re-exports the contract types and `z` from `shared`, adds helpers and UI
primitives, and hosts the contract tests that run against every game.

## Key files

- `src/index.ts` — the PURE public surface: contract types, `z`, rng, reducer/view helpers (what `games/*/server` imports).
- `src/ui.ts` — `@partybox/game-sdk/ui`: the React primitives (what `games/*/client` and the client shells import, ADR-023).
- `src/client-module.ts` — `GameClientModule`, `GameTvProps`, `GameControllerProps` (what `games/<id>/client/index.ts` exports).
- `src/ui/` — `Avatar` (16 inline SVGs), `PlayerChip`, `ServerClockProvider` + `useServerNow` / `useSecondsLeft` / `useServerOffset` (server-time-aware timers).
- `src/rng.ts` — `nextFloat`, `nextInt`, `shuffle`, `pick` on `RngState` (`[value, next]`), `createRng` for bots.
- `src/timer.ts` — `enterPhase`, `isTimerFor`, `applyVip` (pause/resume + skip/end handlers), `setConnected`, `allConnectedDone`, `connectedIds`.
- `src/scoring.ts` — `rank` (shared ranks on ties), `buildResults`, `speedPoints`, `addScores`. `src/views.ts` — `envelope`, `controllerEnvelope`, `viewPlayers`.
- `src/controller/` — `Screen` (safe-area frame + sticky footer), `PrimaryButton`, `WaitingScreen`; Phase 3 adds `TextAnswer`, `ChoiceGrid`, `VoteList`.
  `usePhoneOnly()` (S-005, 2026-09-22) is true in a "phone only" room — the shell provides it —
  and the three controls above use it for their default lines, so none of them says "look at the
  TV" when there is no TV. A game's own copy should do the same (or read `view.phoneOnly`).
- `src/tv/` — `Stage` (overscan frame), `BigText`, `Timer` (last-5-s urgency + `onTick`), `PlayerChips`, `Scoreboard`; Phase 3 adds `Reveal`.
- `src/contract-tests/` — the suite every game must pass: `contract.test.ts` (rules), `play.ts` (headless runner), `fuzz.ts`, `hash.ts`, `load.ts` (docs/TESTING.md).

## Test

`pnpm vitest --project game-sdk` (helpers) · `pnpm vitest --project contract` (every game)

## Must NOT go here

Engine or server imports, sockets, game-specific logic, anything a game shouldn't be allowed to call.

`GameClientModule` strip flags (I-131, 2026-09-22): `stripCompact` (phase ids) drops the TV strip to
faces only on those phases — the claimant's chip (`PlayerChips` `leadId`) keeps its name and is drawn
a size up — and `stripHidden` removes the strip entirely so the stage takes the room. Bingo uses both
for a claim and its verdict.

# @partybox/game-sdk

Everything a game may import. Re-exports the contract types and `z` from `shared`, adds helpers and UI
primitives, and hosts the contract tests that run against every game.

## Key files (Phase 3)

- `src/index.ts` — the public surface (the only thing games import, ADR-009).
- `src/rng.ts` — `nextFloat`, `nextInt`, `shuffle`, `pick` on `RngState` (`[value, next]`), `createRng` for bots.
- `src/timer.ts` — `enterPhase(state, id, now, durationMs)`, `isTimerFor`, `applyVip` (pause/resume/skip/end), `setConnected`.
- `src/scoring.ts` — `rank(scores)`, tie handling, `speedPoints`.
- `src/controller/` — `TextAnswer`, `ChoiceGrid`, `VoteList`, `WaitingScreen`, `Screen`, `PrimaryButton`.
- `src/tv/` — `Timer`, `PlayerChips`, `Scoreboard`, `Reveal`, `Stage`, `BigText`.
- `src/contract-tests/` — the suite every game must pass (docs/TESTING.md).

## Test

`pnpm vitest --project game-sdk` (helpers) · `pnpm vitest --project contract` (every game)

## Must NOT go here

Engine or server imports, sockets, game-specific logic, anything a game shouldn't be allowed to call.

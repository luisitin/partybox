# @partybox/shared

Types and zod schemas everybody agrees on, plus the pure PRNG and id helpers. **Dependency: zod only.**

## Key files (Phase 1)

- `src/contract.ts` — `GameDefinition`, `GameStateBase`, `GameEvent`, views, results, manifest + settings schemas.
- `src/protocol.ts` — socket payload schemas (`join`, `input`, `vip`, pushes) and `RoomSnapshot`.
- `src/rng.ts` — counter-based PRNG: `RngState { seed, step }`, `[value, next]` helpers (ADR-019).
- `src/ids.ts` — room codes (no `0 O 1 I L`), player ids, tokens (given entropy from the host).
- `src/version.ts` — `PARTYBOX_VERSION`.
- `src/index.ts` — the only barrel.

## Test

`pnpm vitest --project shared`

## Must NOT go here

I/O, React, sockets, anything with a clock. Engine/game logic. Dependencies other than zod.

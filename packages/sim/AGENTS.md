# sim — local rules

- Deterministic: every run is `(seed, strategy, players)`; the same triple must replay identically.
- Every failure writes a repro file first, then throws. Never swallow an invariant violation.
- New strategies: one file in `src/strategies/`, registered in `src/strategies/index.ts`, documented in README.
- May import engine, shared, game-sdk and the server's generated registry. Nothing may import sim.
- Keep `--smoke` under 30 s total; it runs inside `pnpm verify`.
- Test: `pnpm vitest --project sim`.

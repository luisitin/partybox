# server — local rules

- Thin host: validate → engine → interpret effects. If logic doesn't need I/O it belongs in `engine`.
- Every `now` comes from `clock.ts`; never call `Date.now()` directly (the dev API can freeze time).
- Exactly one pending timer per room; re-derive after every event (ADR-004).
- Invalid client payloads → `error` event; never throw out of a socket handler.
- Dev API is on only with `--dev` or `--dev-api`; every handler checks the flag.
- Never import `packages/client` or `@partybox/game-sdk`; games come from `games.generated.ts`.
- Run: `pnpm dev`. Test: `pnpm vitest --project server`.

# server — local rules

- Thin wire: validate → `@partybox/host` → sockets. Logic that needs no I/O belongs in `engine`.
- Every `now` comes from the `Clock` in `@partybox/host`; never `Date.now()` (the dev API freezes it).
- Exactly one pending timer per room; re-derive after every event (ADR-004).
- Invalid client payloads → `error` event; never throw out of a socket handler.
- Dev API is on only with `--dev` or `--dev-api`; every handler checks the flag.
- Never import `packages/client`, `packages/web` or `@partybox/game-sdk`; games come from `games.generated.ts`.
- `sockets.ts` has a twin: `packages/web/src/net/room-host.ts`. A protocol change belongs in both.
- Run: `pnpm dev`. Test: `pnpm vitest --project server`.

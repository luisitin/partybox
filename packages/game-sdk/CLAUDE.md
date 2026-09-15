# game-sdk — local rules

- This is the whole API surface for games. Adding an export here is a product decision: document it in the README.
- Helpers on state are pure and return `[value, nextState]`; never mutate arguments.
- Primitives are dumb React components with explicit props; no sockets, no global state, tokens only.
- Contract tests must stay game-agnostic: read each game's `contract.config.ts` for hidden fields, never special-case ids.
- Only import from `@partybox/shared` and `react`. Keep `src/index.ts` free of React/CSS (ADR-023); UI goes through `src/ui.ts`.
- Test: `pnpm vitest --project game-sdk` and `pnpm vitest --project contract`.

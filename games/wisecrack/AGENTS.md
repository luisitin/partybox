# wisecrack — local rules

- Spec lives in README.md (required headings, ≤ 60 lines); keep it true when rules change.
- One file per phase under server/phases/ (`enterX` + `reduceX(state, event, next)`); the phase graph
  and `reduce` live in server/flow.ts so the round loop needs no circular imports.
- Scoring in server/scoring.ts, pairing/selectors in server/round.ts, views in server/views.ts.
- Imports: only @partybox/game-sdk (+ react and @partybox/game-sdk/ui in client/). server/ is pure.
- Fixtures are hand-maintained full states (4 players, ids `p-ana` …): regenerate after a state-shape
  change with a throwaway script that runs `game.init` + `game.reduce` (no sim yet).
- Test: pnpm vitest --project games · pnpm vitest --project contract.

# lightning-round — local rules

- Spec lives in README.md (required headings); keep it true when rules change — the stress session
  checks "scores never decrease" against it, and the final wager is the one allowed decrease.
- One file per phase under server/phases/ exporting `enterX` + `reduceX(state, event, next)`; the
  successor is injected from server/index.ts (`advance`) so phase files never import each other.
- Hidden info is omitted by KEY (`correctIndex`, `pickIndex`, `wagerAmount`), never set to null —
  `__tests__/contract.config.ts` asserts those key names are absent before the reveal.
- Questions are referenced by id; content/questions.json is the truth (≥ 200 items, 8 categories,
  balanced `answerIndex`). Add questions with a `source` note; never time-sensitive facts.
- Imports: only @partybox/game-sdk (+ react in client/). server/ is pure (no Date.now, Math.random,
  timers, I/O).
- Fixtures are full states with real question ids; regenerate by hand with the reducer after a
  state-shape change (`pnpm sim --dump-fixtures` does not exist yet).
- Test: pnpm vitest --project games · pnpm vitest --project contract

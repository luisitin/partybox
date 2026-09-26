# who-said-it — local rules

- Spec: README.md (as built) and docs/game-pack/who-said-it/SPEC.md (the owner's design); build
  notes, stand-ins and conflicts: docs/game-pack/who-said-it/NOTES.md.
- One file per phase under server/phases/ (they never import each other; server/flow.ts wires them).
- Secrets: answers while writing, authors and that card's guesses until its flip, and future-card
  guesses until their flips. During the guess phase, the author sits out and sees the own-answer
  message; other players see the answer and candidate list. Keep every guess hidden until the guess
  run ends; skip the final card's vote only when everyone submitted an answer, then reveal each card
  separately (a skipped final card scores no one).
- server/match.ts and server/speakable.ts are stand-ins for the foundation's F5/F6: swap them out
  when `@partybox/game-sdk/match` and `toSpeakable` land on main.
- Bots decide from `controllerView` only (server/bot.ts, ruling 20).
- Fixtures: pnpm sim --game who-said-it --dump-fixtures --players 5
- Test: pnpm vitest run games/who-said-it · pnpm sim --game who-said-it --players vary --runs 200

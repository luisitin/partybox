# who-said-it — local rules

- Spec: README.md (as built) and docs/game-pack/who-said-it/SPEC.md (the owner's design); build
  notes, stand-ins and conflicts: docs/game-pack/who-said-it/NOTES.md.
- One file per phase under server/phases/ (they never import each other; server/flow.ts wires them).
- Secrets: answers while writing, authors until the flip, upcoming cards always. The author's phone
  must stay identical to everyone else's during their card — views.test.ts pins it.
- server/match.ts and server/speakable.ts are stand-ins for the foundation's F5/F6: swap them out
  when `@partybox/game-sdk/match` and `toSpeakable` land on main.
- Bots decide from `controllerView` only (server/bot.ts, ruling 20).
- Fixtures: pnpm sim --game who-said-it --dump-fixtures --players 5
- Test: pnpm vitest run games/who-said-it · pnpm sim --game who-said-it --players vary --runs 200

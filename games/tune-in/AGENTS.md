# tune-in — local rules

- Spec lives in README.md (required headings); keep it true when rules change.
- One file per phase under server/phases/; every phase in `phases` has fixtures/<phase>.json.
- Imports: only @partybox/game-sdk (+ react in client/). server/ is pure (no Date.now, Math.random, timers, I/O).
- Regenerate fixtures after changing state shape: pnpm sim --game tune-in --dump-fixtures --players 4
- Test: pnpm vitest --project games · pnpm vitest --project contract · pnpm sim --game tune-in --players 6 --runs 200
- Scores show the live 8 s auto-advance countdown beside the VIP Next round action (End game on the final turn).

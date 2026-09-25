# echo — local rules

- Spec lives in README.md (required headings); keep it true when rules change.
- One file per phase under server/phases/; every phase in `phases` has fixtures/<phase>.json.
- Imports: only @partybox/game-sdk (+ react in client/). server/ is pure (no Date.now, Math.random, timers, I/O).
- Regenerate fixtures after changing state shape: pnpm sim --game echo --dump-fixtures --players 4
- Test: pnpm vitest --project games · pnpm vitest --project contract · pnpm sim --game echo --players 6 --runs 200
- Full spec: docs/game-pack/echo/SPEC.md; build notes + stand-ins in use: docs/game-pack/echo/NOTES.md.
- server/match/ and server/speakable.ts are LOCAL STAND-INS for F5/F6 — swap to the SDK when they land.
- Content: the pack test (**tests**/bot-content.test.ts) runs content/check.ts over both packs; never import content/** from client/**.

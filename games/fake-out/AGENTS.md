# fake-out — local rules

- Spec lives in README.md (required headings); the full design is docs/game-pack/fake-out/SPEC.md,
  build notes and stand-ins in docs/game-pack/fake-out/NOTES.md.
- One file per phase under server/phases/; every phase in `phases` has fixtures/<phase>.json.
- server/ is pure (no Date, Math.random, timers, I/O). server/match and server/speakable are local
  stand-ins for the SDK's F5/F6 — swap the imports when those land on main.
- Secrets: authors, house, truth and picks never reach a view before their reveal step
  (`__tests__/leaks.test.ts`). Every option goes through `displayForm` (lies.ts).
- Content: facts are researched and verified; never add one without a checkable `source`.
  The pack test (`__tests__/content.test.ts`) runs every accept and house lie through the matcher.
- Regenerate fixtures after a state change: pnpm sim --game fake-out --dump-fixtures --players 4
- Test: pnpm vitest run games/fake-out · pnpm vitest --project contract -t fake-out ·
  pnpm sim --game fake-out --players 12 --runs 200

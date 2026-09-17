# blanks — local rules

- Spec lives in README.md (required headings); keep it true when rules change.
- One file per phase under server/phases/; every phase in `PHASES` has fixtures/<phase>.json.
- Imports: only @partybox/game-sdk (+ react in client/). server/ is pure (no Date.now, Math.random, timers, I/O).
- `server/cards.ts` `fill()` is the one rule for how a black card reads with whites in it — TV, phones
  and tests all go through it; `client/Cards.tsx` renders it (black and white stay black and white in
  every theme).
- Content: three decks under content/ (mild / crude / wild); the `decks` setting picks the mix.
  Ids `<m|c|w>b<n>` / `<m|c|w>w<n>`; regenerate from a cards.json with the converter in the loop notes.
- Regenerate fixtures after changing state shape: pnpm sim --game blanks --dump-fixtures --players 4
- Test: pnpm vitest --project games · pnpm vitest --project contract · pnpm sim --game blanks --players 6 --runs 200

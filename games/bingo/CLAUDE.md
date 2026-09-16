# bingo — local rules

- Spec lives in README.md (required headings); design doc in docs/game-ideas/001-bingo.html. Keep both true.
- One file per phase under server/phases/; shared transitions (deal, next call, wins) live in cards.ts /
  patterns.ts, injected by server/index.ts — phase files never import each other.
- Nothing is secret: the TV shows a card only while its owner's claim is checked; the deck ahead of `drawn`
  never leaves the state (views slice `deck[0..drawn)`).
- Imports: only @partybox/game-sdk (+ react in client/). server/ is pure.
- Regenerate fixtures after changing state shape: pnpm sim --game bingo --dump-fixtures --players 4 (then
  hand-edit fixtures/play.json to a mid-round moment).
- Test: pnpm vitest --project games games/bingo · pnpm vitest --project contract -t games/bingo ·
  pnpm sim --game bingo --players 6 --runs 200

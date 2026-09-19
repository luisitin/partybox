# blanks — local rules

- Spec lives in README.md (required headings); keep it true when rules change.
- One file per phase under server/phases/; every phase in `PHASES` has fixtures/<phase>.json.
- Imports: only @partybox/game-sdk (+ react in client/). server/ is pure (no Date.now, Math.random, timers, I/O).
- `server/cards.ts` `fill()` is the one rule for how a black card reads with whites in it — TV, phones
  and tests all go through it; `client/Cards.tsx` renders it (black and white stay black and white in
  every theme — warm charcoal `#16171c` and cream `#f6f1e6`, never pure, so a dark TV does not glare).
- Dealing (the hand floors, the refill, the best fits on top) is `server/deal.ts`; what a card is and how it
  fits a prompt is `server/fit.ts` + `server/topics.ts`; the bot's taste is `server/bot.ts`.
- Content: three decks under content/ (mild / crude / wild); the `decks` setting picks the mix.
  Ids `<m|c|w>b<n>` / `<m|c|w>w<n>`; add cards from text lists with `scripts/blanks-add-cards.ts`.
- Review pages: `reports/design/blanks-choreography.html` is frozen as of review-loop #224 (owner,
  2026-09-18: “I don’t need you to keep updating the choreography html page”). Motion, sound and timing
  changes go in the loop log and this game’s README instead — do not edit or republish that page.
- Regenerate fixtures after changing state shape: pnpm sim --game blanks --dump-fixtures --players 4
- Test: pnpm vitest --project games · pnpm vitest --project contract · pnpm sim --game blanks --players 6 --runs 200

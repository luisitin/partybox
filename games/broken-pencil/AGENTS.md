# broken-pencil — local rules

- Spec lives in README.md (required headings); design doc in docs/game-ideas/002-broken-pencil.html.
- Routing (who holds which book at which step) lives in server/books.ts and is pinned for every
  N 2–8 × passes 1–15 in **tests**; change it there first.
- Never spoil: views carry only the previous page of the book in a phone's hands and, on the TV, pages
  up to the one on screen. **tests**/contract.config.ts encodes that for the contract suite.
- Drawings are base64 strokes (server/encoding.ts is pure and shared with the client). Keep INK_CHARS /
  MAX_STROKES and maxPlayers in step with the 256 KB state cap (8 players × 7 drawings ≈ 235 KB worst case).
- Imports: only @partybox/game-sdk (+ react in client/). server/ is pure.
- Regenerate fixtures after changing state shape: pnpm sim --game broken-pencil --dump-fixtures --players 5
- Test: pnpm vitest --project games games/broken-pencil · pnpm vitest --project contract -t broken-pencil ·
  pnpm sim --game broken-pencil --players vary --runs 200

# spy-grid — local rules

- Spec: README.md (required headings) and docs/game-pack/spy-grid/SPEC.md; deviations + stand-ins:
  docs/game-pack/spy-grid/NOTES.md. Keep both true when rules change.
- One file per phase under server/phases/ (end.ts holds turn-end, win and done); flow.ts owns the
  order. Phase ids are kebab-case (the preview route needs it).
- The key is the one secret: only a spymaster's controllerView carries it; phones learn a card at
  stage 2 (`flipped === 2`), the TV at stage 1. leaks.test.ts re-deals the key and diffs views.
- The TV stage remounts per phase: entrances (a card turning, the win ripple, the clue landing) are
  mount animations; nothing that persists across phases may animate on mount.
- server/match.ts, server/helpers.ts, client/TeamBanner.tsx, the SpyKey cover are stand-ins for
  Foundation / other owners' pieces — swap when they land (NOTES.md).
- Fixtures are hand-built from **tests**/kit.ts (see NOTES.md); `pnpm sim --dump-fixtures` gives
  plainer ones.
- Test: pnpm vitest run games/spy-grid · pnpm vitest run --project contract -t spy-grid ·
  pnpm sim --game spy-grid --players vary --runs 200 --strategy random|idle|mixed

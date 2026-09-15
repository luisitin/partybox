# F-001 — VIP `end` during `answer` throws away every submitted answer

- **Severity:** P2 (wrong outcome / score)
- **Game / phase:** template (Quick Poll) / `answer`
- **Category:** Scoring (hand-computed round vs README)
- **Status:** FIXED — `fix(template): F-001 VIP end during answer discarded submitted answers`

## Repro

```
# in-process, 3 players: p1 answers, VIP ends the game before the reveal
pnpm vitest run --project games -t "F-001"
```

Hand-built: `init` → `input p1 {type:'answer', text:'early'}` → `vip end`.

## Observed

`results().scores` = `{ p1: 0, p2: 0, p3: 0 }`, everyone tied for first.

## Expected

README "Edge cases": _"VIP end goes straight to `done` with whatever was scored (answers submitted so
far count)."_ → `{ p1: 1, p2: 0, p3: 0 }`, `winnerIds: ['p1']`.

## Root cause

`games/_template/server/phases/reveal.ts:14` — `enterDone` only changed the phase; scores are computed in
`enterReveal`, so an `end` that skips the reveal shipped `scores: {}` and `buildResults` filled zeros.

## Fix

`enterDone` scores the answers when it is entered directly from `answer`. Two lines + comment.

## Regression test

`games/_template/__tests__/game.test.ts` — "F-001: VIP end during answer keeps the answers submitted so far".

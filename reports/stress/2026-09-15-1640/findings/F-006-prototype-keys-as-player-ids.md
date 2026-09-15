# F-006 — `players['constructor']` is truthy: prototype keys pass as players in the SDK helpers

- **Severity:** P3 (robustness; only reachable through `/api/dev/event`, the engine mints UUIDs)
- **Game / phase:** game-sdk (`setConnected`, `controllerEnvelope`) + template (`answer`, `bot`)
- **Category:** Reducer totality / hostile content (`__proto__` / `constructor` ids)
- **Status:** FIXED — `fix(game-sdk): F-006 own-key player lookups in setConnected/controllerEnvelope`

## Repro

```
pnpm sim --fuzz adversarial --game template --seed 1     # 144 failures before the fix
pnpm sim --replay reports/stress/2026-09-15-1640/repros/F-006-player-connect-constructor.json
pnpm vitest run --project game-sdk -t "F-006"
```

Event: `{ type: 'player', playerId: 'constructor', connected: true }` in any phase.

## Observed

`setConnected` reads `state.players['constructor']` → `Object` (the prototype's constructor), sees
`connected !== true`, and writes `players.constructor = { ...Object, connected: true }` — a new "player"
without `id`/`name`. Every view then throws (`name.localeCompare` on undefined); `results()` would list a
phantom player. Same lookup shape in `controllerEnvelope` (role `player` for `'toString'`) and in the
template's `reduceAnswer` / `bot.sampleInput` (an answer from `'constructor'` is stored and shown on
the TV as "Object").

## Expected

Contract rule 1/5: unknown ids are ignored; views never throw.

## Root cause

`packages/game-sdk/src/timer.ts:34`, `packages/game-sdk/src/views.ts:60`,
`games/_template/server/phases/answer.ts:18`, `games/_template/server/index.ts:135` — plain-object
lookups without `Object.hasOwn`.

## Fix

`Object.hasOwn(state.players, id)` in the two SDK helpers and the two template sites (the template is
what every game copies). Pattern for game authors: never `state.players[id]` for an id that came from
an event without `Object.hasOwn` — or keep using the SDK helpers.

## Regression test

`packages/game-sdk/src/helpers.test.ts` ("F-006: setConnected ignores prototype keys…", plus the
`controllerEnvelope` assertion) and `games/_template/__tests__/game.test.ts` ("F-006: prototype keys are
not players"). The fuzzer's `hostileIds` includes `__proto__`, `constructor`, `toString` permanently.

# F-005 — A TV socket can `join` as a player; a phone can `tv:join` and orphan its player

- **Severity:** P3 (robustness / protocol drift; needs a hand-rolled client)
- **Game / phase:** server / sockets
- **Category:** Protocol ("TV clients sending player events")
- **Status:** FIXED — `fix(server): F-003 F-005 one identity and one role per socket`

## Repro

```
pnpm sim --net --port 42070 --only locked        # scenario "locked room and TV observers"
pnpm vitest run --project server -t "F-005"
```

## Observed

- TV socket: `tv:join {}` then `join {name:'TvGuy'}` → `welcome`; the socket is now both in `tv:CODE`
  (receives every TV push) and a controller. `input`/`vip` from it are honoured.
- Controller socket: `join` then `tv:join {}` → role flips to `tv`; on disconnect the handler only
  acts for `role === 'controller'`, so the player stays `connected: true` forever (same ghost as F-003).

## Expected

docs/PROTOCOL.md: _"TVs are pure observers: any player/VIP event from a TV socket is ignored."_

## Root cause

`packages/server/src/sockets.ts:81` (`join`) and `:164` (`tv:join`) never looked at `data.role`.

## Fix

`join` refuses when `data.role === 'tv'`; `tv:join` refuses when `data.role === 'controller'`
(`invalid_payload`). 2 lines.

## Regression test

`packages/server/src/app.test.ts` — "F-005: a TV socket cannot join as a player and a phone cannot
become a TV" (also checks the phone still disconnects cleanly afterwards).

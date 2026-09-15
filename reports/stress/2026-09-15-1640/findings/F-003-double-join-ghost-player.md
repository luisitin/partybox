# F-003 — A second `join` on the same socket turns the first player into a permanently connected ghost

- **Severity:** P1 (stuck room when the ghost is the VIP; otherwise a player who never expires and
  blocks every "all connected players answered" exit until the deadline)
- **Game / phase:** server / sockets, any status
- **Category:** Protocol (hostile or buggy client), player chaos
- **Status:** FIXED — `fix(server): F-003 F-005 one identity and one role per socket`

## Repro

```
pnpm sim --net --port 42070 --only forged        # scenario "forged tokens and double identities"
pnpm vitest run --project server -t "F-003"
```

Socket A: `join {name:'Ana'}` → welcome (Ana is VIP). Same socket: `join {name:'Ann'}` → welcome.
Disconnect A.

## Observed

Room players: `Ana connected:true isVip:true disconnectedAt:null`, `Ann connected:false`. Ana has no
socket (the join handler moved the socket's `data.playerId` to Ann and dropped Ana from `byPlayer`),
so the `disconnect` handler never fires for her. She never enters the 120 s grace, never hands the VIP
over, and can never be resumed from another device without her token. `/api/dev/reset` is the only way
out.

## Expected

docs/PROTOCOL.md: one player per controller socket; the client always sends `leave` before a fresh
`join` (`packages/client/src/net/controller.ts`), so a second `join` is either a resume of the same
player (token) or a protocol violation.

## Root cause

`packages/server/src/sockets.ts:81-125` — `join` never checked `data.playerId`; line 119 deleted the old
mapping instead of refusing.

## Fix

`join` answers `invalid_payload "Leave the room before joining again."` when the socket already holds a
player and the payload does not resume that same player (token). Same commit closes F-005. 6 lines.

## Regression test

`packages/server/src/app.test.ts` — "F-003: a second join on the same socket is refused; leave first then
join works" (also proves resume-by-own-token on the same socket still works).

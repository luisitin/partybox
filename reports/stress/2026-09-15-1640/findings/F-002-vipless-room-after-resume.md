# F-002 — Room left without a VIP when the VIP leaves while everyone else is disconnected

- **Severity:** P1 (stuck room — nobody can start, kick, transfer, end or return to lobby)
- **Game / phase:** engine, any status (lobby, selecting, results, playing)
- **Category:** Player chaos (VIP disconnects / everyone disconnects / reconnect)
- **Status:** FIXED — `fix(engine): F-002 promote a resuming player when the room has no VIP`

## Repro

```
pnpm sim --room-chaos --runs 200 --seed 1        # seed 129 before the fix
pnpm sim --replay reports/stress/2026-09-15-1640/repros/F-002-vipless-room.json
pnpm vitest run --project engine -t "F-002"
```

Real-life sequence: two phones lock their screens (both disconnect); the VIP's phone dies or the VIP
taps Leave; 120 s later the VIP expires (`expirePlayers` → `removePlayer` → `promoteVip` finds no
_connected_ candidate → `vipId = null`); the other phone wakes up and resumes by token.

## Observed

`room.vipId === null` with a connected player. `promoteVip` is only called from `removePlayer` and from
the 30 s handover in `expirePlayers`, both of which require a connected candidate _at that moment_.
`resume()` never promotes. Every VIP action afterwards is rejected with `not_vip`; the room stays
that way until a brand-new player joins (fresh joins do become VIP when `vipId === null`).

## Expected

docs/PROTOCOL.md "VIP handover: VIP disconnected > 30 s → longest-connected player"; docs/GLOSSARY
implies there is always a VIP while anyone is connected. The room-chaos invariant encodes it as
"no VIP while a player is connected".

## Root cause

`packages/engine/src/players.ts:87` (`resume`) — restores `connected` and notifies the game, but does
not re-evaluate the VIP.

## Fix

In `resume`, when `room.vipId === null`, call `promoteVip` (existing helper) before notifying the game;
the toast "X is now the VIP" goes out as usual. 8 lines, engine contract unchanged.

## Regression test

`packages/engine/src/players.test.ts` — describe "F-002: a VIP-less room recovers when a player resumes"
(3 cases: VIP left, VIP expired via grace, existing VIP untouched). Room-chaos: 1,300 rooms /
1.6 M events green after the fix.

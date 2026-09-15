# F-004 — The dev API is reachable by every device on the LAN and hands out player tokens

- **Severity:** P3 (robustness; dev mode only — but `pnpm dev` is the documented way to run a party)
- **Game / phase:** server / dev API
- **Category:** Protocol / hostile client
- **Status:** OPEN — proposal below (touches `packages/server` behaviour + docs/DEV_API.md; your call)

## Repro

```
pnpm dev --port 42070          # or pnpm start --dev-api
curl http://<lan-ip>:42070/api/dev/state | jq '.room.players[].token'
curl -X POST http://<lan-ip>:42070/api/dev/reset
```

## Observed

- `GET /api/dev/state` returns the raw `RoomState` including every player's `token`
  (`packages/server/src/dev-api.ts:153`). With a token any phone can `join { token }` and take over
  that player — including the VIP — kicking the real device (the socket layer replaces the old socket).
- `POST /api/dev/reset`, `/bots`, `/start`, `/skip`, `/clock`, `/disconnect`, `/load-state` need no
  credential: a guest can end the party, freeze the clock or inject events.
- The server binds `0.0.0.0` on purpose (phones must reach it), so "dev" is not localhost-only.

## Expected

docs/DEV_API.md calls it "dev-only HTTP endpoints"; nothing says "LAN-wide". At a party the LAN is
shared with guests' phones.

## Proposal (diff sketch, ~15 lines)

In `registerDevApi`'s `onRequest` hook, additionally require ONE of:

1. the request to come from loopback (`req.ip` is `127.0.0.1` / `::1` / `::ffff:127.0.0.1`), or
2. a header `x-partybox-dev: <secret>` where the secret is printed in the boot banner and read from
   `PARTYBOX_DEV_TOKEN` (e2e/sim pass it; both already spawn the server themselves).

And redact `token` from `/api/dev/state` (`players: Object.values(room.players).map(({ token: _t, ...p }) => p)`),
exposing tokens only via a separate `GET /api/dev/tokens` behind the same guard, since e2e's
"same token on two devices" test needs them.

Risk: low — every caller (e2e, sim, `/preview`) runs on the same machine or can send the header.

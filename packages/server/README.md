# @partybox/server

The LAN process. Fastify + Socket.IO that wires `@partybox/host` to real sockets, real timers
and a freezable clock. (The web build wires the same host to WebRTC instead — ADR-034.)

## Key files

- `src/main.ts` — CLI (`--port`, `--host`, `--dev`, `--dev-api`), banner with LAN IP / URLs / firewall hint, port-in-use warning.
- `src/app.ts` — Fastify app: `/healthz`, static client (prod) or Vite middleware (dev, ADR-006), dev API.
- `src/sockets.ts` — Socket.IO: zod validation, rate limit (20 inputs/s, non-VIP `vip` costs 5), payload size vs `manifest.maxInputBytes`, resume-by-token socket remapping, TV rooms.
- The room host, the clock and the rate limiter now live in `@partybox/host` (ADR-034), so the
  GitHub Pages build can run the same loop in a browser tab. This package supplies the wire.
- `src/dev-api.ts` — `/api/dev/*` (docs/DEV_API.md). `src/bots.ts` — server-played bots.
- `src/qr.ts` — SVG QR for the join URL. `src/lan-ip.ts` — LAN IPv4 detection.
- `src/games.generated.ts` — GENERATED registry (ADR-003). Do not edit.

## Test

`pnpm vitest --project server` (unit) · `pnpm e2e` (through real browsers)

## Must NOT go here

Game logic, view computation, React, imports from `packages/client` or `@partybox/game-sdk`.

# @partybox/server

The only process. Fastify + Socket.IO host that wires the pure engine to real sockets and timers.

## Key files

- `src/main.ts` — CLI (`--port`, `--host`, `--dev`, `--dev-api`), banner with LAN IP / URLs / firewall hint, port-in-use warning.
- `src/app.ts` — Fastify app: `/healthz`, static client (prod) or Vite middleware (dev, ADR-006), dev API.
- `src/static-cache.ts` — the prod static client: hashed `/assets/*` immutable and sent as their prebuilt `.br`/`.gz`, HTML and the SPA fallback `no-cache`, `/music` + `/sfx` a week (FOUNDATION-AUDIT #9).
- `src/sockets.ts` — Socket.IO: zod validation, rate limit (20 inputs/s, non-VIP `vip` costs 5), payload size vs `manifest.maxInputBytes`, resume-by-token socket remapping (and, I-741, resume-by-name / `takeOver`, so the welcome reaches the new phone), I-755 (the replaced socket is sent `kicked: another_tab`; C: a login joining more than 3 times in 5 s is refused the same way), TV rooms.
- `src/app.ts` `/api/info` (I-785): private rooms only when asked for by `?room=CODE` (A); `/api/funnel` leaves them out (B); names and faces only on the asked-for room (C). I-787: `qrUrl`/`qrSvg` are the asked-for room's when it exists (a second room's TV), else the house room's.
- `src/rate-limit.ts` — token bucket + `jsonBytes`.
- `src/host.ts` — interprets engine effects: pushes views with `rev`, one timer per room, toasts, kicks.
- `src/clock.ts` — injectable clock (real / frozen) used by everything that needs `now`.
- `src/dev-api.ts` — `/api/dev/*` (docs/DEV_API.md). I-753: `/state` carries no login tokens (A); only the host PC is answered, except `POST /reset` for the TV's 🏠 (B); sockets.ts refuses a socket whose Origin is another site (C). `src/bots.ts` — server-played bots.
- `src/qr.ts` — SVG QR for the join URL. `src/lan-ip.ts` — LAN IPv4 detection.
- `src/tuned.ts` — I-763 C: the VIP's per-game settings saved at `<recordings>/tuned-settings.json`; every new room starts from them.
- `src/games.generated.ts` — GENERATED registry (ADR-003). Do not edit.

## Test

`pnpm vitest --project server` (unit) · `pnpm e2e` (through real browsers)

## Must NOT go here

Game logic, view computation, React, imports from `packages/client` or `@partybox/game-sdk`.

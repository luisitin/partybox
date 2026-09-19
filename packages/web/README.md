# @partybox/web

The GitHub Pages build (ADR-034): the same games, played by people who are not in the same room,
from a static site with no server behind it. **`WEB_DEPLOY.md` at the repo root is the guide** —
how it deploys, and how changes from the LAN app land here.

There is no TV. Every device renders both surfaces of the room: the real `TvApp` in a 16:9 strip at
the top (so the stage's music, beds and cues come out of that phone) and the real `ControllerApp`
under it. The first player's tab runs `@partybox/host` with the real engine; everyone else opens a
WebRTC data channel to it, keyed by the room code.

## Key files

- `src/ui/WebApp.tsx` — the page: pick a room, then stage over controls. Also answers `/api/info`
  from the browser (`setInfoProvider`), since there is no server to ask.
- `src/ui/RoomEntry.tsx` — start a room or join a code. The one screen the LAN app has no use for.
- `src/ui/Stage.tsx` — the 1920×1080 stage, zoomed to the strip. `src/ui/ShareBar.tsx` — invite + fold.
- `src/net/room-host.ts` — the web's `sockets.ts`: the shared zod schemas, the shared rate limiter,
  one client = one phone + one stage. Keep it parallel to `packages/server/src/sockets.ts`.
- `src/net/peer.ts` — PeerJS: claim `partybox-v1-<CODE>`, accept guests, dial, reconnect.
- `src/net/room.ts` — host in this tab (with a loopback for your own phone) or join someone else's.
- `src/net/link-transport.ts` — one data channel, two `NetTransport`s (phone half, stage half).
- `src/net/wire.ts` — the envelope, the `tv:` prefix and the loopback link.
- `src/config.ts` — `VITE_PEER_NAMESPACE`, `VITE_TURN_*`, the join URL. `src/qr.ts` — browser QR.
- `src/games.generated.ts` — GENERATED registry (ADR-003). Do not edit.

## Run and test

`pnpm web` (port 42072) · `pnpm vitest --project web` · build: `pnpm --filter @partybox/web build`

## Must NOT go here

Game logic, view computation, a second copy of a screen that `packages/client` already has, and
anything from `packages/server` — there is no Node process in this build.

# @partybox/client

Vite + React front end: the TV stage (`/tv`), the phone controller (`/`), and the dev preview.

## Key files (Phase 2)

- `src/main.tsx` — route switch (`/tv`, `/`, `/preview/...`), no router library (ADR-011).
- `src/net/store.ts` — one socket.io-client store (`useSyncExternalStore`), token in `localStorage`, `rev` gating, reconnect state.
- `src/tv/TvShell.tsx` — stage frame: join URL + QR, room code, envelope (timer, chips, VIP overlay), sound + mute, "tap to start".
- `src/controller/ControllerShell.tsx` — phone frame: header (room, me, connection, VIP badge), reconnect banner, game loader.
- `src/core/{Join,Lobby,Selecting,Results}.tsx` — core screens shared by every game.
- `src/preview/Preview.tsx` — renders a fixture's view fetched from the dev API.
- `src/styles/tokens.css` — design tokens (docs/DESIGN_SYSTEM.md). `src/sound.ts` — Web Audio cues.
- `src/games.generated.ts` — GENERATED lazy game modules (ADR-003).

## Test

`pnpm vitest --project client` · visually: `pnpm dev` then `/preview/<game>/<phase>?view=tv` · `pnpm e2e:snap`

## Must NOT go here

Game logic or game-specific components (those live in `games/<id>/client`), engine/server imports, `Date.now` in render paths.

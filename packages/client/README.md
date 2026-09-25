# @partybox/client

Vite + React front end: the TV stage (`/tv`), the phone controller (`/`), and the dev preview.

## Key files

- `src/main.tsx` — route switch (`/tv`, `/`, `/preview/...`), no router library (ADR-011).
- `src/net/store.ts` — tiny external store + `useStore`. `src/net/controller.ts` — the phone connection (join/resume by token in `localStorage`; I-744 A: a stale session also drops the dead `?room=` so the join form offers the one open room, `rev` gating, clock offset, toasts, kicked). `src/net/session-store.ts` — the stored login + identity. `src/net/seat-channel.ts` — I-755 B: a new tab asks this browser's other tabs who has the seat and steps aside (`OtherTab.tsx`, A: the tab that lost the seat stops reconnecting and offers "Play here instead"). `src/net/tv.ts` — the TV observer. `src/net/info.ts` — `/api/info` hook.
- `src/tv/TvApp.tsx` + `TvFrame.tsx` — stage chrome (room code, join URL, QR) and sound cues (I-744 B: a room code that changed without the TV's 🏠 shows "PartyBox restarted — this is a new room" until someone is back in); `TvLobby`, `TvSelecting`, `TvPlaying` (envelope: chips + timer + VIP overlay + paused curtain), `TvResults`, `AudioGate` (tap to start, mute, fullscreen).
- `src/controller/ControllerApp.tsx` + `ControllerShell.tsx` — phone frame: header (room, me, connection dot, VIP badge → `VipMenu`), reconnect banner, error strip, toasts.
- Design review E (I-792): the phone lobby is people first — `Lobby.tsx` title row "Lobby 6 of 16" + Share + ⋯ (`LobbyMore.tsx`: nudge the VIP, set up your phone, Leave), the roster as a two-column grid of `compact` chips, every hint in one rotating line (`LobbyLine.tsx`); a VIP's header on a ≤ 359 px phone drops the name so the code is never clipped.
- Design review F (I-793): the join form fits an iPhone SE without scrolling — portrait (tap = photo) beside the name, faces as one sideways strip in the chosen colour (`JoinAvatars.tsx`), colours as one row of dots, the language behind "🌐 EN ▾" in the header (`JoinLangPick`).
- I-648 A: while the VIP picks, every other phone reads the chosen game's settings under the tagline, read-only and live (`controller/SettingsGlance.tsx`; values in words via `settingValue` in `tunedLine.ts`).
- I-648 B: the setting the VIP just changed breathes yellow once over 2 s (a held fill under reduced motion).
- `src/controller/{Join,Lobby,Selecting,Playing,Results}.tsx` — core screens; `Playing` mounts the game.s lazy Controller inside `GameErrorBoundary`; `results-rows.ts` is shared with the TV.
- `src/preview/Preview.tsx` — `/preview/:gameId/:fixture?view=tv|controller&player=<id>`: renders a fixture's view (from `GET /api/dev/preview`) inside the real TV/controller shells with a fake room; `send` logs to the console.
- `src/styles/tokens.css` + `global.css` — design tokens and reset (docs/DESIGN_SYSTEM.md). `src/sound.ts` — synthesized Web Audio cues. `src/i18n.ts` — every core string.
- `src/games.generated.ts` — GENERATED lazy game modules (ADR-003).

## Test

`pnpm vitest --project client` · visually: `pnpm dev` then `/preview/<game>/<phase>?view=tv` · `pnpm e2e:snap`

## Must NOT go here

Game logic or game-specific components (those live in `games/<id>/client`), engine/server imports, `Date.now` in render paths.

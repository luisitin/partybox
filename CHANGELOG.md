# Changelog

All notable changes. Format: [Keep a Changelog](https://keepachangelog.com/); conventional commits feed it.

## [Unreleased]

### Added
- **Blanks** (`games/blanks`): fill-in-the-blank card comedy — a black card, a hand of ten white
  cards, one-at-a-time read-outs on the TV (and on every phone, so it plays without a TV), everyone
  votes or a rotating judge picks, one point per round; three decks (Mild / Crude / WILD) chosen by
  the VIP, optional Rando phantom player; bots welcome.
- **Bingo** (`games/bingo`): 75-ball bingo with free daubing, a public check that pauses the caller
  (green ✓ / red ✕ / missed squares), a wiped card as the penalty for a wrong BINGO!, a pattern per
  round (line / four corners / X / blackout), cheeky caller phrases; bots welcome.
- **Broken Pencil** (`games/broken-pencil`): Telestrations-style word → drawing → guess books with a
  phone DrawPad (8 colours, 3 pens, undo, limited ink), the full circle by default (`passes` shortens
  it), then a TV show that turns every page with the VIP on Next; Unbroken awards, no scores; bots
  fill seats.
- `ViewEnvelope.timerMode` (ADR-030): games can ask the shells for a quiet (bar only) or hidden timer.
- Host controls on the TV (ADR-031): `tv:vip` / `tv:bot` socket events with the engine's `host`
  flag, a Host toolbar (pick / start / bots / pause / skip / end / play again), a ⌂ Home button, and an
  interactive game-picking screen with editable settings (`SettingField` shared with the phone).
- Bots as room players (ADR-028): "Add a bot" in the lobby (max 4 per person, owner/VIP can remove,
  never VIP, leave with their owner), `supportsBots` manifest flag gates Start, contract check that a
  flagged bot acts with varied inputs, `bot` socket event, 🤖 chip tag, dev-API bots now go through the
  engine.
- Resume by name (ADR-029): a token-less join under a disconnected player's name resumes that player.
- Multi-persona live-play harness (`packages/e2e/live/`) and the 2026-09-15 session report.

### Fixed
- Stale VIP badge while offline, toasts rendered as buttons, "Connecting…" shown while connected,
  spectators missing from the TV strip during play (all from the live-play report).

## [0.1.0] - 2026-09-15

### Added
- Phase 0: monorepo scaffold (pnpm workspaces, TypeScript 6, ESLint boundaries, dependency-cruiser,
  Prettier, Vitest projects), `pnpm verify` gate, generated game registry, doc set and ADRs 001–021.
- Phase 1: `@partybox/shared` (contract types + zod schemas, socket protocol, counter-based PRNG,
  room codes / names / avatars) and `@partybox/engine` (pure room machine: join/resume/spectators,
  VIP rules + 30 s handover, 120 s disconnect expiry, GameRunner with once-per-phase timers,
  `nextWakeAt` ticks, settings coercion, views with VIP decoration); 57 tests, engine 98 % lines.
- Phase 2: `@partybox/server` (Fastify + Socket.IO host, one timer per room, injectable/frozen clock,
  rate limiting, resume-by-token socket remapping, LAN IP + QR + firewall banner, `/healthz`, `/api/info`,
  full dev API incl. server-played bots) and `@partybox/client` (route switch, controller store with
  token resume + rev gating + clock offset, TV observer, join/lobby/selecting/playing/results screens,
  VIP menu, TV frame with QR, synthesized sound cues, tap-to-start + mute + fullscreen) plus the first
  `@partybox/game-sdk` UI primitives (Avatar, PlayerChip, Stage, BigText, Timer, PlayerChips,
  Scoreboard, Screen, PrimaryButton, WaitingScreen, server clock hooks).
- Phase 4 + 5 (the two launch games, built by context-free sessions from the docs):
  `games/wisecrack` and `games/lightning-round` — see the entries below.
- Phase 3: `@partybox/game-sdk` helpers (`enterPhase`, `applyVip`, `buildResults`, `envelope`…),
  interaction primitives (`TextAnswer`, `ChoiceGrid`, `VoteList`, `Reveal`), the split into
  `@partybox/game-sdk` (pure) and `@partybox/game-sdk/ui` (React), the contract suite that runs
  against every `games/*` folder (totality fuzz, purity scan, packs, fixtures, termination with four
  bot strategies, determinism, stale timers, hidden-info leaks), `games/_template` ("Quick Poll"),
  and `pnpm new-game <id>`.
- Phase 6: `@partybox/sim` — headless simulator with five strategies + `mixed`, chaos actions,
  invariants after every event, determinism replay, repro files + `--replay`, `--smoke` (now part of
  `pnpm verify`), `--dump-fixtures`; `@partybox/game-sdk/testing` entry point.
- Phase 7: `@partybox/e2e` — `pnpm e2e` (TV + phones through the real UI, moves via the new
  `POST /api/dev/act`, zero-console-error gate) and `pnpm e2e:snap` (frozen-clock screenshots per
  phase, per device preset incl. iPhone SE / Galaxy / landscape / 200 % font, spectator phone);
  `/preview` route renders any fixture inside the real shells; `GET /api/games`; Vite HMR now on the
  app's own port (ADR-026).
- `games/lightning-round` ("Lightning Round"): speed trivia — 216 original questions in 8 categories,
  speed + streak scoring, a final wager question, three awards, fixtures, tests and contract config.
- `games/wisecrack` ("Wisecrack", prompt → answer → vote): 3–8 players, rounds/answerSeconds/spicy settings, double-points last round, sweep bonus, three awards, 160 family + 56 spicy prompts.
- Phase 8: bundled Nunito Variable (OFL) display font, 4× CPU-throttle budget check in `pnpm e2e`,
  surface base font-size fix, `/api/dev/act`, e2e screenshots for every phase of both games.
- Phase 9: fresh-eyes pass — "adding a phase" checklist and ADR-027 fixes from the two game builds.

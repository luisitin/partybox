# Changelog

All notable changes. Format: [Keep a Changelog](https://keepachangelog.com/); conventional commits feed it.

## [Unreleased]

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

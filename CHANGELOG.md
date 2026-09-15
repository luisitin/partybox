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

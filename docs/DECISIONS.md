# Decisions (ADRs)

Short records: Context → Decision → Consequences. Add a new one whenever you choose something a future
session might want to undo. Never edit an old one — supersede it.

## ADR-001 — Stack pins (2026-09-15)

**Context.** Boring, well-known tech; few dependencies; must work on Windows 11 and be navigable by a fresh session.
**Decision.** Node 24 LTS, pnpm 12 (via `corepack`, `packageManager` field), TypeScript 6.0.x (not 7: typescript-eslint supports < 6.1), Vite 8 + React 19, Fastify 5 + Socket.IO 4, Zod 4, Vitest 4.1 (5.0 was 12 days old), ESLint 10 flat config + typescript-eslint 8, Prettier 3, dependency-cruiser 18, tsx 4, Playwright 1.63 as a library, `qrcode` 1.5, cross-env.
**Consequences.** Every dependency gets a line in `docs/DEPENDENCIES.md`; upgrades are deliberate.

## ADR-002 — Contract shape is Section 3 of the build prompt, plus `manifest.maxInputBytes`

**Context.** The contract is the one thing that is expensive to change. A drawing game is planned next.
**Decision.** Implement the `GameDefinition` exactly as specified. Add one optional manifest field `maxInputBytes` (default 16 KB, hard cap 256 KB) so stroke-list inputs never need a contract change.
**Consequences.** Contract tests pin the shape; changing it needs a new ADR and touches every game.

## ADR-003 — Game discovery is explicit and generated

**Context.** Dynamic globbing hides where games come from; a fresh session must be able to grep.
**Decision.** `scripts/gen-registry.ts` writes `packages/server/src/games.generated.ts` and `packages/client/src/games.generated.ts`. `pnpm verify` fails when stale. Folders starting with `_` are tested but not registered.
**Consequences.** Adding a game = run `pnpm gen-registry` (the scaffold does it). No `import.meta.glob`.

## ADR-004 — Timers are data

**Context.** Games must be pure and replayable; real timers are I/O.
**Decision.** Games set `state.phase.deadline`. After every reduce the engine emits one `scheduleTimer` effect for `phase.id + startedAt`; the server keeps exactly one pending `setTimeout` per room and fires a `timer` event through the same path as inputs. Stale timers (different `startedAt`) are ignored.
**Consequences.** Frozen dev clock = no timers until `now` advances. Pause shifts deadlines instead of stopping clocks.

## ADR-005 — Single "house" room by default, multi-room data model

**Context.** The product is one living room; the model should not paint us into a corner.
**Decision.** The server creates one room at boot; the join page auto-joins when exactly one open room exists. Room codes are 4 letters without `0 O 1 I L`.
**Consequences.** No room-creation UI in v0.1; the dev API can create more for tests.

## ADR-006 — One port in dev: Vite middleware inside Fastify

**Context.** Phones need one URL; two dev servers mean two ports and CORS.
**Decision.** `pnpm dev` runs Vite in middleware mode mounted with `@fastify/middie`. `pnpm start` serves `packages/client/dist` with `@fastify/static`.
**Consequences.** `vite` is a runtime dependency of the server package (dev only path). Game client code is served from outside the client root (`server.fs.allow`).

## ADR-007 — No server build step: tsx runs TypeScript directly

**Context.** ESM + workspace packages + compiled output paths are a classic source of confusion.
**Decision.** Both `pnpm dev` and `pnpm start` run `packages/server/src/main.ts` with `tsx`. Only the client is built (Vite). Games are TypeScript source resolved through workspace links.
**Consequences.** `tsx` is a runtime dependency; type errors are caught by `pnpm verify`, not at start-up.

## ADR-008 — `games/` is one workspace package

**Context.** Each game needing its own `package.json` + `pnpm install` is friction for AI sessions.
**Decision.** `games/package.json` (`@partybox/games`) declares `@partybox/game-sdk` and `react`; individual games have no manifest beyond `manifest.json`. `pnpm-workspace.yaml` lists `games` (not `games/*`).
**Consequences.** Adding a game needs no install. Boundaries are enforced by lint and dependency-cruiser, not by package graphs.

## ADR-009 — Games import only `@partybox/game-sdk`

**Context.** One import surface is easier to document and to lint.
**Decision.** The SDK re-exports everything a game needs from `shared` (types, `z`, rng helpers). ESLint bans `@partybox/shared`/`engine`/`server`/`client` and cross-game imports under `games/`.
**Consequences.** If a game needs something from `shared`, add it to the SDK's `index.ts`.

## ADR-010 — Engine = pure functions returning effects

**Context.** 90 % coverage and deterministic replay need an engine with no I/O.
**Decision.** `applyRoomEvent(room, event, now) → { room, effects[] }`; effects (`push`, `toast`, `kicked`, `scheduleTimer`, `vipChanged`) are interpreted only by `packages/server/src/host.ts`.
**Consequences.** Every engine test is a table of events → expected room + effects. The server is thin.

## ADR-011 — No router, no state library, CSS Modules + tokens

**Context.** Three routes and one socket store don't justify dependencies; readable CSS beats utility soup for a design-review session.
**Decision.** Route switch on `location.pathname` in `main.tsx`; a `useSyncExternalStore` socket store; design tokens as CSS custom properties; CSS Modules per component; no Tailwind.
**Consequences.** Adding a route is a `switch` case. Styles are greppable by token name.

## ADR-012 — Zero runtime network: synthesized sounds, local QR, bundled fonts

**Context.** Smart TVs and phones on a LAN may have no internet; the app must not depend on it.
**Decision.** Sound cues are generated with Web Audio (no audio files). QR codes via the `qrcode` package. Fonts: system stack through Phase 7; Phase 8 may bundle one OFL font as woff2 (BL-001).
**Consequences.** No CDN links anywhere; `pnpm build` output is self-contained.

## ADR-013 — `pnpm verify` is a convention, not a git hook

**Context.** Three parallel sessions commit often; a 3-minute pre-commit hook fights them.
**Decision.** Documented rule, opt-in `.githooks/pre-commit` (enable with `git config core.hooksPath .githooks`). Commit types include `design`; scopes include game ids and `ideas`. No commitlint/husky.
**Consequences.** Discipline lives in `CLAUDE.md` and the skills, not in tooling.

## ADR-014 — Launch game names

**Decision.** `wisecrack` ("Wisecrack": prompt → answer → vote) and `lightning-round` ("Lightning Round": speed trivia with streaks and a wager). Original names and content only.

## ADR-015 — Determinism hashing lives outside `shared`

**Decision.** Stable-stringify + FNV-1a in `packages/game-sdk/src/contract-tests/hash.ts` (reused by `sim`). `shared` stays zod-only.

## ADR-016 — E2E is a CLI on the Playwright library, not `@playwright/test`

**Context.** The stress and design sessions script browsers; they don't want a test runner's opinions.
**Decision.** `packages/e2e/src/cli.ts` with `run` and `snap` commands; device presets (`iPhone 15`, `iPhone SE`, `Pixel 7`, `Galaxy S9+`, landscape, 200 % font) live in `devices.ts`. Chromium installed once (`pnpm exec playwright install chromium`).
**Consequences.** Assertions are plain code; screenshots are files under `reports/**/screenshots/` (gitignored).

## ADR-017 — Launch games are built by two subagents in isolated worktrees

**Context.** Rule 0.6 of the build prompt allows parallel work on the two games after Phase 3.
**Decision.** One agent per game in its own git worktree with the same brief (`docs/ADDING_A_GAME.md`); branches merged into `main` one at a time, each with `pnpm verify` green.
**Consequences.** `ADDING_A_GAME.md` gets its first real test before Phase 9.

## ADR-018 — One `tsconfig.json` for the whole repo

**Context.** Per-package tsconfigs multiply the places a fresh session must understand; project references need emit.
**Decision.** `tsconfig.base.json` + one root `tsconfig.json` that includes `packages/*/src`, `games`, `scripts`. DOM lib and JSX are on everywhere; `vite/client` types via `packages/client/src/vite-env.d.ts`.
**Consequences.** Server code can _type-check_ against DOM globals — boundaries are enforced by lint, not by lib visibility. `pnpm typecheck` is one `tsc` run.

## ADR-019 — Counter-based PRNG state `{ seed, step }`

**Context.** PRNG state must live in game state, be JSON, and be easy to reason about in repros.
**Decision.** `RngState = { seed: number; step: number }`; value = 32-bit mix of `(seed, step)`; helpers return `[value, nextState]`. Bots (outside state) get a mutable `Rng` wrapper.
**Consequences.** A fixture can say "step 42 of seed 7"; any draw is recomputable; no hidden generator objects.

## ADR-020 — Games never see who is VIP

**Context.** VIP changes mid-game; duplicating it in game state invites drift.
**Decision.** Games return views without `vip`; the engine adds `vip` and `rev` on the wire. VIP intent reaches games only as `vip` events.
**Consequences.** Shells render the VIP overlay; game components have no VIP branches.

## ADR-021 — `pnpm dev` does not auto-restart

**Context.** A restart drops every room; while testing on phones that is worse than a manual restart.
**Decision.** `pnpm dev` runs once; `pnpm dev:watch` restarts on server/engine/game changes. Client changes hot-reload through Vite in both.

## ADR-022 — One wake per room: `nextWakeAt` + `tick` instead of a `scheduleTimer` effect

**Context.** ADR-004 described a `scheduleTimer` effect. Implementing it showed the engine has three time-based rules, not one: game deadlines, the 30 s VIP handover and the 120 s disconnect expiry. Three effect kinds and three host timers invite drift.
**Decision.** The engine exposes `nextWakeAt(room): number | null` — the earliest pending moment across all three rules. After every event the host re-derives it and keeps exactly one `setTimeout` per room that sends `{ type: 'tick', now }`. On a tick the engine does everything that is due; ticks are idempotent (a spurious tick changes nothing) and the `timer` game event still fires exactly once per `phase.id + startedAt` (`RunningGame.firedTimer`). Chained already-due deadlines fire within one tick, capped at 10.
**Consequences.** ADR-004's _rule_ stands (timers are data); only the mechanism changed. Frozen clocks, replay and the sim need no timer bookkeeping at all — they just call `tick` with the simulated `now`.

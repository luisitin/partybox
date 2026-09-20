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
**Decision.** Sound cues are generated with Web Audio (no audio files). QR codes via the `qrcode` package. Fonts: Nunito Variable (OFL) bundled from `@fontsource-variable/nunito` since Phase 8.
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

## ADR-023 — Two SDK entry points: `@partybox/game-sdk` (pure) and `@partybox/game-sdk/ui` (React)

**Context.** The server, the sim and the contract tests load `games/<id>/server/index.ts` under Node. Phase 3 put React primitives (with CSS modules) in the same barrel; Node cannot load `.css`, so `pnpm dev` crashed the moment a real game was registered.
**Decision.** `@partybox/game-sdk` exports only contract types, `z`, rng and reducer/view helpers. `@partybox/game-sdk/ui` exports the primitives (`Stage`, `Timer`, `TextAnswer`, …). ESLint forbids `game-sdk/ui` under `games/*/server`; dependency-cruiser forbids the pure entry point from reaching `ui/`, `tv/`, `controller/`.
**Consequences.** Game server files import `@partybox/game-sdk`; game client files import `@partybox/game-sdk/ui` (+ types from either). `pnpm verify` catches a mix-up before it reaches the server.

## ADR-024 — Contract fuzzing sends only schema-valid inputs

**Context.** The first contract run threw junk inputs (`null`, `{ nope: true }`) at reducers and they crashed. The engine validates every input with `inputSchema` before `reduce` runs, so those events cannot occur.
**Decision.** The fuzzer sends inputs that pass the schema but are wrong in every other way (other players' inputs, unknown senders, inputs from earlier phases, `now` before the phase). Reducers may rely on the input shape.
**Consequences.** Games stay simple; the socket layer + engine are the only input validators (tested in `packages/server` and `packages/engine`).

## ADR-025 — `@partybox/game-sdk/testing` exposes the contract-suite internals

**Context.** The sim (and the stress session's future harnesses) need the headless runner, hashing, fuzzing and game loader that the contract suite already has. Deep imports across packages are ugly; duplicating the code invites drift.
**Decision.** A third SDK entry point, `@partybox/game-sdk/testing` (Node-only: reads `games/` from disk). ESLint bans it under `games/`.
**Consequences.** `packages/sim`, `packages/e2e` and scripts import it; the suite and the sim share one definition of "plays a game" and "hash of a state".

## ADR-026 — Vite HMR rides the app's HTTP server

**Context.** Vite in middleware mode opens its own HMR WebSocket server on port 24678 by default: a second port (phones on the LAN could not reach it) and a collision as soon as two dev servers run on one machine (the parallel sessions do). It surfaced as console errors on every page.
**Decision.** `createViteServer({ server: { middlewareMode: true, hmr: { server: fastify.server } } })`. Socket.IO ignores upgrade requests that are not for `/socket.io/`, so both share the port.
**Consequences.** One port in dev, for real. The e2e harness treats any console error as a failure, which is what caught this.

## ADR-027 — Lessons from the first two real games (docs + template + types)

**Context.** Wisecrack and Lightning Round were built by context-free sessions from the docs alone (ADR-017). Both reported the same gaps: phase files importing each other cannot express a round loop (dependency-cruiser forbids cycles); `GameDefinition` typed views as the bare envelope so tests could not read game fields; the game README's 60-line cap was undocumented and too tight for a spec; `state.players[id]` is truthy for `'__proto__'`; numeric secrets need a different leak check than strings; `-0` breaks the JSON round-trip check.
**Decision.** (1) The template and docs use `advance(state, now)` in `server/index.ts` as the single owner of the phase order, injected into `reduceX(state, event, next)`; phase files never import each other. (2) `GameDefinition<S, I, TV, CV>` gained optional view generics. (3) Game READMEs may be 120 lines (folder READMEs stay at 60). (4) `hasPlayer(state, id)` in the SDK; engine and helpers use `Object.hasOwn`. (5) `GAME_CONTRACT.md` documents key-name hiding, `me.id`, and the `-0` gotcha. (6) `@partybox/game-sdk/ui` re-exports the view types.
**Consequences.** Existing games keep working (defaults, additive helpers). The Phase 9 fresh-eyes test runs against these fixed docs.

## ADR-028 — Bots are room players; games opt in with `supportsBots`

**Context.** People want to play with fewer humans, or watch a game with an AI seat. Every game already ships `bot.sampleInput` (the contract requires it for sim/e2e), but not every bot is a fair opponent, and a game may have phases where a scripted player would spoil the fun.
**Decision.** (1) A bot is an ordinary `RoomPlayer` with `bot: { ownerId, strategy }`: it counts toward min/max players, becomes a spectator when added mid-game, is never VIP, and leaves with its owner. Any player adds up to 4 from the lobby (`bot` socket event); the owner or the VIP removes them; the dev API creates ownerless ones. (2) The host drives every bot from the game's own `bot.sampleInput` (`packages/server/src/bots.ts`). (3) A game declares `"supportsBots": true` in `manifest.json` to say "available for bots"; without it the engine refuses to start that game while bots are in the room (`canStart` reason on the phone and the TV). (4) The contract suite checks that a `supportsBots` game's bot actually acts and does not always send the same input.
**Consequences.** Adding bot support to a game is a one-line manifest change plus an honest bot. Games that stay unflagged can still be played by humans; the room just has to drop its bots first.

## ADR-029 — A token-less join under a disconnected player's name resumes that player

**Context.** The live-play session showed that a phone that closes the tab (losing the token) cannot rejoin as itself for 120 s: "That name is taken" while the old session sits in the grace window.
**Decision.** In `join`, if no token matches and the (case-insensitive) name belongs to a player who is currently DISCONNECTED and not a bot, the new device resumes that player (same id, score, VIP status). Connected players keep their name protected.
**Consequences.** Living-room trust model: someone could take over a friend's seat while their phone is asleep. Acceptable for a LAN party; a room `lock` still stops strangers, and BL-018 tracks an opt-in PIN.

## ADR-030 — `ViewEnvelope.timerMode`: a game may ask the shells for a quiet or hidden timer

**Context.** Bingo calls a number every 6 s: the TV shell's 128 px countdown with red digits and a tick in the last 5 s of _every call_ turns the caller's rhythm into a permanent alarm. Broken Pencil's show auto-turns pages but the VIP is meant to turn them; a countdown says "hurry" where nothing should. Game design request R-1 asked for a quiet timer.
**Decision.** The view envelope gains an optional `timerMode?: 'normal' | 'quiet' | 'hidden'` (default `normal`). `quiet` = the shells show only the draining bar (no digits, no urgency colour, no tick); `hidden` = nothing. Games set it per view; the shells read it; the contract suite ignores it. The deadline itself is unchanged — timers stay data.
**Consequences.** Additive; existing games render exactly as before. A game that hides its timer must still exit its phases (rule 6 is unchanged).

## ADR-031 — The TV is the host's screen: `tv:vip` / `tv:bot` give it every VIP power

**Context.** PartyBox runs from a PC plugged into the TV. Its owner wanted to run the whole party from that screen — pick and configure games, add bots, pause, skip, end, go home — without hunting for the VIP phone, and a room of bots (for testing) has no VIP at all.
**Decision.** (1) A TV socket may send `tv:vip` (the `vip` payload) and `tv:bot` (the `bot` payload). The server dispatches them with the engine's new `host: true` flag on the `vip` room event, which skips the "sender must be the VIP" check and nothing else: `canStart`, phase rules, kick/transfer rules all still apply. `tv:bot` adds ownerless bots (like the dev API) and may remove any bot. Refusals return as `error` to the TV, shown as toasts. (2) The TV renders a small **Host** toolbar bottom-right (context-dependent: pick a game / add or remove bots / start; pause / skip / end; play again / new game) and a **⌂ Home** button top-left whenever the room is not in the lobby (ending a running game after a confirming second click). (3) The TV's game-picking screen is interactive: the game list is clickable and the settings are editable through the shared `SettingField`, the same room state the VIP phone edits. (4) PROTOCOL.md's "TVs are pure observers" is amended: a TV never sends _player_ events (inputs, join, leave); it acts only as the host.
**Consequences.** Anyone at the PC has full control — that is the point on a LAN; a room `lock` still applies to joins. The controller's VIP flow is unchanged and both can be used at once.

## ADR-032 — Music beds: synthesized per-phase backgrounds, chosen by ear

**Context.** The owner asked for background music per stage of Blanks (relaxed while picking, a waiting pulse while judging) and picked the moods from synthesized sketches on the review page. The file-based music engine (Kevin MacLeod tracks, ADR-012's one exception) switches whole tracks and restarts them, which is wrong for a game whose stage flips every 5–60 s.
**Decision.** A second engine, `packages/client/src/beds.ts`, generates short loops in Web Audio (tempo + level + a bar function per bed). A game maps phase ids to bed ids in `clientModule.beds`; the TV crossfades between beds (1.5 s), keeps each bed's bar position so a returning bed continues, holds on pause, ducks to half under every cue (`createSoundEngine({ onPlay })`), and follows the TV mute. Phones never play beds. The file engine stays for the lobby and the games that use it.
**Consequences.** No new assets or fetches (ADR-012 holds). Beds are cheap to tune per feedback (a number in a table) and identical on every TV. The e2e cue log ignores bed contexts (`__pbBed`) so cue evidence stays readable.
**Amendment (review-loop #197).** A phase may map to a list of bed ids instead of one; the TV counts how often each phase has begun and takes the next bed in the list each time. The owner's "there was not that variety I had agreed on for the judging or picking" was a stage the room sits through every round playing one thirty-second loop all game. Blanks: picking alternates bossa / marimba, judging marimba / lo-fi, the judge's own pick lo-fi / late night.

## ADR-033 — A timer that re-arms its own phase fires again

**Context.** Bingo's `bingo` phase has two beats: the TV's reveal ends (the verdict — the moment the win may be scored, or every strip spoils the sweep) and, later, the room's choice or the round's end. ADR-022's "once per `phase.id + startedAt`" left no way to take the second beat without a second phase, and a phase change crossfades the TV mid-reveal.
**Decision.** `fireDueTimer` still records the fired phase instance, but when the reducer answers the timer by staying in the same phase instance with a strictly later `deadline`, the record is cleared: that deadline is a new one and fires once too. A reducer that ignores the timer, or a pause/resume that shifts the deadline, does not re-arm (the stale-deadline guard stands).
**Consequences.** Games may pace one phase in several beats (Bingo: `round.credited`). The loop guard is unchanged: a reducer that keeps moving its deadline on every tick would keep ticking, which is a game bug, not an engine one — the sim smoke would show it.

## ADR-034 — A `multiselect` setting, grouped by a sibling select

**Context.** Lightning Round grew to ten categories and 59 topics (2026-09-18). The owner wants "pick Art & Literature, then tick the topics"; the settings contract only had number / boolean / select, and `SettingValue` is `number | boolean | string`, which every phone, the engine and the wire format rely on.
**Decision.** A fourth spec, `multiselect`: `options[]` (each with an optional `group`), a `default` string, an optional `groupBy` naming a sibling `select`. The value stays a string — the picked option values joined by commas, `''` = nothing picked — so `SettingValue`, the protocol and stored rooms are untouched. The engine keeps only known picks, in option order, and only those whose `group` equals the sibling select's current value (a category change drops the old topics). `SettingField` renders it as a checklist of chips that steps aside when the group has no options. Games split the value with `multiselectPicks()` and decide what `''` means (Lightning: the whole category).
**Consequences.** No protocol change; older phones show the field as soon as they reload. A game that wants a multiselect without a parent leaves `groupBy` off. The manifest cap of 12 settings and 200-character descriptions still hold; option lists may be long (Lightning: 59 entries).

## ADR-035 — The host records each game to disk for the owner's feedback

**Context.** The owner reviews nights after the fact (2026-09-19): which drawings broke a book, which answers won, which questions were too hard. The engine is pure and the server holds every room's state, so the record can be a by-product of play. Claude's design loop runs hundreds of games a day that must not pile up.
**Decision.** A room flag `recording` (default on) that the VIP toggles from the picker on the phone or the TV (`setRecording`, refused mid-game) and that the dev API's `start` leaves off unless asked. A server-side recorder subscribes to the host: on the first playing dispatch of a game with the flag on it opens `recordings/<gameId>/<YYYY-MM-DD_HH-mm-ss>-<room>/`, rewrites `session.json` (players, settings, seed, phase timeline, outcome, results) and `state.json` at every phase change, and on results (or an early end, marked `aborted`) writes the game's optional `recap(state, ctx)` — markdown plus files, with `ctx.history` carrying the state at each phase start so a game that clears per-round data can still report every round. Writes are chained and fire-and-forget; a failure logs. `PARTYBOX_RECORDINGS` moves or disables the folder.
**Consequences.** One optional method on the contract; Bingo and Blanks get the generic capture until they add a recap. The design harness sets `PARTYBOX_RECORDINGS=off`. State snapshots are bounded by the 256 KB state cap, so a night of forty games is a few MB.

## ADR-036 — A game's "Next" button is the VIP's: the shell hands the VIP's phone a `skip`

**Context.** Blanks let any phone send a `next` input that ended an untimed answer, vote or result phase. On the first play-test (owner, 2026-09-19) that read as a bug: "only the VIP should have the option to force skip rounds when voting, etc rather than anyone being able to click the button." ADR-020 keeps games from knowing who the VIP is, so a game cannot gate its own input.
**Decision.** `GameControllerProps` gains an optional `skip: () => void`. The controller shell sets it on the VIP's phone only; it sends the engine's `vip` skip (the same as the VIP menu's "Skip / Next"), so the server enforces who may. A game that wants an in-context "Next" ("Start the reading now", "Close the vote now", "Next round") renders it when `skip` is set and drops its own `next` input. Blanks did; its phase guards for the input (something on the table, a connected judge) become display rules on the phone, the VIP menu's skip being as forceful as it always was.
**Consequences.** Games still never see the VIP id. A game's "Next" and the VIP menu's skip are one action. The TV's "Next on the VIP's phone" pill tells the room whose tap it waits for.

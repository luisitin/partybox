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

## ADR-037 — A photo avatar is an avatar id the room resolves

**Context.** The owner wants to upload a photo from the phone as an avatar (I-031, 2026-09-21). Thirty places render an avatar from an `avatarId` string — the SDK's chips, scoreboards and rosters, and two dozen game-specific spots (voters, readers, seats, winners) — and every game view push carries `players[]`; a 24 KB JPEG per player in every push is too heavy for a LAN of phones.
**Decision.** The join payload gains an optional `photo` (a JPEG data URL the phone made at 128 × 128, capped at 24 KB, validated by shape; the engine re-checks nothing else). The room snapshot carries it (`PlayerPublic.photo`, sent on room changes only) and a player with a photo has the avatar id `photo:<playerId>` everywhere an avatar id flows — the snapshot, the game's `PlayerInfo`, every `ViewPlayer` and every game's own projections, untouched. `Avatar` resolves that id through `AvatarPhotos`, a context the shell provides from the snapshot on both surfaces; a `photo` prop shows one directly (the join form's preview). `avatarId` stays required and is the face the phone picked; `avatarColorVar` hashes a photo id to one of the eight colours.
**Consequences.** No game changes: any `<Avatar avatarId=…>` shows the photo. A game that compares avatar ids to the sixteen faces would see a `photo:` id — none does. Bots never have a photo. A rejoin by token keeps the server's photo; the phone keeps it with the name and face in its identity store. A TV or phone that renders an avatar outside the providers shows the ghost face.

## ADR-038 — A room effect can address the TVs alone, and a toast or error can name a player

**Context.** A taken name was a private failure: the phone shook and the room saw nothing (I-040, the owner's pick C, 2026-09-21). The effect union had `toast.to: 'all' | <playerId>` — every phone or one — and no way to tell the TVs something the phones need not hear.
**Decision.** `toast.to` gains `'tvs'` (the host routes it with `transport.toTvs`, no phone sees it) and an optional `playerId` — the player the toast is about, which the lobby uses to ring that chip while the toast shows. `error` gains an optional `player: { name, avatarId }` — for `name_taken`, who already has the name, so the phone shows their face. Both are additive; the wire payloads carry them only when set.
**Consequences.** Games cannot raise room effects, so nothing changes for them. A TV that ignores `playerId` shows the toast as before. The engine's join path is the only producer today.

## ADR-039 — The lobby keeps the last game's results until the next game starts

**Context.** "Back to lobby" nulled `room.results`, so a room returning to the lobby carried no trace the game happened (I-073, the owner's pick A, 2026-09-21).
**Decision.** The VIP's `toLobby` keeps `room.results`; the runner's start of the next game clears it as it already did. `RoomSnapshot.results` may therefore be non-null while `status` is `lobby`. The TV lobby shows a "Last up · <game>" card from it — one winner "won", several "tied" (faces first, four at most then "+n"), none "no winner" (the owner's note).
**Consequences.** A phone ignores `results` outside the results stage today; a game never sees the snapshot. A reset (Home) still starts from a null result.
**Addendum (I-652, the owner's pick C, 2026-09-24).** The room also keeps `tonight` — each finished game's id, its human winners and whether only bots won, the last six, a gap over 3 h starting a new night — and the snapshot carries it (optional, additive). The lobby reads a bots-only win as "🤖 Bots took it" with the best person under it, lays a "Tonight" card beside "Last up" (each game and its winner) and tallies the night's leader (bots never count). From 9 players the card sits beside "Last up" and keeps only the tally.

## ADR-040 — Phones can play the room's music; the VIP can turn it on for everyone

**Context.** Background music played on the TV only (S-004, the owner's pick C, 2026-09-21, with the note "make sure the music actually plays on the phone when enabled. If VIP enables it, then it is auto for everyone").
**Decision.** A phone runs its own music engine on the same plan the TV follows for the room (`planFor` on the snapshot + view; the lobby set, the game's set, silence on results, a hold on pause), from the same `/music/…` files, started by the phone's next tap. Two switches: the phone's own "Music on this phone" with a soft / normal / loud level (localStorage), and the room's `musicOnPhones` — a VIP action `setMusicOnPhones` beside `setRecording`, allowed any time, carried in the snapshot — which makes every phone play automatically (a phone's own sound switch still mutes it). The engine re-levels a playing track when the same plan arrives at a new volume.
**Consequences.** Games see nothing new. A phone without the MP3s (a checkout that never ran `fetch-music`) fails quietly as the TV does. The design harness proves play-state headlessly (an `Audio` element playing with `currentTime` advancing after a tap); the audible check is the owner's.

## ADR-041 — A "phone only" room: the TV's moments fork to the phones

**Context.** The TV is the stage; a room playing with the TV off (or out of sight) lost the check, the caller's voice and the phase cues (S-005, the owner's pick C, 2026-09-21).
**Decision.** A room flag `phoneOnly` (VIP action `setPhoneOnly`, beside the recap switch, not mid-game; in the snapshot). While on, a game may hand the phones the TV's moment through two client-module fields: `PhoneStage` (a lazy component taking the controller view) and `phoneStagePhases` (the phase ids it covers) — the controller shell renders it in place of the game's Controller. The shell hands phones `clip` / `hush` so a game can speak on them (Bingo's caller), and plays the game's `sounds` phase cue on a phone in such a room when the phone's "TV sounds on this phone" switch (on by default) allows. Bingo implements the check: the claim, the card turning over cell by cell, the verdict.
**Consequences.** A game without `PhoneStage` behaves as before in a phone-only room. The win phase keeps the phone's own screen (its choices live there). The harness's cue log does not record clips; the caller's voice on phones is proven by code.

## ADR-042 — The VIP's inputs are stamped, so a game can reserve an input for them

**Context.** ADR-020 keeps games from knowing who the VIP is. The owner wants the VIP to overrule a Broken Pencil verdict ("close enough": "Adolf Hitler" → "Adolf") — a game input only the VIP may send, validated server-side.
**Decision.** The engine stamps `vip: true` on an `input` game event when the sender is the room's VIP (additive on `GameEvent`; absent otherwise). A game may gate an input on it; it still never sees the VIP's id from the server. The client's `PushedView.vip` already lets a phone show the control to the VIP alone. Broken Pencil's `{ type: 'veto', book }` marks a broken book intact once — on its last page during the show (the verdict on stage flips, "Close enough — the VIP allows it.") or in the summary — and the summary, the awards and the recap follow.
**Consequences.** No game changes unless it opts in. A veto is not undoable (the room heard it).

## ADR-043 — A phone can open its own room, and a room can be public or private

**Context.** The owner (2026-09-22): "there should be a way for someone to create a lobby if they don't know the room key … maybe they can search rooms and see which codes are available … and a private or public option for the host menu." Until now a phone could only join the one house room the host opened, and every room `/api/info` knew was listed.
**Decision.** `POST /api/rooms` opens a room — with a 4-letter code the phone picked when that code is free (400 `invalid`, 409 `taken`), otherwise one the host picks — capped at 12 rooms per host, and an empty non-house room older than 10 minutes is reaped first. `RoomState.listed` (default true) rides in the snapshot and is flipped by the VIP action `setListed`; the join page lists only listed rooms, and a private room still joins by its code. Rooms remain one host process, one Socket.IO namespace, one engine — a second room is not a second node.
**Consequences.** The join page shows a room browser under the code field. A new room starts with no TV; `/tv?room=CODE` (already supported) or "phone only" gives it a stage. The house room is never reaped and stays the QR's target.

## ADR-044 — Every screen speaks the device's language; tables are keyed by the English sentence

**Context.** The owner (2026-09-22): "the language fields should affect more when you load into the lobby — all text should be at least translatable to Spanish when the language is changed." The join screen had its own language pills; nothing after it followed them.
**Decision.** One language per device (`@partybox/game-sdk/ui` `lang.ts`: `?lang=` → remembered → browser; the join pills, the phone's 🎨 sheet and the TV host bar's 🌐 button set it). The shell's own copy is the typed `t` object (`i18n-en*.ts` source, `i18n-es*.ts` a complete twin; `t` reads the language at render). Games, the SDK components and the TV shell use tables keyed by the literal English sentence: `const L = useT(STRINGS)` then `L('Waiting for {name}…', { name })`; a game ships its table as `clientModule.strings`, which also translates its manifest lines in the game picker. Sentences the server writes stay English on the wire and translate at display (`serverText` for the engine's, `L.sent` / the game's table for a game's own; number placeholders match digits only). Content — cards, prompts, questions, words, caller audio — stays in the deck's language. `scripts/i18n-coverage.test.ts` fails when an `L('…')` sentence or a manifest line lacks its Spanish, or a translation drops a placeholder.
**Consequences.** English renders exactly as before. A missing entry shows the English, never a blank. New UI copy is written as `L('…')` with its Spanish, and a new game (the template included) starts with a table. German, French and Portuguese cover the join and lobby lines only and fall back to English elsewhere. Recaps saved on the host PC stay English (a file, not a screen).

## ADR-045 — A game can ask the host for spoken readings

**Context.** The owner (2026-09-22/23, READER-VOICES): Blanks and Bingo get a Reader setting, and "the room waits for the reader". Bingo's calls are fixed, so they are recorded clips; Blanks' finished cards are new sentences every round, so they must be synthesised live — and the reducer must stay pure, while the pacing must not depend on the TV reporting back.
**Decision.** `GameDefinition.speech?(state)` lists the readings a state wants (`SpeechRequest`: a key, a voice, parts of text or espeak phonemes). The server's speech service (`packages/server/src/speech.ts`) makes each key once — Kokoro in a long-lived Python sidecar (`packages/server/speech/kokoro_sidecar.py`, model and venv from `PARTYBOX_TTS_DIR`, else `C:\dev\partybox-ideas\tools\tts`), Windows' Zira through PowerShell for "original" — caches it, serves `/api/speech/<key>.wav`, and answers with a new game event `{ type: 'speech', key, ms }` (ms -1 when it failed). Local processes only (ADR-012). `PARTYBOX_SPEECH=off` turns it off.
**Consequences.** Blanks asks for the question and each card the moment it is played; a reveal step lasts its reading + 0.9 s, waits at most 12 s for one not yet made, and falls back to the human reading time when making it failed — a missing synthesiser never holds the room. The pronunciation lexicon is game content (`games/blanks/content/pronounce.json`). Games that do not implement `speech` are unaffected.
**Addendum (game pack F6, ruling 17, 2026-09-24).** New games build their readings with a server-only, pure SDK subpath, `@partybox/game-sdk/speech`; Blanks keeps its own code (ruling 19). `toSpeakable(text, { voice, lang, overrides?, itemId?, playerText? })` applies Part 00 §5.3's rules after the overrides — the item's fixes, then the game's `content/pronunciations.json`, then the SDK's `speech/overrides.en.json` — which match whole words, case-sensitively unless `anyCase: true` (so _us_, _it_ and _bass_ are not respelled everywhere). An override's output and a spelled acronym are final; an acronym goes to the voice as phoneme parts beside its letters, because espeak reads a spaced mid-line "A" as the article. `pronunciationsSchema` is a superset of Blanks' lexicon (`phonemes` is an alias of the wire's `ipa`), and a phoneme `SpeechPart` now requires `text`, so Zira says the words instead of nothing. A key is `speechKey(gameId, voice, parts)` = `<gameId>-<16 hex>`, hashed over `SPEECH_ENGINE_VERSION|voice|JSON(parts)` with no per-host salt; the host accepts `SPEECH_KEY_PATTERN` (`/^[a-z0-9][a-z0-9-]{5,63}$/`, in `@partybox/shared` — the old check refused hyphens, so `broken-pencil` could never have had a reading) and serves `/api/speech/<key>.wav` as `public, max-age=31536000, immutable`. `pendingCap(players) = max(10, players + 1)`. Dependency-cruiser keeps the subpath out of client code; ESLint holds it to game-server purity. The same line hits the cache in any room on any night and no device fetches it twice, so anything that changes how the same parts sound — a model or voice file, a voice's speed or accent, the phonemiser, Zira's prosody, loudness (ruling 18) — must bump `SPEECH_ENGINE_VERSION`. Blanks' readings are byte-identical and its `bl…` keys are now immutable too, but they carry no engine version: re-levelled audio reaches Blanks only through a new key scheme or a cleared cache. Every game's pronunciation list gets a pack test (it parses, and `unknownPhonemes(ipa)` is empty for every entry, because Kokoro drops unknown symbols without an error).

## ADR-046 — The game hears why a player went for good

**Context.** I-773 (the owner's pick B, 2026-09-24): Blanks held a removed judge's round for a 20 s reconnect grace and then wrote it off, because a removal and a dropped phone both reached the game as `connected: false`. The room layer already knew the difference.
**Decision.** The engine's `player` game event gains an optional `gone?: 'left' | 'kicked'`, set by `removePlayer` (a player who left, or the VIP removed them); a plain drop leaves it absent. Additive: a game that ignores it behaves as before. Blanks uses it to hand a removed or departed judge's round to the room's vote at once.
**Consequences.** Games may skip reconnect grace for a player who is gone for good. The field never appears on a reconnect (`connected: true`).

## ADR-048 — Typed answers go through one shared matcher, `@partybox/game-sdk/match`, always called with the content's language

**Context.** Game pack Part 00 §4 (the owner, 2026-09-24): five new games compare what players type — Imposter's clues and last-chance guess, Herd Mind's free text, Fake-Out's lies, Echo's clues and guesses, Spy Grid's clues. The only normalizer was Broken Pencil's strict-equality `normalizeText`. The audit found the spec's recipe wrong in ways that would ship as bugs (#14–16, #25–31): no language anywhere, Spanish "una piñata" read as "1 pinata", plurals that never met their singular (movies/movie, noches/noche), "don´t" split in two, ß/ø/æ turned into gaps, rejects that "puffins" and "hose" walked past, 1984 fuzzing to 1985 — and `localeCompare` tie-breaks in pure code, whose order depends on the host's ICU data and locale.
**Decision.** A pure subpath `@partybox/game-sdk/match` (`packages/game-sdk/src/match/`), free of zod, React, Node and locale APIs, exports `normalize`, `stem`, `matchAnswer` (`exact` / `stem` / `fuzzy` / `none`), `sameAnswer`, `groupAnswers` and `isLegalClue`. Every one takes the content's `lang` (`'en' | 'es'`), which every answer pack carries (ruling 15). `normalize` strips quotes before NFKD, folds ß ø æ œ ł đ þ ı, and drops one leading article (only when a word follows) before number words up to 99 become digits. `stem` canonicalises both sides (the plural rule, then a final e; English y → i). Rejects block exact, stem and fuzzy matches; fuzzy is OSA distance, the minimum over the answer and every accept, only between forms with the same digits, and loses to any reject at least as close (ruling 16). `groupAnswers` is the transitive closure of `sameAnswer` in submission order. `isLegalClue` counts code points of the raw trimmed text, treats a hyphenated clue as one word, returns reason codes, and skips the secret checks for `secret: null`. The pure entry adds `answerItemSchema`, `answerPackSchema` and `checkAnswerPack` (clashes on the compact form fail, every answer and accept must be `exact`, a warning under 3 accepts) — kept out of `./match` so zod stays off phones — and `compareCodeUnits`. ESLint bans `localeCompare`, `toLocale*` and `Intl` in `games/**/server` and the SDK's pure files; the five call sites sort by code units. The contract fuzz also sends inputs stamped `vip: true` and `vip: false`.
**Consequences.** Each game picks its own bar (guesses usually `fuzzy`) and words the clue reasons in both languages; a phone runs `isLegalClue` as the player types and gets the server's verdict. Spacing, case, accent, apostrophe and number-word variants are automatic, so listing one in `accept` fails the pack test. Stems are keys, not words: a few pairs still miss at the stem level (glove/gloves, dulce/dulces) and are caught as `fuzzy` from five letters. Code-unit order equals the old `localeCompare` order for the ids the engine mints (a test pins it); mixed-case ids would sort capitals first. The matcher's output is identical under any process locale (a test re-runs it under `tr_TR`). Broken Pencil keeps its own normalizer until its options page.

## ADR-049 — The lobby's game list is a catalog the host sends once; a game's own words come from the host (amends ADR-044)

**Context.** Game pack Part 00 §1–2 (the owner, 2026-09-24): the lineup grows from 5 to 14 games and later to hundreds, and phones must download only a small list until a game is picked. Every room push carried every game's description and settings (15 KB for 5 games, ≈42 KB at 14), and the picker translated a game's tagline, description and setting labels from that game's client `strings` table — so a lazy game registry would have left the picker in English or pulled game code onto every phone that opened it (audit #1–#3).
**Decision.** Manifests gain `icon` (one emoji), `howToPlay` (three steps ≤ 90 characters), `presence.needs`, `addedOn`, 1–3 tags from a fixed list (`GAME_TAGS`; `quick` is derived from `estimatedMinutes ≤ 8`), `phoneSettings?`, and tighter limits (tagline 60, description 300). Each game ships `games/<id>/manifest.es.json`: every manifest sentence in Spanish, keyed by the English. The server builds a **catalog** once at boot (`packages/server/src/catalog.ts`, host clock for NEW; ≤ 400 B an entry, the I-189 pace as a tuple, the Spanish tagline) and emits it as `catalog` on every socket connection. `RoomSnapshot.games` is gone; while a game is chosen the snapshot carries `selectedGame { id, settings }`. `GET /api/games/:id/about?lang=` returns the About sheet's words in a language (≤ 2 KB); `GET /api/games/:id/text?lang=` returns the manifest sentences in a language for the settings form. The client keeps both per session (`packages/client/src/catalog.ts`).
**Consequences.** Room pushes no longer grow with the number of games. The picker never needs a game's code to show its words, which unblocks the lazy registry (F1). A game's client `strings` keep only what its screens and its server write. `scripts/i18n-coverage.test.ts` checks `manifest.es.json` (complete, nothing stale, placeholders kept). `pnpm new-game` stamps today's `addedOn`.

## ADR-050 — A game is three downloads the registry loads on demand (amends ADR-003)

**Context.** Game pack Part 00 §2 (the owner, 2026-09-24): phones must download only the shell and the lobby until a game is picked, and the entry must not grow as the lineup goes from 5 to 14 games and beyond. The generated registry imported every game's `client/index.ts` eagerly — its string tables, sound plans and strip rules rode in the entry (625 KB raw, sent to every phone at join) — and Blanks' phone Controller imported a constant from a TV screen, so phones fetched a TV chunk too.
**Decision.** Each game has `client/shared.ts` (sounds, music, beds, `scoreless`, its string table), `client/phone-entry.ts` (`phone`: the Controller, PhoneStage) and `client/tv-entry.ts` (`tv`: the Tv, strip rules, Finale), plus an optional `client/settings-entry.ts` for its 🎨 panel. `gen-registry` emits `gameLoaders` — dynamic imports only — and `packages/client/src/game-loader.ts` fetches a surface once (`useGame`, `peekGame`), retrying after 1, 3 and 6 s, then reloading once if the host restarted, else showing "Couldn't load the game. Tap to retry." Phones start the download when a game is chosen; `selectGame(null)` opens the list with nothing chosen, so browsing downloads nothing. The TV and the preview are lazy routes; `@partybox/shared` and `@partybox/game-sdk` are side-effect free (CSS excepted) and the browser's constants live in a zod-free `constants.ts`, so zod and the TV SDK stay off phones. Lint forbids static imports of `games/**` in the client. Hashed assets are served `immutable` and precompressed (`.br`/`.gz`), HTML `no-cache`, audio a week (`static-cache.ts`). `pnpm check-bundle` (a verify step) builds the client in memory and fails when game code enters the entry, when what a page loads at join grows by more than 1 KB, when a game's phone download (JS + CSS gzip, excluding what the page already loaded) passes the budget (`scripts/bundle-budget.json`), or when a content pack reaches any client chunk; `--list <game>` prints a download file by file.
**Consequences.** A phone's join page fell from 1,143 KB to 529 KB uncompressed — 148 KB gzip for everything loaded at join, down from ≈214 KB — and no longer depends on the number of games; choosing a game costs its phone download (gzip: Bingo 32 KB, Blanks 22, Broken Pencil 13, Wisecrack 11, Lightning Round 10). Game code that needs a server constant imports a zod-free file (Bingo `server/constants.ts`, Blanks `content/blank.ts`), or zod rides along. The winner's cheer and horn (394 KB) are decoded by the TV as a game starts instead of by every device at its first tap. A screen that reads a game's hooks gets defaults until the entry arrives.

## ADR-051 — The picker opens on the list; the VIP's About is the TV's reading surface

**Context.** Game pack Part 00 §1.3–1.6 (the owner's rulings 2, 3, 6 and 7, 2026-09-24): with 5 → 14 games the phone picker could not be one card per game with its whole description, and entering the picker pre-selected a game — which, once games download on choice (ADR-050), would have downloaded a game on every picker open and every TV click.
**Decision.** `selectGame` takes `null`: "Pick a game", "New game" and "‹ All games" open the list with nothing chosen (no download, no settings). The phone list is compact rows (icon tile, name, tagline, players · minutes, badges, ⓘ) under one row of filter chips, sorted fits → votes → NEW → A–Z; a game that does not fit is dimmed and says why, and tapping it (or holding any row 450 ms) opens its About instead of choosing. About is a bottom sheet in a portal (swipe, ✕, outside or Escape to close) with the how-to-play steps from the host (`about`), Choose (with the one-tap bot fix) for the VIP and 👍 Suggest — the I-650 vote, toasted to the room at most once per player per 10 s — for everyone else. While the VIP's About is open the new `highlight` action sets `highlightedGameId`: the TV's spotlight shows that game's steps big with "Sam is reading about", and guests' lists name it. The TV lists cards three to a row, paged at nine, with a spotlight that otherwise turns through the games every 7 s; the steps light up one after another (off under reduced motion). After choosing, the phone shows the game with its settings under "Game options (n) ▾" and a sticky Start that works at once with tonight's settings; the TV keeps its editable settings card (ADR-031) with the steps.
**Consequences.** Opening the picker and About downloads no game code (1.1 KB of words for About). The room row (I-642) moved to the chosen-game screen. The TV stage is no longer still while the VIP reads or tunes. `PARTYBOX_DEMO_CATALOG=1` lists the pack's nine games (unplayable) so captures can film the picker at 14.

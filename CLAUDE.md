# PartyBox — the map (read this first, then docs/START_HERE.md)

Self-hosted party-game platform, in **two builds from one codebase**. LAN: one Node process serves a
**TV page** (`/tv`, read-only stage) and a **controller page** (`/`, phones). Web (GitHub Pages, ADR-034):
no server — the first player's tab hosts the room over WebRTC and every phone carries its own stage.
First player to join is the **VIP** (admin). Games are **plugins** in `games/<id>/` — pure, deterministic
state machines, and they work in both builds untouched. Priority #1 is that a session with no prior
context can add a game correctly by reading a few short docs. Everything else serves that.
**Bringing changes from the LAN app to the web app: `WEB_DEPLOY.md`.**

## Folder map (one line each)

| Path                 | What lives here                                                                                                        | What must NOT live here                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `packages/shared/`   | Types + zod schemas: game contract, socket protocol, PRNG, ids. Deps: zod only.                                        | Anything with I/O or React.                                 |
| `packages/engine/`   | PURE room machine: lobby→selecting→playing→results, VIP rules, reconnect/spectators, GameRunner. Host passes `now` in. | Sockets, timers, `Date.now()`.                              |
| `packages/host/`     | The room host, platform-neutral: effects→pushes, one timer per room, the clock, the rate limiter.                      | `node:*`, sockets, DOM, React.                              |
| `packages/server/`   | LAN wire: Fastify + Socket.IO, static/Vite serving, LAN IP + QR, dev API, real timers.                                 | Game logic. Client imports. The host loop.                  |
| `packages/client/`   | Vite + React: TvShell, ControllerShell, core screens (join/lobby/selecting/results), preview, tokens.                  | Game logic. Engine/server imports.                          |
| `packages/web/`      | Web wire (ADR-034): WebRTC, the room hosted in a tab, stage strip over the controller. See `WEB_DEPLOY.md`.            | Game logic. Copies of client screens. Server imports.       |
| `packages/game-sdk/` | Everything a game imports: contract types, rng/timer/scoring helpers, TV + controller primitives, contract tests.      | Engine or server imports.                                   |
| `packages/sim/`      | Headless simulator: bot strategies, invariants, record/replay. `pnpm sim`.                                             | Being imported by anything.                                 |
| `packages/e2e/`      | Playwright harness: boots server, 1 TV + N phones, screenshots. `pnpm e2e`, `pnpm e2e:snap`.                           | Being imported by anything.                                 |
| `games/<id>/`        | One game: manifest, README **spec**, `server/` (pure), `client/` (React), content, fixtures, tests.                    | Imports of other games, engine, server or client internals. |
| `games/_template/`   | Minimal complete game that `pnpm new-game <id>` copies.                                                                | Real content.                                               |
| `scripts/`           | `verify`, `gen-registry`, `new-game`, `check-drift`, `lan-ip` (tsx, cross-platform).                                   | Runtime code.                                               |
| `docs/`              | All design docs (list in `docs/START_HERE.md`). `docs/game-ideas/` belongs to the design session.                      | Code.                                                       |
| `reports/`           | Handoff area for the parallel sessions (`stress/`, `design/`). See `reports/README.md`.                                | Anything the app reads.                                     |
| `.claude/skills/`    | Project skills: `add-game`, `run-sim`, `snap-game`, `verify-and-commit`.                                               | Duplicated docs.                                            |

## Commands

```
pnpm install                 # once (Node >= 24, pnpm via corepack)
pnpm dev [--port 42071]      # LAN app: one process, one port (default 42069), Vite middleware, dev API on
pnpm web                     # the GitHub Pages app locally (port 42072) — see WEB_DEPLOY.md
pnpm start                   # production: serves packages/client/dist (run pnpm build first)
pnpm verify                  # THE gate: typecheck → lint → boundaries → format → unit+contract → sim smoke → build → doc drift
pnpm new-game <id>           # scaffold games/<id> from games/_template, then regenerates the registry
pnpm gen-registry            # regenerate packages/{server,client}/src/games.generated.ts
pnpm sim --game <id> --players 6 --runs 200 --seed 1     # headless games; --replay <file> reproduces a failure
pnpm e2e | pnpm e2e:snap --game <id>                     # browsers: full game / screenshots per phase (needs: pnpm exec playwright install chromium)
/preview/<gameId>/<fixture>?view=tv|controller&player=<id>   # in pnpm dev: any fixture inside the real shells
pnpm test | pnpm vitest --project engine                 # all unit tests / one package
```

## Contract invariants (the engine and contract tests enforce these — docs/GAME_CONTRACT.md)

1. `reduce(state, event)` is **pure and total**: never throws, unknown/invalid events return `state` unchanged.
2. **Time comes from `event.now`; randomness from `state.rng`.** No `Date.now`, `Math.random`, timers, I/O or module-level state under `games/*/server` (lint + test).
3. **Timers are data**: set `state.phase.deadline`; the engine fires exactly one `timer` event per `phase.id + startedAt`.
4. State is JSON, ≤ 256 KB, deterministic: same seed + same events ⇒ byte-identical state.
5. `tvView`/`controllerView` never throw for any `(state, playerId)` and never leak hidden info.
6. Every phase is exitable (deadline, all-submitted, or VIP skip); games terminate within `estimatedMinutes × 3`.
7. `results()` lists every player from `init`, with finite scores. `bot.sampleInput` is required.

## Dependency direction (lint + dependency-cruiser fail the build otherwise)

`games → game-sdk → shared` · `engine → shared` · `host → engine, shared` · `server → host, engine, shared, games/*/server`
· `client → game-sdk, shared, games/*/client` · `web → client, host, engine, game-sdk, shared, games/*` (ADR-034)
· `sim, e2e → anything` · **nothing → sim, e2e, web**.
Games import **only** `@partybox/game-sdk` (server, pure) and `@partybox/game-sdk/ui` (client, React) — plus `react`.

## Where things are NOT

- No game logic in `packages/client`, `packages/server` or `packages/web` — views are computed by the game.
- No sockets or timers in `packages/engine` or any game; no `node:*` in `packages/host` (it runs in a browser too).
- No copy of a client screen in `packages/web` — export it from `packages/client/src/index.ts` instead.
- No `Math.random()` anywhere in game or engine code — `shared/rng` only.
- No barrel files except each package's `src/index.ts`; no default exports (config files excepted).

## Parallel sessions (git worktrees, see reports/README.md)

| Session          | Branch     | Owns                                             | Port  |
| ---------------- | ---------- | ------------------------------------------------ | ----- |
| stress-test / QA | `stress`   | `reports/stress/`, fixes under its policy        | 42070 |
| design review    | `design`   | `reports/design/`, client visuals after approval | 42071 |
| game design      | `designer` | `docs/game-ideas/` only                          | none  |

## Working rules

- Read `docs/START_HERE.md` for the reading order per task. To add a game: `docs/ADDING_A_GAME.md`.
- `pnpm verify` must be green before every commit. Conventional commits (`docs/CONVENTIONS.md`).
- Decisions go in `docs/DECISIONS.md` as short ADRs; new dependencies get a line in `docs/DEPENDENCIES.md`;
  `TODO(BL-nnn)` in code needs a matching `BL-nnn` in `docs/BACKLOG.md` — `pnpm verify` checks all three.
- Update every doc a change touches **in the same commit**. Folder `README.md` ≤ 60 lines, `CLAUDE.md` ≤ 30 lines.

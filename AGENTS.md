# PartyBox — the map (read this first, then docs/START_HERE.md)

Self-hosted, LAN-only party-game platform. One Node process serves a **TV page** (`/tv`, read-only stage)
and a **controller page** (`/`, phones). First player to join is the **VIP** (admin). Games are **plugins**
in `games/<id>/` — pure, deterministic state machines. Priority #1 is that a session with no prior context
can add a game correctly by reading a few short docs. Everything else serves that.

**Every session, first:** `C:/dev/AGENTS.md` holds the rules every agent on this PC follows (the Agent
Hub, peer review, merging). Codex doesn't load it when you start inside this repo, so open it yourself.
New here, with no memory of the project: `docs/CODEX_GUIDE.md` (setup, ports, workflow, the owner's
preferences, gotchas). Working in a package or a game? Read that folder's `AGENTS.md` first: tools load
only the rule files on the path you started from.

## Folder map (one line each)

| Path                 | What lives here                                                                                                        | What must NOT live here                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `packages/shared/`   | Types + zod schemas: game contract, socket protocol, PRNG, ids. Deps: zod only.                                        | Anything with I/O or React.                                 |
| `packages/engine/`   | PURE room machine: lobby→selecting→playing→results, VIP rules, reconnect/spectators, GameRunner. Host passes `now` in. | Sockets, timers, `Date.now()`.                              |
| `packages/server/`   | Fastify + Socket.IO host: static/Vite serving, LAN IP + QR, dev API, real timers, injectable clock.                    | Game logic. Client imports.                                 |
| `packages/client/`   | Vite + React: TvShell, ControllerShell, core screens (join/lobby/selecting/results), preview, tokens.                  | Game logic. Engine/server imports.                          |
| `packages/game-sdk/` | Everything a game imports: contract types, rng/timer/scoring helpers, TV + controller primitives, contract tests.      | Engine or server imports.                                   |
| `packages/sim/`      | Headless simulator: bot strategies, invariants, record/replay. `pnpm sim`.                                             | Being imported by anything.                                 |
| `packages/e2e/`      | Playwright harness: boots server, 1 TV + N phones, screenshots. `pnpm e2e`, `pnpm e2e:snap`.                           | Being imported by anything.                                 |
| `games/<id>/`        | One game: manifest, README **spec**, `server/` (pure), `client/` (React), content, fixtures, tests.                    | Imports of other games, engine, server or client internals. |
| `games/_template/`   | Minimal complete game that `pnpm new-game <id>` copies.                                                                | Real content.                                               |
| `scripts/`           | `verify`, `gen-registry`, `new-game`, `check-drift`, `lan-ip` (tsx, cross-platform).                                   | Runtime code.                                               |
| `docs/`              | All design docs (list in `docs/START_HERE.md`). `docs/game-ideas/` belongs to the design session.                      | Code.                                                       |
| `reports/`           | Handoff area for the parallel sessions (`stress/`, `design/`). See `reports/README.md`.                                | Anything the app reads.                                     |
| `.claude/skills/`    | Recipes as plain Markdown (`<name>/SKILL.md`): `add-game`, `verify-and-commit`, `record-review`, `run-sim`…            | Duplicated docs.                                            |

## Commands

```
pnpm install                 # once (Node >= 24, pnpm via corepack)
pnpm dev [--port 42071]      # one process, one port (default 42069), Vite middleware, dev API on
pnpm start                   # production: serves packages/client/dist (run pnpm build first)
pnpm verify                  # THE gate: typecheck → lint → boundaries → format → unit+contract → sim smoke → build → bundle → doc drift
pnpm check-bundle [--update] # game code in the entry chunk, per-game phone/TV gzip, budgets in scripts/bundle-budget.json
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

`games → game-sdk → shared` · `engine → shared` · `server → engine, shared, games/*/server (generated registry)`
· `client → game-sdk, shared, games/*/client (generated registry)` · `sim, e2e → anything` · **nothing → sim, e2e**.
Games import **only** `@partybox/game-sdk` (server, pure), `@partybox/game-sdk/match` (typed answers, pure, both sides) and `@partybox/game-sdk/ui` (client, React) — plus `react`.

## Where things are NOT

- No game logic in `packages/client` or `packages/server` — views are computed by the game, rendered by shells.
- No sockets or timers in `packages/engine` or any game — the server is the only place with I/O.
- No `Math.random()` anywhere in game or engine code — `shared/rng` only.
- No barrel files except each package's `src/index.ts`; no default exports (config files excepted).

## Parallel sessions (git worktrees, see reports/README.md)

Today dozens of agents work at once, each in its own worktree (`C:/dev/partybox-*`) on its own port, and
ship through peer review on the Agent Hub: owners and ports are in `docs/CODEX_GUIDE.md`. The table lists
the three original sessions; their ports stay reserved.

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
- Update every doc a change touches **in the same commit**. Folder `README.md` ≤ 60 lines, folder `AGENTS.md`
  ≤ 30 lines (this one ≤ 120). A `CLAUDE.md` only imports the `AGENTS.md` beside it (ADR-055): edit `AGENTS.md`.

# START HERE — reading order by task

You have a small context window and no memory of this repo. Read `CLAUDE.md` (the map), then only the
docs for your task. Every doc is short; every folder has a `README.md`; every package and game has a
`CLAUDE.md` with local rules. Run `pnpm verify` before you commit — it is the definition of "works".

## Adding a game

1. `docs/ADDING_A_GAME.md` — numbered steps + definition of done. Follow it literally.
2. `docs/GAME_CONTRACT.md` — the interface your game implements, with a worked example.
3. `games/_template/` — copy source of `pnpm new-game`; read its `README.md` and `CLAUDE.md`.
4. `packages/game-sdk/README.md` — helpers and UI primitives you may use.
5. `docs/DESIGN_SYSTEM.md` — only when writing `client/` components.

## Fixing a bug

1. `docs/TESTING.md` — which layer to reproduce it in (`pnpm sim --replay`, contract tests, e2e).
2. `docs/ARCHITECTURE.md` — the data flow phone → socket → engine → reduce → views → TVs/phones.
3. The `README.md` of the package where the fix goes; check `docs/BACKLOG.md` for known items.

## Changing the UI (core screens or primitives)

1. `docs/DESIGN_SYSTEM.md` — tokens, type scales, motion, sound cue names.
2. `packages/client/README.md`, `packages/game-sdk/README.md` (primitives).
3. `docs/DEV_API.md` + `packages/e2e/README.md` — freeze the clock, screenshot every phase.

## Changing the engine or protocol

1. `docs/ARCHITECTURE.md`, then `packages/engine/README.md` and `docs/PROTOCOL.md`.
2. `docs/GAME_CONTRACT.md` — anything you change here breaks every game; write an ADR first.
3. `docs/DECISIONS.md` — the constraints already chosen (timers-as-data, rev ordering, effects).

## Stress testing

1. `docs/TESTING.md`, `packages/sim/README.md`, `packages/e2e/README.md`, `docs/DEV_API.md`.
2. `reports/README.md` — where findings go and the fix policy.

## Design review

1. `docs/DESIGN_REVIEW_LOOP.md` — how a pass runs, where captures land, when it is done.
2. `docs/DESIGN_SYSTEM.md`, `docs/DEV_API.md`, `packages/e2e/README.md`, `reports/README.md`.

## Every doc, one line each

| Doc                     | Purpose                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| `ARCHITECTURE.md`       | Packages, data flow diagram, dependency direction, runtime topology.         |
| `GAME_CONTRACT.md`      | `GameDefinition`, events, views, rules the engine enforces, worked example.  |
| `ADDING_A_GAME.md`      | Numbered recipe from `pnpm new-game` to `pnpm verify`, with checklist.       |
| `PROTOCOL.md`           | Socket.IO events, payload schemas, `rev` ordering, limits.                   |
| `DEV_API.md`            | Dev-only HTTP endpoints that drive the app deterministically.                |
| `DESIGN_SYSTEM.md`      | Tokens, TV vs phone type scales, primitives, motion, sound cues.             |
| `DESIGN_REVIEW_LOOP.md` | The design pass loop: worktree, one capture, evidence, definition of done.   |
| `TESTING.md`            | Layers (unit, contract, sim, e2e), `pnpm verify`, how to reproduce failures. |
| `CONVENTIONS.md`        | Code + commit conventions, file size limits, naming.                         |
| `DECISIONS.md`          | ADRs: Context → Decision → Consequences.                                     |
| `DEPENDENCIES.md`       | One line per dependency and why it exists.                                   |
| `BACKLOG.md`            | Known gaps and next items (`BL-nnn`).                                        |
| `GLOSSARY.md`           | Room, VIP, spectator, phase, view, fixture, rev, seed…                       |

# Testing

Four layers, cheapest first. Reproduce a bug in the cheapest layer that shows it, add the regression test
there, then fix.

| Layer                                | Command                                                | What it proves                                                               | Speed        |
| ------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------ |
| unit (Vitest, per package)           | `pnpm test`, `pnpm vitest --project engine`            | engine/shared/sdk/scripts logic; engine ≥ 90 % lines (`pnpm test:coverage`)  | seconds      |
| contract (Vitest project `contract`) | `pnpm vitest --project contract`                       | every folder in `games/` obeys `docs/GAME_CONTRACT.md`                       | seconds      |
| sim (in-process, headless)           | `pnpm sim --game <id> --players 6 --runs 200 --seed 1` | whole games with bot strategies, invariants after every event                | ~ms per game |
| e2e (Playwright, real browsers)      | `pnpm e2e`, `pnpm e2e:snap --game <id>`                | 1 TV + N phones play a full game; zero console errors; screenshots per phase | minutes      |

## `pnpm verify` (the gate — runs before every commit, < 3 min)

`registry check → typecheck → eslint → dependency-cruiser → prettier --check → unit + contract → sim smoke (50 runs/game) → vite build → bundle check → doc-drift checks`.
Implemented in `scripts/verify.ts`; each step is also a plain `pnpm` script you can run alone.
Bundle check (`pnpm check-bundle`, FOUNDATION-AUDIT #7): builds the client in memory and reads the
output bundle (never Vite's manifest, which cannot see modules inlined into the entry). It fails when
the entry chunk carries more `games/*` modules than `scripts/bundle-budget.json` allows, when the
entry's gzip grows over 1 KB, when a game's phone closure (JS + CSS gzip) is over the phone budget,
or when a manifest would ship; it prints each game's phone and TV gzip and any `Tv*` code riding on
a phone. After a deliberate change, `pnpm check-bundle --update` and commit the budget file.
Doc-drift checks (`scripts/check-drift.ts`): registry current; required docs exist; `CLAUDE.md` ≤ 120 lines;
every folder has a `README.md` ≤ 60 lines and every package/game a `CLAUDE.md` ≤ 30 lines; game READMEs
have the required headings; every phase has a fixture; `ADDING_A_GAME.md` mentions every `_template` file;
`TODO(BL-nnn)` ids exist in `BACKLOG.md`; every dependency has a line in `DEPENDENCIES.md`.

## Contract tests (`packages/game-sdk/src/contract-tests/`)

Run automatically against every `games/*` folder (including `_template`). They check every rule in
`docs/GAME_CONTRACT.md`: totality (fuzzed events in every phase), purity (source scan), timers-as-data,
determinism (two replays, hash after every event), view safety (no throw, no hidden-field leaks per the
game's `contract.config.ts`), termination with random and idle bots, results completeness, bot validity,
manifest equality, fixtures per phase, content validation.

## Simulator (`packages/sim`)

Strategies: `random`, `fast` (answers immediately), `slow` (answers just before the deadline), `idle`
(never answers), `chaos` (random timing plus disconnects/reconnects, VIP skip/pause/resume, duplicate
and ghost inputs, stale timers); `mixed` assigns one per player. Invariants run after every event;
every run is replayed and hashed to prove determinism. On failure a repro
`reports/stress/repros/<game>-<hash>.json` (init + event log) is written; `pnpm sim --replay <file>`
reproduces it. `pnpm verify` runs `pnpm sim --smoke` (50 mixed runs per game, player counts varied).
Details: `packages/sim/README.md`.

## E2E (`packages/e2e`)

Boots the server on a free port with the dev API, opens 1 TV (1920×1080) + N phones (iPhone and Pixel
profiles) that join through the real form, plays every registered game with `POST /api/dev/act` (each
game's bot playing for the humans) and `/api/dev/skip` for timer-only phases, and asserts zero console
errors / page errors / error boundaries and that every phone reached results. `pnpm e2e:snap --game <id>`
freezes the clock and writes screenshots per phase for the TV, each device preset and a spectator phone.
Details: `packages/e2e/README.md`. `pnpm e2e` is NOT part of `pnpm verify` (browsers take minutes).

## Determinism

Same seed + same event list ⇒ byte-identical state. Hash = FNV-1a over a stable (sorted-key) JSON
stringify (`packages/game-sdk/src/contract-tests/hash.ts`). Any drift is a P1 bug.

## Manual LAN check (before a release)

`pnpm dev`, open `/tv` on the TV and `/` on two phones, play both games, lock a phone mid-phase (reconnect),
close the VIP's tab for > 30 s mid-game (handover toast; back, the tab offers "Take it back"), join a third phone mid-game (spectator, included next game).

Filled in during Phases 3, 6 and 7.

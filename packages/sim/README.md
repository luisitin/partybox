# @partybox/sim

Headless simulator: plays whole games in-process with bot strategies on a simulated clock, checks
invariants after every event, replays every run to prove determinism, and writes reproducible
repros. Plus the stress layers: `src/fuzz/` (attack fuzzers per game), `src/room/` (engine-level
room chaos), `src/net/` (socket + HTTP fuzz against the real server), `src/soak/` (long runs
with metrics). Extension points: `src/strategies.ts`, `src/invariants.ts`, `src/fuzz/attacks.ts`,
`src/room/invariants.ts`, `src/net/scenarios.ts`.

## Usage

```
pnpm sim --game <id> [--players 6|vary] [--runs 200] [--seed 1] [--strategy random|fast|slow|idle|chaos|mixed]
pnpm sim --replay reports/stress/repros/<file>.json     # re-applies the events, re-checks invariants
pnpm sim --smoke [--runs 50]                            # what pnpm verify runs: every game incl. _template, mixed, players vary
pnpm sim --game <id> --dump-fixtures [--players 4]     # writes fixtures/<phase>.json (first state seen per phase)
```

```
pnpm sim --fuzz all|adversarial|hostile-content|schema-shape|chaos-timing --game <id> [--seed 1] [--runs 3]
pnpm sim --room-chaos [--runs 100] [--steps 400] [--seed 1]   # engine: joins/leaves/kicks/VIP/expiry/spectators
pnpm sim --net [--port 42070] [--url http://host:port] [--only name,name]   # spawns main.ts, dev API on + off
pnpm sim --soak [--minutes 60] [--port 42070] [--out <dir>]   # in-process server + bots + sockets, CSV per minute
```

`--game` accepts the manifest id (`template`) or the folder (`_template`). Exit code 1 on any violation.
`--fuzz` builds a corpus of reachable states (every strategy, prefixes recorded), applies attack chains
per category (semantic/hostile/shape-mutated inputs, stranger ids, stale/early/double timers, pause
across deadlines, clock jumps, 1000-input bursts) and checks totality, purity (input untouched, same
result twice), JSON round trip, declared phases, view safety and the game's `contract.config` hidden
strings after every step. `--room-chaos` repros are `room-<hash>.json`; `--replay` handles both kinds.

## Key files

- `src/cli.ts` — argument parsing (`node:util.parseArgs`) and commands.
- `src/runner.ts` — `runGame`: per-player reaction times, one timer per phase instance, chaos actions
  (disconnect/reconnect, VIP skip/pause/resume, duplicate + ghost inputs, stale timers), invariants
  after every event, determinism replay. An input that leaves state unchanged stops that bot for the phase.
- `src/strategies.ts` — `random`, `fast`, `slow` (answers just before the deadline), `idle`, `chaos`; `mixed` assigns one per player.
- `src/invariants.ts` — declared phases, deadline/startedAt sanity, rng monotonic, players unchanged, ≤ 256 KB, views never throw, results complete.
- `src/batch.ts` — many runs + summary (per-phase visits, violations by rule, first failures).
- `src/repro.ts` — `reports/stress/repros/<game>-<hash>.json` (init + events + violations) and `--replay`.
- `src/fixtures.ts`, `src/smoke.ts` — the two helper commands above.
- `src/fuzz/` — `values.ts` (hostile strings/numbers/shapes), `mutate.ts` (same-type, semantic and
  shape mutators), `corpus.ts`, `attacks.ts` (one generator per category), `checks.ts`, `index.ts`.
- `src/room/` — `chaos.ts` (seeded RoomEvent driver that ticks at every `nextWakeAt`), `invariants.ts`
  (VIP consistency, rev, capacity, name keys, spectators, views), `batch.ts` (summary + repros + replay).
- `src/net/` — `server.ts` (spawns `packages/server/src/main.ts`), `scenarios.ts`, `index.ts`.
- `src/soak/index.ts` — `createApp` in-process, bots + TV/phone sockets, `monitorEventLoopDelay`, CSV.

Builds on `@partybox/game-sdk/testing` (`playGame`, `hashState`, `loadAllGames`, …).

## Test

`pnpm vitest --project sim`

## Must NOT go here

Anything another package imports (nothing imports sim). Real sockets (except under `src/net/`).

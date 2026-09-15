# @partybox/sim

Headless simulator: plays whole games in-process with bot strategies, checks invariants after every event,
and writes reproducible repros. Extension points for the stress session: `src/strategies/`, `src/net/`
(socket-layer fuzzing against a real server), `src/soak/` (long runs with metrics).

## Usage (Phase 6)

```
pnpm sim --game <id> --players 6 --runs 200 --seed 1 [--strategy random|fast|slow|idle|chaos|mixed]
pnpm sim --replay reports/stress/repros/<hash>.json
pnpm sim --smoke            # what pnpm verify runs: 50 runs per game, mixed strategies
pnpm sim --game <id> --players 4 --runs 1 --dump-fixtures   # writes fixtures/<phase>.json for a new game
```

## Key files

- `src/cli.ts` — argument parsing (`node:util.parseArgs`) and commands.
- `src/runner.ts` — drives engine + game with a simulated clock; records the event log.
- `src/strategies/*.ts` — one strategy per file; `chaos` also disconnects/reconnects and VIP-skips.
- `src/invariants.ts` — checks after every event (state size, JSON, determinism hash, views don't throw, results complete).
- `src/repro.ts` — write/read repro files.

## Test

`pnpm vitest --project sim`

## Must NOT go here

Anything another package imports (nothing imports sim). Real sockets (except under `src/net/`).

# @partybox/sim

Headless simulator: plays whole games in-process with bot strategies on a simulated clock, checks
invariants after every event, replays every run to prove determinism, and writes reproducible
repros. Extension points for the stress session: `src/strategies.ts` (new behaviours),
`src/invariants.ts` (new checks), `src/net/` (socket-layer fuzzing against a real server, to be
created), `src/soak/` (long runs with metrics, to be created).

## Usage

```
pnpm sim --game <id> [--players 6|vary] [--runs 200] [--seed 1] [--strategy random|fast|slow|idle|chaos|mixed]
pnpm sim --replay reports/stress/repros/<file>.json     # re-applies the events, re-checks invariants
pnpm sim --smoke [--runs 50]                            # what pnpm verify runs: every game incl. _template, mixed, players vary
pnpm sim --game <id> --dump-fixtures [--players 4]     # writes fixtures/<phase>.json (first state seen per phase)
```

`--game` accepts the manifest id (`template`) or the folder (`_template`). Exit code 1 on any violation.

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

Builds on `@partybox/game-sdk/testing` (`playGame`, `hashState`, `loadAllGames`, …).

## Test

`pnpm vitest --project sim`

## Must NOT go here

Anything another package imports (nothing imports sim). Real sockets (except under `src/net/`).

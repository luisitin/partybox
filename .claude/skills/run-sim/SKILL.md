---
name: run-sim
description: Run the headless PartyBox simulator against a game, interpret failures, replay repros.
---

# run-sim

See `packages/sim/README.md` and `docs/TESTING.md`.

- Baseline: `pnpm sim --game <id> --players 6 --runs 200 --seed 1`
- Each strategy: add `--strategy random|fast|slow|idle|chaos` (default `mixed`).
- A failure writes `reports/stress/repros/<hash>.json`; reproduce with `pnpm sim --replay <file>`.
- Fix in the cheapest layer (game reducer → engine), add a regression test named after the finding, re-run the same seed.
- Generate fixtures for a new game: `pnpm sim --game <id> --dump-fixtures --players 4`.

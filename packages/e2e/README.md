# @partybox/e2e

Playwright harness (library, not test runner — ADR-016). Boots `pnpm dev` on a free port, opens 1 TV +
N phones through the REAL UI (join form, avatars), drives play through the dev API, and fails on any
console error, page error, React error boundary, or a phone that never reaches the results screen.
Also the screenshot tool the design session uses.

## Usage

```
pnpm exec playwright install chromium                  # once per machine (shared by all worktrees)
pnpm e2e [--game <id>]... [--phones 4] [--port <n>] [--seed 1] [--timeout 300]
pnpm e2e:snap --game <id> [--out <dir>] [--devices iphone,pixel,iphone-se,galaxy,landscape,font200] [--seed 1] [--max-phases 14]
```

`pnpm e2e` plays every registered game (or the given ones) with phones alternating iPhone / Pixel; the TV
page runs at 4× CPU throttling (CDP) and any long task over 250 ms fails the run (design-system budget);
players' moves come from `POST /api/dev/act` (each game's own `bot.sampleInput`); timer-only phases
are skipped via `POST /api/dev/skip` so a run takes seconds. `pnpm e2e:snap` freezes the clock before
starting, then for each phase writes `<out>/<nn>-<phase>/tv.png`, one `<device>-<player|vip>.png` per
device preset, `pixel-spectator.png` (a late joiner), and a `-after` set once half the room has acted
(submitted vs waiting states). Default `--out` is `reports/e2e/screenshots/<game>/` (gitignored).

## Key files

- `src/cli.ts` — commands `run` (default) and `snap`.
- `src/server.ts` — `startServer(port?)`: spawns `pnpm dev --port <free> --host 127.0.0.1`, waits for `/healthz`, kills the process tree.
- `src/devices.ts` — presets `tv`, `tv4k`, `iphone`, `iphone-se`, `pixel`, `galaxy`, `landscape`, `font200` (emulated by scaling the phone type tokens).
- `src/dev-api.ts` — typed client for `/api/dev/*` and `/api/games`.
- `src/session.ts` — `openTv`, `joinPhone` (through the form), console/pageerror/boundary collection.
- `src/run.ts`, `src/snap.ts` — the two commands.

## Test

`pnpm vitest --project e2e` (helpers) · the harness itself is the test: `pnpm e2e`.

## Must NOT go here

Anything another package imports. Game knowledge beyond the dev API and `bot.sampleInput`.

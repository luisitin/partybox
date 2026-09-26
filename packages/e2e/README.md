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

## Design capture (`src/design/`, added by the design session; each script boots its own server on 42071)

```
pnpm exec tsx packages/e2e/src/design/capture-{core,video}.ts --out reports/design/<stamp> [--game quickpoll]
pnpm exec tsx packages/e2e/src/design/sheet.ts --dir reports/design/<stamp>            # contact-sheet.html
pnpm exec tsx packages/e2e/src/design/measure.ts                                       # computed sizes → stdout
pnpm exec tsx packages/e2e/src/design/capture-preview.ts --out <dir> [--games a,b] [--themes night,daylight] [--phones iphone,iphone-se]
pnpm exec tsx packages/e2e/src/design/capture-game.ts --game <id> --out <dir>         # live run, every phase, 4 phones + 2 bots
pnpm exec tsx packages/e2e/src/design/capture-{themes,fit,home}.ts --out <dir>         # lobby per theme · TV at 4 viewport sizes · TV 🏠 flow
pnpm exec tsx packages/e2e/src/design/capture-loop.ts --pass <n> --game <id> [--scenario …]  # /review-loop round: video, stills, strips, cue log · loop-sheet.ts <strip-dir> = contact sheet
pnpm exec tsx packages/e2e/src/design/audio-trace.ts --out <dir>                       # every sound across every screen: 45 checks → AUDIO-TRACE.md
pnpm exec tsx packages/e2e/src/design/capture-results-tie.ts --port <own-port> --build --only teams3,teams4 --out <dir> # team rows + unassigned player, EN/ES TV/SE/200%
```

`quickpoll` is a throwaway `pnpm new-game quickpoll` scaffold of `_template` (text answer + bots welcome)
that `capture-core`, `-video`, `-bots` and `measure` drive: create it locally, never commit it (nor the
`games.generated.ts` it adds itself to). `devices.ts` = tv, tv4k, pc720, laptop, tv4kcss, iphone,
iphone-se, pixel, galaxy, font200 (CSS-emulated 200 % scale), landscape. `session.ts` = dev-API client +
join-through-the-form helpers. `shooter.ts` records every still in `manifest.json` for the contact sheet.
`capture-core.ts` walks join errors, lobby 1/6/16, selecting, every phase with every phone role, results, play-again, end, kick, server restart; `capture-video.ts` records one unfrozen round.

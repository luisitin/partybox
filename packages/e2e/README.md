# @partybox/e2e

Playwright harness (library, not test runner — ADR-016). Boots the server on a free port with the dev API,
opens 1 TV + N phones, drives play with dev-API bots, and asserts zero console errors / unhandled
rejections and that every phone reaches results. Also the screenshot tool for the design session.

## Usage (Phase 7)

```
pnpm exec playwright install chromium          # once per machine
pnpm e2e [--game <id>] [--phones 4] [--port <n>]
pnpm e2e:snap --game <id> [--out reports/design/<stamp>/<id>] [--devices iphone,pixel]
```

## Key files

- `src/cli.ts` — commands `run` and `snap`.
- `src/server.ts` — spawns `pnpm dev --port <free>` and waits for `/healthz`.
- `src/devices.ts` — named presets: `tv` (1920×1080), `tv4k`, `iphone`, `iphone-se`, `pixel`, `galaxy`, `landscape`, `font200`.
- `src/session.ts` — opens TV + phone contexts, joins players, collects console errors.
- `src/snap.ts` — freezes the clock, walks phases via `/api/dev/skip`, screenshots TV + each phone per phase.

## Test

`pnpm vitest --project e2e` (unit for helpers) · the harness itself is the test.

## Must NOT go here

Anything another package imports. Game knowledge beyond the dev API and `bot.sampleInput`.

## Design capture (`src/design/`, added by the design session)

Standalone until the Phase 7 harness lands; each script boots its own server on **42071**.

```
pnpm exec tsx packages/e2e/src/design/capture-core.ts  --out reports/design/<stamp> [--game quickpoll]
pnpm exec tsx packages/e2e/src/design/capture-video.ts --out reports/design/<stamp> [--game quickpoll]
pnpm exec tsx packages/e2e/src/design/sheet.ts         --dir reports/design/<stamp>   # contact-sheet.html
pnpm exec tsx packages/e2e/src/design/measure.ts                                     # computed sizes → stdout
```

`devices.ts` = tv, tv4k, iphone, iphone-se, pixel, galaxy, font200 (CSS-emulated 200 % scale),
landscape. `session.ts` = dev-API client + join-through-the-form helpers. `shooter.ts` records every
still in `manifest.json` (game / phase / device / role) for the contact sheet. `capture-core.ts` walks
join errors, lobby 1/6/16, selecting, every game phase with active/submitted/VIP/spectator/reconnecting
phones, results, play-again, end, kick, server restart. `capture-video.ts` records one unfrozen round.

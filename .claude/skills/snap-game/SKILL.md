---
name: snap-game
description: Produce screenshots of every phase of a PartyBox game (TV + phones) with a frozen clock.
---

# snap-game

See `packages/e2e/README.md` and `docs/DEV_API.md`.

1. Once per machine: `pnpm exec playwright install chromium`.
2. `pnpm e2e:snap --game <id> [--out <dir>] [--devices iphone,pixel]` — boots a server on a free port,
   freezes the clock, walks phases with `/api/dev/skip`, writes `<dir>/<phase>/<device>-<role>.png`.
3. Look at the images (you can view PNGs). Check against the rubric in `docs/DESIGN_SYSTEM.md`.
4. For a single state without bots: `pnpm dev` then `/preview/<id>/<phase>?view=tv|controller&player=<id>`.

Screenshots are gitignored; commit only markdown findings.

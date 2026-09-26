# e2e — local rules

- Always boot on a free port (never 42069/42070/42071) so parallel sessions don't collide.
- Freeze the clock (`POST /api/dev/clock { freeze: true }`) before stills; unfreeze for motion.
- Zero tolerance: any console error, unhandled rejection or React error boundary fails the run.
- Screenshots go under `reports/**/screenshots/` (gitignored); name them `<game>/<phase>/<device>-<role>.png`.
- Document every harness addition in README.md — the design and stress sessions build on it.
- Run: `pnpm e2e`, `pnpm e2e:snap --game <id>`.

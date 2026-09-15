# Design review — LATEST (2026-09-15)

- Pass: `reports/design/2026-09-15-1619/` — core screens + Quick Poll (uncommitted `pnpm new-game quickpoll` scaffold); captured on main@5da6dd7, applied after merging main@3e9faa9 (Wisecrack + Lightning Round landed meanwhile — not yet reviewed).
- Contact sheets: `2026-09-15-1619/contact-sheet.html` (before) · `2026-09-15-1619/after/contact-sheet.html` (after) · video `2026-09-15-1619/quickpoll/video/round.webm`.
- Recommendations: `2026-09-15-1619/RECOMMENDATIONS.md` — 28 items, **all applied** on branch `design` (one commit per item, verify green).
- Biggest fixes: TV inherited text 18 px → real TV scale (R-001), 128 px timer + deadline bar (R-002/R-015), dense results board (R-005), join "Joining…" dead-end (R-014), non-blocking audio gate (R-009).
- Research: `2026-09-15-1619/research.md`. Hand-offs: `2026-09-15-1619/for-stress.md` (chip order, spectators missing from view; the kick-reconnect fix is in R-019).
- Owner decisions pending: `phaseStartedAt` in the view envelope; `category` on ToastPayload (both shared/engine).
- Capture tooling: `packages/e2e/src/design/` — see `packages/e2e/README.md`.
- Next: merge `design` into main, then a full pass over Wisecrack and Lightning Round (new games on main).
- Tally: open 0 / applied 28 / declined 0.

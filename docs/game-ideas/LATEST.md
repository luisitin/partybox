# Game design — LATEST

- 2026-09-15 · **001 Bingo v0.3** (`001-bingo.html`): plain 75-ball bingo. TV shows only the current letter + number; daubing is free (tap toggles, nothing validated); pressing BINGO! **pauses the caller** and puts the card on the TV — pattern green ✓, never-called daubs red ✕ — wrong → card goes back (reds wiped, wait one number), right → round won. 1 point per round, no awards. Size S.
- 2026-09-15 · **002 Broken Pencil v0.2** (`002-broken-pencil.html`): Telestrations-style word → draw → guess books; then the TV shows every book first page to last, one page at a time, **the VIP turns the pages** (skip = Next, pause = hold). No scoring. Size L (first canvas in the repo; ink budget keeps state ≤ 185 KB).
- Both designs were **simulated headlessly** (`_tools/sim-001-bingo.mjs`, `_tools/sim-002-broken-pencil.mjs`): ~1 400 games, fuzz, determinism, sizes, invariants. The sims caught and fixed: an off-by-one in Broken Pencil's book routing, a schema regex that rejected single-dot strokes, and a view crash on VIP-end during pick. Results are in §13 of each doc.
- Owner decisions folded in: bingo = simple, friendly, shared check moment (a whole room spamming claims can stall it — accepted; valve listed in §14); telestrations = just fun, no points, VIP drives.
- Build first: 001 (one day), then 002 (three days; builds the DrawPad that BL-002 wants).
- SDK gaps (`sdk-requests.md`): R-1 quiet timer (blocks both), R-2 game sound cues, R-4 DrawPad/DrawingView, R-6 VIP back + page-friendly pause, R-7 per-phase skip label.
- Tooling: `_tools/build.mjs` builds `_src/*.mjs` → HTML + INDEX; run prettier after building (the verify gate formats `docs/`).
- Next: 003 far from these on the matrix — hidden roles / deception / text or choice, 2–3 players or < 5 min.

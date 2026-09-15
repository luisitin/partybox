# Stress — latest digest (loop 1, 2026-09-15-1640) → [full report](2026-09-15-1640/SUMMARY.md)

1. Baseline on `main` @ 5da6dd7: `pnpm verify` GREEN; 200 random sim runs per game clean. Only `template` exists.
2. New permanent harness in `packages/sim`: `--fuzz` (4 attack categories), `--room-chaos`, `--net`, `--soak`.
3. 9 findings: P1 ×2 (F-002 VIP-less room after resume, F-003 double-join ghost/VIP wedge), P2 ×1 (F-001 VIP end zeroes scores), P3 ×4 (F-004, F-005, F-006, F-007), SPEC ×2.
4. Fixed on branch `stress` with regression tests, verify green: F-001, F-002, F-003, F-005, F-006, F-007.
5. Needs you: F-004 dev API open on the LAN + leaks tokens (proposal inside); SPEC-001 blank answers; SPEC-002 NFKC name keys.
6. Layers run: 5,400 sim games · 41,000 fuzz attacks · 1,300 rooms / 1.6 M engine events · 13 net scenarios ×2 · 60-min soak (7,437 games, no growth).
7. Not run: browsers — `packages/e2e` is a Phase 7 stub. Visual notes in `2026-09-15-1640/for-design-session.md`.
8. Matrix: `MATRIX.md`. Repros: `2026-09-15-1640/repros/` (replay of a FIXED repro says "hash DIFFERS" by design).
9. Untested: branches `wisecrack`, `lightning-round` (not on `main`). Next loop merges `main` first.
10. Ask before merging `stress`: the socket guard (F-003/F-005) refuses a second `join` on one socket — the shipped client never does that, but any hand-rolled client must `leave` first.

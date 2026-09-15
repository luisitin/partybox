# Stress matrix — games × phases × attack categories

Status per cell: `untested` · `clean` · finding ids. Updated after every loop (last: loop 1, 2026-09-15-1640).
Games on `main` at 5da6dd7: only `_template` (Quick Poll, id `template`; unregistered scaffold, tested
like a game). Branches `wisecrack` and `lightning-round` exist but are not merged — untested.

Layers: L1 = in-process (`pnpm sim`, `--fuzz`, contract suite) · L2 = engine rooms (`--room-chaos`) ·
L3 = real server sockets/HTTP (`--net`, port 42070) · L4 = soak · L5 = browsers (Playwright — **not
available**, `packages/e2e` is a Phase 7 stub).

## template (Quick Poll) — phases `answer`, `reveal`, `done`

| Category                   | answer                                | reveal   | done     | Layer   | Runs (loop 1)                                       |
| -------------------------- | ------------------------------------- | -------- | -------- | ------- | --------------------------------------------------- |
| Reducer totality           | clean (F-006 fixed)                   | clean    | clean    | L1 fuzz | 3,016 adversarial attacks × 24 states               |
| Hostile content            | SPEC-001 (whitespace), F-006          | clean    | clean    | L1 fuzz | 823 attacks                                         |
| Schema shape               | clean (0 safeParse throws)            | clean    | clean    | L1 fuzz | 1,128 attacks                                       |
| Player chaos (game events) | clean                                 | clean    | clean    | L1      | 1,400 runs (6 strategies + vary)                    |
| Player chaos (room level)  | F-002 fixed, SPEC-002                 | clean    | clean    | L2      | 1,300 rooms / 1.6 M events / 18 k games             |
| Timing                     | clean                                 | clean    | clean    | L1 fuzz | 224 chains (twice/early/late/pause/jump/1000-burst) |
| Termination & liveness     | clean (random/idle/chaos/skip)        | clean    | clean    | L1 + L2 | budget 3× estimatedMinutes, stuck detector          |
| Determinism                | clean                                 | clean    | clean    | L1 + L2 | every run replayed + hashed; rooms replayed         |
| Scoring vs README          | F-001 fixed (VIP end)                 | clean    | clean    | L1 unit | hand-computed rounds in game.test.ts                |
| Views / hidden info        | clean                                 | clean    | clean    | L1 fuzz | tv + 16 ids per state incl. prototype keys          |
| Protocol / server (42070)  | F-003, F-005, F-007 fixed; F-004 open | —        | —        | L3      | 13 scenarios, dev API on + off                      |
| Resources (soak)           | see metrics/                          | —        | —        | L4      | 60 min back-to-back bot games                       |
| Real browsers              | untested (harness missing)            | untested | untested | L5      | —                                                   |

## Engine / server (game-independent)

| Area                                                | Status                                                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| VIP handover / expiry / resume                      | F-002 fixed; 1,300 rooms clean                               |
| Join rules (case, unicode, capacity, lock, avatars) | SPEC-002 open (NFC/NFD, homoglyphs); rest clean              |
| Spectators mid-game → next game                     | clean (invariant: spectator ∉ game state; promoted on start) |
| rev monotonic / one push per event                  | clean                                                        |
| Socket payload validation                           | clean (junk, 1 MB, raw WS garbage)                           |
| Rate limit 20/s                                     | clean (1000 inputs → rate_limited)                           |
| 60 sockets / storms                                 | clean (16 welcomed, 44 room_full, healthz < 500 ms)          |
| Dev API off                                         | clean (403 everywhere)                                       |
| Dev API on, LAN exposure                            | F-004 open                                                   |

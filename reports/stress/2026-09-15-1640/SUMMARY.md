# Stress loop 1 — 2026-09-15 16:40 (branch `stress`, main @ 5da6dd7 "Phase 6")

- Baseline: `pnpm verify` GREEN on a clean checkout (12 s). 200 random runs per game: 0 failures.
- Runs: L1 sim 5,400 games (6 strategies, players 1–16) + 41,000 fuzz attacks over 6 seeds; L2 room chaos 1,300 rooms / 1.6 M events / 18 k games; L3 net 13 scenarios × dev-API on/off on :42070; L4 soak 60 min (see metrics/); L5 browsers **not run** (`packages/e2e` is a Phase 7 stub).
- Findings: **P1 ×2** (F-002 VIP-less room, F-003 double-join ghost) · **P2 ×1** (F-001 VIP end zeroes scores) · **P3 ×4** (F-004 dev API open on LAN, F-005 TV can play, F-006 prototype-key ids, F-007 bad JSON → 500) · **SPEC ×2** (SPEC-001 whitespace answers, SPEC-002 look-alike names).
- Fixed on this branch (6 commits, each with a regression test, verify GREEN): F-001, F-002, F-003, F-005, F-006, F-007.
- Needs you: **F-004** (lock the dev API to loopback or a header; redact tokens) · **SPEC-001** (wording for blank answers) · **SPEC-002** (NFKC name keys) · merge order: the `wisecrack` / `lightning-round` branches are untested until they land on `main`.
- Harness added to `packages/sim` (permanent): `--fuzz`, `--room-chaos`, `--net`, `--soak`, room repros + replay. Documented in `packages/sim/README.md`.
- Soak: 60 min, 7,437 games, 0 errors; RSS warm-up 103→199 MB by minute 8 then flat (202 MB at minute 60), heap GC sawtooth, loop lag p99 33–34 ms constant, snapshot size bounded — no growth (metrics/README.md).
- Net re-run after fixes: 13/13 scenarios clean, dev API on and off, server never exited, no stderr.
- Only one game exists (`template`); the matrix is in `../MATRIX.md`. No known-bug rediscovery (no prior LATEST.md).

## Per game

| Game                  | Cases run                                                                                                         | Pass rate after fixes | Open finding ids |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------- |
| template (Quick Poll) | 5,400 sim runs · 41,000 fuzz attacks (adversarial 3,016/seed, hostile 823, shape 1,128, timing 224) · 1,300 rooms | 100 % (0 violations)  | SPEC-001         |
| engine / server       | 1,300 rooms / 1.6 M events · 13 net scenarios × 2 modes                                                           | 100 %                 | F-004, SPEC-002  |

## What each layer proved

- **Reducer totality / views:** every event type × every phase × known/spectator/unknown/prototype ids, inputs before/after deadlines, stale/early/double/NaN timers, VIP nonsense orders, everyone disconnected — `reduce` never throws, never mutates its input, is idempotent, state survives JSON, views never throw, `contract.config` hidden strings never appear. Before F-006 the prototype ids corrupted `players` in every phase.
- **Hostile content:** 10 KB / emoji / ZWJ / RLO / homoglyph / HTML / `__proto__` / NaN / -0 strings and numbers; schema rejected 1,724 of 2,162 mutated inputs, accepted ones were harmless except whitespace-only text (SPEC-001). `safeParse` never threw (deep nesting 5,000 levels, 100 KB strings, symbols, bigint, functions). No prototype pollution.
- **Timing:** timer twice / early / late / after pause / after clock jump ±1e9–1e12; pause-resume ×50 keeps `deadline ≥ startedAt`; 1,000 inputs in one tick ≈ 290 ms with checks (fine).
- **Player chaos (room level):** joins with 30 hostile names, resumes with right/wrong tokens, kicks, transfers to self/disconnected, lock/unlock, playAgain/toLobby from wrong states, expiry and handover jumps, spectators joining mid-game — one real bug (F-002), everything else consistent (one VIP, rev +1 per push, capacity, spectators never in game state, connected flags in sync).
- **Determinism:** every sim run replayed twice with per-event hashes; every room log replayed to the same hash. No drift.
- **Scoring:** hand-computed rounds (all answered, deadline with one idle, disconnected player, VIP end) vs README — F-001 was the only mismatch.
- **Protocol:** junk payloads/event names, 20 KB and 1 MB inputs, 1,000 inputs in 5 s (rate limited, ≤ 20/s + burst acked), 60 sockets (16 in, 44 `room_full`), 150-socket storm (healthz < 500 ms after), forged tokens (never resume), locked room, TV observers, non-VIP kick, raw WebSocket garbage, bogus sid — server never exited, no stderr. Dev API off → 403 everywhere.

## Not done / caveats

- No browser layer (Playwright harness lands in Phase 7). `for-design-session.md` lists what I'd check first.
- Individual fix commits were verified as a series; `pnpm verify` is green at the branch tip (`git log stress`).
- Replaying a repro of a FIXED finding prints "final hash DIFFERS" by design (the recorded final state was the broken one).

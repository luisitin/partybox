# packages/e2e/live — multi-persona live play

Ad-hoc scripts for playing PartyBox with several real browser tabs at once against ONE running server
(one process per persona, all pointed at the same `PB_URL`). Used for the 2026-09-15 session whose report
is in `reports/e2e/live/REPORT.md`. Not part of `pnpm verify`; excluded from lint and typecheck.

- `lib.mts` — the shared helpers: `openPhone` (joins through the real form), `openTv`, `detectScreen`,
  `actOnce` (fills TextAnswer / taps ChoiceGrid / VoteList), `isVip`, `vipStartGame`, `devState`,
  `logLine` (JSONL to `PB_OUT`), `screenshot`.
- `*.helper.mts` — the personas from the session (VIP that goes offline for 40 s, fast, slow on an
  iPhone SE, reloader, late joiner, TV watcher). Each stops itself after ~500 s.

Run (separate terminals, same server):

```
pnpm dev --port 42090
set PB_URL=http://127.0.0.1:42090 && set PB_OUT=C:/dev/partybox/reports/e2e/live
pnpm exec tsx packages/e2e/live/vip.helper.mts        # and fast / slow / reloader / late / tv
```

Lessons baked into `lib.mts` after the first session: the submit button is "Next prompt" on Wisecrack's
first prompt; `isVip` must be scoped to the header (toasts mention "VIP"); Wisecrack's time setting is
labelled "Writing time"; `detectScreen` polls at 700 ms, so give results screens a dwell before the VIP
presses "New game" or nobody else sees them.

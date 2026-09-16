---
name: review-loop
description: Tight design-improvement loop for PartyBox — one short simulation per pass, ≤ 8 ranked findings, a multiple-choice question to the owner, nothing applied until they answer.
---

# review-loop

A tight improvement loop. Rule: **small batches** — one short simulation, a few findings, a question
to the owner, nothing applied until they answer. No large test suites, no long reports, no batching of
dozens of items. If a list exceeds the cap, cut it to the most impactful items; the rest waits for a
later pass.

**Scope:** visual design, layout, motion/animation, microcopy, phone ergonomics, sound-cue timing,
perceived performance. (Not rules, scoring, engine, protocol.)

## One pass (target: under 10 minutes of work)

1. **Pick a scenario.** Rotate through `each game on main` × (normal 6-player round · 3-player round ·
   12-player round · a player disconnects and reconnects mid-phase · VIP leaves · a tie in results ·
   spicy setting on) × (TV focus · phone focus). Never repeat a scenario until every other one has
   been done once. Log the scenario in `reports/design/loop-log.md` (read it first: it is the
   rotation state and the list of declined items).
2. **Run exactly one simulation** on port **42071**:
   `pnpm exec tsx packages/e2e/src/design/capture-loop.ts --pass <n> --game <id> --players 6 --scenario <key> [--focus tv|phone] [--spicy]`
   — one full round with dev-API bots, about two minutes of real-time play (clock NOT frozen), video
   of the TV and one phone, a still of TV + active player + waiting player at every phase change,
   frame strips (one frame per 100 ms) from each phase transition and from the last 5 s of any
   timer, and the audio-cue log (cue, time, phase). Everything lands in
   `reports/design/loop/<pass>/` (`stills/`, `strips/`, `video/`, `cues.json`, `timeline.json`,
   `frame-timing.json`).
3. **Analyze** the stills, strips, cue log and frame-timing numbers. Compare against
   `docs/DESIGN_SYSTEM.md` and the rubric in `reports/design/` if present. Check `loop-log.md` and
   never re-propose anything the owner declined.
4. **Present findings** — cap 5 (hard cap 8), ranked by impact. For each: one line of what you saw
   (with the evidence file path), **Option A** (your recommendation, specific: values, tokens, copy,
   timing), **Option B** (a different approach), **Skip**. Whole message under 40 lines. Nothing
   worth changing → say so in one line and run the next scenario immediately; after three empty
   passes in a row, check in and ask whether to widen the scope.
5. **Ask** with the AskUserQuestion tool — one question per finding, options A / B / Skip (the tool
   adds "Other" for free text). Then **do nothing** until the owner answers: no next simulation, no
   applying, no "preparing" changes.
6. **After the answer:** apply the chosen options only; re-capture just the affected screens as
   before/after into the same pass folder (`after/`); `pnpm verify`; commit one item per commit
   (`design(<area>): loop#<n> <title>`); append proposed / chosen / declined to `loop-log.md`; show
   the before/after paths in three lines; start the next pass at step 1.

## Hard limits

- One simulation per pass. No `pnpm sim` bulk runs, no full e2e suite, no matrix sweeps.
- At most 12 findings per pass; prefer 6–8 (present ≤ 8).
- No report files other than the pass folder and `loop-log.md`.
- Never apply anything the owner has not explicitly picked. "Skip" = do not mention it again unless
  something changes.
- Every proposal must be visible in the captured evidence; no proposals from reading code alone.

## Files

- `packages/e2e/src/design/capture-loop.ts` — the one-simulation capture (server on 42071).
- `reports/design/loop-log.md` — rotation state, scenarios run, proposed / chosen / declined per pass.
- `reports/design/loop/<pass>/` — evidence (media is gitignored; keep `cues.json`, `timeline.json`).

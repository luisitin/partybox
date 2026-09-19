# The design review loop — one pass at a time

A **pass** is the unit of design work: one capture of the real app, a few ranked findings, a decision,
the applied change with before/after evidence, and one row in `reports/design/loop-log.md`. Passes are
numbered and never reset (389 so far). The per-pass protocol lives in the `review-loop` skill
(`.claude/skills/review-loop/SKILL.md`); this doc is everything around it: how to start, where the
evidence lands, and when a pass is finished.

Scope of the loop: visual design, layout, motion, microcopy, phone ergonomics, sound-cue timing,
perceived performance. Not rules, scoring, engine or protocol — those are the main session's.

## Starting a loop

1. Work in the design worktree: `claude --worktree design` → branch `design`, port **42071**,
   writes only `reports/design/` and client visuals (`reports/README.md`).
2. `git merge main` at the start of every pass, so the captures show what the owner has.
3. Once per machine: `pnpm exec playwright install chromium`. Once per worktree: `pnpm fetch-music` —
   `packages/client/public/music/` is gitignored, and without it every "one track audible" check
   fails (loop #211).
4. Read `reports/design/loop-log.md` **first**. It carries the rotation state (game × scenario × focus,
   never repeat a cell until every other has run), the lens of the current cycle, the items the owner
   declined (never re-proposed), and the last pass number — the next pass is the highest + 1, and
   `pnpm check-drift` fails on a shared number.
5. Run `/review-loop` and follow it pass after pass.

## Asking versus autonomous

The skill's default is to stop: present ≤ 8 findings, ask one multiple-choice question per finding,
apply nothing until the owner answers. The owner switched this loop to **autonomous** on 2026-09-16
(pass 35): keep simulating, apply easy fixes directly, no questions. The mode and each cycle's lens
are recorded in the prose lines between the tables of `loop-log.md` — read them; when the mode is not
obvious, ask once and write the answer there.

## One capture per pass

```
pnpm exec tsx packages/e2e/src/design/capture-loop.ts --pass <n> --game <id> --players 6 \
  [--scenario normal|reconnect|vip-leaves|tie|walkover|spicy|pause|rash] [--focus tv|phone] \
  [--settings '{"rounds":3}'] [--pause-in <phase>] [--fps 10] [--after 2.5] [--budget 150] [--port 42071]
```

One full round on 42071 with dev-API bots and two real phones, about two minutes of real time, clock
**not** frozen. It writes the TV and one phone as video, TV / active phone / waiting phone stills at
every phase change, frame strips around each transition and over the last 5 s of every timer, the
audio-cue log and the TV's long-frame numbers. `--focus` only labels the pass in `timeline.json`; it
steers what you analyze, not what is captured.

When the standard round cannot show the moment (one step, one device, one animation), write a
purpose-built script next to it — `packages/e2e/src/design/capture-<game>-<thing>.ts`, the pattern of
the two dozen already there — and reuse the helpers: `loop-sheet.ts` (contact sheet of a strip),
`filmstrip.ts` (burst frames into one labelled strip), `audio-trace.ts`, `measure.ts`, `devices.ts`.
`packages/e2e/README.md` lists them all.

## Where captures go

`reports/design/loop/<pass>/` — `stills/`, `strips/`, `video/`, plus `cues.json`, `timeline.json`,
`frame-timing.json`. A pass with its own scripts may use suffixed folders (`loop/368-intro/`,
`368-audio/`). After-shots of a change go in `after/` inside the same pass folder.

Media is **not committed**: `reports/**/*.png`, `reports/**/video/` and `*.webm` are gitignored. The
JSON files and the log row are the committed record, so a finding quotes numbers and paths rather than
relying on an image surviving. No report files outside the pass folder, `loop-log.md` and the 10-line
`reports/design/LATEST.md` digest.

## When a pass is done

- Every proposed item is decided: chosen, declined, or skipped (a skip is never raised again).
- Only the chosen items are applied — nothing else rides along.
- The affected screens are re-captured into `after/`, so before and after sit side by side.
- `pnpm verify` is green.
- One commit per item: `design(<area>): loop#<n> <title>`.
- A row is appended to `loop-log.md`: pass, date, game, scenario, focus, evidence path, proposed,
  chosen, declined.
- `LATEST.md` still reads as one screen of what the owner needs to know.

A pass that finds nothing is still a pass: one line saying so, its row in the log, and the next
scenario starts immediately. Three empty passes in a row → check in and ask whether to widen the lens.

## Merging back

`loop-log.md` conflicts on almost every merge — two sessions append to one table. Run
`pnpm resolve-loop-log`, then `pnpm format`, then commit. Never take both sides of the conflict: it
duplicates the whole table (it reached four copies once). The resolver identifies a row by its text,
not its number, and renumbers a colliding pass past the highest.

## Read next

`.claude/skills/review-loop/SKILL.md` (the pass protocol) · `packages/e2e/README.md` (every capture
script) · `docs/DESIGN_SYSTEM.md` (what the findings are judged against) · `docs/DEV_API.md` (how the
captures drive the room) · `reports/README.md` (worktrees, ports, ownership).

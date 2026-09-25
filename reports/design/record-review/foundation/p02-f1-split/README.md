# Foundation p02 — F1: a game is downloaded only when it is picked

Recorded 2026-09-24 with `capture-picker.ts --prod --build` on port 42300 (same set-up as p00:
TV 1920×1080, VIP iPhone 15, guest iPhone SE, 3 idle bots, Wisecrack), plus the download-failure
probe (`probe-load-fail.ts`, stills in `../p02-load-fail/`). Media gitignored.

## What phones download (production build, brotli, cold cache)

| Stage            | p00 (main)                         | p02                                        |
| ---------------- | ---------------------------------- | ------------------------------------------ |
| Join page        | 1,143 KB (JS 611, CSS 96, sfx 394) | **177 KB** (JS 119, CSS 12, font 39)       |
| Open the picker  | 0 (everything was already there)   | **0** (the list opens with nothing chosen) |
| Choose Wisecrack | 0                                  | 13.4 KB (its phone download)               |
| Start            | 18.3 KB                            | 0 (already downloaded on choose)           |
| Every room push  | ~16 KB                             | 1.2–1.8 KB (F2)                            |

`pnpm check-bundle` (gzip, JS + CSS): everything a phone loads at join 148 KB; game modules in the
entry 16 → 0; phone downloads Bingo 32.4, Blanks 21.8, Broken Pencil 13.3, Wisecrack 11.1,
Lightning Round 9.5 KB; no TV code on any phone (Blanks' Controller used to pull its TV result);
no content in any chunk. The TV fetches the cheer and horn (388 KB) as a game starts — no device
fetches them at its first tap any more.

## A download that fails

- 2.5 s outage: the retry at 1 s fails, the retry at 4 s (a fresh URL: Chromium keeps a failed
  module import and never re-requests the same one) loads the game; no card is shown.
- Long outage: real re-requests at 1, 3 and 6 s, then "Couldn't load the game." with a still "!"
  and "Tap to retry" at 10.4 s; the TV and the room carry on. One tap reloads the page; the seat
  resumes by token and the phone lands in Wisecrack's writing screen with the clock still running.

## Looked at

- Every stage's still on all three surfaces: the picker with nothing chosen shows "Pick a game
  first." under a disabled Start; choosing, starting and the first phase render as before.
- The recorder's own bug, found here: with the TV app now its own chunk, "tap for sound" rendered
  after the harness looked for it, so the first p02 run filmed a muted TV; `passAudioGate` now
  waits for the gate.
- Frames: none over 100 ms; the VIP phone had two frames at exactly 100 ms at load/join on a run
  made while the machine was loaded (verify took 3× its usual time) — to re-measure on a quiet run.

## Open (next passes)

- The TV's right column is empty while nothing is chosen, and the TV picker still sits still for
  seconds: F3 replaces it with the card grid and the mirror.

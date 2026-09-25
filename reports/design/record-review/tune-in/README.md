# Tune In — record-review passes

Harness port 42350 (worktree `C:/dev/partybox-game-tune-in`). Media (stills, strips, video) stay
local; the JSON reports and this log are committed. Recorder: `capture-loop.ts` (p01) and a Tune In
probe driving three real phones with CDP touch (p02 on): the psychic holds the target card, types an
illegal clue then a legal one and double-taps Send; guessers drag the thumb, nudge it with + and
double-tap Lock in; callers tap a side; Priya's phone (iPhone SE, 320 × 568) gets the abuse pass once.

## p01 — first look (capture-loop, 5 players, solo)

- The whole game ran (5 rounds in 128 s). Found: the dial far too small (labels under the arc ate
  its height); "Tuning in is thinking…"; the big 3-2-1 countdown ticking over the reveal and scores;
  clustered faces stacking up with their +N badges on top of each other; the verdict row pushing the
  dial smaller mid-reveal (a layout jump); the scoreboard stuck to the left half.
- Contaminated: edits hot-reloaded the pages mid-run, so no numbers are kept from it.

## p02 — real thumbs (6 players: Sam, Priya, Lu + 3 bots, solo)

- Fixed from p01: the ends sit at the dial's feet, one each side (the dial doubled in size); the
  round line moved into the bubble; everything that changes between phases is an overlay or a fixed
  slot, so the dial never changes size; faces fan out along the rim with leader lines to their true
  spots (rings only for a real crowd); +N badges are corner tags; intro / reveal / scores use the
  quiet bar timer.
- Found: the clue's `card` cue swallowed by the psychic's reading on the same frame; a jackpot
  nearly every round (the verdict took the best single dial); the phone result stuck to the top of a
  tall screen with nothing under it; TV long frames 1.55 % (worst 117 ms) — mostly 50 ms frames
  right after each phase change, where the recorder takes its stills.
- Touch: hold-to-see flips and flips back; the illegal clue shows its copy live; the drag moves the
  thumb, + nudges, Lock in locks (a double tap sends once); swipes, pinch, a long-press on text and a
  triple tap left no selection, zoom or shift.

## p03 — polish (same room, seed 9)

- Fixed from p02: the shutter, needle and hub are their own composited layers (the swing no longer
  repaints the dial); a slow glint sweeps the closed lid (the dial phase is never still); the stage
  plays `card` itself and the announcement follows 400 ms later; the solo verdict is the room's
  average (Bullseye! is earned); the verdict floats over the half of the dial the target is not in;
  the phone result is centred with a picture of the round (zones, my dial, or everyone's for the
  psychic) and the standing ("place 2 of 6"); a lock-in row of faces on the psychic's and the
  waiting screens.
- Found: readings after round 2 stayed silent — a one-minute repeat guard muted "Close!" two rounds
  running; fixed to once per mounted screen. The phone strip's zone digits were cramped (fixed).

## Clean timing (no video, no screenshots, 8 players, solo)

- 20 820 frames, 10 over 34 ms (0.05 %). One 133 ms frame at the game's first frame (the dev
  server compiling Tune In's code on first use); the rest are 50 ms frames as a scoreboard mounts.
  Recorder runs (p02, p03) showed ~1.5 % because the stills themselves stall the page.

## p03 — dead air

- TV: 163.6 s, **0 dead spans, 0 hard cuts** (dead-air.ts).

## Screenshot matrix (fixtures × iPhone 15, iPhone SE, 200 % text, sideways; TV in five themes)

- Found: ◀ / ▶ breaking away from their label, and a label broken inside a word at 200 % text; the
  SE dial screen needing a scroll for the lock-in row; an empty grey bar on the waiting phones; "2
  of 3 locked in" during the call. Fixed: arrows joined with a no-break space; ends wrap between
  words only and take a row each when they must; the reassurance line drops on short screens; the
  empty strip scans slowly; the call counts "called".

## p04–p05 — teams (6 players, real touch)

- Found: the TeamBanner took ~150 px and shrank the dial; the call prompt covered the dial and an
  end; the verdict and the call result sat on the right end; the needle's +N sat among the faces.
  Fixed: a slim one-row TV banner (the big one stays for scores and the finale); prompt and
  verdict float in the empty upper corner away from the needle / target; the needle's badge rides
  partway along it; more room between the dial and its ends.

## p06 — co-op + spicy (4 players, 4 rounds)

- Found: the group meter in the corner overlapped a long clue. Fixed: a slim meter row across
  the stage, like the teams banner. Results: "🧠 Mind meld!" on the finale; the headline says
  "It's a tie!" (the contract needs a winner — owner question in NOTES.md).

## p05 strips — the reveal cut

- Found: the strip's scores wrapped the chip row in clue / call and not in the reveal, so the
  whole stage jumped up at the cut; the teams needle snapped upright to "settle" again; the team
  banner showed the new totals before the dial opened. Fixed: no strip scores through the round;
  only a needle nobody has seen settles; the banner and the meter hold until the points beat.

## Reveal bursts (2026-09-24, Chromium screencast, every composited frame, times from the frame)

- The p07 strips (ffmpeg at 25 fps) interleaved stale frames, so the reveal was re-shot as a
  screencast burst (`tunein-burst.tmp.ts`, ~60 fps, teams, from the dial to the scores).
- Found: the strip's big countdown in `dial` / `call` wrapped the six chips onto two rows, and the
  quiet bar of `clue` / `reveal` put them back on one — the dial moved ~40 px and changed size on
  the cut into the reveal, the very frame the shutter opens. The strip's scores did the same at the
  reveal → scores crossfade. The teams scores beat was the same banner again, still for 6 s.
- Fixed: the TV's timer is always the quiet bar and the seconds sit on the stage (end of the bubble
  row, fading in); no strip scores at all; the teams scores beat is a race track (lane per team,
  cell per point, this turn's cells popping in one by one, total and +N after).
- Confirmed in the second burst: one strip row from dial to scores, the dial does not move at any
  cut; the shutter clears clockwise in ~350 ms; the verdict and +N pop on the points beat; the race
  fills Sun's cells then Moon's.

## Screenshot matrix, variant fixtures (scores-teams / -catchup / -final / -coop, reveal-teams, dial-coop, done-teams / -coop)

- Found on a 320 × 568 phone: the phone TeamBanner squeezed "Sun" / "Moon" to one letter per line,
  and the banner fell under the fold; "Bullseye! You were 3 away" on a teams guesser (the needle
  scored, not the dial); "+0 · Your team's needle scored +0". Sideways: the caller's RIGHT button
  below the fold, the dial's − / + and lock row below, the psychic's hold card below the huddle
  strip, the results and the co-op VIP's scores under the button, "12 Moon" clipped.
- Fixed: the phone banner puts its middle line under the sides; teams' scores swap the picture for
  the banner; the needle's result reads "Your team's needle scored +4 · You were 3 away" and a miss
  "0 · Your team's needle missed."; LEFT / RIGHT side by side; sideways layouts side by side (see
  NOTES). Re-shot: SE, 200 % text, sideways and Spanish all on one page.

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

## p08 — teams, real touch (6 players, seed 7), after the bursts

- TV dead-air: 141.6 s, **0 dead spans, 0 hard cuts**. Phones: one still span each, the last
  seconds on the platform's results screen. Long frames 2.2 % under the recorder (stills stall
  the page), worst 117 ms.
- Found: a thin dark sliver with the lid's grille dots along the left of the dial's baseline after
  every reveal — the lid swings to 182°, so its far edge tilts back above the clip line; the race
  track showed holes where this turn's cells had not popped yet; the lanes had no numbers until
  they landed; the results headline read "Lu, Sam & the bot tie!" when Sun won 11–8 (platform —
  owner question, hub #ideas 4550fc; the Foundation's results-kinds branch will add an outcome);
  the kept finale dropped the awards and left half the stage bare.
- Fixed: the lid fades out over the last few degrees; a new point is an empty cell whose colour
  pops in; the old total shows from the first frame and swaps as the last cell lands; the finale
  shows both rosters (the winners' card lit) and the awards; co-op's meter grows from its old
  total on the scores beat. Checked with the end probe (teams in English, co-op in Spanish).

## p09 — solo, real touch (6 players, seed 21)

- TV dead-air: 168.0 s, **0 dead spans, 0 hard cuts**; phones: only the results screen at the
  end. Long frames: both over 90 ms are the game's first frames (the dev server compiling).
- Found: a crowd of dials at one end ("Nightmare fuel", "Hard to spell") put faces and their +N
  tags over the end label — the outer rings stand further off the rim and, at the bottom of the
  arc, reach past the dial; within the crowd the tags (as big as a face) covered the neighbours'
  faces. Faces are a fixed 40 px while spacing was in dial units, so a smaller dial packed them
  tighter still.
- Fixed: the face layout follows the dial's drawn size (spacing along the rim, ring distance,
  each ring's clearance from the ends — `faceLayout`, tested); the points are a small pill on the
  face's chin, inside its footprint. A new `reveal-edge` fixture (target 5, seven dials 0–8)
  re-shot on a 1080p and a 720p TV: every face distinct, the labels clear.

## p10 — teams at 16 players (3 real phones + 13 bots, seed 33)

- TV dead-air: 153.7 s, **0 dead spans, 0 hard cuts**.
- Found: the strip wraps to three chip rows and the dial loses ~136 px of height (platform: a
  size-aware compact strip proposed on the hub, #plans 89234f); the results listed six
  "Sharpshooter" cards (a six-way tie, spec "ties share") and ran off the stage; the 16-player
  teams intro ran its rosters off the card.
- Fixed: an award shared by more than three is skipped (tested), and the finale shows a shared
  award as one card ("Lu & Bot 2"); the teams intro drops the demo dial (its fixed 340 px was the
  overflow) and the rosters sit full width under the steps, the side that plays first pulsing
  behind its names (so the card is never still). Re-shot at 16 players in English and Spanish.

## Edge scenarios (tunein-edge probe)

- VIP skip: intro, dial (→ reveal when no needle yet, as the spec's "no dials" row), call, both
  reveal beats and scores all advance cleanly on the TV and the VIP's phone.
- The psychic drops for 4 s: the clue waits; found the TV and the phones still said "P3 is
  thinking…". Fixed: both say "Waiting for P3 to reconnect…". Dropped for good: "No signal!" —
  found the bubble still showing thinking dots above it and the title breaking in two. Fixed:
  "No clue this round" in the bubble, the title on one line.
- A late joiner sees "Waiting for the next game"; the TV shows them as a dimmed spectator chip.
- 2 players (co-op) and 3 (solo) play through; found the intro's demo dial breaking "Cold" in two
  (its labels were TV-sized in a 560 px column) and "+0" on the co-op needle. Fixed: the ends'
  size follows the dial's (never below body size), the demo dial column is 720 px, a miss reads
  "0". The waiting phone's strip was a 140 px stub; it now spans the screen.

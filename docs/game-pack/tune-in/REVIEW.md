# Tune In — review package (2026-09-24, updated 2026-09-25)

Branch `game/tune-in` (not merged). Try it: `pnpm dev --port 42350` in
`C:/dev/partybox-game-tune-in`, pick Tune In. Media is local (gitignored) under
`reports/design/record-review/tune-in/`; the pass-by-pass log is its `README.md`.

## Five lines

1. Tune In plays end to end on TV and phones in all three modes — solo (3–16), co-op (2–8, the
   group needle against the dial) and teams (4–16, ▲ Sun against ● Moon, the other team calls
   LEFT / RIGHT, catch-up turns): 150 family + 50 spicy dials, twelve bank clues each, bots welcome.
2. The TV is one steady stage: the clue lands with its reading, the shutter swings open
   (composited, ~350 ms), faces land on the rim and never cover the end labels or each other at
   any dial size, the points pop on a second beat, and the scores beat is a race track (teams) or
   a growing group meter (co-op); nothing on the stage moves at a phase cut.
3. The phone: hold to see the target (3D flip), a live clue check before Send, a drag / nudge /
   Lock in dial (huddle markers live in co-op and teams), LEFT / RIGHT side by side, your own
   result only after the TV's points beat — every screen on one page on an iPhone SE, a big phone,
   sideways and in Spanish.
4. Proven by watching: twelve recorded games (solo, teams, co-op; 2, 3, 4, 6, 16 players; phones
   in Spanish), screencast bursts of every reveal frame, an edge probe (VIP skip in every phase,
   drops, a late joiner) — 0 dead spans and 0 hard cuts on the TV in every recorded game; with
   nothing recording, 0.02–0.05 % of TV frames run long and none over 100 ms.
5. Server: 105 game tests + 11 dial tests, the contract suite, 700 sim games (0 failed, idle rooms
   end after three void rounds), `pnpm verify` green; the 16-player state is ~10 KB and every
   view is under 4 KB.

## Since the package (2026-09-25)

- **main merged in** (Foundation + results-kinds, ADR-050 lazy entries): the SDK's match, speech
  and teams replace Tune In's stand-ins; results send an outcome (teams: the winning side or a
  draw; co-op: won at Crystal clear or better, the rating as the headline).
- **The owner's pacing rule [cc45f4]:** rules on every screen, each phone taps I'm ready (the faces
  still to tap breathe; bots are ready), then a 3 · 2 · 1 on the TV and every phone. No clock on
  the rules: the room waits for every connected player; a room where nobody taps starts after
  60 s, and a phone that never taps stops holding the room at 10 minutes. The scores beat says who
  moves it on ("★ Tess taps Next round when everyone's ready").
- **The reviewer's DESIGN CHANGES [ba045e]:** the rules' ready faces clear the host bar; Spanish
  rooms are told the dials are in English (TV + phone rules, the Spanish manifest); a pause during
  the 3 · 2 · 1 keeps the digits in step; ties share an award and the shell's results-ties draws
  one card naming everyone.

## Screens

| Sheet                       | What                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| `review/tv-phases.png`      | TV: intro, clue, dial, call, reveal (solo, teams, a crowd at one end), scores |
| `review/phone-se.png`       | iPhone SE: psychic, waiting, dial, huddle psychic, call, results, scores      |
| `review/phone-iphone.png`   | iPhone 15, the same screens                                                   |
| `review/phone-sideways.png` | sideways, the same screens                                                    |
| `review/phone-200.png`      | 200 % text, the same screens                                                  |
| `review/theme-*.png`        | Daylight, Arcade, Cabin, High Contrast — TV and phone                         |
| `matrix/tune-in/*/*.png`    | every fixture × SE / iPhone / sideways / 200 % / TV                           |

Clips (TV + two phones each, voice on): `p12/video/*/round.webm` (solo, 6 players, final build),
`p09/video/*/round.webm` (solo),
`p08/video/*/round.webm` (teams), `p11/video/*/round.webm` (co-op, phones in Spanish),
`p10/video/tv/round.webm` (teams at 16). Every reveal frame: the burst sheets in the scratch log
(`burst-teams2`), frame strips under each pass's `strips/`.

## Open questions (my recommendation first)

1. ~~The results headline~~ settled: results-kinds (ADR-052) landed and Tune In uses it.
2. **Strip scores never show** (the spec hides them only in `dial` and `reveal`): scores widen the
   chips and wrap the row, which moved the stage; the scores beat already has the board, the race
   or the meter. **Keep?** (Recommended.)
3. **Awards shared by more than three are skipped** (spec: "ties share"): at 16 players six
   Sharpshooters filled the results. **Keep?** (Recommended.)
4. **An idle room ends after three void rounds** (spec: "ends quickly"; it ran 6.6 minutes of
   "No signal!"). **Keep three?** (Recommended.)
5. **Spicy on = half the dials from the spicy pack**; the spec says "adds the spicy pack", which
   would give about one spicy dial a game. **Keep half?** (Recommended.)
6. **The clue rule bans a label word's inflections too** (hot → hotter, spell → spelling), whole
   words only. **Keep?** (Recommended.)
7. **200 % text on an iPhone:** the psychic's two screens scroll a little ("more below"), the card,
   the clue box and Send in view; shrinking further would drop below the touch targets.
   **Accept?** (Recommended.)
8. **Spanish:** the chrome is Spanish; the dials and the readings stay English until Spanish
   content and voices exist (Part 00 §5.3), and the rules say so. **OK for now?** (Recommended.)

Also noted, not mine: at 16 players the TV strip takes three chip rows (the Foundation will make
the shell go faces-only past two rows, #plans 3c6fba); the stage countdown ticks one pitch because
a game's `PlayCueOptions` has no `semitones` (the shell's own countdown rises); phone-only rooms
and remote players wait for F4 (presence) — the game reads it the moment it lands. When the
shell's own ready-up stage lands ([46be3c]), Tune In drops its intro ready-up for it.

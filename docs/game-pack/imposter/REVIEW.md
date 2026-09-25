# Imposter: review package

Branch `game/imposter` (worktree `C:/dev/partybox-game-imposter`). Nothing is merged to main.
Media lives under `reports/design/record-review/imposter/`. PNG and WebM files are gitignored, so
they exist only on this PC. The JSON reports (dead-air, frame timing, cues, timelines) are
committed.

## Five lines

1. Imposter plays end to end: 240 words, 13 phases, runoffs, two imposters, a typed or picked last
   chance, the VIP's "That counts", the reader, bots, awards and the recap.
2. The shared pieces are built in the SDK as separate subpaths: **SecretCard** (hold to peek, a 3D
   turn, a tap mode per device) and **FacePicker** (pick-N, press and hold to read, 200 % text).
3. Recorded real-clock games (TV and phone, video and sound):
   - 6 players, 10 players with two imposters and a typed guess, and a phone-only room;
   - after the fixes, **0 dead spans on the TV and on phone-only phones, and 0 hard cuts**.
4. Every phase checked at 320×568, 390×844, sideways, 200 % text, in Spanish, in all five themes,
   and on the TV at 8 and 16 players. A touch-abuse pass (hold, drag off, long-press, pinch,
   swipe past the ends, triple-tap) found nothing that moves, zooms or selects.
5. `pnpm verify` is green: 117 game tests, the contract suite, and 1,200 simulated games with 0
   failures.

## Where to look

| What                                  | Path under `reports/design/record-review/imposter/`                 |
| ------------------------------------- | ------------------------------------------------------------------- |
| Every phase, TV + phones (fixtures)   | `p0/imposter/<phase>/` (8 players), `p2o/imposter/` (16 players)    |
| Live 6-player round, video and stills | `p2/video/tv`, `p2/video/phone`, `p2/stills`, strips in `p2/strips` |
| 10 players, two imposters, typed      | `p3/` (TV dead-air: 0 spans)                                        |
| Phone-only room                       | `p6/` (phone dead-air: 0 spans)                                     |
| Spanish / 200 % / sideways            | `matrix/es-night/<phase>-<device>.png`                              |
| Five themes                           | `matrix/en-<theme>/`                                                |
| Touch abuse                           | `touch/`                                                            |

## What the passes fixed

- **Dead air on the TV:**
  - the intro steps now take the light in turn;
  - the card being read wears a speaking ring, and a wave runs across the table once every card
    is dealt;
  - the most-voted card lifts forward;
  - the spotlight breathes and the role card stamps down;
  - the word breathes and the imposters' cards float.
- **16 players on the TV:** the clues were cut in half. Cards now lie on their side with the name
  over the clue, the headline shrinks, and the voter faces are capped with a count.
- **The last card row** is centred.
- **Clue sizing:** a long clue ("cummerbund") broke mid-word, so the size estimate is tighter.
- **The SE and 200 % text:**
  - vote and talk tiles truncated names, fixed with rem container queries;
  - the intro no longer overflows;
  - the last chance is a 2×3 grid, as the spec asks.
- **Both caught imposters** now get their own line on the last-chance screen.
- **Small fixes:** a doubled "✓Got it ✓"; "+3 · …" repeated under the +3 hero; a lopsided runoff
  tile; the spotlight glow cut off at the stage edge.
- **Awards** shared by more than half the table are dropped. (5× "Bloodhound" said nothing.)

## Open questions for the owner

1. **Spicy categories in the settings list.** The platform can't hide multiselect options behind
   a boolean.
   - Now: the 🌶 categories are listed and ignored while Spicy is off.
   - OK, or add a small `shownWhen` to the settings schema? (NOTES.md #2)
2. **Maximum settings run about 100 minutes** (8 rounds × 3 clue rounds × 90 s, plus 180 s of
   talk).
   - Now: I kept the maximums, and the picker's estimate follows the settings.
   - Lower them? (NOTES.md #4)
3. **Voice instead of chime.** Where a phase opens with a line ("Time to vote.", "Last chance."),
   the shell drops its chime so the voice lands alone on the phase's first frame. Keep, or play
   the chime first?
4. **Awards shared by most of the table are skipped.** The spec says "ties share it". OK?
5. **Stand-ins still in use:** the matcher (F5), `toSpeakable` (F6) and fixed clips rendered live.
   The Foundation's signatures already match mine, so each swap is an import change once they
   reach main.

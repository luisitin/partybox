# Spy Grid — review package

Branch `game/spy-grid` (from `main` @ 4bfd10eb). Build notes, conflicts and stand-ins:
[NOTES.md](NOTES.md). Media (local, gitignored) under `reports/design/record-review/spy-grid/`.

## In five lines

1. Codenames-style teams for 4–16 (co-op mission at 2–3): 25-word grid, one-word clue + number,
   the team points together and a card flips when most of its guessers agree.
2. Content: 604 family words in 209 themes + 122 adult ("spicy") words in 54 themes; every theme
   clue checked legal against its own words, so bot spymasters always have a clue.
3. TV: team banners, clue bar with its own guess clock, 5×5 board with 3D card turns, history
   column, win ripple; the reader says each clue and each flip ("Agent!") as the face shows.
4. Phones: guessers tap → confirm → point (face on the card), End turn after the first flip,
   long-press reactions; spymasters get a covered key (auto-hides) and a live clue check.
5. Proof: 65 game tests + 6 WordGrid tests, contract suite, 600 simulated games, 12 recorded passes
   (6 / 16 players, co-op, reconnect, touch abuse), 5 themes, SE / 390 / sideways / 200 % / Spanish.

## What to try

- 4+ players (bots fill seats): defaults, then `Teams: Random`, `Rounds: 2`, `Assassins: Two`,
  `Spicy words: on`. 2–3 players: co-op.
- A phone held sideways during guessing (two columns, whole board), 🎨 → Board layout (grid/list).
- Phone-only room: the flip, the turn's end and the result play on the phones with the reader.

## Evidence (latest passes)

| Pass          | What                                                                      | Numbers                                                                                                                               |
| ------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| p08           | 6 players, audio trace                                                    | reader clips on their frames (flip line 330 ms in, turn-end 300 ms after the sweep)                                                   |
| p09-coop      | 3 players co-op                                                           | TV 0 dead spans, 0 hard cuts                                                                                                          |
| p10-16p       | 16 players                                                                | TV 0 hard cuts; one 2.3 s still in a quiet guess step (input phase, clock visible, under the 3 s gate) → the active team now breathes |
| p11-reconnect | a guesser drops 8 s mid-guess                                             | face dims on the TV banner, board caught up on return                                                                                 |
| touch01       | drags, long-press, mashing Point, pinch, double-tap, overscroll, rotation | no zoom, no selection, one input per confirm, layout unchanged                                                                        |
| pv04–pv07     | fixtures × 5 themes × iPhone / SE / sideways / 200 % / ES                 | all fit after the fixes listed in NOTES                                                                                               |

Frame timing on this machine is the recorder's noise band (a shipped game reads 5.7 %; Spy Grid 5.5 %).

## Open questions

1. **A failed co-op mission** ties everyone on the results screen (the platform requires a winner);
   the TV and phones say "Mission failed". Allow empty `winnerIds` for co-op games?
2. **Guess clock** drawn by the game (quiet shell timer) so the board never jumps — keep?
3. **Remote phones** (can't see the TV) wait for the Foundation's F4 presence work.
4. **Speech lab pass** (F6) not done yet: no pronunciation fixes listed.

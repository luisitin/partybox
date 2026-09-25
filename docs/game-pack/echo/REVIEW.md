# Echo 🔁 — review package, round 1

Branch `game/echo` (main merged in). Media is local (gitignored) under
`reports/design/record-review/echo/`; each folder below has its stills, strips, videos and the
`dead-air-*.json` numbers.

## In five lines

1. Echo plays end to end with people and bots at 3–10 players. The deck has 300 family words plus
   80 spicy ones (10 bank clues each), checked by a pack test.
2. The TV never shows the word before `result`. Clues flip over one by one while the reader
   (George) says them. Echoes turn blank with "Echo!", and the result lands the word with its
   reading, then ✓ / ✗ / PASS with its cue, then every author, then a card flying to its pile.
3. Phones: a hold-to-see word card, clue legality checked as you type, 🤔 Don't know, Lock it in /
   Change, the echo check (Not the same ✋ / Same word ✋), and a guess box with Pass. The VIP gets
   ✓ That counts and Next word.
4. Gates on the latest recordings (`p15-6p`, `p16-idle`): the TV has 0 hard cuts and no dead span during play. Phones
   stay under 3 s everywhere except the shell's results screen. The touch pass found no selection,
   zoom, page scroll or double send. Everything was checked at 320×568, 390×844, sideways,
   200 % text, in Spanish, in all five themes and at TV 1080p.
5. The foundation's matcher, speech helpers and SecretCard aren't on main yet. Echo uses local
   stand-ins written to their published signatures, and swaps them in one line when they land.

## Where to look

| What                                     | Folder                                                     |
| ---------------------------------------- | ---------------------------------------------------------- |
| A whole 6-player game (TV + phone video) | `p15-6p/` (video/tv, video/phone, stills, strips) — latest |
| 3 players (two clues each)               | `p04-3p/`                                                  |
| 10 players (two-row table)               | `p10-10p/`                                                 |
| A phone drops for 8 s mid-guess          | `p06-reconnect/`                                           |
| VIP pause mid-guess                      | `p07-pause/`                                               |
| Everyone idle                            | `p16-idle/` — latest                                       |
| Spicy words, echo check off              | `p09-spicy-nocheck/`                                       |
| Every screen at 5 themes × 4 phones      | `layout1/` (sheets: `tv-themes.png`, `sheet-<phase>.png`)  |
| After the layout fixes (SE, 200 %, TV)   | `layout2/` (`tv.png`, `phones.png`)                        |
| Spanish                                  | `es/` (`tv.png`, `phones.png`)                             |
| Touch abuse (iPhone SE)                  | `touch/report.txt`                                         |
| Guess / result frame by frame            | `p02/sheet-guess.png`, `p03/sheet-result.png`              |

## Calls I made (details in NOTES.md)

- A guess sent before the TV has shown every clue is **held** until the reveal ends. The TV says
  "🔒 Ana has an answer…", so a quick guesser never cuts the reveal short.
- The clue cards turn over **in step with the reading** (its length shared across the cards).
- There's **no `PhoneStage`**: its component gets no `send` or `skip`. In a phone-only room the
  Controller shows the result stage itself and keeps the VIP's ✓ That counts / Next word.
- The bot guesser **passes** when no surviving clue is in any word's bank. It never makes a wild
  guess that would burn a word.
- The check is skipped when there are fewer than 2 clues. An empty word's result is 4.5 s instead
  of 6.5 s.

## Open questions

1. **Co-op results headline.** The contract suite needs a winner, so everyone shares rank 1 and
   the shell's results screen says "It's a tie!", even on 🔁 Try again! The finale board below it
   carries the real verdict (rating, 7 of 10, won and lost cards). **Recommend** a small shell flag
   (`coop: true` in the client module) so a co-op game's Finale owns the headline. It would be done
   once and cover Tune In's co-op mode too. Until then, keep the "tie" line?
2. **Spicy words** (80, adult but never explicit: hangover, walk of shame, sugar daddy, beer
   pong…). Is that the right edge for this pack?
3. **Reader.** George reads the surviving clues and "The word was …". The fixed lines ("Echo!",
   "Got it!", ratings) are live readings until F6's clip pipeline reaches main. Keep George as the
   default?

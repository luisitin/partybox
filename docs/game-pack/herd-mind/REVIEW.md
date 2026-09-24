# Herd Mind — review package (2026-09-24)

Branch `game/herd-mind` (worktree `C:/dev/partybox-game-herd-mind`). Not merged; waiting for the owner.

## Five lines

1. The whole game plays: 200 family + 80 spicy questions, tiles and typed modes, the Black Sheep, the special ranking, four awards, the recap, and the reader (question, "The herd has spoken.", the herd's answer, "Black sheep!", "We have a winner.").
2. TV: the rules are dealt in; tiles flip in 3D; the herd reveal lands each card in seat order into pens sized by head count, counts climb, and then the verdict hits with its cheer or bust and voice; the score race flies the coin between faces.
3. Phone: tiles you can change until the phase ends (one tap, ✓, buzz), a typed box that refuses empty text, "Watch the TV", then your own line; the VIP merges typed answers; phone-only rooms get the stage itself, voice included.
4. Proven by recording, not by tests alone: 0 dead spans and 0 hard cuts on the TV at 6 and 16 players and in typed mode; voice lines land on their beats (question +0.46 s, verdict just after "The herd has spoken."); the touch-abuse pass shows no zoom, selection, shift or double send.
5. Gates: `pnpm verify` green; 95 unit tests + the contract suite; 200 random + 200 idle simulated games with 0 failures; state 16 players < 40 KB; views < 4 KB.

## Look at these first

Media is under `reports/design/record-review/herd-mind/` (gitignored images and video; the JSON is committed).

| What                                         | Where                                                             |
| -------------------------------------------- | ----------------------------------------------------------------- |
| A full 6-player game (TV + phone video)      | `p03/video/tv/round.webm`, `p03/video/phone/round.webm`           |
| 16 players                                   | `p05-16p/video/tv/round.webm`, `p04-16p/herd-mind/*/tv-stage.png` |
| Typed mode + VIP merge tool                  | `p06-typed/stills/03-herd-*.png`                                  |
| The herd reveal, frame by frame              | `p02/strips/03-herd-sheet.png`                                    |
| The sheep flight + a win                     | `p02/strips/16-score-transition-sheet.png`                        |
| Five themes on the TV                        | `p07-matrix/sheet-tv.png`                                         |
| iPhone SE, big phone, sideways, 200 %, EN/ES | `p07-matrix/sheet-*.png`                                          |
| Touch abuse                                  | `p08-touch/sheet.png`, `p08-touch/touch.json`                     |
| Phone-only room                              | `p10-phoneonly/sheet.png`                                         |
| Voice timing                                 | `p03/voice.json`, `p03/voice-sky3.json`                           |

## Decisions (owner, 2026-09-24: "go with whatever you think is appropriate" — all four recommendations stand)

1. **Race track during `answer`.** The spec puts it along the bottom of the answer screen; the chip strip there already shows every score and ✓, and at 16 players the room is tight. I show the full race at `score` (lanes, +1, the sheep's flight). **Recommend: keep it at `score` only.**
2. **Spicy pack tone.** It's R-rated party humour: dating, drinking, bathroom, suggestive bedroom questions, mild profanity in some answers. No slurs, no real people, nothing graphic. **Recommend: keep, and you skim `content/spicy.json` once.**
3. **A room that never scores.** The contract needs a winner, so all players share a 0-point draw; the TV says "Nobody scored. It ends in a draw." with no fanfare. **Recommend: keep.**
4. **Mind Meld** needs a pair to have matched at least twice (once is chance). **Recommend: keep.**
5. **Frame timing** can't be judged fairly right now: the PC runs at ~96 % CPU with other sessions' recordings (Lightning Round, already shipped, measures 6.8 % long frames under the same load; Herd Mind 3.8 %). **I'll re-measure on a quiet machine before ship.**

## Waiting on the foundation (stand-ins noted in NOTES.md)

The F5 matcher and F6 `toSpeakable`/clips (local stand-ins in use), the F2a manifest fields (icon 🐑, howToPlay, presence, addedOn), and the F1 phone/TV entry split. Each is a small swap once it lands on main.

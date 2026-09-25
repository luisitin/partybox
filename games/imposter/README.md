# Imposter 🕵️

## Overview

"One of you doesn't know the word." Everyone gets the secret word except the imposter, who only
knows the category (or nothing, in hard mode). Everyone types one word about it; the TV deals the
clue cards face up one at a time and the reader reads each. The room talks (when it can), then
votes. A caught imposter can still steal the round by naming the word. Full design:
`docs/game-pack/imposter/SPEC.md` (Part 01 §1); build notes in `docs/game-pack/imposter/NOTES.md`.

## Players

4–16 (`supportsBots: true`). Two imposters from 10 players (setting `imposters`, needs 7+). Crew
bots clue from the word's bank, imposter bots from the category's bank and the board; every bot
decides from its own phone view. Late joiners are spectators (stage only, no role).

## Phases

| Phase        | What happens                                                   | Ends when                                   |
| ------------ | -------------------------------------------------------------- | ------------------------------------------- |
| `intro`      | Title and the three steps (first round only)                   | 8 s, or VIP                                 |
| `deal`       | Word, category and imposters drawn; phones hold the SecretCard | all connected ready, 12 s (quiet), or VIP   |
| `clue`       | Everyone types one word (resend replaces)                      | all connected submitted, `clueSeconds`, VIP |
| `clueReveal` | Cards dealt one at a time (seeded order), each read aloud      | last card + 2 s (hidden); VIP = next card   |
| `talk`       | Talk it over (only when the room can talk)                     | `talkSeconds`, or VIP                       |
| `vote`       | Tap the face(s) you suspect, never your own                    | all connected voted, `voteSeconds`, or VIP  |
| `voteReveal` | Voters' faces land on their targets; accusation decided        | 4 s                                         |
| `runoff`     | Tie only: vote again among the tied players                    | all voted, 20 s, or VIP                     |
| `accuse`     | Spotlight 1.5 s, then the role card flips (per accused)        | 5 s per accused; VIP = next beat            |
| `lastChance` | A caught imposter picks the word from six (or types it)        | guess in, 20 s, or VIP                      |
| `wordReveal` | "The word was …", then the guess line and own results          | ≈ 7 s (10 s while a typed guess can count)  |
| `scores`     | Points land, board climbs                                      | 8 s, or VIP                                 |
| `done`       | Results                                                        | —                                           |

`clue → clueReveal` repeats per clue round (`clueRounds`: auto = 1 with talk, 2 without). Every
imposter leaving the game before the vote voids the round (straight to `wordReveal`, no points).

## Inputs

`ready` · `clue {text ≤ 40}` · `vote {targets: 1–2 ids}` · `guess {option?, text?}` ·
`countGuess` (VIP only). Ignored silently: wrong phase, unknown ids, spectators, a vote naming
self / a repeat / an unknown id / the wrong count / someone outside the runoff, a guess from
anyone but a caught imposter or a second guess, `countGuess` without the VIP stamp, outside
`wordReveal` or in choices mode. Turned down with a reason (the phone shows it and buzzes): one
word, ≤ 20 characters; a crew clue that fails `isLegalClue` against the word (the imposter's clue
is never checked against it); from clue round two, a clue already on the board (everyone).

## Scoring

| Who      | Event                                                  | Points                   |
| -------- | ------------------------------------------------------ | ------------------------ |
| Crew     | each of your main-vote picks that lands on an imposter | +1                       |
| Crew     | each imposter the room catches                         | +2 for every crew member |
| Imposter | not caught                                             | +4                       |
| Imposter | caught, then names the word                            | +3                       |
| Imposter | caught, wrong guess or none                            | 0                        |

One imposter: the single most-voted is accused; a tie gets one runoff among the tied; still tied,
or no votes, and nobody is accused. Two imposters: each voter picks two; the two most-voted are
accused; a tie across the boundary gets one runoff for the remaining slot(s); still tied, the slot
stays empty. The +1 read point always uses the main vote. Choices mode: the exact option; typed
mode: `matchAnswer` fuzzy or better, and the VIP may count a rejected guess (the round
re-scores). Scores never go down; ties share a rank. Awards: Master of Disguise (escapes),
Bloodhound (reads), Word Thief (steals), Suspiciously Innocent (votes received while crew).

## Edge cases

A player who drops during `clue` shows "—" and can still be voted for. An imposter who drops can
still be accused; their last chance times out as a wrong guess. A crew player who leaves is out
of future imposter draws but stays in results. One connected player: deadlines carry every phase.
Everyone idle: the imposters escape and the game ends. Two identical crew clues in clue round one
are both shown. The imposter may type the word itself. Pause mid-reveal freezes the card; resume
continues from it. The imposter bag refills (seeded) once everyone has had a turn.

## Settings

| Key           | Default  | Options                                   |
| ------------- | -------- | ----------------------------------------- |
| `rounds`      | 3        | 1–8                                       |
| `imposters`   | auto     | auto (2 at 10+), 1, 2 (needs 7+)          |
| `clueRounds`  | auto     | auto, 1, 2, 3                             |
| `clueSeconds` | 40       | 20–90                                     |
| `talk`        | on       | forced off when presence is `remote-text` |
| `talkSeconds` | 60       | 30–180                                    |
| `voteSeconds` | 30       | 15–60                                     |
| `hint`        | category | category, none (hard mode)                |
| `lastChance`  | choices  | choices, typed, off                       |
| `categories`  | all      | the 14 family + 6 🌶 spicy categories      |
| `spicy`       | off      | adds the spicy categories                 |
| `reader`      | george   | every voice, or none                      |

## Content

`content/family.json` (14 categories × 12 words) and `content/spicy.json` (6 × 12, adult but not
explicit), host-only. Every word: 6+ accept forms, rejects, family roots, 8–10 legal crew clues;
every category: 12+ imposter clues legal for all its words. `content/pronunciations.json` holds the
reader's respellings. Rules checked by `__tests__/packRules.ts`.

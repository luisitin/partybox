# Echo 🔁

The game pack's co-op word game (full spec: `docs/game-pack/echo/SPEC.md`). One player guesses a
secret word; everyone else writes a one-word clue without seeing the others'. Clues that match
each other vanish before the guesser sees them. The whole group wins or loses together.

## Overview

"One clue each. Same clue? Both vanish." A deck of 10 words (6–13). Each word: clue-givers write
clues, check the automatic echoes, the guesser guesses from what survived, the TV reveals. Right =
won pile; pass = lost pile; wrong = lost pile **and the next word burns too**. Score = words won,
with a rating at the end.

## Players

3–10, bots welcome (`supportsBots`). Bots write clues from each word's bank (weighted to the
obvious end, so they echo each other sometimes), tap Looks good, and guess by ranking the pack by
bank hits: with k matching survivors they guess the best word with p = 0.3 + 0.15k (≤ 0.85), else
pass or try the runner-up. With no hits at all they pass. Bots never tap Don't know it. With 3
players each clue-giver writes **two** different clues. Guessers rotate in seat order from a
seeded start, skipping players who left. Late joiners are spectators with the TV's view.

## Phases

| Phase    | Ends when                                                                       | Notes                                                          |
| -------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `intro`  | 8 s or VIP                                                                      | once; title, three steps, deck size                            |
| `clue`   | every connected clue-giver has a clue, `clueSeconds`, or VIP                    | Don't know it may swap the word (below)                        |
| `check`  | every connected clue-giver taps Looks good, 12 s, or VIP (= Looks good for all) | quiet clock; skipped when `check` is off or fewer than 2 clues |
| `guess`  | a guess or pass, `guessSeconds` (= pass), or VIP (= pass)                       | survivors on TV and every phone                                |
| `result` | 6.5 s (+1.8 s when a word burns), or VIP                                        | word, guess ✓/✗/PASS, echoes with authors, piles move          |
| `done`   | —                                                                               | finale board: won face-up, lost face-down, score, rating       |

After `result`: the next word's `clue`, or `done` when the deck is empty. Pause stops every clock.

## Inputs

`clue {texts[1–2]}`, `dontKnow`, `split {group}`, `join {a,b}`, `ok`, `guess {text}`, `pass`,
`countGuess` (VIP-stamped only, in `result`, only on a guess judged wrong). Ignored: wrong phase,
spectators, the guesser's anything but guess/pass, two texts outside 3-player games. A clue that
fails the rules (the word, its plurals/misspellings, containing it or a family root, not one word,
over 20 characters, or — with 3 players — a twin pair or a single text) is refused and its reason
shown to its author only. A resent clue replaces the earlier one.

## Scoring

Right = the matcher says fuzzy or better. Pass or timeout = lost. Wrong = the word and the next
one are lost; on the last word, the most recently won word moves to lost instead (if any). The
VIP's ✓ That counts turns a wrong guess right and the deck is recomputed. Score = words won; every
player scores the team total and everyone shares rank 1 (the contract needs a winner — the finale
carries the verdict). Rating: all = 🏆 Flawless, ≥ 85 % 🌟 Brilliant, ≥ 70 % 🎉 Great, ≥ 55 % 👍
Solid, ≥ 30 % 🔥 Warming up, else 🔁 Try again! Awards (ties share, skipped if unearned): 🗝️ Key
Clue (most surviving clues on words won, ≥ 1), 🔁 Echo Chamber (most vanished clues, ≥ 2), 🎯
Sharp Guesser (most right, ≥ 1), 🙈 Bold Guess (most wrong, ≥ 2).

## Edge cases

- Echoes: clues grouped with `sameAnswer` (union-find in seat order); groups of 2+ vanish. In
  `check` any clue-giver can split an echo or join two survivors; any tap applies at once and a
  second tap undoes it.
- Don't know it: half the connected clue-givers (rounded up) within the first 15 s swap the word
  for a spare, reset the clues and restart the clock; at most 2 swaps per word; 6 spares a game;
  the button hides when none are left. The guesser never sees the taps.
- The guesser drops: the turn runs and times out as a pass. A player who left is skipped.
- No clues: "No clues!", the guesser may still try. All echoed: "Total echo!".
- One clue-giver connected: their clue can't echo; play on. Everyone idle: every word passes.
- Survivors are shown in text order so seat order never hints at authors.

## Settings

| Key            | Type        | Default  | Range                     |
| -------------- | ----------- | -------- | ------------------------- |
| `words`        | number      | 10       | 6–13                      |
| `clueSeconds`  | number      | 35       | 20–60, step 5             |
| `guessSeconds` | number      | 25       | 15–45, step 5             |
| `check`        | boolean     | true     | clue-givers review echoes |
| `categories`   | multiselect | all      | the ten categories        |
| `spicy`        | boolean     | false    | adds the 80 spicy words   |
| `reader`       | select      | `george` | every voice, or none      |

## Content

`content/family.json` (300 words, 30 in each of animals, food, objects, places, jobs, nature,
activities, fantasy, sports, around the house), `content/spicy.json` (80 grown-up words, never
explicit), `content/pronunciations.json`. Every word: answer, 3–6+ accepted forms, rejects,
family roots and 10 bank clues ordered obvious → obscure, each legal for its word (pack test).
Host-only: `init` draws the deck and 6 spares; nothing else of the pack reaches state or a view.
